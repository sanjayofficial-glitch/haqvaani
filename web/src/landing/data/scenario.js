// The one scenario every act reads from. RBI's harmonised-TAT framework for UPI:
// a debited-but-not-credited transaction must be reversed by T+1; after that the bank
// owes the customer ₹100 for every day of delay.
//
// HaqVaani rule: statutory numbers come from the API (or the labelled Python demo
// fixture) — never computed in the frontend. This module only *maps* server values
// into the display shape the acts consume; it never multiplies days × ₹100 itself.

import { DEMO } from "../../lib/demo.js";

export const TAT_DAYS = 1;
export const PER_DAY = 100;

export const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

/** format a UTR for display: "629188340112" -> "6291 8834 0112" */
export const utrDisplay = (utr) => String(utr || "").replace(/(.{4})/g, "$1 ").trim();

/**
 * Build the display scenario from server-authoritative numbers.
 * @param {{principal:number, tat:number, elapsed:number, overdue_days:number,
 *          per_day:number, compensation:number, total_refund:number, utr:string}} v
 */
export function makeScenario(v) {
  return {
    principal: v.principal,
    tat: v.tat,
    elapsed: v.elapsed,
    overdue_days: v.overdue_days,
    per_day: v.per_day,
    compensation: v.compensation,
    total_refund: v.total_refund,
    utr: utrDisplay(v.utr),
  };
}

/** The labelled synthetic-demo fixture (the statutory.py worked example). */
export function demoScenario() {
  const e = DEMO.entitlement;
  return makeScenario({
    principal: e.claim_inr,
    tat: TAT_DAYS,
    elapsed: (e.days_overdue || 0) + TAT_DAYS,
    overdue_days: e.days_overdue || 0,
    per_day: PER_DAY,
    compensation: e.penalty_inr,
    total_refund: e.total_inr,
    utr: DEMO.intake.utr,
  });
}

/**
 * Illustrative preview used BEFORE consent (the API refuses /api/rights with
 * 403 until DPDP consent). Mirrors the UPI P2P T+1 rule so the sliders
 * respond; it is a labelled preview — the authoritative number is always
 * the Python engine's, unlocked by starting a case.
 */
export function estimateScenario(amount, days) {
  const overdue = Math.max(0, days - TAT_DAYS);
  const compensation = overdue * PER_DAY;
  return makeScenario({
    principal: amount,
    tat: TAT_DAYS,
    elapsed: days,
    overdue_days: overdue,
    per_day: PER_DAY,
    compensation,
    total_refund: amount + compensation,
    utr: "—",
  });
}

/**
 * Map a live /api/rights entitlement into the display scenario.
 * @param {import("../../lib/api.js").Entitlement} ent
 * @param {number} elapsed days-since-payment shown by the slider
 */
export function scenarioFromEntitlement(ent, elapsed) {
  return makeScenario({
    principal: ent.claim_inr,
    tat: TAT_DAYS,
    elapsed,
    overdue_days: ent.days_overdue || 0,
    per_day: PER_DAY,
    compensation: ent.penalty_inr,
    total_refund: ent.total_inr,
    utr: DEMO.intake.utr,
  });
}
