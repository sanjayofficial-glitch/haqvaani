/* Step 03 — you dial, HaqVaani listens on your side only.
   Mirrors frontend/screens/assisted-call.html (Simulated IVR / synthetic
   demo): mic record (120 s cap, auto-stop), the reply is uploaded to
   /api/assisted as ivr_audio, or the honest typed path sends text as a
   text blob; too-short recordings fall back to the synthetic reply.
   Consent gate lives in App.jsx (consent: true on the route).            */

import { useEffect, useRef, useState } from "react";
import { useCapture } from "../hooks/useCapture.js";
import { useMode } from "../hooks/useMode.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { useCaseFile, useCaseState } from "../lib/state.jsx";
import { api } from "../lib/api.js";
import { DEMO } from "../lib/demo.js";
import { substringVerify } from "../lib/format.js";

export default function AssistedCall() {
  const { commit } = useCaseFile();
  const st = useCaseState();
  const mode = useMode();
  const toast = useToast();

  /* fresh state for the async paths */
  const stRef = useRef(st);
  stRef.current = st;

  const capture = useCapture({
    minSize: 1200,
    /* too short → the honest synthetic reply, exactly like the old screen */
    onBlob: (blob) => (blob ? processBlob(blob) : demoAssisted(null, false)),
  });

  const [pill, setPill] = useState(""); /* "" | listening | done */
  const [pillText, setPillText] = useState("तैयार : बैंक जुड़ने के बाद दबाइए।");
  const [tLabel, setTLabel] = useState("बैंक की बोली · what the bank said : शेयर नहीं होगा");
  const [tText, setTText] = useState("…");
  const [after, setAfter] = useState(false);
  const [paste, setPaste] = useState("");
  const maxTimer = useRef(null);

  /* the client-side result goes out the same shape as /api/assisted */
  function saveCall(r, source) {
    commit({ call: { ...r, source } });
    setTLabel("बैंक की बोली · what the bank said : शेयर नहीं होगा");
    setPill("done");
    setPillText("बोली पढ़ ली गई · reply captured : बैंक की पूरी बोली ऊपर");
    setAfter(true);
  }

  /* mirrors /api/assisted demo path: DEMO.ivr → SR-DB-884120 (server-verifies) */
  function demoAssisted(transcript, typed) {
    const t = transcript || DEMO.ivr;
    const result = {
      transcript: t,
      docket_candidate: "SR-DB-884120",
      verbatim_verified: substringVerify("SR-DB-884120", t),
      docket_id: "SR-DB-884120",
      brush_off_type: "other",
      suggested_script_en: DEMO.call.suggested_script_en,
      suggested_script_hi: DEMO.call.suggested_script_hi,
      typed: Boolean(typed),
      demo: true,
    };
    setTText(t);
    saveCall(result, typed ? "typed" : "synthetic-demo");
  }

  async function processBlob(blob) {
    setPill("");
    setPillText("पढ़ा जा रहा है… · reading the reply…");
    if (mode === "live") {
      try {
        const r = await api.upload("/api/assisted", "ivr_audio", blob, stRef.current.intake || DEMO.intake);
        setTText(r.transcript || "…");
        saveCall(r, "recorded");
        return;
      } catch {
        toast("API नहीं मिला : सिम्युलेटेड जवाब दिखाया जा रहा है (synthetic demo)", "bad");
      }
    }
    demoAssisted(null, false);
  }

  async function onListen() {
    if (capture.recording) return;
    setPill("listening");
    setPillText("सुन रहा है… बैंक जुड़ने दीजिए · listening…");
    try {
      await capture.start();
      /* 120 s cap: assisted listening never runs without a citizen holding it */
      maxTimer.current = setTimeout(() => capture.stop(), 120000);
    } catch {
      setPill("");
      setPillText("माइक नहीं मिला : टाइप वाला रास्ता खुला है · no mic : use the typed path below");
      toast("माइक अनुमति से भी बिना : नीचे टाइप करके देखें", "bad");
    }
  }

  function onStop() {
    clearTimeout(maxTimer.current);
    maxTimer.current = null;
    capture.stop();
  }

  /* typed path: text is never sent as audio; it's the citizen's own words */
  async function useText() {
    const text = paste.trim();
    if (!text) { toast("पहले लिखिए जो सुना · nothing typed yet", "bad"); return; }
    setPillText("पढ़ा जा रहा है… · reading the reply…");
    if (mode === "live") {
      try {
        const r = await api.upload("/api/assisted", "ivr_audio", new Blob([text]), stRef.current.intake || DEMO.intake);
        setTText(r.transcript || text);
        saveCall(r, "typed");
        return;
      } catch {
        toast("API नहीं मिला : स्थानीय पढ़ाई दिखेगी (display aid only)", "bad");
      }
    }
    demoAssisted(text, true);
  }

  /* prior result on re-entry (old screen's "previous hearing" block) */
  useEffect(() => {
    const prev = stRef.current.call;
    if (prev && prev.docket_candidate !== undefined) {
      setTLabel("पिछली पढ़ाई · previous hearing (केवल आपके साथ रहता है)");
      setTText(prev.transcript || "…");
      setAfter(true);
      setPill("done");
      setPillText("पिछला नतीजा मौजूद · previous result loaded");
    }
  }, []);

  function again() {
    setAfter(false);
    setPill("");
    setPillText("तैयार : फिर दबाइए जब कॉल लगे।");
    setTLabel("बैंक की बोली · what the bank said : शेयर नहीं होगा");
    setTText("…");
  }

  const recording = capture.recording;

  return (
    <>
      <div className="col" style={{ gap: "var(--s-xs)" }}>
        <h1 className="d-lg" lang="hi-IN">फ़ोन आपके हाथ में। मैं सुन रहा हूँ।</h1>
        <p className="body mute-2" style={{ maxWidth: "62ch" }}>
          Simulated IVR / synthetic demo. आप बैंक को डायल करते हैं : हक़-वाणी केवल आपकी तरफ़ सुनता है और डॉकेट नंबर पकड़ता है।
          <span className="pair"><span className="alt" lang="en-IN">Simulated IVR / synthetic demo. You dial the bank : HaqVaani only listens on your side.</span></span>
        </p>
      </div>

      <section className="col" style={{ marginTop: "var(--s-md)", gap: "var(--s-md)" }} aria-label="सहायता कॉल">
        {/* status pill: ready → listening → captured */}
        <div className={"status-pill " + pill} role="status" aria-live="polite">
          <span className="pdot" aria-hidden="true"></span>
          <span>{pillText}</span>
        </div>

        <div className="call-stage">
          <div className="row">
            <button className="btn btn--primary" type="button" aria-pressed={recording}
              aria-label="सुनना चालू करें" disabled={recording} onClick={onListen}>
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /></svg>
              सुनना शुरू · start listening
            </button>
            <button className="btn btn--ink" type="button" disabled={!recording}
              aria-label="सुनना बंद करें और नंबर पढ़ें" onClick={onStop}>
              बंद रोकें <span className="xsmall">stop &amp; read</span>
            </button>
          </div>
          <p className="xsmall mute-3">
            बैंक जो बोलेगा, हक़-वाणी वही लिखेगा : केवल आपकी तरफ़ की रिकॉर्डिंग (2 मिनट की सीमा)।
            <span className="pair"><span className="alt" lang="en-IN">Point your phone's speaker at the laptop mic or record both sides : capped at 120 s.</span></span>
          </p>
        </div>

        <div className="card transcript-card">
          <div className="t-label">{tLabel}</div>
          <div className="t-text" lang="hi-IN">{tText}</div>
        </div>

        <div className="row" hidden={!after}>
          <a className="btn btn--primary" href="#/docket-capture">
            नंबर देखें और मंजूर करें · review the docket
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </a>
          <button className="btn btn--line" type="button" onClick={again}>फिर सुनें · listen again</button>
        </div>

        {/* no mic? what you heard, typed honestly */}
        <details className="typed-box">
          <summary className="xsmall mute-3">माइक नहीं? आपने जो सुना वह लिखिए · no mic? type what you heard</summary>
          <div className="col" style={{ marginTop: 12 }}>
            <label className="xsmall mute-2" htmlFor="pasteTa">
              बैंक की बोली लिखिए : डॉकेट नंबर उसी में रहे तो बेहतर।
              <span className="pair"><span className="alt" lang="en-IN">Paste or type the bank's reply : include the docket if there is one.</span></span>
            </label>
            <textarea id="pasteTa" className="paste-ta" aria-label="आपकी सुनी हुई बोली"
              value={paste} onChange={(e) => setPaste(e.target.value)} />
            <div className="row">
              <button className="btn btn--line" type="button" onClick={useText}>इसी पर चलें · use this</button>
            </div>
          </div>
        </details>
      </section>
    </>
  );
}
