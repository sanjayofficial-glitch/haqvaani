# AGENTS.md — HaqVaani (हक़-वाणी)

> Master instruction file for every AI coding agent working on HaqVaani.
> Read this first. Re-read it before every session. It is the single source of truth for the
> vision, constraints, architecture, and current state.

---

## 1. Project Thesis (one paragraph)

HaqVaani (हक़-वाणी) is India's first citizen-side **RBI Statutory Refund Advocate** — a **human-controlled**
voice assistant that helps non-English-speaking citizens recover money lost to failed UPI transactions
("money deducted but not received"). HaqVaani listens to the citizen's noisy Hinglish complaint,
computes the exact RBI statutory deadline and ₹100/day compensation deterministically in Python,
builds a complaint dossier, and — in **Assisted Call Mode** — listens while the citizen calls the
bank themselves, shows what to say, captures the docket number, and summarizes the call afterward.
**HaqVaani never autonomously dials the bank.** The citizen remains the caller and decision-maker;
HaqVaani supplies language support, correct RBI-rule calculations, evidence organization, and a
clear complaint trail. It is being built for the **Great Indian AI Internship Challenge by Gnani AI**
(deadline: 10 November 2026, 11:59 PM IST) on Gnani's sovereign stack — Prisma v2.5 (STT),
Evon v3.3 (LLM), Timbre v2.5/v3.0 (TTS) — and must remain **completely free**
(5,000 free Gnani credits + open-source tools + free GPU on Kaggle/Colab).

---

## 2. Hard Rules (non-negotiable)

See `RULES.md` for the full, authoritative list. Summary:

- **No autonomous dialing:** HaqVaani must never make real outbound calls to banks or any third party. All bank interactions in the demo are simulated/synthetic. In production v1, the user dials the bank; HaqVaani only listens and assists (user-controlled).
- **AI disclosure:** Any AI-assisted communication must state: "This is an AI assistant assisting [user name]." Never impersonate the user.
- **Consent:** Timestamped, explicit consent is required before the AI speaks on the user's behalf or processes their voice data (DPDP Act 2023).
- **Synthetic data only:** No real phone numbers, bank accounts, Aadhaar, PAN, real UTRs, or recorded calls — synthetic data only (DemoBank + simulated IVR).
- **Statutory math:** RBI deadlines and ₹100/day compensation are computed in **pure Python** (`haqvaani/statutory.py`) — never by an LLM. Never hallucinate circular numbers.
- **Secret redaction:** `FORBIDDEN_SECRET_RE` hard-blocks any outbound TTS/text containing `OTP`, `PIN`, `MPIN`, `CVV`, or `password`.
- **Free constraint:** Zero paid infrastructure. Only Gnani free tier credits, open-source software, and free GPU (Kaggle/Colab).
- **No misleading demos:** Label all bank interactions as "Simulated IVR / synthetic demo."

---

## 3. Current Phase

**Day 15 of 16 — Design System & Demo Prep** (25 October 2026 → 10 November 2026).
The "HaqVaani Story" design system (`docs/DESIGN.md`) is the frontend: story landing + all
11 app screens wired to `haqvaani/api.py` with honest synthetic-demo fallbacks;
`python scripts/_ui_integrity_check.py` must stay green after any UI change (it now checks
**both** the `frontend/` system and the React/Vite rebuild in `web/`). Remaining:
smoke-test the screens against `make run-api`, record the simulated 60s demo video, submit
before 10 November 2026, 11:59 PM IST. See `ROADMAP.md` and `TODO.md`.

---

## 4. Preferred Stack (free only)

| Layer | Choice | Why |
| :--- | :--- | :--- |
| STT | Gnani Prisma v2.5 (WebSocket) | Native 8 kHz Indian telephony, ITN for UTRs/amounts, <200 ms partials |
| LLM | Gnani Evon v3.3 (30B-A3B MoE) via vLLM/SGLang on spot GPU | Structured JSON extraction, brush-off parsing, Apache-2.0 open weights |
| TTS | Gnani Timbre v2.5/v3.0 (SSE, en-IN + hi-IN) | Native bilingual, <100–200 ms TTFA, reads back docket IDs and summaries |
| Orchestrator | Python FastAPI + asyncio | Free, single-file deployable, easy for agents to read |
| DSP / audio | NumPy + Silero VAD | Local voice activity detection for assisted call listening |
| Statutory engine | Pure Python + Pydantic v2 | Deterministic, auditable, LLM-proof RBI calculations |
| Frontend | Story landing + 11 app screens, shared tokens/rail/router (vanilla JS, no build step) | Free, previewable, spec in `docs/DESIGN.md` |
| Database | SQLite (file-based) or none | Free, zero-config; prefer none for MVP |
| Auth | Minimal: consent screen + session, no real PII | Free; no real users |
| Deployment | Hugging Face Spaces (Docker) / Render free / Colab | Free tier only |

