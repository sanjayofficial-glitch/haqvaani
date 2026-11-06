# RULES.md — HaqVaani Non-Negotiable Constraints

> Every rule here is hard. Violating any rule can disqualify the challenge entry, breach the law,
> or leak a citizen's secrets. Read before writing code. Update only with duo agreement.

---

## 1. Exact RBI Legal Rules (zero hallucinated law)

All statutory numbers are hardcoded in `haqvaani/statutory.py` (pure Python) and cross-referenced
in `docs/legal_matrix.md`. An LLM may format or explain them but must never compute or invent
them.

### 1.1 Failed UPI P2P / IMPS Transfer — `RBI/2019-20/67`
- **Circular:** RBI/2019-20/67 (DPSS.CO.PD No.629/02.01.014/2019-20, dated 20 Sep 2019).
- **Trigger:** Sender's account debited, beneficiary not credited.
- **Statutory TAT:** **T + 1 calendar day** (`T` = calendar date of transaction).
- **Mandatory compensation:** **₹100 per day** for every day of delay beyond `T + 1`, payable
  **suo motu** (automatically, no separate claim required).

### 1.2 Failed UPI Merchant (P2M) / ATM Cash-Not-Dispensed / PoS Card Debit — `RBI/2019-20/67`
- **Trigger:** Account debited; merchant confirmation not received, or ATM cash not dispensed.
- **Statutory TAT:** **T + 5 calendar days**.
- **Mandatory compensation:** **₹100 per day** beyond `T + 5`.

### 1.3 Unauthorised Electronic Banking Transaction — `DBR.No.Leg.BC.78/09.07.005/2017-18`
- **Trigger:** Third-party fraud / unauthorised debit reported within **3 working days**.
- **Statutory protection:** **Zero Customer Liability**.
- **Bank duty:** Shadow-credit the disputed amount within **10 working days**.

### 1.4 Reserve Bank – Integrated Ombudsman Scheme, 2026 — `RB-IOS 2026`
- **Notified:** 16 Jan 2026; in force 1 Jul 2026.
- **Scope:** Commercial Banks, RRBs, Co-op Banks, NBFCs, Non-bank PPIs, and Credit Information Companies (CICs).
- **Clause 3 — Authorised Representation:** A complainant may use an **authorised representative other than an advocate**. HaqVaani invokes this as the citizen's AI-assisted support tool.
- **Award ceilings:** No cap on dispute principal; up to **₹30 lakh** consequential financial loss; up to **₹3 lakh** for time lost, expenses, and harassment/mental anguish.
- **Filing clock:** If the Regulated Entity rejects the complaint or fails to resolve within **30 days**, the complainant has **90 days** to file on `https://cms.rbi.org.in` or toll-free **14448**.

---

## 2. Telecom & Calling Compliance (TRAI 2026)

### 2.1 No Autonomous Dialing (Hackathon & v1)
- HaqVaani **must not** make real outbound calls to banks or any third party.
- All bank interactions in the hackathon demo are **simulated/synthetic**.
- In production v1, the **user dials the bank themselves**; HaqVaani only listens (via speaker/mic), shows what to say, and captures the docket number afterward.
- No A2P (Application-to-Person) automated calling without pre-declared CLI details to the telecom service provider per TRAI's 2026 framework.

### 2.2 AI Disclosure
- Any AI-assisted communication must state: **"This is an AI assistant assisting [user name]."**
- The AI must never impersonate the user or claim to be the account holder.
- Default to giving the user a script to read rather than speaking for them.

### 2.3 Consent
- `citizen_consent_verified == True` with timestamp is required before the AI processes voice data or speaks on the user's behalf.
- Consent must be free, specific, informed, unconditional, and unambiguous (DPDP Act 2023).
- Display a plain-language consent screen before recording or processing any voice.

---

## 3. Safety Guards (mandatory)

