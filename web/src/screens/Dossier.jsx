/* Step 04b — the whole case in one folder, exportable.
   Mirrors frontend/screens/dossier.html: server dossier when the API session
   has one, else the honest device-assembled copy (synthetic demo constants,
   HV- case id). Statutory numbers are displayed, never recomputed here;
   the JSON download is exactly what this screen shows.                    */

import { useEffect, useRef, useState } from "react";
import { useMode } from "../hooks/useMode.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { useCaseFile, useCaseState } from "../lib/state.jsx";
import { api } from "../lib/api.js";
import { DEMO, AI_DISCLOSURE } from "../lib/demo.js";
import { fmtInr, fmtDate, fmtTs } from "../lib/format.js";
import { Stamp } from "../components/Svg.jsx";

/* dispute rows keep the old bilingual labels */
function disputeLabel(v) {
  return ({
    upi_p2p: "UPI पैसे कटे, पहुँचे नहीं · P2P",
    upi_p2m: "UPI दुकान/QR पर कटे · P2M",
    imps: "IMPS ट्रांसफ़र कटा, पहुँचा नहीं",
    atm_cash_not_dispensed: "ATM में नगद नहीं निकला",
    pos_card_debit: "POS / कार्ड से कटौती",
    unauthorised: "बिना मेरी जानकारी कटा · unauthorised",
  })[v] || "पक्का नहीं · not sure";
}

