---
version: 3.0
name: HaqVaani Story · Swiss Editorial
description: A one-line story told in SVG and motion — your money leaves, the clock runs, your voice builds the proof. Two light canvases, one hairline rail, semantic colour kept strictly for legal meaning. v3.0 Swiss Editorial: opacity hierarchy, oversized type, sharp corners, flat surfaces.
---

# HaqVaani Story — design system

> Source of truth for the public frontend (`frontend/`). Written 2026-11-06.
> Colours/type/motion tokens live in `frontend/css/tokens.css`; shared UI in
> `frontend/css/app.css`; the rail + step bar in `frontend/js/rail.js`; routing and
> demo/live helpers in `frontend/js/router.js`.

## Palette

```yaml
story-black:      "#ffffff"    # story canvas — bright, high-contrast
story-surface:    "#f4f4f1"
evidence-canvas:  "#fafaf8"    # evidence canvas — one step toned
soft-surface:     "#eff0ec"
ink:              "#0b0b0c"
line:             "#d9dad4"
primary:          "#0b0b0c"   # black — the one action colour (CTAs, current step)
live-cyan:        "#006fb8"   # live signal, story canvas only
verified-green:   "#0e7a3c"   # leaf
pending-orange:   "#b45309"
blocked-red:      "#d4382e"
reasoning-violet: "#5a2e8f"   # AI explanations only
hindi-pink:       "#b8375f"   # Hindi emphasis only
```

## 1. What was wrong with the Stitch UI

| Problem | Evidence in the three screens | Fix |
|---|---|---|
| Everything shouts | Pulsing dots, ping animations, glowing waveforms, 6–8 badges per screen | One motion idea, one live signal per screen |
| Fake telemetry | "18ms latency", "94.2% accuracy", "SHA-256 purge countdown", "Ed25519" | Show only values the product really measures. Cut the rest. |
| Three visual languages | Indigo SaaS cards, a dark cyber HUD, a receipt skeuomorph | Two canvases (story black, evidence paper), one system |
| Unreadable for the target citizen | ALL-CAPS mono labels everywhere, English jargon ("Statutory Semantic Classification") | Sentence case, plain words, Hindi first-class |
| No story | Dashboard first, meaning later | Narrative spine below |
| Dead prototype | `alert()` navigation | Real routing in the next step |
| Legal risk | A "quote" of an RBI clause that is paraphrase; "600% TAT EXCEEDED" | Cite the circular by name and link it. Quote only verified text. |

## 2. Narrative spine

The whole product is one sentence: **your money left, the law has a clock, your voice builds the proof.**

| Beat | Screen | What the citizen feels | Visual idea |
|---|---|---|---|
| Hook | Landing hero | "That's me." | A coin travels along a payment line and stops at a break |
| 1 Speak | Voice intake, fact review | "It understood me." | Speech waveform condenses into four fact tiles |
| 2 Check | Rights checker | "The law is on my side." | Overdue days stamp into a ledger, ₹100 each |
| 3 Prepare | Complaint builder | "I'm in control." | Draft writes itself, every word editable, explicit approve |
| 4 Call | Assisted call | "I'm not alone on the call." | You — Bank line; HaqVaani whispers to you, never dials |
| 5 Prove | Docket, dossier | "I have proof." | Docket numbers match, stamp draws itself |

## 3. The one signature device: the rail

A thin vertical line runs down the left edge of every long page. A coin rides it as you scroll. The line takes the colour of the current beat:
cyan (listening) → red (breach) → indigo (preparing) → cyan (on the call) → green (proven).

This is the single memorable element. Everything else stays quiet. In the app shell, the same rail becomes the 5-step progress bar (Speak, Check, Prepare, Call, Prove), so the landing page and the product feel like one object.

## 4. Canvases

- **Story canvas** (`#ffffff`): landing, transitions, call HUD, resolution. Live-cyan signals live here only.
- **Evidence canvas** (`#fafaf8`): forms, calculations, drafts, records. Black action colour, semantic colours.
- Switch canvases in full-bleed bands. No gradients across a page. No glass, blur, neumorphism, or shadows — hierarchy is hairline, weight, and space.

## 5. What we borrowed from Heron (and what we didn't)

Borrowed: hairline rules, generous empty space, mono for data only, numbered sequences where the content really is a sequence, flat surfaces, "label on evidence" card feel.
Not borrowed: a single orange accent for everything (a safety product needs red/green/orange to mean different things), white-only canvas (the story needs black), 75px square buttons (48px pills are easier on mobile thumbs).

## 6. SVG illustration language

