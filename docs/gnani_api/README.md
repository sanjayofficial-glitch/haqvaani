# Gnani Speech API — Mirrored Reference (HaqVaani)

> Local mirror of the Gnani docs pages we depend on, captured on 2026-11-06
> from https://docs.gnani.ai. The canonical sources win if anything conflicts.

## Files

| File | What it is | Source URL |
| :--- | :--- | :--- |
| `quick-start.md` | First STT/TTS/VC calls (REST + realtime) | https://docs.gnani.ai/api/introduction/quick-start.md |
| `api-reference-cheatsheet.md` | Wire contract distilled from the deep dives | see per-section links inside |
| `llms-index.txt` | Full documentation index | https://docs.gnani.ai/llms.txt |

## How to refresh

Fetch the pages above (or the full index) from `docs.gnani.ai` and re-run the
cheatsheet's relevant section. The cheatsheet is the *authoritative* local
reference for `stt_client.py` / `tts_client.py` / `voice_clients.py`.

## Key endpoints at a glance

| API | Endpoint | Auth |
| :--- | :--- | :--- |
| STT REST | `POST https://api.vachana.ai/stt/v3` | `X-API-Key-ID` |
| STT Realtime (WSS) | `wss://api.vachana.ai/stt/v3/stream` | header `x-api-key-id` |
| TTS REST | `POST https://api.vachana.ai/api/v1/tts/inference` | `X-API-Key-ID` |
| TTS Streaming (SSE) | `POST https://api.vachana.ai/api/v1/tts/sse` | `X-API-Key-ID` |
| TTS Realtime | `wss://api.vachana.ai/api/v1/tts` | upgrade header `X-API-Key-ID` |
| VC embeddings | `POST https://api.vachana.ai/api/v1/tts/voice-clone/embeddings` | `X-API-Key-ID` |
| STT Batch | `https://api.vachana.ai/api/stt-batch/...` | `X-API-Key-ID` |
