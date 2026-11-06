# ROADMAP.md — 16-Day Ship Plan (25 Oct → 10 Nov 2026)

> Great Indian AI Internship Challenge, Gnani AI. Deadline: 10 November 2026, 11:59 PM IST.
> Today is Day 1 (25 October 2026). Each day has a clear goal; atomic tasks live in `TODO.md`.
>
> HaqVaani is a **human-controlled refund advocate** — no autonomous bank calling. Simulated demo only.

---

## Timeline Summary

| Phase | Dates | Days | Focus |
| :--- | :--- | :--- | :--- |
| Foundation & Compliance | Oct 25–26 | 1–2 | Gnani credits, weights, Prisma+Timbre roundtrip, TRAI/DPDP review |
| Core Build | Oct 27–29 | 3–5 | DSP audio, statutory engine, schemas, consent gate |
| Modes & Orchestration | Oct 30–Nov 1 | 6–8 | Evon v3.3 on vLLM/SGLang + 4-mode orchestrator + assisted-call UI |
| Telemetry HUD | Nov 2–4 | 9–11 | 4-quadrant dark HUD + compliance/safety indicators |
| Benchmark | Nov 5–6 | 12–13 | 30-clip Prisma vs Whisper WER + latency |
| Demo Video | Nov 7–8 | 14–15 | Record 60s Simulated Demo Day Drop (16:9 + 9:16) |
| Submission Buffer | Nov 9 | 16 | Submit portal URLs, rehearsals, 24h buffer |

---

## Day-by-Day Goals

### Day 1 (Sun 25 Oct 2026) — TODAY: Register, Compliance Review & Verify Gnani Access
- Register on `gnani.ai/internship`; claim the 5,000 free API credits on `app.gnani.ai/voice`.
- Request `gnani/gnani-evon-v3.3-30B-A3B` weights on Hugging Face.
- Verify a live Prisma v2.5 WSS + Timbre SSE roundtrip (hello-world: speak → transcribe → speak back).
- **Compliance review:** Confirm no autonomous dialing; plan simulated bank IVR for demo.
- Scaffold repo: this documentation (AGENTS.md, RULES.md, ARCHITECTURE.md, ROADMAP.md, TODO.md, CHANGELOG.md, README.md, CONTRIBUTING.md) + `docs/` + package skeleton.
- **Exit criteria:** Gnani credentials working; repo cloned; compliance approach documented; `TODO.md` seeded.

### Day 2 (Mon 26 Oct 2026) — Prisma + Timbre Roundtrip Hardening + Consent UI
- Build `haqvaani/stt_client.py` (Prisma v2.5 WSS, `x-format: transcribe`, ITN digits, hi-IN/en-IN).
- Build `haqvaani/tts_client.py` (Timbre v2.5/v3.0 SSE, en-IN + hi-IN).
- Build `haqvaani/safety.py`: consent screen, `FORBIDDEN_SECRET_RE`, AI disclosure text.
- End-to-end micro-test: 8 kHz noisy utterance → Prisma → Timbre playback; measure TTFA.
- **Exit criteria:** Sub-200 ms Prisma partials; sub-200 ms Timbre TTFA; consent screen functional.

### Days 3–5 (Tue 27 – Thu 29 Oct 2026) — DSP/Audio + Statutory Engine + Schemas
- Build `haqvaani/dsp_audio.py`: 8→16 kHz FIR resampler, Silero VAD (220 ms hangover), ring buffer.
- Build `haqvaani/schemas.py`: CitizenIntake, AgentNegotiationExtraction, HaqVaaniCaseRecord, ConsentRecord (treaty border).
- Build `haqvaani/statutory.py`: pure-Python `compute_statutory_entitlement()` for RBI/2019-20/67 (T+1 P2P, T+5 P2M/ATM, ₹100/day) and DBR circular zero-liability.
- Build `haqvaani/evon_client.py`: intake parser + brush-off parser.
- Synthetic bank IVR script + test utterances (for simulated demo only).
- Post a short build-in-public teaser on LinkedIn/X.
- **Exit criteria:** Statutory math matches `docs/legal_matrix.md` exactly; consent + disclosure gates functional.

### Days 6–8 (Fri 30 Oct – Sun 1 Nov 2026) — Evon v3.3 + 4-Mode Orchestrator + Assisted-Call UI
- Deploy Evon v3.3 on vLLM/SGLang (A100/L40S spot GPU); prefix-cache system prompt; short JSON schema (<45 tokens).
- Build `haqvaani/complaint_builder.py`: bank complaint draft, WhatsApp/email draft, evidence checklist, RB-IOS 2026 CMS draft.
- Build `haqvaani/orchestrator.py`: 4-mode pipeline switcher (Intake → Rights → Complaint → Assisted Call).
- Build assisted-call UI: user taps "Start Assisted Call," system displays real-time script, docket capture, post-call summary.
- **Exit criteria:** All 4 modes functional with simulated data; no autonomous dialing anywhere.

### Days 9–11 (Mon 2 – Wed 4 Nov 2026) — Telemetry HUD + Compliance Indicators
- Build 16:9 dark Telemetry HUD (single HTML file, vanilla JS, Canvas, Tailwind CDN).
- Quadrants: Whisper vs Prisma live UTR WER; Statutory Meter; Assisted-Call Script + Docket Verifier; Compliance/Safety Indicators (consent, disclosure, secret redaction, no autonomous dialing badge).
- 9:16 mobile cut.
- **Exit criteria:** HUD reflects real measured stage latencies; compliance badges visible.

### Days 12–13 (Thu 5 – Fri 6 Nov 2026) — 30-Clip Benchmark
- Curate 30 synthetic noisy UTR/Hinglish clips (8 kHz).
- Run Whisper (local) vs Prisma v2.5; record WER per clip + latency.
- Publish numbers on the HUD; every WER/latency figure on screen must be genuinely measured.
- **Exit criteria:** Benchmark report with per-clip WER and p50/p95 latency.

### Days 14–15 (Sat 7 – Sun 8 Nov 2026) — Simulated Demo Day Drop Video
- Record the uncut 60-second Simulated Demo Day Drop (16:9 master + 9:16 cut).
- Flow: user speaks → Prisma transcribes → Rights Checker computes → Complaint Builder drafts → Assisted Call simulated → docket verified → Timbre hi-IN summary.
- Burned captions; "SIMULATED DEMO" badge throughout; "NO AUTONOMOUS DIALING" disclosure.
- Publish on LinkedIn & X with `#GnaniAI` and `#GreatIndianAIInternshipChallenge`; pin architecture + benchmark comment.
- **Exit criteria:** 60s video uncut, legally airtight (synthetic data, no real numbers, simulated bank), URLs saved for submission.

### Day 16 (Mon 9 Nov 2026) — Submission + 24h Buffer
- Nominate live LinkedIn & X post URLs in the official submission portal.
- Verify individual contribution write-ups (duo interview defense).
- Rehearse Duo Defense Q&A (see `docs/interview_qa.md`).
- Buffer before 10 Nov 11:59 PM IST deadline.

---

## Milestone Checkpoints

- **M1 (Day 2):** Gnani roundtrip live; consent screen functional.
- **M2 (Day 5):** Statutory engine + DSP/audio done; teaser posted.
- **M3 (Day 8):** 4-mode orchestrator end-to-end with simulated data; no autonomous dialing.
- **M4 (Day 11):** Telemetry HUD with compliance indicators.
- **M5 (Day 13):** 30-clip benchmark published.
- **M6 (Day 15):** 60s Simulated Demo Day Drop video live.
- **M7 (Day 16):** Submission portal complete; buffer day.
