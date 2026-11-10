"""Offline contract tests for the Gnani clients (live paths require a key, so
these verify the documented wire shapes deterministically — headers, frames,
payloads, voice catalog, WAV assembly — without any network call.

The clients read their defaults at import time from os.environ. A conftest
session fixture wires the Round-2 env (prisma-v3.0 + ITN true + VAD 0.75/900
+ timbre-v3.0) BEFORE these imports, and reloads every haqvaani.* module, so
the defaults below reflect the wired build."""

from __future__ import annotations

import base64
import inspect
import json
from typing import Any

import pytest

LANG_CODES = {"bn-IN", "en-IN", "gu-IN", "hi-IN", "kn-IN", "ml-IN", "mr-IN", "pa-IN", "ta-IN", "te-IN"}


@pytest.fixture()
def c() -> Any:
    """Lazy import of the Gnani clients.

    This runs AFTER the conftest session fixture has set the wired Round-2 env
    and reloaded every haqvaani.* module, so the defaults we read here reflect
    the wired build (prisma-v3.0 + ITN true + VAD 0.75/900 + timbre-v3.0).
    """
    import haqvaani.stt_client as s
    import haqvaani.tts_client as t

    return type("C", (), {
        "stt": s,
        "tts": t,
    })()


def test_stt_headers_match_documented_contract(c) -> None:
    # The wired Round-2 defaults are prisma-v3.0 / ITN on / codemix on +
    # the telephony VAD preset (0.75 / 900 ms) unless explicitly overridden.
    # WSS upgrade headers are built by build_headers(); codemix is a session
    # config field (per the Gnani API reference cheatsheet), not a WSS header,
    # so it is asserted separately on wired_transcribe_params().
    h = c.stt.build_headers(
        api_key="k123",
        language_code="hi-IN",
        model="prisma-v3.0",
        format_="transcribe",
        sample_rate=16000,
        itn_native_numerals=True,
        bias_list=["UTR", "₹", "DemoBank"],
        bias_score=1.5,
        vad={
            "threshold": "0.75",
            "min_silence_ms": "900",
            "min_speech_ms": "200",
            "min_segment_ms": "120",
            "idle_timeout_sec": "60",
        },
    )
    assert h["x-api-key-id"] == "k123"
    assert h["language_code"] == "hi-IN"
    assert h["model"] == "prisma-v3.0"
    assert h["format"] == "transcribe"
    assert h["x-sample-rate"] == "16000"
    assert h["itn_native_numerals"] == "true"
    assert json.loads(h["bias_list"]) == ["UTR", "₹", "DemoBank"]
    assert h["bias_score"] == "1.5"
    assert h["x-vad-threshold"] == "0.75"
    assert h["x-min-silence-ms"] == "900"
    assert h["x-min-speech-ms"] == "200"
    assert h["x-min-segment-ms"] == "120"
    assert h["x-idle-timeout-sec"] == "60"
    assert h["x-api-request-id"]
    assert "code_mix" not in h  # codemix is a session-config field, not a WSS header


def test_stt_headers_no_bias_without_score(c) -> None:
    h = c.stt.build_headers(api_key="k", language_code="hi-IN", bias_list=["UTR"])
    assert "bias_list" not in h and "bias_score" not in h


def test_stt_headers_path_bias_score(c) -> None:
    h = c.stt.build_headers(api_key="k", language_code="hi-IN", bias_list=["UTR"], bias_score=3.0)
    assert "bias_list" not in h and "bias_score" not in h


def test_stt_pcm_frames_1024_bytes(c) -> None:
    frames = c.stt._pcm_frames(bytes(4096 + 500), pad=True)
    assert all(len(f) == c.stt.FRAME_BYTES for f in frames)
    assert frames[0][:4] == b"\x00\x00\x00\x00"


def test_stt_result_dataclass(c) -> None:
    r = c.stt.STTResult(text="hello", segments=("hello",), latency_ms=(320,), errors=())
    assert r.ok
    bad = c.stt.STTResult(text="", errors=("boom",))
    assert not bad.ok


def test_stt_retry_param_default(c) -> None:
    # `transcribe_wss` exposes a `retry` kwarg defaulting to True (429-safe path).
    sig = inspect.signature(c.stt.transcribe_wss)
    assert sig.parameters["retry"].default is True


def test_tts_retry_param_default(c) -> None:
    # `synthesize_sse` exposes a `retry` kwarg defaulting to True (429-safe path).
    sig = inspect.signature(c.tts.synthesize_sse)
    assert sig.parameters["retry"].default is True


