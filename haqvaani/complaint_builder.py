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


# --------------------------------------------------------------- Hindi drafts -----

HI_DISCLAIMER = (
    "हक़-वाणी आपकी शिकायत बनाने और RBI अधिकार समझने में मदद करता है; "
    "यह धनवापसी की गारंटी नहीं देता।"
)


def build_hindi_drafts(
    intake: CitizenIntake,
    entitlement: StatutoryEntitlement,
    *,
    citizen_name: str = "रमेश",
) -> dict:
    """Deterministic Hindi (Devanagari) versions of the Mode 3 drafts.

    Pure-Python templates (Engineer B file) — no LLM, no schema change.
    Returned as a plain dict so the treaty border at schemas.py stays untouched.
    """
    bank = intake.bank_name or SYNTHETIC_BANK
    amount = _inr(intake.amount_inr)
    claim = _inr(entitlement.total_inr)
    penalty = _inr(entitlement.penalty_inr)
    utr = intake.utr or "(UTR नहीं मिला)"

    intro = (
        f"मैं {citizen_name} हूँ। {intake.txn_date.isoformat()} को मैंने UPI से "
        f"{amount} का भुगतान किया था। मेरे खाते से राशि कट गई पर लाभार्थी को "
        f"नहीं पहुँची (UTR: {utr})।"
    )
    legal = (
        f"{entitlement.circular_ref} के तहत सांविधिक समय-सीमा "
        f"{entitlement.tat_date.isoformat()} (T+1/T+5) थी। आज तक "
        f"{entitlement.days_overdue} दिन की देरी हो चुकी है, इसलिए मैं {penalty} "
        f"(₹100/दिन) क्षतिपूर्ति का अधिकारी हूँ, साथ में {amount} की वापसी। "
        f"कुल दावा: {claim}।"
    )
    request = (
        f"कृपया (1) {amount} विफल डेबिट तुरंत वापस करें और (2) {penalty} "
        f"सांविधिक क्षतिपूर्ति जमा करें — दोनों suo motu, जैसा RBI द्वारा "
        f"अनिवार्य है। शिकायत दर्ज करें और ट्रैकिंग हेतु सेवा अनुरोध / "
        f"डॉकेट नंबर दें।"
    )
    closing = f"धन्यवाद।\n{citizen_name}\nफ़ोन: {SYNTHETIC_PHONE}"

    bank_text = (
        f"विषय: विफल UPI लेन-देन — धनवापसी + RBI/2019-20/67 के तहत "
        f"सांविधिक क्षतिपूर्ति\n\n{intro}\n\n{legal}\n\n{request}\n\n{closing}\n\n"
        f"{HI_DISCLAIMER}"
    )
    whatsapp = (
        f"प्रिय {bank}, मैं {citizen_name} हूँ। {intake.txn_date.isoformat()} को "
        f"{amount} का UPI भुगतान डेबिट हुआ पर क्रेडिट नहीं हुआ (UTR: {utr})। "
        f"{entitlement.circular_ref} के तहत कृपया {amount} वापस करें और {penalty} "
        f"क्षतिपूर्ति (₹100/दिन) दें। SR/डॉकेट आईडी दर्ज कर साझा करें। "
        f"{HI_DISCLAIMER}"
    )
    email = (
        f"To: complaints@{bank.lower().replace(' ', '')}.in\n"
        f"विषय: धनवापसी + ₹100/दिन क्षतिपूर्ति — विफल UPI (UTR: {utr})\n\n"
        f"{intro}\n\n{legal}\n\n{request}\n\n{closing}\n\n{HI_DISCLAIMER}"
    )
    checklist = [
        "UPI लेन-देन संदर्भ (UTR) — भुगतान एप का स्क्रीनशॉट",
        "बैंक स्टेटमेंट / पासबुक प्रविष्टि जो डेबिट दिखाती है",
        "लाभार्थी की पुष्टि (P2P हो तो) — मित्र/विक्रेता स्क्रीनशॉट",
        "यह शिकायत पत्र शिकायत की तारीख के साथ",
        "बैंक का स्वीकृति / SR / डॉकेट आईडी मिलने पर",
    ]
    assert_no_forbidden_secret(bank_text + whatsapp + email + " ".join(checklist))
    return {
        "bank_complaint_text": bank_text,
        "whatsapp_draft": whatsapp,
        "email_draft": email,
        "evidence_checklist": checklist,
    }
