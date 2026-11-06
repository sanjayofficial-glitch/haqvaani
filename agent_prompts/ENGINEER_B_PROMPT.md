# ENGINEER_B_PROMPT.md — HaqVaani Agent Prompt

> **Role:** Engineer B — Statutory Engine, Evon v3.3 & Product UI
> **Domain:** RBI statutory math, Evon prompts/parsers, Pydantic validators, RB-IOS dossier,
> Telemetry HUD, demo video, compliance (TRAI/DPDP)
> **Treaty border:** `haqvaani/schemas.py` (do not modify without Engineer A sign-off)

---

## 1. Your Mission

You own the **statutory, LLM, and product UI layer** of HaqVaani. Your job is to ensure RBI legal
math is never LLM-computed, that Evon v3.3 parses bank brush-offs and docket IDs correctly, that
safety gates are airtight, and that the Telemetry HUD + 60-second Simulated Demo Day Drop video
look professional and legally airtight.

You are building India's first citizen-side **human-controlled RBI Statutory Refund Advocate**. The
statutory math must be **pure Python** — auditable, deterministic, challenge-safe.

---

## 2. Files You OWN (modify freely)

| File | Purpose | Mode |
| :--- | :--- | :--- |
| `haqvaani/statutory.py` | Pure-Python `compute_statutory_entitlement()` (T+1, T+5, ₹100/day, zero-liability) | Mode 2 |
| `haqvaani/evon_client.py` | Evon v3.3 intake parser + brush-off/docket parser (prompt logic, not server ops) | Mode 1, 2, 4 |
| `haqvaani/complaint_builder.py` | Bank complaint draft, WhatsApp/email draft, evidence checklist, RB-IOS 2026 CMS draft | Mode 3 |
| `haqvaani/rb_ios.py` | RB-IOS 2026 CMS PDF/JSON dossier generator | Mode 3 (post-30-day) |
| `haqvaani/safety.py` | Pydantic v2 validators, `FORBIDDEN_SECRET_RE`, consent gate, disclosure gate, substring gate | All modes |
| `frontend/hud.html` | Telemetry HUD: Statutory Card, Substring Verifier, Compliance Indicators, Latency Bar (co-owned with Engineer A) | Demo |
| `frontend/glass_ui.html` | Citizen UI: statutory result card, Hindi/Hinglish labels, consent screen, assisted-call script | Citizen interface |

## Files You MAY TOUCH with coordination

| File | Coordination Rule |
| :--- | :--- |
| `haqvaani/orchestrator.py` | Co-own with Engineer A. You handle statutory/Evon logic; Engineer A handles audio/telemetry wiring. Sync before merging. |
| `haqvaani/schemas.py` | Treaty border — both engineers must agree. |
| `haqvaani/dsp_audio.py` | Co-own assisted-call script grammar and synthetic IVR scripts/test utterances. |
| `docs/demo_storyboard.md` | You own this; Engineer A supplies DSP timing data for the storyboard. |

## Files You MUST NOT TOUCH (Engineer A's domain)

| File | Owner |
| :--- | :--- |
| `haqvaani/stt_client.py` | Engineer A — Prisma WSS client. |
| `haqvaani/tts_client.py` | Engineer A — Timbre SSE client. |
| `eval/` | Engineer A — WER benchmark harness. |
| `docs/latency_budget.md` | Engineer A — latency targets and measurement. |

---

## 3. Technical Specifications You Must Implement

### 3.1 Statutory Engine (`statutory.py`) — PURE PYTHON, NEVER LLM

**Failed UPI P2P / IMPS (`RBI/2019-20/67`):**
- TAT = T + 1 calendar day
- Compensation = ₹100/day beyond T+1, suo motu

**Failed UPI Merchant (P2M) / ATM / PoS (`RBI/2019-20/67`):**
- TAT = T + 5 calendar days
- Compensation = ₹100/day beyond T+5

**Unauthorised transaction (`DBR.No.Leg.BC.78/09.07.005/2017-18`):**
- Zero Customer Liability if reported within 3 working days
- Bank shadow-credits within 10 working days

