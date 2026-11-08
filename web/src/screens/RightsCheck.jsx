/* Step 01b — the money, computed by Python, shown by the page.
   Mirrors frontend/screens/rights-check.html: /api/rights is posted with the
   citizen's facts; demo mode honestly runs the statutory.py worked example
   (350 ms delay, labelled). Timeline T → TAT → today, the ₹100/day ledger,
   the zero-liability card for unauthorised transactions, and the calculation
   drawer that names the circular. No number is ever computed in JS.          */

import { useEffect, useRef, useState } from "react";
import { useMode } from "../hooks/useMode.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { useCaseFile, useCaseState } from "../lib/state.jsx";
import { api } from "../lib/api.js";
import { DEMO } from "../lib/demo.js";
import { fmtInr, fmtDate } from "../lib/format.js";
import { navigate } from "../lib/router.js";
import { Check, Arrow } from "../components/Icon.jsx";
import { RightsScene } from "./art/CaseArt.jsx";

export default function RightsCheck() {
  const { commit } = useCaseFile();
  const st = useCaseState();
  const mode = useMode();
  const toast = useToast();

  /* build exactly once (StrictMode-safe) */
  const builtRef = useRef(false);
  const [ent, setEnt] = useState(null); /* null until load finishes */
  const [live, setLive] = useState(false);
  const [loaded, setLoaded] = useState(false);

  /* fresh state without re-triggering the loader */
  const stRef = useRef(st);
  stRef.current = st;

  useEffect(() => {
    if (builtRef.current) return;
    builtRef.current = true;
    const intake = stRef.current.intake || DEMO.intake;

    /* demo honesty: canned worked example from statutory.py self-test,
       labelled clearly, never recomputed in JS */
    const demoFetch = (canned) =>
      new Promise((res) =>
        setTimeout(() => res({ ...JSON.parse(JSON.stringify(canned)), __demo: true }), 350)
      );

    const run = mode === "live"
      ? api.post("/api/rights", intake).then((e) => { setEnt(e); setLive(true); setLoaded(true); })
      : demoFetch(intake.dispute_type === "unauthorised" ? DEMO.unauthorised : DEMO.entitlement)
          .then((e) => { setEnt(e); setLive(false); setLoaded(true); });

    if (mode === "live") {
      run.catch(() => {
        toast("API नहीं मिला : सैंपल हिसाब दिखाया जा रहा है", "bad");
        return demoFetch(intake.dispute_type === "unauthorised" ? DEMO.unauthorised : DEMO.entitlement)
          .then((e) => { setEnt(e); setLive(false); setLoaded(true); });
      });
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [mode]);

  /* keep the entitlement in the case record as soon as it lands */
  useEffect(() => {
    if (ent) commit({ entitlement: ent });
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [ent]);

  if (!ent) {
    return <p className="body mute-3" style={{ marginTop: "var(--s-md)" }}>हिसाब तैयार हो रहा है… · calculating…</p>;
  }

  const intake = stRef.current.intake || DEMO.intake;
  const demoMismatch = Boolean(ent.__demo) && stRef.current.factsEdited === true;

  /* RBI timeline per dispute type: T+1 peer transfers vs T+5 merchant/ATM/PoS */
  const ruleFor = (type) => {
    switch (type) {
      case "upi_p2p":
      case "imps":
        return { round: "T+1", scope: "P2P / IMPS — peer transfers" };
      case "upi_p2m":
      case "atm_cash_not_dispensed":
      case "pos_card_debit":
        return { round: "T+5", scope: "merchant / ATM / PoS — you pay the merchant" };
      case "unauthorised":
        return { round: "zero-liability", scope: "report ≤ 3 working days" };
      default:
        return { round: "T+1", scope: "UPI P2P" };
    }
  };
  const rule = ruleFor(intake.dispute_type);

  /* timeline rows: T → TAT → today (the breach marker when overdue) */
  const overdue = (ent.days_overdue || 0) > 0;
  const timeline = [
    { cls: "passed", when: fmtDate(intake.txn_date, "en"), line: "T : पैसे कटे · money debited" },
    {
      cls: overdue ? "breach" : "passed",
      when: fmtDate(ent.tat_date, "en"),
      line: "TAT : बैंक की रजिस्टर वाली समय-सीमा",
      small: overdue ? "(T+1 या T+5 प्रकार अनुसार" : "बैंक TAT निकट है",
    },
    ...(overdue ? [{
      cls: "breach",
      when: "आज · today",
      line: "TAT के " + ent.days_overdue + " दिन बीत चुके हैं · TAT passed by " + ent.days_overdue + " days",
    }] : []),
  ];

  /* ledger : money values only from the (Python or canned-Python) result */
  const ledger = [
    ["आपकी कटी राशि · your money", fmtInr(ent.claim_inr)],
    ["TAT पीछे के दिन · days past TAT", String(ent.days_overdue)],
    ["₹100 × दिन · overdue penalty (RBI suo motu)", fmtInr(ent.penalty_inr)],
    ["कुल दावा · total claim", fmtInr(ent.total_inr)],
  ];

  /* zero-liability card (unauthorised only) */
  const zeroLiability = intake.dispute_type === "unauthorised";
  const zlXtra = ent.shadow_credit_due_date ? "Shadow credit तक: " + fmtDate(ent.shadow_credit_due_date, "en") + " · " : "";
  const zlEn = (zlXtra + (ent.protection_note || "")) || "Report the unauthorised debit within 3 working days : the bank carries it.";

  const calcText =
    (ent.circular_ref || "") + " : " + (ent.protection_note || "") +
    "। दावा ₹" + Number(ent.claim_inr).toLocaleString("en-IN") +
    " + दिन की क्षतिपूर्ति ₹" + Number(ent.penalty_inr).toLocaleString("en-IN") +
    " = कुल ₹" + Number(ent.total_inr).toLocaleString("en-IN") +
    (ent.rbi_filing_deadline ? "। RBI CMS तक: " + fmtDate(ent.rbi_filing_deadline, "en") + " (90 दिन)" : "।");

  return (
    <>
      <div className="screen-ghost" aria-hidden="true">₹100</div>
      <div className="col" style={{ gap: "var(--s-xs)" }}>
        <h1 className="d-lg" lang="hi-IN">RBI नियम कहते हैं : आपको कितना मिलना चाहिए।</h1>
        <p className="body mute-2" style={{ maxWidth: "60ch" }}>
          नीचे का हर नंबर RBI परिपत्रों के मुक़ाबले पायथन से निकला है : कोई AI ने कुछ नहीं बनाया।
          <span className="pair"><span className="alt" lang="en-IN">Every number below comes from deterministic Python against the RBI circulars : no AI invented anything.</span></span>
        </p>
      </div>

      <div className="art" aria-hidden="true" style={{ marginTop: "var(--s-md)" }}>
        <RightsScene />
      </div>

      <section className="col" style={{ marginTop: "var(--s-md)", gap: "var(--s-md)" }} aria-label="हिसाब">
        {/* source honesty strip */}
        <div className="state-strip" style={live ? undefined : { borderLeftColor: "var(--ink)" }}>
          {live ? (
            <>
              <Check size={15} />
              <p className="xsmall" style={{ margin: 0 }}>
                <b>यह हिसाब पायथन से गणित है</b> (deterministic) : आपके सच : {fmtInr(intake.amount_inr)} · {fmtDate(intake.txn_date, "en")} · {intake.dispute_type}
              </p>
            </>
          ) : (
            <p className="xsmall" style={{ margin: 0 }}>
              <b>सैंपल केस का हिसाब : synthetic demo</b> · the worked example from <span className="mono">statutory.py</span> self-test
            </p>
          )}
        </div>

        {/* the honest mismatch note: user edited facts, demo shows the sample case */}
        <div className="state-strip is-demo" hidden={!demoMismatch}>
          <p className="xsmall" style={{ margin: 0 }}>
            डेमो मोड में हिसाब <b>सैंपल केस</b> से दिखाया जाता है (synthetic demo) : आपके अपने सचों की गणना सर्वर चालू होने पर होगी।
            <span className="pair"><span className="alt" lang="en-IN">With the API running, your own facts are computed exactly by haqvaani/statutory.py.</span></span>
          </p>
        </div>

        {/* RBI timeline per type: clear T+1 vs T+5 split */}
        <div className="kv src-note" aria-label="RBI नियम">
          <span className="k">RBI timeline · सांविधिक समय</span>
          <span className="xsmall">
            <b>{rule.round}</b> · {rule.scope} —{" "}
            <span className="mono">{(ent.circular_ref || "").split(" (")[0]}</span>
          </span>
        </div>

        {/* timeline: T → TAT → today */}
        <ol className="timeline" aria-label="सांविधिक समय-रेखा">
          {timeline.map((t, i) => (
            <li className={t.cls} key={i}>
              <span className="t-when">{t.when}</span>
              <span>{t.line}</span>
              {t.small && <br />}
              {t.small && <span className="xsmall mute-3">{t.small}</span>}
            </li>
          ))}
        </ol>

        {/* the money ledger, values straight from the Python result */}
        <div className="ledger" aria-label="क्लेम क्लेजर">
          {ledger.map((r, i) => (
            <div className={"ledger-row" + (i === ledger.length - 1 ? " total" : "")}
              style={{ "--i": i }} data-in={loaded || undefined} key={r[0]}>
              <span className="k">{r[0]}</span>
              <span className="v">{r[1]}</span>
            </div>
          ))}
        </div>

        {/* zero-liability card (unauthorised only) */}
        {zeroLiability && (
          <div className="card" style={{ borderLeft: "4px solid var(--accent)" }}>
            <p className="h3" style={{ margin: "0 0 6px" }}>देयता: शून्य · zero customer liability</p>
            <p style={{ margin: 0 }}>
              RBI नियम कहता है : धोखे की रिपोर्ट ≤ 3 वर्किंग दिन में दें, तो आपकी ज़िम्मेदारी शून्य है और बैंक को पैसे लौटाने होंगे।
            </p>
            <p className="xsmall mute-2" style={{ margin: "6px 0 0" }}>{zlEn}</p>
          </div>
        )}

        {/* the calculation drawer: circular naming, pure Python */}
        <details>
          <summary>हिसाब कैसे हुआ? · show calculation</summary>
          <div className="card" style={{ marginTop: 10 }}>
            <p style={{ margin: "0 0 8px" }}>{calcText}</p>
            <p className="xsmall" style={{ margin: 0 }}>
              पुस्तक स्रोत: <a className="linklike" href="https://www.rbi.org.in/" target="_blank" rel="noopener noreferrer">rbi.org.in</a>{" "}
              <span className="mono">{ent.circular_ref || "…"}</span> · pure Python ganaan (<span className="mono">statutory.py</span>), LLM केवल वाक्य narrative देता।
            </p>
          </div>
        </details>
      </section>

      <div className="row" style={{ marginTop: "var(--s-md)" }}>            <button className="btn btn--primary go" onClick={() => navigate("#/complaint-builder")}>
          शिकायत भरें · build the complaint
          <Arrow />
        </button>
        <a className="btn btn--line" href="#/fact-review">
          सच सुधारें <span className="pair"><span className="alt" lang="en-IN">edit the four facts</span></span>
        </a>
      </div>
    </>
  );
}
