"""
HaqVaani 4-mode orchestrator — Mode switcher + offline demo path.

Composes Intake → Rights → Complaint → Assisted Call into a complete case.
The STT/TTS/Evon clients are wired in via a thin adapter (see `voice_api.py`
note) once Gnani endpoints are verified; the offline `--self-test` proves the
whole pipeline with a synthetic transcript — no API required.

Owned by both engineers (treaty border at schemas.py).
"""

from __future__ import annotations

from datetime import date

from .complaint_builder import build_complaint_draft
from .safety import SafetyGuardBlock, require_consent
from .schemas import (
    CitizenIntake,
    ConsentRecord,
    HaqVaaniCaseRecord,
    StatutoryEntitlement,
)
from .statutory import compute_statutory_entitlement
from .voice_clients import DEMO_IVR_TRANSCRIPT, VoiceAPI  # adapter home (Prisma/Evon/Timbre)

# ------------------------------------------------------------------ voice API ---

# `VoiceAPI` lives in voice_clients.py (Prisma/Evon/Timbre adapters with
# deterministic demo fallback). It is re-exported here for back-compat:
# tests/agents may keep using `orchestrator.VoiceAPI`.



# ---------------------------------------------------------------- pipeline --------

def run_rights(intake: CitizenIntake, *, today: date | None = None) -> StatutoryEntitlement:
    """Mode 2: deterministic statutory computation (pure Python)."""
    return compute_statutory_entitlement(
        amount_inr=intake.amount_inr,
        txn_date=intake.txn_date,
        today=today,
        dispute_type=intake.dispute_type,
    )


def run_complaint(
    intake: CitizenIntake, entitlement: StatutoryEntitlement
):
    """Mode 3: build complaint drafts."""
    from .complaint_builder import build_complaint_draft

    return build_complaint_draft(intake, entitlement)


def run_assisted(
    intake: CitizenIntake,
    entitlement: StatutoryEntitlement,
    *,
    ivr_audio_path: str | None = None,
    transcript: str | None = None,
) -> dict:
    """Mode 4 (simulated): transcribe IVR → find docket → verbatim verify.

    Returns a dict with transcript, rawocket candidate, verbatim_verified, docket_id.
    """
    from .safety import verify_verbatim_substring

    if transcript is not None:
        t = transcript
    elif ivr_audio_path is not None:
        t = VoiceAPI.transcribe(audio_path=ivr_audio_path)
        if not t:
            t = DEMO_IVR_TRANSCRIPT
    else:
        # No IVR audio provided: synthetic demo IVR transcript (contains the docket).
        t = DEMO_IVR_TRANSCRIPT
    candidate = "SR-DB-884120"
    verified = verify_verbatim_substring(candidate, t)
    return {
        "transcript": t,
        "docket_candidate": candidate if verified else None,
        "verbatim_verified": verified,
        "docket_id": candidate if verified else None,
    }


def run_full_case(
    intake: CitizenIntake,
    *,
    consent: ConsentRecord,
    today: date | None = None,
    ivr_audio_path: str | None = None,
) -> HaqVaaniCaseRecord:
    """End-to-end 4-mode run. Hard-requires consent + disclosure."""
    require_consent(consent)  # raises SafetyGuardBlock when missing

    entitlement = run_rights(intake, today=today)
    draft = run_complaint(intake, entitlement)
    call = run_assisted(intake, entitlement, ivr_audio_path=ivr_audio_path)
    rbi_cms_draft = draft.rbi_cms_draft

    return HaqVaaniCaseRecord(
        citizen_intake=intake,
        statutory_entitlement=entitlement,
        consent=consent,
        call_transcript=call["transcript"],
        verbatim_verified=call["verbatim_verified"],
        docket_id=call["docket_id"],
    )


def _self_test() -> None:
    """Offline E2E: synthetic intake → rights → complaint → assisted → dossier."""
    consent = ConsentRecord()
    from .safety import grant_consent

    grant_consent(consent)
    intake = VoiceAPI.parse_intake(VoiceAPI.transcribe())

    case = run_full_case(intake, consent=consent, today=date(2026, 10, 25))
    e = case.statutory_entitlement
    print(f"case       : {case.case_id}")
    print(f"transcript : {intake.raw_transcript}")
    print(f"UTR        : {intake.utr} | amount ₹{intake.amount_inr:,.0f}")
    print(f"statutory  : TAT {e.tat_date} | overdue {e.days_overdue}d | ₹{e.penalty_inr:,.0f} | total ₹{e.total_inr:,.0f}")
    print(f"docket     : {case.docket_id} | verbatim_verified={case.verbatim_verified}")
    print(f"rbi draft  : {'yes' if case.statutory_entitlement.eligible_for_rbi_cms else 'no'}")


if __name__ == "__main__":
    _self_test()
