---
version: alpha
name: HaqVaani Design System
description: |
  A human-controlled RBI statutory refund advocate presented as a cinematic,
  evidence-led civic-tech product. The public experience uses Revolut's fintech
  clarity and full-bleed colour blocking, Heron AI's approve-before-action model,
  and MECHA's industrial storytelling language. The application itself remains
  calm, readable, deterministic, bilingual, and safe.

references:
  primary_product: https://www.awwwards.com/sites/heron-ai
  secondary_storytelling: https://www.awwwards.com/sites/mecha
  fintech_foundation: docs/DESIGN-revolut.md
  reference_notes:
    - Heron AI: AI observes and suggests; the human approves and remains in control.
    - MECHA: industrial, engineered, diagrammatic storytelling with purposeful motion.
    - Revolut: high-contrast fintech canvas, oversized typography, full-bleed bands,
      rounded product cards, and strong product-led presentation.

product:
  name: HaqVaani
  promise: Your voice in banking complaints.
  positioning: Human-controlled RBI statutory refund advocate.
  user_control: The citizen remains the caller, decision-maker, and approver.
  modes:
    - Voice Intake
    - Rights Checker
    - Complaint Builder
    - Assisted Call
  terminal_output:
    - HaqVaaniCaseRecord
    - Citizen Summary audio
    - Complaint Dossier PDF/JSON

principles:
  - Make a stressful banking problem feel understandable and actionable.
  - Show the system's current state at all times.
  - Let AI suggest; require the citizen to approve consequential actions.
  - Keep statutory math visibly deterministic and auditable.
  - Treat consent, disclosure, redaction, and synthetic-demo status as first-class UI.
  - Use motion to explain the case journey, never to obscure it.
  - Preserve a complete text alternative for every voice interaction.
---

# 1. Experience concept

## The story: From voice to proof

HaqVaani is presented as a complaint moving through a visible evidence chain:

```text
SPEAK  →  CHECK  →  PREPARE  →  CALL  →  PROVE
```

The user does not enter a generic chatbot. They enter a controlled case room where
an unclear banking incident becomes a structured, reviewable record.

The landing page tells this story cinematically. The product screens execute it
precisely. The transition between the two is deliberate:

```text
Storytelling shell
        ↓
Consent gate
        ↓
Four-mode case workspace
        ↓
Verified case dossier
```

## Reference blend

### Heron AI: approved assistance

Use Heron AI as the interaction model, not as a visual copy. HaqVaani can observe a
conversation, extract facts, and suggest the next sentence. It must not silently act
for the citizen. Every suggested script has an explicit approval or edit step.

### MECHA: engineered civic infrastructure

Use MECHA as the storytelling and motion reference. Translate industrial automation
into a visual language of routes, signals, evidence blocks, and system states. Avoid
robots, factory clichés, and decorative machinery.

### Revolut: fintech clarity

Use the attached Revolut analysis for the visual foundation: a high-contrast dark
story canvas, white catalogue bands, bold display type, pill CTAs, rounded cards,
full-bleed product mockups, and disciplined colour use.

## Core narrative line

```text
A problem happened.
The rule is clear.
Your next words are ready.
You stay in control.
The proof stays with you.
```

---

# 2. Visual direction

## Mood

HaqVaani should feel engineered but human: a trustworthy civic instrument rather than
a futuristic robot or a government portal. The design has the confidence of fintech,
the clarity of a case-management tool, and the visual rhythm of an industrial product
film.

## Canvas strategy

Use two visual modes:

1. **Story canvas** — near-black or black, used for the landing hero, mode transitions,
   product demonstrations, and final resolution.
2. **Evidence canvas** — warm white, used for forms, statutory calculations, transcript
   reading, complaint drafts, and case records.

Switch between canvases in full-bleed bands. Do not use a continuous gradient across
the entire page. The hard switch gives the story a clear chapter rhythm.

## Colour tokens