---

## 5. How Agents Must Work

1. **Read first:** `AGENTS.md` → `RULES.md` → `ARCHITECTURE.md` → `ROADMAP.md` → `TODO.md`.
2. **One task at a time:** Pick the top atomic task from `TODO.md`, mark it `in progress`, implement, test, mark `done`, update `CHANGELOG.md`.
3. **Never break safety gates:** Do not remove or weaken `FORBIDDEN_SECRET_RE`, the consent gate, or the "no autonomous dialing" guard.
4. **Deterministic statutory math:** All RBI calculations live in `haqvaani/statutory.py`; LLMs may format output but never compute deadlines or penalties.
5. **Synthetic data only:** All test data, phone numbers, UTRs, and docket IDs are synthetic. Never record real calls.
6. **Update documentation:** When you change architecture, stack, or rules, update `ARCHITECTURE.md`, `RULES.md`, and this file in the same PR/commit.
7. **Latency awareness:** Target STT transcription ≤ 200 ms partials; TTS first audio ≤ 200 ms. Real-time responsiveness matters for assisted call listening.
8. **Duo respect:** Do not touch Engineer B's statutory/Evon/UI files without notice, and vice versa — see the Ownership Treaty below.
9. **Comment for the next agent:** Every non-trivial function gets a one-line intent comment and references the mode/stage it belongs to.

---

## 6. Ownership Treaty Between Duo Engineers

The treaty border is `haqvaani/schemas.py` (`CitizenIntake`, `AgentNegotiationExtraction`, `HaqVaaniCaseRecord`, `ConsentRecord`).

| System Layer | Engineer A — Voice, DSP, Telephony & Latency | Engineer B — Statutory Engine, Evon v3.3 & Product UI |
| :--- | :--- | :--- |
| Audio & Telephony | Silero VAD, ring buffer, assisted-call listening UI | Supplies synthetic IVR scripts & test utterances |
| Reverse-IVR Cracker (SIMULATED ONLY) | DTMF generator & Goertzel decoder for simulated demo | Defines IVR action grammar (`IVRAction`) |
| Gnani Speech APIs | Prisma v2.5 WSS + Timbre v2.5/v3.0 SSE + role-switch caching | Tunes `bias_list` & Hinglish/English spoken cadences |
| Evon v3.3 & Schemas | Runs vLLM/SGLang server & latency benchmarks | Owns prompts, `BrushOffType` taxonomy & Pydantic v2 validators |
| Statutory & RB-IOS Layer | Enforces secret-redaction filter on outbound audio/text | Owns `compute_statutory_entitlement` + RB-IOS 2026 draft generator |
| Eval Harness & HUD | 30-clip noisy UTR/numeral WER benchmark (Prisma vs Whisper) | 4-quadrant Telemetry HUD + compliance/safety indicators |
| Compliance | TRAI A2P calling audit log | DPDP consent screen + disclosure text |

**Crossing the border:** Changes to `schemas.py` require both engineers' sign-off. All other files are owned as above; PRs touching another's files need a quick sync first.

---

## 7. File Pointers

- `RULES.md` — Non-negotiable legal, safety, challenge, and technical constraints (incl. TRAI/DPDP).
- `ARCHITECTURE.md` — 4-mode system, module ownership, data flow, assisted-call state machine.
- `ROADMAP.md` — 16-day ship plan (25 Oct → 10 Nov 2026).
- `TODO.md` — Current prioritized atomic tasks.
- `CHANGELOG.md` — Change log, initial version 2026-10-25.
- `README.md` — Project overview, stack, quick start, license.
- `CONTRIBUTING.md` — Guidelines for humans and AI agents.
- `docs/legal_matrix.md` — Exact statutory numbers, circular references, TRAI/DPDP compliance.
- `docs/latency_budget.md` — Target latencies and measurement.
- `docs/demo_storyboard.md` — Simulated 60-second Demo Day Drop storyboard.
- `docs/interview_qa.md` — Gnani interview Q&A with model answers.
- `docs/evaluation.md` — Success metrics (WER, latency, safety, compliance, demo quality).
- `docs/ui_ux_design_system.md` — Design system (glass + clay + accessibility).
- `docs/DESIGN.md` — "HaqVaani Story" design system — the frontend source of truth: two canvases (story/evidence), rail device, semantic colours, screen flow, accessibility rules. `frontend/landing.html`, `frontend/screens/*.html`, `frontend/css/*`, `frontend/js/{rail,router}.js` implement it; `scripts/_ui_integrity_check.py` enforces the shell contract.
