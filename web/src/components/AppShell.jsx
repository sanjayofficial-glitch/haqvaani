/* The persistent app shell every case screen keeps (docs/DESIGN.md):
   brand head + mode chip + language toggle, the 5-step progress rail
   (Speak·Check·Prepare·Call·Prove), main, and the persistent safety bar with
   its truth panel. Mirrors old #stepMount + #safetyPanel contracts.        */

import { useMemo, useState } from "react";
import { useCaseState } from "../lib/state.jsx";
import { useMode } from "../hooks/useMode.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { navigate, useRoute } from "../lib/router.js";
import React from "react";
import { fmtTs } from "../lib/format.js";
import { LangToggle, Pair, T, useLang } from "../lib/i18n.jsx";
import { Mic, Eye, Phone, Stamp, Check, Clock, Lock, Arrow, Gallery, House, Shield, File } from "../components/Icon.jsx";
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

/* natural previous screen for the header back button (one step up the flow) */
const PREV_PATH = {
  "/consent": "/start-case",
  "/voice-intake": "/consent",
  "/fact-review": "/voice-intake",
  "/rights-check": "/fact-review",
  "/complaint-builder": "/rights-check",
  "/call-prep": "/complaint-builder",
  "/assisted-call": "/call-prep",
  "/docket-capture": "/assisted-call",
  "/post-call": "/docket-capture",
  "/dossier": "/post-call",
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

/* Mobile app-style navigation — replaces the header + safety bar on phones.
   Fixed bottom tab bar: Home · Studio · Safety (sheet) · Language. */
function MobileNav() {
  const state = useCaseState();
  const mode = useMode();
  const { lang } = useLang();
  const [openSafety, setOpenSafety] = useState(false);
  const rows = safetyRows(state, mode);
  return (
    <nav className="m-nav" aria-label="मोबाइल नेविगेशन · mobile navigation">
      <button type="button" className="m-nav-item" onClick={() => navigate("/")} aria-label="Home">
        <House size={20} />
        <span><T en="Home" hi="होम" /></span>
      </button>
      <button type="button" className="m-nav-item" onClick={() => navigate("/start-case")} aria-label="Case">
        <File size={20} />
        <span><T en="Case" hi="केस" /></span>
      </button>
      <button type="button" className="m-nav-item" onClick={() => navigate("/studio")} aria-label="Studio">
        <Gallery size={20} />
        <span><T en="Studio" hi="स्टूडियो" /></span>
      </button>
      <button type="button" className="m-nav-item" onClick={() => setOpenSafety((v) => !v)} aria-expanded={openSafety} aria-label="Safety">
        <Shield size={20} />
        <span><T en="Safety" hi="सुरक्षा" /></span>
      </button>
      <span className="m-nav-item">
        <LangToggle />
        <span className="m-nav-label"><T en="Language" hi="भाषा" /></span>
      </span>
      {openSafety && (
        <div className="m-safety-sheet" role="region" aria-label="safety status">
          <div className="m-safety-head">
            <Lock size={14} />
            <span className="mute-2"><T en="Safety status" hi="सुरक्षा विवरण" /></span>
            <span className={`chip chip--dot chip--${mode}`}>
              <span className="dot" aria-hidden="true"></span>
              {mode === "live" ? "live" : "demo"}
            </span>
          </div>
          <div className="safety-panel-kv">
            {rows.map(([k, v]) => (
              <div className="kv" key={k}>
                <span className="k">{k}</span>
                <span className="v num">{v}</span>
              </div>
            ))}
          </div>
          <p className="xsmall mute-3" style={{ margin: 0 }}>
            <T
              en="HaqVaani listens on your side only : it never dials out."
              hi="हक़-वाणी केवल आपकी तरफ़ सुनता है : कभी डायल नहीं करता।"
            />
          </p>
        </div>
      )}
    </nav>
  );
}

export function AppShell({ title, step, rail = true, children }) {
  const mode = useMode();
  const { path } = useRoute();
  const prev = PREV_PATH[path] || null;
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
            {prev && (
              <button
                type="button"
                className="btn btn--quiet back"
                aria-label="वापस जाएँ · back"
                onClick={() => navigate(prev)}
              >
                <Arrow size={13} /> वापस · back
              </button>
            )}
            <span className="chip" id="modeChip" data-mode={mode}>
              <span className="dot" aria-hidden="true"></span>
              {mode === "live" ? "Live · Gnani connected" : "Synthetic demo (demo)"}
            </span>
            <a className="chip chip--studio" href="#/studio" aria-label="स्टूडियो · studio">
              <Gallery size={14} /> स्टूडियो
            </a>
            <LangToggle />
          </div>
        </div>
      </header>
      {rail && <StepBar active={step || 0} onStepClick={onStepClick} />}
      <main className="app-main wrap-narrow" style={{ paddingBottom: "var(--s-lg)" }}>
        {children}
      </main>
      <SafetyBar />
      <MobileNav />
    </>
  );
}
