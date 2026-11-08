# Ensures pytest adds the project root to sys.path so `import haqvaani...`
# resolves when running `python -m pytest` from the repo root.

import os

import pytest


@pytest.fixture(autouse=True)
def _isolate_gnani_env(monkeypatch):
    """The suite must stay deterministic and offline: strip any Gnani/STT/
    TTS/Evon environment (e.g. from .env via api.py's load_dotenv) before
    every test. Tests that need live env set it themselves."""
    for key in list(os.environ):
        if key.startswith(("GNANI_", "STT_", "TTS_", "EVON_")):
            monkeypatch.delenv(key, raising=False)