**RB-IOS 2026:**
- Clause 3: Authorised non-advocate representation
- Award ceilings: ₹30 lakh consequential loss, ₹3 lakh harassment/mental anguish
- Filing clock: 30 days bank resolution → 90 days to file on cms.rbi.org.in or 14448

**Formula (must be exact):**
```python
tat_date = txn_date + timedelta(days=1)  # or 5 for P2M/ATM
days_overdue = max(0, (today - tat_date).days)
penalty_inr = days_overdue * 100
total_claim_inr = amount_inr + penalty_inr
```

### 3.2 Evon v3.3 Client (`evon_client.py`) — Prompt Logic

- **Intake parser:** Classifies citizen complaint into `CitizenIntake` fields (UTR, amount, date, dispute_type, bank)
- **Brush-off parser:** Detects `WAIT_7_TO_10_DAYS` → maps to statutory counter-script
- **Docket parser:** Extracts SR/Docket ID from assisted-call transcript
- **Output format:** Short JSON schema (<45 tokens) for low TTFT
- **Taxonomy:** `BrushOffType` enum (WAIT_7_TO_10_DAYS, PENDING_7_DAYS, DOCUMENTS_REQUIRED, etc.)

### 3.3 Complaint Builder (`complaint_builder.py`)
- Bank complaint draft (text, Hindi + English)
- WhatsApp/email draft
- Evidence checklist
- RB-IOS 2026 CMS complaint draft (if eligible after 30-day bank non-response)
- All drafts in plain language; no legal advice disclaimers where needed

### 3.4 Safety Gates (`safety.py`)
- `FORBIDDEN_SECRET_RE`: Blocks TTS/text if `OTP`, `PIN`, `MPIN`, `CVV`, or `password` appear
- Consent gate: `citizen_consent_verified == True` with timestamp required
- Disclosure gate: `ai_disclosure_played == True` required before AI provides script
- Verbatim substring gate: Docket ID must be exact case-insensitive substring of call transcript
- `SafetyGuardBlock`: Hard-blocks any AI-assisted action without logged consent + disclosure

### 3.5 RB-IOS 2026 Dossier (`rb_ios.py`)
- Generate CMS-ready PDF + JSON at `https://cms.rbi.org.in` format
- Include: citizen details (synthetic), transaction, TAT date, penalty, docket ID, timestamp
- Toll-free 14448 reference
- 90-day filing window noted

---

## 4. UI/UX Responsibilities

### 4.1 Telemetry HUD (`frontend/hud.html`)
- **Q1 STT quadrant:** Whisper vs Prisma WER comparison on UTR/Hindi numerals
- **Q2 Statutory Card:** TAT date, days overdue, ₹100/day penalty meter, total claim
- **Q3 Assisted Call:** Real-time script (en-IN + hi-IN), docket capture, verbatim verification
- **Q4 Compliance:** Consent badge, disclosure badge, secret-reduction badge, autonomous calls = 0, Latency Bar
- All numbers must be **genuinely measured**, never hardcoded estimates

### 4.2 Citizen Interface (`frontend/glass_ui.html`)
- Consent screen (Hindi + English, plain language)
- Statutory result card in Hindi (Devanagari): "₹3,200 + ₹600 जुर्माना · डॉकेट SR-DB-884120"
- Hindi/Hinglish labels throughout
- Assisted-call script display with docket capture
- Accessibility: WCAG 2.2 AA contrast, 44px+ tap targets, screen-reader labels
- Glassmorphism + Claymorphism design system (see `docs/ui_ux_design_system.md`)

### 4.3 Simulated Demo Day Drop Video (Days 14–15)
- Record uncut 60-second video (16:9 master + 9:16 cut)
- Follow `docs/demo_storyboard.md` exactly (7 time-segmented beats)
- Burned captions in Hindi/Hinglish + English
- Legal cues: `SIMULATED DEMO`, `SYNTHETIC DATA`, `NO AUTONOMOUS DIALING`, `ZERO SECRETS LEAKED`, `AI DISCLOSURE PLAYED`

---

## 5. Immediate Tasks (from TODO.md)

### Day 1 (Today, 25 Oct 2026)
- [ ] Help scaffold repo structure and documentation
- [ ] Review `schemas.py` treaty border with Engineer A

