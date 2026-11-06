# ARCHITECTURE.md — HaqVaani System Architecture

> Detailed system architecture: 4-mode pipeline, module ownership, data flow, key design decisions,
> and the assisted-call state machine. Any future agent should be able to rebuild the system from
> this file plus `RULES.md` and `AGENTS.md`.

---

## 1. Overview

HaqVaani is a **human-controlled RBI Statutory Refund Advocate** with four modes. It does **not**
autonomously call banks. The citizen remains the caller and decision-maker; HaqVaani provides
language support, correct RBI-rule calculations, evidence organization, and a clear complaint trail.

**Four Modes:**
1. **Voice Intake** — Citizen speaks Hinglish complaint; Prisma v2.5 transcribes; Evon extracts facts.
2. **Rights Checker** — Pure-Python deterministic engine computes RBI TAT, days overdue, ₹100/day penalty.
3. **Complaint Builder** — Generates bank complaint draft, WhatsApp/email draft, evidence checklist, and RBI CMS 2026 draft.
4. **Assisted Call Mode** — User calls the bank themselves; HaqVaani listens, shows a real-time script, captures the docket number, and summarizes after.

All bank interactions in the hackathon demo are **simulated/synthetic**. No autonomous dialing.

---

## 2. The 4-Mode Pipeline

```text
[MODE 1: VOICE INTAKE — 8 kHz Noisy Hindi/Hinglish/Regional]
   │
   ▼  DSP: 8→16 kHz FIR resample, Silero VAD 220 ms hangover, ring buffer
   │
   ▼  [Prisma v2.5 WSS Stream #1 — STT, hi-IN/en-IN, x-format=transcribe, ITN digits]
   │
   ▼  [Evon v3.3 Intake Parser — CitizenIntake: UTR, amount, date, dispute_type, bank]
   │
   ▼  [MODE 2: RIGHTS CHECKER — Pure Python statutory.py]
   [StatutoryEntitlement] ──► TAT date | Days overdue | Claim + ₹100/day penalty
   │
   ▼  [MODE 3: COMPLAINT BUILDER — rb_ios.py + safety.py]
   [ComplaintDraft] ──► Bank complaint draft | WhatsApp/email draft | Evidence checklist
                         │ RBI CMS 2026 draft (if eligible after 30-day bank window)
   │
   ▼  [MODE 4: ASSISTED CALL MODE — user dials bank, HaqVaana listens]
   │
   ▼  User places call to bank IVR on their phone
   │
   ▼  HaqVaani listens via device mic/speaker (Prisma Stream #2, en-IN transcript)
   │
   ▼  Real-time script display: "Say: Under RBI/2019-20/67, T+1 passed on..."
   │
   ▼  Docket capture: User reads SR ID → HaqVaani verifies verbatim substring
   │
   ▼  Post-call summary: Timbre TTS (hi-IN) + complaint record saved
   │
   ▼  [OUTPUT: HaqVaaniCaseRecord + RBI CMS dossier ready to file]
```

### Mode 1 — Voice Intake (Engineer A)
- Input: 8 kHz microphone audio with street-traffic ambience.
- Resample 8→16 kHz (FIR), Silero VAD (220 ms hangover), ring buffer (200 ms / 60 ms).
- Stream to Prisma v2.5 WSS.
- Output: `CitizenIntake` (UTR, amount, date, language, confidence).

### Mode 2 — Rights Checker (Engineer B)
- Evon v3.3 classifies complaint into `CitizenIntake` fields and `DisputeType`.
- Pure-Python `compute_statutory_entitlement()` computes TAT date, days overdue, claim, and
  ₹100/day penalty. Never LLM-computed.
- Output: `StatutoryEntitlement`.

### Mode 3 — Complaint Builder (Engineer B)
- Generates bank complaint draft (text), WhatsApp/email draft, evidence checklist.
- If eligible after 30-day bank non-response: generates RB-IOS 2026 CMS complaint draft.
- Safety gates: consent, disclosure, secret redaction applied before any draft is shown.

### Mode 4 — Assisted Call (Engineer A lead, Engineer B script grammar)
- User dials bank on their phone; HaqVaani listens via device microphone/speaker.
- Prisma Stream #2 transcribes en-IN bank audio in real time.
- Evon v3.3 parses brush-offs (`WAIT_7_TO_10_DAYS`) and suggests statutory counter-script.
- UI displays script for user to read: "Say: Under RBI/2019-20/67, T+1 passed on 19 Oct; ₹600 penalty accrued."
- User reads SR ID aloud → HaqVaani verifies as verbatim substring of transcript.
- Post-call: Timbre TTS (hi-IN) summarizes outcome; `HaqVaaniCaseRecord` saved.

---

## 3. Module Ownership Matrix

