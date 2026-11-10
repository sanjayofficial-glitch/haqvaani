# ADR 0001 — CORS middleware for the deployed frontend

- **Status:** Accepted (2026-11-10, deadline-day deploy)
- **Owner:** HaqVaani Duo — Engineer A (voice/telephony) + Engineer B (API/UI). This
  lifts the "api.py must not gain CORS" freeze **only** for an allowlisted set of
  origins; all safety gates remain untouched.

## Context

The frontend is deployed on Vercel (`https://haqvaani.vercel.app`, `web/` React
app) and the FastAPI backend on Railway (`https://haqvaani-production.up.railway.app`).
They are cross-origin. WebSocket (voice) is not CORS-restricted, but the REST endpoints
(`/api/health`, `/api/consent`, `/api/...` intake/dossier) are blocked by the browser
without CORS headers. Earlier rule: api.py had no CORS and "must not be modified" —
that rule was written for a same-origin dev flow and blocks the live deployment.

## Options considered

- **Option A — allowlist CORS middleware (chosen).** `CORSMiddleware` with
  `allow_origin_regex=r"https://.*\.vercel\.app"`, methods/headers `*`, no
  credentials. Covers the production alias and future Git preview deployments;
  nothing else (not `*`).
- Option B — Vercel rewrites for REST `/api` → Railway. Rejected: Vercel cannot
  proxy WebSockets, so the voice path would still need a direct origin anyway;
  two transport paths add complexity with no benefit over A.
- Option C — stay demo-only, no CORS. Rejected: the user wants the live backend
  reachable from the frontend.

## Decision

Add `CORSMiddleware` to `haqvaani/api.py` immediately after app creation, allowing
origins matching `https://*.vercel.app` (regex), all methods/headers, no credentials.

## Consequences

- Easier: Vercel-hosted frontend can call the Railway API directly (REST + future WS).
- Easier: graceful preview branches get CORS for free.
- Harder: if the frontend ever moves off Vercel, the regex must be updated.
- None of the safety invariants change: consent gate, `FORBIDDEN_SECRET_RE`,
  no-autonomous-dialing, statutory math in pure Python — all untouched.
