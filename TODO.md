# TODO.md — HaqVaani Current Prioritized Atomic Tasks

> Day 1 of 16 (25 October 2026). HaqVaani is a **human-controlled refund advocate** — no autonomous
> bank dialing. Tasks are ordered by priority. Pick the top `todo` task, mark it `in progress`,
> implement, test, mark `done`, and update `CHANGELOG.md`.
>
> **Status (6 Nov 2026):** Core pure-Python engine shipped — `schemas.py`, `statutory.py`,
> `safety.py` + tests, `pyproject.toml`, git initialized. NEXT: register/claim Gnani credits,
> verify real API endpoints, build `stt_client.py`/`tts_client.py`, then wire E2E demo.

---

## Today — Day 1 (Sun 25 Oct 2026): Foundation & Compliance Review

- [ ] `todo` Register on `gnani.ai/internship`; claim the 5,000 free API credits on `app.gnani.ai/voice`.
- [ ] `todo` Request `gnani/gnani-evon-v3.3-30B-A3B` weights on Hugging Face.
- [ ] `todo` Verify a live Prisma v2.5 WSS + Timbre SSE roundtrip (speak → transcribe → speak back).
- [ ] `todo` Compliance review: confirm no autonomous dialing; plan simulated bank IVR for demo.
- [x] `done` Scaffold repo structure (docs/, haqvaani/, eval/, frontend/, tests/).
- [x] `done` Write root documentation: AGENTS.md, RULES.md, ARCHITECTURE.md, ROADMAP.md, TODO.md, CHANGELOG.md, README.md, CONTRIBUTING.md.
- [x] `done` Write docs/: legal_matrix.md, latency_budget.md, demo_storyboard.md, interview_qa.md, evaluation.md, ui_ux_design_system.md.

## Day 2 (Mon 26 Oct 2026): Gnani Clients + Consent UI

- [ ] `todo` Build `haqvaani/stt_client.py` (Prisma v2.5 WSS, x-format=transcribe, ITN digits, hi-IN/en-IN).
- [ ] `todo` Build `haqvaani/tts_client.py` (Timbre v2.5/v3.0 SSE, en-IN + hi-IN).
- [x] `done` Build `haqvaani/safety.py`: consent/disclosure gates, FORBIDDEN_SECRET_RE, AI disclosure text, verbatim docket verify.
- [ ] `todo` End-to-end micro-test: 8 kHz noisy utterance → Prisma → Timbre playback; measure TTFA.
- [ ] `todo` Track Gnani credit budget (5,000 free credits).

## Days 3–5 (Tue 27 – Thu 29 Oct 2026): DSP/Audio + Statutory Engine + Schemas

- [ ] `todo` Build `haqvaani/dsp_audio.py`: FIR resampler 8→16 kHz, Silero VAD (220 ms hangover), ring buffer (200 ms/60 ms).
- [x] `done` Build `haqvaani/schemas.py`: CitizenIntake, AgentNegotiationExtraction, HaqVaaniCaseRecord, ConsentRecord (treaty border).
- [x] `done` Build `haqvaani/statutory.py`: pure-Python compute_statutory_entitlement() (T+1, T+5, ₹100/day, zero-liability).
- [ ] `todo` Build `haqvaani/evon_client.py`: intake parser + brush-off/docket parser (needs Gnani access).
- [ ] `todo` Synthetic bank IVR script + test utterances (simulated demo only).
- [ ] `todo` Post build-in-public teaser on LinkedIn/X.

## Days 6–8 (Fri 30 Oct – Sun 1 Nov 2026): Evon + 4-Mode Orchestrator + Assisted-Call UI

- [ ] `todo` Deploy Evon v3.3 on vLLM/SGLang (spot GPU); prefix-cache system prompt; short JSON schema (<45 tok).
- [x] `done` Build `haqvaani/complaint_builder.py`: bank complaint draft, WhatsApp/email draft, evidence checklist, RB-IOS 2026 CMS draft.
- [x] `done` Build `haqvaani/orchestrator.py`: 4-mode pipeline switcher (offline E2E self-test works; STT/TTS/Evon plug in via VoiceAPI adapter).
- [ ] `todo` Build `haqvaani/stt_client.py` + `haqvaani/tts_client.py` (needs verified Gnani endpoints).
- [ ] `todo` Build assisted-call UI: start call, real-time script display, docket capture, post-call summary.
- [ ] `todo` End-to-end run with simulated data; verify no autonomous dialing anywhere.

## Days 9–11 (Mon 2 – Wed 4 Nov 2026): Telemetry HUD + Compliance

- [ ] `todo` Build 16:9 dark Telemetry HUD (single HTML, vanilla JS, Canvas, Tailwind CDN).
- [ ] `todo` Quadrants: Whisper vs Prisma UTR WER; Statutory Meter; Assisted-Call Script + Docket Verifier; Compliance/Safety Indicators.
- [ ] `todo` 9:16 mobile cut.

## Days 12–13 (Thu 5 – Fri 6 Nov 2026): Benchmark

- [ ] `todo` Curate 30 synthetic noisy UTR/Hinglish clips (8 kHz).
- [ ] `todo` Run Whisper vs Prisma v2.5; record per-clip WER + latency.
- [ ] `todo` Publish benchmark report; verify every number on HUD is genuinely measured.

## Days 14–15 (Sat 7 – Sun 8 Nov 2026): Simulated Demo Video

- [ ] `todo` Record uncut 60s Simulated Demo Day Drop (16:9 + 9:16) per docs/demo_storyboard.md.
- [ ] `todo` Burned captions; "SIMULATED DEMO" + "NO AUTONOMOUS DIALING" badges.
- [ ] `todo` Publish on LinkedIn/X with #GnaniAI #GreatIndianAIInternshipChallenge.
- [ ] `todo` Save post URLs for submission.

## Day 16 (Mon 9 Nov 2026): Submission

- [ ] `todo` Nominate LinkedIn/X URLs in official submission portal.
- [ ] `todo` Verify individual contribution write-ups; rehearse Duo Defense Q&A.
- [ ] `todo` Buffer before 10 Nov 11:59 PM IST deadline.

---

## How to update

- Change `todo` → `in progress` when you start a task.
- Change `in progress` → `done` when implemented + tested.
- Add new tasks at the bottom of the relevant day; re-prioritize only with duo agreement.
- When a day is fully done, move its section under a `## Completed` archive block.
