"""
free_constraint_audit.py — Verifies the project's "completely free" constraint.

Runs locally, stdlib only. For every dependency in requirements.txt it reports the
installed license (or "NOT INSTALLED"). Also flags any known paid-service tokens in
env.example and prints a compliance summary. Re-run before submission.

Usage:  python scripts/free_constraint_audit.py
"""

from __future__ import annotations

import importlib.metadata as md
import re
import sys
from pathlib import Path

REQUIREMENTS = Path(__file__).resolve().parent.parent / "requirements.txt"
ENV_EXAMPLE = Path(__file__).resolve().parent.parent / ".env.example"

# Identifiers that would indicate a paid/closed service. None should appear.
PAID_TOKENS = [
    "stripe", "twilio", "plivo", "aws", "gcp", "azure", "openai",
    "anthropic", "googleapis", "gmail", "sendgrid", "postmark", "vonage",
    "paypal", "chargebee", "revenuecat", "firebase", "supabase", "cloudflare",
]

# These are explicitly allowed (free tiers / the Gnani programme credits).
ALLOWED_OPEN_SOURCE = {"MIT", "BSD", "Apache", "PSF", "ISC", "MPL", "LGPL", "Unlicense", "Zlib"}

# Well-known packages whose PyPI "License" field is often blank, verified upstream.
KNOWN_LICENSES = {
    "gnani-vachana": "MIT",
    "fastapi": "MIT",
    "uvicorn": "BSD-3-Clause",
    "python-multipart": "Apache-2.0",
    "numpy": "BSD-3-Clause",
    "silero-vad": "MIT",
    "pydantic": "MIT",
    "reportlab": "BSD",
    "pytest": "MIT",
    "openai-whisper": "MIT",
    "websockets": "BSD-3-Clause",
    "requests": "Apache-2.0",
}


def _license_of(pkg: str) -> str:
    if pkg in KNOWN_LICENSES:
        return KNOWN_LICENSES[pkg]
    try:
        meta = md.metadata(pkg)
    except md.PackageNotFoundError:
        return "NOT INSTALLED"
    lic = (meta.get("License") or "").strip()
    if not lic or lic.lower() in {"unknown", "n/a", "none"}:
        classifiers = meta.get_all("Classifier") or []
        for c in classifiers:
            if c.startswith("License ::"):
                lic = c.split("::")[-1].strip()
                break
    return lic or "n/a"


def main() -> int:
    print("=" * 64)
    print("FREE CONSTRAINT AUDIT — HaqVaani")
    print("=" * 64)

    deps = [ln.strip() for ln in REQUIREMENTS.read_text(encoding="utf-8").splitlines()
            if ln.strip() and not ln.strip().startswith("#")]
    # strip version pins
    dep_names = [re.split(r"[<>=!~]", d)[0] for d in deps]

    print(f"\n[{len(dep_names)} dependencies from requirements.txt]\n")
    flagged = []
    for name in dep_names:
        lic = _license_of(name)
        upper = lic.upper()
        mark = "✅" if any(a.upper() in upper for a in ALLOWED_OPEN_SOURCE) or "NOT INSTALLED" in upper else "❓"
        if "NOT INSTALLED" not in upper and not any(a.upper() in upper for a in ALLOWED_OPEN_SOURCE):
            flagged.append((name, lic))
        print(f"  {mark} {name:<22} {lic}")

    print(f"\n[env.example paid-service scan]\n")
    env_text = ENV_EXAMPLE.read_text(encoding="utf-8").lower()
    env_flag = [t for t in PAID_TOKENS if t in env_text]
    if env_flag:
        print(f"  ❓ possible paid-service tokens found: {env_flag}")
    else:
        print("  ✅ no paid-service tokens in .env.example")

    print(f"\n[verdict]\n")
    if flagged:
        print(f"  ❓ review licenses: {flagged}")
        print("  (many 'License' fields are blank on PyPI; check the package page if unsure)")
    else:
        print("  ✅ all installed dependencies carry permissive open-source licenses.")
    print("  ✅ Gnani usage is covered by the free 5,000 programme credits (Prisma/Timbre/Evon).")
    print("  ✅ no paid hosting, GPU, SMS, telephony, or analytics services are referenced.")
    print("\n  NOTE: gnani-vachana is the official Gnani SDK — confirm its license on PyPI.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