```yaml
colors:
  primary: '#494fdf'
  primary-bright: '#5a61ff'
  primary-deep: '#3a40c4'
  on-primary: '#ffffff'

  canvas-story: '#000000'
  surface-story: '#16181a'
  surface-story-deep: '#0a0a0a'
  canvas-evidence: '#fffdf8'
  surface-soft: '#f4f4f2'
  surface-card: '#ffffff'

  ink: '#191c1f'
  body: '#25282c'
  mute: '#5b626b'
  stone: '#8d969e'          # story canvas only (5.92:1 on surface-story)
  stone-evidence: '#5e6670' # evidence canvas metadata (5.72:1 on canvas-evidence)
  on-story: '#ffffff'
  on-story-mute: 'rgba(255,255,255,0.72)'

  hairline-light: '#e2e2e7'
  hairline-dark: 'rgba(255,255,255,0.14)'
  divider-soft: 'rgba(255,255,255,0.07)'

  live-cyan: '#00c2d9'      # text/signals on story canvas only (9.72:1 on black)
  verified-green: '#16845b'
  pending-orange: '#b45309' # darkened from #ec7e00 for WCAG AA (4.94:1 on evidence)
  blocked-red: '#d93445'
  hindi-pink: '#b83b62'
  reasoning-violet: '#7c3aed'
```

## Semantic colour rules

- `primary` identifies the current mode and primary user action.
- `live-cyan` identifies a newly arriving transcript partial or active audio signal.
  Use it on story/dark surfaces or as a non-text indicator; never as body text on
  a light canvas (2.16:1 on white fails AA).
- `verified-green` identifies a confirmed extraction, exact docket match, or completed
  safety gate.
- `pending-orange` identifies a decision or user action still required. Use the
  darkened `#b45309` for text; `#ec7e00` may remain for large/decorative accents.
- `blocked-red` identifies a safety block, forbidden secret, or failed verification.
- `reasoning-violet` identifies Evon v3.3's explanation or suggested response.
- `hindi-pink` is reserved for Hindi-language emphasis and bilingual switching.
- `mute` is for the evidence canvas only. On the story canvas, use `on-story-mute`
  (8.97:1 on surface-story) for secondary text; `stone` is for story-canvas metadata.

Never use a semantic colour as decoration. A coloured object must communicate state.

---

# 3. Typography

```yaml
typography:
  display:
    fontFamily: Inter Display, Inter, sans-serif
    weight: 500
    letterSpacing: '-0.02em'
    lineHeight: 1.0
  interface:
    fontFamily: Inter, sans-serif
    weight: 400
    lineHeight: 1.5
  interface-strong:
    fontFamily: Inter, sans-serif
    weight: 600
    lineHeight: 1.5
  technical:
    fontFamily: 'JetBrains Mono, ui-monospace, monospace'
    weight: 400
    lineHeight: 1.2
    letterSpacing: '0.02em'
  hindi:
    fontFamily: 'Noto Sans Devanagari, sans-serif'
    weight: 400
    lineHeight: 1.7
```

| Token | Size | Use |
|---|---:|---|
| display-hero | clamp(48px, 9vw, 128px) | One landing-page statement only |
| display-section | clamp(40px, 6vw, 80px) | Story chapters and mode openers |
| heading-lg | 32px | Case result and panel headings |
| heading-md | 24px | Cards, draft headings, call states |
| body-lg | 18px | Explanations and bilingual guidance |
| body-md | 16px | Default citizen-facing content |
| body-sm | 14px | Metadata and supporting detail |
| label | 12px | Uppercase technical labels |
| numeral-xl | 56px | Claim amount and final outcome |
| numeral-lg | 36px | TAT dates, days overdue, confidence |

Use monospace only for factual readouts, IDs, measurements, state labels, and
technical metadata. Never use monospace for long explanations, Hindi text, or legal
copy intended for reading.

---

# 4. Story architecture

## Landing page chapters

### Chapter 00 — The problem

Full-bleed story canvas.

