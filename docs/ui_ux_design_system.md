# docs/ui_ux_design_system.md — HaqVaani UI/UX Design System

> **Superseded visual direction:** this file previously specified Glassmorphism +
> Claymorphism + Neumorphism ("Bharat Glass") with an all-dark canvas and cyan
> `#00f2ff` as the brand primary. That direction is **replaced** by
> [`docs/experience_concept.md`](./experience_concept.md) — a two-canvas
> (black story / warm-white evidence), indigo-primary, semantic-colour system that
> matches the product thesis and passes WCAG 2.2 AA. This file now documents the
> shared interaction model, accessibility rules, and file map, and points to the
> concept as the authoritative visual spec.
>
> Rule: if the two documents disagree, `docs/experience_concept.md` wins.

---

## 1. Design Philosophy

| Principle | HaqVaani Interpretation |
| :--- | :--- |
| **Voice-First** | Citizens speak Hinglish; system responds in Hindi. UI supports, never replaces, voice. |
| **Human-in-Control** | Citizen calls the bank; HaqVaani assists. No autonomous dialing. |
| **Zero-Literacy Friendly** | Icons + audio + color > text. No scrolling menus, no typing, no English-only labels. |
| **Consent-First** | Plain-language consent screen before any voice processing. Timestamped. |
| **Compliance-Visible** | Badges for `SIMULATED DEMO`, `NO AUTONOMOUS DIALING`, `AI DISCLOSURE PLAYED`, `ZERO SECRETS LEAKED`. |
| **Responsive** | Single codebase for mobile (320px), tablet (768px), desktop (1024px+). |
| **Free Stack** | Vanilla HTML/CSS/JS. No frameworks. Works offline after first load. |

---

## 2. Visual Style

Authoritative spec: `docs/experience_concept.md` (§2 Colour, §3 Typography, §7 Motion).

Key rules carried forward:

- **Two canvases:** near-black **story canvas** (landing hero, transitions, resolution)
  and warm-white **evidence canvas** (`#fffdf8`) for forms, calculations, transcripts,
  drafts, and case records. Switch in full-bleed bands; no continuous page gradients.
- **Primary:** indigo `#494fdf` (evidence CTA, current-mode marker). On story canvas,
  CTAs are white pills with black labels.
- **Semantic colours only:** `live-cyan #00c2d9` (live signal — story canvas only),
  `verified-green #16845b`, `pending-orange #b45309` (AA-safe; `#ec7e00` only for
  large/decorative accents), `blocked-red #d93445`, `reasoning-violet #7c3aed`
  (Evon explanations), `hindi-pink #b83b62` (Hindi emphasis).
- **Typography:** Inter (display/interface), JetBrains Mono (technical readouts only),
  Noto Sans Devanagari (Hindi, line-height ≥1.7). Type scale in concept §3.
- **Motion:** evidence-transformation only; timing tokens and reduced-motion rules in
  concept §7. Never animate statutory numbers as if uncertain.
- **No glass/clay/neumorphism.** No `backdrop-filter` blur surfaces, no neumorphic
  depth cues, no cyan-gradient brand buttons.

---

## 3. Component Library

Implement per `docs/experience_concept.md` §8:

- `ConsentGate` — blocking screen; plain-language Hindi+English, checkbox, timestamp,
  approve button. No voice processing before approval.
- `SafetyStatus` — compact persistent status (consent, disclosure, secret filter,
  synthetic-demo). Expandable.
- `LiveTranscript` — text-first transcript with language label, partial/final
  distinction, pause control.
- `FactReviewCard` — editable extracted facts (amount, date, dispute type, bank, UTR
  placeholder, language, confidence).
- `StatutoryTimeline` — dates, days overdue, claim, penalty, eligibility + audit drawer.
- `SuggestionCard` — Heron-style: model label, rationale, editable script, explicit
  approval. Never auto-speaks / auto-sends.
- `AssistedCallHUD` — high-contrast call panel: state, live bank transcript, script,
  secret warning, stop control, docket verification.
- `DocketVerification` — exact case-insensitive substring match only; failure reason
  shown.
- `CaseDossier` — source facts, calculation, draft history, safety gates, export
  (PDF/JSON).

**Buttons** (action language, ≥48px tall):

- Story CTA: white pill, black label. Evidence CTA: black/indigo pill, white label.
- Approval: indigo, labelled e.g. `APPROVE SCRIPT`.
- Safety stop: outlined red, always visible during voice/call modes.
- Secondary: neutral outlined/soft.

---

## 4. Compliance Badges

