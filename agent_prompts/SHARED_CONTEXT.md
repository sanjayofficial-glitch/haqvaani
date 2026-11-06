# SHARED_CONTEXT.md — HaqVaani Common Context (All Agents)

> Read this first, then read your role-specific prompt. This file contains the project thesis, hard
> rules, current phase, stack, and the treaty border that both engineers must respect.

---

## 1. Project Thesis

HaqVaani (हक़-वाणी) is India's first citizen-side **RBI Statutory Refund Advocate** — a
**human-controlled** voice assistant that helps non-English-speaking citizens recover money lost to
failed UPI transactions ("money deducted but not received"). HaqVaani listens to the citizen's
noisy Hinglish complaint, computes the exact RBI statutory deadline and ₹100/day compensation
deterministically in Python, builds a complaint dossier, and — in **Assisted Call Mode** — listens
while the citizen calls the bank themselves, shows what to say, captures the docket number, and
summarizes the call afterward. **HaqVaani never autonomously dials the bank.** The citizen remains
the caller and decision-maker; HaqVaani supplies language support, correct RBI-rule calculations,
evidence organization, and a clear complaint trail.

Built for the **Great Indian AI Internship Challenge by Gnani AI** (deadline: 10 November 2026,
11:59 PM IST).

---

## 2. Gnani Sovereign Stack (free only)

| Layer | Model / Tool | Purpose |
| :--- | :--- | :--- |
| STT | Gnani Prisma v2.5 (WebSocket) | 8 kHz Indian telephony, ITN digits, <200 ms partials |
| LLM | Gnani Evon v3.3 (30B-A3B MoE) | Structured JSON extraction, brush-off parsing, Apache-2.0 open weights |
| TTS | Gnani Timbre v2.5/v3.0 (SSE) | en-IN + hi-IN, <100–200 ms TTFA, role-switch caching |
| Credits | 5,000 free Gnani programme credits | Track usage; never exceed |

---

## 3. Hard Rules (from RULES.md)

- **No autonomous dialing:** HaqVaani must never make real outbound calls to banks or any third party. All bank interactions in the demo are simulated/synthetic. In production v1, the user dials the bank; HaqVaani only listens and assists (user-controlled).
- **AI disclosure:** Any AI-assisted communication must state: "This is an AI assistant assisting [user name]." Never impersonate the user.
- **Consent:** Timestamped, explicit consent is required before the AI speaks on the user's behalf or processes their voice data (DPDP Act 2023).
- **Synthetic data only:** No real phone numbers, bank accounts, Aadhaar, PAN, real UTRs, or recorded calls. Synthetic placeholders: `UTR 629188340112`, `SR-DB-884120`, `+91-90000-00000`.
- **Statutory math:** Pure Python only in `haqvaani/statutory.py`. Never LLM-computed.
- **Secret redaction:** `FORBIDDEN_SECRET_RE` (blocks OTP/PIN/MPIN/CVV/password).
- **Free constraint:** Zero paid infrastructure. Gnani credits + open-source + free GPU (Kaggle/Colab).
- **No misleading demos:** Label all bank interactions as "Simulated IVR / synthetic demo."

---

## 4. Current Phase

**Day 1 of 16 — Foundation & Sprint 0** (25 October 2026 → 10 November 2026).
Immediate goal: Gnani credentials, Prisma + Timbre roundtrip, repo scaffold.

---

## 5. Treaty Border (shared file)

**File:** `haqvaani/schemas.py` — Contains `CitizenIntake`, `AgentNegotiationExtraction`,
`HaqVaaniCaseRecord`, `ConsentRecord`.
**Rule:** Changes to `schemas.py` require **both engineers' sign-off**.

---

## 6. File Pointers (read these)

| File | Purpose |
| :--- | :--- |
| `AGENTS.md` | Master agent instructions |
| `RULES.md` | Non-negotiable legal/safety/challenge constraints (incl. TRAI/DPDP) |
| `ARCHITECTURE.md` | 4-mode pipeline, module ownership, assisted-call state machine |
| `ROADMAP.md` | 16-day ship plan |
| `TODO.md` | Prioritized atomic tasks |
| `CHANGELOG.md` | Change log (update when you make changes) |
| `CONTRIBUTING.md` | Human duo + AI agent guidelines |
| `docs/legal_matrix.md` | Exact statutory numbers, circulars, TRAI/DPDP compliance |
| `docs/latency_budget.md` | 690 ms post-VAD budget |
| `docs/demo_storyboard.md` | Simulated 60-second demo storyboard |
| `docs/interview_qa.md` | Gnani interview Q&A with model answers |
| `docs/evaluation.md` | Success metrics |
| `docs/ui_ux_design_system.md` | Design system (glass + clay + accessibility) |
| `docs/system_diagrams.md` | Mermaid diagrams of all connections |

---

## 7. How to Work

1. Pick the top `todo` task from `TODO.md`. Mark `in progress` → `done`.
2. Implement, test, update `CHANGELOG.md` in the same change.
3. Comment every non-trivial function with intent + mode/stage it belongs to.
4. Profile latency before optimizing (target ≤ 690 ms post-VAD for voice intake).
5. When you change architecture/stack/rules, update `ARCHITECTURE.md`, `RULES.md`, `AGENTS.md`
   together.
6. Never implement autonomous outbound calling — it violates TRAI 2026 and challenge rules.
