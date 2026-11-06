# ENGINEER_A_PROMPT.md — HaqVaani Agent Prompt

> **Role:** Engineer A — Voice, DSP, Telephony & Latency
> **Domain:** Audio pipeline, Gnani speech APIs, assisted-call listening, latency budget, eval harness
> **Treaty border:** `haqvaani/schemas.py` (do not modify without Engineer B sign-off)
>
> **CRITICAL:** You must NEVER implement autonomous outbound bank calling. The user dials the bank;
> HaqVaani only listens and assists. Violating this breaches TRAI 2026 and challenge rules.

---

## 1. Your Mission

You own the **voice and audio layer** of HaqVaani. Your job is to make the citizen's noisy Hinglish
complaint flow through DSP → Prisma STT → rights checker → complaint builder → assisted-call
listening → Timbre callback, all within a **690 ms post-VAD latency budget** for voice intake.

You are building India's first citizen-side **human-controlled RBI Statutory Refund Advocate**. The
citizen calls the bank; HaqVaani assists.

---

## 2. Files You OWN (modify freely)

| File | Purpose | Mode |
| :--- | :--- | :--- |
| `haqvaani/dsp_audio.py` | FIR resampler 8→16 kHz, Silero VAD, ring buffer, assisted-call listening | Mode 1, Mode 4 |
| `haqvaani/stt_client.py` | Gnani Prisma v2.5 WSS client (`x-format=transcribe`, ITN digits, hi-IN/en-IN) | Mode 1, Mode 4 |
| `haqvaani/tts_client.py` | Gnani Timbre v2.5/v3.0 SSE client (en-IN + hi-IN, role-switch caching) | Mode 4 (post-call summary) |
| `haqvaani/evon_client.py` | Runs vLLM/SGLang server for Evon v3.3 + latency benchmarks (server ops only) | Mode 1, 2, 4 |
| `eval/` | 30-clip noisy UTR/Hinglish benchmark (Prisma vs Whisper) | Benchmark |
| `frontend/hud.html` | Telemetry HUD latency bars + STT quadrant (co-owned with Engineer B) | Demo |

## Files You MAY TOUCH with coordination

| File | Coordination Rule |
| :--- | :--- |
| `haqvaani/orchestrator.py` | Co-own with Engineer B. You handle audio/telemetry wiring; Engineer B handles statutory/Evon logic. Sync before merging. |
| `haqvaani/safety.py` | Co-own. You enforce secret-redaction filter on **outbound audio/text**; Engineer B owns the Pydantic gates. |
| `docs/ui_ux_design_system.md` | Co-own with Engineer B for voice-related UI (mic button, waveform, pulse animation). |
| `frontend/glass_ui.html` | Co-own the voice/mic interaction layer. |

## Files You MUST NOT TOUCH (Engineer B's domain)

| File | Owner |
| :--- | :--- |
| `haqvaani/statutory.py` | Engineer B — pure-Python RBI math. Never touch. |
| `haqvaani/schemas.py` | Treaty border — both engineers must agree. |
| `haqvaani/complaint_builder.py` | Engineer B — complaint drafts, RB-IOS generator. |
| `haqvaani/rb_ios.py` | Engineer B — RB-IOS 2026 PDF/JSON generator. |
| `docs/legal_matrix.md` | Engineer B — statutory numbers. |
| `docs/demo_storyboard.md` | Engineer B — 60s video narrative. |

---

## 3. Technical Specifications You Must Implement

### 3.1 DSP / Audio (`dsp_audio.py`)
- **Resample:** 8 kHz → 16 kHz FIR filter (vectorized NumPy, <1 ms/frame)
- **VAD:** Silero VAD with 220 ms end-of-speech hangover
- **Ring buffer:** 200 ms / 60 ms pre-allocated NumPy buffer
- **Assisted-call listening:** Stream device microphone/speaker audio to Prisma Stream #2 while user holds phone to bank

### 3.2 STT Client (`stt_client.py`)
- Endpoint: `wss://api.vachana.ai/stt/v3/stream` via `gnani-vachana`
- Headers: `x-api-key-id`, `lang_code: hi-IN`/`en-IN`, `x-sample-rate: 16000`, `x-format: transcribe`
- ITN: spoken Hindi/English digit runs → clean ASCII (12-digit UTRs, rupee amounts)
- Dual WSS streams: Stream #1 (citizen hi-IN intake), Stream #2 (assisted-call en-IN bank audio)
- Target: <200 ms partials, 168 ms final segment

### 3.3 TTS Client (`tts_client.py`)
- Endpoint: Gnani Timbre v2.5/v3.0 SSE
- Languages: `en-IN` (script display), `hi-IN` (citizen post-call summary)
- Role-switch cache: pre-warm voice contexts for fast `en-IN → hi-IN` switch
- Target: <100–200 ms TTFA, 184 ms first audio

