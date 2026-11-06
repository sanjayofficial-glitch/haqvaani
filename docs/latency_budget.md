# docs/latency_budget.md — HaqVaani Latency Budget

> Target latencies and how to measure them. HaqVaani is a human-controlled advocate, so real-time
> responsiveness matters for assisted-call listening and transcription, but there is no autonomous
> outbound call loop. Budget targets are for voice intake and assisted-call listening.

---

## 1. Stage Budget (voice intake & assisted call)

| # | Stage | Budget | Anchor / Source | Mitigation if Exceeded |
| :--- | :--- | :---: | :--- | :--- |
| 1 | DSP + Silero VAD frame check | **36 ms** | Local vectorized CPU (<1 ms/frame) | Pre-allocated NumPy ring buffer |
| 2 | Prisma v2.5 final segment (STT) | **168 ms** | Published sub-200 ms streaming STT | Keep chunk cadence at 160–200 ms |
| 3 | Evon v3.3 JSON classification (TTFT) | **302 ms** | Published 302 ms TTFT (257 tok/s) | Short JSON schema (<45 tok); prefix-cache system prompt in vLLM |
| 4 | Timbre v2.5/v3.0 first audio (TTFA) | **184 ms** | Published <100–200 ms SSE TTFA | Pre-warm static statutory clause prefixes in memory |
| | **Post-transcript total** | **690 ms** | **210 ms headroom under 900 ms** | — |

### Separate tracking
- VAD end-of-speech hangover: **200 ms** (tracked on HUD; 890 ms wall-clock).
- Assisted-call script display: < 100 ms once transcript is available (UI rendering).
- Post-call summary (Timbre hi-IN): ~8 s (offline-ish; generated after call ends).

---

## 2. Measurement Method

Each stage is timed with `time.perf_counter()` around its core call and pushed to the Telemetry
HUD:

```python
t0 = time.perf_counter()
segment = await stt_client.transcribe(chunk)          # Stage 2
t1 = time.perf_counter()
verdict = await evon_client.classify(segment)          # Stage 3 (rights checker)
t2 = time.perf_counter()
audio = await tts_client.speak(verdict.summary)        # Stage 4 (post-call summary)
t3 = time.perf_counter()
```

- Report **p50** and **p95** across the 30-clip benchmark.
- Every number on the HUD must come from real measurements, never hardcoded estimates.

---

## 3. Latency Optimization Playbook

| Lever | Action | Expected impact |
| :--- | :--- | :--- |
| Chunk cadence | Stream 160–200 ms audio chunks to Prisma | Keeps STT at 168 ms |
| vLLM prefix cache | Cache Evon system prompt; short JSON schema (<45 tok) | Holds Evon at 302 ms TTFT |
| TTS pre-warm | Pre-warm static statutory clause prefixes | Holds Timbre at 184 ms TTFA |
| Ring buffer | Pre-allocated NumPy buffer (no alloc per frame) | Keeps DSP+VAD at 36 ms |
| Role-switch cache | Cache Timbre `en-IN`↔`hi-IN` voice contexts | Fast summary switch |

---

## 4. Ceiling Rule

If any stage exceeds its budget for more than 3 consecutive benchmark clips, the agent must
optimize before adding features. The sub-900 ms ceiling is a hard requirement for voice intake
responsiveness — a slow assistant frustrates citizens in noisy environments.
