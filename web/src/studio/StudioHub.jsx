import { useState } from "react";
import { VoiceRecorder, ScreenRecorder } from "../components/StudioRecorders.jsx";
import {
  listRecordings, removeRecording, clearRecordings, playbackURL, fmtDur, fmtTs,
} from "../lib/recordings.js";
import { Gallery, Mic, Video, Trash, Play, Warning } from "../components/Icon.jsx";

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
        <h1 className="d-lg" lang="hi-IN">स्टूडियो · रिकॉर्डिंग</h1>
        <p className="caption mute-2">Studio · check recordings &amp; create new ones</p>
        <p className="body mute-2" style={{ maxWidth: "62ch" }}>
          यहाँ आप आवाज़ का क्लिप या स्क्रीन कैप्चर बना सकते हैं, और सब चेक कर
          सकते हैं। सब कुछ इसी डिवाइस पर रहता है — सिंथेटिक डेमो।
          <span className="pair"><span className="alt" lang="en-IN">Record voice clips or screen captures, review them here — all on-device, synthetic demo.</span></span>
        </p>
      </div>

      <section className="studio-creators" aria-label="नई रिकॉर्डिंग · create">
        <div className="studio-create">
          <div className="studio-create-title"><Mic size={16} /> बोली · voice</div>
          <VoiceRecorder title="Voice clip" onSaved={refresh} />
        </div>
        <div className="studio-create">
          <div className="studio-create-title"><Video size={16} /> स्क्रीन · screen</div>
          <ScreenRecorder title="Screen capture" onSaved={refresh} />
        </div>
      </section>

      <section className="col" style={{ marginTop: "var(--s-md)" }} aria-label="रिकॉर्डिंग सूची">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="h2" lang="hi-IN">चेक करें · recordings ({recs.length})</h2>
          {recs.length > 0 && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => { clearRecordings(); refresh(); }}
            >
              <Trash size={14} /> सब हटाएँ · clear all
            </button>
          )}
        </div>

        {recs.length === 0 ? (
          <div className="card empty-state">
            <Gallery size={22} />
            <p className="body mute-2">अभी कोई रिकॉर्डिंग नहीं · no recordings yet</p>
            <p className="hint mute-3">ऊपर रिकॉर्ड करें और यहाँ चेक करें</p>
          </div>
        ) : (
          <ul className="rec-list">
            {recs.map((rec) => (
              <li key={rec.id} className="rec-item card">
                <div className="rec-item-head">
                  <span className="rec-kind">
                    {rec.kind === "voice" ? <Mic size={14} /> : <Video size={14} />}
                    {" "}{rec.kind === "voice" ? "Voice" : "Screen"}
                  </span>
                  <span className="rec-meta num">
                    {fmtTs(rec.ts)} · {fmtDur(rec.durMs)}
                  </span>
                  {rec.sessionOnly && <span className="chip chip--warn">session only</span>}
                </div>
                <div className="rec-title">{rec.title}</div>
                <Preview rec={rec} />
                <div className="rec-item-actions">
                  <Play size={13} />
                  <span className="mute-3">on-device · synthetic demo</span>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => { removeRecording(rec.id); refresh(); }}
                    aria-label="delete recording"
                  >
                    <Trash size={14} /> हटाएँ
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
