import { useEffect, useRef, useState } from "react";
import { useCapture } from "../hooks/useCapture.js";
import { useScreenCapture } from "../hooks/useScreenCapture.js";
import {
  addRecording, fmtDur, playbackURL,
} from "../lib/recordings.js";
import { T, useLang } from "../lib/i18n.jsx";
import { blobToWav } from "../lib/wav.js";
import { RecDot, Stop, Pause, Play, Mic, Video } from "./Icon.jsx";

/* Studio v2 — one honest recorder panel for voice (mic) and screen capture.
   Voice: mic → live waveform + timer → stop → clip auto-saved to the studio.
   Screen: share tab/window → timer → stop → clip auto-saved (session only).
   Every clip is local and synthetic-demo labelled. */

function useTimer(recording) {
  const [ms, setMs] = useState(0);
  useEffect(() => {
    if (!recording) {
      setMs(0);
      return undefined;
    }
    const t0 = Date.now();
    const iv = setInterval(() => setMs(Date.now() - t0), 250);
    return () => clearInterval(iv);
  }, [recording]);
  return ms;
}

function Waveform({ recording, paused, levelRef }) {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const hist = new Uint8Array(220);
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const cv = ref.current;
      if (!cv) return;
      const ctx = cv.getContext("2d");
      if (recording && !paused) {
        for (let i = 1; i < hist.length; i++) hist[i - 1] = hist[i];
        hist[hist.length - 1] = Math.max(1, Math.round(levelRef.current * cv.height));
      }
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = "rgba(244,241,234,0.9)";
      for (let x = 0; x < hist.length; x++) {
        const h = hist[x];
        if (!h) continue;
        ctx.fillRect(x, (cv.height - h) / 2, 1.6, h);
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [recording, paused, levelRef]);
  return <canvas ref={ref} className="wavebar" width="220" height="10" aria-hidden="true" />;
}

export function VoiceRecorder({ title, onSaved, onTooShort, onBlob, onStarted, autoSave = true }) {
  const capture = useCapture({ minSize: 400, onBlob: (b) => handleBlob(b) });
  const { lang } = useLang();
  const [note, setNote] = useState("idle"); // idle | listening | denied | missing | short | saved:<kb>
  const [diag, setDiag] = useState("");
  const [lastRec, setLastRec] = useState(null);
  const [busy, setBusy] = useState(false);
  const ms = useTimer(capture.recording);

  const NOTE_COPY = {
    idle: { en: "Press and speak", hi: "दबाइए और बोलिए" },
    listening: { en: "Listening…", hi: "सुन रहा है…" },
    denied: { en: "Microphone permission denied — allow mic in your browser", hi: "माइक की अनुमति नहीं मिली — ब्राउज़र में माइक अनुमति दें" },
    missing: { en: "No microphone found — plug one in and retry", hi: "माइक नहीं मिला — माइक जोड़कर दोबारा कोशिश करें" },
    short: { en: "That was too short — press record and speak a full sentence", hi: "बोली बहुत छोटी थी — रिकॉर्ड करके पूरा वाक्य बोलिए" },
  };
  const disp = note.startsWith("saved:")
    ? (lang === "hi" ? `रिकॉर्डिंग सेव हुई · ${note.split(":")[1]} KB` : `Clip saved to studio · ${note.split(":")[1]} KB`)
    : (NOTE_COPY[note] ? NOTE_COPY[note][lang] : note);

  async function handleBlob(blob) {
    if (!blob) {
      setNote("short");
      return;
    }
    /* normalize to WAV so the backend (no ffmpeg) can decode it */
    const wav = await blobToWav(blob, { sampleRate: 16000 });
    const uploadBlob = wav || blob;
    setDiag(`${(uploadBlob.size / 1024).toFixed(0)} KB · ${uploadBlob.type || blob.type || "audio/webm"}`);
    onBlob && onBlob(uploadBlob, ms);
    if (autoSave) {
      try {
        const rec = await addRecording({ kind: "voice", title, blob: uploadBlob, durMs: ms });
        onSaved && onSaved(rec);
        setLastRec(rec);
        setNote(`saved:${Math.max(1, Math.round(uploadBlob.size / 1024))}`);
        return;
      } catch { /* fall through */ }
    }
    onSaved && onSaved(null);
  }

  async function onMic() {
    if (capture.recording || busy) return;
    setBusy(true);
    setDiag("");
    try {
      await capture.start();
      setNote("listening");
      onStarted && onStarted();
    } catch (err) {
      const name = err && err.name;
      setNote(name === "NotAllowedError" || name === "PermissionDeniedError" ? "denied" : "missing");
      setDiag(name ? `${name}: ${err.message || ""}` : String(err));
    } finally {
      setBusy(false);
    }
  }

  const demoButton = onTooShort && (note === "short" || note === "denied" || note === "missing") ? (
    <button
      type="button"
      className="btn btn--ghost"
      onClick={() => { setNote("idle"); setDiag(""); onTooShort(); }}
    >
      <T en="Use demo text" hi="डेमो टेक्स्ट दिखाएँ" />
    </button>
  ) : null;

  return (
    <div className="rec-panel" data-kind="voice">
      <div className="rec-head">
        <span className="rec-kind"><Mic size={15} /> <T en="Voice clip" hi="बोली" /></span>
        <span className="rec-timer num">{fmtDur(ms)}</span>
      </div>
      <Waveform recording={capture.recording} paused={capture.paused} levelRef={capture.levelRef} />
      <p className={`caption mute-3 note-${note}`} aria-live="polite">{disp}</p>
      {diag && <p className="hint mute-3 num" style={{ fontSize: "12px" }}>{diag}</p>}
      {lastRec && playbackURL(lastRec) && (
        <div className="rec-preview">
          <span className="mute-3"><T en="Hear your clip:" hi="सुनिए:" /></span>
          <audio controls preload="none" src={playbackURL(lastRec)} className="preview-audio" />
        </div>
      )}
      <div className="rec-controls">
        {capture.recording ? (
          <>
            <button type="button" className="btn btn--ghost" onClick={() => capture.pause()} aria-label="pause/resume">
              {capture.paused ? <Play size={16} /> : <Pause size={16} />}
              {capture.paused ? <T en=" Resume" hi=" जारी" /> : <T en=" Pause" hi=" रोकें" />}
            </button>
            <button type="button" className="btn btn--primary" onClick={() => capture.stop()} aria-label="stop and save">
              <Stop size={16} /> <T en="Stop & save" hi="समाप्त · सेव करें" />
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn--primary rec-start" onClick={onMic} disabled={busy} aria-label="start recording">
              <RecDot size={16} /> <T en="Record" hi="रिकॉर्ड करें" />
            </button>
            {demoButton}
          </>
        )}
      </div>
    </div>
  );
}

