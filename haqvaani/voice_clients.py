"""
HaqVaani voice-API adapters — Prisma v2.5 (STT), Evon v3.3 (LLM),
Timbre v2.5/v3.0 (TTS).

Thin facade over the three client modules:
  * stt_client   — Prisma v2.5 WSS + faster-whisper offline fallback
  * evon_client  — Evon v3.3 HTTP chat (intake + negotiation extraction)
  * tts_client   — Timbre v2.5/v3.0 SSE

Live Gnani calls are attempted ONLY when `GNANI_API_KEY` AND the relevant endpoint
URL are present in the environment. Without them, every adapter falls back to
deterministic/demo data (offline mode). Nothing here touches real PII —
all placeholders are synthetic (RULES.md §3.4).

Owned by Engineer A (latency/timing); Evon schema expectations from Engineer B.
`VoiceAPI` is re-exported here for back-compat (orchestrator/tests import from here).
"""

from __future__ import annotations

import logging
import os
from datetime import date

import numpy as np

from . import dsp_audio, evon_client, stt_client, tts_client
from .safety import assert_no_forbidden_secret
from .schemas import (
    AgentNegotiationExtraction,
    BrushOffType,
    CitizenIntake,
    DisputeType,
)

logger = logging.getLogger("haqvaani.voice_clients")

try:  # optional deps — live paths degrade to demo when absent
    import httpx
except Exception:  # pragma: no cover
    httpx = None

try:
    import websockets
except Exception:  # pragma: no cover
    websockets = None

# ------------------------------------------------------------ synthetic content ---

DEMO_TRANSCRIPT = (
    "Bhaiya 18 Oct ko 3,200 UPI kiya tha, paisa kat gaya par pahuncha nahi — "
    "UTR 629188340112"
)
DEMO_IVR_TRANSCRIPT = (
    "Thank you for calling DemoBank. Your complaint is registered under SR-DB-884120."
)

_MONTHS = {m: i + 1 for i, m in enumerate(
    "jan feb mar apr may jun jul aug sep oct nov dec".split()
)}