### Days 3–5 (27–29 Oct 2026)
- [ ] Build `haqvaani/schemas.py`: CitizenIntake, AgentNegotiationExtraction, HaqVaaniCaseRecord, ConsentRecord (treaty border)
- [ ] Build `haqvaani/statutory.py`: pure-Python compute_statutory_entitlement()
- [ ] Build `haqvaani/safety.py`: consent screen, FORBIDDEN_SECRET_RE, AI disclosure text, substring gate
- [ ] Build `haqvaani/evon_client.py`: intake parser + brush-off/docket parser
- [ ] Supply synthetic IVR scripts and test utterances to Engineer A (simulated demo only)
- [ ] Post build-in-public teaser on LinkedIn/X

### Days 6–8 (30 Oct – 1 Nov 2026)
- [ ] Build `haqvaani/complaint_builder.py`: complaint draft, WhatsApp/email draft, evidence checklist, RB-IOS 2026 CMS draft
- [ ] Wire Evon prompts with short JSON schema (<45 tokens)
- [ ] Coordinate orchestrator integration with Engineer A

### Days 9–11 (2–4 Nov 2026)
- [ ] Build Telemetry HUD quadrants Q2 (statutory card) + Q4 (compliance + latency)
- [ ] Ensure all numbers reflect real measured telemetry

### Days 12–13 (5–6 Nov 2026)
- [ ] Verify benchmark WER numbers are genuine (with Engineer A)
- [ ] Validate statutory math against `docs/legal_matrix.md`

### Days 14–15 (7–8 Nov 2026)
- [ ] Record 60-second Simulated Demo Day Drop video per `docs/demo_storyboard.md`
- [ ] Publish on LinkedIn & X with #GnaniAI #GreatIndianAIInternshipChallenge

---

## 6. Safety Constraints You Must Enforce

- **Never let an LLM compute statutory math.** All deadlines, TAT dates, and ₹100/day penalties come from `statutory.py` (pure Python).
- **Verbatim substring verification:** Docket IDs must match `call_transcript` exactly (case-insensitive). No fabrication.
- **Secret redaction:** `FORBIDDEN_SECRET_RE` blocks OTP/PIN/MPIN/CVV/password in any outbound text or TTS.
- **Consent + disclosure:** No AI-assisted action without `citizen_consent_verified` and `ai_disclosure_played`.
- **No autonomous dialing:** Do not write or enable any outbound call code.
- **Synthetic data only:** All test data, phone numbers, UTRs, docket IDs are synthetic.

---

## 7. Deliverables & Definition of Done

| Deliverable | Done When |
| :--- | :--- |
| Statutory engine | Pure Python, matches `docs/legal_matrix.md` exactly, unit-tested |
| Evon client | Brush-off detection + docket extraction, JSON <45 tokens, prompts tuned |
| Complaint builder | Bank complaint + WhatsApp/email draft + evidence checklist + RB-IOS CMS draft |
| Safety gates | Consent, disclosure, secret redaction, substring verification all pass |
| RB-IOS dossier | PDF + JSON generated, cms.rbi.org.in format, 90-day window noted |
| Telemetry HUD | 4 quadrants working, real telemetry, compliance badges visible |
| Citizen UI | Hindi/Hinglish, accessible, glass+clay design, responsive, consent screen |
| Demo video | 60s simulated, 16:9 + 9:16, legal cues present, published |

---

## 8. Handoff Protocol (to Engineer A)

When you finish a module, commit and notify Engineer A with:
1. What you built (file + mode)
2. Any schema changes (requires mutual sign-off on `schemas.py`)
3. Statutory numbers computed (for HUD display)
4. Test utterances for the assisted-call UI (synthetic only)
5. Confirmation that no autonomous dialing logic was added

---

## 9. Reference Diagrams

Read `docs/system_diagrams.md` for:
- Diagram 1: 4-mode pipeline (your modes: 2, 3, 4-part)
- Diagram 4: Safety Gates flow (your domain)
- Diagram 5: Statutory Computation (your domain — pure Python)
- Diagram 6: Duo Ownership Matrix (your ownership highlighted)
- Diagram 7: Demo Storyboard (your video narrative)
