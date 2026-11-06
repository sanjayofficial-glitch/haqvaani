# CHANGELOG.md — HaqVaani (हक़-वाणी)

> Initial version dated 25 October 2026 (Day 1 of the 16-day ship plan).
> Format: date → summary of changes → files touched.

---

## [2026-10-25] — Day 1: Documentation foundation & repo scaffold (Human-Controlled Advocate Pivot)

### Added
- Complete documentation foundation for the Great Indian AI Internship Challenge (Gnani AI).
- `AGENTS.md` — master agent instructions: thesis (human-controlled advocate), hard rules (no autonomous dialing, TRAI/DPDP), current phase, stack, working method, duo ownership treaty.
- `RULES.md` — non-negotiable constraints: RBI/2019-20/67 & RB-IOS 2026 legal rules, TRAI 2026 A2P calling compliance, safety guards (secret redaction, consent, substring verification), challenge rules (synthetic data, model naming, no real recordings), technical constraints, free constraint.
- `ARCHITECTURE.md` — 4-mode pipeline (Voice Intake → Rights Checker → Complaint Builder → Assisted Call), module ownership matrix, data flow, assisted-call state machine (IDLE / LISTENING / SCRIPT_DISPLAY / DOCKET_CAPTURE / POST_CALL), key design decisions.
- `ROADMAP.md` — 16-day ship plan (25 Oct → 10 Nov 2026) with day-by-day goals and milestone checkpoints.
- `TODO.md` — current prioritized atomic tasks starting Day 1.
- `README.md` — professional project overview, stack, quick start, license.
- `CONTRIBUTING.md` — guidelines for human duo members and AI coding agents.
- `docs/legal_matrix.md` — exact statutory numbers, circular references, TRAI/DPDP compliance formulas.
- `docs/latency_budget.md` — target latencies and measurement.
- `docs/demo_storyboard.md` — simulated 60-second Demo Day Drop storyboard (16:9 + 9:16).
- `docs/interview_qa.md` — Gnani interview Q&A with model answers (incl. legal compliance).
- `docs/evaluation.md` — success metrics (WER, latency, safety, compliance, demo quality).
- `docs/ui_ux_design_system.md` — design system (glass + clay + accessibility) for assisted-call UI.
- `frontend/glass_ui.html` — citizen-facing voice interface (updated for assisted-call mode).
- `frontend/hud.html` — telemetry HUD (updated with compliance indicators).
- `agent_prompts/SHARED_CONTEXT.md` — common context for all agents.
- `agent_prompts/ENGINEER_A_PROMPT.md` — Engineer A: Voice, DSP, telephony & latency.
- `agent_prompts/ENGINEER_B_PROMPT.md` — Engineer B: Statutory engine, Evon v3.3 & product UI.
- Repo folder structure: docs/, haqvaani/, demo/, eval/, frontend/, tests/, agent_prompts/.

### Changed
- **Pivot:** HaqVaani is now a **human-controlled refund advocate**, not an autonomous reverse-IVR bot. No autonomous bank dialing. All bank interactions are simulated/synthetic for the hackathon.
- Architecture changed from 7-stage autonomous pipeline to 4-mode human-controlled pipeline.
- Added TRAI 2026 A2P calling compliance and DPDP Act 2023 consent requirements throughout.

### Removed
- Autonomous outbound bank calling stage.
- Real outbound IVR orchestration.

### Notes
- All statutory figures hardcoded in pure Python; never LLM-computed.
- Synthetic data only; no real phone numbers, accounts, Aadhaar, PAN, or recordings.
- Completely free: Gnani 5,000 credits + open-source tools + free GPU (Kaggle/Colab).

---

## [2026-11-06] — Day 13: Core vertical slice part 1 — pure-Python engine

### Added
- `haqvaani/schemas.py` — Pydantic v2 treaty-border models: `CitizenIntake`, `StatutoryEntitlement`, `AgentNegotiationExtraction`, `ConsentRecord`, `HaqVaaniCaseRecord`.
- `haqvaani/statutory.py` — deterministic `compute_statutory_entitlement()`: RBI/2019-20/67 (T+1/T+5, ₹100/day), DBR 2017-18 zero liability, RB-IOS 2026 filing clocks.
- `haqvaani/safety.py` — `FORBIDDEN_SECRET_RE`, consent/disclosure gates, verbatim docket verify, `SafetyGuardBlock`.
- `tests/test_statutory.py`, `tests/test_safety.py`; `pyproject.toml`; `conftest.py`; `.gitignore`; git initialized.

### Notes
- Statutory math matches `docs/legal_matrix.md` §1 worked example exactly: T=18 Oct, ₹3,200, today=25 Oct → TAT 19 Oct, 6 days overdue, ₹600 penalty, ₹3,800 total.
- No API credentials required for this slice; Gnani access + STT/TTS clients are the next dependency.
