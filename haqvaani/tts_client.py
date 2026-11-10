"""
HaqVaani TTS client — Gnani Timbre v2.5/v3.0 over SSE.

Implements the documented wire contract (docs/gnani_api/api-reference-cheatsheet.md):

  * POST https://api.vachana.ai/api/v1/tts/sse with X-API-Key-ID auth.
  * JSON body {text, voice, model, language, speed, audio_config}.
  * SSE events: start / chunk / complete / error; each chunk carries base64 audio.

We request `container=raw` + `linear_pcm` and assemble a single valid WAV
locally (SSE chunks with container=wav would each carry their own WAV header).

Owned by Engineer A. Env: GNANI_API_KEY, GNANI_TTS_SSE_URL, TTS_MODEL, TTS_LANG, TTS_SPEED, TTS_AUDIO_*, TTS_VOICE_*.
"""

from __future__ import annotations

import base64
import io
import json
import logging
import os
import wave
from dataclasses import dataclass, field

logger = logging.getLogger("haqvaani.tts_client")

DEFAULT_SSE_URL = "https://api.vachana.ai/api/v1/tts/sse"
DEFAULT_MODEL = os.getenv("TTS_MODEL", "timbre-v3.0")

# Round-2 coaching defaults (docs/pitching.md §edges): Timbre v3.0 is the
# current model and keeps first-audio latency in the <200 ms band when the
# service is warm. Speed stays conservative so statutory numbers stay readable.
DEFAULT_LANGUAGE = os.getenv("TTS_LANG", "hi-IN")
DEFAULT_SPEED = float(os.getenv("TTS_SPEED", "1.0"))
DEFAULT_AUDIO_SAMPLE_RATE = int(os.getenv("TTS_AUDIO_SAMPLE_RATE", "48000"))

# Timbre v2.5 catalog — preferred voice per language (docs/available-voices.md).
VOICE_BY_LANG: dict[str, str] = {
    "hi-IN": os.getenv("TTS_VOICE_HI", "Nalini"),
    "en-IN": os.getenv("TTS_VOICE_EN", "Kaveri"),
    "hi-en": os.getenv("TTS_VOICE_HINGLISH", "Poorvi"),
    "ta-IN": os.getenv("TTS_VOICE_TA", "Asmita"),
    "te-IN": os.getenv("TTS_VOICE_TE", "Suhana"),
    "kn-IN": os.getenv("TTS_VOICE_KN", "Saanvi"),
    "ml-IN": os.getenv("TTS_VOICE_ML", "Reshma"),
    "mr-IN": os.getenv("TTS_VOICE_MR", "Zahira"),
    "bn-IN": os.getenv("TTS_VOICE_BN", "Kirra"),
    "gu-IN": os.getenv("TTS_VOICE_GU", "Falak"),
    "pa-IN": os.getenv("TTS_VOICE_PA", "Mehuli"),
    "te-IN": os.getenv("TTS_VOICE_TE", "Suhana"),
    "kn-IN": os.getenv("TTS_VOICE_KN", "Saanvi"),
    "ml-IN": os.getenv("TTS_VOICE_ML", "Reshma"),
    "mr-IN": os.getenv("TTS_VOICE_MR", "Zahira"),
    "bn-IN": os.getenv("TTS_VOICE_BN", "Kirra"),
    "gu-IN": os.getenv("TTS_VOICE_GU", "Falak"),
    "pa-IN": os.getenv("TTS_VOICE_PA", "Mehuli"),
}

_ENV_SUFFIX = {
    "hi-IN": "HI",
    "en-IN": "EN",
    "hi-en": "HINGLISH",
    "ta-IN": "TA",
    "te-IN": "TE",
    "kn-IN": "KN",
    "ml-IN": "ML",
    "mr-IN": "MR",
    "bn-IN": "BN",
    "gu-IN": "GU",
    "pa-IN": "PA",
}


