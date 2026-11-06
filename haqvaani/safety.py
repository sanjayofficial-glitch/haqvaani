"""
HaqVaani safety gates — consent (DPDP Act 2023), disclosure (TRAI), hard secret
redaction, and verbatim docket verification. Non-negotiable guards from RULES.md.

Used in every mode. Never remove or weaken these gates.
"""

from __future__ import annotations

import re
from datetime import datetime

from .schemas import ConsentRecord

# Hard block on outbound TTS/text (RULES.md §3.2) — case-insensitive.
FORBIDDEN_SECRET_RE = re.compile(
    r"\b(?:otp|pin|mpin|cvv|password)\b",
    flags=re.IGNORECASE,
)

DISCLOSURE_TEMPLATE = "This is an AI assistant assisting {user_name}."


class SafetyGuardBlock(Exception):
    """Raised when a mandatory safety gate fails. Never silently bypassed."""

    def __init__(self, reason: str, *, code: str = "SAFETY_GUARD_BLOCK") -> None:
        super().__init__(reason)
        self.reason = reason
        self.code = code


def contains_forbidden_secret(text: str) -> bool:
    """True if text contains OTP/PIN/MPIN/CVV/password (any case)."""
    return bool(FORBIDDEN_SECRET_RE.search(text))


def assert_no_forbidden_secret(text: str) -> None:
    """Raise SafetyGuardBlock if outbound text carries a forbidden secret."""
    if contains_forbidden_secret(text):
        raise SafetyGuardBlock(
            "Outbound text contains a forbidden secret (OTP/PIN/MPIN/CVV/password).",
            code="FORBIDDEN_SECRET",
        )


def disclosure_line(user_name: str) -> str:
    """TRAI-mandated AI disclosure line (RULES.md §2.2)."""
    return DISCLOSURE_TEMPLATE.format(user_name=user_name)


def grant_consent(
    consent: ConsentRecord, *, disclosure_played: bool = True
) -> ConsentRecord:
    """Record timestamped, informed consent (DPDP Act 2023)."""
    now = datetime.now()
    consent.citizen_consent_verified = True
    consent.consent_timestamp = now
    consent.ai_disclosure_played = disclosure_played
    if disclosure_played:
        consent.disclosure_timestamp = now
        consent.disclosure_text = disclosure_line("citizen")
    return consent


def require_consent(consent: ConsentRecord) -> ConsentRecord:
    """Hard gate: raise unless consent AND disclosure are verified and timestamped."""
    if not consent.citizen_consent_verified or consent.consent_timestamp is None:
        raise SafetyGuardBlock("Citizen consent not verified.", code="CONSENT_REQUIRED")
    if not consent.ai_disclosure_played or consent.disclosure_timestamp is None:
        raise SafetyGuardBlock("AI disclosure not played.", code="DISCLOSURE_REQUIRED")
    return consent


def verify_verbatim_substring(candidate: str | None, transcript: str) -> bool:
    """RB-IOS 2026 Clause 3: docket must be an exact case-insensitive substring."""
    if not candidate or not transcript:
        return False
    return candidate.strip().lower() in transcript.lower()
