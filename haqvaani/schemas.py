"""
HaqVaani shared schemas — the treaty border between Engineer A (Voice/DSP) and
Engineer B (Statutory/Evon/UI). Changes here require both engineers' sign-off.

All models are Pydantic v2. All values are synthetic/test data — never real PII.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class DisputeType(str, Enum):
    """Dispute types mapped to RBI circulars in docs/legal_matrix.md."""

    UPI_P2P = "upi_p2p"  # RBI/2019-20/67 -> T+1
    IMPS = "imps"  # RBI/2019-20/67 -> T+1
    UPI_P2M = "upi_p2m"  # RBI/2019-20/67 -> T+5
    ATM_CASH_NOT_DISPENSED = "atm_cash_not_dispensed"  # RBI/2019-20/67 -> T+5
    POS_CARD_DEBIT = "pos_card_debit"  # RBI/2019-20/67 -> T+5
    UNAUTHORISED = "unauthorised"  # DBR 2017-18 zero liability


class BrushOffType(str, Enum):
    """Bank agent brush-off moves parsed by Evon during assisted-call listening."""

    WAIT_7_TO_10_DAYS = "wait_7_to_10_days"
    TELL_ME_UTR = "tell_me_utr"
    REQUEST_KYC_OTP = "request_kyc_otp"
    ESCALATE_AFTER_30_DAYS = "escalate_after_30_days"
    OTHER = "other"


class CitizenIntake(BaseModel):
    """Mode 1 output: structured facts extracted from the citizen's spoken complaint."""

    utr: str | None = Field(default=None, description="12-digit UTR (synthetic only)")
    amount_inr: float = Field(gt=0, description="Debited amount in INR")
    txn_date: date = Field(description="Calendar date of the failed transaction (T)")
    dispute_type: DisputeType
    bank_name: str | None = None
    language: str = "hi-IN"
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    raw_transcript: str = ""

    @field_validator("utr")
    @classmethod
    def _utr_must_be_digits(cls, v: str | None) -> str | None:
        if v is not None and (not v.isdigit() or len(v) < 10):
            raise ValueError("UTR must be a digit string (synthetic test data only)")
        return v


class StatutoryEntitlement(BaseModel):
    """Mode 2 output: deterministic RBI entitlement. NEVER LLM-computed."""

    circular_ref: str
    protection_note: str = ""
    tat_date: date
    days_overdue: int = Field(ge=0)
    compensation_inr: float = Field(ge=0)
    claim_inr: float = Field(ge=0)
    penalty_inr: float = Field(ge=0)
    total_inr: float = Field(ge=0)
    eligible_for_rbi_cms: bool = False
    rbi_filing_deadline: date | None = None
    shadow_credit_due_date: date | None = None


class AgentNegotiationExtraction(BaseModel):
    """Mode 4 extraction: bank agent brush-off + suggested counter-script."""

    brush_off_type: BrushOffType | None = None
    docket_id_candidate: str | None = None
    suggested_script_en: str | None = None
    suggested_script_hi: str | None = None
    transcript_segment: str = ""


class ConsentRecord(BaseModel):
    """DPDP Act 2023 consent + TRAI disclosure gates."""

    citizen_consent_verified: bool = False
    consent_timestamp: datetime | None = None
    ai_disclosure_played: bool = False
    disclosure_timestamp: datetime | None = None
    disclosure_text: str | None = None


class HaqVaaniCaseRecord(BaseModel):
    """Final dossier emitted at end of a session (Mode 4 -> POST_CALL)."""

    case_id: str = Field(default_factory=lambda: f"HV-{uuid.uuid4().hex[:10].upper()}")
    citizen_intake: CitizenIntake
    statutory_entitlement: StatutoryEntitlement
    consent: ConsentRecord = Field(default_factory=ConsentRecord)
    call_transcript: str = ""
    verbatim_verified: bool = False
    docket_id: str | None = None
    created_at: datetime = Field(default_factory=datetime.now)
