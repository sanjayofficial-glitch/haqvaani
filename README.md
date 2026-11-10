# HaqVaani (हक़-वाणी)

> **India's first citizen-side RBI Statutory Refund Advocate — human-controlled, voice-first, legally safe.**
> Built for the Great Indian AI Internship Challenge by Gnani AI — deadline 10 November 2026, 11:59 PM IST.

---

## What it does

When a non-English-speaking citizen loses money to a failed UPI transaction ("money deducted but not
received"), most citizens give up: they face English-only bank processes, confusing RBI rules, and
uncertainty about whether they are entitled to ₹100/day compensation. HaqVaani becomes the citizen's
personal bilingual advocate — **but the citizen remains the caller and decision-maker.** HaqVaani
never autonomously dials the bank.

1. **Listens** to the citizen's 15-second noisy Hinglish complaint via **Gnani Prisma v2.5** streaming
   STT (<200 ms partials, ITN for 12-digit UTRs and rupee amounts).
2. **Computes** the exact RBI statutory deadline and ₹100/day compensation in **pure Python** — never
   trusting an LLM with legal math.
3. **Builds** a bank complaint draft, WhatsApp/email draft, evidence checklist, and — if eligible —
   an RB-IOS 2026 CMS escalation draft.
4. **Assists during the call:** The citizen calls the bank themselves; HaqVaani listens, shows a
   real-time script in Hindi/English, captures the docket number, and summarizes the call afterward
   in warm Hindi.
5. **Never** makes autonomous outbound calls, never impersonates the user, and never stores OTPs,
   PINs, or passwords.

---

## Why it matters

Under **RBI/2019-20/67**, failed UPI P2P transfers must auto-reverse within **T+1 calendar day**
(T+5 for merchant/ATM), after which the bank owes **₹100 per day of delay** suo motu. Millions of
working-class Indians never claim it because they don't know their rights or how to articulate them
to a bank. HaqVaani gives citizens the language, the correct RBI rule citations, and a complaint
trail — while keeping them in control.

---

## Four Modes

| Mode | What it does |
| :--- | :--- |
| **1. Voice Intake** | Citizen speaks Hinglish complaint; Prisma extracts UTR, amount, date, bank. |
| **2. Rights Checker** | Pure-Python engine computes TAT (T+1 or T+5), days overdue, ₹100/day penalty. |
| **3. Complaint Builder** | Generates bank complaint draft, WhatsApp/email draft, evidence checklist, RBI CMS 2026 draft. |
| **4. Assisted Call** | Citizen calls bank; HaqVaani listens, shows script, captures docket, summarizes after. |

---

## Stack (completely free)

| Layer | Choice |
| :--- | :--- |
| STT | Gnani Prisma v2.5 (WebSocket) |
| LLM | Gnani Evon v3.3 (30B-A3B MoE) via vLLM/SGLang on spot GPU |
| TTS | Gnani Timbre v2.5/v3.0 (SSE, en-IN + hi-IN) |
| Orchestrator | Python + FastAPI |
| DSP / audio | NumPy + Silero VAD |
| Statutory engine | Pure Python + Pydantic v2 |
| Frontend / HUD | Two frontends: `frontend/` (vanilla HTML/CSS/JS, served at `/`) and `web/` (Vite + React 18 scroll-story rebuild, dev at :5173) |
| Database | SQLite (file-based) or none |
| Deployment | Vercel — `web/` React app live at https://haqvaani.vercel.app · Railway — FastAPI backend (`railway.json` railpack start command) · alternates: HF Spaces / Render / Colab |

Budget: Gnani free 5,000 programme credits + open-source tools + free GPU (Kaggle/Colab).

---

## Quick Start

```bash
# 1. Clone
git clone <repo> haqvaani && cd haqvaani

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the whole app (frontend + API)
make run-api            # or: python -m haqvaani
# → open http://localhost:8000  (landing → citizen app → HUD)
```

**The new React/Vite frontend (`web/`) — optional, dev mode:**

```bash
cd web && npm install && npm run dev     # → http://localhost:5173
```

`vite.config.js` proxies `/api` → `http://localhost:8000`, so the same
backend contract works with no CORS changes. See `web/README.md` for the
static-deploy (`VITE_API_BASE`) caveat.

**Windows:** just double-click `run.bat` — it creates a venv, installs deps, starts
the server, and opens the browser.

**Live Gnani speech (optional):** copy `.env.example` → `.env`, add
`GNANI_API_KEY` + endpoint URLs. Without them the app runs in offline demo mode
fully (synthetic intake, deterministic statutory math, browser-TTS summary). The
API health endpoint reports which capabilities are live:

```bash
curl http://localhost:8000/api/health
# {"ok":true,"mode":"demo","stt_live":false,"tts_live":false,"evon_live":false}
```

> All test data is synthetic (e.g. UTR 629188340112, SR-DB-884120). No real phone numbers,
> accounts, or recordings are used. **HaqVaani does not autonomously call banks.**

---

## Live deployments

- **Frontend (React/Vite)** → **https://haqvaani.vercel.app** — Vercel project
  `haqvaani`, built from `web/` (`web/vercel.json`: `npx vite build` → `dist`, SPA rewrite).
  Fully functional in **synthetic demo mode** (no backend required).
- **Backend (FastAPI)** → Railway service deployed from this repo — `railway.json`
  declares the start command (`uvicorn haqvaani.api:app --host 0.0.0.0 --port ${PORT:-8000}`)
  and health check `/api/health`; `.dockerignore` keeps the build context lean. Runs in
  demo mode by default; add `GNANI_API_KEY` (+ endpoints) for live Gnani speech.
- **Wiring:** to point the Vercel frontend at the Railway backend, set
  `VITE_API_BASE=https://<service>.up.railway.app` at build time — REST calls then need
  the CORS exception on `api.py` (see `web/README.md`); WebSocket voice works cross-origin.

> Both deploys are free-tier (Vercel Hobby / Railway trial credit). Everything remains
> synthetic demo data — no real PII, no autonomous dialing.

---

## Documentation

- `AGENTS.md` — instructions for AI coding agents (read first).
- `RULES.md` — non-negotiable legal, safety, challenge, and technical constraints (incl. TRAI/DPDP).
- `ARCHITECTURE.md` — 4-mode pipeline, module ownership, assisted-call state machine.
- `ROADMAP.md` — 16-day ship plan (25 Oct → 10 Nov 2026).
- `TODO.md` — current prioritized atomic tasks.
- `CHANGELOG.md` — change log.
- `CONTRIBUTING.md` — contribution guidelines.
- `docs/` — legal matrix, latency budget, demo storyboard, interview Q&A, evaluation, UI/UX design system.
- `web/README.md` — the React/Vite rebuild: run, proxy, static-deploy caveat, integrity contract.

---

## Safety & Compliance

- **No autonomous dialing:** HaqVaani never makes real outbound calls. The citizen calls the bank; HaqVaani assists.
- **AI disclosure:** "This is an AI assistant assisting [user name]." Never impersonates the user.
- **Consent:** Timestamped consent before AI processes voice or speaks on user's behalf (DPDP Act 2023).
- **TRAI 2026:** No A2P automated calling without pre-declared CLI details. Simulated demo only.
- `FORBIDDEN_SECRET_RE` hard-blocks any outbound TTS/text containing OTP, PIN, MPIN, CVV, or password.
- Docket IDs verified as exact case-insensitive substrings of the verbatim call transcript.
- RBI deadlines and ₹100/day penalties computed in pure Python, never by an LLM.
- Synthetic data only; no real PII in repo or demo.

---

## License

MIT License. Built on Gnani AI's sovereign stack (Prisma v2.5, Evon v3.3, Timbre v2.5/v3.0).
