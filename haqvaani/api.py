"""
HaqVaani FastAPI server — same-origin bridge between the citizen UI
(frontend/) and the orchestrator. Serves the frontend and exposes the /api/*.

Run:  uvicorn haqvaani.api:app --reload --port 8000
Open:  http://localhost:8000/

Sessions are in-memory, keyed by the `X-Haqvaani-Session` header
(default "default"). All data shown is synthetic; no real PII is accepted.
Consent (DPDP Act 2023) is enforced per-session before any voice work.
"""

from __future__ import annotations

import asyncio
import json
import os
import uuid
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

# Load .env BEFORE any env-gated module (voice_clients etc.) is imported,
# so `make run-api` / `run.bat` / `python -m haqvaani` all boot in live
# Gnani mode from a clean shell (see CTO review, 2026-11-09).
load_dotenv()

from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .complaint_builder import build_complaint_draft, build_hindi_drafts
from .safety import SafetyGuardBlock, grant_consent, require_consent, verify_verbatim_substring
from .schemas import CitizenIntake, ConsentRecord, StatutoryEntitlement
from .statutory import compute_statutory_entitlement
from .voice_clients import DEMO_IVR_TRANSCRIPT, VoiceAPI, synthesize_tts

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
WEB_DIR = Path(__file__).resolve().parent.parent / "web"
WEB_DIST_DIR = WEB_DIR / "dist"

app = FastAPI(title="HaqVaani API", version="0.1.0")

# CORS for the deployed Vercel frontends (Vite SPA on a different origin than
# the Railway-hosted API). Restrict to Vercel app domains — never "*".
# Rationale: docs/adr/0001-cors-middleware.md
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session store: {session_id: {"consent": ConsentRecord, "parts": {...}}}
SESSIONS: dict[str, dict] = {}


def _session(session_id: str) -> dict:
    return SESSIONS.setdefault(session_id, {"consent": ConsentRecord(), "parts": {}})


def _guard(exc: SafetyGuardBlock) -> HTTPException:
    return HTTPException(status_code=403, detail={"code": exc.code, "reason": exc.reason})


def _session_id(x_session: str | None) -> str:
    return x_session or "default"


# ------------------------------------------------------------------- request models

class ConsentRequest(BaseModel):
    user_name: str = "citizen"


class ComplaintRequest(BaseModel):
    intake: CitizenIntake
    entitlement: StatutoryEntitlement


class TTSRequest(BaseModel):
    text: str
    lang: str = "hi-IN"


# ------------------------------------------------------------------------- routes

@app.get("/api/health")
def health():
    return {
        "ok": True,
        "mode": "live" if VoiceAPI.live_enabled else "demo",
        "stt_live": bool(os.getenv("GNANI_STT_WSS_URL")),
        "tts_live": bool(os.getenv("GNANI_TTS_SSE_URL")),
        "evon_live": bool(os.getenv("GNANI_LLM_URL")),
    }


@app.post("/api/consent")
def consent(body: ConsentRequest, x_session: str | None = Header(default=None, alias="X-Haqvaani-Session")):
    """Record timestamped consent + AI disclosure (DPDP Act 2023, TRAI)."""
    s = _session(_session_id(x_session))
    rec = grant_consent(s["consent"], disclosure_played=True)
    return rec.model_dump(mode="json")


@app.post("/api/intake")
async def intake_route(
    audio: UploadFile | None = File(default=None),
    intake: str | None = Form(default=None),
    x_session: str | None = Header(default=None, alias="X-Haqvaani-Session"),
):
    """Mode 1: voice intake. Requires consent. Returns extracted CitizenIntake."""
    s = _session(_session_id(x_session))
    try:
        require_consent(s["consent"])
    except SafetyGuardBlock as e:
        raise _guard(e)

    if intake:
        obj = CitizenIntake.model_validate(json.loads(intake))
    else:
        blob = await audio.read() if audio else None
        # STT/WSS is blocking and uses asyncio.run() — run it off the loop
        # so live Prisma works inside this async route (no event-loop error).
        transcript = await asyncio.to_thread(VoiceAPI.transcribe, audio_bytes=blob)
        obj = VoiceAPI.parse_intake(transcript)

    s["parts"]["intake"] = obj
    return obj.model_dump(mode="json")


@app.post("/api/rights")
def rights(body: CitizenIntake, x_session: str | None = Header(default=None, alias="X-Haqvaani-Session")):
    """Mode 2: deterministic statutory computation (pure Python, never LLM)."""
    s = _session(_session_id(x_session))
    try:
        require_consent(s["consent"])
    except SafetyGuardBlock as e:
        raise _guard(e)

    ent = compute_statutory_entitlement(
        amount_inr=body.amount_inr,
        txn_date=body.txn_date,
        dispute_type=body.dispute_type,
    )
    s["parts"]["entitlement"] = ent
    return ent.model_dump(mode="json")


