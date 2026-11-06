"""Deterministic statutory math tests — must match docs/legal_matrix.md exactly."""

from datetime import date, timedelta

import pytest

from haqvaani.schemas import DisputeType
from haqvaani.statutory import compute_statutory_entitlement


def test_worked_example_p2p():
    """docs/legal_matrix.md §1: T=18 Oct 2026, ₹3,200, today=25 Oct 2026."""
    e = compute_statutory_entitlement(
        amount_inr=3200,
        txn_date=date(2026, 10, 18),
        today=date(2026, 10, 25),
        dispute_type=DisputeType.UPI_P2P,
    )
    assert e.tat_date == date(2026, 10, 19)
    assert e.days_overdue == 6
    assert e.penalty_inr == 600
    assert e.compensation_inr == 600
    assert e.total_inr == 3800
    assert "2019-20/67" in e.circular_ref


def test_no_delay_no_penalty():
    e = compute_statutory_entitlement(
        amount_inr=500.5,
        txn_date=date(2026, 10, 24),
        today=date(2026, 10, 25),
        dispute_type=DisputeType.IMPS,
    )
    assert e.days_overdue == 0
    assert e.penalty_inr == 0
    assert e.total_inr == 500.5


def test_p2m_t_plus_5():
    e = compute_statutory_entitlement(
        amount_inr=1500,
        txn_date=date(2026, 10, 15),
        today=date(2026, 10, 25),
        dispute_type=DisputeType.UPI_P2M,
    )
    assert e.tat_date == date(2026, 10, 20)
    assert e.days_overdue == 5
    assert e.penalty_inr == 500
    assert e.total_inr == 2000


def test_atm_t_plus_5():
    e = compute_statutory_entitlement(
        amount_inr=2000,
        txn_date=date(2026, 10, 22),
        today=date(2026, 10, 25),
        dispute_type=DisputeType.ATM_CASH_NOT_DISPENSED,
    )
    assert e.tat_date == date(2026, 10, 27)
    assert e.days_overdue == 0
    assert e.penalty_inr == 0


def test_future_txn_rejected():
    with pytest.raises(ValueError):
        compute_statutory_entitlement(
            amount_inr=100,
            txn_date=date(2026, 10, 26),
            today=date(2026, 10, 25),
            dispute_type=DisputeType.UPI_P2P,
        )


def test_nonpositive_amount_rejected():
    with pytest.raises(ValueError):
        compute_statutory_entitlement(
            amount_inr=0,
            txn_date=date(2026, 10, 1),
            today=date(2026, 10, 25),
            dispute_type=DisputeType.UPI_P2P,
        )


def test_zero_liability_unauthorised():
    e = compute_statutory_entitlement(
        amount_inr=20000,
        txn_date=date(2026, 11, 1),
        today=date(2026, 11, 2),
        dispute_type=DisputeType.UNAUTHORISED,
    )
    assert "2017-18" in e.circular_ref
    assert e.penalty_inr == 0
    assert e.total_inr == 20000
    assert e.shadow_credit_due_date is not None
    assert e.tat_date > date(2026, 11, 1)


def test_rbi_filing_clocks():
    """RB-IOS 2026: eligible after 30-day bank window; 90 days to file."""
    e = compute_statutory_entitlement(
        amount_inr=1200,
        txn_date=date(2026, 10, 1),
        today=date(2026, 11, 5),
        dispute_type=DisputeType.UPI_P2P,
        complaint_lodged_date=date(2026, 10, 5),
    )
    assert e.eligible_for_rbi_cms is True
    # window_end = 2026-10-05 + 30d = 2026-11-04; +90d = 2027-02-02
    assert e.rbi_filing_deadline == date(2027, 2, 2)


def test_not_yet_eligible_for_rbi():
    e = compute_statutory_entitlement(
        amount_inr=1200,
        txn_date=date(2026, 10, 1),
        today=date(2026, 10, 10),
        dispute_type=DisputeType.UPI_P2P,
        complaint_lodged_date=date(2026, 10, 5),
    )
    assert e.eligible_for_rbi_cms is False
    assert e.rbi_filing_deadline == date(2026, 10, 5) + timedelta(days=120)