```text
A BANKING PROBLEM
SHOULDN'T BECOME
YOUR BURDEN.

HaqVaani helps you understand the rule,
prepare the words, and keep the proof.
```

Visual: a single case signal enters from the edge of the screen and resolves into a
clean case card. No busy dashboard appears above the fold.

CTA: `START A CASE`
Secondary CTA: `SEE A SYNTHETIC DEMO`

Persistent disclosure: `Synthetic demo only. No real bank calls are made.`

### Chapter 01 — Speak

Show a waveform or signal line changing into a Hindi/Hinglish transcript. The visual
metaphor is voice becoming structured text.

```text
आप अपनी समस्या बताइए…

“मेरे खाते से पैसे कट गए,
लेकिन सामने वाले को नहीं मिले।”
```

The transition must end with extracted fields, not a decorative waveform.

### Chapter 02 — Check

Show the transaction date moving along a clear statutory timeline:

```text
TRANSACTION DATE  →  TAT DEADLINE  →  TODAY
18 OCT                 19 OCT            25 OCT
```

The compensation number appears only after the timeline is complete. The number is
presented as an auditable result, never as an AI prediction.

### Chapter 03 — Prepare

Show evidence fragments snapping into a complaint dossier: transaction facts,
calculation, draft, checklist, and escalation eligibility.

### Chapter 04 — Call

Show the citizen holding the phone while HaqVaani displays a suggested script. The
visual emphasis is human control:

```text
YOU CALL.
HAQVAANI LISTENS.
YOU DECIDE WHAT TO SAY.
```

### Chapter 05 — Prove

The final story beat is a calm, bright evidence canvas where the case record assembles
and the next action is obvious.

```text
CASE RECORD READY
Docket verified · Consent logged · Dossier prepared
```

---

# 5. Application shell

## Global header

Desktop:

```text
HAQVAANI        CASE HV-0248        ● SAFE MODE     हिन्दी   [ START / PAUSE ]
```

Mobile:

```text
HAQVAANI                         [⋯]
CASE HV-0248 · SAFE MODE
```

The header must always expose:

- case identifier, using synthetic placeholder data only;
- current safety state;
- language switcher;
- a pause/stop control during voice or assisted-call modes.

## Case progress rail

```text
01 VOICE INTAKE  →  02 RIGHTS CHECK  →  03 COMPLAINT  →  04 ASSISTED CALL  →  05 DOSSIER
```

States:

- completed: green check and readable completion label;
- current: indigo marker and short explanation;
- pending: muted marker;
- blocked: red marker with reason and recovery action.

The progress rail is not a game score. Do not gamify legal rights or compensation.

---

# 6. Mode designs

## Mode 1 — Voice Intake

### Layout

Two-column desktop layout, one-column mobile layout:

```text
┌──────────────────────────────┬──────────────────────────────┐
│ LIVE TRANSCRIPT              │ EXTRACTED CASE FACTS          │
│ hi-IN / Hinglish             │ Amount                        │
│                              │ Transaction date              │
│ Citizen words appear here.   │ Dispute type                  │
│                              │ Bank                          │
│                              │ Confidence                    │
└──────────────────────────────┴──────────────────────────────┘
```

### Required states

`CONSENT_REQUIRED` → `LISTENING` → `TRANSCRIBING` → `FACTS_REVIEW` → `CONFIRMED`

The user must be able to correct extracted facts before entering Rights Checker.

### Motion

- Consent panel fades into the microphone state only after approval.
- Audio ring uses a low-amplitude pulse tied to input level; it must not imply that
  the system is speaking on the user's behalf.
- Transcript partials enter with a 120–180ms opacity/translate transition.
- Confirmed facts settle into cards with a 200ms transform/opacity transition.
- Do not animate text word-by-word in a way that harms reading.

### Safety copy

```text
HaqVaani will process your voice only after you give consent.
Never share OTP, PIN, MPIN, CVV, or password.
```

## Mode 2 — Rights Checker

