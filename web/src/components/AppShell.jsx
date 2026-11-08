/* The persistent app shell every case screen keeps (docs/DESIGN.md):
   brand head + mode chip + language toggle, the 5-step progress rail
   (Speak·Check·Prepare·Call·Prove), main, and the persistent safety bar with
   its truth panel. Mirrors old #stepMount + #safetyPanel contracts.        */

import { useMemo } from "react";
import { useCaseState } from "../lib/state.jsx";
import { useMode } from "../hooks/useMode.jsx";
import { fmtTs } from "../lib/format.js";
import { LangToggle, Pair } from "../lib/i18n.jsx";
import { AI_DISCLOSURE } from "../lib/demo.js";

export const STEP_LABELS = [
  { en: "Speak",   hi: "बोलें" },
  { en: "Check",   hi: "जाँच" },
  { en: "Prepare", hi: "तैयार करें" },
  { en: "Call",    hi: "कॉल" },
  { en: "Prove",   hi: "सबूत" },
];

export function StepBar({ active }) {
  const steps = useMemo(() => STEP_LABELS, []);
  return (
    <div className="stepbar-wrap" id="stepBar">
      <ol className="stepbar" aria-label="प्रक्रिया · process steps">
        {steps.map((s, i) => (
          <li key={s.en} className={i < active ? "done" : i === active ? "active" : ""} aria-current={i === active ? "step" : undefined}>
            <span className="idx num">0{i + 1}</span>
            <span className="lbl">
              {s.hi} · {s.en}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* safety panel contents — the same rows the dossier + old safetyPanel showed */
export function safetyRows(state, mode) {
  const c = (state && state.consent) || {};
  const call = state && state.call;
  const docket = state && state.docket;
  const rows = [
    ["consent (dpdp)", c.ts ? "recorded " + fmtTs(c.ts) : "not yet · अभी नहीं"],
    ["AI disclosure", c.disclosure ? AI_DISCLOSURE : "not yet · अभी नहीं"],
    ["secrets blocked (otp/pin/cvv)", String((state && state.secretsBlocked) || 0)],
  ];
  if (docket && docket.id) {
    rows.push(["docket " + docket.id + (docket.verified ? "" : " (unverified)"), "on file"]);
  } else if (call && call.docket_id) {
    rows.push(["docket " + call.docket_id + (call.verbatim_verified ? "" : " (unverified)"), "on file"]);
  }
  rows.push(["autonomous dialing", "0 — the citizen always dials"]);
  rows.push(["your call mode", mode === "live" ? "live API" : "synthetic demo only"]);
  return rows;
}

function SafetyBar() {
  const state = useCaseState();
  const mode = useMode();
  const rows = safetyRows(state, mode);
  return (
    <div className="safety" role="region" aria-label="सुरक्षा जानकारी · safety">
      <div className="safety-in">
        <span className="short">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <Pair hi="कभी OTP, PIN या CVV न बोलें : बैंक इनके लिए कभी पूछता नहीं।" en="Never share OTP, PIN or CVV : the bank never asks." />
        </span>
        <details>
          <summary>सुरक्षा विवरण · safety status</summary>
          <div className="safety-panel-kv">
            {rows.map(([k, v]) => (
              <div className="kv" key={k}>
                <span className="k">{k}</span>
                <span className="v num">{v}</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}

export function AppShell({ title, step, children }) {
  const mode = useMode();
  return (
    <>
      <header className="app-head" data-page="app">
        <div className="wrap">
          <a
            className="brand"
            href="#/"
            aria-label="हक़-वाणी मुख्य पेज · HaqVaani landing"
          >
            <span className="hi" lang="hi-IN">हक़-वाणी</span>
            <small>{title || "case"}</small>
          </a>
          <div className="head-tools">
            <span className="chip" id="modeChip" data-mode={mode}>
              <span className="dot" aria-hidden="true"></span>
              {mode === "live" ? "Live · Gnani connected" : "Synthetic demo (demo)"}
            </span>
            <LangToggle />
          </div>
        </div>
      </header>
      <StepBar active={step || 0} />
      <main className="app-main wrap-narrow" style={{ paddingBottom: "var(--s-lg)" }}>
        {children}
      </main>
      <SafetyBar />
    </>
  );
}
