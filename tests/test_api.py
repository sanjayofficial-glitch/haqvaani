"""API smoke tests — consent-gated E2E in offline/demo mode (no network).

The suite exercises the real FastAPI app exactly the way the frontend calls it:
consent → intake → rights → complaint → assisted → dossier, plus the hard
safety gates (consent required, secret redaction).
"""

from datetime import date
import json

from fastapi.testclient import TestClient

from haqvaani.api import app
from haqvaani.statutory import compute_statutory_entitlement

client = TestClient(app)


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True
    assert body["mode"] in ("live", "demo")


def test_intake_blocked_without_consent():
    r = client.post("/api/intake")
    assert r.status_code == 403
    assert r.json()["detail"]["code"] == "CONSENT_REQUIRED"


def test_full_demo_case_including_dossier():
    # 1. consent
    r = client.post("/api/consent", json={"user_name": "citizen"})
    assert r.status_code == 200
    consent = r.json()
    assert consent["citizen_consent_verified"] is True
    assert consent["disclosure_timestamp"] is not None

    # 2. intake (no audio → demo transcript path)
    r = client.post("/api/intake")
    assert r.status_code == 200
    intake = r.json()
    assert intake["utr"] == "629188340112"
    assert intake["amount_inr"] == 3200.0

    # 3. rights — cross-check against the same pure-Python engine
    r = client.post("/api/rights", json=intake)
    assert r.status_code == 200
    ent = r.json()
    expected = compute_statutory_entitlement(
        amount_inr=intake["amount_inr"],
        txn_date=date.fromisoformat(intake["txn_date"]),
        dispute_type=intake["dispute_type"],
    )
    assert ent["tat_date"] == expected.tat_date.isoformat()
    assert ent["days_overdue"] == expected.days_overdue
    assert ent["penalty_inr"] == expected.penalty_inr

    # 4. complaint drafts (EN + deterministic HI)
    r = client.post("/api/complaint", json={"intake": intake, "entitlement": ent})
    assert r.status_code == 200
    draft = r.json()
    assert "RBI/2019-20/67" in draft["bank_complaint_text"]
    assert isinstance(draft["evidence_checklist"], list) and draft["evidence_checklist"]
    hi = draft.get("hindi_drafts")
    assert hi is not None, "server must return deterministic Hindi drafts"
    assert "क्षतिपूर्ति" in hi["bank_complaint_text"]  # Devanagari content
    assert len(hi["bank_complaint_text"]) > 120
    assert "सांविधिक" in hi["bank_complaint_text"]

    # 5. assisted call (simulated IVR)
    r = client.post("/api/assisted", data={"intake": json.dumps(intake)})
    assert r.status_code == 200
    call = r.json()
    assert call["verbatim_verified"] is True
    assert call["docket_id"] == "SR-DB-884120"

    # 6. dossier assembled
    r = client.get("/api/dossier")
    assert r.status_code == 200
    case = r.json()
    assert case["case_id"].startswith("HV-")
    assert case["call"]["verbatim_verified"] is True


def test_tts_secret_redaction():
    r = client.post("/api/tts", json={"text": "My OTP is 1234", "lang": "hi-IN"})
    assert r.status_code == 403
    assert r.json()["detail"]["code"] == "FORBIDDEN_SECRET"

    ok = client.post("/api/tts", json={"text": "saaransh taiyar hai", "lang": "hi-IN"})
    assert ok.status_code == 200
    assert ok.json()["status"] == "demo"


def test_dossier_incomplete_without_call():
    # fresh session id
    r = client.get("/api/dossier", headers={"X-Haqvaani-Session": "solo"})
    assert r.status_code == 404
    assert r.json()["detail"]["code"] == "CASE_INCOMPLETE"