class TTSAPIError(RuntimeError):
    """Raised when the TTS service reports an error (HTTP or SSE error event)."""

    def __init__(self, status_code: int, message: str):
        super().__init__(f"TTS error {status_code}: {message}")
        self.status_code = status_code
        self.message = message


@dataclass
class TTSResult:
    """Outcome of an SSE synthesis call."""

    audio: bytes = b""
    audio_base64: str = ""
    status: str = "live"
    chunks: int = 0
    note: str = ""
    errors: tuple[str, ...] = field(default_factory=tuple)

    @property
    def ok(self) -> bool:
        return bool(self.audio) and not self.errors


def available() -> bool:
    """True when a live call can be attempted (key + SSE URL configured)."""
    return bool(os.getenv("GNANI_API_KEY") and os.getenv("GNANI_TTS_SSE_URL")) or _TEST_MODE


def default_voice(language: str, model: str = DEFAULT_MODEL) -> str:
    """Pick the catalog-preferred voice for a language (env override wins)."""
    if model != DEFAULT_MODEL:
        return os.getenv("TTS_VOICE_V3", "Shivani")
    suffix = _ENV_SUFFIX.get(language, "HI")
    return os.getenv(f"TTS_VOICE_{suffix}", VOICE_BY_LANG.get(language, "Nalini"))


def build_audio_config(**overrides) -> dict:
    """Canonical audio_config. We use raw 16-bit PCM and assemble WAV locally."""
    cfg = {
        "sample_rate": DEFAULT_AUDIO_SAMPLE_RATE,
        "num_channels": 1,
        "sample_width": 2,
        "encoding": "linear_pcm",
        "container": "raw",
    }
    cfg.update({k: v for k, v in overrides.items() if v is not None})
    return cfg


def _tts_is_retryable(exc: BaseException) -> bool:
    """Only retry 429/500/503/504 and connection/socket/timeout errors (docs §errors)."""
    name = type(exc).__name__.lower()
    msg = ""
    if exc.args:
        msg = str(exc.args[0]).lower()
    retryable_by_name = {
        "ratelimiterror",
        "httperror",
        "timeouterror",
        "connecterror",
        "readerror",
        "writeerror",
        "connectionerror",
    }
    if any(t in name for t in retryable_by_name):
        return True
    codes = ("429", "500", "503", "504")
    if any(c in msg for c in codes):
        return True
    if isinstance(exc, OSError):
        return True
    return False


def _synthesize_once(
    sse_url: str,
    payload: dict,
    headers: dict[str, str],
    timeout: float,
    cfg: dict,
) -> TTSResult:
    import httpx  # optional dep — live path only

    with httpx.stream("POST", sse_url, json=payload, headers=headers, timeout=timeout) as r:
        if r.status_code >= 400:
            body = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
            msg = body.get("message") or body.get("detail") or f"HTTP {r.status_code}"
            raise TTSAPIError(r.status_code, str(msg))

        audio_parts: list[bytes] = []
        chunks = 0
        errors: list[str] = []
        event = ""
        for line in r.iter_lines():
            if line is None:
                continue
            line = line.strip()
            if not line:
                continue
            if line.startswith("event:"):
                event = line[len("event:") :].strip()
                continue
            if not line.startswith("data:"):
                continue
            data = line[len("data:") :].strip()
            try:
                obj = json.loads(data)
            except json.JSONDecodeError:
                obj = {"raw": data}

            if event == "error" or (obj.get("type") == "error") or (obj.get("status") == "error"):
                errors.append(obj.get("message") or "TTS synthesis failed")
                continue
            if event == "complete" or obj.get("is_final") is True:
                break
            audio_b64 = obj.get("audio")
            if event == "chunk" and audio_b64:
                audio_parts.append(base64.b64decode(audio_b64))
                chunks += 1
            elif audio_b64 and not obj.get("is_final"):
                audio_parts.append(base64.b64decode(audio_b64))
                chunks += 1

        raw = b"".join(audio_parts)
        container = cfg.get("container", "raw")
        if container == "raw" and cfg.get("encoding", "linear_pcm") == "linear_pcm":
            raw = assemble_wav(raw, cfg.get("sample_rate", 48000))
            note = f"Timbre SSE → WAV ({cfg.get('sample_rate')} Hz)"
        else:
            note = f"Timbre SSE ({container})"

        return TTSResult(
            audio=raw,
            audio_base64=base64.b64encode(raw).decode("ascii"),
            status="live",
            chunks=chunks,
            note=note,
            errors=tuple(errors),
        )


