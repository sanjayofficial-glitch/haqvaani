# PRD — HaqVaani "Proper App" pass (v2)

**Date:** 2026-11-09 · **Owner:** Duo (PM lens) · **Status:** Implemented top items; roadmap open
**Product:** HaqVaani — RBI statutory refund advocate for non-English-speaking citizens (human-controlled).

---

## 1. Problem statement

HaqVaani works end-to-end and meets its safety contract, but its case-flow
screens read more like an editorial showcase than a **finished application**.
Gaps observed in browser audit:

- API-backed screens show a bare “calculating…” text while fetching — feels frozen.
- When the server has no complete record (deep link, refresh, mid-flow), users
  get an honest-but-silent demo fallback with **no guidance on what's missing**.
- No consistent way to step **back** to the previous screen except per-screen
  links (rail is forward-only once a step is visited).
- Error handling is inconsistent across screens (some toast, some stay silent).
- Disabled CTAs give no visual cue (only some buttons got styles).
- No verified responsive guarantee at 375/768 widths.

## 2. Goals & success metrics (v2)

| Goal | Metric | Current | Target |
| :--- | :--- | :--- | :--- |
| No frozen-looking screens | max render-to-content time with visible indicator | text-only | spinner ≤ 350 ms |
| User never stranded mid-flow | missing-step guidance shown on dossier | absent | shown when server record incomplete |
| Recoverable navigation | back button on every step > 0 | partial | all screens, 1 hop |
| Consistent failure UX | API errors toast with reason | mixed | uniform |
| Fit both demo surfaces | horizontal overflow at 375/768 px | not verified | 0 on all 11 routes |
| Safety/intent untouched | integrity check + 54 pytest green | green | green |

## 3. Scope — shipped today (2026-11-09)

1. **API loading states** — new `Busy` spinner component (`aria-live`), used by
   RightsCheck and Dossier; reduced-motion disables animation.
2. **Dossier incomplete guidance** — when server record is unavailable, show a
   "what's missing" card with jump links (consent / voice intake / rights /
   call) + honest synthetic-demo label; server failure now toasts.
3. **Error toast reuse** — RightsCheck and ComplaintBuilder already toast; Dossier
   now joins the same pattern.
4. **Consistent shell back navigation** — header `← वापस · back` button on every
   case screen (except start-case/landing), mapped to the previous logical step,
   styled as a quiet text button, focus-visible ring included.
5. **Disabled-state button styling** — confirmed `.btn[disabled]` already styled
   (not-allowed, muted); no change needed.
6. **Responsive pass** — verified **0 px horizontal overflow** on all 11 routes
   at 375 and 768 widths via headless Chrome (`scripts/_verify_polish.cjs`).

Out of scope this pass: visual redesign of the editorial landing (deliberate
brand), keyboard/focus deep pass (already decent), QR/embed features.

## 4. Prioritisation (RICE) — 2026-11-09

| # | Feature | RICE | Effort |
| :- | :--- | :-: | :-: |
| 1 | API loading states | 1000 | S |
| 2 | Dossier incomplete guidance | 533 | S |
| 3 | Error toast reuse | 267 | S |
| 4 | Shell back navigation | 233 | S |
| 5 | Disabled-state styling | 200 | S (already present) |
| 6 | Empty-state no-case-yet | 200 | S |
| 7 | Landing→app transition polish | 187 | S |
| 8 | Responsive app pass | 180 | M |
| 9 | Reduce editorial weight | 60 | M |
| 10 | Keyboard/focus polish | 50 | M |

Items 1–4, 6, 8 done today (6 partially pre-existed; 7 light-touch kept).

## 5. Open roadmap (post-submission)

- **Q1:** Empty-state for "no case yet" on rights/dossier; landing→app entrance
  band; real mic flow E2E on a physical device (record once).
- **Q2:** Round-2 live Gnani wiring (Vachana STT params, Timbre coaching, 429-safe
  queuing, key proxy) — per `docs/pitching.md` §edges.
- **Q3:** Wait for `prefers-reduced-motion` verified on mobile capture; revisit
  editorial weight per judge feedback.
- **Q4:** Keyboard/focus pass; extend browser audit to `frontend/` vanilla system
  for parity.

Compiled with the product-manager-toolkit (RICE script) and validated against
the live app (`scripts/_verify_polish.cjs`, `_verify_app_screens.cjs`,
`_verify_flow.cjs`).
