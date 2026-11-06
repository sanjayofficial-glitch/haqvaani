# docs/demo_storyboard.md — Simulated 60-Second Demo Day Drop Storyboard

> Simulated 60-second demo video: 16:9 master + 9:16 cut. Legally airtight: synthetic data only
> (simulated bank IVR + pre-recorded audio), real Gnani API execution over real PCM, no real phone
> numbers or recordings, **no autonomous dialing**. All bank interactions labeled
> "SIMULATED DEMO / SYNTHETIC DATA."
>
> Flow: User speaks → Prisma transcribes → Rights Checker computes → Complaint Builder drafts →
> Assisted Call (simulated) → Docket verified → Timbre hi-IN summary.

---

## Production Notes

- **Format:** 16:9 master (1920×1080) + 9:16 vertical cut (1080×1920) for LinkedIn/X mobile.
- **HUD:** Persistent 4-quadrant dark Telemetry HUD overlaid on the whole video.
- **Audio:** Citizen speaks live into mic; bank IVR is simulated (pre-recorded synthetic audio);
  all through live Prisma WSS → Evon v3.3 → Timbre SSE.
- **Captions:** Burned captions in Hindi/Hinglish + English.
- **Badges:** `SIMULATED DEMO`, `SYNTHETIC DATA`, `NO AUTONOMOUS DIALING`,
  `BUILT ON GNANI PRISMA v2.5 · EVON v3.3 · TIMBRE`,
  `#GnaniAI #GreatIndianAIInternshipChallenge`.

---

## 4-Quadrant Dark HUD (persistent)

| Quadrant | Content |
| :--- | :--- |
| Top-left | STT comparison: Whisper vs Prisma v2.5 on UTR / Hindi numerals |
| Top-right | Statutory Card: TAT, days overdue, ₹100/day penalty meter |
| Bottom-left | Assisted-Call Script: real-time script + docket capture + verbatim verification |
| Bottom-right | Compliance/Safety: consent badge, disclosure badge, secret-redaction badge, Latency Bar |

---

## Storyboard (60 seconds)

| Window | Visual on 4-Quadrant HUD | Live Audio Heard by Viewer | Exact Telemetry Overlay |
| :--- | :--- | :--- | :--- |
| **0–4 s** | Cold open: Citizen presses mic in street noise. `SIMULATED DEMO` badge visible. | *Raw traffic horn + Hinglish:* "Bhaiya 18 Oct ko 3,200 UPI kiya tha, paisa kat gaya par pahuncha nahi—UTR 629188340112!" | `8 kHz NOISY INTAKE · SYNTHETIC DEMO` |
| **4–12 s** | Top-left panel: Whisper mangling UTR/amount vs Prisma v2.5 nailing every digit. Top-right Statutory Card lights up. | Intake finishes; Rights Checker locks claim. | `PRISMA @ 168ms · UTR 629188340112 ✓` · `RBI TAT T+1 BREACHED: +₹600 PENALTY OWED` |
| **12–23 s** | Complaint Builder quadrant: bank complaint draft, WhatsApp draft, evidence checklist appear. | Voiceover: "HaqVaani builds your complaint draft in Hindi and English." | `COMPLAINT DRAFT GENERATED · RBI/2019-20/67 CITED` |
| **23–36 s** | Assisted Call quadrant (simulated): User calls bank; script displays "Say: Under RBI/2019-20/67, T+1 passed Oct 19; ₹600 penalty accrued. Please log UDIR & share SR ID." | *Simulated bank rep:* "Ma'am/Sir wait 7–10 working days." *HaqVaani script (en-IN):* "Authorised AI assistant for Ramesh. Under RBI/2019-20/67, T+1 passed Oct 19; ₹600 penalty accrued. Please log UDIR & share SR ID." | `EVON v3.3 @ 302ms · BRUSH-OFF DETECTED` · `TIMBRE en-IN @ 184ms` · `AI DISCLOSURE PLAYED` |
| **36–47 s** | Simulated rep reads out `SR-DB-884120`; Pydantic substring check turns green; HaqVaani reads digits back. | *Rep:* "UDIR logged under SR-DB-884120 with ₹600 TAT claim." | `DOCKET: SR-DB-884120 ✓ SUBSTRING VERIFIED` · `NO SECRETS LEAKED` |
| **47–55 s** | Language switches `en-IN → hi-IN`; citizen receives warm Hindi voice summary. | *Timbre (hi-IN):* "Ramesh bhaiya, ₹3,200 aur ₹600 RBI jurmana darj ho gaya—docket SR-DB-884120!" | `ROLE SWITCH: en-IN → hi-IN · ZERO SECRETS LEAKED` |
| **55–60 s** | RB-IOS 2026 (cms.rbi.org.in) complaint draft slides in alongside Gnani Artha badges. `NO AUTONOMOUS DIALING` badge visible. | Clean chime + 1-line CTA. | `Built on Gnani Prisma v2.5 · Evon v3.3 · Timbre` · `#GnaniAI #GreatIndianAIInternshipChallenge` |

---

## Legal & Safety Cues (must appear)

- `SIMULATED DEMO` badge visible throughout.
- `SYNTHETIC DATA` badge visible throughout.
- `NO AUTONOMOUS DIALING` badge visible throughout.
- `ZERO SECRETS LEAKED` at role switch (no OTP/PIN/CVV spoken).
- `AI DISCLOSURE PLAYED` during assisted-call script (TRAI + fair practice).
- No real phone numbers, bank accounts, or recordings at any point.
- All bank interactions labeled "Simulated IVR / synthetic demo."
