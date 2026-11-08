/* Step 04 — the session record, minus the ceremony.
   Mirrors frontend/screens/post-call.html: docket + its honesty note, the
   bank's brush-off badge, the stall counter-script (spoken in Hindi), and
   the four next steps read straight from the Python-computed entitlement.  */

import { useRef } from "react";
import { useSpeak } from "../hooks/useSpeak.js";
import { useCaseFile } from "../lib/state.jsx";
import { DEMO, BRUSH_LABELS } from "../lib/demo.js";
import { fmtDate, fmtInr } from "../lib/format.js";

export default function PostCall() {
  const displayRef = useRef(false);
  if (!displayRef.current) displayRef.current = true; /* read-only render: no async load */

  const speak = useSpeak();
  const { state } = useCaseFile();
  const call = state.call;
  const ent = state.entitlement || DEMO.entitlement;
  const docket = state.docket || (call ? { id: call.docket_id, verified: !!call.verbatim_verified } : null);

  /* docket honesty note: verbatim proof / the citizen's recall / unverified */
  let dkNote;
  if (docket && docket.verified) dkNote = "शब्द-प्रति मेल खाया (verbatim) : मज़ूत सबूत।";
  else if (docket && docket.manual) dkNote = "आपने खुद लिखा : असत्यापित। कॉल दोहराने पर दोबारा पुष्ट करें।";
  else dkNote = "असत्यापित : पुष्टि फिर से हो, तो दोबारा सुनें।";

  /* brush badge + its one-line reply note */
  const b = BRUSH_LABELS[(call && call.brush_off_type) || "other"] || BRUSH_LABELS.other;
  const brushNote = b.kind === "bad"
    ? "OTP कभी नहीं देना है : बैंक ऐसा कभी पूछता नहीं। कॉल बंद करें और सुरक्षित शिकायत मार्ग अपनाएँ।"
    : "बैंक ने रोका। नीचे दिया जवाब इसी टाल के लिए है।";

  const sayHi = (call && call.suggested_script_hi) || DEMO.call.suggested_script_hi;

  /* next steps: honest list from stored python/demo values */
  const nextList = [
    <>
      <b className="num">{fmtDate(ent.tat_date)}</b> : बैंक की TAT समय-सीमा; आपकी आंखों से पीछा हो तो ₹100/दिन रोक-ठा बनती है (अब तक)।
    </>,
    <>बैंक का जवाब 30 दिन में नहीं आए : RBI CMS दर्ज करने का समय आ जाता है।</>,
    ent.eligible_for_rbi_cms ? (
      <>
        <a className="linklike" href="https://cms.rbi.org.in/" target="_blank" rel="noopener noreferrer">cms.rbi.org.in</a> : शिकायत दर्ज करें — तक : <b className="num">{fmtDate(ent.rbi_filing_deadline)}</b> (90 दिन की सीमा)।
      </>
    ) : (
      <>RBI CMS फिलहाल ज़रूरी नहीं : बैंक के अंदर दावा पूरा है। कुल दावा <b className="num">{fmtInr(ent.total_inr)}</b>।</>
    ),
    <>दोबारा कॉल हो तो हक़-वाणी के साथ : नया सेशन शुरू करके फिर वही प्रक्रिया।</>,
  ];

  return (
    <>
      <div className="col" style={{ gap: "var(--s-xs)" }}>
        <h1 className="d-lg" lang="hi-IN">कॉल समाप्त : यही रहा निष्कर्ष।</h1>
        <p className="body mute-2" style={{ maxWidth: "62ch" }}>
          नीचे सब आपके ही सेशन का रिकॉर्ड है : डॉकेट, बैंक की बोली, और टाले जाने पर क्या करना है।
          <span className="pair"><span className="alt" lang="en-IN">Everything below is your own session record.</span></span>
        </p>
      </div>

      <section className="col" style={{ marginTop: "var(--s-md)", gap: "var(--s-md)" }} aria-label="कॉल सारांश">
        {!call && (
          <div className="card">
            <p lang="hi-IN" style={{ margin: "0 0 12px" }}>कॉल अभी दर्ज नहीं हुई।</p>
            <a className="btn btn--primary" href="#/assisted-call">कॉल पर चलें · go to the call</a>
          </div>
        )}

        {call && (
          <>
            {/* docket */}
            <div className="card">
              <p className="xsmall mute-3" style={{ marginBottom: 6 }}>आपका डॉकेट नंबर · your docket number</p>
              <p className="num" style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
                {(docket && docket.id) || call.docket_id || "…"}
              </p>
              <p className="xsmall mute-3" style={{ marginTop: 6 }}>{dkNote}</p>
            </div>

            {/* brush-off */}
            <div className="card">
              <p className="xsmall mute-3" style={{ marginBottom: 8 }}>बैंक ने क्या कहा · what the bank said</p>
              <span className={"brush-badge " + b.kind}>{b.hi} · {b.en}</span>
              <p className="xsmall" lang="hi-IN" style={{ margin: "12px 0 0", color: "var(--ink-2)" }}>{brushNote}</p>
            </div>

            {/* the stall counter-script, spoken in Hindi */}
            <div className="scriptcard">
              <p className="xsmall mute-3" style={{ marginBottom: 12 }}>
                अगर बैंक टाले तो यह बोलिए · if the bank stalls, say this (Hindi)
              </p>
              <p className="say" lang="hi-IN">{sayHi}</p>
              <div className="row" style={{ marginTop: 16 }}>
                <button className="btn btn--line" type="button" aria-label="हिन्दी जवाब आवाज़ में सुनें" onClick={() => speak(sayHi, "hi")}>
                  सुनिए · hear it
                </button>
              </div>
            </div>

            {/* what to do next */}
            <div className="card">
              <p className="h3" style={{ margin: "0 0 10px" }}>आगे क्या · next steps</p>
              <ul className="evlist">
                {nextList.map((Item, i) => (
                  <li className="xsmall evrow" key={i} lang="hi-IN">{Item}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </section>

      <div className="row" style={{ marginTop: "var(--s-md)" }}>
        <a className="btn btn--primary" href="#/dossier">
          पूरा केस फ़ोल्डर देखें · the whole dossier
          <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
        </a>
        <a className="btn btn--line" href="#/docket-capture">
          डॉकेट पर वापस <span className="pair"><span className="alt" lang="en-IN">back to the docket</span></span>
        </a>
      </div>
    </>
  );
}