### Layout

The statutory calculation is the hero of this mode:

```text
RBI RULE
RBI/2019-20/67

TRANSACTION DATE       TAT DEADLINE       DAYS OVERDUE
18 OCT 2026             19 OCT 2026        6

POSSIBLE COMPENSATION
₹600

[ SHOW CALCULATION ]
```

The UI must show transaction date, TAT date, days overdue, claim amount, penalty,
and eligibility output. The calculation is produced by pure Python statutory logic;
Evon v3.3 does not calculate it.

### Motion

- Date markers draw left-to-right once.
- The TAT threshold receives a single indigo marker.
- Days overdue count-up is allowed only after the underlying dates are visible.
- Compensation reveals with a short scale-in, not a casino-like slot animation.
- The “show calculation” drawer opens vertically and preserves the original result.

## Mode 3 — Complaint Builder

### Layout

Use a document workbench rather than a chat screen:

```text
┌──────────────────────────────┬──────────────────────────────┐
│ COMPLAINT DRAFT              │ EVIDENCE CHECKLIST            │
│ To: Bank                     │ ✓ Transaction facts           │
│ Subject: ...                 │ ✓ UTR captured                │
│ Body copy                    │ ✓ Statutory result            │
│                              │ ○ Docket number pending       │
│ [COPY] [EDIT] [DOWNLOAD]     │ RBI CMS eligibility            │
└──────────────────────────────┴──────────────────────────────┘
```

Offer bank complaint, WhatsApp/email draft, evidence checklist, and RBI CMS 2026
draft when eligible. Display English and Hindi versions as parallel tabs, not as a
wall of duplicated text.

### Heron-inspired approval model

Every generated draft has:

```text
GENERATED BY EVON V3.3
[ REVIEW ] [ EDIT ] [ APPROVE FOR USE ]
```

Approval means the user accepts the displayed text for their own use. It does not
send anything automatically.

## Mode 4 — Assisted Call

### Layout

This screen must be calmer than the landing page. It is an operational HUD for a
person simultaneously handling a phone call.

```text
ASSISTED CALL                         SIMULATED IVR / SYNTHETIC DEMO

● LISTENING                           BANK TRANSCRIPT
                                      “Please wait seven to ten days.”

SAY THIS                              SAFETY
Under RBI/2019-20/67, the applicable  Consent verified · Disclosure played
timeline has passed. Please register  Secrets filter active
my complaint and provide the service
request number.                      DOCKET
                                      Waiting for exact SR ID
```

### State machine

```text
IDLE
  ↓ user taps Start Assisted Call
LISTENING
  ↓ bank menu or brush-off detected
SCRIPT_DISPLAY
  ↓ user confirms / reads script
DOCKET_CAPTURE
  ↓ exact case-insensitive transcript match
POST_CALL
  ↓ save dossier or start a new case
IDLE
```

### Motion

- `LISTENING`: one restrained live signal; no looping background spectacle.
- `SCRIPT_DISPLAY`: the suggested script slides in from the reasoning-violet rail.
- `DOCKET_CAPTURE`: the input field changes from pending orange to verified green only
  after exact substring verification.
- `POST_CALL`: transcript compresses into a case record while the Hindi summary card
  expands.
- When the user pauses or ends the call, all motion stops immediately.

### Required labels

```text
The user dials the bank.
HaqVaani does not make autonomous calls.
This is a simulated IVR / synthetic demo.
```

## Final state — Case Dossier

```text
CASE COMPLETE

Consent verified       YES
AI disclosure played   YES
Docket verified        YES
Secrets detected       NONE
Statutory result       AUDITABLE
Complaint dossier      READY
Hindi summary          READY
```

Provide PDF/JSON export and a visible list of the source facts used. Never present a
synthetic identifier as a real bank record.

---

# 7. Motion graphics system

## Motion principles

Motion should show transformation of evidence:

```text
voice → words → facts → rule → draft → call → proof
```

Do not use motion to make the product appear more intelligent than it is.

