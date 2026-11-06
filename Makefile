.PHONY: install self-test benchmark hud lint

install:
	pip install -r requirements.txt

self-test:
	python -m haqvaani.statutory --self-test
	# stt_client / tts_client self-tests appear once Gnani endpoints are verified.

benchmark:
	python eval/benchmark.py

lint:
	ruff check haqvaani/ eval/ tests/ || true