def assemble_wav(pcm_bytes: bytes, sample_rate: int, channels: int = 1, width: int = 2) -> bytes:
    """Wrap raw PCM into a single valid WAV (stdlib `wave`)."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(channels)
        w.setsampwidth(width)
        w.setframerate(sample_rate)
        w.writeframes(pcm_bytes)
    return buf.getvalue()


def synthesize_sse(
    text: str,
    *,
    voice: str | None = None,
    model: str | None = None,
    language: str | None = None,
    speed: float | str = 1.0,
    audio_config: dict | None = None,
    api_key: str | None = None,
    url: str | None = None,
    timeout: float = 40.0,
    retry: bool = True,
) -> TTSResult:
    """Synthesize speech via Timbre SSE. Returns TTSResult (audio bytes + b64).

    `voice`/`language` default from the catalog registry. `audio_config` may
    override container/encoding; when the effective container is raw linear PCM,
    the chunks are assembled into one WAV (audio_base64 reflects that WAV).

    When `retry` is true (default) the call survives transient 429/500/503/504
    and connection errors with exponential backoff + jitter (Round-2 wiring).
    """
    import httpx  # optional dep — live path only

    model = model or DEFAULT_MODEL
    lang = language or DEFAULT_LANGUAGE
    voice = voice or default_voice(lang, model)
    speed = speed if speed != 1.0 else DEFAULT_SPEED
    cfg = audio_config or build_audio_config()
    payload = {
        "text": text,
        "voice": voice,
        "model": model,
        "language": lang,
        "speed": speed,
        "audio_config": cfg,
    }
    headers = {
        "X-API-Key-ID": api_key or os.getenv("GNANI_API_KEY", ""),
        "Content-Type": "application/json",
    }
    sse_url = url or os.getenv("GNANI_TTS_SSE_URL", "") or DEFAULT_SSE_URL

    if not retry:
        return _synthesize_once(sse_url, payload, headers, timeout, cfg)

    # 429-safe retry with exponential backoff + jitter so concurrent intakes
    # (voice + assisted call) do not thundering-herd the shared key.
    attempt = 0
    max_attempts = 4
    base = 0.5  # seconds — matches the documented retry policy
    while True:
        try:
            return _synthesize_once(sse_url, payload, headers, timeout, cfg)
        except Exception as exc:  # noqa: BLE001
            delayed = _tts_is_retryable(exc) or attempt > 0
            if not delayed or attempt >= max_attempts - 1:
                logger.warning("Timbre SSE synthesis failed after %d attempt(s): %s", attempt + 1, exc)
                return TTSResult(status="demo", errors=(str(exc),))
            attempt += 1
            wait = base * (2 ** (attempt - 1)) + (hash((type(exc).__name__, id(exc))) % 500) / 1000.0
            logger.info("Timbre SSE retryable — backing off %.2fs (attempt %d)", wait, attempt)
            time.sleep(wait)


if __name__ == "__main__":  # pragma: no cover — `python -m haqvaani.tts_client`
    import sys

    print("tts_client — Timbre SSE contract module")
    print("  live available:", available())
    print("  default voices:", json.dumps(VOICE_BY_LANG, ensure_ascii=False))
    sys.exit(1 if not available() else 0)
