# docs/legal_matrix.md — RBI Statutory Matrix + TRAI/DPDP Compliance (Zero Hallucinated Law)

> Exact statutory numbers, circular references, TRAI telecom rules, and DPDP consent requirements
> that must never be hallucinated. Every number here is hardcoded in `haqvaani/statutory.py`
> (pure Python). An LLM may format or explain but must never compute or invent them.

---

## 1. Failed UPI P2P / IMPS Transfer — `RBI/2019-20/67`

| Field | Value |
| :--- | :--- |
| Circular | RBI/2019-20/67 (DPSS.CO.PD No.629/02.01.014/2019-20) |
| Date | 20 September 2019 |
| Trigger | Sender's account debited; beneficiary not credited |
| Statutory TAT | **T + 1 calendar day** (`T` = calendar date of transaction) |
| Compensation | **₹100 per day** for every day of delay beyond `T + 1` |
| Payment basis | **Suo motu** (automatic; no separate claim required) |

### Formula (pure Python)
```python
tat_date = txn_date + timedelta(days=1)                 # T + 1
days_overdue = max(0, (today - tat_date).days)          # days beyond T+1
penalty_inr = days_overdue * 100                        # ₹100/day
total_claim_inr = amount_inr + penalty_inr
```

### Worked example
- Transaction date `T = 18 Oct 2026`, amount ₹3,200, today `25 Oct 2026`.
- TAT date = 19 Oct 2026. Days overdue = 6 (20, 21, 22, 23, 24, 25 Oct).
- Penalty = 6 × ₹100 = ₹600. Total claim = ₹3,200 + ₹600 = ₹3,800.

---

## 2. Failed UPI Merchant (P2M) / ATM Cash-Not-Dispensed / PoS Card Debit — `RBI/2019-20/67`

| Field | Value |
| :--- | :--- |
| Circular | RBI/2019-20/67 (DPSS.CO.PD No.629/02.01.014/2019-20) |
| Date | 20 September 2019 |
| Trigger | Account debited; merchant confirmation not received, or ATM cash not dispensed |
| Statutory TAT | **T + 5 calendar days** |
| Compensation | **₹100 per day** beyond `T + 5` |

### Formula
```python
tat_date = txn_date + timedelta(days=5)                 # T + 5
days_overdue = max(0, (today - tat_date).days)
penalty_inr = days_overdue * 100
total_claim_inr = amount_inr + penalty_inr
```

---

## 3. Unauthorised Electronic Banking Transaction — `DBR.No.Leg.BC.78/09.07.005/2017-18`

| Field | Value |
| :--- | :--- |
| Circular | DBR.No.Leg.BC.78/09.07.005/2017-18 |
| Trigger | Third-party fraud / unauthorised debit |
| Reporting window | Within **3 working days** |
| Statutory protection | **Zero Customer Liability** |
| Bank duty | Shadow-credit disputed amount within **10 working days** |

---

## 4. Reserve Bank – Integrated Ombudsman Scheme, 2026 — `RB-IOS 2026`

| Field | Value |
| :--- | :--- |
| Notified | 16 January 2026 |
| In force | 1 July 2026 |
| Portal | https://cms.rbi.org.in |
| Toll-free | 14448 |
| Scope | Commercial Banks, RRBs, Co-op Banks, NBFCs, Non-bank PPIs, Credit Information Companies (CICs) |

### Clause 3 — Authorised Representation
A complainant may use an **authorised representative other than an advocate**. HaqVaani positions
itself as an AI-assisted support tool for the citizen, not as an autonomous representative making
calls on the user's behalf.

### Award ceilings
- Dispute principal: **no cap**.
- Consequential financial loss: up to **₹30 lakh** (up from ₹20 L in 2021).
- Time lost, expenses, harassment/mental anguish: up to **₹3 lakh** (up from ₹1 L).

### Filing clock
If the Regulated Entity rejects the complaint or fails to resolve within **30 days**, the
complainant has **90 days** to file.

---

## 5. TRAI 2026 — Telecom Commercial Communications Customer Preference Regulations

### 5.1 A2P (Application-to-Person) Calling
- Entities using A2P calls must **pre-declare** the use and CLI (Caller Line Identity) details to
  their telecom service provider.
- Undeclared automated calls can be treated as **Unsolicited Commercial Communication (UCC)**.
- **HaqVaani v1 does not make A2P calls.** The user dials the bank; HaqVaani only assists.

### 5.2 Implications for HaqVaani
| Scenario | Permitted? | Condition |
| :--- | :--- | :--- |
| Autonomous outbound call to bank | **No** | Violates TRAI A2P framework without pre-declaration |
| User calls bank, HaqVaani listens | **Yes** | User is the caller; HaqVaani is an assistive tool |
| Simulated bank IVR in demo | **Yes** | No real telecom network involved |
| AI speaks on user's behalf | **Only with consent** | Must disclose: "This is an AI assistant assisting [user name]" |

---

## 6. DPDP Act 2023 — Data Protection

| Requirement | HaqVaani Implementation |
| :--- | :--- |
| Lawful basis | Consent (free, specific, informed, unconditional, unambiguous) |
| Consent screen | Plain-language consent before recording/processing voice |
| Purpose limitation | Collect only: UTR, amount, date, bank name, dispute type |
| Data minimization | No Aadhaar, PAN, OTP, PIN, MPIN, CVV, password ever collected |
| Right to deletion | User can delete their case record; data not sold |
| Storage | Local SQLite or in-memory; no raw audio sent to unnecessary third parties |
| Breach notification | Log all access; notify user if data is compromised |

---

## 7. Safety Guards (mapped to laws)

| Guard | Legal Basis | Implementation |
| :--- | :--- | :--- |
| `FORBIDDEN_SECRET_RE` | DPDP Act (data minimization) | Blocks TTS/text with OTP/PIN/MPIN/CVV/password |
| Consent gate (`citizen_consent_verified`) | DPDP Act 2023 | Timestamped consent before voice processing |
| Disclosure gate (`ai_disclosure_played`) | TRAI + fair practice | "This is an AI assistant assisting [user name]" |
| Verbatim substring docket check | RB-IOS 2026 Clause 3 | Docket ID must match call transcript exactly |
| No autonomous dialing | TRAI 2026 A2P rules | User dials bank; HaqVaani assists only |
| Synthetic data only | Challenge rules | No real PII in code, tests, or demo |

---

## 8. Synthetic Placeholders (demo/test only)

| Item | Synthetic Value |
| :--- | :--- |
| UTR | 629188340112 |
| Docket / SR ID | SR-DB-884120 |
| Phone | +91-90000-00000 |
| Citizen name | Ramesh (example) |
| Bank | DemoBank Support (synthetic) |

**Never** substitute real values. Real data is a challenge-rule violation and a DPDP Act breach.
