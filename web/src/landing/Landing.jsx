/* ==========================================================================
   HaqVaani landing — exact port of "optimizing-ui-visual-storytelling"
   (the user's chosen UI). Paper-poster storytelling: hero + interactive
   case calculator + 4 pinned SVG acts + details + footer. Zero visual
   deviation from the reference. Only additions: hash-router handling,
   the API-backed scenario (numbers from /api/rights or the labelled demo
   fixture — never computed in JS), and the required honesty lines in the
   footer (no autonomous dialing, Simulated IVR / synthetic demo, AI
   disclosure).                                                        */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useMode } from "../hooks/useMode.jsx";
import { useReducedMotion } from "../hooks/useReducedMotion.js";
import { api } from "../lib/api.js";
import { DEMO } from "../lib/demo.js";
import { consentGranted, useCaseState } from "../lib/state.jsx";
import { inr, demoScenario, estimateScenario, scenarioFromEntitlement, TAT_DAYS, PER_DAY } from "./data/scenario";
import Act01 from "./acts/Act01";
import Act02 from "./acts/Act02";
import Act03 from "./acts/Act03";
import Act04 from "./acts/Act04";
import "../styles/paper.css";

gsap.registerPlugin(ScrollTrigger);

const NAV = [
  ["#act1", "Failed"],
  ["#act2", "Overdue"],
  ["#act3", "₹100 a day"],
  ["#act4", "Credited"],
  ["#details", "Details"],
];

/* ------------------------------------------------------------- scenario -- */
/* Statutory numbers ALWAYS come from the Python API (/api/rights) — never
   computed in the frontend. The calculator asks the API for the real
   numbers whenever consent has been granted (DPDP); the only fallback is
   the labelled synthetic sample: before consent (the API returns 403) or
   when the API is unreachable. The sliders are the *question*; Python
   answers. */
function useScenario(amount, days, hasConsent) {
  const [state, setState] = useState(() => ({ s: estimateScenario(amount, days), source: "estimate" }));

  useEffect(() => {
    let alive = true;
    if (!hasConsent) {
      setState({ s: estimateScenario(amount, days), source: "estimate" });
      return () => { alive = false; };
    }
    const txnDate = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);
    const timer = setTimeout(async () => {
      try {
        const ent = await api.post("/api/rights", {
          dispute_type: "upi_p2p",
          amount_inr: amount,
          txn_date: txnDate,
        });
        if (alive) setState({ s: scenarioFromEntitlement(ent, days), source: "api" });
      } catch {
        if (alive) setState({ s: demoScenario(), source: "demo" });
      }
    }, 250);
    return () => { alive = false; clearTimeout(timer); };
  }, [hasConsent, amount, days]);

  return state;
}

