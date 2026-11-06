"""Complaint builder tests — drafts must be correct, safe, and complete."""

from datetime import date

from haqvaani.complaint_builder import build_complaint_draft
from haqvaani.safety import contains_forbidden_secret
from haqvaani.schemas import CitizenIntake, DisputeType
from haqvaani.statutory import compute_statutory_entitlement


def _fixture(eligible: bool = False):
    intake = CitizenIntake(
        utr="629188340112",
        amount_inr=3200,
        txn_date=date(2026, 10, 18),
        dispute_type=DisputeType.UPI_P2P,
        bank_name="DemoBank Support",
    )
    today = date(2026, 11, 6)
    entitlement = compute_statutory_entitlement(
        amount_inr=intake.amount_inr,
        txn_date=intake.txn_date,
        today=today,
        dispute_type=intake.dispute_type,
        complaint_lodged_date=date(2026, 10, 6) if eligible else None,
    )
    return intake, entitlement


def test_draft_contains_facts_and_citations():
    intake, entitlement = _fixture()
    d = build_complaint_draft(intake, entitlement)
    assert "629188340112" in d.bank_complaint_text
    assert "RBI/2019-20/67" in d.bank_complaint_text
    assert "₹3,200" in d.bank_complaint_text
    # today=2026-11-06 → TAT 19 Oct → 18 days overdue → ₹1,800 penalty
    assert "₹1,800" in d.bank_complaint_text
    assert "₹5,000" in d.bank_complaint_text
    assert "SR / docket" in d.bank_complaint_text or "docket" in d.bank_complaint_text


def test_drafts_never_contain_forbidden_secrets():
    intake, entitlement = _fixture()
    d = build_complaint_draft(intake, entitlement)
    texts = [
        d.bank_complaint_text,
        d.whatsapp_draft,
        d.email_draft,
        *d.evidence_checklist,
    ]
    assert all(not contains_forbidden_secret(t) for t in texts)


def test_evidence_checklist_nonempty():
    intake, entitlement = _fixture()
    d = build_complaint_draft(intake, entitlement)
    assert len(d.evidence_checklist) >= 4


def test_no_rbi_draft_when_not_eligible():
    intake, entitlement = _fixture(eligible=False)
    d = build_complaint_draft(intake, entitlement)
    assert d.rbi_cms_draft is None


def test_rbi_draft_when_eligible():
    intake, entitlement = _fixture(eligible=True)
    d = build_complaint_draft(intake, entitlement)
    assert d.rbi_cms_draft is not None
    assert "RB-IOS 2026" in d.rbi_cms_draft
    assert "cms.rbi.org.in" in d.rbi_cms_draft
    assert not contains_forbidden_secret(d.rbi_cms_draft)
