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
| Frontend / HUD | Single HTML file (vanilla JS, Canvas, Tailwind CDN) |
| Database | SQLite (file-based) or none |
| Deployment | Hugging Face Spaces (Docker) / Render free / Colab |

Budget: Gnani free 5,000 programme credits + open-source tools + free GPU (Kaggle/Colab).

---

## Quick Start

```bash
# 1. Clone
git clone <repo> haqvaani && cd haqvaani

# 2. Configure Gnani credentials
cp .env.example .env
# Add GNANI_API_KEY=... (5,000 free credits from app.gnani.ai/voice)

# 3. Install dependencies
pip install -r requirements.txt

# 4. Verify the Prisma → Timbre roundtrip (Day 1 milestone)
python -m haqvaani.stt_client --self-test
python -m haqvaani.tts_client --self-test

# 5. Run the statutory engine sanity check
python -m haqvaani.statutory --self-test
```

> All test data is synthetic (e.g. UTR 629188340112, SR-DB-884120). No real phone numbers,
> accounts, or recordings are used. **HaqVaani does not autonomously call banks.**

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