/* --------------------------------------------------------------- landing -- */
export default function Landing() {
  const reduced = useReducedMotion();
  const mode = useMode();
  const [amount, setAmount] = useState(3200);
  const [days, setDays] = useState(7);
  const caseState = useCaseState();
  const hasConsent = consentGranted(caseState);
  const { s, source } = useScenario(amount, days, hasConsent);
  const rootRef = useRef(null);
  const lenisRef = useRef(null);

  /* Lenis smooth scroll, synced with ScrollTrigger (disabled under reduced
     motion — native scroll remains). This is the single biggest smoothness
     win: the wheel input is smoothed independently of the pinned scenes. */
  useEffect(() => {
    if (reduced) return undefined;
    const lenis = new Lenis({ autoRaf: false, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenisRef.current = null;
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [reduced]);

  /* page progress -> top bar (same as the reference, but throttled to one
     style write per animation frame instead of per scroll event) */
  useEffect(() => {
    let raf = null;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        document.documentElement.style.setProperty("--p", String(max > 0 ? window.scrollY / max : 0));
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* in-page anchors scroll in place; #/… links keep routing to the app */
  function onNavClick(e) {
    const a = e.target && e.target.closest && e.target.closest("a[href^='#']");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#/")) return;
    if (e.defaultPrevented) return;
    e.preventDefault();
    if (href === "#top" || href === "#") {
      if (lenisRef.current) lenisRef.current.scrollTo(0, { duration: 1.2 });
      else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      return;
    }
    const el = document.querySelector(href);
    if (!el) return;
    if (lenisRef.current) lenisRef.current.scrollTo(el, { duration: 1.2 });
    else el.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <div ref={rootRef} onClick={onNavClick} className="paper-root">
      <header className="bar">
        <a className="brand" href="#top" aria-label="Haqvaani, home">
          <b>Haqvaani</b>
          <i lang="hi">हक़ की आवाज़</i>
        </a>
        <nav className="nav" aria-label="Sections">
          {NAV.map(([href, label]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero__dots" aria-hidden="true" />
          <div style={{ position: "relative" }}>
            <div className="kicker">UPI refunds · RBI rule</div>
            <h1 className="t-disp">
              Stuck UPI money? The bank owes you <em>₹{PER_DAY} a day.</em>
            </h1>
            <p className="hero__lede">
              When a payment is debited but never lands, RBI says it must be reversed by T+{TAT_DAYS}. Every day after that, the bank pays you.
              <span lang="hi">UPI में पैसा कट जाए पर न पहुँचे, तो हर दिन की देरी पर बैंक ₹{PER_DAY} देता है।</span>
            </p>
            <a className="cue" href="#act1">
              <span aria-hidden="true">↓</span> Scroll to see it happen
            </a>
          </div>

          <div className="case" role="group" aria-label="Your case">
            <div className="case__tag">Your case · आपका मामला</div>
            <label className="field">
              <span className="field__row">Amount stuck <output>{inr(amount)}</output></span>
              <input type="range" min={500} max={50000} step={500} value={amount} onChange={(e) => setAmount(+e.target.value)} aria-label="Amount stuck in rupees" />
            </label>
            <label className="field">
              <span className="field__row">Days since payment <output>{s.elapsed}</output></span>
              <input type="range" min={2} max={30} step={1} value={days} onChange={(e) => setDays(+e.target.value)} aria-label="Days since the payment" />
            </label>
            <div className="result" aria-live="polite">
              <span className="field__row">The bank owes you</span>
              <span className="result__big">{inr(s.total_refund)}</span>
              <div className="result__sum">
                <span className="chip">{inr(s.principal)} refund</span>
                <span className="chip chip--org">+ {inr(s.compensation)} · {s.overdue_days} days × ₹{PER_DAY}</span>
              </div>
              {source === "estimate" && (
                <p className="fine" style={{ margin: "10px 0 0", color: "#8a8578" }}>
                  Illustrative preview · T+1 × ₹100 — the authoritative number computes in the app after consent (Python).
                </p>
              )}
              {source === "demo" && (
                <p className="fine" style={{ margin: "10px 0 0", color: "#8a8578" }}>
                  API unavailable — synthetic demo · sample case (statutory math lives in Python).
                </p>
              )}
            </div>
          </div>
        </section>

        <Act01 s={s} />
        <Act02 s={s} />
        <Act03 s={s} />
        <Act04 s={s} />

        <section id="details" className="details">
          <div className="kicker">The details · विवरण</div>
          <h2 className="t-disp">Where text belongs.</h2>
          <div className="grid">
            <article className="card">
              <h3>The rule</h3>
              <p>
                Under RBI&rsquo;s turnaround-time framework for failed transactions, if a UPI payment is debited but not credited to the receiver, it must be reversed by <b>T+{TAT_DAYS}</b> (T = the transaction day).
              </p>
              <p>After that, the bank must pay <b>₹{PER_DAY} for every day of delay</b>. No form is needed to earn it; the customer should not have to chase.</p>
              <p lang="hi">पैसा कटे पर सामने वाले को न पहुँचे, तो T+{TAT_DAYS} दिन में अपने-आप वापस आना चाहिए। देरी पर बैंक हर दिन ₹{PER_DAY} देता है।</p>
            </article>

            <article className="card">
              <h3>If it happens to you</h3>
              <ol className="steps">
                <li>
                  <div>
                    <b>Keep the proof.</b>
                    <span>Screenshot, UTR number, date and time. <span lang="hi">UTR और स्क्रीनशॉट सँभालकर रखें।</span></span>
                  </div>
                </li>
                <li>
                  <div>
                    <b>Raise a complaint with the app and your bank.</b>
                    <span>Note the complaint number. <span lang="hi">शिकायत संख्या ज़रूर लें।</span></span>
                  </div>
                </li>
                <li>
                  <div>
                    <b>After T+{TAT_DAYS}, ask for ₹{PER_DAY} per day.</b>
                    <span>Quote the RBI TAT circular. <span lang="hi">हर दिन के ₹{PER_DAY} का हर्जाना माँगें।</span></span>
                  </div>
                </li>
                <li>
                  <div>
                    <b>No fix in 30 days? Go to the RBI Ombudsman.</b>
                    <span>cms.rbi.org.in · helpline 14448. <span lang="hi">30 दिन में हल न हो तो RBI लोकपाल के पास जाएँ।</span></span>
                  </div>
                </li>
              </ol>
            </article>

            <article className="card">
              <h3>Your numbers</h3>
              <table className="ledger">
                <tbody>
                  <tr><td>Amount debited</td><td>{inr(s.principal)}</td></tr>
                  <tr><td>Days since payment</td><td>{s.elapsed}</td></tr>
                  <tr><td>Allowed (T+{TAT_DAYS})</td><td>{s.tat} day</td></tr>
                  <tr><td>Days overdue</td><td>{s.overdue_days}</td></tr>
                  <tr><td>Compensation ({s.overdue_days} × ₹{PER_DAY})</td><td>{inr(s.compensation)}</td></tr>
                  <tr className="total"><td>Total owed</td><td>{inr(s.total_refund)}</td></tr>
                </tbody>
              </table>
              <p style={{ marginTop: 14 }} lang="hi">कुल {inr(s.total_refund)}: {inr(s.principal)} वापसी + {inr(s.compensation)} हर्जाना।</p>
            </article>
          </div>
          <p className="fine">
            Informational only, not legal advice. Rules and limits differ by payment type and can change; check the current RBI circular and your bank&rsquo;s policy. The amounts above are an illustration built from the sliders at the top of the page.
            {source !== "api" ? " (Demo: synthetic sample-case figures — the statutory math lives in Python and feeds this page from the API.)" : ""}
          </p>
        </section>
      </main>

      <footer>
        <span><b>Haqvaani</b> &nbsp;·&nbsp; हक़ की आवाज़ · know your right to a refund</span>
        <span>Illustrated explainer. Scroll-driven, motion-safe.</span>
        <span>
          No autonomous dialing · Simulated IVR / synthetic demo · AI disclosure: “This is an AI assistant assisting you.”
        </span>
        <span><a href="#/start-case">Start your case →</a></span>
      </footer>
    </div>
  );
}
