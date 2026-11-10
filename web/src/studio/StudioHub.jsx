import { useState } from "react";
import { VoiceRecorder, ScreenRecorder } from "../components/StudioRecorders.jsx";
import {
  listRecordings, removeRecording, clearRecordings, playbackURL, fmtDur, fmtTs,
} from "../lib/recordings.js";
import { Gallery, Mic, Video, Trash, Play, Warning, Arrow, File, Shield } from "../components/Icon.jsx";
import { T } from "../lib/i18n.jsx";
import { navigate } from "../lib/router.js";

const FLOW_STEPS = [
  { icon: Mic, path: "/voice-intake", en: "Speak your issue", hi: "अपनी समस्या बोलिए" },
  { icon: Shield, path: "/rights-check", en: "See your rights & claim", hi: "अपने अधिकार देखिए" },
  { icon: File, path: "/dossier", en: "Collect complaint + proof", hi: "शिकायत और सबूत बनाइए" },
];

function FlowStarter() {
  return (
    <section className="flow-banner card" aria-label="start a complaint">
      <div className="flow-banner-copy">
        <h2 className="h2" lang="en-IN"><T en="Start a real complaint" hi="शिकायत दर्ज करें" /></h2>
        <p className="body mute-2">
          <T
            en="Speak your failed-UPI issue in your own words — then auto-review facts, rights, and build your complaint."
            hi="अपने असफल UPI की समस्या अपने शब्दों में बोलिए — फिर सच, अधिकार और शिकायत अपने-आप बनती है।"
          />
        </p>
      </div>
      <button type="button" className="btn btn--primary" onClick={() => navigate("/start-case")}>
        <Mic size={16} /> <T en="Start case →" hi="केस शुरू करें →" />
      </button>
    </section>
  );
}

function FlowSteps() {
  return (
    <section className="flow-steps" aria-label="case journey">
      {FLOW_STEPS.map((s, i) => (
        <button type="button" key={s.path} className="flow-step card" onClick={() => navigate(s.path)}>
          <span className="flow-step-idx num">0{i + 1}</span>
          <s.icon size={18} />
          <span className="flow-step-label"><T en={s.en} hi={s.hi} /></span>
          <Arrow size={14} />
        </button>
      ))}
    </section>
  );
}

/* Studio v2 — the recording hub.
   Two ways to create (voice clip / screen capture) + a gallery to check
   recordings (play, delete, clear). Everything stays on-device and is
   labelled synthetic demo. */

function Preview({ rec }) {
  const url = playbackURL(rec);
  if (!url) {
    return (
      <div className="preview-empty"><Warning size={16} /> no playback (session gone)</div>
    );
  }
  if (rec.kind === "voice") {
    return <audio controls preload="none" src={url} className="preview-audio" />;
  }
  return <video controls preload="metadata" src={url} className="preview-video" />;
}

export default function StudioHub() {
  const [, tick] = useState(0);
  const refresh = () => tick((n) => n + 1);
  const recs = listRecordings();

  return (
    <>
      <div className="col" style={{ gap: "var(--s-xs)" }}>
        <h1 className="d-lg" lang="en-IN">
          <T en="Studio · Recordings" hi="स्टूडियो · रिकॉर्डिंग" />
        </h1>
        <p className="caption mute-2"><T en="Your case control room — record, review, and follow the complaint journey" hi="आपके केस का कंट्रोल रूम — रिकॉर्ड करें, देखें और शिकायत का सफ़र जारी रखें" /></p>
      </div>

      <FlowStarter />
      <FlowSteps />

      <section className="studio-creators" aria-label="create recordings">
        <div className="studio-create">
          <div className="studio-create-title"><Mic size={16} /> <T en="Voice" hi="बोली" /></div>
          <VoiceRecorder title="Voice clip" onSaved={refresh} />
        </div>
        <div className="studio-create">
          <div className="studio-create-title"><Video size={16} /> <T en="Screen" hi="स्क्रीन" /></div>
          <ScreenRecorder title="Screen capture" onSaved={refresh} />
        </div>
      </section>

      <section className="col" style={{ marginTop: "var(--s-md)" }} aria-label="recordings list">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="h2" lang="en-IN"><T en={`Recordings (${recs.length})`} hi={`चेक करें · रिकॉर्डिंग (${recs.length})`} /></h2>
          {recs.length > 0 && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => { clearRecordings(); refresh(); }}
            >
              <Trash size={14} /> <T en="Clear all" hi="सब हटाएँ" />
            </button>
          )}
        </div>

        {recs.length === 0 ? (
          <div className="card empty-state">
            <Gallery size={22} />
            <p className="body mute-2"><T en="No recordings yet" hi="अभी कोई रिकॉर्डिंग नहीं" /></p>
            <p className="hint mute-3"><T en="Record above and check them here" hi="ऊपर रिकॉर्ड करें और यहाँ चेक करें" /></p>
          </div>
        ) : (
          <ul className="rec-list">
            {recs.map((rec) => (
              <li key={rec.id} className="rec-item card">
                <div className="rec-item-head">
                  <span className="rec-kind">
                    {rec.kind === "voice" ? <Mic size={14} /> : <Video size={14} />}
                    {" "}{rec.kind === "voice" ? <T en="Voice" hi="बोली" /> : <T en="Screen" hi="स्क्रीन" />}
                  </span>
                  <span className="rec-meta num">
                    {fmtTs(rec.ts)} · {fmtDur(rec.durMs)}
                  </span>
                  {rec.sessionOnly && <span className="chip chip--warn"><T en="session only" hi="केवल सेशन" /></span>}
                </div>
                <div className="rec-title">{rec.title}</div>
                <Preview rec={rec} />
                <div className="rec-item-actions">
                  <Play size={13} />
                  <span className="mute-3"><T en="on-device · synthetic demo" hi="डिवाइस पर · सिंथेटिक डेमो" /></span>
                  {rec.kind === "voice" && (
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      onClick={() => navigate("/voice-intake")}
                      aria-label="use in complaint"
                    >
                      <Arrow size={14} /> <T en="Use in complaint" hi="शिकायत में प्रयोग करें" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => { removeRecording(rec.id); refresh(); }}
                    aria-label="delete recording"
                  >
                    <Trash size={14} /> <T en="Delete" hi="हटाएँ" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
