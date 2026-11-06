# PRD.md — HaqVaani Product Requirements (Submission Scope)

> Product Requirements for the Great Indian AI Internship Challenge submission (deadline
> 10 Nov 2026, 11:59 PM IST). Scope is intentionally minimal-but-vertical: one working
> flow that is legally airtight and demoable end-to-end.

---

## 1. Problem

Failed UPI transfers ("money deducted, not received") strand millions of citizens. Under
**RBI/2019-20/67**, failed P2P transfers must auto-reverse within **T+1** calendar day
(T+5 for merchant/ATM), after which the bank owes **₹100/day** compensation — **suo motu**.
Most citizens never claim it: they don't know the rule, can't parse English processes, and
have no complaint trail.

## 2. Target user

Non-English-speaking Indian citizen (8 kHz telephony, Hinglish), low digital literacy,
no legal/technical background.

## 3. Jobs-to-be-done

1. "Tell me what the bank owes me" — correct statutory computation, never hallucinated.
2. "Draft my complaint for me" — ready-to-send bank complaint / WhatsApp / email.
3. "Help me talk to the bank" — real-time script + docket capture, verified verbatim.
4. Keep the citizen in control — no autonomous dialing, AI disclosure, consent first.

## 4. Product promise

> "You speak. HaqVaani computes your RBI rights, drafts your complaint, and coaches you
> through the bank call. You remain the caller and decision-maker."

## 5. In scope (submission MVP)

| # | Capability | Status |
| :--- | :--- | :--- |
| 1 | Voice intake via Prisma v2.5 (WSS) → structured facts | to build |
| 2 | Statutory rights engine (pure Python, deterministic) | ✅ done + tested |
| 3 | Complaint builder (bank / WhatsApp / email / evidence / RBI CMS draft) | to build |
| 4 | Assisted-call flow (simulated IVR): transcript → brush-off → script → docket verify | to build |
| 5 | Consent + disclosure + secret-redaction safety gates | ✅ done + tested |
| 6 | 60–90s demo video (16:9) + LinkedIn/X post + portal submission | to do |

## 6. Out of scope (cut for deadline)

- Live Mode-4 listening on a real call (operational v1 feature).
- Silero VAD / FIR resampler / ring buffer (demo records at 16 kHz, push-to-talk).
- Telemetry HUD and 30-clip WER benchmark (optional stretch only).
- Evon self-hosting on GPU — **hosted Evon via app.gnani.ai/voice** is used instead.
- SQLite persistence, PDF dossier, HF Spaces deployment.

## 7. Non-functional requirements

| Aspect | Target |
| :--- | :--- |
| Latency | STT partials ≤200 ms; TTS first audio ≤200 ms; script display <100 ms |
| Determinism | All statutory numbers from `statutory.py`; LLM never computes them |
| Compliance | consent + disclosure before processing; 0 secrets leaked; 0 autonomous calls; synthetic data only |
| Cost | Zero paid infra: 5,000 Gnani credits + open-source only |
| Accessibility | WCAG 2.2 AA; Hindi-first; voice-first |

## 8. Success metrics (see docs/evaluation.md)

- Prisma WER on UTRs <5% (spot-check on 5–10 clips — full 30-clip benchmark optional).
- Statutory math matches docs/legal_matrix.md worked examples exactly.
- Safety: 0 secrets leaked, 0 AI actions without consent/disclosure, 0 fabricated dockets.
- Demo: uncut, badged `SIMULATED DEMO` / `NO AUTONOMOUS DIALING`, synthetic data only.
- Submission: live post URL before 10 Nov 2026 23:59 IST.

## 9. Milestones

| Date | Milestone |
| :--- | :--- |
| Sat 7 Nov | Backend modules complete, offline E2E self-test passes |
| Sun 8 Nov | Gnani roundtrip verified; UI wired; demo recorded |
| Mon 9 Nov | Video posted with hashtags; portal submission done; buffer |

## 10. Risks

| Risk | Mitigation |
| :--- | :--- |
| Gnani access delayed | Offline demo path works with synthetic transcript (documented fallback) |
| Hosted Evon schema drift | Clients isolate EV; short JSON contract |
| Video quality | Rehearse storyboard; captions; 9:16 cut from 16:9 |
