import { useCallback, useEffect, useRef, useState } from "react";

/* Studio v2 — screen capture (tab/window) via getDisplayMedia.
   Video-only (tab audio requires extra permission grants that frequently
   hang in Chrome; we keep the honest "screen only" label). Clips are
   capped at MAX_MS and saved as webm. */
const MAX_MS = 90 * 1000;

function pickMime() {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c)) return c;
    } catch { /* ignore */ }
  }
  return "";
}

export function useScreenCapture({ onBlob, onError } = {}) {
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const startAtRef = useRef(0);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState(false);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setRecording(false);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  async function start() {
    if (recording || busy) return false;
    setBusy(true);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 }, width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      chunksRef.current = [];
      const mime = pickMime();
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || "video/webm";
        const blob = new Blob(chunksRef.current, { type });
        const dur = Date.now() - startAtRef.current;
        cleanup();
        onBlob && onBlob(blob, dur);
      };
      recorder.start(250);
      startAtRef.current = Date.now();
      setElapsed(0);
      timerRef.current = setInterval(() => {
        const el = Date.now() - startAtRef.current;
        setElapsed(el);
        if (el >= MAX_MS) stop();
      }, 250);
      setRecording(true);
      return true;
    } catch (err) {
      onError && onError(err);
      return false;
    } finally {
      setBusy(false);
    }
  }

  function stop() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      return true;
    }
    cleanup();
    return false;
  }

  return { recording, busy, start, stop, elapsed, maxMs: MAX_MS };
}
