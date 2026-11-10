/* Step 00 — speak the complaint in one messy breath; the four facts come back.
   Mirrors frontend/screens/voice-intake.html: mic → || stop → processing →
   transcript; live mode uploads the recording to /api/intake (Prisma STT via
   haqvaani/api.py), the typed/demo path is always labeled "synthetic demo".
   The old #againBtn was never wired; here it honestly resets the stage.      */

import { useEffect, useRef, useState } from "react";
import { VoiceRecorder } from "../components/StudioRecorders.jsx";
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

  const [tLabel, setTLabel] = useState("मुझे जो सुनाई दिया · what I heard (always visible : works muted)");
  const [tText, setTText] = useState("…");
  const [after, setAfter] = useState(false);
  const [demoOffer, setDemoOffer] = useState(false);
  const typeRef = useRef(null);
  /* sliding-window redaction: secrets split across segments still get caught */
  const redactorRef = useRef(new RollingRedactor());

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

  async function onFile(e) {
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

      <section className="col" style={{ marginTop: "var(--s-sm)" }} aria-label="माइक">
        <VoiceRecorder
          title="Voice intake"
          onTooShort={() => setDemoOffer(true)}
          onBlob={(blob) => handleBlob(blob)}
        />
        {demoOffer && (
          <div className="row">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => { setDemoOffer(false); demoPlayback(); }}
            >
              डेमो बोली दिखाएँ · show demo speech
            </button>
          </div>
        )}
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
