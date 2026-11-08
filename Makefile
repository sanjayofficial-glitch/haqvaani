.PHONY: install self-test benchmark hud lint run-api

install:
	pip install -r requirements.txt

self-test:
	python -m haqvaani.statutory --self-test
	python -m haqvaani.orchestrator
	python -m haqvaani.stt_client || true
	python -m haqvaani.tts_client || true
	python scripts/verify_gnani_roundtrip.py || true

run-api:
	uvicorn haqvaani.api:app --reload --env-file .env --port 8000

benchmark:
	python eval/benchmark.py

lint:
	ruff check haqvaani/ eval/ tests/ || true
