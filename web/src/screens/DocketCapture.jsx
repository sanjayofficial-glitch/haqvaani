/* Step 03b — the verbatim test on the one string that proves the complaint.
   Mirrors frontend/screens/docket-capture.html: verified → the stamp +
   the transcript with the docket in a hard <mark>; anything else → the
   honest reasons (missing candidate / verbatim miss / brush-off class),
   the OTP toast, and the citizen's own recall as the fallback.           */

import { useEffect, useRef, useState } from "react";
import { useToast } from "../hooks/useToast.jsx";
import { useCaseFile, useCaseState } from "../lib/state.jsx";
import { BRUSH_LABELS } from "../lib/demo.js";
import { navigate } from "../lib/router.js";
import { Stamp, StampVintage } from "../components/Icon.jsx";
import { Check, Eye, Phone, Arrow } from "../components/Icon.jsx";
import { DocketScene } from "./art/CaseArt.jsx";

/* the transcript with the docket hard-marked, as plain JSX (never innerHTML) */
function hearText(transcript, docket) {
  const raw = String(transcript || "");
  const did = String(docket || "");
  const i = raw.toLowerCase().indexOf(did.toLowerCase());
  if (i < 0) return raw;
  return (
    <>
      {raw.slice(0, i)}
      <mark className="match">{raw.substr(i, did.length)}</mark>
      {raw.slice(i + did.length)}
    </>
  );
}

