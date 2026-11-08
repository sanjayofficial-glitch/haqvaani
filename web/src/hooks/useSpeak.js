import { api } from "../lib/api.js";
import { useMode } from "./useMode.jsx";
import { useToast } from "./useToast.jsx";

/* HQ.speak equivalent — Timbre TTS (server, redaction-gated: OTP/PIN/MPIN/CVV/
   password are hard-blocked upstream) followed by the browser's
   speechSynthesis as the free offline fallback; toast as the last resort.    */
export function useSpeak() {
  const mode = useMode();
  const toast = useToast();

  return function speak(text, lang /* "en" | "hi" */) {
    const locale = lang === "en" ? "en-IN" : "hi-IN";
    const browserFallback = () => {
      if ("speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = locale;
        const v = speechSynthesis
          .getVoices()
          .find((v) => v.lang && v.lang.toLowerCase().indexOf(lang === "en" ? "en" : "hi") !== -1);
        if (v) u.voice = v;
        speechSynthesis.speak(u);
      } else {
        toast(text);
      }
    };
    if (mode !== "live") return browserFallback();
    api
      .post("/api/tts", { text, lang: locale })
      .then((j) => {
        if (j && j.audio_base64) {
          const a = new Audio("data:audio/wav;base64," + j.audio_base64);
          a.play().catch(browserFallback);
        } else {
          browserFallback();
        }
      })
      .catch(browserFallback);
  };
}
