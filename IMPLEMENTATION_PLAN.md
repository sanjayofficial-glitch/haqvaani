# IMPLEMENTATION_PLAN.md — Free Method for Every Major Component

> Best free method for each major component and why it was chosen. Zero paid infrastructure:
> Gnani free 5,000 credits + open-source tools + free GPU (Kaggle/Colab).
>
> HaqVaani is a **human-controlled advocate** — no autonomous bank calling. Simulated demo only.

---

## 1. Component-by-Component Plan

| Component | Chosen free method | Why this method |
| :--- | :--- | :--- |
| **STT** | Gnani Prisma v2.5 WebSocket (`x-format: transcribe`, `lang_code: hi-IN/en-IN`) | Native 8 kHz Indian telephony, ITN for 12-digit UTRs/lakhs/crores, <200 ms partials. Covered by free credits; Whisper used only as a local benchmark baseline (not in production path). |
| **LLM** | Gnani Evon v3.3 (30B-A3B MoE) via vLLM/SGLang on spot A100/L40S (Colab/Kaggle) | Apache-2.0 open weights kept on Indian infra; 302 ms TTFT at 257 tok/s; short JSON schema (<45 tok) + prefix-cached system prompt. Free GPU spot instance. |
| **TTS** | Gnani Timbre v2.5/v3.0 SSE (`en-IN` + `hi-IN`) | Native bilingual `hi-IN`↔`en-IN` switching; <100–200 ms TTFA; role-switch caching for post-call summary. Covered by free credits. |
| **DSP / audio** | NumPy + Silero VAD | Zero-cost local CPU audio processing. 8→16 kHz FIR resample, 220 ms VAD hangover, 200 ms/60 ms ring buffer. Used for voice intake + assisted-call listening. |
| **Orchestrator** | Python + FastAPI + asyncio | Single-file-deployable, easy for AI agents to read, zero cost, runs on any free tier. |
| **Statutory engine** | Pure Python + Pydantic v2 | Legal deadlines/penalties must be deterministic and auditable — never LLM-computed. `compute_statutory_entitlement()` in `haqvaani/statutory.py`. |
| **Complaint builder** | Pure Python text templates + Pydantic | Generates bank complaint draft, WhatsApp/email draft, evidence checklist, RB-IOS 2026 CMS draft. No LLM for legal content. |
| **Demo method** | Simulated bank IVR + pre-recorded synthetic audio | 100% real Gnani API execution over real PCM; zero real outbound calls; fully satisfies TRAI/DPDP/challenge rules at zero cost. |
| **Frontend / HUD** | Single HTML file (vanilla JS, Canvas, Tailwind CDN) | Completely free, no build step, previewable anywhere, 16:9 + 9:16 cuts from one file. |
| **Database** | SQLite file-based (or none for MVP) | Free, zero-config, serverless; prefer none in MVP, add SQLite only if case records need persistence. |
| **Authentication** | Minimal: consent screen + session, no real PII | Free; no real users; consent captured via plain-language screen and recorded in `ConsentRecord`. |
| **Deployment** | Hugging Face Spaces (Docker) / Render free / Colab | Free tiers only; Colab/Kaggle spot GPU for Evon v3.3 vLLM/SGLang; HF Spaces preferred (no credit card, 16 GB RAM). |

---

## 2. What is deliberately NOT used (to stay free and compliant)

- **No autonomous outbound calls:** Violates TRAI A2P framework; creates consent/fraud risk. User dials bank; HaqVaani assists only.
- **No paid phone/SMS/Twilio APIs:** Demo uses simulated IVR + pre-recorded synthetic audio.
- **No OpenAI/Anthropic/Google production models:** Gnani sovereign stack only (fallback to local open-source STT/TTS/LLM if credits exhaust).
- **No paid vector DB / Postgres / Redis:** SQLite or nothing.
- **No real customer data, real phone numbers, or recorded calls:** Synthetic only.
- **No LLM-computed statutory math:** Pure Python only — auditable and challenge-safe.

---

## 3. Build order (maps to ROADMAP.md)

1. **Days 1–2:** Gnani credentials + Prisma/Timbre roundtrip + consent UI (`stt_client.py`, `tts_client.py`, `safety.py`).
2. **Days 3–5:** DSP/audio + statutory engine + schemas + Evon client (`dsp_audio.py`, `schemas.py`, `statutory.py`, `evon_client.py`).
3. **Days 6–8:** Evon v3.3 on vLLM/SGLang + complaint builder + 4-mode orchestrator + assisted-call UI (`complaint_builder.py`, `orchestrator.py`, frontend).
4. **Days 9–11:** Telemetry HUD with compliance indicators (`frontend/hud.html`).
5. **Days 12–13:** 30-clip Whisper-vs-Prisma benchmark (`eval/`).
6. **Days 14–15:** 60s Simulated Demo Day Drop video (16:9 + 9:16).
7. **Day 16:** Submission portal + Duo Defense rehearsal.