| Module | File | Owner | Mode |
| :--- | :--- | :--- | :--- |
| Schemas | `haqvaani/schemas.py` | Both (treaty border) | All |
| Statutory engine | `haqvaani/statutory.py` | Engineer B | 2 |
| DSP / audio | `haqvaani/dsp_audio.py` | Engineer A | 1, 4 |
| STT client | `haqvaani/stt_client.py` | Engineer A | 1, 4 |
| TTS client | `haqvaani/tts_client.py` | Engineer A | 4 (post-call summary) |
| Evon client | `haqvaani/evon_client.py` | Engineer B | 1, 2, 4 |
| Complaint builder | `haqvaani/complaint_builder.py` | Engineer B | 3 |
| Safety / consent | `haqvaani/safety.py` | Both | All |
| RB-IOS draft | `haqvaani/rb_ios.py` | Engineer B | 3 |
| Orchestrator (mode switcher) | `haqvaani/orchestrator.py` | Both | All |
| Eval harness | `eval/` | Engineer A | Benchmark |
| Telemetry HUD + compliance | `frontend/` | Engineer B | Demo |

---

## 4. Data Flow (key objects)

```
Raw 8 kHz audio (citizen speaking complaint)
   │ (Mode 1 DSP)
   ▼
VAD segments (16 kHz PCM)
   │ (Mode 1 Prisma WSS #1, x-format=transcribe)
   ▼
CitizenIntake { utr, amount, txn_date, lang, confidence, dispute_type, bank }
   │ (Mode 2 Evon + statutory.py — PURE PYTHON)
   ▼
StatutoryEntitlement { tat_date, days_overdue, claim_inr, penalty_inr, total_inr, eligible_for_rbi }
   │ (Mode 3 Complaint Builder)
   ▼
ComplaintDraft { bank_complaint_text, whatsapp_draft, email_draft, evidence_checklist, rbi_cms_draft }
   │ (Mode 4 Assisted Call — user dials bank)
   ▼
CallTranscript { en-IN utterances, brush_off_type, docket_id_candidate }
   │ (Mode 4 verbatim substring gate + safety)
   ▼
HaqVaaniCaseRecord { citizen_intake, statutory_entitlement, complaint_draft,
                     call_transcript, verbatim_verified, docket_id, consent_verified,
                     disclosure_played, call_summary_hi }
   │ (Post-call: Timbre hi-IN summary + RB-IOS draft if eligible)
   ▼
Citizen Summary (audio) + Complaint Dossier (PDF/JSON)
```

---

## 5. Assisted-Call State Machine (Mode 4)

States: `IDLE` | `LISTENING` | `SCRIPT_DISPLAY` | `DOTT_CAPTURE` | `POST_CALL`

Transitions:
- `IDLE → LISTENING`: User starts call, taps "Start Assisted Call" in HaqVaani.
- `LISTENING → SCRIPT_DISPLAY`: Evon detects bank IVR menu or brush-off; suggests script.
- `SCRIPT_DISPLAY → DOCKET_CAPTURE`: Bank agent reads out SR/Docket ID; user confirms.
- `DOCKET_CAPTURE → POST_CALL`: Call ends; HaqVaani generates summary.
- `POST_CALL → IDLE`: User saves dossier or starts new case.

Per-state behavior:
- `IDLE`: Show rights checker result and complaint draft.
- `LISTENING`: Stream audio to Prisma #2; display live transcript; VAD active.
- `SCRIPT_DISPLAY`: Show Evon-suggested script in en-IN + hi-IN; user reads aloud.
- `DOCKET_CAPTURE`: Verify docket ID as exact case-insensitive substring of transcript.
- `POST_CALL`: Generate Timbre hi-IN summary; save `HaqVaaniCaseRecord`.

---

## 6. Key Design Decisions & Why

| Decision | Rationale |
| :--- | :--- |
| Human-controlled advocate (not autonomous bot) | Avoids TRAI A2P calling regulations, consent/fraud concerns, and unauthorized representation issues. Citizen remains the caller and decision-maker. |
| No autonomous outbound calls | Eliminates telecom compliance risk for hackathon and v1. Simulated IVR for demo only. |
| Four modes instead of 7-stage autonomous pipeline | Simpler, legally safer, matches "assisted call" product design. |
| Pure-Python statutory math | Legal deadlines/penalties must never be LLM-improvised. Auditable, deterministic, challenge-safe. |
| Simulated DemoBank + pre-recorded audio | Satisfies "synthetic data only, no real numbers/recordings, no misleading demos" while demonstrating full Gnani stack. |
| Verbatim substring docket gate | Prevents fabricating SR/Docket IDs; aligns with RB-IOS 2026 Clause 3. |
| Secret redaction + consent gate | DPDP Act 2023 + RB-IOS 2026 compliance; never speaks OTP/PIN/CVV/password. |
| Free-only stack | 5,000 Gnani credits + open source + Colab/Kaggle GPU; no paid infra. |
| vLLM/SGLang on spot GPU for Evon | 302 ms TTFT at 257 tok/s; short JSON schema (<45 tokens); prefix-cached system prompt. |
