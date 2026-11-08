// The one scenario every act reads from. RBI's harmonised-TAT framework for UPI:
// a debited-but-not-credited transaction must be reversed by T+1; after that the bank
// owes the customer ₹100 for every day of delay.

export const TAT_DAYS = 1;
export const PER_DAY = 100;

export type Scenario = {
  principal: number;
  tat: number;
  elapsed: number; // days since the transaction
  overdue_days: number;
  per_day: number;
  compensation: number;
  total_refund: number;
  utr: string;
};

export function makeScenario(principal: number, elapsed: number): Scenario {
  const overdue_days = Math.max(1, elapsed - TAT_DAYS);
  const compensation = overdue_days * PER_DAY;
  return {
    principal,
    tat: TAT_DAYS,
    elapsed: overdue_days + TAT_DAYS,
    overdue_days,
    per_day: PER_DAY,
    compensation,
    total_refund: principal + compensation,
    utr: "4021 7733 9081",
  };
}

export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
