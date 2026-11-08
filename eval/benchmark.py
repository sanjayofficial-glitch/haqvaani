"""
HaqVaani eval benchmark — 30-clip STT WER harness (Days 12–13).

Curates 30 synthetic noisy UTR/Hinglish clips (8 kHz), transcribes each with:
  • faster-whisper (local, always available)
  • Gnani Prisma v2.5 WSS (live when GNANI_API_KEY + GNANI_STT_WSS_URL set;
    otherwise degrades gracefully and reports "not live")

Computes per-clip WER (character-level, since Hindi/Hinglish tokenization is
noisy), per-clip latency, and p50/p95 aggregates. Writes a JSON report the HUD
can consume.

All clips are synthetic (no real recordings, no real PII) per RULES.md §3.4.
Run:  python -m eval.benchmark
"""

from __future__ import annotations

import json
import os
import statistics
import wave
from datetime import date
from pathlib import Path

import numpy as np

from haqvaani import dsp_audio
from haqvaani.stt_client import transcribe_wss

REPORT_PATH = Path(__file__).resolve().parent / "benchmark_report.json"
CLIPS_DIR = Path(__file__).resolve().parent / "clips"
CLIPS_DIR.mkdir(parents=True, exist_ok=True)

# ----------------------------------------------------------- synthetic clips ----