- Line art, 2–3px strokes, no fills except the coin, stamp and alerts.
- One metaphor per beat (rail, waveform, ledger, whisper line, stamp). No stock icons.
- All SVG inline, `viewBox` set, `role="img"` with a plain-language `aria-label`.
- Colour = meaning: cyan live, red broken or overdue, green verified, indigo your action.
- Shapes: coin (circle with ₹), node (open circle), rail (line), stamp (circle with check).

## 7. Motion system

Motion shows a change of state. It never decorates.

| Token | Use | Duration |
|---|---|---|
| `coin-travel` | Hero coin along the line, stops at break | 6s loop (SMIL `animateMotion`) |
| `rail-scroll` | Rail fill and coin follow scroll | linked to scroll, 600ms colour change |
| `facts-condense` | Facts slide in after speech, staggered 150ms | 600ms |
| `ledger-stamp` | Overdue rows appear one by one | 400ms each |
| `whisper-flow` | Dashed line flows from HaqVaani to you | 2s loop |
| `stamp-draw` | Circle then check stroke-draws | 1s |

Rules: no animated counting of statutory numbers (they are facts, not estimates). No entrance animation on every section. `prefers-reduced-motion` pauses SMIL, removes transitions, shows final states. Looping motion (hero coin, whisper flow) pauses off-screen via IntersectionObserver. All easing is one classic `cubic-bezier(.25,.1,.25,1)`; interaction feedback ≤200ms.

## 8. Typography

Inter for interface and display — grotesque, precise: light weights (300/400) for headings, tight tracking (−0.04em display, −0.03em H2), body never beyond 60ch. Noto Sans Devanagari for Hindi at 19px and line-height 1.7. JetBrains Mono only for amounts, UTR and docket numbers. Sentence case everywhere (Swiss uppercase captions are deliberately not used — citizen readability wins). Labels say what the thing is ("Amount", "Bank"). v3.0 Swiss Editorial: zero border-radius, 1px hairline rules, no shadows, generous section padding (96/80px), 44px+ touch targets.

## 9. Screen map (11 screens) and key components

| # | Screen | Canvas | Primary component | Motion |
|---|---|---|---|---|
| 0 | Landing | Story → evidence | Rail, hero coin | Coin, rail |
| 1 | Start case | Evidence | Four situation cards (UPI failed, ATM, fraud, not sure) | Selected card outlines |
| 2 | Consent | Evidence | ConsentGate: Hindi + English, checkbox, timestamp | None |
| 3 | Voice intake | Story | Big mic, live transcript, pause, stop | Waveform |
| 4 | Fact review | Evidence | FactReviewCard, every fact editable | Facts condense |
| 5 | Rights check | Evidence | StatutoryTimeline + ledger + "Show calculation" | Ledger stamp |
| 6 | Complaint builder | Evidence | Editable draft, EN/हिन्दी tabs, evidence checklist | Approve confirm |
| 7 | Call prep | Story | "Say this" script, what never to share | None |
| 8 | Assisted call | Story | AssistedCallHUD, always-visible stop | Whisper flow |
| 9 | Docket capture | Evidence | Exact substring match, failure reason | Match highlight |
| 10 | Post-call summary | Evidence | Hindi audio summary + next step | None |
| 11 | Dossier | Evidence | CaseDossier, PDF/JSON export | Stamp draw |

Persistent on all screens: rail/step bar, language toggle, stop control during voice and call, one short safety line ("Never share OTP, PIN or CVV"). Show the longer safety status in an expandable panel, not as 6 badges.

## 10. Accessibility and safety (non-negotiable)

- WCAG 2.2 AA: 4.5:1 text, 48px tap targets, visible focus, `lang="hi"` on Hindi.
- Works with audio muted: live transcript is always visible text.
- No colour-only meaning: icon + word + colour.
- Consent before any voice capture. No autonomous dialing. Human approves every script.
- Demo honesty: a "Synthetic demo" line stays visible in demo mode.

## 11. Build plan

```
frontend/
  landing.html        ← provided (story landing)
  css/tokens.css      ← copy the :root block from landing.html
  css/app.css         ← cards, forms, buttons
  js/rail.js          ← rail + section tone logic from landing.html
  js/router.js        ← hash router, replaces alert() navigation
  screens/*.html      ← one file per screen above
```

Build order: 1) tokens + rail + step bar, 2) screens 3–5 (the core wow), 3) 6–9, 4) 1–2, 10–11.

## 12. Prompt to give Stitch / an AI coder for each screen

> Use DESIGN.md as the only visual spec. Screen: [name]. Canvas: [story/evidence]. Include the left rail with the current step highlighted. Use sentence-case labels, Hindi alongside English, one inline SVG illustration for this beat ([metaphor]), and exactly one motion from the motion table. No gradients, glows, pulsing dots, fake metrics or more than one badge. Buttons are 48px pills. Every icon button has an aria-label. Navigation uses real links, not alert().
