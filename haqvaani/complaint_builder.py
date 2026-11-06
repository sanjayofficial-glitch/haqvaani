"""
HaqVaani complaint builder — Mode 3.

Generates ready-to-send bank complaint / WhatsApp / email drafts plus an evidence
checklist from a CitizenIntake + StatutoryEntitlement. Pure-Python text templates
(no LLM for legal content). Every outbound string passes the secret-redaction gate.

Owned by Engineer B. No API credentials required.
"""

from __future__ import annotations

from .safety import assert_no_forbidden_secret
from .schemas import CitizenIntake, ComplaintDraft, StatutoryEntitlement

# ---------------------------------------------------------------- helpers ------

SYNTHETIC_BANK = "DemoBank Support"          # never a real bank in demo/test
SYNTHETIC_CITIZEN = "Ramesh"                 # synthetic citizen name
SYNTHETIC_PHONE = "+91-90000-00000"          # synthetic phone

DISCLAIMER = (
    "HaqVaani helps you build your complaint and understand your RBI rights; "
    "it cannot guarantee a refund."
)

_RBI_PORTAL = "https://cms.rbi.org.in"
_RBI_TOLLFREE = "14448"


def _inr(value: float) -> str:
    """Format a rupee amount (Western grouping is fine for English drafts)."""
    return f"₹{value:,.0f}"


def _uc_first(text: str) -> str:
    return text[:1].upper() + text[1:]


# ---------------------------------------------------------------- builder -------

def build_complaint_draft(
    intake: CitizenIntake,
    entitlement: StatutoryEntitlement,
    *,
    citizen_name: str = SYNTHETIC_CITIZEN,
    bank_name: str = SYNTHETIC_BANK,
) -> ComplaintDraft:
    """Mode 3: produce all drafts from the computed entitlement (never recompute here)."""
    bank = intake.bank_name or bank_name
    amount = _inr(intake.amount_inr)
    claim = _inr(entitlement.total_inr)
    penalty = _inr(entitlement.penalty_inr)
    utr = intake.utr or "(UTR not captured)"

    intro = (
        f"I am {citizen_name}. On {intake.txn_date.isoformat()} I attempted a payment of "
        f"{amount} via UPI. My account was debited but the beneficiary was not credited "
        f"(UTR: {utr})."
    )
    legal = (
        f"Under {entitlement.circular_ref}, the statutory turnaround time was "
        f"{entitlement.tat_date.isoformat()} (T+1/T+5). As of today, "
        f"{entitlement.days_overdue} day(s) have elapsed beyond TAT, so I am entitled to "
        f"{penalty} compensation ({_inr(100)}/day) in addition to the refund of {amount}. "
        f"Total claim: {claim}."
    )
    request = (
        f"I request that you (1) reverse the failed debit of {amount} immediately and "
        f"(2) credit the statutory compensation of {penalty} — both suo motu, as "
        f"mandated by RBI. Please register this grievance and provide a Service Request / "
        f"docket number for tracking."
    )
    closing = f"Thank you.\n{citizen_name}\nPhone: {SYNTHETIC_PHONE}"

    bank_complaint_text = (
        f"Subject: Failed UPI transaction — refund + statutory compensation under "
        f"RBI/2019-20/67\n\n{intro}\n\n{legal}\n\n{request}\n\n{closing}\n\n"
        f"{DISCLAIMER}"
    )

    whatsapp_draft = (
        f"Dear {bank}, I am {citizen_name}. UPI payment of {amount} on "
        f"{intake.txn_date.isoformat()} was debited but not credited (UTR: {utr}). "
        f"Under {entitlement.circular_ref}, please reverse {amount} and pay {penalty} "
        f"compensation (₹100/day beyond TAT). Log SR/docket ID and share it. "
        f"{DISCLAIMER}"
    )

    email_draft = (
        f"To: complaints@{bank.lower().replace(' ', '')}.in\n"
        f"Subject: Refund + ₹100/day compensation — failed UPI (UTR: {utr})\n\n"
        f"{intro}\n\n{legal}\n\n{request}\n\n{closing}\n\n{DISCLAIMER}"
    )

    evidence_checklist = [
        "UPI transaction reference (UTR) — screenshot from payment app",
        "Bank statement / passbook entry showing the debit",
        "Beneficiary confirmation (if P2P) — friend/vendor screenshot",
        "This complaint letter with the date of lodging",
        "Bank's acknowledgment / SR / docket ID once provided",
    ]

    rbi_cms_draft = None
    if entitlement.eligible_for_rbi_cms:
        rbi_cms_draft = _rbi_cms_draft(intake, entitlement, citizen_name=citizen_name)

    draft = ComplaintDraft(
        bank_complaint_text=bank_complaint_text,
        whatsapp_draft=whatsapp_draft,
        email_draft=email_draft,
        evidence_checklist=evidence_checklist,
        rbi_cms_draft=rbi_cms_draft,
    )

    # Safety gate: nothing outbound may carry a forbidden secret.
    for text in (
        draft.bank_complaint_text,
        draft.whatsapp_draft,
        draft.email_draft,
        *draft.evidence_checklist,
    ):
        assert_no_forbidden_secret(text)
    if rbi_cms_draft:
        assert_no_forbidden_secret(rbi_cms_draft)

    return draft


def _rbi_cms_draft(
    intake: CitizenIntake,
    entitlement: StatutoryEntitlement,
    *,
    citizen_name: str,
) -> str:
    """RB-IOS 2026 CMS complaint draft (only when eligible after the 30-day window)."""
    amount = _inr(intake.amount_inr)
    claim = _inr(entitlement.total_inr)
    penalty = _inr(entitlement.penalty_inr)
    return (
        "Reserve Bank – Integrated Ombudsman Scheme, 2026 (RB-IOS 2026) — CMS Complaint\n\n"
        f"1. Complainant: {citizen_name} (synthetic profile in demo)\n"
        f"2. Regulated Entity: {intake.bank_name or SYNTHETIC_BANK}\n"
        f"3. Dispute: failed UPI debit of {amount} on {intake.txn_date.isoformat()} "
        f"(UTR: {intake.utr or '(not captured)'}); refund not received within the "
        f"30-day regulated-entity window.\n"
        f"4. Relief sought: refund of {amount} + statutory compensation {penalty} "
        f"(₹100/day beyond TAT), total {claim}.\n"
        f"5. Basis: {entitlement.circular_ref}; RB-IOS 2026 (notified 16 Jan 2026, "
        f"in force 1 Jul 2026).\n"
        f"6. File at {_RBI_PORTAL} or call {_RBI_TOLLFREE} (toll-free).\n\n"
        f"{DISCLAIMER}"
    )
