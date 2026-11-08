# LIVE PROOF — HaqVaani real (non-demo) integration

**Date:** 2026-11-09 · Reproducible with the commands below.

This file records the evidence that the Gnani sovereign stack is genuinely
wired and functioning — not simulated. Bank interactions and citizen data
remain synthetic by challenge/TRAI/DPDP rule; everything else is real.

---

## 1. Server health (live mode)

```json
GET /api/health
{"ok":true,"mode":"live","stt_live":true,"tts_live":true,"evon_live":true}
```

The header chip on every screen shows "Live · Gnani connected".

## 2. Live TTS (Timbre v2.5) through the app

Real text → `/api/tts` returned `status:"live"` with the full WAV as
`audio_base64` (107 Timbre chunks; ~1.6 s TTFA measured in the roundtrip).

## 3. Live STT (Prisma v2.5) — direct roundtrip

```
$ python scripts/verify_gnani_roundtrip.py --text "नमस्ते। यह हक़वाणी की परीक्षण कॉल है।"
Timbre SSE → WAV (48 kHz, 261164 bytes) in 1602 ms
Prisma WSS → transcript in 21272 ms:
  'नमस्ते, यह हकवाणी की परीक्षण कॉल है।'
=== ROUNDTRIP OK ===
```

A Hindi utterance with amount/UTR:

```
$ python scripts/verify_gnani_roundtrip.py \
    --text "भैया, अठारह अक्टूबर को तीन हज़ार दो सौ रुपये UPI से कट गए,
            पैसा नहीं पहुंचा। UTR छह उनतीस एक अड़ासी तीन चार शून्य एक एक दो।"
Prisma transcript: 'भैया अट्ठारह अक्टूबर को ₹3,200 यू पी आई से कट गए,
  पैसा नहीं पहुँचा, यू टी आर 6 उन्तीस एक अड़ासी 340112'
```

## 4. Live audio → intake inside the app

Verified 2026-11-09 (consent-gated live session, real Timbre-generated WAV
uploaded to `/api/intake`):

```json
POST /api/intake  (multipart, audio = real Timbre TTS WAV)
{
  "utr": "629188340112",
  "amount_inr": 3200.0,
  "txn_date": "2026-10-18",
  "dispute_type": "upi_p2p",
  "bank_name": "DemoBank Support",
  "raw_transcript": "भैया 18 अक्टूबर को ₹3,200 यू पी आई ऐसी यू टी आर 6 29 एक अड़ासी 340112"
}
```

The `raw_transcript` is the live Prisma v2.5 output — the parsed facts
(UTR/amount/date/dispute) are derived from it by the deterministic parser.
No whisper fallback was used (silent Prisma session).

## 5. What is NOT live (by design)

- **Bank/IVR:** simulated DemoBank only — never a real outbound call
  (challenge + TRAI). Production model: the citizen dials; HaqVaani assists.
- **Citizen data:** synthetic only (DPDP + challenge). No real PII.

## 6. Fixes that made live voice actually work (2026-11-09)

1. `haqvaani/api.py` loads `.env` at boot → clean `make run-api` goes live.
2. `haqvaani/voice_clients.py` — fixed `s:e` slice bug (segments are
   `(start, end)` tuples) that crashed every real-audio intake with a 500.
3. `haqvaani/api.py` — `/api/intake` now runs transcription with
   `asyncio.to_thread`, so live Prisma WSS works inside the async route
   (previously `asyncio.run()` inside the loop silently fell back to Whisper).
4. `scripts/verify_gnani_roundtrip.py` loads `.env` (verifiable from a clean
   shell).