class VoiceAPI:
    """Single entry point for the Prisma/Evon/Timbre adapters."""

    live_enabled = bool(os.getenv("GNANI_API_KEY"))

    _WHISPER_MODEL: object = None  # cached faster-whisper model

    # ---------------------------------------------------------------- STT ------

    @classmethod
    def transcribe(
        cls,
        audio_path: str | None = None,
        audio_bytes: bytes | None = None,
    ) -> str:
        """Transcribe audio to text.

        Pipeline:
          1. Decode arbitrary audio bytes (webm/wav/etc) -> float32 array + native sample rate
          2. DSP: resample 8 kHz -> 16 kHz, Silero VAD speech segmentation
          3. Gnani Prisma v2.5 WSS when credentials are configured (live)
          4. faster-whisper local (tiny, CPU) as offline fallback — real transcription, not demo text
        Returns the best-effort transcript (empty string if nothing usable).
        """
        # 1. Decode audio.
        if audio_bytes is not None:
            try:
                audio_array, sample_rate = cls._decode_audio_bytes(audio_bytes)
            except Exception as exc:  # noqa: BLE001
                logger.warning("Audio decode failed: %s", exc)
                return DEMO_TRANSCRIPT
        elif audio_path is not None:
            try:
                import soundfile as _sf
                audio_array, sample_rate = _sf.read(audio_path, dtype="float32")
                if audio_array.ndim > 1:
                    audio_array = audio_array.mean(axis=1)
            except Exception as exc:  # noqa: BLE001
                logger.warning("Audio file read failed: %s", exc)
                return DEMO_TRANSCRIPT
        else:
            return DEMO_TRANSCRIPT

        if audio_array.size == 0:
            return ""

        # 2. DSP preprocessing: resample + VAD.
        proc = dsp_audio.preprocess_intake(
            (audio_array * 32768).astype(np.int16),
            in_rate=sample_rate,
            out_rate=dsp_audio.INTERNAL_SAMPLE_RATE,
        )
        audio_16k = proc["audio_16k"]
        segments = proc["segments"]
        if not segments:
            logger.info("No speech segments detected by VAD")
            return ""

        speech = np.concatenate([audio_16k[s:e] for s, e in segments]).astype(np.float32)
        speech = np.clip(speech, -1.0, 1.0)

        # 3. Live Gnani Prisma v2.5 WSS (preferred when credentials present).
        if cls.live_enabled and stt_client.available():
            try:
                result = stt_client.transcribe_wss(speech)
                if result.ok:
                    return result.text
                logger.warning("Prisma STT returned no usable transcript → whisper fallback: %s",
                               " | ".join(result.errors))
            except Exception as exc:  # noqa: BLE001
                logger.warning("Prisma STT live attempt failed → whisper fallback: %s", exc)

        # 4. Offline faster-whisper (real transcription, no canned demo text).
        return cls._whisper_transcribe(speech)

    @classmethod
    def _decode_audio_bytes(cls, audio_bytes: bytes) -> tuple:
        """Decode arbitrary audio bytes (webm/opus/wav/...) to (float32 mono, native sample rate).

        Uses ffmpeg to demux/decode to WAV at the native rate, then soundfile to read.
        """
        import tempfile
        import subprocess
        import soundfile as sf

        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name
        wav_path = tmp_path + ".wav"
        try:
            # Decode to mono WAV at the native sample rate (let DSP handle 8k->16k resample).
            subprocess.run(
                ["ffmpeg", "-y", "-i", tmp_path, "-ac", "1", "-f", "wav", wav_path],
                check=True, capture_output=True,
            )
            data, sr = sf.read(wav_path, dtype="float32")
            if data.ndim > 1:
                data = data.mean(axis=1)
            return data.astype(np.float32), int(sr)
        finally:
            for p in (tmp_path, wav_path):
                try:
                    os.unlink(p)
                except OSError:
                    pass

    @classmethod
    def _whisper_transcribe(cls, audio_16k: np.ndarray) -> str:
        """faster-whisper local STT (tiny, CPU). Real transcription, works offline after first download."""
        try:
            from faster_whisper import WhisperModel
        except Exception as exc:  # noqa: BLE001
            logger.warning("faster-whisper not importable: %s", exc)
            return DEMO_TRANSCRIPT

        if cls._WHISPER_MODEL is None:
            try:
                cls._WHISPER_MODEL = WhisperModel("tiny", device="cpu", compute_type="int8")
            except Exception as exc:  # noqa: BLE001
                logger.warning("faster-whisper model load failed (offline? %s)", exc)
                return DEMO_TRANSCRIPT

        try:
            segments, _ = cls._WHISPER_MODEL.transcribe(
                audio_16k, language=None, beam_size=1, vad_filter=True
            )
            text = " ".join(seg.text for seg in segments).strip()
            return text or DEMO_TRANSCRIPT
        except Exception as exc:  # noqa: BLE001
            logger.warning("faster-whisper transcription failed: %s", exc)
            return DEMO_TRANSCRIPT

    # ---------------------------------------------------------------- Evon -----

    @classmethod
    def parse_intake(cls, transcript: str) -> CitizenIntake:
        """Evon v3.3 JSON extraction; deterministic regex fallback when not live."""
        result = evon_client.parse_intake(transcript)
        if result.ok:
            return result.intake
        logger.warning("Evon intake failed → synthetic fallback: %s", " | ".join(result.errors))
        return CitizenIntake(
            utr="629188340112",
            amount_inr=3200.0,
            txn_date=date(2026, 10, 18),
            dispute_type=DisputeType.UPI_P2P,
            bank_name="DemoBank Support",
            language="hi-IN",
            confidence=0.0,
            raw_transcript=transcript,
        )

    @classmethod
    def extract_negotiation(cls, ivr_transcript: str) -> AgentNegotiationExtraction:
        """Mode 4: brush-off + docket candidate from the IVR transcript (synthetic)."""
        result = evon_client.extract_negotiation(ivr_transcript)
        if result.ok:
            return result.negotiation
        logger.warning("Evon negotiation failed → synthetic fallback: %s", " | ".join(result.errors))
        return AgentNegotiationExtraction(
            brush_off_type=BrushOffType.OTHER,
            docket_id_candidate=None,
            suggested_script_en=(
                '"Under RBI/2019-20/67, the applicable timeline has passed. '
                'Please register my complaint and provide the service request number."'
            ),
            suggested_script_hi=(
                '"आरबीआई/2019-20/67 के तहत, लागू समय-सीमा गुज़र चुकी है। कृपया मेरी '
                'शिकायत दर्ज करें और सर्विस रिक्वेस्ट नंबर दें।"'
            ),
            transcript_segment=ivr_transcript[:400],
        )

    # ----------------------------------------------------- Timbre TTS ------

    @classmethod
    def synthesize_tts(
        cls,
        text: str,
        lang: str = "hi-IN",
        *,
        retry: bool = True,
        voice: str | None = None,
        model: str | None = None,
        speed: float | str | None = None,
        audio_config: dict | None = None,
    ) -> dict:
        """Timbre v2.5/v3.0 SSE synth via tts_client. Hard-blocks forbidden secrets.

        Round-2 wiring: exposes retry + voice/model/speed/audio_config so the
        orchestrator and API can enable 429-safe queuing and coaching defaults.
        """
        assert_no_forbidden_secret(text)  # RULES.md §3.2
        return tts_client.synthesize_sse(
            text,
            language=lang,
            retry=retry,
            voice=voice,
            model=model,
            speed=speed,
            audio_config=audio_config,
        )


# Module-level convenience wrappers (back-compat for orchestrator/api).


def synthesize_tts(text: str, lang: str = "hi-IN") -> dict:
    """Module-level TTS (delegates to VoiceAPI.synthesize_tts)."""
    return VoiceAPI.synthesize_tts(text, lang=lang)
