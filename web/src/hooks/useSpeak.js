/* useSpeak — one shared speak() for both demo and live mode.
   Demo: browser speechSynthesis.speak(). Live: prefer static cached consent
   audio first, then POST /api/tts, then play the WAV.
   Kept tiny on purpose; consent gating and statutory-readback live here too. */

import { useState } from "react";
import { api } from "../lib/api.js";

const CACHED = new Map();

/* Pre-cached static consent audio path (Round-2 wiring).
   In LIVE mode the consent screen prefers a cached WAV of the disclosure so
   the first spoken line is instant and does not burn the shared Gnani TTS
   quota each session. When the file exists at build time it is bundled as a
   static asset; otherwise we fall back to the existing server TTS path. */
const STATIC_CONSENT_AUDIO = new Map([
  ["en", "/audio/consent-en.wav"],
  ["hi", "/audio/consent-hi.wav"],
]);

async function fetchStaticAsset(path) {
  try {
    const r = await fetch(path, { cache: "force-cache" });
    if (!r.ok) return null;
    const blob = await r.blob();
    if (!blob.type.startsWith("audio/")) return null;
    return URL.createObjectURL(blob);
  } catch (_) {
    return null;
  }
}

export function useSpeak() {
  const [playing, setPlaying] = useState(false);

  function stopCurrent() {
    if (window._haqvaaniAudio && !window._haqvaaniAudio.paused) {
      window._haqvaaniAudio.pause();
      window._haqvaaniAudio.currentTime = 0;
    }
  }

  function speak(text, lang /* "en" | "hi" */) {
    if (!text) return;
    stopCurrent();
    setPlaying(true);

    /* In live mode, prefer the pre-cached static consent audio for the
       disclosure line so the first spoken output is instant and off the
       shared Gnani TTS quota. For any other text, fall through to the
       existing /api/tts path. */
    const staticPath = STATIC_CONSENT_AUDIO.get(lang);
    if (
      window.HAQVAANI_MODE === "live" &&
      staticPath &&
      isDisclosureText(text)
    ) {
      fetchStaticAsset(staticPath).then((url) => {
        if (url) {
          playLoaded(url);
          return;
        }
        speakViaTts(text, lang);
      });
      return;
    }

    /* live mode: round-trip TTS server-side; demo mode: browser speech */
    if (window.HAQVAANI_MODE === "live") {
      speakViaTts(text, lang);
    } else {
      speakViaBrowser(text, lang);
    }
  }

  function speakViaTts(text, lang) {
    api
      .post("/api/tts", { text, lang })
      .then((r) => playWav(r.audio_base64 ?? r.audio))
      .catch(() => {
        setPlaying(false);
        /* last-resort fallback to browser speech so the user hears something */
        speakViaBrowser(text, lang);
      });
  }

  function speakViaBrowser(text, lang) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === "hi" ? "hi-IN" : "en-IN";
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } catch (_) {}
  }

  function playLoaded(url) {
    const a = new Audio(url);
    a.onended = () => {
      setPlaying(false);
      URL.revokeObjectURL(url);
    };
    a.onerror = () => {
      setPlaying(false);
      URL.revokeObjectURL(url);
    };
    a.play().catch(() => setPlaying(false));
    window._haqvaaniAudio = a;
  }

  function playWav(base64) {
    if (!base64) {
      setPlaying(false);
      return;
    }
    const cached = CACHED.get(base64);
    if (cached) {
      cached.currentTime = 0;
      cached.play().catch(() => {});
      return;
    }
    const blob = base64ToBlob(base64, "audio/wav");
    const url = URL.createObjectURL(blob);
    const a = new Audio(url);
    a.onended = () => {
      setPlaying(false);
      URL.revokeObjectURL(url);
    };
    a.onerror = () => {
      setPlaying(false);
      URL.revokeObjectURL(url);
    };
    a.play().catch(() => setPlaying(false));
    CACHED.set(base64, a);
    window._haqvaaniAudio = a;
  }

  return { speak, playing };
}

function base64ToBlob(b64, mime) {
  const bin = atob(b64.replace(/\s/g, ""));
  const buf = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
  return new Blob([buf], { type: mime });
}

/* The consent disclosure line is the one spoken before any voice capture.
   We match it so the static asset is only used for that specific sentence —
   other UI copy still goes through TTS/browser as before. */
function isDisclosureText(text) {
  return (
    text === "This is an AI assistant assisting you." ||
    text === "ये एआई सहायक आपकी सहायता कर रहा है।" ||
    text.startsWith("This is an AI assistant assisting")
  );
}
