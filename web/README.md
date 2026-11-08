# HaqVaani web — the "Heron × HaqVaani" React/Vite rebuild

The story landing + 11 case screens, re-implemented from `frontend/` (which
stays untouched as reference) in React 18 + Vite 5, wired to the FastAPI at
`haqvaani/api.py` (port 8000).

Design language: stark editorial white, charcoal ink `#282828`, hairline
rules, ONE orange signal accent `#fa3600`, mono technical voice (Geist Mono),
Archivo display faces, Noto Sans Devanagari for Hindi. Green `#1a7f4b` appears
only where a refund is credited. `prefers-reduced-motion` kills every
animation globally.

## Run

```bash
# terminal 1 — the API (from the repo root)
python -m uvicorn haqvaani.api:app --port 8000

# terminal 2 — the app
cd web
npm install     # once
npm run dev     # http://localhost:5173
```

`vite.config.js` proxies `/api` → `http://localhost:8000` for both
`vite dev` (5173) and `vite preview` (4173), so the browser always talks
same-origin even though `haqvaani/api.py` has **no CORS middleware and must
not be modified**.

## Static deployment caveat

A static build (`npm run build` → `dist/`) is just files on a host. There is
no proxy there, so `/api` requests go nowhere unless you set the base URL at
**build time**:

```bash
VITE_API_BASE=https://your-project.example.org/api npm run build
```

- `web/src/lib/api.js` reads `import.meta.env.VITE_API_BASE`; when it is set,
  requests go to that origin instead of relative `/api`.
- That host must serve the API with CORS headers — since `api.py` cannot gain
  CORS (frozen), put the API behind a reverse proxy on the same domain
  (e.g. `/api` path on one host) and set `VITE_API_BASE=/api`.
- Without a reachable API the app still runs fully in **synthetic demo** mode:
  every mode chip and footnote honestly says `demo`, and statutory numbers
  come from the labelled sample mirrors — never computed or invented in the
  frontend.

## What must stay true (enforced by the integrity check)

`python scripts/_ui_integrity_check.py` (repo root) now checks **both** the
old `frontend/` contract and this app:

- exact token values in `src/styles/tokens.css` (`--accent:#fa3600`,
  `--ink:#282828`, `--line:#e5e7eb`, `--canvas:#ffffff`, `--success:#1a7f4b`,
  spacing 8/18/26/54/132, `--pad-section:75px`, `--gutter:38px`,
  `--btn-h:75px`, `--btn-min:222px`, card radius 8px, chips pill);
- only the three approved Google families in `index.html`
  (Archivo, Geist Mono, Noto Sans Devanagari — no BT Grotesk / Inter /
  JetBrains Mono);
- no gradients, no glass blur, no string-assembled DOM
  (`dangerouslySetInnerHTML`/`.innerHTML=`) anywhere in the app;
- the safety truths: `SECRET_RE` (OTP/PIN/MPIN/CVV/password) in
  `src/lib/format.js`, the exact AI-disclosure line
  `This is an AI assistant assisting you.` in `src/lib/demo.js`,
  `Simulated IVR / synthetic demo` labels on landing/call-prep/assisted-call,
  the no-autonomous-dialing line on the landing;
- the DPDP consent gate dispatch (`consentGranted` → `#/consent?next=…`) and
  `consent: true` on both voice routes;
- all 11 routes present in both the `SCREENS` table (`lib/router.js`) and the
  `SCREEN_MAP` dispatch (`App.jsx`), plus the `/api` proxy in
  `vite.config.js`.

## Layout

```
web/
  index.html                  # fonts + favicon (₹ coin), no template HTML UI
  vite.config.js              # /api proxy (dev + preview)
  src/
    main.jsx                  # StrictMode mount
    App.jsx                   # hash-route dispatch + consent gate
    landing/Landing.jsx       # the scroll story (Lenis + GSAP ScrollTrigger)
    components/               # AppShell (head+stepbar+safety), Svg line-art
    screens/                  # the 11 case screens (mirrors of frontend/screens)
    hooks/                    # useCapture, useMode, useSpeak, useToast, …
    lib/                      # router, api, state (sessionStorage), format,
                              # demo fixtures, i18n pair-text helpers
    styles/                   # tokens.css (source of truth) + app.css
```

One task at a time; keep the integrity check green after every UI change.
