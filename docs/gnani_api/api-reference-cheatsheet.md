# Gnani Speech API — Wire Contract Cheatsheet (HaqVaani)

> Distilled 2026-11-06 from the Gnani docs deep-dives. This is the authoritative
> local reference for `stt_client.py` / `tts_client.py` / `voice_clients.py`.
> Source pages: [STT Realtime](https://docs.gnani.ai/api/STT/stt-websocket.md),
> [Prisma v2.5](https://docs.gnani.ai/api/STT/models/prisma-v2-5.md),
> [STT REST](https://docs.gnani.ai/api/STT/speech-to-text.md),
> [TTS SSE](https://docs.gnani.ai/api/TTS/tts-sse.md),
> [TTS REST](https://docs.gnani.ai/api/TTS/tts-inference.md),
> [Voices](https://docs.gnani.ai/api/TTS/available-voices.md),
> [Languages](https://docs.gnani.ai/api/STT/languages.md),
> [Errors](https://docs.gnani.ai/api/introduction/errors.md).

---

## 1. Authentication (all APIs)

Header: `X-API-Key-ID: <API_KEY>` (WebSocket upgrade header on WSS: `x-api-key-id`).

Auth/rate-limit error shape (401/402/403/429) — **not** the `success/error` envelope:

```json
{"detail": {"error_code": "INVALID_API_KEY", "message": "Unauthorized", "status_code": 401}}
```

| HTTP | `detail.error_code` | Meaning |
| - | - | - |
| 401 | `MISSING_API_KEY` / `INVALID_API_KEY` | key missing/empty or invalid |
| 402 | — | insufficient credit |
| 403 | `SCOPE_NOT_ALLOWED` | key lacks scope for this service |
| 429 | `RATE_LIMITED` | rate limited (no `Retry-After`; back off and retry) |

Retry policy: only `429`/`500`/`503`/`504` and connection errors — exponential
backoff (0.5 s → 1 s → 2 s, 3 attempts). Do not retry other 4xx.

---

## 2. STT — Prisma v2.5 (default model)

### 2.1 REST — `POST https://api.vachana.ai/stt/v3` (multipart/form-data)

| Field | Required | Notes |
| - | - | - |
| `audio_file` | yes | WAV/MP3/OGG/FLAC/AAC/M4A, ≤ 30 s |
| `language_code` | yes | one of the 10 codes (see §5), e.g. `hi-IN` |
| `model` | no | omit (or `prisma-v2.5`) for v2.5; `prisma-v3.0` for v3 |
| `format` | no | `verbatim` (default) \| `transcribe` (ITN) |
| `itn_native_numerals` | no | `true` → native-script digits (hi-IN: `₹५,०००`) |
| `enable_substitution` / `substitution_map` | no | find-and-replace, ≤ 10 rules |
| `bias_list` / `bias_score` | no | word boosting (v2.5 only); list ≤ 100 single words, score ∈ {0, 0.5, 1, 1.5, 2} |

Success (v2.5):

```json
{
  "success": true,
  "request_id": "req_abc123",
  "transcript": "नमस्ते, आप कैसे हैं?",
  "model": "prisma-v2.5",
  "processing_time": 0.14,
  "end_to_end_latency": 0.17,
  "output": {"literal": "नमस्ते, आप कैसे हैं?"}
}
```

ITN (`format=transcribe`) converts spoken numbers/currency/dates/times/phone →
written form (`₹5,000`, `9876543210`, `15:50`). ITN works for `hi-IN`/`en-IN` only.

### 2.2 Realtime WSS — `wss://api.vachana.ai/stt/v3/stream`

All configuration is **WebSocket upgrade headers** (same names as REST). Most are
fixed for the session.

| Header | Required | Default | Notes |
| - | - | - | - |
| `x-api-key-id` | yes | — | API key |
| `language_code` | yes | — | one language for v2.5 (e.g. `hi-IN`); `indic-auto` accepted but only v3 returns detection |
| `model` | no | v2.5 | `prisma-v2.5` (or omit) \| `prisma-v3.0` |
| `format` | no | `verbatim` | `transcribe` = ITN on each segment |
| `itn_native_numerals` | no | `false` | v2.5 only |
| `x-sample-rate` | no | `16000` | `8000`/`16000`/`44100`/`48000`; must match audio |
| `x-vad-threshold` | no | `0.7` | telephony preset 0.65–0.75; clean mic 0.45–0.55 |
| `x-min-silence-ms` | no | `500` | IVR 300–400; telephony 400–600; conversation 600–900 |
| `x-min-speech-ms` | no | `100` (`200` @8k) | noise gate |
| `x-min-segment-ms` | no | `120` | drop < this (watch out: kills one-word answers if too high) |
| `x-max-speech-s` | no | disabled | force-close monologues (5–120) |
| `x-idle-timeout-sec` | no | `60` | 5–900 |
| `x-api-request-id` | no | generated | correlation id |
| `bias_list` / `bias_score` | no | — | word boosting; JSON array or comma-separated |
| `enable_substitution` / `substitution_map` | no | — | find-and-replace |

**Audio frames:** raw PCM, signed 16-bit little-endian, mono, **exactly 1024 bytes
per frame** (512 samples). Send at real-time cadence (32 ms @16k, 64 ms @8k) —
do not buffer-and-burst (degrades VAD).

**Server text frames (JSON):** `connected` (config echo) → `processing` (VAD
segment captured) → `transcript` (text, `segment_id`, `segment_index`,
`latency` ms, `audio_duration_ms`, v2.5 `output.literal`, always `is_final: true`)
→ `error` (recoverable or fatal; bad handshake closes with code 1008, session
limit 15 min closes 1001, auth failure = HTTP 401 before WS opens).

**Client control frames (JSON):** `{"type": "commit"}` closes the open utterance
immediately; `{"type": "update_settings", ...}` changes `language_code`/`format`/
`itn_native_numerals`/`bias`/`substitution` mid-session (VAD headers can't change).

**Tip:** end recordings with ~1 s of silence so the last sentence finalises; a
transcript arrives only after the speaker stops.

### 2.3 Error envelope (REST/v2.5)

```json
{"success": false, "error": {"type": "INVALID_LANGUAGE_CODE", "message": "..."}}
```

Common `error.type`: `INVALID_LANGUAGE_CODE`, `INVALID_FORMAT` (not verbatim/transcribe),
`INVALID_MODEL`, `EMPTY_AUDIO`, `UNSUPPORTED_AUDIO_FORMAT`, `AUDIO_CONVERSION_ERROR`,
`MAX_AUDIO_DURATION_EXCEEDED` (30 s), `TRANSCRIPTION_FAILED` (500), `INTERNAL_SERVER_ERROR`.
422 validation uses `{"detail": [...]}`. Invalid bias input is skipped (200), not rejected.

---

## 3. TTS — Timbre v2.5 / v3.0

### 3.1 SSE — `POST https://api.vachana.ai/api/v1/tts/sse`

Headers: `Content-Type: application/json`, `X-API-Key-ID`.

Body:

```json
{
  "text": "नमस्ते, आप कैसे हैं?",
  "voice": "Nalini",
  "model": "timbre-v2.5",
  "language": "hi-IN",
  "speed": 1.0,
  "audio_config": {
    "sample_rate": 48000,
    "num_channels": 1,
    "sample_width": 2,
    "encoding": "linear_pcm",
    "container": "wav"
  }
}
```

- `text` required; pass numbers/dates/IDs as spoken words (avoid mispronunciation).
- `model` required: `timbre-v2.5` | `timbre-v3.0` (voices are NOT shared between models).
- `voice` required: from the matching model's catalog.
- `language` required: `auto`, `hi-IN`, `en-IN`, `hi-en` (Hinglish), `ta-IN`, `te-IN`, `kn-IN`, `ml-IN`, `mr-IN`, `pa-IN`, `bn-IN`, `gu-IN`.
- `speed`: number 0.85–1.15, or `"slow"`/`"medium"`/`"fast"`.
- `audio_config`: `sample_rate` (8000/16000/22050/24000/44100/48000), `num_channels` (1), `sample_width` (2), `encoding` (`linear_pcm` default), `container` (`wav` default, `raw`, `mp3`, `ogg`, `mulaw`, `alaw`). `mulaw`/`alaw` force 8000 Hz. `ogg`/`oggopus` arrives as a single chunk.

SSE events:

```
event: start
data: {"status": "streaming_started", "text": "..."}

event: chunk
data: {"chunk_index": 1, "audio": "<base64>", "is_final": false}

event: complete
data: {"chunk_index": 2, "audio": "", "is_final": true}

event: error
data: {"type": "error", "message": "Invalid text or audio configuration."}
```

Errors are flat (not the STT envelope): `{"success": false, "message": "...", "status_code": 400}`.

**Note:** with `container=wav`, each chunk carries its own WAV header — concatenated
chunks are NOT one valid WAV. Prefer `container=raw` + assemble a WAV locally
(wave module), or `container=mp3/ogg`.

### 3.2 REST — `POST https://api.vachana.ai/api/v1/tts/inference`

Same body; returns `200` with full audio binary in the requested container.
Best for downloads; SSE for streaming playback.

---

## 4. Voices (Timbre v2.5 — Hi Hi)

| Language | `language` | Voices |
| - | - | - |
| English | `en-IN` | Kaveri, Trupti, Devika, Pranav, Shlok, Girish |
| Hindi | `hi-IN` | **Nalini**, Bhavna, Yashvi, Urmila, Jwala, Chitra, Ambuja, Deepak, Roopesh, Vikrant, Hemraj, Jalaj, Omkar |
| Hinglish | `hi-en` | **Poorvi** |
| Tamil | `ta-IN` | Asmita, Trisha, Brinda, Vedika, Noopur |
| Telugu | `te-IN` | Suhana, Lehara, Lavanya, Yukti, Varuni |
| Kannada | `kn-IN` | Saanvi, Kavin |
| Malayalam | `ml-IN` | Reshma, Riyaan |
| Marathi | `mr-IN` | Zahira, Ishaan |
| Bengali | `bn-IN` | Kirra, Dhruva |
| Gujarati | `gu-IN` | Falak, Veera |
| Punjabi | `pa-IN` | Mehuli, Zayan |

HaqVaani picks: **Nalini** (hi-IN), **Kaveri** (en-IN), **Poorvi** (hi-en, Hinglish).
Timbre v3.0 voices (all speak all 10 languages): Shivani, Avinash, Lakshmi, Kalpana,
Shubham, Prakash, Devansh, Yashraj, Chetana, Vasudha, Riyaa, Tarika, Harshad.

---

## 5. Supported languages (STT v2.5 & v3.0)

`bn-IN`, `en-IN` (accepts HI-EN mixed), `gu-IN`, `hi-IN`, `kn-IN`, `ml-IN`, `mr-IN`, `pa-IN`, `ta-IN`, `te-IN`.
`indic-auto` = Prisma v3.0 only (returns `detected_language_code`). v2.5 is single-language per session.

---

## 6. Prisma v2.5 vs v3.0 (what we must NOT use on v2.5)

v3.0-only (rejected/ignored on v2.5): `indic-auto` detection on REST, `detected_language_code`,
`codemix`, `transliterate`, `keyterms`/`topic`/`previous_text`/`speaker_names` context hints.
v2.5 uses `bias_list`/`bias_score` for word boosting instead. `format=transcribe` ITN is a v2.5 feature.

---

## 7. Session limits

| Limit | Value |
| - | - |
| STT REST clip | ≤ 30 s |
| STT WSS session | 15 min; idle 60 s (default); concurrent-per-org cap |
| STT frame | 1024 bytes PCM (512 samples), real-time cadence |
| TTS text | ~ (500-char class; oversized text → 500) |
| TTS speed | 0.85–1.15 |
| TTS audio_config | sample_rate 8000–48000; channels ≤ 8; width ≤ 4 |
