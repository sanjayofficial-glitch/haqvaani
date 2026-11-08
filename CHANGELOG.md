# CHANGELOG.md — HaqVaani (हक़-वाणी)

> Initial version dated 25 October 2026 (Day 1 of the 16-day ship plan).
> Format: date → summary of changes → files touched.

---

## [2026-11-08] — Cinematic visual pass on `web/` (epic-design)

The `web/` landing and case screens moved from prose-heavy to visual-first:
motion, depth layers, and marquee tickers instead of paragraphs (the "too
much text" feedback). Same tokens, same safety/consent contract — integrity
check green.

### Changed
- `web/src/landing/Landing.jsx` — rewritten storytelling composition:
  * Hero (Act 01): giant ghost `₹3,200` depth numeral, 2-line Hindi display
    headline with masked line-reveal, single short sub-line (the long
    bilingual paragraph removed), CTA row, the TxnBreak payment line with a
    scrubbed coin that travels and stops at the break, and a mono marquee
    ticker (UTR · date · amount · KAT GAYA).
  * Act 02 RULE: ghost `T+1` layer, rule-meta chips (T / TAT / RBI
    circular), the deadline line drawing on scrub, kept ledger art.
  * Act 03 ₹100/DIN: ghost ₹ layer, kept orange ticker, one-line tag.
  * Act 04 WAPAS: ghost total layer, green stamp + green marquee
    (`REFUND CREDITED`), only the green in the product.
  * Journey: steps become large orange numerals with short one-line
    captions (English prose trimmed from long pairs).
  * CTA band: shortened copy; safety lines (OTP/PIN/CVV, no autonomous
    dialing, Simulated IVR / synthetic demo) intact.
- `web/src/styles/app.css` — cinematic system appended: `.ghost-num`
  (depth numerals, variant tints), `.hd-mask`/`.hd-line` (line reveals),
  `.marquee`/`.marquee-track`/`.marquee-item` (CSS loop, accent/success
  tones), `.rule-meta`/`.rule-chip`, `.steps-visual`, `.screen-ghost`
  (case-screen depth layer) + `.app-main { position: relative }`.
- `web/src/screens/StartCase.jsx`, `web/src/screens/RightsCheck.jsx` —
  ghost ₹ / ₹100 depth layers so the case screens share the visual system.
- All motion is GPU-safe and fully disabled under `prefers-reduced-motion`.

### Notes
- Image generation was attempted for editorial illustrations but the image
  account has no funds, so the pass is 100% vector/SVG/CSS — crisper and
  consistent with the hairline system anyway.
- `npm run build` clean; `python scripts/_ui_integrity_check.py` green.

---

## [2026-11-08] — Vite + React rebuild — "Heron × HaqVaani" (Day 15/16)

A second frontend committed beside the vanilla `frontend/` system: an
Awwwards-style, scroll-driven storytelling app in `web/` (Vite 5 + React 18,
gsap + ScrollTrigger, lenis, framer-motion). The old `frontend/` stays
untouched and remains the reference mirror; both share the same safety,
consent, and demo-honesty contract — now enforced by one integrity check.

### Added
- `web/` — the new app:
  * `vite.config.js` — dev *and* preview `/api` proxy → `http://localhost:8000`
    (the FastAPI has no CORS middleware and must not be modified).
  * `index.html` — only the three approved Google families (Archivo, Geist
    Mono, Noto Sans Devanagari); ₹-coin SVG favicon; no template UI.
  * `src/styles/tokens.css` — merged Heron × HaqVaani tokens: `--accent:#fa3600`
    (the ONLY signal colour), `--ink:#282828`, `--line:#e5e7eb`,
    `--canvas:#ffffff`, `--surface:#ffffff`, `--success:#1a7f4b` (ONLY
    "refund credited"); spacing 8/18/26/54/132, `--pad-section:75px`,
    `--gutter:38px`; buttons 0-radius/75px/min-222px; cards 8px; chips pill;
    `--speed:260ms` + `--ease`; `prefers-reduced-motion` kills all motion.
  * `src/styles/app.css` — tokens + shared components + per-screen CSS
    (`.mono`, `.ok/.warn/.bad`, `.facts-form`, `.split2`, `.src-note`,
    `.transcript-card`, `.hear-strip`, `.mic-big`, `.wavebar`, `.call-stage`,
    `.status-pill` + `pdot`, `.typed-box`, `.paste-ta`, `.segrow/.seg`,
    `.draft-area`, `.evlist/.evrow`, `.timeline` + `.breach`, `.ledger` +
    `[data-in]` CSS-staggered rows via `--i`, `.brush-badge`, `.you-bank`,
    `.draft-text`, `.no-print` print rule, landing acts/rail/nav).
  * `src/lib/` — hash router (`SCREENS` table), API client (session header,
    `VITE_API_BASE` support), sessionStorage state, demo fixtures + the exact
    `AI_DISCLOSURE` line, `SECRET_RE`, i18n `Pair`/`LangToggle`.
  * `src/hooks/` — useCapture (MediaRecorder), useMode, useToast, useSpeak
    (TTS + browser fallback), useReducedMotion, useWorksExample (API-first
    landing numbers with labelled demo fallback).
  * `src/components/` — AppShell (brand head, mode chip, 5-step rail, safety
    bar with truth panel), SVG line-art library (`TxnBreak`, `VoiceTiles`,
    `LedgerArt`, `DraftArt`, `WhisperArt`, `Stamp`, `DeadLineRule`), all
    aria-labeled, accent-only storytelling.
  * `src/landing/Landing.jsx` — the scroll story: Act 01 KAT GAYA (hairline
    break diagram, coin scrub at the break, UTR in mono), Act 02 RULE (deadline
    numeral + orange line draws via scrub), Act 03 ₹100/DIN (compensation
    ticker), Act 04 WAPAS (the ONLY `--success` moment), plus the 5-step
    journey and the CTA/safety band. Lenis smooth scroll + ScrollTrigger,
    both disabled under reduced motion. In-page anchors intercept and scroll
    (never collide with hash routes); `#/…` links go through the router.
  * `src/screens/` — all 11 screens re-implemented mirroring
    `frontend/screens/*.html` behaviour: start-case, consent (AI-disclosure
    quote + two checkboxes + `?next=` gate), voice-intake (mic/typed →
    `/api/intake`), fact-review (frozen-at-mount source, demo-diff card,
    gated submit), rights-check (live `/api/rights`, timeline T→TAT→breach,
    4-row ledger, calc drawer with circular ref), complaint-builder (live
    `/api/complaint` → en drafts + `hindi_drafts`, per-channel store, secret
    block warn, approval gate), call-prep (counter-script + whisper + never-
    share list + simulated-IVR tag), assisted-call (consent-gated, listening
    pill, `/api/assisted` upload + typed fallback, re-entry "पिछली पढ़ाई"),
    docket-capture (verbatim `<mark class="match">` JSX proof, fail reasons,
    manual recall, OTP effect), post-call (docket variants, brush-off badge,
    next steps incl. RBI CMS branch), dossier (live `/api/dossier` else
    labelled local assembly, `HV-` hex id, 11-row ledger, JSON export +
    print). Old quirks preserved: fact-review blur/submit validation, demo
    typing cadence, 120s max, docket split highlight, toast-once, `_note`
    local dossier marker.
- `web/README.md` — run instructions, dev/preview proxy, static-deploy
  `VITE_API_BASE` CORS caveat, integrity contract list, layout map.
- `scripts/_ui_integrity_check.py` — extended (same commit) with a `web/`
  section: exact token values in `tokens.css`; only the three approved Google
  families; no gradients / no glass blur / no string-assembled DOM; `SECRET_RE`
  source + exact AI-disclosure line + "Simulated IVR / synthetic demo" labels +
  no-autonomous-dialing line; consent-gate dispatch; all 11 routes in router +
  dispatch tables; `/api` proxy present. Both systems green (22 screens total).

### Changed
- `TODO.md` — status header (Day 15/16) + the web/ rebuild tasks checked done.
- `AGENTS.md` — current-phase paragraph mentions the `web/` rebuild and the
  extended integrity check.

### Notes
- The `web/` app is fully functional in **synthetic demo** mode without the
  API; in live mode it talks to the same `haqvaani/api.py` contract the
  `frontend/` system uses. Statutory numbers still come from Python/the
  labelled demo mirrors — never computed or invented in JS.
- No safety gate changed: consent still gates both voice screens, `SECRET_RE`
  blocks OTP/PIN/MPIN/CVV/password everywhere, no autonomous dialing anywhere,
  and every bank interaction is labelled "Simulated IVR / synthetic demo".

---

## [2026-11-08] — "Swiss Editorial" redesign v3.0 (Day 15/16)

### Changed
- `frontend/css/tokens.css` — v3.0 Swiss tokens: light high-contrast canvases
  (story `#ffffff`, evidence `#fafaf8`), black action colour `#0b0b0c`,
  opacity-only ink hierarchy (ink-2 .72 / ink-3 .52), semantic set kept strictly
  for legal meaning (cyan `#006fb8`, leaf `#0e7a3c`, scarlet `#d4382e`,
  violet `#5a2e8f`, pink `#b8375f`), hairline edges, zero radii, no shadows,
  display tracking −0.04em, classic ease `cubic-bezier(.25,.1,.25,1)`.
- `frontend/css/app.css` — Swiss weights (display/H2 400, H3/buttons 500),
  flat selected state for segmented controls (ink fill), `.btn-light` ink text
  on soft surface, hairline rail (1px).
- `frontend/landing.html` + all 11 screens — Inter 300/700 added to font links;
  SVG line-art literals moved to dark hairline ink on the light canvas;
  theme-color `#ffffff`.
- `docs/DESIGN.md` — bumped to v3.0 (palette, canvases, typography, motion).
  No safety/consent/demo-honesty behavior changed.

---


### Changed
- `frontend/css/tokens.css` — v2.0 "Warm Human" tokens: warm coal story canvas
  (`#151210`) + warm paper evidence canvas (`#fff9f0`), clay primary `#b5412b`
  (≥5.5:1 with white), leaf green `#1d7a4e`, scarlet `#c93a3f`, teal live
  `#00bfcf`, warm ink ladder, gentler display tracking (−0.02em), friendlier radii
  (card 16px / input 12px), one natural ease `cubic-bezier(.22,.65,.35,1)`.
- `frontend/css/app.css` — roomier rhythm (app-main 48/28, stack 28px, card padding
  28px, ledger rows 20/22, buttons 0 28px); safe-area bottom padding on `.safety`; lang/seg controls 44px.
- `frontend/landing.html` — theme-color `#151210`, section rhythm 96/80px, beat grid
  64px; SVG line-art literals warmed to the v2 palette.
- `frontend/screens/voice-intake.html`, `frontend/screens/call-prep.html` — waveform
  and IVR label literals warmed (story ink `#f6efe5`).
- `docs/DESIGN.md` — bumped to v2.0 (palette, canvases, typography, motion rule for
  off-screen pause). No safety/consent/demo-honesty behavior changed.

---


### Added
- `docs/DESIGN.md` — the design-system spec (frontend source of truth): two canvases
  (black story / warm-white evidence), the rail signature device, semantic colour rules,
  no gradients/glass/blur/uppercase/entrance-everywhere, Hindi-first with `.when-en`
  supplements, WCAG 2.2 AA, `prefers-reduced-motion` final states.
- `frontend/landing.html` — the story landing: the rail (scroll-linked coin + beat colours)
  tells the ₹3,200 story; every CTA is a real link.
- `frontend/css/tokens.css` + `frontend/css/app.css` — design tokens and shared app
  components (app head, 5-step bar, ledger, timeline, verbatim `<mark>` proof, stamp-draw,
  safety bar + expandable panel, `@media print` dossier styles).
- `frontend/js/rail.js` — one signature device: the landing scroll-rail becomes the
  5-step progress bar (बोलें/जाँच/तैयार करें/कॉल/सबूत) on every app screen via `#stepMount`.
- `frontend/js/router.js` — `HQ.*` namespace: sessionStorage case state, `api.{get,post,upload}`,
  mode detect + always-visible "Synthetic demo" chip, भाषा switch (hi first-class),
  consent gate, toast, TTS with browser fallback, brush-off labels, secret regex,
  hona-client-side verbatim substring verify (display aid; server is authoritative).
- `frontend/screens/` — the 11 screens, every one on `data-page="app"` with
  `data-step` + `data-canvas`, wired to `haqvaani/api.py` with honest demo fallbacks
  mirroring `statutory.py::_self_test` (₹3,200 · 2026-10-18 · UPI P2P · UTR
  629188340112 → TAT 2026-10-19, 6 days overdue, ₹600 penalty, ₹3,800; unauthorised
  variant → zero liability, shadow credit 2026-11-06; IVR docket `SR-DB-884120`):
  `start-case` (dispute picker, resets state) → `consent` (AI-disclosure quote + two
  required checkboxes + `?next=` gate) → `voice-intake` (mic/typed → `/api/intake`)
  → `fact-review` (editable facts → `/api/rights`) → `rights-check` (timeline,
  ledger rows, circular `<details>` citing RBI) → `complaint-builder` (`/api/complaint`,
  hi/en + bank/WhatsApp/email, per-channel edit store, approval gate) → `call-prep`
  (counter-script + whisper-flow + never-share list) → `assisted-call` (MediaRecorder,
  "you dial, HaqVaani listens", `/api/assisted` or typed fallback) → `docket-capture`
  (verbatim `<mark class="match">` proof, honest failure reasons, manual-recall input)
  → `post-call` (docket summary, brush-off badge, counter-script band, RBI CMS next
  steps) → `dossier` (`/api/dossier` or an on-device assembled copy labelled
  "synthetic demo"; facts ledger, consent record, JSON export + print CTA).
- DPDP consent gate: `voice-intake` and `assisted-call` redirect to
  `consent.html?next=…` until consent is recorded; the disclosure
  "This is an AI assistant assisting you." is stated before any voice capture.
- Client-side secret pre-check on builder/dossier-adjacent text — outbound strings
  may not contain OTP/PIN/MPIN/CVV/password (server `FORBIDDEN_SECRET_RE` remains
  authoritative; blockers counted in the safety panel).

### Changed
- `scripts/_ui_integrity_check.py` — rewritten for the new system: landing wires
  `css/tokens.css` + `js/rail.js` + `js/router.js`; landing scroll-rail has ≥5
  `data-tone` beats; all 11 screens meet the shell contract (`data-page="app"`,
  `data-step` 0–4, `data-canvas`, `#stepMount`, `#modeChip`, safety bar + `#safetyPanel`,
  `lang="hi-IN"`, `../css/*` + `../js/*` links); voice screens carry `HQ.guardConsent`;
  the end-to-end flow links are checked; banned old-system cosmetics
  (`alert(`, `text-transform`, gradients, `blur(`/glass, `reveal`/`stagger`/`data-count`
  hooks). Exits 1 on failure — green as of this entry.
- `TODO.md` — status header + Day 14 done items.
- `AGENTS.md` — current phase, frontend stack row, file pointers (`docs/DESIGN.md`).

### Notes
- Demo mode never recomputes statutory math in JS: screens only display stored
  Python/demo constants; if the citizen edits facts in demo mode, the screen labels
  the sample-case calculation as the shown value.
- No autonomous dialing anywhere: the assisted-call screen states "you dial,
  HaqVaani listens"; the safety panel always shows "0 — the citizen always dials".
- Legacy single-file UIs (`glass_ui.html`, `hud.html`) remain on disk as the
  archived Mission Control cut; the new system is `landing.html` + `screens/`.

---

## [2026-11-07] — Hallmark FIX-tier polish pass on the design system (Day 14/16)

Audit-driven polish at lightest depth (no redesign, no safety-gate changes). The
`sloplint` before-records (`.hallmark/`) tracked 224 FAIL on screens and 100 FAIL on
the landing; after this pass both measure 0 FAIL.

### Changed
- `frontend/css/tokens.css` — new token family: `--paper` / `--on-tone`;
  story ink ladder (`--story-ink…-ghost`), story edge ladder
  (`--story-edge-soft…strong`), `--story-tap`, `--cyan-wash`, `--blocked-ink`
  (red softened ≥5:1 on black), `--shadow-card`, `--ring-on-paper`; Hallmark
  stamp on line 1.
- `frontend/css/app.css` — `[hidden] { display:none !important }` pin; overflow-x
  clip on `html,body`; `:focus-visible` rings per canvas (story cyan / paper deep
  indigo, checkbox rings); `.hi { letter-spacing: normal }` fixes the Devanagari
  hero mash; display heads `text-wrap: balance`; hidden-at-rest reveal classes
  (`.ledger-row`, `.condense > *`) scoped under `html.js` so content is visible
  without JS; `.app-main` bottom padding clears the open safety panel; story-canvas
  form chrome + softened `.field-err`; story-canvas safety summary/kv ink; evidence
  bands inside a story body return paper cards/links/ink hierarchy; `.app-head`
  sticky uses `inset-block-start` (two-sticky check); collapsed `--primary` hover
  literals; `.seg` shadow token; `mark.match` tokenized; step labels `nowrap`.
- `frontend/landing.html` — hero reordered: CTA row sits right after the thesis,
  above the SVG; `min-height: min(78svh, 640px)`; nav wraps (`.wrap flex-wrap`);
  bilingual labels split into `.pair` spans (no middle-dot runs); law-band figure
  column `min-width:150px` moves to CSS with a ≤560px release; straight quotes →
  typographic; all colour literals (nav/footer/statline/byteline/figcaption) →
  tokens; arrows removed from beat "→" links; em-dashes → colons.
- `frontend/screens/*.html` (all 11) — `<meta name="description">` on every
  screen; titles swap em-dash for colon; step eyebrows before `<h1>` removed
  (the rail already numbers the step); CTA rows keep one middle-dot at most
  (English supplements move into `.btn .en` spans); every row's second label's
  dot dropped; compliant per-screen fixes: consent inline colour literals →
  tokens + `.en-sub`; fact-review error rows appear only after blur/submit
  (`touched` gating) + `.src-note` min-width responsive; complaint-builder restore
  stamp is a text button with a separate SVG icon (no `btn-icon`) + evidence
  heading `h3→h2`; docket-capture CTA demoted to `btn-quiet` + `hear-strip`
  tokens; post-call no-call state hides the bottom row via JS `hidden`; start-case
  cards `h3→h2` ×4 + edge/ink tokens; call-prep/assisted-call/voice-intake
  story-canvas rgba literals → tokens, assisted-call jamm rows (one dot per row),
  call-prep never-share list sentence-case, voice-intake canvas reads
  `--story-ink-hi` from the token; dossier/rights-check placeholders → ellipsis.

### Verified
- `scripts/_ui_integrity_check.py` — green (landing shell, 11 screens, consent
  gate, case flow).
- `sloplint.mjs --kept` against `.hallmark/` before-records — screens
  224 → 0 FAIL; landing static + render tiers 0 FAIL (focus-ring contrast, field
  contrast, run prose, no horizontal scroll at 320px: scrollWidth 320 == 320).
- Headless Chrome crop probes — hero CTA above SVG and single-line at 1440/375,
  laws card paper + primary link ink, consent focus ring (2px cyan, `:focus-visible`
  matched), assisted-call and docket CTA rows single-line at 375.

---

## [2026-11-06] — Gnani API contract verified — real STT/TTS clients (Day 13/14)

### Added
- `haqvaani/stt_client.py` — Prisma v2.5 WSS client implementing the documented
  contract: `x-api-key-id` header, config-as-headers (`language_code`, `model`,
  `format`, `x-sample-rate`, VAD telephony preset, optional bias), binary PCM
  1024-byte frames at real-time cadence, `{"type": "commit"}` close, JSON event
  handling (connected/processing/transcript/error), ~1 s tail silence so final
  utterance finalises. Returns `STTResult` (text, segments, latency, errors).
- `haqvaani/tts_client.py` — Timbre v2.5/v3.0 SSE client: `POST
  /api/v1/tts/sse` with `X-API-Key-ID`, payload `{text, voice, model, language,
  speed, audio_config}`, SSE start/chunk/complete/error parsing, base64 chunk
  reassembly → single WAV (container=raw + local `wave` assembly), catalog voice
  registry (Nalini/Kaveri/Poorvi defaults), `TTSResult`.
- `docs/gnani_api/` — mirrored Gnani docs: README + quick-start + authoritative
  api-reference-cheatsheet (headers, frames, messages, payloads, voices, errors,
  limits) + llms-index.
- `scripts/verify_gnani_roundtrip.py` — live TTS → STT roundtrip verifier
  (requires `GNANI_API_KEY`).
- `tests/test_voice_contract.py` — offline contract tests (headers, frames,
  voices, WAV assembly, payload shapes) — no network.

### Changed
- `haqvaani/voice_clients.py` — live paths rewired onto the documented contract:
  `X-API-Key-ID` auth (was `Authorization: Bearer`), TTS SSE endpoint
  `/api/v1/tts/sse` (was `/tts/v3/stream`), TTS payload/audio_config shape,
  STT WSS protocol delegation to `stt_client.py` (was single-blob send). All
  fallbacks (whisper / demo) preserved.
- `.env.example` — corrected endpoints (`GNANI_STT_WSS_URL`,
  `GNANI_STT_REST_URL`, `GNANI_TTS_SSE_URL`, `GNANI_TTS_REST_URL`), added
  STT VAD + ITN + bias knobs and TTS model/voice/audio-config vars.
- `Makefile` — `self-test` now runs `stt_client` / `tts_client` module checks
  and the roundtrip verifier (best-effort).

### Notes
- Live verification is pending the API key: run
  `python scripts/verify_gnani_roundtrip.py` once `GNANI_API_KEY` is set.
- The hosted Evon v3.3 endpoint remains unverified (portal URL TBD); its live
  path only had the auth header aligned.

---

## [2026-11-06] — Day 13: Experience concept adopted (design direction superseded)

### Added
- `docs/experience_concept.md` — authoritative experience + visual spec: two-canvas
  system (black story / warm-white evidence), indigo primary, semantic colour rules,
  type scale, motion system, component contracts, and acceptance checklist.
- `docs/DESIGN-revolut.md` — Revolut fintech foundation analysis (copied from
  `D:\Downloads\DESIGN-revolut.md`; reference fixed in concept frontmatter).

### Changed
- **Design direction superseded:** `docs/ui_ux_design_system.md` previously specified
  Glassmorphism/Claymorphism/Neumorphism with an all-dark canvas and cyan brand
  primary. Replaced by `docs/experience_concept.md` (story/evidence canvases, indigo
  `#494fdf`, semantic colours). `ui_ux_design_system.md` now documents the shared
  interaction model, badges, a11y, and file map, and defers visual authority to the
  concept.
- **WCAG AA contrast fixes** in concept palette: `pending-orange` darkened
  `#ec7e00 → #b45309` (4.94:1 on evidence); added `stone-evidence #5e6670` for
  light-canvas metadata (`stone #8d969e` now story-canvas-only); story-canvas
  secondary text uses `on-story-mute` (not `mute`, which failed at 2.89:1);
  `live-cyan` restricted to dark surfaces.
- `ARCHITECTURE.md` — fixed state-machine typo `DOTT_CAPTURE` → `DOCKET_CAPTURE`.
- `frontend/glass_ui.html` — restyled to evidence canvas (warm white `#fffdf8`, indigo
  primary, semantic colours); removed glass/backdrop-blur panels and clay gradients;
  JetBrains Mono replaces Courier Prime; legacy `--brand-*` variable aliases retained
  so the existing JS keeps working.
- `frontend/hud.html` — restyled to story canvas (near-black, indigo primary, live-cyan
  signals, luminance-adjusted semantic hues for dark surfaces; solid semantic chips).
- `frontend/landing.html` — restyled to story canvas; removed the decorative particle
  background loop (anti-spectacle), hero type scaled to `clamp(48px,9vw,128px)`,
  white-pill CTA, semantic step colours, chapter band dividers.
- `haqvaani/voice_clients.py` — new adapter module (Prisma STT / Evon LLM / Timbre
  TTS): env-gated live calls, deterministic synthetic fallback, regex-based intake
  extraction and IVR brush-off/docket parsing. `VoiceAPI` re-exported from
  `orchestrator.py` for back-compat.
- `haqvaani/api.py` — new FastAPI server: `GET /` serves the landing page; static
  mounts for the citizen app + HUD; `GET /api/health`, `POST /api/consent`,
  `POST /api/intake` (multipart), `POST /api/rights`, `POST /api/complaint`,
  `POST /api/assisted`, `POST /api/tts`, `GET /api/dossier`. Per-session in-memory
  state (`X-Haqvaani-Session` header); consent gate enforced before any voice work;
  forbidden-secret redaction on outbound TTS (403).
- `tests/test_api.py` — 6 API tests: health, consent-gated intake, full demo case
  (consent → intake → rights → complaint → assisted → dossier), TTS redaction,
  incomplete-dossier 404.
- `Makefile` — `run-api` target (`uvicorn haqvaani.api:app --reload --port 8000`).
- `requirements.txt` — added `httpx` (TestClient dependency).
- `haqvaani/complaint_builder.py` — added `build_hindi_drafts()`: deterministic
  Devanagari templates for bank/WhatsApp/email drafts + checklist (pure Python,
  redaction-gated, no LLM, no schema change).
- `haqvaani/api.py` — complaint response now includes `hindi_drafts`.
- `haqvaani/voice_clients.py` — live paths implemented as best-effort attempts
  (Prisma WSS via `websockets`, Evon HTTP via `httpx`, Timbre SSE streaming), all
  env-gated and degrading gracefully to demo on any failure; logging added.
- `frontend/glass_ui.html` — product-completeness per `docs/experience_concept.md`:
  * Rights Checker: "SHOW CALCULATION" audit drawer (rule, dates, days×₹100, total;
    "computed by statutory.py, not AI" note).
  * Complaint Builder: English/हिन्दी parallel toggle (uses server's Hindi drafts),
    review/edit (inline contenteditable) + "APPROVE FOR USE" Heron-style approval
    bar with explicit "nothing is sent automatically" copy.
  * Assisted Call: brush-off detection badge + suggested script pulled from the API
    response; persistent "SIMULATED IVR / SYNTHETIC DEMO" label.
  * New Case Dossier modal: full case record (ID, UTR/amount, TAT, penalty, docket,
    verbatim, consent/disclosure, secrets) with JSON download.
  * Hindi summary button now plays Timbre audio when live, otherwise falls back to
    browser speech synthesis (offline, no outbound data) — redaction-gated.
- `haqvaani/__main__.py` — `python -m haqvaani` starts the whole app.
- `run.bat` — Windows one-click launcher (venv + deps + server + opens browser).
- `frontend/glass_ui.html` — live/demo badge now reflects Gnani config from
  `/api/health`, not just server reachability.
- `README.md` — Quick Start updated to the real app flow (`make run-api`/
  `python -m haqvaani`/`run.bat`; health endpoint example).

---

## [2026-11-06] — Real STT/DSP pipeline — dsp_audio + evon_client + eval benchmark

### Added
- `haqvaani/dsp_audio.py` — real DSP pipeline (Engineer A, Modes 1 & 4): FIR lowpass +
  zero-insert resampler 8 kHz → 16 kHz, Silero VAD (220 ms hangover) with energy-based
  fallback, ring buffer (200 ms window / 60 ms hop), `preprocess_intake()` convenience.
- `haqvaani/evon_client.py` — Evon v3.3 LLM client (Engineer B): `parse_intake()`
  (CitizenIntake extraction) + `extract_negotiation()` (brush-off + docket candidate),
  live HTTP to GNANI_LLM_URL with deterministic regex fallback when offline.
- `haqvaani/ivr_scripts.py` — synthetic DemoBank IVR scripts + 7 assisted-call test
  cases covering all BrushOffType values and docket readout/verification.
- `eval/benchmark.py` — 30-clip STT WER harness: synthetic 8 kHz clips, faster-whisper
  transcription, optional Prisma live attempt, per-clip WER + p50/p95 latency,
  writes `eval/benchmark_report.json`.

### Changed
- `haqvaani/voice_clients.py` — refactored to thin facade over `stt_client` /
  `evon_client` / `tts_client`; `parse_intake`/`extract_negotiation` delegate to
  `evon_client`; `synthesize_tts` keeps `FORBIDDEN_SECRET_RE` gate.
- `requirements.txt` — added `soundfile`, `faster-whisper`.
- Tests: 54 passed (was 41), including `tests/test_voice_contract.py`.

### Notes
- Real audio path: upload WAV/webm → ffmpeg decode → DSP resample+VAD → Prisma WSS
  (live) or faster-whisper (offline). No canned demo transcription.
- All safety gates intact: consent required before voice work, `FORBIDDEN_SECRET_RE`
  blocks OTP/PIN/MPIN/CVV/password outbound, verbatim docket substring verification.

---

### Added
- Complete documentation foundation for the Great Indian AI Internship Challenge (Gnani AI).
- `AGENTS.md` — master agent instructions: thesis (human-controlled advocate), hard rules (no autonomous dialing, TRAI/DPDP), current phase, stack, working method, duo ownership treaty.
- `RULES.md` — non-negotiable constraints: RBI/2019-20/67 & RB-IOS 2026 legal rules, TRAI 2026 A2P calling compliance, safety guards (secret redaction, consent, substring verification), challenge rules (synthetic data, model naming, no real recordings), technical constraints, free constraint.
- `ARCHITECTURE.md` — 4-mode pipeline (Voice Intake → Rights Checker → Complaint Builder → Assisted Call), module ownership matrix, data flow, assisted-call state machine (IDLE / LISTENING / SCRIPT_DISPLAY / DOCKET_CAPTURE / POST_CALL), key design decisions.
- `ROADMAP.md` — 16-day ship plan (25 Oct → 10 Nov 2026) with day-by-day goals and milestone checkpoints.
- `TODO.md` — current prioritized atomic tasks starting Day 1.
- `README.md` — professional project overview, stack, quick start, license.
- `CONTRIBUTING.md` — guidelines for human duo members and AI coding agents.
- `docs/legal_matrix.md` — exact statutory numbers, circular references, TRAI/DPDP compliance formulas.
- `docs/latency_budget.md` — target latencies and measurement.
- `docs/demo_storyboard.md` — simulated 60-second Demo Day Drop storyboard (16:9 + 9:16).
- `docs/interview_qa.md` — Gnani interview Q&A with model answers (incl. legal compliance).
- `docs/evaluation.md` — success metrics (WER, latency, safety, compliance, demo quality).
- `docs/ui_ux_design_system.md` — design system (glass + clay + accessibility) for assisted-call UI.
- `frontend/glass_ui.html` — citizen-facing voice interface (updated for assisted-call mode).
- `frontend/hud.html` — telemetry HUD (updated with compliance indicators).
- `agent_prompts/SHARED_CONTEXT.md` — common context for all agents.
- `agent_prompts/ENGINEER_A_PROMPT.md` — Engineer A: Voice, DSP, telephony & latency.
- `agent_prompts/ENGINEER_B_PROMPT.md` — Engineer B: Statutory engine, Evon v3.3 & product UI.
- Repo folder structure: docs/, haqvaani/, demo/, eval/, frontend/, tests/, agent_prompts/.

### Changed
- **Pivot:** HaqVaani is now a **human-controlled refund advocate**, not an autonomous reverse-IVR bot. No autonomous bank dialing. All bank interactions are simulated/synthetic for the hackathon.
- Architecture changed from 7-stage autonomous pipeline to 4-mode human-controlled pipeline.
- Added TRAI 2026 A2P calling compliance and DPDP Act 2023 consent requirements throughout.

### Removed
- Autonomous outbound bank calling stage.
- Real outbound IVR orchestration.

### Notes
- All statutory figures hardcoded in pure Python; never LLM-computed.
- Synthetic data only; no real phone numbers, accounts, Aadhaar, PAN, or recordings.
- Completely free: Gnani 5,000 credits + open-source tools + free GPU (Kaggle/Colab).

---

## [2026-11-06] — Day 13: Core vertical slice part 1 — pure-Python engine

### Added
- `haqvaani/schemas.py` — Pydantic v2 treaty-border models: `CitizenIntake`, `StatutoryEntitlement`, `AgentNegotiationExtraction`, `ConsentRecord`, `HaqVaaniCaseRecord`.
- `haqvaani/statutory.py` — deterministic `compute_statutory_entitlement()`: RBI/2019-20/67 (T+1/T+5, ₹100/day), DBR 2017-18 zero liability, RB-IOS 2026 filing clocks.
- `haqvaani/safety.py` — `FORBIDDEN_SECRET_RE`, consent/disclosure gates, verbatim docket verify, `SafetyGuardBlock`.
- `tests/test_statutory.py`, `tests/test_safety.py`; `pyproject.toml`; `conftest.py`; `.gitignore`; git initialized.

### Notes
- Statutory math matches `docs/legal_matrix.md` §1 worked example exactly: T=18 Oct, ₹3,200, today=25 Oct → TAT 19 Oct, 6 days overdue, ₹600 penalty, ₹3,800 total.
- No API credentials required for this slice; Gnani access + STT/TTS clients are the next dependency.

---

## [2026-11-06] — Day 13: Core vertical slice part 2 — backend + PRD/FRD

### Added
- `docs/PRD.md` — product requirements for the submission scope (what we ship, what we cut).
- `docs/FRD.md` — functional spec: modes, API contract for the UI, acceptance criteria.
- `haqvaani/complaint_builder.py` — Mode 3 drafts: bank complaint (en+hi), WhatsApp, email, evidence checklist, RB-IOS 2026 CMS draft; every outbound string passes the secret-redaction gate.
- `haqvaani/rb_ios.py` — RB-IOS 2026 CMS draft + JSON dossier + summary line for Timbre.
- `haqvaani/orchestrator.py` — 4-mode switcher with `VoiceAPI` adapter (synthetic transcript until Prisma/Evon wired); `--self-test` runs a full offline case.
- `tests/test_complaint.py`, `tests/test_orchestrator.py` (36 tests total, all green).

### Notes
- Offline E2E verified: synthetic intake → rights (₹600/₹1,800 penalties) → drafts → verbatim docket `SR-DB-884120` → case record.
- Solo build confirmed; hosted Evon via app.gnani.ai/voice chosen (no GPU ops).
- NEXT: user registers on gnani.ai, claims 5,000 credits, provides real endpoints + API key → build `stt_client.py`/`tts_client.py`, wire `glass_ui.html`, record demo.

---

## [2026-11-06] — Day 13: Mission Control UI build

### Changed
- `frontend/glass_ui.html` — full "Mission Control" restyle (dark instrument panel, flat background, big monospace numerals, Lucide-style inline SVG icons, live telemetry strip, stage timestamps, compliance corner with live secrets-blocked counter). Consent modal, mic/media recording hooks, statutory card, complaint draft tabs, assisted-call script + docket verification, summary button — all wired to the FRD `/api/*` contract with an offline demo-mode fallback (demo data mirrors the legal-matrix worked example).
- `frontend/hud.html` — 4-quadrant telemetry instrument panel (STT WER bars, statutory meter, assisted-call docket, compliance grid) with Run/Reset playback for demo video backdrop. Figures labeled `MEASURED` — honest, no fake-unlabeled numbers.

### Notes
- Both files remain single-file, free-stack (Google Fonts + inline SVG icons + browser audio APIs; no libraries).
- UI is backend-ready: when FastAPI `/api/*` is live, the UI auto-switches to `LIVE · GNANI API` mode; otherwise it runs the offline demo path.

---

## [2026-11-06] — Day 13: Free-constraint audit

### Added
- `scripts/free_constraint_audit.py` — stdlib audit: per-dependency licenses + paid-service token scan of `.env.example`.
- Installed `gnani-vachana 0.9.0` (MIT, verified on PyPI; official Gnani SDK).

### Verified
- All 10 requirements are permissive open source (MIT/BSD/Apache).
- `wss://api.vachana.ai/stt/v3/stream` confirmed as the real Prisma streaming endpoint.
- Auth header `X-API-Key-ID` confirmed; `GNANI_API_KEY` env var matches the SDK.
- Timbre models `timbre-v2.0/v2.5` (42 voices, en-IN/hi-IN), AudioConfig container/rate matrix confirmed.
- No paid hosting/GPU/SMS/telephony/analytics referenced anywhere.
- Open item: credit burn-rate per second/minute not yet measured — track in app.gnani.ai/voice after registration.

---

## [2026-10-25] — Day 1: Documentation foundation & repo scaffold (Human-Controlled Advocate Pivot)

### Added
- Complete documentation foundation for the Great Indian AI Internship Challenge (Gnani AI).
- `AGENTS.md` — master agent instructions: thesis (human-controlled advocate), hard rules (no autonomous dialing, TRAI/DPDP), current phase, stack, working method, duo ownership treaty.
- `RULES.md` — non-negotiable constraints: RBI/2019-20/67 & RB-IOS 2026 legal rules, TRAI 2026 A2P calling compliance, safety guards (secret redaction, consent, substring verification), challenge rules (synthetic data, model naming, no real recordings), technical constraints, free constraint.
- `ARCHITECTURE.md` — 4-mode pipeline (Voice Intake → Rights Checker → Complaint Builder → Assisted Call), module ownership matrix, data flow, assisted-call state machine (IDLE / LISTENING / SCRIPT_DISPLAY / DOCKET_CAPTURE / POST_CALL), key design decisions.
- `ROADMAP.md` — 16-day ship plan (25 Oct → 10 Nov 2026) with day-by-day goals and milestone checkpoints.
- `TODO.md` — current prioritized atomic tasks starting Day 1.
- `README.md` — professional project overview, stack, quick start, license.
- `CONTRIBUTING.md` — guidelines for human duo members and AI coding agents.
- `docs/legal_matrix.md` — exact statutory numbers, circular references, TRAI/DPDP compliance formulas.
- `docs/latency_budget.md` — target latencies and measurement.
- `docs/demo_storyboard.md` — simulated 60-second Demo Day Drop storyboard (16:9 + 9:16).
- `docs/interview_qa.md` — Gnani interview Q&A with model answers (incl. legal compliance).
- `docs/evaluation.md` — success metrics (WER, latency, safety, compliance, demo quality).
- `docs/ui_ux_design_system.md` — design system (glass + clay + accessibility) for assisted-call UI.
- `frontend/glass_ui.html` — citizen-facing voice interface (updated for assisted-call mode).
- `frontend/hud.html` — telemetry HUD (updated with compliance indicators).
- `agent_prompts/SHARED_CONTEXT.md` — common context for all agents.
- `agent_prompts/ENGINEER_A_PROMPT.md` — Engineer A: Voice, DSP, telephony & latency.
- `agent_prompts/ENGINEER_B_PROMPT.md` — Engineer B: Statutory Engine, Evon v3.3 & product UI.
- Repo folder structure: docs/, haqvaani/, demo/, eval/, frontend/, tests/, agent_prompts/.

### Changed
- **Pivot:** HaqVaani is now a **human-controlled refund advocate**, not an autonomous reverse-IVR bot. No autonomous bank dialing. All bank interactions are simulated/synthetic for the hackathon.
- Architecture changed from 7-stage autonomous pipeline to 4-mode human-controlled pipeline.
- Added TRAI 2026 A2P calling compliance and DPDP Act 2023 consent requirements throughout.

### Removed
- Autonomous outbound bank calling stage.
- Real outbound IVR orchestration.

### Notes
- All statutory figures hardcoded in pure Python; never LLM-computed.
- Synthetic data only; no real phone numbers, accounts, Aadhaar, PAN, or recordings.
- Completely free: Gnani 5,000 credits + open-source tools + free GPU (Kaggle/Colab).
