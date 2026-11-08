"""
Live Gnani roundtrip verification: TTS speak → STT transcribe → print both.

Usage:
    python scripts/verify_gnani_roundtrip.py [--text "..."] [--lang hi-IN]
        [--out artifacts/roundtrip_tts.wav] [--stt-rate 16000]

Requires GNANI_API_KEY (set in .env or environment). Exercises the documented
contract end-to-end:
  1. Timbre v2.5 SSE → WAV (assemble_wav, 48 kHz artifact)
  2. Prisma v2.5 WSS ← PCM resampled to --stt-rate (default 16 kHz) → transcript
Prints timing + transcript. Exits 0 on success, 2 if the key is missing.
"""

from __future__ import annotations

import argparse
import os
import sys
import time

import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from haqvaani import dsp_audio, stt_client, tts_client  # noqa: E402


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--text", default="नमस्ते। यह हक़वाणी की परीक्षण कॉल है।")
    ap.add_argument("--lang", default="hi-IN")
    ap.add_argument("--out", default="artifacts/roundtrip_tts.wav")
    ap.add_argument("--stt-rate", type=int, default=16000)
    args = ap.parse_args()

    if not os.getenv("GNANI_API_KEY"):
        print("✗ GNANI_API_KEY not set. Copy .env.example → .env and fill in your key.")
        return 2
    if not tts_client.available() or not stt_client.available():
        print("✗ GNANI_TTS_SSE_URL / GNANI_STT_WSS_URL not set (see .env.example).")
        return 2

    # ---- 1. TTS speak --------------------------------------------------------
    print(f"▶ TTS (Timbre v2.5, {args.lang}): {args.text!r}")
    t0 = time.perf_counter()
    tts = tts_client.synthesize_sse(args.text, language=args.lang)
    t_tts = time.perf_counter() - t0
    if not tts.ok:
        print(f"✗ TTS failed: {' | '.join(tts.errors) or tts.note}")
        return 1
    print(f"  ✓ {tts.note} — {len(tts.audio)} bytes in {t_tts*1000:.0f} ms "
          f"({tts.chunks} chunk{'s' if tts.chunks != 1 else ''})")

    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    pcm = np.frombuffer(tts.audio, dtype=np.int16)
    sf.write(args.out, pcm.astype(np.float32) / 32768.0, 48000)
    print(f"  ✓ WAV saved → {args.out}")

    # ---- 2. STT transcribe ---------------------------------------------------
    # Read the TTS artifact back and resample from its TRUE sample rate to the
    # STT rate — the client does not resample, so sending 48 kHz samples as
    # 16 kHz would play 3× fast and garble the transcript.
    data, sr = sf.read(args.out, dtype="float32")
    if data.ndim > 1:
        data = data.mean(axis=1)
    print(f"▶ STT (Prisma v2.5 WSS, {args.lang}, {args.stt_rate} Hz; resampled from {sr} Hz)")
    t1 = time.perf_counter()
    if sr != args.stt_rate:
        data = dsp_audio.resample_8k_to_16k(
            (data * 32768).astype(np.int16),
            in_rate=sr,
            out_rate=args.stt_rate,
        )
    stt = stt_client.transcribe_wss(
        data.astype(np.float32), language_code=args.lang, sample_rate=args.stt_rate
    )
    t_stt = time.perf_counter() - t1
    if not stt.ok:
        print(f"✗ STT failed: {' | '.join(stt.errors) or 'empty transcript'}")
        return 1
    print(f"  ✓ transcript ({t_stt*1000:.0f} ms, {stt.elapsed_ms} ms session):")
    print(f"    {stt.text!r}")
    if stt.latency_ms:
        print(f"    segment latencies: {list(stt.latency_ms)} ms")
    if stt.detected_language:
        print(f"    detected language: {stt.detected_language}")

    print("\n=== ROUNDTRIP OK ===")
    print(f"TTS {t_tts*1000:.0f} ms → STT {t_stt*1000:.0f} ms → total {(t_tts+t_stt)*1000:.0f} ms")
    return 0


if __name__ == "__main__":
    sys.exit(main())