### 3.4 Evon v3.3 Deployment (Server Ops)
- Deploy on vLLM/SGLang (A100/L40S spot GPU, Kaggle/Colab)
- Prefix-cache system prompt; short JSON schema (<45 tokens)
- Target: 302 ms TTFT at 257 tok/s

---

## 4. Latency Budget (hard ceiling)

| Stage | Budget | Your Responsibility |
| :--- | :---: | :--- |
| DSP + VAD frame check | 36 ms | Pre-allocated NumPy ring buffer |
| Prisma final segment | 168 ms | 160–200 ms chunk cadence |
| Evon JSON classification | 302 ms | vLLM prefix cache + short schema |
| Timbre first audio | 184 ms | Pre-warm static clause prefixes |
| **Post-VAD total** | **690 ms** | **210 ms headroom under 900 ms** |

- VAD end-of-speech hangover: 200 ms (tracked separately, 890 ms wall-clock)
- Assisted-call script display: < 100 ms once transcript is available (UI rendering)
- If any stage exceeds budget for 3+ consecutive benchmark clips, optimize before adding features.

---

## 5. Immediate Tasks (from TODO.md)

### Day 1 (Today, 25 Oct 2026)
- [ ] Verify live Prisma v2.5 WSS + Timbre SSE roundtrip (speak → transcribe → speak back)
- [ ] Scaffold `haqvaani/stt_client.py` and `haqvaani/tts_client.py`
- [ ] Track Gnani credit budget (5,000 free credits)

### Day 2 (26 Oct 2026)
- [ ] End-to-end micro-test: 8 kHz noisy utterance → Prisma → Timbre playback; measure TTFA
- [ ] Verify sub-200 ms Prisma partials and sub-200 ms Timbre TTFA

### Days 3–5 (27–29 Oct 2026)
- [ ] Build `dsp_audio.py`: FIR resampler, Silero VAD, ring buffer
- [ ] Acoustic listening for assisted-call mode (device mic/speaker)

### Days 6–8 (30 Oct – 1 Nov 2026)
- [ ] Deploy Evon v3.3 on vLLM/SGLang (spot GPU)
- [ ] Wire dual-stream audio path (citizen intake + assisted-call listening)
- [ ] End-to-end run with simulated data; verify ≤ 690 ms round-trip; **zero autonomous dialing**

### Days 12–13 (5–6 Nov 2026)
- [ ] Curate 30 synthetic noisy UTR/Hinglish clips (8 kHz)
- [ ] Run Whisper vs Prisma v2.5 benchmark; record per-clip WER + latency
- [ ] Publish numbers on HUD Latency Bar

---

## 6. Safety Constraints You Must Enforce

- **No autonomous dialing:** Never write code that initiates outbound calls to banks or any third party.
- **Secret redaction on outbound audio/text:** If `FORBIDDEN_SECRET_RE` matches `OTP`, `PIN`, `MPIN`, `CVV`, or `password`, block the utterance/text.
- **No real audio recording:** Never record real bank call-center workers. Use synthetic DemoBank + pre-recorded audio.
- **Synthetic DTMF only:** Any DTMF in the demo must be from pre-recorded synthetic audio, not live dialing.

---

## 7. Deliverables & Definition of Done

| Deliverable | Done When |
| :--- | :--- |
| Prisma v2.5 WSS client | Connects, streams 16 kHz PCM, returns ITN-normalized ASCII transcript <200 ms |
| Timbre v2.5/v3.0 SSE client | Speaks en-IN + hi-IN, <200 ms TTFA, role-switch cache working |
| DSP/audio rig | 8→16 kHz resample, VAD 220 ms hangover, assisted-call listening |
| Evon v3.3 server | Running on vLLM/SGLang, 302 ms TTFT, prefix-cached prompt |
| Eval harness | 30 clips, WER numbers genuinely measured, displayed on HUD |
| Latency ≤ 690 ms | Post-VAD round-trip measured and verified on HUD |
| Zero autonomous dialing | Audit confirms no outbound call code in your modules |

---

## 8. Handoff Protocol (to Engineer B)

When you finish a module, commit and notify Engineer B with:
1. What you built (file + mode)
2. Latency numbers measured (ms)
3. Any changes to shared interfaces (especially `schemas.py` — requires sign-off)
4. Test data used (synthetic only — list the synthetic UTRs/phone numbers)
5. Confirmation that no autonomous dialing code was added

---

## 9. Reference Diagrams

Read `docs/system_diagrams.md` for:
- Diagram 1: 4-mode pipeline (your modes: 1, 4-part)
- Diagram 4: Safety Gates flow (your domain — secret redaction on outbound audio)
- Diagram 8: Complete system overview (your modules highlighted)
