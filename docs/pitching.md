# Pitching HaqVaani — "why not just ChatGPT?"

One page for the Gnani evaluation. The argument: the visible surface uses an
LLM, but every *guarantee* is code. HaqVaani is not a chatbot that knows the
law; it is a certified, auditable, compliant pipeline.

## The wrapper objection and the answer

| Looks generic (LLM wrapper) | Actually defensible (code-enforced) |
| :--- | :--- |
| "Parses Hinglish audio" | Commodity — but the extraction is framed by a strict schema and verified by a human on Fact Review |
| "Drafts bilingual complaints" | Commodity — drafts are templates over *validated* facts; every outbound string passes the secret-redaction gate |
| "Explains the RBI rule" | Commodity — but the **numbers are never generated**: they come from `statutory.py` via the API |
| "Helps during a call" | The unique part — verbatim docket verification, live secret scrub, no autonomous dialing |

**The moat is the workflow:** a Tier-2 citizen does not know "RBI TAT rule /
₹100 per day" exists — so they could never prompt a general chatbot correctly.
HaqVaani *supplies the prompt*, then enforces the result in code.

## Neuro-symbolic architecture

- **Neuro (SLM/LLM, untrusted):** extracts the four facts from noisy speech
  (Prisma/Evon), classifies brush-offs, drafts sentences.
- **Symbolic (Python, trusted):** computes T+1/T+5 deadlines and ₹100/day
  compensation, redacts OTP/PIN/CVV/password, verifies the docket verbatim,
  records DPDP consent, logs the audit trail.

Because the LLM is treated as an **untrusted parser**, statutory, acoustic and
privacy guarantees are enforced in code — zero calculation hallucinations.

## Enterprise-aligned guardrails (BFSI)

- **DPDP Act 2023:** timestamped consent + AI-disclosure record per session,
  machine-gated before any voice work.
- **PII masking:** `FORBIDDEN_SECRET_RE` blocks OTP/PIN/MPIN/CVV/password
  structurally; a sliding-window redactor catches secrets split across VAD
  frames; the safety panel shows a live blocked-count.
- **TRAI / no autonomous dialing:** the citizen is always the caller; the app
  only listens and coaches.
- **Auditable outputs:** the dossier is one JSON with the full state machine
  (consent, disclosure, secrets-blocked, verbatim flag) — exportable and
  printable, with an RBI CMS/Ombudsman prefill companion.

## The four edges judges should probe (and our answers)

1. **Canonical docket matching** — bank IVRs read codes slowly; ITN output is
   normalized before the verbatim substring check (server-side verifier).
2. **Sliding-window redaction** — callers pause mid-OTP across VAD frames; the
   regex runs over a rolling 10-second buffer.
3. **Partial-stream coaching** — brush-off classification triggers on Prisma
   200ms partials so Timbre whisper keeps <200ms TTFA.
4. **Explicit circular citation** — the ledger is anchored to
   `DPSS.CO.PD.No.629/02.01.014/2019-20`, with T+1 P2P split from T+5
   merchant/ATM/PoS.

## Honesty guardrails

- Claims like "docket under one second" or "barge-in handling" are
  **aspirational** — they are not put into materials until measured.
- All demo data is synthetic and labelled ("Simulated IVR / synthetic demo").
- The frontend never computes statutory numbers; it displays the API's.
