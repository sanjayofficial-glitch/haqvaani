"""Orchestrator tests — offline E2E pipeline + consent gate."""

from datetime import date

import pytest

from haqvaani.orchestrator import (
    VoiceAPI,
    run_assisted,
    run_full_case,
    run_rights,
)
from haqvaani.safety import SafetyGuardBlock, grant_consent
from haqvaani.schemas import CitizenIntake, ConsentRecord, DisputeType


def _synthetic_intake() -> CitizenIntake:
    """Explicit complete intake (documented synthetic demo values)."""
    return CitizenIntake(
        utr="629188340112",
        amount_inr=3200.0,
        txn_date=date(2026, 10, 18),
        dispute_type=DisputeType.UPI_P2P,
        bank_name=None,
        language="hi-IN",
        confidence=1.0,
        raw_transcript="Bhaiya 18 Oct ko 3,200 UPI kiya tha — UTR 629188340112",
    )


def test_offline_intake_synthetic():
    intake = _synthetic_intake()
    assert intake.utr == "629188340112"
    assert intake.amount_inr == 3200
    assert intake.dispute_type is DisputeType.UPI_P2P


def test_live_empty_transcript_stays_honest():
    """No transcript → no invented facts (None fields, never demo constants)."""
    intake = VoiceAPI.parse_intake("")
    assert intake.utr is None
    assert intake.amount_inr is None
    assert intake.txn_date is None
    assert intake.dispute_type is None


def test_run_rights_matches_legal_matrix():
    intake = _synthetic_intake()
    e = run_rights(intake, today=date(2026, 10, 25))
    assert e.days_overdue == 6
    assert e.penalty_inr == 600
    assert e.total_inr == 3800


def test_full_case_requires_consent():
    intake = _synthetic_intake()
    with pytest.raises(SafetyGuardBlock):
        run_full_case(intake, consent=ConsentRecord())


def test_full_case_offline_e2e():
    intake = _synthetic_intake()
    consent = ConsentRecord()
    grant_consent(consent)
    case = run_full_case(intake, consent=consent, today=date(2026, 10, 25))
    assert case.docket_id == "SR-DB-884120"
    assert case.verbatim_verified is True
    assert case.statutory_entitlement.total_inr == 3800
    assert case.citizen_intake.utr == "629188340112"


def test_assisted_verifies_verbatim():
    result = run_assisted(
        _synthetic_intake(),
        run_rights(_synthetic_intake()),
        transcript="registered under SR-DB-884120 today",
    )
    assert result["verbatim_verified"] is True
    assert result["docket_id"] == "SR-DB-884120"