export default function DocketCapture() {
  const { state, commit } = useCaseFile();
  const st = useCaseState();
  const toast = useToast();
  const call = st.call;

  const [checked, setChecked] = useState(Boolean(st.docket && st.docket.verified));
  const [manual, setManual] = useState("");
  const otpToastRef = useRef(false);

  /* that one brush-off gets exactly one loud warning per visit */
  useEffect(() => {
    if (call && call.brush_off_type === "request_kyc_otp" && !otpToastRef.current) {
      otpToastRef.current = true;
      toast("OTP माँगा गया : काल बंद करें · someone asked for OTP : stop the call", "bad");
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [call]);

  /* the three honest buckets: no call / verified / reasons */
  const noCall = !call;
  const verified = Boolean(call && call.docket_id && call.verbatim_verified && call.transcript);

  /* failure reasons in the old order and wording */
  const reasons = [];
  if (call) {
    if (!call.docket_candidate)
      reasons.push({ cls: "bad", text: "डॉकेट जैसा कोई नंबर सुनाई नहीं दिया · nothing that looked like a docket was heard" });
    if (call.docket_candidate && !call.verbatim_verified)
      reasons.push({ cls: "warn", text: "सुना गया नंबर बैंक के शब्दों से बिल्कुल मेल नहीं खाया (verbatim नियम) · heard digits did not match verbatim" });
    if (call.brush_off_type) {
      const b = BRUSH_LABELS[call.brush_off_type];
      if (b)
        reasons.push({
          cls: b.kind === "bad" ? "bad" : "warn",
          text: (b.kind === "bad" ? "बैंक का OTP माँगा : कभी मत दें · " : "टाल रहे हैं: ") + b.hi + " · " + b.en,
        });
    }
  }
  if (!reasons.length) reasons.push({ cls: "bad", text: "अनजाना कारक · unknown reason : try again" });

  function saveManual() {
    const v = manual.trim();
    if (!v) { toast("पहले नंबर जैसा सुना लिखिए · type what you heard first", "bad"); return; }
    commit({ docket: { id: v, verified: false, manual: true } });
    toast("आपके शब्दों में दर्ज (असत्यापित) · noted from your recall (unverified)");
    navigate("#/post-call");
  }

  return (
    <>
      <div className="col" style={{ gap: "var(--s-xs)" }}>
        <h1 className="d-lg" lang="hi-IN">डॉकेट नंबर पकड़ लिया गया?</h1>
        <p className="body mute-2" style={{ maxWidth: "62ch" }}>
          यही अंक वह सबूत हैं कि आपकी शिकायत मौजूद है। Verbatim मिलान : बैंक ने जिस क्रम में बोले, उसी में।
          <span className="pair"><span className="alt" lang="en-IN">The one string of digits that proves the complaint exists. Verbatim match only.</span></span>
        </p>
      </div>

      <div className="art" aria-hidden="true" style={{ marginTop: "var(--s-md)" }}>
        <DocketScene />
      </div>

      <section className="col" style={{ marginTop: "var(--s-md)", gap: "var(--s-md)" }} aria-label="डॉकेट जाँच">
        {noCall && (
          <div className="card">
            <p lang="hi-IN" style={{ margin: "0 0 12px" }}>पहले कॉल सुनाई नहीं दी गई।</p>
            <a className="btn btn--primary" href="#/assisted-call">कॉल पर वापस · back to the call</a>
          </div>
        )}

        {!noCall && verified && (
          <>
            <div className="card row" style={{ justifyContent: "flex-start", gap: 18 }}>
              <Stamp tone="accent" />
              <div>
                <p className="xsmall" style={{ fontWeight: 600, margin: "0 0 4px", color: "var(--accent)" }}>
                  शाबाश · verbatim verified
                </p>
                <p className="big-id" style={{ margin: 0 }}>{call.docket_id}</p>
                <p className="xsmall mute-3" style={{ marginTop: 6 }}>बिल्कुल इसी रूप में सुना गया · captured exactly as spoken</p>
              </div>
            </div>
            <div className="card transcript-card hear-strip">
              <div className="t-label">सबूत · how it matched : डॉकेट उभार में highlighted in the strip</div>
              <div className="t-text" lang="hi-IN">{hearText(call.transcript, call.docket_id)}</div>
            </div>
            <div className="check-row card" style={{ padding: "16px 18px" }}>
              <input type="checkbox" id="okCheck" checked={checked}
                onChange={(e) => {
                  setChecked(e.target.checked);
                  commit({ docket: { id: call.docket_id, verified: e.target.checked } });
                }} />
              <label htmlFor="okCheck" style={{ margin: 0 }}>
                <span lang="hi-IN">मैंने खुद सुना/पढ़ा : यह नंबर मेरी शिकायत का डॉकेट है।</span>
                <span className="xsmall mute-3" style={{ display: "block" }}>I heard it myself : this is my complaint's docket.</span>
              </label>
            </div>
          </>
        )}

        {/* the honest failure block: reasons first, then the recall path */}
        {!noCall && !verified && (
          <>
            <div className="card" style={{ borderLeft: "4px solid var(--accent)" }}>
              <p className="h3" style={{ margin: "0 0 8px" }}>अंक पक्के नहीं दिखे · could not verify the digits</p>
              <ul className="evlist">
                {reasons.map((r, i) => (
                  <li className="xsmall evrow" key={i} style={{ padding: "6px 0" }}>
                    <span className={r.cls}>{r.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <p lang="hi-IN" style={{ margin: "0 0 10px" }}>
                जो आपने अपने कानों से सुना, वही लिखिए : आपका शब्द ही माना जाएगा। बिना पुष्टि के भी आगे बढ़ सकते हैं, पोस्ट-कॉल में साफ़ लिखा रहेगा।
                <span className="pair"><span className="alt" lang="en-IN">Type what you heard yourself; it is recorded as your recall, clearly unverified.</span></span>
              </p>
              <div className="field">
                <label htmlFor="manualId">नंबर जैसे सुना, वैसा लिखिए · type the number as you heard it</label>
                <input id="manualId" type="text" autoComplete="off" spellCheck="false"
                  placeholder="SR-884120" value={manual} onChange={(e) => setManual(e.target.value)} />
              </div>
              <div className="row" style={{ marginTop: 14 }}>
                <button className="btn btn--primary" type="button" onClick={saveManual}>
                  मेरी पक्ष पर दर्ज करें · record my recall
                  <StampVintage />
                </button>
              </div>
            </div>

        {/* case id chip */}
        <div className="case-id-row" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StampVintage size={14} />
          <span className="xsmall mute-3">सबूत की शर्त : यही नंबर।</span>
        </div>
            <div className="row">
              <a className="btn btn--line" href="#/assisted-call">
                <Phone size={14} /> फिर सुनें
                <span className="pair"><span className="alt" lang="en-IN">listen again</span></span>
              </a>
              <a className="btn btn--line" href="#/post-call">
                <Eye size={14} /> बिना नंबर आगे बढ़ें
                <span className="pair"><span className="alt" lang="en-IN">continue without a docket</span></span>
              </a>
            </div>
          </>
        )}

        {!noCall && (
          <div className="row">
            <a className="btn btn--line" href="#/post-call">
              <Eye size={14} /> कॉल समाप्त : आगे क्या · post-call notes
              <Arrow />
            </a>
            <a className="btn btn--line" href="#/assisted-call">
              <Phone size={14} /> फिर सुनें
              <span className="pair"><span className="alt" lang="en-IN">listen again</span></span>
            </a>
          </div>
        )}
      </section>
    </>
  );
}
