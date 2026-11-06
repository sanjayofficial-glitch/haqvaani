# docs/interview_qa.md — Gnani Interview Q&A with Model Answers

> High-probability Gnani interview questions and strong, architecture-aligned model answers. For
> the Duo Defense (Day 16) and any Gnani reviewer. Emphasizes human-controlled advocate design,
> TRAI/DPDP compliance, and no autonomous dialing.

---

## Q1. Why not let the AI autonomously call the bank and negotiate?

**Model answer.** HaqVaani is a **human-controlled advocate**, not an autonomous bot. Autonomous
outbound calling to banks raises TRAI A2P (Application-to-Person) calling compliance issues,
identity/fraud concerns, and unauthorized representation questions. Under TRAI's 2026 framework,
entities using A2P calls must pre-declare CLI details to their telecom provider. HaqVaani avoids
this entirely: the citizen calls the bank themselves; HaqVaani only listens (via device
microphone/speaker), shows a real-time script, captures the docket number, and summarizes the
call afterward. The user remains the caller and decision-maker.

---

## Q2. Isn't an AI assisting a bank call impersonation?

**Model answer.** Never. HaqVaani never claims to be the citizen. Its mandatory disclosure states:
"This is an AI assistant assisting [user name]." This aligns with fair practice and TRAI
expectations. The AI provides a script for the user to read; it does not speak on the user's
behalf without explicit, timestamped consent (`ai_disclosure_played == True`). Default behavior is
to give the user words to say, not to say them for the user.

---

## Q3. How do you ensure RBI rules aren't hallucinated by the LLM?

**Model answer.** All RBI statutory math—TAT dates (T+1 for P2P, T+5 for P2M/ATM), days overdue,
and ₹100/day penalties—is computed in **pure Python** in `haqvaani/statutory.py`. The LLM
(Evon v3.3) only extracts facts from speech, parses brush-offs, and formats output. It never
touches legal math. The rules are stored in a versioned table (`docs/legal_matrix.md`) and cited
by exact circular number in the UI.

---

## Q4. What happens if the bank asks for an OTP or ATM PIN?

**Model answer.** Two-way firewall:
1. HaqVaani never stores PINs/OTPs in conversation state.
2. `FORBIDDEN_SECRET_RE` hard-blocks any outbound TTS/text containing `OTP`, `PIN`, `MPIN`, `CVV`,
   or `password`.
3. If a bank agent requests live KYC verification, the user handles it directly; HaqVaani does not
   capture or relay the secret. The post-call summary notes that KYC was requested but does not
   record the secret itself.

---

## Q5. Why Gnani's stack instead of OpenAI Realtime?

**Model answer.** Three reasons:
1. **Indian telephony ITN contract:** OpenAI Realtime has no native 8 kHz Indian-accent contract
   for UTRs, lakhs, and crores. Prisma v2.5 with `x-format=transcribe` was trained on 14M+ hours
   of Indian telephony and normalizes spoken digit runs into clean ASCII.
2. **Bilingual support:** Native `hi-IN` street Hinglish ↔ crisp `en-IN` banking English sounds
   native on Timbre v2.5/v3.0, which is central to our post-call summary.
3. **Sovereign Indian infra:** Evon v3.3 is Apache-2.0 open weights, keeping citizen financial
   dispute transcripts inside Indian infrastructure.

---

## Q6. How do you handle the synthetic-data rule while demoing a bank call?

**Model answer.** We use a **simulated demo** that is 100% real Gnani API execution and 100%
legally airtight:
- The presenter speaks live in Hinglish into the mic with street ambience in the room.
- Prisma v2.5 transcribes; Evon v3.3 extracts facts; the Rights Checker computes statutory
  entitlement; the Complaint Builder generates a draft.
- The assisted-call portion uses **pre-recorded synthetic bank audio** (simulated IVR + stubbed
  bank agent). No real phone number is dialed. No real bank worker is recorded.
- Every audio byte goes over real PCM through live Gnani Prisma WSS → live Evon v3.3 → live Gnani
  Timbre SSE.
- The video is labeled `SIMULATED DEMO`, `SYNTHETIC DATA`, and `NO AUTONOMOUS DIALING`
  throughout.

---

## Q7. Is the ₹100/day penalty computed by the LLM?

**Model answer.** Absolutely not. All RBI statutory math is computed in **pure Python** in
`haqvaani/statutory.py`. The LLM only parses intent and classifies brush-offs; it never touches
legal math. This makes the numbers auditable and challenge-safe.

---

## Q8. How is citizen consent handled?

**Model answer.** Before any AI-assisted communication or voice processing, the orchestrator
requires `citizen_consent_verified == True` with a timestamp, and plays the AI disclosure
(`ai_disclosure_played == True`), aligning with the DPDP Act 2023. `SafetyGuardBlock`
hard-blocks any AI-assisted action without both flags logged. Consent is captured at intake via a
plain-language screen and recorded in `HaqVaaniCaseRecord`.

---

## Q9. What metrics will you show on Demo Day?

**Model answer.** On the Telemetry HUD:
- WER: Prisma v2.5 vs Whisper on 30 synthetic noisy UTR/Hinglish clips (genuinely measured).
- Latency: per-stage ms (DSP+VAD 36 ms, STT 168 ms, Evon 302 ms, TTS 184 ms).
- Safety: secrets leaked = 0; docket substring-verified = true; autonomous dialing = 0 calls.
- Statutory: TAT date, days overdue, ₹100/day penalty, total claim.
- Compliance: consent timestamp, AI disclosure played, TRAI/DPDP badges visible.

---

## Q10. Who owns what in the duo?

**Model answer.** Clean split with treaty border at `haqvaani/schemas.py`:
- **Engineer A** — Voice, DSP, telephony & latency: Silero VAD, ring buffer, Prisma WSS + Timbre
  SSE, vLLM server & benchmarks, WER harness, assisted-call listening UI.
- **Engineer B** — Statutory engine, Evon v3.3 & product UI: `compute_statutory_entitlement`,
  RB-IOS 2026 draft generator, Evon prompts & `BrushOffType` taxonomy, Pydantic v2 validators,
  complaint builder, Telemetry HUD + compliance indicators, 60s video narrative.
`schemas.py` changes require both engineers' sign-off.

---

## Q11. What if a user wants to file directly on `cms.rbi.org.in`?

**Model answer.** HaqVaani doesn't replace the RBI Ombudsman; it prepares the citizen for it.
Under RB-IOS 2026, the Ombudsman rejects a complaint at initial scrutiny unless the complainant
has **first** lodged a formal grievance with the Regulated Entity and either waited 30 days or
received an unsatisfactory reply. HaqVaani helps with that first-mile complaint: it generates the
bank complaint draft, tracks the 30-day window, and—if eligible—produces an RB-IOS 2026 CMS
complaint draft ready to file at `https://cms.rbi.org.in` or toll-free 14448.

---

## Q12. Does HaqVaani guarantee a refund?

**Model answer.** No. HaqVaani prepares and tracks the complaint; it cannot force a bank to refund
money. We clearly state this in the UI: "HaqVaani helps you build your complaint and understand
your RBI rights; it cannot guarantee a refund." We show next steps, including RBI CMS escalation
after the required bank-response period, so the user knows their options.
