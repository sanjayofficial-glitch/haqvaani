# docs/ui_ux_design_system.md — HaqVaani UI/UX Design System

> Comprehensive design language for HaqVaani (हक़-वाणी). Combines **Glassmorphism**, **Claymorphism**,
> and accessible voice-first design for low-literacy Bharat users. Human-controlled advocate model:
> no autonomous dialing, clear AI disclosure, consent-first, compliant with WCAG 2.2 AA and DPDP Act 2023.
>
> Research sources: Apple Liquid Glass (iOS 26), Microsoft Fluent Acrylic, WCAG 2.2, Indian
> government UX guidelines (uxdt.nic.in), Microsoft Research "UIs for Low-Literate Users", TRAI
> 2026 telecom rules, DPDP Act 2023.

---

## 1. Design Philosophy

| Principle | HaqVaani Interpretation |
| :--- | :--- |
| **Voice-First** | Citizens speak Hinglish; system responds in Hindi. UI supports, never replaces, voice. |
| **Human-in-Control** | Citizen calls the bank; HaqVaani assists. No autonomous dialing. |
| **Zero-Literacy Friendly** | Icons + audio + color > text. No scrolling menus, no typing, no English-only labels. |
| **Consent-First** | Plain-language consent screen before any voice processing. Timestamped. |
| **Modern but Practical** | Glassmorphism for containers; Claymorphism for primary actions; accessible contrast throughout. |
| **Compliance-Visible** | Badges for `SIMULATED DEMO`, `NO AUTONOMOUS DIALING`, `AI DISCLOSURE PLAYED`, `ZERO SECRETS LEAKED`. |
| **Responsive** | Single codebase for mobile (320px), tablet (768px), desktop (1024px+). |
| **Free Stack** | Vanilla HTML/CSS/JS. No frameworks. Works offline after first load. |

---

## 2. Visual Style: "Bharat Glass"

A hybrid design language:

- **Glassmorphism** (containers): Cards, modals, overlays — `backdrop-filter: blur()`,
  translucent backgrounds, subtle borders, over vivid gradients.
- **Claymorphism** (primary actions): Soft, inflated, rounded buttons — outer + inset shadows,
  `translateY` press feedback.
- **Neumorphism** (accents only): Depth cues on sliders/meters — never for primary actions.

> **Rule:** Glass for containers, Clay for actions, Neumorphism for feedback meters. Never
> neumorphic primary buttons (fails contrast).

---

## 3. Color Palette

```css
:root {
  /* Brand */
  --brand-primary: #00f2ff;      /* Cyan — Prisma / live data */
  --brand-secondary: #7c3aed;    /* Purple — Evon / script display */
  --brand-success: #00d97a;      /* Green — verified, safe */
  --brand-warning: #ffb020;      /* Amber — penalty, pending */
  --brand-error: #ff4d4d;        /* Red — blocked, brush-off */
  --brand-hindi: #ff85a2;        /* Pink — Hindi text highlight */

  /* Surfaces */
  --bg-deep: #050508;
  --bg-panel: #0f1118;
  --glass-bg: rgba(255, 255, 255, 0.06);
  --glass-bg-strong: rgba(255, 255, 255, 0.12);
  --glass-border: rgba(255, 255, 255, 0.16);
  --glass-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);

  /* Claymorphism */
  --clay-surface: #161925;
  --clay-shadow-out: 10px 10px 20px #0a0b12, -10px -10px 20px #1c1f2c;
  --clay-shadow-in: inset 6px 6px 12px #0a0b12, inset -6px -6px 12px #1c1f2c;
  --clay-pressed: inset 4px 4px 8px #0a0b12, inset -4px -4px 8px #1c1f2c;

  /* Compliance badges */
  --badge-sim: #00f2ff;          /* SIMULATED DEMO */
  --badge-compliance: #00d97a;   /* COMPLIANT */
  --badge-warning: #ffb020;      /* WARNING */

  /* Typography */
  --font-sans: 'Inter', 'Noto Sans', 'Segoe UI', system-ui, sans-serif;
  --font-hi: 'Noto Sans Devanagari', 'Mangal', 'Nirmala UI', 'Segoe UI', sans-serif;
  --font-mono: 'Courier Prime', 'DejaVu Sans Mono', monospace;
}
```

---

## 4. Component Library

### 4.1 Glass Card (Container)
```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  box-shadow: var(--glass-shadow);
}
```

### 4.2 Clay Button (Primary Action)
```css
.clay-btn {
  background: var(--clay-surface);
  border: none;
  border-radius: 16px;
  color: #fff;
  font-weight: 700;
  box-shadow: var(--clay-shadow-out);
  cursor: pointer;
  transition: all 0.15s;
}
.clay-btn:active {
  box-shadow: var(--clay-pressed);
  transform: translateY(2px);
}
.clay-btn.primary {
  background: linear-gradient(135deg, var(--brand-primary) 0%, #00c4e6 100%);
  color: #001a2e;
  box-shadow: 0 10px 25px rgba(0, 242, 255, 0.35);
}
```