# Each clip: ground truth transcript, expected UTR, amount, txn date, dispute type.
# Synthetic data only — no real UTRs, phone numbers, or PII.
CLIPS: list[dict] = [
    {"id": "clip_001", "text": "Bhaiya 18 Oct ko 3,200 UPI kiya tha, paisa kat gaya par pahuncha nahi — UTR 629188340112", "utr": "629188340112", "amount": 3200, "txn": "2026-10-18", "dtype": "upi_p2p"},
    {"id": "clip_002", "text": "5 October ko merchant se 1,500 UPI hua par confirmation nahi mili — UTR 774122990045", "utr": "774122990045", "amount": 1500, "txn": "2026-10-05", "dtype": "upi_p2m"},
    {"id": "clip_003", "text": "ATM se 2,000 nikale the par cash nahi nikla, account se kat gaya — UTR 881003456712", "utr": "881003456712", "amount": 2000, "txn": "2026-10-22", "dtype": "atm_cash_not_dispensed"},
    {"id": "clip_004", "text": "PoS card debit 800 rupees hua but transaction failed — UTR 902110334455", "utr": "902110334455", "amount": 800, "txn": "2026-10-15", "dtype": "pos_card_debit"},
    {"id": "clip_005", "text": "12 November ko friend ko 5,000 bheja tha par unhe nahi mila — UTR 112233445566", "utr": "112233445566", "amount": 5000, "txn": "2026-11-12", "dtype": "upi_p2p"},
    {"id": "clip_006", "text": "Unauthorised transaction 20,000 rupees, mera account se gaye without my permission — UTR 223344556677", "utr": "223344556677", "amount": 20000, "txn": "2026-11-01", "dtype": "unauthorised"},
    {"id": "clip_007", "text": "3 October ko 750 rupees UPI failed, beneficiary ne confirm nahi kiya — UTR 334455667788", "utr": "334455667788", "amount": 750, "txn": "2026-10-03", "dtype": "upi_p2m"},
    {"id": "clip_008", "text": "ATM cash not dispensed 1,000 rupees but debited — UTR 445566778899", "utr": "445566778899", "amount": 1000, "txn": "2026-10-20", "dtype": "atm_cash_not_dispensed"},
    {"id": "clip_009", "text": "25 October ko 12,000 UPI P2P kiya tha par pahuncha nahi — UTR 556677889900", "utr": "556677889900", "amount": 12000, "txn": "2026-10-25", "dtype": "upi_p2p"},
    {"id": "clip_010", "text": "Merchant UPI 3,500 failed transaction, confirmation nahi aaya — UTR 667788990011", "utr": "667788990011", "amount": 3500, "txn": "2026-10-28", "dtype": "upi_p2m"},
    {"id": "clip_011", "text": "PoS debit 450 rupees card se hua par transaction decline — UTR 778899001122", "utr": "778899001122", "amount": 450, "txn": "2026-10-29", "dtype": "pos_card_debit"},
    {"id": "clip_012", "text": "2 September ko 8,000 rupees friend ko bheja, unhe receive nahi hua — UTR 889900112233", "utr": "889900112233", "amount": 8000, "txn": "2026-09-02", "dtype": "upi_p2p"},
    {"id": "clip_013", "text": "Unauthorised debit 15,000, third party fraud — UTR 990011223344", "utr": "990011223344", "amount": 15000, "txn": "2026-10-30", "dtype": "unauthorised"},
    {"id": "clip_014", "text": "14 October ko 2,500 UPI merchant payment failed — UTR 101112131415", "utr": "101112131415", "amount": 2500, "txn": "2026-10-14", "dtype": "upi_p2m"},
    {"id": "clip_015", "text": "ATM 3,000 cash not dispensed but account debited — UTR 161718192021", "utr": "161718192021", "amount": 3000, "txn": "2026-10-19", "dtype": "atm_cash_not_dispensed"},
    {"id": "clip_016", "text": "22 October ko 6,000 UPI P2P kiya tha par pahuncha nahi — UTR 222324252627", "utr": "222324252627", "amount": 6000, "txn": "2026-10-22", "dtype": "upi_p2p"},
    {"id": "clip_017", "text": "PoS card debit 900 rupees failed transaction — UTR 282930313233", "utr": "282930313233", "amount": 900, "txn": "2026-10-23", "dtype": "pos_card_debit"},
    {"id": "clip_018", "text": "8 November ko 4,000 rupees UPI failed, beneficiary confirmation pending — UTR 343536373839", "utr": "343536373839", "amount": 4000, "txn": "2026-11-08", "dtype": "upi_p2m"},
    {"id": "clip_019", "text": "Unauthorised transaction 25,000 without permission — UTR 404142434445", "utr": "404142434445", "amount": 25000, "txn": "2026-11-02", "dtype": "unauthorised"},
    {"id": "clip_020", "text": "30 October ko 1,200 UPI kiya tha par nahi pahuncha — UTR 464748495051", "utr": "464748495051", "amount": 1200, "txn": "2026-10-30", "dtype": "upi_p2p"},
    {"id": "clip_021", "text": "Merchant UPI 5,500 failed, confirmation nahi mili — UTR 525354555657", "utr": "525354555657", "amount": 5500, "txn": "2026-10-26", "dtype": "upi_p2m"},
    {"id": "clip_022", "text": "ATM 1,800 cash not dispensed — UTR 585960616263", "utr": "585960616263", "amount": 1800, "txn": "2026-10-24", "dtype": "atm_cash_not_dispensed"},
    {"id": "clip_023", "text": "PoS debit 650 rupees card declined — UTR 646566676869", "utr": "646566676869", "amount": 650, "txn": "2026-10-27", "dtype": "pos_card_debit"},
    {"id": "clip_024", "text": "10 October ko 7,000 UPI P2P friend ko bheja par receive nahi hua — UTR 707172737475", "utr": "707172737475", "amount": 7000, "txn": "2026-10-10", "dtype": "upi_p2p"},
    {"id": "clip_025", "text": "Unauthorised debit 18,000 rupees third party fraud — UTR 767778798081", "utr": "767778798081", "amount": 18000, "txn": "2026-10-31", "dtype": "unauthorised"},
    {"id": "clip_026", "text": "16 October ko 2,200 UPI merchant payment failed — UTR 828384858687", "utr": "828384858687", "amount": 2200, "txn": "2026-10-16", "dtype": "upi_p2m"},
    {"id": "clip_027", "text": "ATM 2,700 cash not dispensed but debited — UTR 888990919293", "utr": "888990919293", "amount": 2700, "txn": "2026-10-21", "dtype": "atm_cash_not_dispensed"},
    {"id": "clip_028", "text": "28 October ko 9,000 UPI P2P kiya tha par pahuncha nahi — UTR 949596979899", "utr": "949596979899", "amount": 9000, "txn": "2026-10-28", "dtype": "upi_p2p"},
    {"id": "clip_029", "text": "PoS card debit 1,100 rupees failed transaction — UTR 100001010203", "utr": "100001010203", "amount": 1100, "txn": "2026-10-29", "dtype": "pos_card_debit"},
    {"id": "clip_030", "text": "5 November ko 3,800 UPI failed, beneficiary ne confirm nahi kiya — UTR 100102030405", "utr": "100102030405", "amount": 3800, "txn": "2026-11-05", "dtype": "upi_p2m"},
]


def _synth_clip(text: str, *, duration_sec: float = 3.0, sample_rate: int = 8000) -> np.ndarray:
    """Synthesize a synthetic 8 kHz audio clip (speech-frequency noise + tone bursts).

    This is a synthetic test vector — not a real recording. Whisper will not
    meaningfully transcribe tone noise, so WER will reflect "no audio content"
    honestly. The benchmark measures pipeline latency and VAD behavior, not
    Whisper accuracy on synthetic noise.
    """
    rng = np.random.default_rng(hash(text) % (2 ** 32))
    n = int(duration_sec * sample_rate)
    t = np.arange(n) / sample_rate
    # Broaden speech-band noise (300 Hz - 3.4 kHz telephony band) + a few tone bursts.
    noise = rng.normal(0, 0.02, n)
    tone1 = 0.15 * np.sin(2 * np.pi * 440 * t) * (np.sin(2 * np.pi * 2 * t) > 0)
    tone2 = 0.1 * np.sin(2 * np.pi * 880 * t) * (np.sin(2 * np.pi * 3 * t) > 0)
    audio = noise + tone1 + tone2
    audio = np.clip(audio, -1.0, 1.0)
    return audio.astype(np.float32)


