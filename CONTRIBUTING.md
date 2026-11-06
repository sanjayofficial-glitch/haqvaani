# CONTRIBUTING.md — HaqVaani

> Guidelines for both human duo members and AI coding agents. Read before contributing.

---

## 1. For Human Duo Members

HaqVaani is built by a two-person team with a clean engineering split. Respect the treaty border
in `haqvaani/schemas.py` (`CitizenIntake`, `AgentNegotiationExtraction`, `HaqVaaniCaseRecord`,
`ConsentRecord`).

| Layer | Engineer A — Voice, DSP, Telephony & Latency | Engineer B — Statutory Engine, Evon v3.3 & Product UI |
| :--- | :--- | :--- |
| Audio & Telephony | Silero VAD, ring buffer, assisted-call listening UI | Supplies synthetic IVR scripts & test utterances |
| Simulated IVR (demo only) | DTMF generator & Goertzel decoder | Defines IVR action grammar (`IVRAction`) |
| Gnani Speech APIs | Prisma v2.5 WSS + Timbre SSE + role-switch caching | Tunes `bias_list` & Hinglish/English cadences |
| Evon v3.3 & Schemas | Runs vLLM/SGLang server & latency benchmarks | Owns prompts, `BrushOffType` taxonomy & Pydantic v2 validators |
| Statutory & RB-IOS | Enforces secret-redaction filter on outbound audio/text | Owns `compute_statutory_entitlement` + RB-IOS 2026 draft |
| Compliance | TRAI A2P calling audit log | DPDP consent screen + disclosure text |
| Eval Harness & HUD | 30-clip WER benchmark (Prisma vs Whisper) | 4-quadrant Telemetry HUD + compliance indicators |

**Crossing the border:** Changes to `schemas.py` require both engineers' sign-off. PRs touching
another engineer's files need a quick sync first. Individual contribution write-ups are required for
the Duo Defense interview (Day 16).

### Workflow
1. Pick the top `todo` task from `TODO.md`.
2. Create a branch: `git checkout -b <initials>/<short-description>`.
3. Implement, test, update `CHANGELOG.md`.
4. Open a PR; the other engineer reviews before merge.
5. Update `TODO.md` (`todo` → `done`).

---

## 2. For AI Coding Agents

You are a member of the engineering team. Follow these rules exactly.

### Read first, every session
`AGENTS.md` → `RULES.md` → `ARCHITECTURE.md` → `ROADMAP.md` → `TODO.md`.

### One task at a time
Work from `TODO.md`. Mark tasks `in progress` → `done`. Never start a new task before finishing
the current one unless blocked (then note the blocker in `TODO.md`).

### Never break safety gates
Do not weaken or remove: `FORBIDDEN_SECRET_RE`, the consent gate (`citizen_consent_verified`,
`ai_disclosure_played`), the "no autonomous dialing" guard, or the verbatim substring verification
gate. All live in `haqvaani/safety.py` and `haqvaani/statutory.py`.

### Deterministic statutory math
All RBI calculations live in `haqvaani/statutory.py` (pure Python). LLMs may format or explain
outputs but must never compute deadlines, TAT dates, or ₹100/day penalties.

### Synthetic data only
All test data, phone numbers, UTRs, and docket IDs are synthetic. Never record real calls or add
real PII to the repo. Label all demo bank interactions as "Simulated IVR / synthetic demo."

### Latency budget
Target STT partials ≤ 200 ms and TTS TTFA ≤ 200 ms. Profile stage timings before optimizing
(see `docs/latency_budget.md`).

### Documentation discipline
When you change architecture, stack, or rules, update `ARCHITECTURE.md`, `RULES.md`, and
`AGENTS.md` in the same change. Comment every non-trivial function with its intent and the mode
it belongs to.

### Duo respect
Do not touch another engineer's owned files without notice (see ownership matrix in
`ARCHITECTURE.md`). `schemas.py` is the treaty border — both engineers must agree to changes.

---

## 3. Submission Checklist (Day 16)

- [ ] Gnani credentials working; 5,000 credit budget tracked.
- [ ] 4-mode pipeline functional with synthetic data (no autonomous dialing).
- [ ] STT partials ≤ 200 ms; TTS TTFA ≤ 200 ms.
- [ ] 30-clip Prisma vs Whisper benchmark published with genuine WER/latency.
- [ ] 60-second Simulated Demo Day Drop video (16:9 + 9:16) published on LinkedIn & X.
- [ ] Post URLs nominated in the official submission portal.
- [ ] Individual contribution write-ups complete; Duo Defense rehearsed.
- [ ] Safety gates intact; no real PII in repo or demo; TRAI/DPDP compliance documented.
