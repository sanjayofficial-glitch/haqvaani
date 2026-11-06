"""
HaqVaani statutory engine — PURE PYTHON, deterministic, auditable.

Every number here is hardcoded from docs/legal_matrix.md (RBI circulars). An LLM
may format/explain output but MUST NEVER compute deadlines, TAT, or penalties.

Mode 2 stage. Owned by Engineer B; changes need no API credentials.
"""

from __future__ import annotations

from datetime import date, timedelta

from .schemas import DisputeType, StatutoryEntitlement

# --------------------------------------------------------------------------
# Hardcoded statutory constants (source: docs/legal_matrix.md)
# --------------------------------------------------------------------------
PENALTY_PER_DAY_INR = 100.0

CIRCULAR_FAILED_TXN = "RBI/2019-20/67 (DPSS.CO.PD No.629/02.01.014/2019-20)"
CIRCULAR_ZERO_LIABILITY = "DBR.No.Leg.BC.78/09.07.005/2017-18"

# TAT offset (calendar days) per dispute type — RBI/2019-20/67.
TAT_OFFSET_DAYS: dict[DisputeType, int] = {
    DisputeType.UPI_P2P: 1,
    DisputeType.IMPS: 1,
    DisputeType.UPI_P2M: 5,
    DisputeType.ATM_CASH_NOT_DISPENSED: 5,
    DisputeType.POS_CARD_DEBIT: 5,
}

UNAUTHORISED_REPORTING_WORKING_DAYS = 3
SHADOW_CREDIT_WORKING_DAYS = 10
RBI_BANK_RESOLUTION_WINDOW_DAYS = 30
RBI_FILING_GRACE_DAYS = 90


def _next_working_day(start: date, n: int) -> date:
    """Return the nth working day (Mon–Fri, weekends excluded) on/after `start`."""
    day = start
    added = 0
    while added < n:
        day += timedelta(days=1)
        if day.weekday() < 5:
            added += 1
    return day


def compute_statutory_entitlement(
    *,
    amount_inr: float,
    txn_date: date,
    today: date | None = None,
    dispute_type: DisputeType,
    complaint_lodged_date: date | None = None,
) -> StatutoryEntitlement:
    """Mode 2: compute the citizen's statutory entitlement deterministically.

    Args:
        amount_inr: Debited amount in INR (> 0).
        txn_date: Calendar date of the failed transaction (T).
        today: Reference 'as-of' date (defaults to system date). Injectable for tests.
        dispute_type: One of DisputeType — selects circular + TAT offset.
        complaint_lodged_date: Date the complaint was lodged with the bank (optional;
            required to compute RB-IOS 2026 filing clocks).

    Raises:
        ValueError: if txn_date is in the future or amount is non-positive.
    """
    today = today or date.today()

    if amount_inr <= 0:
        raise ValueError("amount_inr must be positive")
    if txn_date > today:
        raise ValueError(f"txn_date {txn_date} cannot be in the future (today={today})")

    if dispute_type is DisputeType.UNAUTHORISED:
        return _zero_liability_entitlement(
            amount_inr=amount_inr,
            txn_date=txn_date,
            today=today,
            complaint_lodged_date=complaint_lodged_date,
        )

    return _failed_txn_entitlement(
        amount_inr=amount_inr,
        txn_date=txn_date,
        today=today,
        dispute_type=dispute_type,
        complaint_lodged_date=complaint_lodged_date,
    )


def _failed_txn_entitlement(
    *,
    amount_inr: float,
    txn_date: date,
    today: date,
    dispute_type: DisputeType,
    complaint_lodged_date: date | None,
) -> StatutoryEntitlement:
    """RBI/2019-20/67: T+1 (P2P/IMPS) or T+5 (P2M/ATM/PoS) + ₹100/day suomotu."""
    offset = TAT_OFFSET_DAYS[dispute_type]
    tat_date = txn_date + timedelta(days=offset)
    days_overdue = max(0, (today - tat_date).days)
    penalty_inr = days_overdue * PENALTY_PER_DAY_INR
    total_inr = amount_inr + penalty_inr

    eligible = False
    filing_deadline: date | None = None
    if complaint_lodged_date is not None:
        window_end = complaint_lodged_date + timedelta(
            days=RBI_BANK_RESOLUTION_WINDOW_DAYS
        )
        eligible = today >= window_end
        filing_deadline = window_end + timedelta(days=RBI_FILING_GRACE_DAYS)

    return StatutoryEntitlement(
        circular_ref=CIRCULAR_FAILED_TXN,
        protection_note=(
            f"Suo motu compensation ₹{PENALTY_PER_DAY_INR:.0f}/day beyond T+{offset}"
        ),
        tat_date=tat_date,
        days_overdue=days_overdue,
        compensation_inr=penalty_inr,
        claim_inr=amount_inr,
        penalty_inr=penalty_inr,
        total_inr=total_inr,
        eligible_for_rbi_cms=eligible,
        rbi_filing_deadline=filing_deadline,
    )


def _zero_liability_entitlement(
    *,
    amount_inr: float,
    txn_date: date,
    today: date,
    complaint_lodged_date: date | None,
) -> StatutoryEntitlement:
    """DBR.No.Leg.BC.78/09.07.005/2017-18: Zero Customer Liability.

    Report within 3 working days; bank must shadow-credit within 10 working days.
    """
    reporting_deadline = _next_working_day(
        txn_date, UNAUTHORISED_REPORTING_WORKING_DAYS
    )
    lodged = complaint_lodged_date or today
    shadow_credit_due = _next_working_day(lodged, SHADOW_CREDIT_WORKING_DAYS)
    window_end = lodged + timedelta(days=RBI_BANK_RESOLUTION_WINDOW_DAYS)
    filing_deadline = window_end + timedelta(days=RBI_FILING_GRACE_DAYS)

    return StatutoryEntitlement(
        circular_ref=CIRCULAR_ZERO_LIABILITY,
        protection_note=(
            "Zero Customer Liability (report within "
            f"{UNAUTHORISED_REPORTING_WORKING_DAYS} working days)"
        ),
        tat_date=reporting_deadline,
        days_overdue=0,
        compensation_inr=0.0,
        claim_inr=amount_inr,
        penalty_inr=0.0,
        total_inr=amount_inr,
        eligible_for_rbi_cms=today >= window_end,
        rbi_filing_deadline=filing_deadline,
        shadow_credit_due_date=shadow_credit_due,
    )