export default function Dossier() {
  const { state } = useCaseFile();
  const st = useCaseState();
  const mode = useMode();
  const toast = useToast();

  const builtRef = useRef(false);
  const [rec, setRec] = useState(null);
  const [fromServer, setFromServer] = useState(false);

  /* fresh state for the loader without re-running it */
  const stRef = useRef(st);
  stRef.current = st;

  /* ---- assemble the honest device copy (demo canned data everywhere) ---- */
  function assembleLocal(s) {
    const intake = s.intake || DEMO.intake;
    const ent =
      s.entitlement ||
      (intake.dispute_type === "unauthorised" ? DEMO.unauthorised : DEMO.entitlement);
    const call = s.call || null;
    const c = s.consent || {};
    return {
      case_id: "HV-" + Math.random().toString(16).slice(2, 12).toUpperCase(),
      citizen_intake: intake,
      statutory_entitlement: ent,
      complaint_draft: s.draft || DEMO.draft,
      call: call || DEMO.call,
      consent: {
        citizen_consent_verified: !!c.ts,
        consent_timestamp: c.ts || null,
        ai_disclosure_played: !!c.disclosure,
        disclosure_timestamp: c.ts || null,
        disclosure_text: c.disclosureText || AI_DISCLOSURE,
      },
      created_at: new Date().toISOString(),
    };
  }

  /* ---- load: server dossier → device copy; built exactly once ---- */
  useEffect(() => {
    if (builtRef.current) return;
    builtRef.current = true;
    if (mode !== "live") {
      setRec(assembleLocal(stRef.current));
      setFromServer(false);
      return;
    }
    api
      .get("/api/dossier")
      .then((r) => { setRec(r); setFromServer(true); })
      .catch(() => { setRec(assembleLocal(stRef.current)); setFromServer(false); });
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [mode]);

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (rec) setLoaded(true);
  }, [rec]);

  if (!rec) {
    return <p className="body mute-3">फ़ोल्डर बन रहा है… · assembling the dossier…</p>;
  }

  const docket =
    st.docket || (rec.call && rec.call.docket_id
      ? { id: rec.call.docket_id, verified: !!rec.call.verbatim_verified }
      : null);
  const cInt = rec.citizen_intake || DEMO.intake;
  const cEnt = rec.statutory_entitlement || DEMO.entitlement;
  const cDraft = rec.complaint_draft || {};
  const cCons = rec.consent || {};

  /* case id + stamp note (same three lines as the old screen) */
  const verified = Boolean(docket && docket.verified);
  let stampNote;
  if (verified) stampNote = "डॉकेट " + docket.id + " : शब्द-प्रति सत्यापित (verbatim)।";
  else if (docket && docket.id && docket.manual) stampNote = "डॉकेट " + docket.id + " : आपके लिखे शब्द (असत्यापित recall)।";
  else if (docket && docket.id) stampNote = "डॉकेट " + docket.id + " : असत्यापित; कॉल दोहराने पर पुष्ट करें।";
  else stampNote = "डॉकेट दर्ज नहीं हुआ : कॉल दोहराने पर पकड़ें।";

  /* facts ledger : eleven rows, values only ever displayed */
  const rows = [
    ["राशि · amount", fmtInr(cInt.amount_inr)],
    ["लेन-देन तारीख · txn date", fmtDate(cInt.txn_date)],
    ["शिकायत का प्रकार · dispute", disputeLabel(cInt.dispute_type)],
    ["UTR", cInt.utr ? cInt.utr : "नहीं दिया गया · not given"],
    ["बैंक", cInt.bank_name || "DemoBank Support"],
    ["बैंक की समय-सीमा (TAT)", fmtDate(cEnt.tat_date)],
    ["समय-सीमा पार · overdue", (cEnt.days_overdue || 0) + " दिन"],
    ["माँगी गई राशि · claim", fmtInr(cEnt.claim_inr)],
    ["क्षतिपूर्ति (₹100/दिन) · penalty", fmtInr(cEnt.penalty_inr || 0)],
    ["RBI परिपत्र · circular", (cEnt.circular_ref || "").split(" (")[0]],
    ["कुल दावा · total claimed", fmtInr(cEnt.total_inr)],
  ];

  /* safety kv : the same truth the safety bar shows */
  const sRows = [
    ["Consent (DPDP)", cCons.consent_timestamp ? "दर्ज · recorded " + fmtTs(cCons.consent_timestamp) : "अभी नहीं · not yet"],
    ["AI disclosure", cCons.ai_disclosure_played ? `"${AI_DISCLOSURE}"` : "अभी नहीं · not yet"],
    ["Secrets blocked (OTP/PIN/CVV)", String(st.secretsBlocked || 0)],
    ["Autonomous dialing", "0 : नागरिक ही डायल करता है · the citizen always dials"],
    ["Your call mode", mode === "live" ? "live API" : "synthetic demo only"],
  ];

  /* complaint draft display */
  const dText = cDraft.bank_complaint_text || DEMO.hindiDrafts.bank_complaint_text;
  const channels = [
    cDraft.whatsapp_draft ? "WhatsApp" : null,
    cDraft.email_draft ? "email" : null,
  ].filter(Boolean).join(" और ");
  const draftMeta = "बैंक शिकायत + " + (channels || "सारे चैनल") + " ड्राफ़्ट इसी सेशन में बने थे · bank complaint, WhatsApp and email drafts from this session";

  /* JSON export : exactly the record displayed; local builds carry a _note */
  function download() {
    const out = { ...rec };
    if (!fromServer) out._note = "assembled locally on this device : synthetic demo";
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (rec.case_id || "haqvaani-case") + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("फ़ोल्डर JSON सेव हो गया · case JSON saved");
  }

  return (
    <>
      <div className="col" style={{ gap: "var(--s-xs)" }}>
        <h1 className="d-lg" lang="hi-IN">पूरा मामला, एक फ़ोल्डर में।</h1>
        <p className="body mute-2" style={{ maxWidth: "62ch" }}>
          इस सेशन में जुटा सब कुछ : सच, सांविधिक हिसाब, शिकायत, कॉल, सहमति — एक रिकॉर्ड में। Synthetic demo data only.
          <span className="pair"><span className="alt" lang="en-IN">Everything this session collected : one record you can keep or print.</span></span>
        </p>
      </div>

      <section className="col" style={{ marginTop: "var(--s-md)", gap: "var(--s-md)" }} aria-label="केस फ़ोल्डर">
        {/* honesty: where this record came from */}
        <div className="state-strip is-demo">
          <p className="xsmall" style={{ margin: 0 }}>
            {fromServer ? (
              <>सर्वर सेशन से सत्यापित रिकॉर्ड लिया गया। statutory numbers still come from the Python engine, never from this page.</>
            ) : (
              <>यह फ़ोल्डर इसी डिवाइस पर जोड़ा गया <b>(synthetic demo)</b> : सर्वर से पूरा रिकॉर्ड उपलब्ध नहीं था · assembled on this device.</>
            )}
          </p>
        </div>

        {/* case identity + accent-verified stamp (drawn only when verbatim) */}
        <div className="card row" style={{ justifyContent: "flex-start", gap: 18 }}>
          {verified ? (
            <Stamp tone="accent" />
          ) : (
            <svg viewBox="0 0 56 56" width="56" height="56" aria-hidden="true">
              <circle cx="28" cy="28" r="25" fill="none" stroke="var(--line)" strokeWidth="2.5" strokeDasharray="4 6" />
            </svg>
          )}
          <div className="col" style={{ gap: 2 }}>
            <p className="xsmall mute-3" style={{ margin: 0 }}>केस आईडी · case id</p>
            <p className="big-id" style={{ margin: 0, wordBreak: "break-all" }}>{rec.case_id || "…"}</p>
            <p className="xsmall mute-3" style={{ margin: 0 }}>{stampNote}</p>
          </div>
        </div>

        {/* the whole case: ledger rows (staggered in, values only) */}
        <div className="ledger" aria-label="केस के तथ्य">
          {rows.map((r, i) => (
            <div className={"ledger-row" + (i === rows.length - 1 ? " total" : "")}
              style={{ "--i": i }} data-in={loaded || undefined} key={r[0]}>
              <span className="k">{r[0]}</span>
              <span className="v">{r[1]}</span>
            </div>
          ))}
        </div>

        {/* consent + safety, session truth */}
        <div className="card">
          <p className="h3" style={{ margin: "0 0 10px" }}>सहमति और सुरक्षा · consent &amp; safety</p>
          <div className="col" style={{ gap: 10 }}>
            {sRows.map((r) => (
              <div className="kv" key={r[0]}>
                <span className="k">{r[0]}</span>
                <span className="xsmall" style={{ textAlign: "right" }}>{r[1]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* complaint draft: kept text, expandable */}
        <div className="card">
          <p className="h3" style={{ margin: "0 0 6px" }}>शिकायत का ड्राफ़्ट · the complaint</p>
          <p className="xsmall mute-3" style={{ margin: "0 0 10px" }}>{draftMeta}</p>
          <details>
            <summary>पूरा हिंदी ड्राफ़्ट पढ़ें · read the full Hindi draft</summary>
            <pre className="draft-text" style={{ margin: "12px 0 0" }}>{dText}</pre>
          </details>
          <p className="xsmall" style={{ marginTop: 10 }}>
            संपादित करना हो तो : <a className="linklike" href="#/complaint-builder">builder में ड्राफ़्ट खुलेगा · open in the builder</a>
          </p>
        </div>

        {/* export row (hidden from print) */}
        <div className="row no-print">
          <button className="btn btn--primary" type="button" onClick={download} aria-label="केस JSON सेव करें">
            JSON सेव करें · download JSON
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 3v12" /><polyline points="6 9 12 15 18 9" /><path d="M4 21h16" /></svg>
          </button>
          <button className="btn btn--line" type="button" onClick={() => window.print()} aria-label="प्रिंट या PDF बनाएँ">
            प्रिंट / PDF <span className="pair"><span className="alt" lang="en-IN">print</span></span>
          </button>
        </div>

        <div className="row">
          <a className="btn btn--line" href="#/start-case">नया केस शुरू करें · start a new case</a>
          <a className="btn btn--line" href="#/">हक़-वाणी होम <span className="pair"><span className="alt" lang="en-IN">back to the start</span></span></a>
        </div>
      </section>
    </>
  );
}