## Timing tokens

```yaml
motion:
  instant: 100ms
  fast: 180ms
  standard: 240ms
  deliberate: 420ms
  story: 720ms
  chapter: 1000ms
  ease-standard: cubic-bezier(.2,.8,.2,1)
  ease-enter: cubic-bezier(0,.7,.2,1)
  ease-exit: cubic-bezier(.4,0,1,1)
```

## Story transitions

### Signal → transcript

A thin cyan signal travels across the story canvas. It resolves into the first line
of transcript, then the signal disappears. The result, not the effect, remains.

### Transcript → extracted facts

The relevant phrase receives a short pink underline, then moves into a fact card.
The source phrase remains visible so extraction is traceable.

### Facts → statutory timeline

Fact cards align into a horizontal date path. The path does not move until the user
confirms the extracted transaction date.

### Timeline → complaint

The final entitlement value anchors the first sentence of the draft. The connection
is shown as a line, not as an unexplained number animation.

### Complaint → assisted call

The approved script becomes a readable call card. The screen explicitly changes from
`PREPARE` to `USER-CONTROLLED CALL`.

### Call → dossier

Transcript, docket, safety gates, and statutory result fold into a single case record.
The record is the end of the story.

## Reduced motion

When `prefers-reduced-motion: reduce` is active:

- replace chapter transitions with instant canvas changes;
- remove parallax, background loops, and waveform movement;
- retain state colour, labels, progress, and focus changes;
- keep transcript and calculation updates readable;
- never make motion the only way to understand a status.

---

# 8. Components

## `ConsentGate`

Warm evidence-canvas card with explicit purpose, data use, stop control, timestamp,
and a clear approve button. No voice processing before approval.

## `SafetyStatus`

Compact persistent status showing consent, AI disclosure, secret filter, and synthetic
demo status. Expandable for details.

## `LiveTranscript`

Readable transcript with language label, partial/final distinction, pause control,
and a text-first presentation.

## `FactReviewCard`

Shows extracted amount, date, dispute type, bank, UTR placeholder, language, and
confidence. Every field can be edited before confirmation.

## `StatutoryTimeline`

Shows transaction date, TAT date, current date, days overdue, claim amount, penalty,
and eligibility. It must include an audit detail drawer.

## `SuggestionCard`

Heron-style AI suggestion card with model label, rationale, editable script, and
explicit user approval. Never auto-speaks or auto-sends.

## `AssistedCallHUD`

High-contrast call panel with current state, live bank transcript, suggested script,
secret warning, stop control, and docket verification status.

## `DocketVerification`

Shows candidate SR ID, transcript match highlight, exact-match result, and failure
reason. Never accepts a docket from an unverified source.

## `CaseDossier`

Final record with source facts, deterministic calculation, draft history, transcript
metadata, safety gates, verification result, and export controls.

## Buttons

- Primary dark-surface CTA: white pill with black label.
- Primary evidence CTA: black or indigo pill with white label.
- Approval CTA: indigo, labelled with the user action: `APPROVE SCRIPT`.
- Safety stop: outlined red, always visible during voice/call modes.
- Secondary: neutral outlined or soft-surface button.

Buttons must use action language. Avoid `Continue` when the actual action is `Confirm
facts`, `Start assisted call`, or `Save dossier`.

---

# 9. Layout and responsive rules

```yaml
layout:
  max-content: 1200px
  reading-column: 720px
  desktop-gutter: 32px
  mobile-gutter: 20px
  section-story: 120px
  section-evidence: 88px
  card-padding: 24px
  card-padding-large: 32px
  base-unit: 4px
```

Breakpoints:

| Name | Width | Behaviour |
|---|---:|---|
| Desktop XL | ≥1440px | Full story bands, two-column workspace, large timeline |
| Desktop | 1280–1439px | Reduced type and gutters; same information order |
| Tablet | 768–1279px | Two-column where possible; stack call panels when needed |
| Mobile | ≤767px | Single-column, sticky current-state header, bottom action bar |

