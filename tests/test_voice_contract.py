"""Offline contract tests for the Gnani clients (live paths require a key, so
these verify the documented wire shapes deterministically — headers, frames,
payloads, voice catalog, WAV assembly — without any network call."""

import base64
import json

import pytest

from haqvaani.stt_client import (
    FRAME_BYTES,
    build_headers,
    _pcm_frames,
    transcribe_wss,
    STTResult,
)
from haqvaani.tts_client import (
    TTSResult,
    VOICE_BY_LANG,
    assemble_wav,
    build_audio_config,
    default_voice,
    synthesize_sse,
)

LANG_CODES = {"bn-IN", "en-IN", "gu-IN", "hi-IN", "kn-IN", "ml-IN", "mr-IN", "pa-IN", "ta-IN", "te-IN"}


def test_stt_headers_match_documented_contract():
    h = build_headers(
        api_key="k123",
        language_code="hi-IN",
        model="prisma-v2.5",
        format_="transcribe",
        sample_rate=16000,
        itn_native_numerals=True,
        bias_list=["UTR", "UPI"],
        bias_score=1.0,
        vad={"threshold": "0.7", "min_silence_ms": "500", "min_speech_ms": "200"},
    )
    assert h["x-api-key-id"] == "k123"
    assert h["language_code"] == "hi-IN"
    assert h["model"] == "prisma-v2.5"
    assert h["format"] == "transcribe"
    assert h["x-sample-rate"] == "16000"
    assert h["itn_native_numerals"] == "true"
    assert json.loads(h["bias_list"]) == ["UTR", "UPI"]
    assert h["bias_score"] == "1.0"
    assert h["x-vad-threshold"] == "0.7"
    assert h["x-min-silence-ms"] == "500"
    assert h["x-min-speech-ms"] == "200"
    assert h["x-api-request-id"]


def test_stt_headers_no_bias_without_score():
    h = build_headers(api_key="k", language_code="hi-IN", bias_list=["UTR"])
    assert "bias_list" not in h and "bias_score" not in h


def test_stt_headers_path_bias_score():
    h = build_headers(api_key="k", language_code="hi-IN", bias_list=["UTR"], bias_score=3.0)
    assert "bias_list" not in h and "bias_score" not in h


def test_stt_pcm_frames_1024_bytes():
    frames = _pcm_frames(bytes(4096 + 500), pad=True)
    assert all(len(f) == FRAME_BYTES for f in frames)
    assert frames[0][:4] == b"\x00\x00\x00\x00"


def test_stt_result_dataclass():
    r = STTResult(text="hello", segments=("hello",), latency_ms=(320,), errors=())
    assert r.ok
    bad = STTResult(text="", errors=("boom",))
    assert not bad.ok


def test_voice_catalog_covers_all_languages():
    assert set(VOICE_BY_LANG) == LANG_CODES | {"hi-en"}


def test_default_voice_hi_is_nalini():
    assert default_voice("hi-IN") == "Nalini"


def test_default_voice_en_is_kaveri():
    assert default_voice("en-IN") == "Kaveri"


def test_default_voice_hinglish_is_poorvi():
    assert default_voice("hi-en") == "Poorvi"


def test_audio_config_defaults_raw_pcm():
    ac = build_audio_config()
    assert ac["encoding"] == "linear_pcm"
    assert ac["container"] == "raw"
    assert ac["num_channels"] == 1
    assert ac["sample_width"] == 2


def test_assemble_wav_has_valid_header():
    pcm = bytes(16000 * 2)  # 1 s @ 16 kHz, 16-bit
    wav = assemble_wav(pcm, sample_rate=16000)
    assert wav[:4] == b"RIFF"
    assert wav[8:12] == b"WAVE"


def test_tts_result_roundtrip_b64():
    r = TTSResult(
        audio=b"\x00\x01\x02",
        audio_base64=base64.b64encode(b"\x00\x01\x02").decode(),
        status="live",
        chunks=1,
    )
    assert base64.b64decode(r.audio_base64) == b"\x00\x01\x02"
    assert r.ok


def test_transcribe_wss_pipeline_fails_cleanly_offline():
    # No key configured → session function should produce a non-raising,
    # empty result (it degrades instead of hitting the network).
    result = transcribe_wss(b"\x00" * 1024, api_key="", url="wss://127.0.0.1:1/stt/v3/stream")
    assert isinstance(result, STTResult)
    assert result.text == ""
