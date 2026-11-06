"""
HaqVaani RB-IOS 2026 dossier module — Mode 3 escalation.

Builds the Reserve Bank Integrated Ombudsman Scheme 2026 CMS complaint draft and a
stable JSON dossier for a case. Everything synthetic. Pure Python.
"""

from __future__ import annotations

import json
from datetime import date

from .complaint_builder import _rbi_cms_draft
from .safety import assert_no_forbidden_secret
from .schemas import CitizenIntake, HaqVaaniCaseRecord, StatutoryEntitlement


def build_rbi_cms_draft(
    intake: CitizenIntake,
    entitlement: StatutoryEntitlement,
    *,
    citizen_name: str = "Ramesh",
) -> str:
    """Return the RB-IOS 2026 CMS draft if eligible; else empty string."""
    if not entitlement.eligible_for_rbi_cms:
        return ""
    draft = _rbi_cms_draft(intake, entitlement, citizen_name=citizen_name)
    assert_no_forbidden_secret(draft)
    return draft


def render_case_json(record: HaqVaaniCaseRecord) -> str:
    """Serialise the final dossier as pretty JSON (auditable complaint trail)."""
    return json.dumps(record.model_dump(mode="json"), indent=2, ensure_ascii=False)


def dossier_summary(record: HaqVaaniCaseRecord) -> str:
    """One-line human summary for the post-call Timbre (hi-IN) read-back."""
    e = record.statutory_entitlement
    return (
        f"{record.citizen_intake.amount_inr:,.0f} rupees plus {e.penalty_inr:,.0f} "
        f"rupees RBI penalty registered — docket {record.docket_id or 'pending'}."
    )


if __name__ == "__main__":
    # Offline smoke: eligible case → RB-IOS draft.
    from .statutory import compute_statutory_entitlement
    from .schemas import DisputeType

    intake = CitizenIntake(
        utr="629188340112",
        amount_inr=3200,
        txn_date=date(2026, 10, 18),
        dispute_type=DisputeType.UPI_P2P,
        bank_name="DemoBank Support",
    )
    entitlement = compute_statutory_entitlement(
        amount_inr=intake.amount_inr,
        txn_date=intake.txn_date,
        today=date(2026, 11, 6),
        dispute_type=intake.dispute_type,
        complaint_lodged_date=date(2026, 10, 6),
    )
    draft = build_rbi_cms_draft(intake, entitlement)
    print(draft if draft else "(not yet eligible for RBI CMS)")
