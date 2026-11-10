"""
HaqVaani DSP / audio pipeline — Mode 1 & Mode 4 (Engineer A).

Real audio processing, no canned demo audio:
- FIR lowpass + linear interpolation resampler 8 kHz -> 16 kHz
- Silero VAD (torch.hub) with energy-based fallback (works offline)
- Ring buffer (200 ms window / 60 ms hop) for streaming segmentation

All values synthetic-safe; no real PII is stored.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

import numpy as np

logger = logging.getLogger("haqvaani.dsp_audio")

# --------------------------------------------------------------------------- constants

CITIZEN_SAMPLE_RATE = 8000   # 8 kHz noisy telephony intake (RULES.md §5.4)
INTERNAL_SAMPLE_RATE = 16000  # 16 kHz internal processing
VAD_HANGOVER_MS = 220        # Silero VAD hangover (RULES.md §5.4)
RING_WINDOW_MS = 200         # ring buffer window
RING_HOP_MS = 60             # ring buffer hop


# --------------------------------------------------------------------------- VAD model (lazy)

_VAD_MODEL: tuple | None = None


def _load_silero_vad():
    """Load Silero VAD via torch.hub; fall back to None if offline."""
    global _VAD_MODEL
    if _VAD_MODEL is not None:
        return _VAD_MODEL
    try:
        model, utils = torch.hub.load(
            repo_or_dir="snakers4/silero-vad",
            model="silero_vad",
            force_reload=False,
            onnx=False,
            trust_repo=True,
        )
        (get_speech_timestamps, _, _, _, _) = utils
        _VAD_MODEL = (model, get_speech_timestamps)
        logger.info("Silero VAD loaded via torch.hub")
    except Exception as exc:  # noqa: BLE001 — offline/offline fallback
        logger.warning("Silero VAD unavailable (offline? %s); using energy VAD fallback", exc)
        _VAD_MODEL = None
    return _VAD_MODEL


# --------------------------------------------------------------------------- resampler


def _fir_lowpass(cutoff_hz: float, sample_rate: int, num_taps: int = 61) -> np.ndarray:
    """Windowed-sinc lowpass FIR filter coefficients."""
    if num_taps % 2 == 0:
        num_taps += 1
    center = (num_taps - 1) / 2
    n = np.arange(num_taps)
    fc = cutoff_hz / (sample_rate / 2.0)
    # ideal lowpass impulse response
    h = np.sinc(2 * fc * (n - center))
    # blackman window
    w = np.blackman(num_taps)
    h = h * w
    h /= h.sum()  # unity gain
    return h


def resample_8k_to_16k(audio_int16: np.ndarray, *, in_rate: int = CITIZEN_SAMPLE_RATE,
                       out_rate: int = INTERNAL_SAMPLE_RATE) -> np.ndarray:
    """Resample int16 PCM from `in_rate` to `out_rate` via FIR lowpass + interpolation.

    For 8 kHz -> 16 kHz this is a clean 2x upsample: zero-insert then apply an
    anti-imaging lowpass FIR at the original Nyquist. Other ratios fall back to
    linear interpolation after lowpass filtering.

    Returns float32 numpy array normalized to [-1, 1] at `out_rate`.
    """
    if in_rate == out_rate:
        return audio_int16.astype(np.float32) / 32768.0

    # Anti-imaging lowpass at the original Nyquist before upsampling.
    taps = _fir_lowpass(cutoff_hz=in_rate / 2.0, sample_rate=in_rate, num_taps=61)
    audio_f32 = audio_int16.astype(np.float32) / 32768.0
    audio_f32 = np.convolve(audio_f32, taps, mode="same")

    ratio = out_rate / in_rate
    if abs(ratio - round(ratio)) < 1e-6 and int(round(ratio)) == 2:
        # Exact 2x upsample: insert a zero between samples, lowpass interpolates.
        upsampled = np.zeros(len(audio_f32) * 2, dtype=np.float32)
        upsampled[0::2] = audio_f32
        out = np.convolve(upsampled, taps, mode="same")
    else:
        x_old = np.linspace(0, 1, len(audio_f32), endpoint=False)
        x_new = np.linspace(0, 1, int(len(audio_f32) * ratio), endpoint=False)
        out = np.interp(x_new, x_old, audio_f32)
    return np.clip(out, -1.0, 1.0)


# --------------------------------------------------------------------------- VAD


def vad_segments(audio_f32: np.ndarray, *,
                 sample_rate: int = INTERNAL_SAMPLE_RATE,
                 hangover_ms: int = VAD_HANGOVER_MS) -> list[tuple[int, int]]:
    """Return list of (start_sample, end_sample) speech spans in `audio_f32`.

    Uses Silero VAD when available; otherwise a short-term energy fallback.
    Coordinates are sample indices in `audio_f32` at `sample_rate`.
    """
    if audio_f32.size == 0:
        return []

    model = _load_silero_vad()
    if model is not None:
        silero_model, get_speech_timestamps = model
        import torch  # lazy: torch is optional (edge/CPU deploys); falls back to energy VAD
        torch_audio = torch.from_numpy(audio_f32)
        # Silero expects 16 kHz mono float32.
        try:
            ts = get_speech_timestamps(
                torch_audio, silero_model,
                sampling_rate=sample_rate,
                min_silence_duration_ms=hangover_ms,
                return_seconds=False,
            )
            return [(int(seg["start"]), int(seg["end"])) for seg in ts]
        except Exception as exc:  # noqa: BLE001
            logger.warning("Silero VAD inference failed -> energy fallback: %s", exc)

    # Energy-based fallback VAD.
    frame_len = int(sample_rate * 0.02)  # 20 ms frames
    hop = frame_len
    energy = np.array([
        np.mean(audio_f32[i:i + frame_len] ** 2)
        for i in range(0, max(1, len(audio_f32) - frame_len + 1), hop)
    ])
    if energy.size == 0:
        return [(0, len(audio_f32))]
    threshold = max(1e-6, np.mean(energy) * 0.5)
    active = energy > threshold
    segments = []
    start = None
    for i, a in enumerate(active):
        if a and start is None:
            start = i * hop
        elif not a and start is not None:
            segments.append((start, min((i + 1) * hop, len(audio_f32))))
            start = None
    if start is not None:
        segments.append((start, len(audio_f32)))
    # Merge segments separated by < hangover_ms.
    merged = []
    hangover_samples = int(sample_rate * hangover_ms / 1000.0)
    for seg in segments:
        if merged and seg[0] - merged[-1][1] <= hangover_samples:
            merged[-1] = (merged[-1][0], seg[1])
        else:
            merged.append(list(seg))
    return [(int(s), int(e)) for s, e in merged]


# --------------------------------------------------------------------------- ring buffer


@dataclass
class RingBuffer:
    """Fixed-size ring buffer for streaming audio segmentation.

    window_ms / hop_ms follow RULES.md §5.4 (200 ms / 60 ms).
    """

    sample_rate: int
    window_ms: int = RING_WINDOW_MS
    hop_ms: int = RING_HOP_MS

    def __post_init__(self) -> None:
        self.window_samples = int(self.sample_rate * self.window_ms / 1000.0)
        self.hop_samples = int(self.sample_rate * self.hop_ms / 1000.0)
        self.buffer = np.zeros(0, dtype=np.float32)
        self.total_consumed = 0

    def push(self, chunk: np.ndarray) -> None:
        """Append audio samples to the ring buffer."""
        if chunk.size == 0:
            return
        self.buffer = np.concatenate([self.buffer, chunk.astype(np.float32)])

    def pop_hop(self) -> np.ndarray:
        """Return one hop-sized frame and advance the read cursor.

        Returns empty array if fewer than a hop remains.
        """
        if self.buffer.size < self.hop_samples:
            return np.zeros(0, dtype=np.float32)
        frame = self.buffer[: self.hop_samples].copy()
        self.buffer = self.buffer[self.hop_samples:]
        self.total_consumed += self.hop_samples
        return frame

    def window(self) -> np.ndarray:
        """Return the current window-sized view (may be shorter at startup)."""
        if self.buffer.size == 0:
            return np.zeros(0, dtype=np.float32)
        return self.buffer[: self.window_samples].copy()

    def ready(self) -> bool:
        """True if a full window is buffered."""
        return self.buffer.size >= self.window_samples


def segment_audio(audio_f32: np.ndarray, *,
                  sample_rate: int = INTERNAL_SAMPLE_RATE,
                  window_ms: int = RING_WINDOW_MS,
                  hop_ms: int = RING_HOP_MS) -> list[np.ndarray]:
    """Split audio into windowed chunks using the ring buffer.

    Returns list of float32 arrays, each <= window_samples long.
    """
    ring = RingBuffer(sample_rate=sample_rate, window_ms=window_ms, hop_ms=hop_ms)
    ring.push(audio_f32)
    chunks = []
    while ring.buffer.size > 0:
        frame = ring.pop_hop()
        if frame.size == 0:
            break
        chunks.append(frame)
    return chunks


# --------------------------------------------------------------------------- convenience: full intake pipeline


def preprocess_intake(audio_int16: np.ndarray, *,
                      in_rate: int = CITIZEN_SAMPLE_RATE,
                      out_rate: int = INTERNAL_SAMPLE_RATE) -> dict:
    """Mode 1 intake preprocessing: resample 8k->16k, VAD segment, return speech spans.

    Returns {"audio_16k": float32 array, "segments": [(start,end), ...], "sample_rate": out_rate}.
    """
    audio_16k = resample_8k_to_16k(audio_int16, in_rate=in_rate, out_rate=out_rate)
    segments = vad_segments(audio_16k, sample_rate=out_rate)
    return {
        "audio_16k": audio_16k,
        "segments": segments,
        "sample_rate": out_rate,
    }


if __name__ == "__main__":
    # Smoke: synthetic 8 kHz tone + silence -> resample + VAD.
    sr = CITIZEN_SAMPLE_RATE
    t = np.linspace(0, 1, sr, endpoint=False)
    tone = (0.5 * np.sin(2 * np.pi * 440 * t)).astype(np.float32)
    silence = np.zeros(sr // 2, dtype=np.float32)
    audio_int16 = np.concatenate([tone * 12000, silence, tone * 12000]).astype(np.int16)
    result = preprocess_intake(audio_int16)
    print(f"input samples : {len(audio_int16)} @ {sr} Hz")
    print(f"output samples: {len(result['audio_16k'])} @ {result['sample_rate']} Hz")
    print(f"VAD segments  : {result['segments']}")
