/* Step 00 — speak the complaint in one messy breath; the four facts come back.
   Mirrors frontend/screens/voice-intake.html: mic → || stop → processing →
   transcript; live mode uploads the recording to /api/intake (Prisma STT via
   haqvaani/api.py), the typed/demo path is always labeled "synthetic demo".
   The old #againBtn was never wired; here it honestly resets the stage.      */

import { useEffect, useRef, useState } from "react";
import { useCapture } from "../hooks/useCapture.js";
import { useMode } from "../hooks/useMode.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { useCaseFile, useCaseState } from "../lib/state.jsx";
import { api } from "../lib/api.js";
import { DEMO, AI_DISCLOSURE } from "../lib/demo.js";
import { RollingRedactor } from "../lib/redact.js";
import { SpeakScene } from "./art/CaseArt.jsx";
import { navigate } from "../lib/router.js";

export default function VoiceIntake() {
  const { commit } = useCaseFile();
  const st = useCaseState();
  const mode = useMode();
  const toast = useToast();

  const stRef = useRef(st);
  stRef.current = st;

  const capture = useCapture({
    minSize: 1200,
    /* the recorder's own stop decides the route: too short → honest demo speech */
    onBlob: (blob) => (blob ? handleBlob(blob) : demoPlayback()),
  });

  const [hint, setHint] = useState("दबाइए और बोलिए · press and speak");
  const [micBusy, setMicBusy] = useState(false);
  const [tLabel, setTLabel] = useState("मुझे जो सुनाई दिया · what I heard (always visible : works muted)");
  const [tText, setTText] = useState("…");
  const [after, setAfter] = useState(false);
  const waveRef = useRef(null);
  const typeRef = useRef(null);
  /* sliding-window redaction: secrets split across segments still get caught */
  const redactorRef = useRef(new RollingRedactor());

  /* ------------------------------------------------- waveform (levelRef) -- */
  useEffect(() => {
    let raf = 0;
    const hist = new Uint8Array(260);
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const cv = waveRef.current;
      if (!cv) return;
      const ctx = cv.getContext("2d");
      if (capture.recording && !capture.paused) {
        /* roll history left, append the current level (0..1 → px) */
        for (let i = 1; i < hist.length; i++) hist[i - 1] = hist[i];
        hist[hist.length - 1] = Math.max(1, Math.round(capture.levelRef.current * cv.height));
      }
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = "rgba(40,40,40,0.85)";
      for (let x = 0; x < hist.length; x++) {
        const h = hist[x];
        if (!h) continue;
        ctx.fillRect(x, (cv.height - h) / 2, 1, h);
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(typeRef.current);
    };
  }, [capture.recording, capture.paused]);

  /* --------------------------------------------------- demo typing path -- */
  function typeOutThen(text, done) {
    clearInterval(typeRef.current);
    setTLabel("मुझे जो सुनाई दिया · what I heard (synthetic demo text)");
    setTText("");
    let i = 0;
    typeRef.current = setInterval(() => {
      i += 1;
      setTText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(typeRef.current);
        typeRef.current = null;
        done();
      }
    }, 34);
  }

  function demoPlayback() {
    typeOutThen(DEMO.transcript, () => finish(DEMO.transcript, DEMO.intake));
  }

  /* commit stage output: raw transcript + suggested four facts for review */
  function finish(transcript, intake) {
    setTLabel("मुझे जो सुनाई दिया · what I heard");
    setTText(transcript || stRef.current.rawTranscript || "");
    /* redaction: any secret in the rolling 10s window bumps the counter */
    const check = redactorRef.current.push(transcript || "", Date.now());
    const update = {
      rawTranscript: transcript || stRef.current.rawTranscript || "",
      suggestedIntake: intake || DEMO.intake,
    };
    if (check.blocked) {
      update.secretsBlocked = (stRef.current.secretsBlocked || 0) + 1;
      toast("OTP/PIN/CVV जैसी जानकारी रोक दी गई · blocked in the transcript", "bad");
    }
    commit(update);
    setAfter(true);
  }

  async function handleBlob(blob) {
    setTLabel("प्रक्रिया में… transcription");
    setTText("…");
    if (mode === "live") {
      try {
        const intake = await api.upload("/api/intake", "audio", blob);
        commit({ intake });
        finish(intake.raw_transcript || DEMO.transcript, intake);
        return;
      } catch {
        toast("API error : demo text दिखाया जा रहा है", "bad");
      }
    }
    demoPlayback();
  }

  async function onMic() {
    if (capture.recording || micBusy) return;
    setMicBusy(true);
    try {
      await capture.start();
      setHint("सुन रहा है… बात बोलिए · listening…");
    } catch {
      setHint("माइक नहीं मिला : डेमो बोली दिखाई जाएगी · no mic : showing demo speech");
      demoPlayback();
    } finally {
      setMicBusy(false);
    }
  }

  function onFile(e) {
    const f = e.target.files && e.target.files[0];
    /* 8 kHz telephone recordings also pass through the same intake endpoint */
    if (f) handleBlob(f);
    e.target.value = "";
  }

  /* prior output on re-entry: last transcript stays visible (never emptied) */
  useEffect(() => {
    const prev = stRef.current.rawTranscript;
    if (prev) {
      setTLabel("पिछली बोली · your last recording");
      setTText(prev);
      setAfter(true);
    }
  }, []);

  const recording = capture.recording;

  return (
    <>
      <div className="col" style={{ gap: "var(--s-xs)" }}>
        <h1 className="d-lg" lang="hi-IN">अपनी बात अपने शब्दों में बोलिए।</h1>
        <p className="caption mute-2">{AI_DISCLOSURE}</p>
        <p className="body mute-2" style={{ maxWidth: "62ch" }}>
          एक गड़बड़ साँस में ही बोल डालिए : राशि, तारीख़, UTR, कौन, कहाँ।
          <span className="pair"><span className="alt" lang="en-IN">Say it in one messy breath : amount, date, UTR, who, where.</span></span>
        </p>
      </div>

      <div className="art" aria-hidden="true" style={{ marginTop: "var(--s-sm)" }}>
        <SpeakScene />
      </div>

      <section className="col" style={{ alignItems: "center", gap: "var(--s-sm)", padding: "34px 0 10px" }} aria-label="माइक">
        <p className="caption mute-3" aria-live="polite">{hint}</p>
        <button
          className="mic-big"
          aria-pressed={recording}
          disabled={recording || micBusy}
          aria-label="माइक: बोलना शुरू करें या रोकें"
          onClick={onMic}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>
        <canvas className="wavebar" ref={waveRef} width="260" height="8" aria-hidden="true" />
        <div className="row" style={{ justifyContent: "center" }}>
          <button
            className="btn btn--line"
            disabled={!recording}
            aria-label="बोली रोकें"
            onClick={() => capture.pause()}
          >
            {capture.paused ? "जारी · resume" : "रोकें · pause"}
          </button>
          <button
            className="btn btn--primary"
            disabled={!recording}
            aria-label="बोली समाप्त करें और समीक्षा"
            onClick={() => capture.stop()}
          >
            समाप्त · end &amp; review
          </button>
        </div>
      </section>

      <section className="col" style={{ marginTop: "var(--s-md)" }} aria-label="मुझे जो सुनाई दिया">
        <div className="transcript">
          <div className="t-label">{tLabel}</div>
          <div className="t-text" lang="hi-IN">{tText}</div>
        </div>
        <div className="row" hidden={!after}>
          <a className="btn btn--line" href="#/start-case">
            वापस · back
          </a>
          <button className="btn btn--primary" onClick={() => navigate("#/fact-review")}>
            चार सच समीक्षा · review the four facts
          </button>
          <button
            className="btn btn--line"
            aria-label="फिर से बोलें"
            onClick={() => {
              /* honest reset: stage cleared, mic ready again */
              clearInterval(typeRef.current);
              setAfter(false);
              setTLabel("मुझे जो सुनाई दिया · what I heard (always visible : works muted)");
              setTText("…");
              setHint("दबाइए और बोलिए · press and speak");
            }}
          >
            फिर बोलें · say again
          </button>
        </div>
        <div className="card">
          <label className="field">
            <span>सुनने की जगह ऑडियो फ़ाइल दीजिए · use an audio file</span>
            <input type="file" accept="audio/*,.webm,.wav,.m4a" onChange={onFile} />
          </label>
          <p className="hint">
            8 kHz टेलीफ़ोनी रिकॉर्डिंग भी चलेगी
            <span className="mute-3"> · 8 kHz phone recordings work too</span>
          </p>
        </div>
      </section>
    </>
  );
}
