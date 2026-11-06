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
from haqvaani.schemas import ConsentRecord, DisputeType


def test_offline_intake_synthetic():
    intake = VoiceAPI.parse_intake(VoiceAPI.transcribe())
    assert intake.utr == "629188340112"
    assert intake.amount_inr == 3200
    assert intake.dispute_type is DisputeType.UPI_P2P


def test_run_rights_matches_legal_matrix():
    intake = VoiceAPI.parse_intake(VoiceAPI.transcribe())
    e = run_rights(intake, today=date(2026, 10, 25))
    assert e.days_overdue == 6
    assert e.penalty_inr == 600
    assert e.total_inr == 3800


def test_full_case_requires_consent():
    intake = VoiceAPI.parse_intake(VoiceAPI.transcribe())
    with pytest.raises(SafetyGuardBlock):
        run_full_case(intake, consent=ConsentRecord())


def test_full_case_offline_e2e():
    intake = VoiceAPI.parse_intake(VoiceAPI.transcribe())
    consent = ConsentRecord()
    grant_consent(consent)
    case = run_full_case(intake, consent=consent, today=date(2026, 10, 25))
    assert case.docket_id == "SR-DB-884120"
    assert case.verbatim_verified is True
    assert case.statutory_entitlement.total_inr == 3800
    assert case.citizen_intake.utr == "629188340112"


def test_assisted_verifies_verbatim():
    result = run_assisted(
        VoiceAPI.parse_intake(VoiceAPI.transcribe()),
        run_rights(VoiceAPI.parse_intake(VoiceAPI.transcribe())),
        transcript="registered under SR-DB-884120 today",
    )
    assert result["verbatim_verified"] is True
    assert result["docket_id"] == "SR-DB-884120"