On mobile, never place transcript, script, and safety status in competing horizontal
columns. Order is:

```text
current state → bank transcript → say this → safety → action controls
```

All primary controls are at least 48px tall. Voice and call controls are reachable
with one hand. The screen remains usable when audio is muted.

---

# 10. Accessibility, privacy, and legal UI rules

- Consent is a blocking screen before any voice processing.
- AI disclosure must be visibly recorded before a script is presented or the AI speaks.
- Never speak, store, or transmit OTP, PIN, MPIN, CVV, or password.
- Redaction blocks outbound text and TTS when a forbidden secret is detected.
- Do not display real phone numbers, bank accounts, Aadhaar, PAN, real UTRs, or real
  recordings. Use synthetic placeholders only.
- Every bank interaction is labelled `Simulated IVR / synthetic demo` in the demo.
- Never imply autonomous bank calling.
- Never show an LLM as the source of a statutory number. Show the statutory engine and
  source rule instead.
- Hindi copy uses Noto Sans Devanagari and line-height 1.7 or greater.
- Live transcript has a visible text alternative and does not depend on sound.
- Focus rings use a 2px high-contrast outline.
- Do not use colour alone for verified, pending, blocked, or current states.
- Respect reduced motion and preserve all state information without animation.
- All text colour pairs meet WCAG 2.2 AA (≥4.5:1). See §2 token comments for the
  measured values; the amber, stone-evidence, and story-canvas mute tokens were
  adjusted from the draft to comply.

---

# 11. Do and don't

## Do

- Use Heron AI's approval pattern for scripts and generated complaint drafts.
- Use MECHA's system diagrams, routes, and engineered transitions for storytelling.
- Use Revolut's high-contrast fintech composition and full-bleed chapter bands.
- Make the four modes visually distinct but structurally consistent.
- Keep real measurements in telemetry and label synthetic demo data.
- Show what happened, what the rule says, and what the citizen can do next.

## Don't

- Do not build a generic chatbot interface.
- Do not make the landing-page motion continue inside the live assisted-call HUD.
- Do not use 3D machinery, robot imagery, or gamified legal outcomes.
- Do not make compensation numbers pulse, spin, or look speculative.
- Do not let a suggested script appear to be automatically sent or spoken.
- Do not use a neon cyberpunk palette for a citizen banking-help product.
- Do not hide consent, disclosure, or secret-redaction status in a settings page.
- Do not claim a docket is valid unless it is an exact case-insensitive substring of the
  verbatim transcript.

---

# 12. Acceptance checklist

## Story and visual system

- [ ] Landing page tells the voice-to-proof story in five chapters.
- [ ] Dark story canvas and light evidence canvas are clearly separated.
- [ ] Typography is readable in English and Hindi.
- [ ] Motion communicates evidence transformation rather than AI spectacle.

## Architecture fit

- [ ] Voice Intake has consent, transcript, extraction, review, and confirmation states.
- [ ] Rights Checker exposes deterministic statutory inputs and outputs.
- [ ] Complaint Builder supports review, edit, approval, and export.
- [ ] Assisted Call mirrors IDLE, LISTENING, SCRIPT_DISPLAY, DOCKET_CAPTURE, and POST_CALL.
- [ ] Final Case Dossier contains the complete HaqVaaniCaseRecord output.

## Safety fit

- [ ] No autonomous calling exists in the UI or copy.
- [ ] Synthetic-demo disclosure is persistent where relevant.
- [ ] Secret redaction is visible and blocking.
- [ ] AI disclosure and citizen consent are timestamped.
- [ ] All data shown in demo is synthetic.

## Quality fit

- [ ] All critical actions work without audio.
- [ ] Reduced-motion mode preserves comprehension.
- [ ] Mobile layout keeps the current state and next action visible.
- [ ] No statutory value is animated as if it were uncertain.
- [ ] Every AI suggestion has a human approval step.