### 4.3 Compliance Badge
Small pill-shaped badge with bold text:
- `SIMULATED DEMO` — cyan
- `NO AUTONOMOUS DIALING` — green
- `AI DISCLOSURE PLAYED` — purple
- `ZERO SECRETS LEAKED` — green
- `SYNTHETIC DATA` — amber

### 4.4 Consent Screen
Full-screen modal before first use:
- Plain-language Hindi + English text
- Checkbox: "मैं सहमत हूँ / I consent"
- Timestamp capture
- "Continue" clay button (min 44px tap target)

### 4.5 Statutory Meter
Gradient fill (red → amber → green) showing penalty accrual. Label: "₹100/दिन जुर्माना".

### 4.6 Assisted-Call Script Display
Real-time script card showing what the user should say to the bank:
- en-IN script (top)
- hi-IN translation (bottom)
- "Read aloud" indicator
- Docket capture field with verbatim verification

---

## 5. Typography

| Use Case | Font | Size | Weight |
| :--- | :--- | :--- | :--- |
| Headings (English) | Inter / Noto Sans | 24–32px | 700 |
| Headings (Hindi) | Noto Sans Devanagari | 24–32px | 700 |
| Body (English) | Inter / Noto Sans | 16px | 400 |
| Body (Hindi) | Noto Sans Devanagari | 18px | 400 |
| Numbers / UTR | Monospace | 18px | 700 |
| Labels / Captions | Inter | 12px | 600 |

> Hindi text gets 1.15× line height and 2px larger minimum size for Devanagari readability.

---

## 6. Responsive Breakpoints

| Breakpoint | Width | Layout |
| :--- | :--- | :--- |
| Mobile | 320–767px | Single column, stacked, full-width buttons |
| Tablet | 768–1023px | Two-column grid, side-by-side quadrants |
| Desktop | 1024–1439px | Multi-column, centered max-width |
| Large | 1440px+ | Max-width container, generous gutters |

---

## 7. Accessibility Checklist (WCAG 2.2 AA)

- [ ] Contrast ratio ≥ 4.5:1 for normal text, 3:1 for large text
- [ ] Tap targets ≥ 44×44px
- [ ] `aria-label` on all icon buttons
- [ ] `lang="hi"` on Hindi content sections
- [ ] Reduced-motion support (`prefers-reduced-motion`)
- [ ] Reduced-transparency fallback (solid backgrounds when `backdrop-filter` unavailable)
- [ ] Focus-visible indicators on all interactive elements
- [ ] Screen reader announcements for status changes (live regions)
- [ ] No color-only information (icons + text + color)
- [ ] Hindi/Devanagari font fallback chain

---

## 8. Interaction Design

### Citizen Flow (Voice-First)
1. **Consent screen:** Plain-language consent in Hindi + English.
2. **Idle:** Large mic button with Hindi label "बोलें" (Speak).
3. **Listening:** Button pulses cyan, waveform animates, text "सुन रहा है…" (Listening…).
4. **Processing:** Button dims, spinner, text "गणना कर रहा है…" (Calculating…).
5. **Rights Checker result:** Green checkmark, result card in Hindi (₹3,200 + ₹600 जुर्माना).
6. **Complaint Builder:** Draft complaint, WhatsApp text, evidence checklist.
7. **Assisted Call:** User dials bank; HaqVaani shows script, captures docket, summarizes after.
8. **Post-call:** Timbre hi-IN summary played; dossier saved.

### HUD Flow (Engineer/Judge)
- 4-quadrant grid (STT, Statutory, Assisted Call, Compliance).
- Real-time animated values.
- Compliance badges always visible.
- Demo playback controls (Run / Reset).

---

## 9. Files in This System

| File | Purpose |
| :--- | :--- |
| `frontend/glass_ui.html` | Production-ready responsive UI (Glass + Clay + Voice-First + Compliance) |
| `frontend/hud.html` | Telemetry HUD with compliance indicators |
| `docs/ui_ux_design_system.md` | This document |
| `docs/demo_storyboard.md` | 60-second demo visual/audio cues |

---

## 10. Implementation Notes

- **Glassmorphism:** `backdrop-filter: blur()` is GPU-intensive. Limit to 2–3 surfaces per view.
- **Claymorphism:** Use for primary CTAs only. Ensure 4.5:1 contrast between clay surface and text.
- **Fallback:** When `backdrop-filter` unsupported, use solid `--bg-panel` with border.
- **Hindi rendering:** Load `Noto Sans Devanagari` from Google Fonts (free) with `font-display: swap`.
- **Compliance badges:** Always visible in demo mode; never removable via CSS alone.
