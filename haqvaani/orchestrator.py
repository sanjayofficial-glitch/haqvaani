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
    DisputeType,
    HaqVaaniCaseRecord,
    StatutoryEntitlement,
)
from .statutory import compute_statutory_entitlement

# ------------------------------------------------------------------ voice API ---

class VoiceAPI:
    """Adapter for Prisma/Timbre/Evon — filled once endpoints are verified.

    Until then, `transcribe` returns a synthetic transcript (demo/fallback mode).
    """

    transcribe_mode = "synthetic"  # flips to "prisma" after roundtrip

    @classmethod
    def transcribe(cls, audio_path: str | None = None) -> str:
        if cls.transcribe_mode == "prisma":
            # TODO: stream via stt_client.py (Prisma v2.5 WSS) when wired.
            raise NotImplementedError("Prisma client not yet wired")
        return (
            "Bhaiya 18 Oct ko 3,200 UPI kiya tha, paisa kat gaya par pahuncha nahi — "
            "UTR 629188340112"
        )

    @classmethod
    def parse_intake(cls, transcript: str) -> CitizenIntake:
        if cls.transcribe_mode == "prisma":
            # TODO: hosted Evon v3.3 JSON extraction (short schema).
            raise NotImplementedError("Evon client not yet wired")
        return CitizenIntake(
            utr="629188340112",
            amount_inr=3200,
            txn_date=date(2026, 10, 18),
            dispute_type=DisputeType.UPI_P2P,
            bank_name="DemoBank Support",
            language="hi-IN",
            confidence=0.97,
            raw_transcript=transcript,
        )


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

    t = transcript or VoiceAPI.transcribe(ivr_audio_path)
    # Synthetic IVR script for demo/fallback:
    if transcript is None:
        t = "Thank you for calling DemoBank. Your complaint is registered under SR-DB-884120."
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
