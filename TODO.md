# TODO.md — HaqVaani Current Prioritized Atomic Tasks

> Day 1 of 16 (25 October 2026). HaqVaani is a **human-controlled refund advocate** — no autonomous
> bank dialing. Tasks are ordered by priority. Pick the top `todo` task, mark it `in progress`,
> implement, test, mark `done`, and update `CHANGELOG.md`.
>
> **Status (8 Nov 2026, Day 15/16):** The "HaqVaani Story" design system (docs/DESIGN.md) is
> the frontend: story landing + all 11 app screens (start-case → consent → intake → statutory
> check → complaint → call → dossier) live in `frontend/screens/`, wired to `haqvaani/api.py`
> with honest synthetic-demo fallbacks; `scripts/_ui_integrity_check.py` green. **A second,
> Awwwards-style React/Vite rebuild now lives in `web/`** (Heron × HaqVaani: editorial white,
> charcoal ink, hairline rules, one orange accent `#fa3600`, mono technical voice; Lenis + GSAP
> ScrollTrigger; all 11 screens + landing; same safety/consent/API contract, enforced by the
> extended integrity check — both checks green). NEXT: record the 60s simulated demo video.

---

## Today — Day 1 (Sun 25 Oct 2026): Foundation & Compliance Review

- [ ] `todo` Register on `gnani.ai/internship`; claim the 5,000 free API credits on `app.gnani.ai/voice`.
- [ ] `todo` Request `gnani/gnani-evon-v3.3-30B-A3B` weights on Hugging Face.
- [ ] `in progress` Verify a live Prisma v2.5 WSS + Timbre SSE roundtrip (speak → transcribe → speak back) — run `python scripts/verify_gnani_roundtrip.py` once `GNANI_API_KEY` is set.
- [ ] `todo` Compliance review: confirm no autonomous dialing; plan simulated bank IVR for demo.
- [x] `done` Scaffold repo structure (docs/, haqvaani/, eval/, frontend/, tests/).
- [x] `done` Write root documentation: AGENTS.md, RULES.md, ARCHITECTURE.md, ROADMAP.md, TODO.md, CHANGELOG.md, README.md, CONTRIBUTING.md.
- [x] `done` Write docs/: legal_matrix.md, latency_budget.md, demo_storyboard.md, interview_qa.md, evaluation.md, ui_ux_design_system.md.

## Day 2 (Mon 26 Oct 2026): Gnani Clients + Consent UI

- [x] `done` Build `haqvaani/stt_client.py` (Prisma v2.5 WSS per docs: x-api-key-id header, PCM 1024-byte frames @ real-time cadence, commit frame, VAD/telephony preset, ITN transcribe, bias).
- [x] `done` Build `haqvaani/tts_client.py` (Timbre v2.5/v3.0 SSE per docs: /api/v1/tts/sse, {text, voice, model, language, speed, audio_config}, chunk reassembly → single WAV; voice catalog map).
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
- [ ] `todo` Build `haqvaani/stt_client.py` + `haqvaani/tts_client.py` (needs verified Gnani endpoints) — **done** (see Day 2; live verification pending key).
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

