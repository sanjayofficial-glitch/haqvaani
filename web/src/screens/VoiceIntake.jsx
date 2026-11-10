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
import { T } from "../lib/i18n.jsx";
import { RollingRedactor } from "../lib/redact.js";
import { Warning } from "../components/Icon.jsx";
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
  const [notRecognized, setNotRecognized] = useState(false);
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
      } catch (err) {
        const msg = (err && err.message) || "";
        if (/STT_NO_TRANSCRIPT|No speech recognized/.test(msg)) {
          toast("आवाज़ नहीं पहचानी गई · voice not recognized — try again or fill details manually", "bad");
          setNotRecognized(true);
          return;
        }
        toast("API error : रिकॉर्डिंग भेजी नहीं जा सकी · send failed", "bad");
        setDemoOffer(true);
        return;
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
        <h1 className="d-lg" lang="en-IN">
          <T en="Speak your complaint in your own words." hi="अपनी बात अपने शब्दों में बोलिए।" />
        </h1>
        <p className="caption mute-2">{AI_DISCLOSURE}</p>
        <p className="body mute-2" style={{ maxWidth: "62ch" }}>
          <T
            en="Say it in one messy breath : amount, date, UTR, who, where."
            hi="एक गड़बड़ साँस में ही बोल डालिए : राशि, तारीख़, UTR, कौन, कहाँ।"
          />
        </p>
      </div>

      <div className="art" aria-hidden="true" style={{ marginTop: "var(--s-sm)" }}>
        <SpeakScene />
      </div>

      <section className="col" style={{ marginTop: "var(--s-sm)" }} aria-label="माइक">
        <p className="hint mute-3">
          {mode === "live"
            ? <T en="Live Gnani STT connected — your voice transcribes for real" hi="लाइव Gnani STT जुड़ा है — आपकी आवाज़ सचमुच ट्रांसक्राइब होती है" />
            : <T en="Synthetic demo mode — transcripts are sample text (no live STT)" hi="सिंथेटिक डेमो मोड — ट्रांसक्रिप्ट नमूना टेक्स्ट है (लाइव STT नहीं)" />}
        </p>
        <VoiceRecorder
          title="Voice intake"
          onStarted={() => {
            /* fresh recording: wipe the stale/previous transcript from view */
            commit({ rawTranscript: "" });
            setTLabel("सुन रहा है… · listening…");
            setTText("");
            setAfter(false);
          }}
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
              <T en="Show demo speech" hi="डेमो बोली दिखाएँ" />
            </button>
          </div>
        )}
        {notRecognized && (
          <div className="card empty-state" style={{ padding: "22px" }}>
            <Warning size={18} />
            <p className="body mute-2">
              <T
                en="We couldn't hear a clear recording. Please try again — or fill the details manually."
                hi="हमें साफ़ रिकॉर्डिंग नहीं सुनाई दी। कृपया दोबारा कोशिश करें — या विवरण हाथ से भरें।"
              />
            </p>
            <div className="row">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  setNotRecognized(false);
                  setTLabel("मुझे जो सुनाई दिया · what I heard (always visible : works muted)");
                  setTText("…");
                }}
              >
                <T en="Try again" hi="फिर से कोशिश करें" />
              </button>
              <button type="button" className="btn btn--line" onClick={() => navigate("#/fact-review")}>
                <T en="Fill details manually" hi="विवरण हाथ से भरें" />
              </button>
            </div>
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
            <T en="Back" hi="वापस" />
          </a>
          <button className="btn btn--primary" onClick={() => navigate("#/fact-review")}>
            <T en="Review the four facts" hi="चार सच समीक्षा" />
          </button>
          <button
            className="btn btn--line"
            aria-label="say again"
            onClick={() => {
              /* honest reset: stage cleared, mic ready again */
              clearInterval(typeRef.current);
              setAfter(false);
              setTLabel("मुझे जो सुनाई दिया · what I heard (always visible : works muted)");
              setTText("…");
            }}
          >
            <T en="Say again" hi="फिर बोलें" />
          </button>
        </div>
        <div className="card">
          <label className="field">
            <span><T en="Or use an audio file" hi="सुनने की जगह ऑडियो फ़ाइल दीजिए" /></span>
            <input type="file" accept="audio/*,.webm,.wav,.m4a" onChange={onFile} />
          </label>
          <p className="hint">
            <T en="8 kHz phone recordings work too" hi="8 kHz टेलीफ़ोनी रिकॉर्डिंग भी चलेगी" />
          </p>
        </div>
      </section>
    </>
  );
}
