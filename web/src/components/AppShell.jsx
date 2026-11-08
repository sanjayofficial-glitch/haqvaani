/* The persistent app shell every case screen keeps (docs/DESIGN.md):
   brand head + mode chip + language toggle, the 5-step progress rail
   (Speak·Check·Prepare·Call·Prove), main, and the persistent safety bar with
   its truth panel. Mirrors old #stepMount + #safetyPanel contracts.        */

import { useMemo } from "react";
import { useCaseState } from "../lib/state.jsx";
import { useMode } from "../hooks/useMode.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { navigate } from "../lib/router.js";
import React from "react";
import { fmtTs } from "../lib/format.js";
import { LangToggle, Pair } from "../lib/i18n.jsx";
import { Mic, Eye, Phone, Stamp, Check, Clock, Lock } from "../components/Icon.jsx";
import { AI_DISCLOSURE } from "../lib/demo.js";

const DONE_ICONS = [Check, Clock, Phone, Stamp, Eye];

export const STEP_LABELS = [
  { en: "Speak",   hi: "बोलें" },
  { en: "Check",   hi: "जाँच" },
  { en: "Prepare", hi: "तैयार करें" },
  { en: "Call",    hi: "कॉल" },
  { en: "Prove",   hi: "सबूत" },
];

/* step index → the case screen that represents that step (clickable rail) */
export const STEP_PATHS = {
  0: "/start-case",
  1: "/fact-review",
  2: "/complaint-builder",
  3: "/assisted-call",
  4: "/dossier",
};

export function StepBar({ active, onStepClick }) {
  const steps = useMemo(() => STEP_LABELS, []);
  return (
    <div className="stepbar-wrap" id="stepBar">          <ol className="stepbar" aria-label="प्रक्रिया · process steps">
        {steps.map((s, i) => {
          const done = i < active;
          const cur = i === active;
          const ic = DONE_ICONS[i];
          return (
            <li key={s.en} className={done ? "done" : cur ? "active" : ""} aria-current={cur ? "step" : undefined}>
              {done && onStepClick ? (
                <button
                  type="button"
                  className="step-link"
                  onClick={() => onStepClick(i)}
                  aria-label={s.hi + " · " + s.en + " · वापस जाएँ"}
                >
                  <span className="idx num">0{i + 1}</span>
                  <span className="lbl">
                    <span className="step-ic" aria-hidden="true">{ic && React.createElement(ic)}</span>
                    {s.hi} · {s.en}
                  </span>
                </button>
              ) : (
                <>
                  <span className="idx num">0{i + 1}</span>
                  <span className="lbl">{s.hi} · {s.en}</span>
                </>
              )}
            </li>
          );
        })}
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
      <div className="safety-in">          <span className="short">
          <Lock size={15} />
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
      <div className="safety-foot">
        <div className="call-foot-row">
          <Eye size={14} />
          <p className="xsmall mute-3" style={{ margin: 0 }}>
            हक़-वाणी केवल आपकी तरफ़ सुनता है : सर्विस रिक्वेस्ट या OTP नहीं भेजता।
            <span className="pair"><span className="alt" lang="en-IN">HaqVaani listens on your side only : it never dials out or sends your OTP.</span></span>
          </p>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ title, step, children }) {
  const mode = useMode();
  const onStepClick = (i) => {
    const p = STEP_PATHS[i];
    if (p) navigate(p);
  };
  return (
    <>
      <header className="app-head" data-page="app">
        <div className="wrap">            <a
            className="brand"
            href="#/"
            aria-label="हक़-वाणी मुख्य पेज · HaqVaani landing"
          >
            <Mic size={20} />
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
      <StepBar active={step || 0} onStepClick={onStepClick} />
      <main className="app-main wrap-narrow" style={{ paddingBottom: "var(--s-lg)" }}>
        {children}
      </main>
      <SafetyBar />
    </>
  );
}
