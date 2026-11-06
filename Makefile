.PHONY: install self-test benchmark hud lint

install:
	pip install -r requirements.txt

self-test:
	python -m haqvaani.stt_client --self-test
	python -m haqvaani.tts_client --self-test
	python -m haqvaani.statutory --self-test

benchmark:
	python eval/benchmark.py

lint:
	ruff check haqvaani/ eval/ tests/ || true
