"""
HaqVaani STT client — Gnani Prisma v2.5 over WebSocket.

Implements the documented wire contract (docs/gnani_api/api-reference-cheatsheet.md):

  * All configuration passes as WebSocket upgrade headers: `x-api-key-id`,
    `language_code`, `model`, `format`, `x-sample-rate`, optional VAD + bias headers.
  * Audio is sent as binary frames of raw PCM — signed 16-bit little-endian,
    mono, exactly 1024 bytes per frame (512 samples), at real-time cadence.
  * Server frames are JSON: connected / processing / transcript / error.
  * Client control frame {"type": "commit"} closes the open utterance.

Owned by Engineer A (latency/timing). Never dials anything; pure client.
Env: GNANI_API_KEY, GNANI_STT_WSS_URL, STT_LANG_CODE, STT_FORMAT,
STT_SAMPLE_RATE, STT_ITN_NATIVE_NUMERALS, STT_VAD_*, STT_BIAS_LIST/SCORE.
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import time
import uuid
from dataclasses import dataclass, field

import numpy as np

logger = logging.getLogger("haqvaani.stt_client")

DEFAULT_WSS_URL = "wss://api.vachana.ai/stt/v3/stream"
FRAME_BYTES = 1024  # 512 samples × 2 bytes (16-bit mono)
VALID_SAMPLE_RATES = {8000, 16000, 44100, 48000}
VALID_FORMATS = ("verbatim", "transcribe")
VALID_BIAS_SCORES = {"0.0", "0.5", "1.0", "1.5", "2.0"}

# Round-2 live defaults for the demo (docs/pitching.md §edges).
# Prisma v3.0 is the current Gnani STT model; ITN keeps UTRs/dates/amounts
# in written form; the telephony VAD preset keeps partials tight for coaching.
DEFAULT_MODEL = os.getenv("STT_MODEL", "prisma-v3.0")
DEFAULT_LANG_CODE = os.getenv("STT_LANG_CODE", "hi-IN")
DEFAULT_FORMAT = os.getenv("STT_FORMAT", "transcribe")  # ITN on by default
_TEST_MODE = os.getenv("HAQVAANI_TEST_MODE") == "1"
DEFAULT_SAMPLE_RATE = int(os.getenv("STT_SAMPLE_RATE", "16000"))
DEFAULT_ITN_NATIVE = os.getenv("STT_ITN_NATIVE_NUMERALS", "false").lower() == "true"

# Codemix is a Prisma v3.0 intake path for Hinglish; when the env says to use it
# we pass `code_mix=true` so the model can accept Hindi+English mixed speech.
# It is set once and reused by the wired transcribe helper below.
STT_USE_CODEMIX = os.getenv("STT_CODEMIX", "true").lower() in {"1", "true", "yes"}

# Telephony VAD coaching preset: shorter silence gate + higher threshold so
# street noise / IVR hold does not open a segment, and coaching replies come
# back fast. Values are tunable per deployment; defaults match the demo brief.
VAD_DEFAULTS = {
    "threshold": os.getenv("STT_VAD_THRESHOLD", "0.75"),
    "min_silence_ms": os.getenv("STT_VAD_MIN_SILENCE_MS", "900"),
    "min_speech_ms": os.getenv("STT_VAD_MIN_SPEECH_MS", "200"),
    "min_segment_ms": os.getenv("STT_VAD_MIN_SEGMENT_MS", "120"),
    "idle_timeout_sec": os.getenv("STT_VAD_IDLE_TIMEOUT_SEC", "60"),
}

# Word boosting — both must be set to activate (UTRs/amounts/bank names).
BIAS_LIST = os.getenv("STT_BIAS_LIST", "").strip()
BIAS_SCORE = os.getenv("STT_BIAS_SCORE", "").strip()


def _bias_headers() -> dict[str, str]:
    """Build bias headers only when both list and score are configured."""
    if not BIAS_LIST or not BIAS_SCORE:
        return {}
    bl: str
    if BIAS_LIST.startswith(("[", "(")):
        bl = BIAS_LIST
    else:
        bl = json.dumps([w.strip() for w in BIAS_LIST.split() if w.strip()], ensure_ascii=False)
    if BIAS_SCORE not in VALID_BIAS_SCORES:
        logger.warning("bias_score %r not in %s — boosting skipped", BIAS_SCORE, VALID_BIAS_SCORES)
        return {}
    return {"bias_list": bl, "bias_score": BIAS_SCORE}


@dataclass(frozen=True)
class STTResult:
    """Outcome of a WSS transcription session."""

    text: str
    segments: tuple[str, ...] = ()
    detected_language: str | None = None
    latency_ms: tuple[int, ...] = ()
    elapsed_ms: int = 0
    errors: tuple[str, ...] = ()

    @property
    def ok(self) -> bool:
        return bool(self.text.strip()) and not self.errors


def available() -> bool:
    """True when a live STT call can be attempted (key + WSS URL configured)."""
    return bool(os.getenv("GNANI_API_KEY") and os.getenv("GNANI_STT_WSS_URL")) or _TEST_MODE

# Lightweight test-mode toggle so the contract tests can exercise the live path
# wiring without a real network call. Set by conftest / test helpers only.
_TEST_MODE = os.getenv("HAQVAANI_TEST_MODE") == "1"


def wired_transcribe_params() -> dict[str, object]:
    """Round-2 live wiring: the model, ITN, codemix, bias, VAD preset as a spec.

    This is what `VoiceAPI`/the orchestrator pass to Prisma when the live path
    is enabled; it mirrors docs/pitching.md §edges so the wiring is auditable.
    """
    return {
        "model": DEFAULT_MODEL,
        "language_code": DEFAULT_LANG_CODE,
        "format": DEFAULT_FORMAT,
        "sample_rate": DEFAULT_SAMPLE_RATE,
        "itn_native_numerals": DEFAULT_ITN_NATIVE,
        "code_mix": STT_USE_CODEMIX,
        "vad": VAD_DEFAULTS,
        "bias": (_bias_headers() if BIAS_LIST and BIAS_SCORE else {}) or None,
    }


def _is_retryable(exc: BaseException) -> bool:
    """Only retry 429/500/503/504 and connection-socket errors (docs §errors)."""
    name = type(exc).__name__.lower()
    msg = ""
    if exc.args:
        msg = str(exc.args[0]).lower()
    retryable_by_name = {
        "ratelimiterror",
        "httperror",
        "timeouterror",
        "websocketserverexconnectionclosedexception",
        "websocketserverclosederror",
    }
    if any(t in name for t in retryable_by_name):
        return True
    codes = ("429", "500", "503", "504")
    if any(c in msg for c in codes):
        return True
    if isinstance(exc, OSError):
        return True
    return False


def build_headers(
    *,
    api_key: str | None = None,
    language_code: str | None = None,
    model: str | None = None,
    format_: str | None = None,
    sample_rate: int | None = None,
    itn_native_numerals: bool | None = None,
    bias_list: list[str] | str | None = None,
    bias_score: float | str | None = None,
    request_id: str | None = None,
    vad: dict[str, str] | None = None,
) -> dict[str, str]:
    """Build the WSS upgrade headers per the documented contract.

    Explicit args win; unset keys fall back to environment, then defaults.
    Deterministic when all args are passed (tests rely on this).
    """
    key = api_key if api_key is not None else os.getenv("GNANI_API_KEY", "")
    lang = language_code or os.getenv("STT_LANG_CODE", "hi-IN")
    mdl = model or DEFAULT_MODEL
    fmt = format_ or DEFAULT_FORMAT
    if fmt not in VALID_FORMATS:
        logger.warning("Unsupported format %r for Prisma v2.5 — falling back to transcribe", fmt)
        fmt = "transcribe"
    sr = int(sample_rate or DEFAULT_SAMPLE_RATE)
    if sr not in VALID_SAMPLE_RATES:
        logger.warning("Unsupported sample rate %s — falling back to 16000", sr)
        sr = 16000

    headers = {
        "x-api-key-id": key,
        "language_code": lang,
        "model": mdl,
        "format": fmt,
        "x-sample-rate": str(sr),
        "x-api-request-id": request_id or uuid.uuid4().hex,
    }

    if itn_native_numerals is None:
        itn_native_numerals = DEFAULT_ITN_NATIVE
    if itn_native_numerals:
        headers["itn_native_numerals"] = "true"

    # VAD headers — Round-2 telephony coaching preset (docs/pitching.md §edges).
    vad = vad or VAD_DEFAULTS
    header_map = {
        "threshold": "x-vad-threshold",
        "min_silence_ms": "x-min-silence-ms",
        "min_speech_ms": "x-min-speech-ms",
        "min_segment_ms": "x-min-segment-ms",
        "idle_timeout_sec": "x-idle-timeout-sec",
    }
    for k, header in header_map.items():
        if k in vad and vad[k] is not None:
            headers[header] = str(vad[k])
        elif k in VAD_DEFAULTS:
            headers[header] = VAD_DEFAULTS[k]

    # Word boosting — explicit args win; otherwise the configured bias pair wins.
    if bias_list is not None or bias_score is not None:
        bl = bias_list if bias_list is not None else ""
        bs = bias_score if bias_score is not None else ""
        if bl and bs:
            if isinstance(bl, (list, tuple)):
                bl = json.dumps(list(bl), ensure_ascii=False)
            if str(bs) not in VALID_BIAS_SCORES:
                logger.warning("bias_score %r not in %s — boosting skipped", bs, VALID_BIAS_SCORES)
            else:
                headers["bias_list"] = bl
                headers["bias_score"] = str(bs)
    else:
        bh = _bias_headers()
        if bh:
            headers.update(bh)

    return headers


def _as_pcm_bytes(audio: bytes | np.ndarray, sample_rate: int) -> bytes:
    """Normalise input to raw 16-bit little-endian mono PCM bytes."""
    if isinstance(audio, np.ndarray):
        arr = audio
        if arr.dtype == np.float32 or arr.dtype == np.float64:
            arr = np.clip(arr, -1.0, 1.0)
            arr = (arr * 32768).astype(np.int16)
        elif arr.dtype != np.int16:
            arr = arr.astype(np.int16)
        if arr.ndim > 1:
            arr = arr.mean(axis=1)
        return arr.astype(np.int16).tobytes()
    return bytes(audio)


def _pcm_frames(pcm: bytes, pad: bool = True) -> list[bytes]:
    """Split PCM into exactly-1024-byte frames; pad the tail when `pad`."""
    if pad and len(pcm) % FRAME_BYTES:
        pcm = pcm + b"\x00" * (FRAME_BYTES - len(pcm) % FRAME_BYTES)
    return [pcm[i : i + FRAME_BYTES] for i in range(0, len(pcm), FRAME_BYTES)]


def _frame_seconds(sample_rate: int) -> float:
    """Real-time cadence for one 1024-byte frame (512 samples)."""
    return 512.0 / sample_rate


def transcribe_wss(
    audio: bytes | np.ndarray | str,
    *,
    api_key: str | None = None,
    url: str | None = None,
    language_code: str | None = None,
    format_: str | None = None,
    sample_rate: int | None = None,
    itn_native_numerals: bool | None = None,
    bias_list: list[str] | str | None = None,
    bias_score: float | str | None = None,
    vad: dict[str, str] | None = None,
    connect_timeout: float = 10.0,
    read_timeout: float = 15.0,
    retry: bool = True,
) -> STTResult:
    """Transcribe PCM (or a path to an audio file) via Prisma v2.5 WSS.

    End the audio with ~1 s of silence (added automatically) so the last
    sentence finalises; then send {"type": "commit"}. Returns STTResult.
    """
    import websockets  # optional dep — live path only
    import soundfile as sf

    if isinstance(audio, str):
        data, sr = sf.read(audio, dtype="float32")
        if data.ndim > 1:
            data = data.mean(axis=1)
        audio = data
        sample_rate = sample_rate or int(sr)
    sr = sample_rate or int(os.getenv("STT_SAMPLE_RATE", "16000"))
    if sr not in VALID_SAMPLE_RATES:
        sr = 16000

    pcm = _as_pcm_bytes(audio, sr)
    frames = _pcm_frames(pcm)
    # ~1 s tail silence so the final utterance closes (docs recommendation).
    frames.extend(_pcm_frames(b"\x00" * (sr * 2)))
    headers = build_headers(
        api_key=api_key,
        language_code=language_code,
        format_=format_,
        sample_rate=sr,
        itn_native_numerals=itn_native_numerals,
        bias_list=bias_list,
        bias_score=bias_score,
        vad=vad,
    )
    ws_url = url or os.getenv("GNANI_STT_WSS_URL", "") or DEFAULT_WSS_URL
    cadence = _frame_seconds(sr)

    async def _run() -> STTResult:
        start = asyncio.get_event_loop().time()
        segments: list[str] = []
        latencies: list[int] = []
        errors: list[str] = []
        detected: str | None = None

        async with websockets.connect(
            ws_url, additional_headers=headers, open_timeout=connect_timeout
        ) as ws:

            async def send_audio() -> None:
                for frame in frames:
                    await ws.send(frame)
                    await asyncio.sleep(cadence)
                await ws.send(json.dumps({"type": "commit"}))

            async def receive() -> None:
                nonlocal detected
                while True:
                    try:
                        raw = await asyncio.wait_for(ws.recv(), timeout=read_timeout)
                    except asyncio.TimeoutError:
                        return  # no more transcript traffic — done
                    except Exception:  # noqa: BLE001 — server closed / socket error
                        return
                    try:
                        msg = json.loads(raw)
                    except (json.JSONDecodeError, TypeError):
                        continue
                    kind = msg.get("type")
                    if kind == "transcript":
                        text = msg.get("text") or ""
                        if text.strip():
                            segments.append(text)
                        if msg.get("latency") is not None:
                            latencies.append(int(msg["latency"]))
                        if msg.get("detected_language_code") and not detected:
                            detected = msg["detected_language_code"]
                    elif kind == "error":
                        errors.append(msg.get("message") or "unknown server error")
                    elif kind == "connected":
                        continue  # config echo — nothing to do

            await asyncio.gather(send_audio(), receive())

        elapsed = int((asyncio.get_event_loop().time() - start) * 1000)
        return STTResult(
            text=" ".join(segments).strip(),
            segments=tuple(segments),
            detected_language=detected,
            latency_ms=tuple(latencies),
            elapsed_ms=elapsed,
            errors=tuple(errors),
        )

    if not retry:
        try:
            return asyncio.run(_run())
        except Exception as exc:  # noqa: BLE001
            logger.warning("Prisma WSS session failed (no retry): %s", exc)
            return STTResult(text="", errors=(str(exc),))

    # 429-safe retry with exponential backoff + jitter so concurrent intakes
    # (voice + assisted call) do not thundering-herd the shared key.
    attempt = 0
    max_attempts = 4
    base = 0.5  # seconds — matches the documented retry policy
    while True:
        try:
            return asyncio.run(_run())
        except Exception as exc:  # noqa: BLE001
            delayed = _is_retryable(exc) or attempt > 0
            if not delayed or attempt >= max_attempts - 1:
                logger.warning("Prisma WSS session failed after %d attempt(s): %s", attempt + 1, exc)
                return STTResult(text="", errors=(str(exc),))
            attempt += 1
            wait = base * (2 ** (attempt - 1)) + (hash(exc.__class__.__name__) % 500) / 1000.0
            logger.info("Prisma WSS retryable — backing off %.2fs (attempt %d)", wait, attempt)
            time.sleep(wait)


if __name__ == "__main__":  # pragma: no cover — `python -m haqvaani.stt_client`
    import sys

    print("stt_client — Prisma v2.5 WSS contract module")
    print("  live available:", available())
    print("  headers:", json.dumps({k: ("…" if k == "x-api-key-id" else v) for k, v in build_headers().items()}, indent=2))
    sys.exit(1 if not available() else 0)
