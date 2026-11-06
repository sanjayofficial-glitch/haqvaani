# RECOMMENDATIONS.md — Free Stack Recommendations

> Frontend, backend, database, authentication, and deployment recommendations. Free tiers only.
> HaqVaani is a human-controlled advocate — no autonomous bank calling, so WebSocket persistence
> for outbound telephony is not required.

---

## 1. Frontend (completely free)

**Recommendation:** Single-file Telemetry HUD (`frontend/hud.html`) + Citizen Glass UI
(`frontend/glass_ui.html`) — vanilla JavaScript + HTML5 Canvas + Tailwind CSS via CDN.

**Why:**
- Zero build step, zero dependencies to install, previewable in any browser.
- Completely free (Tailwind CDN; no hosting needed for local demo).
- Easy for AI agents to modify and extend.
- One file can be cropped to 16:9 (master) and 9:16 (mobile/LinkedIn) cuts.

**Content (4 quadrants on HUD):**
- Whisper vs Prisma live UTR WER comparison.
- ₹100/day Statutory Meter.
- Assisted-Call Script + Docket Verifier.
- Compliance/Safety Indicators (consent, disclosure, secret redaction, autonomous calls = 0).

**Citizen UI (glass_ui.html):**
- Consent screen (Hindi + English).
- Large mic button ("बोलें" / Speak).
- Statutory result card in Hindi.
- Assisted-call script display (en-IN + hi-IN).
- Docket capture with verbatim verification.
- Compliance badges (`SIMULATED DEMO`, `NO AUTONOMOUS DIALING`, etc.).

**Alternatives considered (rejected):** React/Vite (build step, hosting needed), Streamlit (free tier
limits), paid SaaS dashboards (violates free constraint).

---

## 2. Backend

**Recommendation:** Python + FastAPI + asyncio, orchestrating Gnani Prisma WSS, Timbre SSE, and
Evon v3.3 (vLLM/SGLang on spot GPU).

**Why:**
- FastAPI is free, high-performance, and trivial for AI agents to read and extend.
- WebSocket (Prisma STT) + SSE (Timbre TTS) map naturally to FastAPI.
- Single process for MVP; can scale to async workers if needed (still free tier).
- No outbound telephony needed (human-controlled advocate), so no Twilio/Plivo required.

**Deployment target:** Hugging Face Spaces (free, Docker blank template, no credit card, 16 GB RAM)
or Render free tier / Railway free tier / fly.io free tier or self-hosted on Google Colab/Kaggle
(free GPU for Evon).

---

## 3. Database (prefer none or free SQLite)

**Recommendation:** No database for MVP; add SQLite (file-based) only if case records need
persistence across restarts.

**Why:**
- MVP is stateless per case; `HaqVaaniCaseRecord` lives in memory during the session and is
  emitted as the RB-IOS 2026 PDF/JSON dossier.
- SQLite is free, serverless, zero-config, and requires no hosted instance.
- Avoids Postgres/Redis managed services (cost + ops overhead).

---

## 4. Authentication (minimal, free)

**Recommendation:** Minimal consent-based access; no real users, no real PII.

**Why:**
- HaqVaani is a demo/advocacy tool, not a consumer app with logins.
- Consent is captured at intake via a plain-language screen (`citizen_consent_verified`) and
  recorded in `ConsentRecord` with a timestamp (DPDP Act 2023 compliance).
- No OAuth, no paid Auth0/Clerk tiers, no real credentials stored.
- Gnani API key is the only secret, kept in `.env` (gitignored, from `.env.example`).

---

## 5. Deployment (free tiers only)

**Recommendation:** Hugging Face Spaces (Docker blank template) for the FastAPI orchestrator;
Google Colab or Kaggle (free spot A100/L40S GPU) for Evon v3.3 vLLM/SGLang.

| Option | Pros | Cons |
| :--- | :--- | :--- |
| **Hugging Face Spaces** (primary) | No credit card, 16 GB RAM, instant GitHub deploy, free | Public by default (secure env vars via HF Secrets); space sleeps after inactivity (pre-warm before demo) |
| **Render free** | Seamless GitHub integration, free | 15-min spin-down; 50+ sec wake-up (bad for live demos) |
| **Railway free** | Easy setup, free | Credit card may be required for verification |
| **fly.io** | No cold starts, persistent VM | Credit card required for fraud verification (even free tier) |
| **Colab/Kaggle GPU** | Free spot A100/L40S for Evon | Disconnects after ~12h (acceptable for 16-day demo) |

**Why HF Spaces primary:** No credit card barrier, 16 GB RAM (plenty for FastAPI + WebSocket
proxy), instant deployment. The orchestrator does not run heavy ML models locally (Evon runs on
Colab/Kaggle separately), so RAM is not a constraint.

**Critical prerequisite for HF Spaces:** Use the **Docker blank template** (not Gradio/Streamlit)
to expose a raw port for WebSockets. Secure `GNANI_API_KEY` via HF Secrets UI (never hardcode).
Pre-warm the space by pinging its health endpoint every 10 minutes before Demo Day to prevent
sleep mode.

**Fallback chain:** HF Spaces → Render free (with ping script) → Railway free → fly.io (if card
available) → local Colab tunnel.