- [x] `done` Restyle `frontend/landing.html`, `frontend/glass_ui.html`, `frontend/hud.html` with `docs/experience_concept.md` tokens (two canvases, indigo primary, AA-safe semantics) before recording.
- [x] `done` Build `haqvaani/api.py` (serves frontend at `/`, `/api/health|consent|intake|rights|complaint|assisted|tts|dossier`, consent-gated, secret-redacted) + `haqvaani/voice_clients.py` adapters; 41 tests pass; run with `make run-api`.
- [x] `done` Mirror Gnani docs into `docs/gnani_api/` (README, quick-start, api-reference-cheatsheet, llms-index) and rewrite live paths to the documented contract — `X-API-Key-ID`, real endpoints, PCM framing, TTS payload/audio_config. Offline contract tests in `tests/test_voice_contract.py`; live verify script `scripts/verify_gnani_roundtrip.py`.
- [x] `done` Product-completeness pass on `glass_ui.html`: calculation drawer, EN/HI draft toggle + approval model, brush-off badge, dossier modal with JSON export, browser-TTS fallback for Hindi summary.
- [x] `done` Design-system build-out per `docs/DESIGN.md`: story landing (`frontend/landing.html`, scroll-rail + beats) and all 11 app screens in `frontend/screens/` — start-case, consent, voice-intake, fact-review, rights-check, complaint-builder, call-prep, assisted-call, docket-capture, post-call, dossier — each with the shared shell (step bar via `#stepMount`, "Synthetic demo" chip, persistent safety bar), Hindi-first copy, and honest demo fallbacks mirroring `statutory.py` self-test values.
- [x] `done` Rewrite `scripts/_ui_integrity_check.py` for the new system: 11-screen shell contract, landing rail beats, consent gate on voice screens, end-to-end flow links, banned `alert()`/`text-transform`/gradients/entrance-everywhere hooks. Green.
- [x] `done` Rebuild the frontend as a Vite + React 18 app in `web/` (Heron × HaqVaani: editorial white `#ffffff`, charcoal ink `#282828`, hairline rules `#e5e7eb`, ONE orange accent `#fa3600`, green `#1a7f4b` only for refund-credited; Archivo / Geist Mono / Noto Sans Devanagari; spacing 8/18/26/54/132, section pad 75px, gutter 38px; buttons 0-radius/75px/min-222px; cards 8px; chips pill; `--speed:260ms` + `--ease`; `prefers-reduced-motion` disables all motion). Dependencies: gsap + ScrollTrigger, lenis, framer-motion — no UI library. Landing scroll-story (4 acts: KAT GAYA → RULE → ₹100/DIN → WAPAS + 5-step journey + CTA/safety band), all 11 screens mirroring `frontend/screens/*.html` behaviour, hash router + API client + session state + consent gate + demo fixtures + i18n Pair/LangToggle in `web/src/lib/`, AppShell (brand head, mode chip, 5-step rail, safety bar), hooks (useCapture/useMode/useToast/useSpeak/useReducedMotion/useWorksExample), SVG line-art library. `npm run build` clean (64 modules, gzip 130 kB).
- [x] `done` Extend `scripts/_ui_integrity_check.py` to enforce the same contract on `web/` in the same commit: exact token values, approved Google fonts only, no gradients/glass/string-DOM, SECRET_RE + exact AI-disclosure line + "Simulated IVR / synthetic demo" labels + no-autonomous-dialing line, consent-gate dispatch, all 11 routes in router + dispatch, `/api` proxy. Both systems green.
- [x] `done` Smoke-test the `web/` app against the API: `npm run dev` on 5173 + proxy → `make run-api` on 8000; `GET /api/health`, consent → rights API contract verified through the proxy (rights returns full entitlement; dossier correctly 404 CASE_INCOMPLETE until all four modes complete).
- [x] `done` Cinematic visual pass on `web/` (epic-design): ghost depth numerals, masked line reveals, marquee tickers, rule chips, visual journey steps, screen ghost layers — prose cut ~60% on the landing; safety/consent contract unchanged; `prefers-reduced-motion` kills all motion.
- [x] `done` Rebuild the landing as the exact port of `optimizing-ui-visual-storytelling` (the chosen "paper poster" UI): progress bar, interactive case calculator (API/demo-sourced), four pinned SVG acts with scrubbed GSAP timelines, details section, footer honesty lines; app screens untouched; integrity check updated to the new contract; both systems green.
- [x] `done` Round-1 moat features: RBI timeline split (T+1 vs T+5 + circular anchor), sliding-window secret redaction (10s buffer), on-device UPI screenshot OCR prefill, Ombudsman CMS prefill export, `docs/pitching.md` narrative — all free, no `haqvaani/` changes, build + integrity green.
- [ ] `todo` Round-2 live-Gnani wiring (needs `GNANI_API_KEY` + live endpoints; see `docs/pitching.md` §edges): Vachana STT params (`prisma-v3.0`, codemix/ITN, `bias_list`, `x-min-silence-ms:800`, `x-vad-threshold:0.75`), Timbre whisper coaching (<200ms TTFA), 429-safe STT/TTS queuing, Vercel key-proxy template, pre-cached static consent audio.
- [ ] `todo` Smoke-test every screen against the API (`make run-api`, pages at `/` and `/screens/*.html`), then record uncut 60s Simulated Demo Day Drop (16:9 + 9:16) per docs/demo_storyboard.md.
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
