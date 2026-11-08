# Gnani Quick Start (mirrored, 2026-11-06)

> Source: https://docs.gnani.ai/api/introduction/quick-start.md

Make your first speech-to-text, text-to-speech or voice-cloned TTS API request in minutes.

## Prerequisites

- A valid API key (sign up on the [Gnani API platform](https://app.gnani.ai/voice/) to generate API keys)
- cURL installed, or an API client such as Postman

## Speech-to-Text (STT)

### REST

Use a test audio file that meets these requirements:

- Format: WAV, MP3, OGG, FLAC, AAC, or M4A
- Sample rate: 8 kHz to 44.1 kHz
- Maximum duration: 30 seconds

Minimal examples to transcribe an audio file. Prisma v2.5 is the default model.
Add `model=prisma-v3.0` to use Prisma v3.0.

#### Prisma v3.0

```bash
curl -X POST https://api.vachana.ai/stt/v3 \
  -H 'X-API-Key-ID: <API_KEY>' \
  -F audio_file='@/path/to/your/audio.wav' \
  -F model=prisma-v3.0 \
  -F language_code=indic-auto
```

```python
import requests

with open("/path/to/your/audio.wav", "rb") as f:
    r = requests.post(
        "https://api.vachana.ai/stt/v3",
        headers={"X-API-Key-ID": "<API_KEY>"},
        files={"audio_file": ("audio.wav", f, "audio/wav")},
        data={"model": "prisma-v3.0", "language_code": "indic-auto"},
        timeout=60,
    )
print(r.json())
```

With one language and output style:

```bash
curl -X POST https://api.vachana.ai/stt/v3 \
  -H 'X-API-Key-ID: <API_KEY>' \
  -F audio_file='@/path/to/your/audio.wav' \
  -F model=prisma-v3.0 \
  -F language_code=hi-IN \
  -F format=transcribe
```

#### Prisma v2.5 (default)

```bash
curl -X POST https://api.vachana.ai/stt/v3 \
  -H 'Content-Type: multipart/form-data' \
  -H 'X-API-Key-ID: <API_KEY>' \
  -F audio_file='@/path/to/your/audio.wav' \
  -F language_code=hi-IN
```

Replace `<API_KEY>` with your API key, `audio.wav` with your audio path,
`hi-IN` with a supported language code.

#### Expected STT response

Prisma v3.0:

```json
{
  "success": true,
  "request_id": "5c1f0a52-6d62-4e0b-9a38-2f2b8a8f7a10",
  "transcript": "नमस्ते, आप कैसे हैं?",
  "model": "prisma-v3.0",
  "detected_language_code": "hi-IN",
  "processing_time": 0.58,
  "end_to_end_latency": 0.66
}
```

Prisma v2.5:

```json
{
  "success": true,
  "request_id": "019fd17d-1106-7265-88ab-3ed12d029292",
  "transcript": "नमस्ते, आप कैसे हैं?",
  "model": "prisma-v2.5"
}
```

### Realtime (WebSocket)

Endpoint: `wss://api.vachana.ai/stt/v3/stream`

Required headers:

| Header | Value |
| - | - |
| `x-api-key-id` | Your API key |
| `model` | `prisma-v3.0` (omit, or send `prisma-v2.5`, for Prisma v2.5) |
| `language_code` | e.g. `hi-IN`, or `indic-auto` (Prisma v3.0 only) |
| `x-sample-rate` | `8000` / `16000` / `44100` / `48000` (must match audio) |

Send **binary PCM frames** only (16-bit mono, 8 or 16 kHz, 1024 bytes per frame).
Server returns JSON transcript events:

```json
{
  "type": "transcript",
  "text": "Hello, how are you today?",
  "segment_id": "seg_abc123",
  "latency": 320
}
```

Python example (Prisma v3.0):

```python
import asyncio, json, websockets

HEADERS = {
    "x-api-key-id": "<API_KEY>",
    "model": "prisma-v3.0",
    "language_code": "indic-auto",
    # "language_code" can also be a list such as "hi-IN,en-IN"
    "x-sample-rate": "16000",
}

async def run(pcm_chunks):
    async with websockets.connect(
        "wss://api.vachana.ai/stt/v3/stream",
        additional_headers=HEADERS,            # `extra_headers` on websockets < 13
    ) as ws:
        async def send():
            for chunk in pcm_chunks:           # 16-bit mono PCM bytes
                await ws.send(chunk)
                await asyncio.sleep(0.1)
            await ws.send(json.dumps({"type": "commit"}))

        async def receive():
            async for raw in ws:
                frame = json.loads(raw)
                kind = frame["type"]
                if kind == "transcript":
                    print(frame.get("detected_language_code"), frame["text"])
                elif kind == "error":
                    print("error:", frame["message"])

        await asyncio.gather(send(), receive())
```

## Text-to-Speech (TTS)

> Timbre v2.5 is the recommended TTS model. Timbre v2.0 will be deprecated soon.

### REST

```bash
curl -X POST https://api.vachana.ai/api/v1/tts/inference \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key-ID: <API_KEY>' \
  -d '{
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
      }' \
  --output response.wav
```

Returns `200 OK` with raw binary audio in the requested format.

### Streaming (SSE)

Endpoint: `POST https://api.vachana.ai/api/v1/tts/sse`

```bash
curl -X POST https://api.vachana.ai/api/v1/tts/sse \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key-ID: <API_KEY>' \
  -d '{
        "text": "नमस्ते, आप कैसे हैं?",
        "voice": "Nalini",
        "model": "timbre-v2.5",
        "language": "hi-IN",
        "speed": 1.0,
        "audio_config": {
          "sample_rate": 48000,
          "encoding": "linear_pcm",
          "container": "wav"
        }
      }'
```

Expected SSE stream:

```http
event: start
data: {"status": "streaming_started", "text": "नमस्ते, आप कैसे हैं?"}

event: chunk
data: {"chunk_index": 1, "audio": "<base64-encoded audio>", "is_final": false}

event: complete
data: {"chunk_index": 2, "audio": "", "is_final": true}
```

### Realtime (WebSocket)

Endpoint: `wss://api.vachana.ai/api/v1/tts` — send the JSON payload after
connecting (include `X-API-Key-ID` in the upgrade headers); server streams JSON
messages with base64 audio chunks (`start`, then `audio`, then `complete`).

## Voice Cloning (VC)

1. **Generate embeddings** — upload a reference audio file (WAV/MP3, ~5–30 s of clear speech):

```bash
curl -X POST https://api.vachana.ai/api/v1/tts/voice-clone/embeddings \
  -H 'X-API-Key-ID: <API_KEY>' \
  -F audio_file='@/path/to/reference.wav'
```

```json
{
  "embedding": "<embedding-string>",
  "shape": [1, 768],
  "dtype": "torch.bfloat16"
}
```

2. **Synthesize** with the cloned voice (model `vachana-vc-v1`, pass `speaker_embedding`).

## Next Steps

- **STT**: [Overview](https://docs.gnani.ai/api/STT/overview.md), [REST](https://docs.gnani.ai/api/STT/speech-to-text.md), [Realtime](https://docs.gnani.ai/api/STT/stt-websocket.md)
- **Models**: [Models](https://docs.gnani.ai/api/STT/models/overview.md), [Prisma v3.0](https://docs.gnani.ai/api/STT/models/prisma-v3.md)
- **TTS**: [REST](https://docs.gnani.ai/api/TTS/tts-inference.md), [SSE](https://docs.gnani.ai/api/TTS/tts-sse.md), [Realtime](https://docs.gnani.ai/api/TTS/tts-websocket.md)
- **VC**: [embeddings](https://docs.gnani.ai/api/VC/voice-clone-embeddings.md), [REST](https://docs.gnani.ai/api/VC/vc-inference.md), [SSE](https://docs.gnani.ai/api/VC/vc-sse.md), [Realtime](https://docs.gnani.ai/api/VC/vc-websocket.md)
- **Batch**: [intro](https://docs.gnani.ai/api/STTBatch/Introduction.md)
- **Errors**: [Error Reference](https://docs.gnani.ai/api/introduction/errors.md)
