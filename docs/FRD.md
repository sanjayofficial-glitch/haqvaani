# FRD.md — HaqVaani Functional Requirements

> Functional spec for the submission MVP. Each mode: trigger → processing → output → errors.
> All values synthetic; safety gates apply at every stage.

---

## 1. Mode 1 — Voice Intake

- **Trigger:** user records audio (16 kHz WAV) via `glass_ui.html` after consent.
- **Processing:** FastAPI receives file → `stt_client.py` streams via Prisma v2.5 WSS
  (`x-format=transcribe`, `lang_code=hi-IN`) → transcript → hosted Evon extracts JSON
  `CitizenIntake` (utr, amount_inr, txn_date, dispute_type, bank_name, confidence).
- **Output:** `CitizenIntake`.
- **Errors:** low confidence → ask to repeat; missing UTR → proceed with warning.
- **Safety:** consent + disclosure verified before this mode runs.

## 2. Mode 2 — Rights Checker

- **Trigger:** `CitizenIntake` available.
- **Processing:** `statutory.py.compute_statutory_entitlement()` (pure Python):
  - P2P/IMPS → T+1; P2M/ATM/PoS → T+5; ₹100/day beyond TAT.
  - Unauthorised → DBR 2017-18 zero liability (3 working-day report window).
  - If complaint_lodged_date given → RB-IOS 30-day window + 90-day filing clock.
- **Output:** `StatutoryEntitlement` (circular_ref, tat_date, days_overdue, penalty_inr,
  total_inr, eligible_for_rbi_cms, rbi_filing_deadline).
- **Errors:** txn_date in future or amount ≤0 → ValueError surfaced to UI.

## 3. Mode 3 — Complaint Builder

- **Trigger:** intake + entitlement available.
- **Processing:** `complaint_builder.py.build_complaint_draft()`:
  - bank complaint text (Hindi + English), WhatsApp draft, email draft, evidence checklist.
  - If `eligible_for_rbi_cms` → `rb_ios.py.build_rbi_cms_draft()` appended.
- **Output:** `ComplaintDraft`.
- **Safety:** every outbound string passes `assert_no_forbidden_secret`.

## 4. Mode 4 — Assisted Call (simulated)

- **Trigger:** user plays pre-recorded synthetic IVR clip (`demo/ivr_scripts/`).
- **Processing:**
  1. Prisma transcribes the clip (en-IN).
  2. Evon classifies brush-off (`BrushOffType`) + docket candidate.
  3. Script display: suggested counter-script (en-IN + hi-IN).
  4. `safety.verify_verbatim_substring(docket_candidate, transcript)` gate.
- **Output:** transcript, script, `verbatim_verified`, docket_id.
- **Safety:** docket recorded only if verbatim-verified.

## 5. Orchestration

- `orchestrator.py` exposes:
  - `run_rights(intake)` → entitlement
  - `run_complaint(intake, entitlement)` → draft
  - `run_assisted(ivr_path, intake, entitlement)` → call result
  - `run_full_case(intake, ivr_path, consent)` → `HaqVaaniCaseRecord`
- `run_full_case` **requires** `require_consent(consent)` (SafetyGuardBlock otherwise).
- `--self-test` runs a complete offline case with synthetic transcript (no API).

## 6. Backend API (FastAPI) — contract for glass_ui.html

| Endpoint | Method | Body | Returns |
| :--- | :--- | :--- | :--- |
| `/api/consent` | POST | {disclosure_played} | ConsentRecord |
| `/api/intake` | POST | multipart audio | CitizenIntake |
| `/api/rights` | POST | CitizenIntake | StatutoryEntitlement |
| `/api/complaint` | POST | intake + entitlement | ComplaintDraft |
| `/api/assisted` | POST | ivr audio + intake | call result |

## 7. Error handling

- JSON `{error: {code, message}}` for all 4xx/5xx.
- SafetyGuardBlock → 403 with code (CONSENT_REQUIRED, DISCLOSURE_REQUIRED,
  FORBIDDEN_SECRET).
- Network/API failures → 502 with retry hint.

## 8. Acceptance criteria

1. `python -m pytest tests -q` green (statutory, safety, complaint, orchestrator).
2. `python -m haqvaani.orchestrator --self-test` prints full case offline.
3. With real Gnani key: intake → rights → complaint → assisted roundtrip works.
4. Demo video runs the same flow with synthetic data, labels visible.