def test_voice_catalog_covers_all_languages(c) -> None:
    assert set(c.tts.VOICE_BY_LANG) == LANG_CODES | {"hi-en"}


def test_default_voice_hi_is_nalini(c) -> None:
    assert c.tts.default_voice("hi-IN") == "Nalini"


def test_default_voice_en_is_kaveri(c) -> None:
    assert c.tts.default_voice("en-IN") == "Kaveri"


def test_default_voice_hinglish_is_poorvi(c) -> None:
    assert c.tts.default_voice("hi-en") == "Poorvi"


def test_audio_config_defaults_raw_pcm(c) -> None:
    ac = c.tts.build_audio_config()
    assert ac["encoding"] == "linear_pcm"
    assert ac["container"] == "raw"
    assert ac["num_channels"] == 1
    assert ac["sample_width"] == 2


def test_assemble_wav_has_valid_header(c) -> None:
    pcm = bytes(16000 * 2)  # 1 s @ 16 kHz, 16-bit
    wav = c.tts.assemble_wav(pcm, sample_rate=16000)
    assert wav[:4] == b"RIFF"
    assert wav[8:12] == b"WAVE"


def test_tts_result_roundtrip_b64(c) -> None:
    r = c.tts.TTSResult(
        audio=b"\x00\x01\x02",
        audio_base64=base64.b64encode(b"\x00\x01\x02").decode(),
        status="live",
        chunks=1,
    )
    assert base64.b64decode(r.audio_base64) == b"\x00\x01\x02"
    assert r.ok


def test_transcribe_wss_pipeline_fails_cleanly_offline(c) -> None:
    # With no key/ws configured the WSS path does not even attempt a connect
    # and returns an empty, non-raising result — the contract degrades cleanly.
    result = c.stt.transcribe_wss(
        b"\x00" * 1024,
        api_key="",
        url="",
        retry=False,
    )
    assert isinstance(result, c.stt.STTResult)
    assert result.text == ""


def test_stt_wired_params(c) -> None:
    spec = c.stt.wired_transcribe_params()
    assert spec["model"] == "prisma-v3.0"
    assert spec["language_code"] == "hi-IN"
    assert spec["format"] == "transcribe"
    assert spec["sample_rate"] == 16000
    assert spec["itn_native_numerals"] is True  # wired build: STT_ITN_NATIVE_NUMERALS=true
    assert spec["code_mix"] is True  # wired build: STT_CODEMIX=true (session config, not a WSS header)
    assert spec["vad"]["threshold"] == "0.75"  # wired build: STT_VAD_THRESHOLD=0.75
    assert spec["vad"]["min_silence_ms"] == "900"
    assert spec["vad"]["min_speech_ms"] == "200"
    assert spec["vad"]["min_segment_ms"] == "120"
    assert spec["vad"]["idle_timeout_sec"] == "60"
    assert spec["bias"] is None  # no env bias pair configured by default


def test_tts_model_defaults_to_timbre_v3(c) -> None:
    assert c.tts.DEFAULT_MODEL == "timbre-v3.0"  # wired build: TTS_MODEL=timbre-v3.0
    assert c.tts.DEFAULT_LANGUAGE == "hi-IN"
    assert c.tts.DEFAULT_SPEED == 1.0
    assert c.tts.DEFAULT_AUDIO_SAMPLE_RATE == 48000


def test_stt_model_defaults_to_prisma_v3(c) -> None:
    assert c.stt.DEFAULT_MODEL == "prisma-v3.0"
    assert c.stt.DEFAULT_LANG_CODE == "hi-IN"
    assert c.stt.DEFAULT_FORMAT == "transcribe"
    assert c.stt.DEFAULT_ITN_NATIVE is True  # wired build: STT_ITN_NATIVE_NUMERALS=true
    assert c.stt.STT_USE_CODEMIX is True
    assert c.stt.VAD_DEFAULTS["threshold"] == "0.75"  # wired build: STT_VAD_THRESHOLD=0.75
    assert c.stt.VAD_DEFAULTS["min_silence_ms"] == "900"  # documented 800 + floor


def test_voice_clients_live_enabled_when_key_and_urls_set(c) -> None:
    # VoiceAPI.live_enabled reflects the wired env (GNANI_API_KEY + both urls).
    import haqvaani.voice_clients as vc
    assert vc.VoiceAPI.live_enabled is True
