import { useCallback, useEffect, useRef, useState } from "react";

/* shared MediaRecorder capture — used by voice intake and assisted call.
   Returns { start, stop, level } where level feeds waveform/status dots.
   Recording stays entirely on-device; identical behavior to the old screens
   (the citizen controls start/stop, never automatic). */
export function useCapture({ minSize = 1200, onBlob, onError } = {}) {
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const levelRef = useRef(0);
  const rafRef = useRef(0);
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);

  const tick = useCallback(() => {
    rafRef.current = requestAnimationFrame(tick);
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.fftSize || 1024);
    analyser.getByteTimeDomainData(data);
    let peak = 0;
    for (let i = 0; i < data.length; i += 4) peak = Math.max(peak, Math.abs(data[i] - 128));
    levelRef.current = peak / 128;
  }, []);

  const cleanup = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (ctxRef.current) {
      try { ctxRef.current.close(); } catch { /* ignore */ }
      ctxRef.current = null;
      analyserRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setRecording(false);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    streamRef.current = stream;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const type = recorder.mimeType || "audio/webm";
      const blob = new Blob(chunksRef.current, { type });
      cleanup();
      if (blob.size > minSize) onBlob && onBlob(blob);
      else onBlob && onBlob(null); /* too short → honest fallback path */
    };
    recorder.start();
    if ("AudioContext" in window) {
      try {
        ctxRef.current = new AudioContext();
        const src = ctxRef.current.createMediaStreamSource(stream);
        const analyser = ctxRef.current.createAnalyser();
        analyser.fftSize = 1024;
        src.connect(analyser);
        analyserRef.current = analyser;
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(tick);
      } catch { /* waveform is optional */ }
    }
    setRecording(true);
    return true;
  }

  async function stop() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      return true;
    }
    cleanup();
    onBlob && onBlob(null);
    return false;
  }

  /* pause/resume the live recorder (voice-intake keeps its रोकें button honest) */
  function pause() {
    const recorder = recorderRef.current;
    if (!recorder) return false;
    if (recorder.state === "recording") {
      recorder.pause();
      setPaused(true);
      return true;
    }
    if (recorder.state === "paused") {
      recorder.resume();
      setPaused(false);
      return false;
    }
    return paused;
  }

  return { recording, paused, start, stop, pause, cleanup, levelRef };
}
