"""UI integrity check for the new HaqVaani design system (docs/DESIGN.md).

Verifies the structural hooks every agent-assisted edit must keep intact:
  * the story landing page wires the shared tokens + rail + router runtime
  * the rail device: >=5 `data-tone` beat sections on the landing page
  * every screen (frontend/screens/*.html) carries the persistent app shell:
    data-page="app" / stepped rail mount / demo chip / safety bar + panel
  * screen links stay in-app; external links are real and never alert()
  * the DPDP consent gate really guards the two voice screens
  * the 11-screen case flow is wired end to end
Banned construction (old system): uppercase cosmetics, entrance-everywhere
hooks (`reveal` / `stagger` / animated `data-count`), alert()-navigation,
opaque gradients / glass / blur.

Runs standalone:  python scripts/_ui_integrity_check.py   (exit 1 on failure)

The same contract is also enforced for the React/Vite rebuild in `web/`
(screens as web/src/screens/*.jsx, tokens as web/src/styles/tokens.css):
exact token values, approved Google fonts only, SECRET_RE source, safety
strings, consent gate dispatch, the 11-screen route table, and the in-page
beats that feed the data-tone contract.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FRONT = ROOT / "frontend"

failures: list[str] = []


def fail(msg: str) -> None:
    failures.append(msg)


def need(cond: bool, msg: str) -> None:
    if not cond:
        fail(msg)


def read(rel: str) -> str:
    p = FRONT / rel
    if not p.is_file():
        fail(f"missing shared asset {rel}")
        return ""
    return p.read_text(encoding="utf-8", errors="replace")


# ---------------------------------------------------------------- shared runtime
tokens_css = read("css/tokens.css")
app_css = read("css/app.css")
rail_js = read("js/rail.js")
router_js = read("js/router.js")

for var in ("--verified-green", "--blocked-red", "--pending-orange", "--live-cyan"):
    need(var in tokens_css, f"tokens.css: missing semantic colour {var}")
need("prefers-reduced-motion" in app_css, "app.css: missing prefers-reduced-motion final states")
need("@media print" in app_css, "app.css: missing @media print dossier styles")
need("stepMount" in rail_js, "rail.js: missing the 5-step bar (#stepMount)")
need("data-page-run" in router_js, "router.js: missing data-page-run dispatch")
need("guardConsent" in router_js, "router.js: missing consent gate helper (HQ.guardConsent)")

# ---------------------------------------------------------------------- landing
landing_path = FRONT / "landing.html"
if not landing_path.is_file():
    fail("missing frontend/landing.html")
else:
    land = landing_path.read_text(encoding="utf-8", errors="replace")
    for link in ("css/tokens.css", "css/app.css", "js/rail.js", "js/router.js"):
        need(link in land, f"landing.html: does not link {link}")
    tones = re.findall(r'data-tone="([^"]+)"', land)
    need(len(tones) >= 5, f"landing.html: scroll-rail needs >=5 data-tone beats (found {len(tones)})")
    need('data-page="landing"' in land, 'landing.html: body missing data-page="landing"')


# -------------------------------------------------------------------- screens
SHELL_HOOKS = (
    'data-page="app"',
    'id="stepMount"',
    'id="modeChip"',
    'id="safetyPanel"',
    "lang-seg",
    'class="safety"',
)
BANNED_PATTERNS = (
    "linear-gradient", "radial-gradient", "backdrop-filter", "blur(",
    "text-transform",
    "data-count", "data-reveal", "data-stagger", "reveal(", "stagger(",
)


def check_screen(path: Path) -> None:
    name = path.relative_to(FRONT).as_posix()
    html = path.read_text(encoding="utf-8", errors="replace")

    # shell contract: one device (rail), one chip, one safety bar — on every screen
    for hook in SHELL_HOOKS:
        if hook not in html:
            fail(f"{name}: missing shell hook {hook}")
    canvases = re.findall(r'<body[^>]*data-canvas="([^"]+)"', html)
    need(any(c in ("story", "evidence") for c in canvases),
         f"{name}: body must declare data-canvas=story|evidence")
    steps = re.findall(r'<body[^>]*data-step="(\d+)"', html)
    need(bool(steps) and int(steps[-1]) in range(5), f"{name}: body needs data-step 0-4")
    need(re.search(r'<html[^>]*lang="hi-IN"', html) is not None,
         f"{name}: <html lang=\"hi-IN\"> missing (Hindi is first-class)")

    # shared runtime links
    for link in ("../css/tokens.css", "../css/app.css", "../js/rail.js", "../js/router.js"):
        if link not in html:
            fail(f"{name}: missing link {link}")

    # real links rule: never alert() navigation; external links open safely
    for _ in re.findall(r"\balert\s*\(", html):
        fail(f"{name}: alert() found — navigation must be real links + toast")
    for m in re.finditer(r'<a\b[^>]*href="(https?://[^"]+)"[^>]*>', html):
        tag = m.group(0)
        if not ('rel="' in tag and "noopener" in tag and 'target="_blank"' in tag):
            fail(f"{name}: external link without target=_blank + rel=noopener: {m.group(1)}")

    # banned cosmetics of the old glass system
    for needle in BANNED_PATTERNS:
        if needle in html:
            fail(f"{name}: banned old-system pattern {needle!r}")


screens = sorted((FRONT / "screens").glob("*.html"))
if len(screens) != 11:
    fail(f"expected 11 screens in frontend/screens, found {len(screens)}"
         + (": " + ", ".join(p.name for p in screens)))
for screen in screens:
    check_screen(screen)

# ------------------------------------------------------------- DPDP consent gate
for guarded in ("voice-intake.html", "assisted-call.html"):
    p = FRONT / "screens" / guarded
    if p.is_file():
        need("HQ.guardConsent" in p.read_text(encoding="utf-8", errors="replace"),
             f"{guarded}: voice capture without the consent gate")

consent_path = FRONT / "screens" / "consent.html"
if consent_path.is_file():
    cons = consent_path.read_text(encoding="utf-8", errors="replace")
    need(cons.count('type="checkbox"') >= 2, "consent.html: two consent checkboxes required")
    need("AI disclosure" in cons or "ईमानदारी की सूचना" in cons,
         "consent.html: AI disclosure block missing")

# --------------------------------------------------------------------- case flow
FLOW = {
    "start-case.html": ["consent.html?next=voice-intake.html"],
    "consent.html": ["voice-intake.html"],
    "voice-intake.html": ["fact-review.html"],
    "fact-review.html": ["rights-check.html"],
    "rights-check.html": ["complaint-builder.html"],
    "complaint-builder.html": ["call-prep.html"],
    "call-prep.html": ["assisted-call.html"],
    "assisted-call.html": ["docket-capture.html"],
    "docket-capture.html": ["post-call.html"],
    "post-call.html": ["dossier.html"],
    "dossier.html": ["start-case.html", "../landing.html"],
}
for screen in screens:
    html = screen.read_text(encoding="utf-8", errors="replace")
    for target in FLOW.get(screen.name, []):
        if f'href="{target}"' not in html and f'"{target}"' not in html:
            fail(f"{screen.name}: flow link to {target} missing")

# ================================================================= web/ SPA
# The React/Vite rebuild (web/) re-implements the same design + safety
# contract as modules. Checks are additive: relaxing the frontend/ contract
# above must never be carried in the same commit that touches web/.
WEB = ROOT / "web"


def web_read(rel: str) -> str:
    p = WEB / rel
    if not p.is_file():
        fail(f"web/: missing file {rel}")
        return ""
    return p.read_text(encoding="utf-8", errors="replace")


web_tokens = web_read("src/styles/tokens.css")
web_app_css = web_read("src/styles/app.css")
web_paper_css = web_read("src/styles/paper.css")
web_index = web_read("index.html")
web_vite = web_read("vite.config.js")
web_router = web_read("src/lib/router.js")
web_app_jsx = web_read("src/App.jsx")
web_landing = web_read("src/landing/Landing.jsx")
web_format = web_read("src/lib/format.js")
web_demo = web_read("src/lib/demo.js")

# --- tokens: the exact merged-palette values (one accent, ink never black,
#     green reserved for the refund-credited moment) -----------------------
WEB_TOKEN_EXACT = {
    "--accent": "#fa3600",
    "--ink": "#282828",
    "--line": "#e5e7eb",
    "--canvas": "#ffffff",
    "--success": "#1a7f4b",
    "--s-xs": "8px",
    "--s-sm": "18px",
    "--s-md": "26px",
    "--s-lg": "54px",
    "--s-xl": "132px",
    "--pad-section": "75px",
    "--gutter": "38px",
    "--radius-card": "8px",
    "--radius-chip": "999px",
    "--btn-h": "75px",
    "--btn-min": "222px",
}
for var, value in WEB_TOKEN_EXACT.items():
    need(re.search(rf"^\s*{re.escape(var)}:\s*{re.escape(value)}\s*[;]", web_tokens, re.M),
         f"web/tokens.css: {var} must be exactly {value}")
need("refunded" in web_tokens or "refund credited" in web_tokens,
     "web/tokens.css: --success must carry the 'only refund credited' comment")
need("prefers-reduced-motion" in web_app_css,
     "web/app.css: missing prefers-reduced-motion final states")
need("@media print" in web_app_css and ".no-print" in web_app_css,
     "web/app.css: missing @media print / .no-print dossier styles")

# --- banned cosmetics of the glass era, in the way the new system can
#     actually produce them: blur/glass must be hard OFF, gradients banned,
#     DOM never assembled from strings ------------------------------------
for f in (web_tokens, web_app_css):
    for m in re.finditer(r"(linear|radial)-gradient\s*\(", f):
        fail(f"web/styles: gradient found ({m.group(0)}…) — depth comes from scale + accent only")
    for m in re.finditer(r"backdrop-filter:\s*[a-z-]*blur", f):
        fail("web/styles: glass blur found — merge contract is filter: none")
for m in re.finditer(r"dangerouslySetInnerHTML|\.innerHTML\s*=|innerHTML\s*:\s*",
                     web_landing + web_app_jsx):
    fail(f"web/: DOM-via-strings found ({m.group(0)}) — the docket <mark> highlight is JSX")

# --- fonts: the approved Google families — the paper-poster set
#     (Anton / Teko / Inter / JetBrains Mono / Noto Sans Devanagari)
#     + the app-screen set (Archivo / Geist Mono). BT Grotesk is paid
#     and banned. -----------------------------------------------------
WEB_FONT_OK = {
    "Anton", "Teko", "Inter", "JetBrains+Mono", "Noto+Sans+Devanagari",
    "Archivo", "Geist+Mono",
}
web_families = re.findall(r"[?&]family=([A-Za-z+]+)", web_index)
need(len(web_families) == len(WEB_FONT_OK) and set(web_families) == WEB_FONT_OK,
     f"web/index.html: Google Fonts must be exactly {sorted(WEB_FONT_OK)} (found {web_families})")
for cssf in (web_tokens, web_app_css):
    for m in re.finditer(r'[\'"](?:BT\s+Grotesk)[\'"]', cssf):
        fail(f"web/styles: unapproved font {m.group(0)}")
# the paper landing must carry its own font stack vars
for var in ("--f-disp", "--f-body", "--f-mono"):
    need(var in web_paper_css, f"web/paper.css: missing font token {var}")

# --- paper landing: the chosen reference UI contract ----------------------
need(".paper-root" in web_paper_css, "web/paper.css: missing .paper-root scope")
for var, value in {"--paper": "#f4efe4", "--ink": "#282828",
                   "--org": "#fa3600", "--grn": "#1a7f4b"}.items():
    need(re.search(rf"^\s*{re.escape(var)}:\s*{re.escape(value)}\s*[;]", web_paper_css, re.M),
         f"web/paper.css: {var} must be exactly {value}")
need("prefers-reduced-motion" in web_paper_css,
     "web/paper.css: missing prefers-reduced-motion handling")
need("@keyframes hvSpin" in web_paper_css or "@keyframes spin" in web_paper_css,
     "web/paper.css: missing phone-processing spinner keyframe")
for anchor in ("#top", "#details"):
    need(f'id="{anchor[1:]}"' in web_landing, f"web/landing: missing section {anchor}")
need(web_landing.count('type="range"') >= 2,
     "web/landing: the case calculator needs its two sliders")
# the act scenes live in acts/Act.jsx + acts/Act01..04.jsx
need('className="act"' in web_read("src/landing/acts/Act.jsx"),
     "web/landing/acts/Act.jsx: missing .act scene shell")
for n in ("01", "02", "03", "04"):
    act = web_read(f"src/landing/acts/Act{n}.jsx")
    need(f'id="act{int(n)}"' in act, f"web/landing/acts/Act{n}.jsx: missing id=act{int(n)}")
    need(act.count("<Act") >= 1 or "Act " in act, f"web/landing/acts/Act{n}.jsx: empty act")
    need("build={" in act, f"web/landing/acts/Act{n}.jsx: missing GSAP build timeline")

# --- safety: the secret net, the AI line, the simulated-IVR honesty -------
need(re.search(r"export const SECRET_RE\s*=.*(?:otp|OTP)", web_format) is not None
     and "mpin" in web_format and "cvv" in web_format and "password" in web_format,
     "web/lib/format.js: SECRET_RE must regex-block OTP/PIN/MPIN/CVV/password")
need('AI_DISCLOSURE = "This is an AI assistant assisting you."' in web_demo,
     "web/lib/demo.js: the exact AI disclosure line must stay word-for-word")
for sim_file, sim_src in (("landing/Landing.jsx", web_landing),
                          ("screens/CallPrep.jsx", web_read("src/screens/CallPrep.jsx")),
                          ("screens/AssistedCall.jsx", web_read("src/screens/AssistedCall.jsx"))):
    need("Simulated IVR / synthetic demo" in sim_src,
         f"web/src/{sim_file}: missing 'Simulated IVR / synthetic demo' label")
need("No autonomous dialing" in web_landing,
     "web/landing: the no-autonomous-dialing safety line is missing")

# --- consent gate: same dispatch as the old HQ.guardConsent ---------------
need("consentGranted" in web_app_jsx and "#/consent?next=" in web_app_jsx,
     "web/App.jsx: consent gate must redirect to #/consent?next=…")
for route in ("/voice-intake", "/assisted-call"):
    row = re.search(rf'"{route}":\s*\{{[^}}]*}}', web_router)
    need(row is not None and "consent: true" in row.group(0),
         f"web/router.js: {route} must carry consent: true")

# --- the 11 routes are wired end to end ----------------------------------
WEB_ROUTES = (
    "/start-case", "/consent", "/voice-intake", "/fact-review", "/rights-check",
    "/complaint-builder", "/call-prep", "/assisted-call", "/docket-capture",
    "/post-call", "/dossier",
)
web_screens = sorted((WEB / "src" / "screens").glob("*.jsx"))
need(len(web_screens) == 11,
     f"web/src/screens: expected 11 screens, found {len(web_screens)}"
     + (": " + ", ".join(p.name for p in web_screens)))
for route in WEB_ROUTES:
    need(f'"{route}"' in web_router, f"web/router.js: route {route} missing from SCREENS")
    need(f'"{route}"' in web_app_jsx,
         f"web/App.jsx: route {route} missing from SCREEN_MAP dispatch")
# dev proxy keeps /api same-origin (api.py cannot gain CORS middleware)
need(web_vite and "/api" in web_vite and "localhost:8000" in web_vite,
     "web/vite.config.js: /api → localhost:8000 proxy missing")

print("HaqVaani UI integrity check — design system docs/DESIGN.md")
print(f"  screens checked: {len(screens)} + web screens: {len(web_screens)}")
for s in screens:
    print(f"   · {s.relative_to(FRONT).as_posix()}")
for s in web_screens:
    print(f"   · web/{s.relative_to(WEB).as_posix()}")
if failures:
    print(f"\nFAIL — {len(failures)} issue(s):")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
print("\nOK — landing shell, 11 screens, consent gate and case flow all wired"
      " (frontend/ + web/ SPA).")
