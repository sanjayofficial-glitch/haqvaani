# docs/evaluation.md — How Success Will Be Measured

> Success metrics across WER, latency, safety, compliance, and demo quality. Every number is
> genuinely measured on synthetic data (30-clip benchmark) and displayed on the Telemetry HUD.

---

## 1. WER (Word Error Rate) — Noise Canceller / Mixed Vibes

| Metric | Target | Measurement |
| :--- | :--- | :--- |
| Prisma v2.5 WER on 12-digit UTRs | < 5% | 30 synthetic noisy clips (8 kHz, street ambience) |
| Whisper WER on same clips | Baseline (expected higher) | Same 30 clips, split-screen on HUD |
| Prisma WER on Hindi numerals (lakhs/crores) | < 5% | Same 30 clips |
| Languages covered | hi-IN + en-IN (code-mixed Hinglish) | Citizen intake leg |

Method: run each clip through local Whisper and live Prisma v2.5 WSS; compute WER against
synthetic ground truth; report per-clip WER + mean on the HUD.

---

## 2. Latency — Real-time responsiveness

| Metric | Target | Measurement |
| :--- | :--- | :--- |
| STT partials | ≤ 200 ms | Per utterance |
| STT final segment | ≤ 168 ms | Per utterance |
| Evon v3.3 JSON TTFT | ≤ 302 ms | 257 tok/s, short schema (<45 tok) |
| Timbre first audio | ≤ 184 ms | SSE TTFA |
| VAD end-of-speech hangover | 200 ms (tracked separately) | Wall-clock 890 ms |
| Post-call summary (hi-IN) | ~8 s | Offline-ish, not in real-time loop |
| Assisted-call script display | < 100 ms | After transcript available |

Report p50 and p95 across the 30-clip benchmark on the Latency Bar.

---

## 3. Safety — Mandatory gates

| Metric | Target | Measurement |
| :--- | :--- | :--- |
| Secrets leaked in outbound TTS/text | 0 | `FORBIDDEN_SECRET_RE` audit; OTP/PIN/MPIN/CVV/password never spoken or shown |
| AI actions without logged consent | 0 | `SafetyGuardBlock` audit log |
| AI actions without disclosure | 0 | `ai_disclosure_played` audit log |
| Fabricated docket IDs | 0 | Verbatim substring gate (exact case-insensitive substring of call transcript) |
| Autonomous outbound calls made | 0 | Call log audit (must be zero) |
| Real PII in repo/demo | 0 | Synthetic data only; grep audit for real numbers/accounts |

---

## 4. Compliance — TRAI / DPDP / RBI

| Metric | Target | Measurement |
| :--- | :--- | :--- |
| AI disclosure played before script | 100% | `ai_disclosure_played` flag in every assisted-call session |
| Consent timestamped before processing | 100% | `citizen_consent_verified` with timestamp in `ConsentRecord` |
| Demo labeled synthetic | 100% | `SIMULATED DEMO` / `SYNTHETIC DATA` / `NO AUTONOMOUS DIALING` badges visible |
| RBI circular cited correctly | 100% | `RBI/2019-20/67`, `RB-IOS 2026`, `DBR circular` hardcoded in `statutory.py` |
| Docket verified verbatim | 100% | Substring check passes before case marked "registered" |

---

## 5. Demo Quality — Simulated Demo Day Drop

| Metric | Target | Measurement |
| :--- | :--- | :--- |
| Demo length | 60 s (uncut) | Video length |
| Formats | 16:9 master + 9:16 cut | Exported files |
| HUD quadrants | 4 (STT, Statutory, Assisted Call, Compliance) | Visible throughout |
| Legal cues shown | `SIMULATED DEMO`, `SYNTHETIC DATA`, `NO AUTONOMOUS DIALING`, `ZERO SECRETS LEAKED`, `AI DISCLOSURE PLAYED` | Present |
| Docket verified on screen | `SR-DB-884120 ✓ SUBSTRING VERIFIED` | Visible |
| Penalty counter shown | ₹600 RBI penalty | Statutory Card |
| Real API execution | 100% (Prisma → Evon → Timbre over real PCM) | Verified |

---

## 6. Award Alignment

| Category | Proof artifact |
| :--- | :--- |
| Jugaad Genius (primary) | Human-controlled advocate: voice intake + deterministic RBI math + assisted-call script + simulated IVR |
| Real Deal | Helps citizens recover stuck working capital + ₹100/day statutory compensation |
| Noise Canceller | 8 kHz street intake + Prisma vs Whisper WER split-screen |
| Mixed Vibes | Hinglish intake + `hi-IN`↔`en-IN` script switch |
| Demo Day Drop | 60s simulated video per `docs/demo_storyboard.md` |
| Crowd Favourite | Universal IVR/UPI pain point; LinkedIn & X votes |
| Small Town Big Build / Duo | Tier-2/3 build; clean duo split + individual write-ups |
