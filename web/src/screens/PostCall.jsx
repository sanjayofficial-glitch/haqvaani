/* Step 04 — you dial, HaqVaani listens on your side only (AssistedCall replay + docket review).
   Mirrors frontend/screens/post-call.html (Simulated IVR / synthetic demo):
   the recorded/synthetic reply replay above, then the docket-number capture that
   feeds /api/docket via haqvaani/api.py (or the honest demo fallback).        */

import { useState } from "react";
import { useMode } from "../hooks/useMode.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { useCaseFile, useCaseState } from "../lib/state.jsx";
import { api } from "../lib/api.js";
import { DEMO } from "../lib/demo.js";
import { fmtTs } from "../lib/format.js";
import { navigate } from "../lib/router.js";
import { Eye, Stamp, StampVintage, Warning, Trash } from "../components/Icon.jsx";
import { DocketScene } from "./art/CaseArt.jsx";

export default function PostCall() {
  const { commit } = useCaseFile();
  const st = useCaseState();
  const mode = useMode();
  const toast = useToast();

  const stRef = () => st;

  const [playing, setPlaying] = useState(false);
  const [tText, setTText] = useState("");
  const [docket, setDocket] = useState(null);
  const [note, setNote] = useState("");

  const call = stRef().call || DEMO.call;
  const intake = stRef().intake || DEMO.intake;

  const tSrc = tText || call.transcript || DEMO.ivr;
  const btnLabel = playing ? "वापस · back" : "बोली सुनें · hear the bank's reply";

  const customId = (b) => {
    const m = b.match(/(?:sr[- ]?db[- ]?)?(\d{4,8})/i);
    return m ? m[1] : null;
  };

  async function postDocket(btn) {
    const id = b.trim();
    if (!id) { toast("कृपया एक डॉकेट नंबर दीजिए · please enter a docket number", "bad"); return; }
    const custom = customId(id);
    const body = {
      docket_id: id,
      verified: Boolean(custom),
      note: note.trim() || undefined,
      source: "typed",
      intake: intake,
    };
    if (mode === "live") {
      try {
        const r = await api.post("/api/docket", body);
        setDocket(r);
        toast("डॉकेट दर्ज · docket filed", "good");
        btn.disabled = true;
        return;
      } catch {
        toast("API नहीं मिला : स्थानीय दस्तावेज़ · local record only", "bad");
      }
    }
    const demo = { ...body, __demo: true, filed_at: fmtTs(Date.now()), id: body.docket_id };
    setDocket(demo);
    commit({ docket: demo });
    toast("डॉकेट दर्ज (डेमो) · docket filed (demo)", "good");
    btn.disabled = true;
  }

  function playIt(btn) {
    if (playing) { setPlaying(false); return; }
    setPlaying(true);
    setTimeout(() => setPlaying(false), 3500);
  }

  return (
    <div className="col" style={{ gap: "var(--s-md)", paddingTop: "var(--s-sm)", paddingBottom: "var(--s-xs)" }}>
      <div className="col" style={{ gap: "var(--s-xs)" }}>
        <h1 className="d-lg" lang="hi-IN">क्या दस्तावेज़ हुआ।</h1>
        <p className="body mute-2" style={{ maxWidth: "64ch" }}>
          बोली ऊपर है : जो मिला उसका नंबर लिखिए, यहाँ से। पता ही दस्तावेज़ है।
          <span className="pair"><span className="alt" lang="en-IN">The reply is above : write down the number you got — that's the record.</span></span>
        </p>
        <p className="caption mute-3">{DEMO.AI_DISCLOSURE}</p>
      </div>

      <div className="art" aria-hidden="true" style={{ marginTop: "var(--s-sm)" }}>
        <DocketScene />
      </div>

      <section className="col" style={{ gap: "var(--s-sm)", padding: "var(--s-xs) 0 var(--s-sm)" }} aria-label="बोली">
        <div className="card transcript-card">
          <div className="t-label">{call.source === "typed" ? "आपने जो लिखा · your typed reply" : "बैंक की बोली · what the bank said"}</div>
          <div className="t-text" lang="hi-IN">{tSrc}</div>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn btn--line" type="button" onClick={(b) => playIt(b)}>
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.5 8.5a4 4 0 0 1 0 7" /></svg>
              {playing ? "रुके · pause" : "सुनें · play"}
            </button>
            <button className="btn btn--line" type="button" disabled={playing} onClick={() => setTText("")}>
              <Trash tone="ink" />
              साफ़ · clear
            </button>
          </div>
        </div>
      </section>

      <section className="col" style={{ gap: "var(--s-sm)", paddingTop: "var(--s-xs)" }} aria-label="डॉकेट नंबर लिखें">
        <div className="card">
          <p className="h3" style={{ margin: "0 0 10px" }}>डॉकेट नंबर · docket number</p>
          <p className="xsmall mute-2" style={{ margin: "0 0 10px" }}>
            बैंक से जो नंबर ordered, लिखें। कभी-कभी service request number कहलाता है।
            <span className="pair"><span className="alt" lang="en-IN">Write down the number the bank gives you. It's sometimes called a service request number.</span></span>
          </p>
          <div className="row" style={{ gap: "var(--s-xs)" }}>
            <input
              className="field-input"
              id="docketId"
              type="text"
              placeholder="जैसे SR-DB-884120 · e.g. SR-DB-884120"
              value={docket?.id || ""}
              onChange={(e) => setDocket({ id: e.target.value })}
              style={{ flex: 1 }}
            />
            <button className="btn btn--primary" type="button" onClick={(b) => postDocket(b)} style={{ flex: "0 0 auto" }}>
              दस्तावेज़ · file
            </button>
          </div>
          <p className="xsmall mute-3" style={{ margin: "8px 0 0" }}>
            हक़-वाणी केवल आपकी तरफ़ सुनता है : सर्विस रिक्वेस्ट या OTP नहीं भेजता।
            <span className="pair"><span className="alt" lang="en-IN">HaqVaani listens on your side only : it never dials out or sends your OTP.</span></span>
          </p>
        </div>

        {docket && (
          <div className="card" style={{ borderLeft: "4px solid var(--accent)" }}>
            <p className="xsmall mute-3" style={{ margin: "0 0 6px" }}>बैंक से जो मिला · what you got from the bank</p>
            <p className="y-block">
              <StampVintage size={16} /> नंबर मिला : <b>{docket.id}</b>
            </p>
            {docket.note && <p className="y-small mute-2" style={{ margin: "6px 0 0" }}>नोट: {docket.note}</p>}
            <p className="y-small mute-2" style={{ margin: "6px 0 0" }}>
              यह दस्तावेज़ आपके साथ ही रहता है। हक़-वाणी आवाज़ नहीं पहचानता।
            </p>
          </div>
        )}

        <div className="call-foot">
          <div className="call-foot-row">
            <Warning size={15} />
            <p className="xsmall mute-3" style={{ margin: 0 }}>
              जो भी OTP/PIN/CVV माँगे, बात समाप्त कर दीजिए। हक़-वाणी इनका वर्णन नहीं करता।
              <span className="pair"><span className="alt" lang="en-IN">If anyone asks for OTP/PIN/CVV, end the call. HaqVaani does not read these out.</span></span>
            </p>
          </div>
        </div>
      </section>

      <div className="row" style={{ marginTop: "var(--s-md)" }}>
        <a className="btn btn--line" href="#/assisted-call">
          <Eye size={14} /> वापस सुनने · back to call
        </a>
        <button className="btn btn--primary" type="button" onClick={() => navigate("#/dossier")}>
          शिकायत प्रपत्र ले लो
          <Stamp />
        </button>
      </div>
    </div>
  );
}