| Badge | Colour |
| :--- | :--- |
| `SIMULATED DEMO` | cyan (`live-cyan`) on dark chip |
| `NO AUTONOMOUS DIALING` | `verified-green` |
| `AI DISCLOSURE PLAYED` | `reasoning-violet` |
| `ZERO SECRETS LEAKED` | `verified-green` |
| `SYNTHETIC DATA` | `pending-orange` (AA) |

Badges are always visible in demo mode; never removable via CSS alone.

---

## 5. Interaction Design

### Citizen Flow (Voice-First)

1. **Consent screen:** plain-language Hindi + English, timestamped.
2. **Idle:** large mic button with Hindi label "बोलें" (Speak).
3. **Listening:** ring pulses `live-cyan`, text "सुन रहा है…" (Listening…).
4. **Processing:** text "गणना कर रहा है…" (Calculating…).
5. **Rights Checker result:** verified-green check, result card in Hindi
   (₹3,200 + ₹600 जुर्माना) with `SHOW CALCULATION` drawer.
6. **Complaint Builder:** draft, WhatsApp text, evidence checklist — English/Hindi
   parallel tabs, review/edit/approve for use.
7. **Assisted Call:** user dials bank; HaqVaani shows script, captures docket
   (verbatim substring verified), summarizes after.
8. **Post-call:** Timbre hi-IN summary played; dossier saved.

### HUD Flow (Engineer/Judge)

- 4-quadrant grid (STT, Statutory, Assisted Call, Compliance).
- Live measured values only; compliance badges always visible; demo playback controls.

---

## 6. Typography

| Use Case | Font | Size | Weight |
| :--- | :--- | :--- | :--- |
| Headings (English) | Inter | 24–32px | 500–600 |
| Headings (Hindi) | Noto Sans Devanagari | 24–32px | 500–600 |
| Body (English) | Inter | 16px | 400 |
| Body (Hindi) | Noto Sans Devanagari | 18px | 400 |
| Numbers / UTR / IDs | JetBrains Mono | 18px | 400 |
| Labels / Captions | Inter | 12px uppercase | 600 |

Hindi gets line-height ≥1.7 and 2px larger minimum size for Devanagari readability.

---

## 7. Responsive Breakpoints

| Breakpoint | Width | Layout |
| :--- | :--- | :--- |
| Mobile | 320–767px | Single column, sticky current-state header, bottom action bar |
| Tablet | 768–1279px | Two-column where possible; stack call panels when needed |
| Desktop | 1280–1439px | Reduced type/gutters; same information order |
| Desktop XL | 1440px+ | Full story bands, two-column workspace, large timeline |

Mobile order: current state → bank transcript → say this → safety → action controls.

---

## 8. Accessibility Checklist (WCAG 2.2 AA)

- [ ] Contrast ratio ≥ 4.5:1 for normal text, 3:1 for large text (see concept §2
      for measured token pairs).
- [ ] Tap targets ≥ 48×48px (44px minimum).
- [ ] `aria-label` on all icon buttons.
- [ ] `lang="hi"` on Hindi content sections.
- [ ] Reduced-motion support (`prefers-reduced-motion`).
- [ ] Focus-visible indicators (2px high-contrast outline).
- [ ] Screen reader announcements for status changes (live regions).
- [ ] No color-only information (icons + text + color).
- [ ] Hindi/Devanagari font fallback chain.
- [ ] Live transcript has a visible text alternative; app usable with audio muted.

---

## 9. Files in This System

| File | Purpose |
| :--- | :--- |
| `docs/experience_concept.md` | **Authoritative** visual + experience spec (story, tokens, components, acceptance) |
| `docs/DESIGN-revolut.md` | Revolut fintech foundation analysis (reference) |
| `frontend/landing.html` | Landing page (story chapters 00–05) |
| `frontend/glass_ui.html` | Citizen app shell (4 modes + dossier) |
| `frontend/hud.html` | Telemetry HUD with compliance indicators |
| `docs/demo_storyboard.md` | 60-second demo visual/audio cues |

---

## 10. Implementation Notes

- Story canvas surfaces: `#000000` / `#16181a` / `#0a0a0a`.
  Evidence canvas: `#fffdf8`; surfaces `#f4f4f2` / `#ffffff`.
- `live-cyan` text/signals on story canvas only; never body text on light surfaces.
- `mute #5b626b` is evidence-canvas-only; story-canvas secondary text uses
  `on-story-mute` (rgba(255,255,255,0.72)).
- `stone #8d969e` is story-canvas metadata; evidence-canvas metadata uses
  `stone-evidence #5e6670`.
- Load `Inter`, `JetBrains Mono`, and `Noto Sans Devanagari` from Google Fonts
  (free) with `font-display: swap`.
- For any new semantic colour, verify both light and dark pairs against 4.5:1
  before committing.