export function ScreenRecorder({ title, onSaved, onError }) {
  const { lang } = useLang();
  const cap = useScreenCapture({ onBlob: (blob, dur) => save(blob, dur), onError });
  const [hint, setHint] = useState(
    lang === "hi" ? "शेयर करें और रिकॉर्ड शुरू · share tab to start" : "Share a tab/window to start"
  );
  const ms = useTimer(cap.recording);

  async function save(blob, dur) {
    try {
      const rec = await addRecording({ kind: "screen", title, blob, durMs: dur || ms });
      setHint(lang === "hi" ? "रिकॉर्डिंग सेव हुई · screen capture saved (session only)" : "Screen capture saved (session only)");
      onSaved && onSaved(rec);
    } catch (e) {
      onError && onError(e);
    }
  }

  return (
    <div className="rec-panel" data-kind="screen">
      <div className="rec-head">
        <span className="rec-kind"><Video size={15} /> <T en="Screen capture" hi="स्क्रीन रिकॉर्डिंग" /></span>
        <span className="rec-timer num">{fmtDur(ms)}</span>
      </div>
      <p className="caption mute-3" aria-live="polite">{hint}</p>
      <div className="rec-controls">
        {cap.recording ? (
          <button type="button" className="btn btn--primary" onClick={() => cap.stop()} aria-label="stop screen recording">
            <Stop size={16} /> <T en="Stop & save" hi="रोकें · सेव करें" />
          </button>
        ) : (
          <button type="button" className="btn btn--primary rec-start" onClick={() => cap.start()} disabled={cap.busy} aria-label="share screen and record">
            <Video size={16} /> <T en="Record screen" hi="स्क्रीन शेयर करें" />
          </button>
        )}
      </div>
      <p className="hint mute-3">
        <T
          en="Tab/window share — clip is session-only (synthetic demo)"
          hi="टैब / विंडो शेयर करें — वीडियो सिर्फ़ इस सेशन के लिए सेव होता है (सिंथेटिक डेमो)"
        />
      </p>
    </div>
  );
}