@app.post("/api/complaint")
def complaint(body: ComplaintRequest, x_session: str | None = Header(default=None, alias="X-Haqvaani-Session")):
    """Mode 3: complaint drafts + evidence checklist (rejects forbidden secrets)."""
    s = _session(_session_id(x_session))
    try:
        require_consent(s["consent"])
    except SafetyGuardBlock as e:
        raise _guard(e)

    draft = build_complaint_draft(body.intake, body.entitlement)
    hindi = build_hindi_drafts(body.intake, body.entitlement)
    s["parts"]["draft"] = draft
    s["parts"]["hindi_drafts"] = hindi
    return {**draft.model_dump(mode="json"), "hindi_drafts": hindi}


@app.post("/api/assisted")
async def assisted_route(
    ivr_audio: UploadFile | None = File(default=None),
    ivr_transcript: str | None = Form(default=None),
    intake: str = Form(...),
    x_session: str | None = Header(default=None, alias="X-Haqvaani-Session"),
):
    """Mode 4 (simulated): assist the user's call; verbatim-verify the docket."""
    s = _session(_session_id(x_session))
    try:
        require_consent(s["consent"])
    except SafetyGuardBlock as e:
        raise _guard(e)

    citizen = CitizenIntake.model_validate(json.loads(intake))
    if ivr_audio is not None:
        transcript = (await ivr_audio.read()).decode("utf-8", errors="replace")
    elif ivr_transcript:
        transcript = ivr_transcript
    else:
        transcript = DEMO_IVR_TRANSCRIPT

    neg = VoiceAPI.extract_negotiation(transcript)
    candidate = neg.docket_id_candidate
    verified = verify_verbatim_substring(candidate, transcript)
    result = {
        "transcript": transcript,
        "docket_candidate": candidate if verified else None,
        "verbatim_verified": verified,
        "docket_id": candidate if verified else None,
        "brush_off_type": neg.brush_off_type.value if neg.brush_off_type else None,
        "suggested_script_en": neg.suggested_script_en,
        "suggested_script_hi": neg.suggested_script_hi,
    }
    s["parts"]["call"] = result
    return result


@app.post("/api/tts")
def tts(body: TTSRequest):
    """Timbre TTS (demo unless wired). Hard redaction gate before outbound.

    Returns JSON-safe output: the raw WAV bytes are never returned (FastAPI
    cannot JSON-encode bytes); live audio travels as `audio_base64` which the
    frontend plays directly. (User-approved patch — 2026-11-08.)
    """
    try:
        r = synthesize_tts(body.text, body.lang)
    except SafetyGuardBlock as e:
        raise _guard(e)

    out: dict = {"status": r.status, "note": getattr(r, "note", "")}
    if r.status == "live" and getattr(r, "audio_base64", ""):
        out["audio_base64"] = r.audio_base64
    if getattr(r, "chunks", None):
        out["chunks"] = r.chunks
    if getattr(r, "errors", None):
        out["errors"] = list(r.errors)
    return out


@app.get("/api/dossier")
def dossier(x_session: str | None = Header(default=None, alias="X-Haqvaani-Session")):
    """Final case dossier (HaqVaaniCaseRecord-shaped) when all modes completed."""
    s = _session(_session_id(x_session))
    parts = s["parts"]
    if not all(k in parts for k in ("intake", "entitlement", "draft", "call")):
        raise HTTPException(
            status_code=404,
            detail={"code": "CASE_INCOMPLETE", "reason": "Not all four modes completed."},
        )
    return {
        "case_id": f"HV-{uuid.uuid4().hex[:10].upper()}",
        "citizen_intake": parts["intake"].model_dump(mode="json"),
        "statutory_entitlement": parts["entitlement"].model_dump(mode="json"),
        "complaint_draft": parts["draft"].model_dump(mode="json"),
        "call": parts["call"],
        "consent": s["consent"].model_dump(mode="json"),
        "created_at": datetime.now().isoformat(),
    }


# ----------------------------------------------------------------- static frontend

@app.get("/", include_in_schema=False)
def root():
    """Entry point: the HaqVaani React app (web/dist) if built, else the
    story/landing page (frontend/landing.html) as a fallback."""
    if WEB_DIST_DIR.is_dir() and (WEB_DIST_DIR / "index.html").is_file():
        return FileResponse(WEB_DIST_DIR / "index.html")
    return FileResponse(FRONTEND_DIR / "landing.html")


# The newer React/Vite rebuild (web/) is the primary citizen app. Serve its
# built output (web/dist) at / so http://localhost:8000 opens the SPA; /api/*
# routes on the same FastAPI handle API calls same-origin (the web/ client
# sends BASE="" when VITE_API_BASE is unset, so fetch("/api/...") lands here).
if WEB_DIST_DIR.is_dir():
    app.mount("/", StaticFiles(directory=str(WEB_DIST_DIR), html=True), name="webapp")
elif FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
