"""Session-scoped wiring fixture for the Round-2 contract tests.

The Gnani clients read their defaults at import time from os.environ, so the
wired defaults (prisma-v3.0 + ITN true + VAD 0.75/900 + timbre-v3.0) only
take effect when those env vars are set BEFORE haqvaani is first imported.

This conftest wires that env for the whole session ONLY when the collected test
items include the Round-2 contract module (tests.test_voice_contract). Other
test modules (orchestrator/safety/statutory/complaint/api) are left alone, so
a Round-2 wiring session does not silently change their behaviour.

Real environment is snapshotted before we mutate it and restored after the
session, so this fixture never leaks into anything outside the test run.
"""

from __future__ import annotations

import importlib
import os
import sys
from typing import Iterator

import pytest

# The wired Round-2 defaults the contract suite is supposed to verify.
_WIRED_ENV = {
    "GNANI_API_KEY": "k",
    "GNANI_STT_WSS_URL": "wss://api.vachana.ai/stt/v3/stream",
    "GNANI_TTS_SSE_URL": "https://api.vachana.ai/api/v1/tts/sse",
    "STT_ITN_NATIVE_NUMERALS": "true",
    "STT_VAD_THRESHOLD": "0.75",
    "STT_VAD_MIN_SILENCE_MS": "900",
    "TTS_MODEL": "timbre-v3.0",
}

# Extra haqvaani env vars that the wired build explicitly clears (no bias pair,
# no codemix override) so the contract suite can assert the code's true defaults.
_WIRED_CLEAR = {
    "STT_BIAS_LIST",
    "STT_BIAS_SCORE",
    "STT_CODEMIX",
    "STT_MODEL",
    "STT_LANG_CODE",
    "STT_FORMAT",
    "STT_SAMPLE_RATE",
    "STT_VAD_MIN_SPEECH_MS",
    "STT_VAD_MIN_SEGMENT_MS",
    "STT_VAD_IDLE_TIMEOUT_SEC",
    "TTS_VOICE_HI",
    "TTS_VOICE_EN",
    "TTS_VOICE_HINGLISH",
    "TTS_VOICE_TA",
    "TTS_VOICE_TE",
    "TTS_VOICE_KN",
    "TTS_VOICE_ML",
    "TTS_VOICE_MR",
    "TTS_VOICE_BN",
    "TTS_VOICE_GU",
    "TTS_VOICE_PA",
    "TTS_LANG",
    "TTS_SPEED",
    "TTS_AUDIO_SAMPLE_RATE",
    "TTS_MODEL",
}

_ROUND2_MODULE_NAMES = frozenset({"tests.test_voice_contract", "test_voice_contract"})


def _wire_client_defaults() -> None:
    """Import the three Gnani clients under the wired env and reload ONLY them.

    The Round-2 contract tests verify stt_client/tts_client/voice_clients
    defaults under the wired env (prisma-v3.0 + ITN true + VAD 0.75/900 +
    timbre-v3.0). We set os.environ before import so those defaults are read
    from the wired env, then reload ONLY those three modules so the defaults
    take effect.

    We deliberately do NOT reload schemas/safety/statutory/orchestrator/
    evon_client/complaint_builder: the other test modules in the suite
    imported those at collection time (before this fixture ran) and hold
    identity references (pytest.raises(Class), is-comparisons, Pydantic
    model_type checks) to the pre-reload objects. Reloading them in place
    would invalidate those references and break the other modules' tests.
    """
    import haqvaani.stt_client  # noqa: F401
    import haqvaani.tts_client  # noqa: F401
    import haqvaani.voice_clients  # noqa: F401
    for _mod_name in ("haqvaani.stt_client", "haqvaani.tts_client", "haqvaani.voice_clients"):
        importlib.reload(sys.modules[_mod_name])


@pytest.hookimpl(tryfirst=True)
def pytest_collection_modifyitems(session: pytest.Session, config: pytest.Config) -> None:
    """Decide, at collection time, whether this session should wire the Round-2 env.

    We check each collected item's *module* (not the test function name) so we
    correctly identify tests that live in tests/test_voice_contract.py.
    """
    config.__haqvaani_wire_round2 = any(
        item.module.__name__ in _ROUND2_MODULE_NAMES
        for item in session.items
        if getattr(item, "module", None) is not None
    )


@pytest.fixture(scope="session", autouse=True)
def wired_round2_env(request: pytest.FixtureRequest) -> Iterator[None]:
    """Wire the Round-2 env for the whole session IF the suite includes the
    Round-2 contract module; otherwise leave the env untouched.

    This keeps the non-contract tests (orchestrator/safety/statutory/complaint/api)
    running against the real .env — which is what they were written and verified
    against — while still giving the Round-2 contract tests a deterministic,
    fully-isolated wired env to assert the code's true defaults against.
    """
    should_wire = bool(getattr(request.config, "__haqvaani_wire_round2", False))
    print(
        f"[haqvaani] Round-2 wiring fixture: should_wire={should_wire}"
    )
    if not should_wire:
        yield
        return

    before = {k: os.environ.get(k) for k in set(_WIRED_ENV) | _WIRED_CLEAR}
    try:
        for k, v in _WIRED_ENV.items():
            os.environ[k] = v
        for k in _WIRED_CLEAR:
            os.environ.pop(k, None)
        _wire_client_defaults()
        yield
    finally:
        for k, before_val in before.items():
            if before_val is None:
                os.environ.pop(k, None)
            else:
                os.environ[k] = before_val