# ----------------------------------------------------------- WER metric --------

def _wer(reference: str, hypothesis: str) -> float:
    """Character-level WER (Levenshtein distance / reference length)."""
    if not reference:
        return 1.0 if hypothesis else 0.0
    r, h = reference.lower(), hypothesis.lower()
    # DP matrix (two rows for memory efficiency).
    prev = list(range(len(h) + 1))
    for i, rc in enumerate(r, 1):
        curr = [i] + [0] * len(h)
        for j, hc in enumerate(h, 1):
            cost = 0 if rc == hc else 1
            curr[j] = min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
        prev = curr
    return prev[-1] / max(len(r), 1)


# --------------------------------------------------------------- runner -------

def _write_wav(path: Path, audio: np.ndarray, sample_rate: int = 8000) -> None:
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sample_rate)
        w.writeframes((np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes())


def run_benchmark() -> dict:
    """Run the 30-clip benchmark and write the report."""
    results: list[dict] = []
    whisper_wers: list[float] = []
    whisper_latencies: list[int] = []

    for clip in CLIPS:
        clip_id = clip["id"]
        ground_truth = clip["text"]
        wav_path = CLIPS_DIR / f"{clip_id}.wav"

        # Generate synthetic clip if missing.
        if not wav_path.exists():
            audio = _synth_clip(ground_truth)
            _write_wav(wav_path, audio)

        # DSP preprocessing (resample + VAD).
        import soundfile as sf
        data, sr = sf.read(str(wav_path), dtype="float32")
        if data.ndim > 1:
            data = data.mean(axis=1)
        proc = dsp_audio.preprocess_intake(
            (data * 32768).astype(np.int16), in_rate=int(sr),
            out_rate=dsp_audio.INTERNAL_SAMPLE_RATE,
        )
        vad_segments = len(proc["segments"])

        # faster-whisper transcription.
        from time import perf_counter
        t0 = perf_counter()
        try:
            from faster_whisper import WhisperModel
            model = WhisperModel("tiny", device="cpu", compute_type="int8")
            segments, _ = model.transcribe(proc["audio_16k"], beam_size=1, vad_filter=True)
            whisper_text = " ".join(seg.text for seg in segments).strip()
        except Exception as exc:  # noqa: BLE001
            whisper_text = f"<error: {exc}>"
        whisper_latency = int((perf_counter() - t0) * 1000)

        whisper_wer = _wer(ground_truth, whisper_text)
        whisper_wers.append(whisper_wer)
        whisper_latencies.append(whisper_latency)

        # Prisma v2.5 live attempt (graceful fallback).
        prisma_text = ""
        prisma_latency = -1
        prisma_ok = False
        try:
            result = transcribe_wss(str(wav_path))
            prisma_text = result.text
            prisma_latency = result.elapsed_ms
            prisma_ok = result.ok
        except Exception as exc:  # noqa: BLE001
            prisma_text = f"<error: {exc}>"

        results.append({
            "clip_id": clip_id,
            "ground_truth": ground_truth,
            "utr": clip["utr"],
            "amount_inr": clip["amount"],
            "txn_date": clip["txn"],
            "dispute_type": clip["dtype"],
            "vad_segments": vad_segments,
            "whisper": {
                "text": whisper_text,
                "wer": round(whisper_wer, 4),
                "latency_ms": whisper_latency,
            },
            "prisma": {
                "text": prisma_text,
                "wer": round(_wer(ground_truth, prisma_text), 4) if prisma_text else None,
                "latency_ms": prisma_latency,
                "live": prisma_ok,
            },
        })

    report = {
        "clips": len(CLIPS),
        "sample_rate_hz": 8000,
        "whisper": {
            "mean_wer": round(statistics.mean(whisper_wers), 4),
            "p50_latency_ms": round(statistics.median(whisper_latencies)),
            "p95_latency_ms": round(
                sorted(whisper_latencies)[int(0.95 * len(whisper_latencies)) - 1]
                if whisper_latencies else 0
            ),
        },
        "prisma_live": bool(os.getenv("GNANI_API_KEY") and os.getenv("GNANI_STT_WSS_URL")),
        "results": results,
    }
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False))
    return report


if __name__ == "__main__":  # pragma: no cover — `python -m eval.benchmark`
    rep = run_benchmark()
    print(f"clips: {rep['clips']}")
    print(f"whisper mean WER: {rep['whisper']['mean_wer']}")
    print(f"whisper p50 latency: {rep['whisper']['p50_latency_ms']} ms")
    print(f"whisper p95 latency: {rep['whisper']['p95_latency_ms']} ms")
    print(f"prisma live: {rep['prisma_live']}")
    print(f"report: {REPORT_PATH}")
