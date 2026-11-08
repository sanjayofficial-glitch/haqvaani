"""Live E2E proof against the running stack via the Vite proxy (:5173 → :8000).

Exercises the exact routes the frontend uses, in one session:
consent → rights → complaint → assisted (multipart) → dossier, plus the
TTS secret-redaction gate. Prints each step's verdict + key values.

Usage:  python scripts/_e2e_live.py [base]
"""
import json
import sys
import uuid
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5173"
SID = uuid.uuid4().hex
HDR = {"X-Haqvaani-Session": SID}


def call(method, path, body=None, raw_json=True, multipart=None):
    url = BASE + path
    data = None
    headers = dict(HDR)
    if multipart is not None:
        boundary = "----hv" + uuid.uuid4().hex
        buf = []
        for k, v in multipart.items():
            buf.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n")
        buf.append(f"--{boundary}--\r\n")
        data = "".join(buf).encode("utf-8")
        headers["Content-Type"] = f"multipart/form-data; boundary={boundary}"
    elif body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, json.loads(raw) if raw.strip() else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try:
            return e.code, json.loads(raw) if raw.strip() else {}
        except json.JSONDecodeError:
            return e.code, {"raw": raw[:200]}


def main():
    ok = True
    def check(label, cond, extra=""):
        nonlocal ok
        ok = ok and cond
        print(f"  {'✓' if cond else '✗'} {label}{' — ' + extra if extra else ''}")

    print("1) health")
    s, h = call("GET", "/api/health")
    check("health 200 + live", s == 200 and h.get("mode") == "live", json.dumps(h))

    print("2) consent (DPDP gate)")
    s, c = call("POST", "/api/consent", {"user_name": "E2E Live"})
    check("consent recorded", s == 200 and c.get("citizen_consent_verified") is True)

    intake = {
        "dispute_type": "upi_p2p",
        "amount_inr": 5475,
        "txn_date": "2026-11-03",
        "utr": "629188340112",
        "bank_name": "DemoBank",
        "language": "hi-IN",
    }

    print("3) intake blocked WITHOUT consent (fresh session)")
    fresh = {"X-Haqvaani-Session": uuid.uuid4().hex}
    req = urllib.request.Request(BASE + "/api/intake", headers=fresh, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            s, e = resp.status, {}
    except urllib.error.HTTPError as ex:
        raw = ex.read().decode("utf-8", errors="replace")
        try:
            s, e = ex.code, json.loads(raw) if raw.strip() else {}
        except json.JSONDecodeError:
            s, e = ex.code, {"raw": raw[:160]}
    check("403 consent required", s == 403 and e.get("detail", {}).get("code") == "CONSENT_REQUIRED",
          f"status={s} body={json.dumps(e)[:160]}")

    print("3b) intake — stores the CitizenIntake for the case")
    s, got = call("POST", "/api/intake", None, multipart={"intake": json.dumps(intake)})
    check("intake 200 + facts", s == 200 and got.get("amount_inr") == 5475,
          f"amount={got.get('amount_inr')} utr={got.get('utr')}")

    print("4) rights — deterministic Python math")
    s, ent = call("POST", "/api/rights", intake)
    check("rights 200", s == 200)
    check("penalty = ₹100 × overdue", ent.get("penalty_inr") == 100 * ent.get("days_overdue", 0),
          f"penalty={ent.get('penalty_inr')} overdue={ent.get('days_overdue')} total={ent.get('total_inr')}")
    check("circular anchored", "RBI/2019-20/67" in ent.get("circular_ref", ""))

    print("5) complaint — EN + deterministic Hindi drafts")
    s, draft = call("POST", "/api/complaint", {"intake": intake, "entitlement": ent})
    check("complaint 200", s == 200)
    check("EN draft cites circular", "RBI/2019-20/67" in draft.get("bank_complaint_text", ""))
    check("Hindi draft nonempty", len(draft.get("hindi_drafts", {}).get("bank_complaint_text", "")) > 120)
    check("evidence checklist", isinstance(draft.get("evidence_checklist"), list) and draft["evidence_checklist"])

    print("6) assisted — simulated IVR, verbatim docket")
    s, a = call("POST", "/api/assisted", None, multipart={"intake": json.dumps(intake)})
    check("assisted 200", s == 200)
    check("docket verbatim verified", a.get("verbatim_verified") is True and a.get("docket_id") == "SR-DB-884120",
          f"docket={a.get('docket_id')}")

    print("7) dossier — complete record")
    s, dos = call("GET", "/api/dossier")
    check("dossier 200 + HV- id", s == 200 and dos.get("case_id", "").startswith("HV-"),
          f"status={s} body={json.dumps(dos)[:200]}")
    check("dossier verified docket", dos.get("call", {}).get("verbatim_verified") is True,
          f"call={json.dumps(dos.get('call', {}))[:120]}")

    print("8) TTS redaction gate")
    s, e = call("POST", "/api/tts", {"text": "My OTP is 1234", "lang": "hi-IN"})
    check("forbidden secret → 403", s == 403 and e.get("detail", {}).get("code") == "FORBIDDEN_SECRET")

    print("\nRESULT:", "ALL GREEN" if ok else "FAILURES PRESENT")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