### 3.1 Consent gate
- `citizen_consent_verified == True` is required before any AI-assisted communication or voice processing.
- `ai_disclosure_played == True` is required before the AI provides a script or speaks on the user's behalf.
- `SafetyGuardBlock` hard-blocks any AI-assisted action without logged consent + disclosure.

### 3.2 Hard Secret Redaction Filter (`FORBIDDEN_SECRET_RE`)
- Blocks any outbound TTS/text if the words `OTP`, `PIN`, `MPIN`, `CVV`, or `password`
  (case-insensitive) appear.
- The agent never speaks, stores, or transmits secrets.
- If a bank agent requests live KYC/OTP verification, the user handles it directly; HaqVaani does not capture or relay it.

### 3.3 Verbatim Docket Verification
- Evon v3.3 verifies the captured docket/SR ID as an **exact case-insensitive substring** of the
  verbatim call transcript (from assisted-call listening) before accepting it.
- Verification result is recorded in `HaqVaaniCaseRecord.verbatim_verified`.

### 3.4 No real personal data
- No real phone numbers, bank accounts, Aadhaar, PAN, real UTRs of real users, or recorded calls
  — in code, tests, demo, or git history.
- Synthetic placeholders only (e.g. `UTR 629188340112`, `SR-DB-884120`, `+91-90000-00000`).

---

## 4. Challenge Rules (Great Indian AI Internship Challenge, Gnani AI)

- **Synthetic data only:** Use synthetic data for all demos, tests, and recordings.
- **No real phone numbers / real customer data / real recordings.**
- **No misleading demos:** Label all bank interactions as "Simulated IVR / synthetic demo." No real outbound bank calls.
- **Model naming:** Always refer to models as **Prisma v2.5**, **Evon v3.3**, **Timbre v2.5/v3.0**
  (Gnani's sovereign stack).
- **Deadline:** 10 November 2026, 11:59 PM IST. Submit LinkedIn/X post URLs in the official portal
  by Day 16 buffer (9 Nov).
- **Award target:** Primary = Jugaad Genius; adjacent = Real Deal, Noise Canceller, Mixed Vibes,
  Demo Day Drop, Crowd Favourite, Small Town Big Build / Duo.

---

## 5. Technical Constraints

### 5.1 Latency
- STT partials: ≤ 200 ms (Prisma v2.5 streaming).
- TTS first audio: ≤ 200 ms (Timbre v2.5/v3.0 SSE).
- Assisted-call script display: near-instant (< 100 ms) once transcript is available.
- Post-transaction summary: generated after call ends, not real-time critical.

### 5.2 Language switching
- Citizen leg: `hi-IN` (noisy street Hinglish / regional).
- Script display: `en-IN` (crisp banking English) + `hi-IN` translation.
- Seamless mid-workflow switch `en-IN → hi-IN` for the citizen summary.

### 5.3 Deterministic statutory math
- Pure Python only in `haqvaani/statutory.py`.
- No LLM computes deadlines, TAT, or ₹100/day penalties.
- Outputs must be auditable: transaction date, TAT date, days overdue, claim amount, penalty.

### 5.4 Acoustic (assisted call listening)
- 8 kHz noisy citizen intake; 16 kHz internal processing (FIR resample).
- Silero VAD with 220 ms hangover; 200 ms / 60 ms ring buffer.
- For assisted call mode: listen via device microphone/speaker while user holds phone to bank.

---

## 6. Free Constraint

- **Zero paid infrastructure.** Only:
  1. Gnani free 5,000 programme credits (STT + TTS + LLM).
  2. Free open-source tools (Python, FastAPI, NumPy, Silero VAD, Whisper, SQLite, Tailwind CDN).
  3. Free GPU on Kaggle / Google Colab (spot A100/L40S for Evon v3.3 vLLM/SGLang).
- No paid phone/SMS/Twilio APIs; the demo uses a simulated bank IVR + pre-recorded audio.
- If Gnani credits are exhausted before Day 16, fall back to local open-source STT/TTS/LLM and
  document the fallback — never exceed budget or ask the user for payment.
