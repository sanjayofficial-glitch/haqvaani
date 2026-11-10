"""
HaqVaani LLM client — Gnani Evon v3.3 over HTTP.

Implements the documented wire contract (docs/gnani_api/api-reference-cheatsheet.md):

  * POST https://api.vachana.ai/api/v1/llm/chat with X-API-Key-ID auth.
  * JSON body {model, messages, temperature, max_tokens}.
  * Returns structured JSON matching Evon's short intake / negotiation schemas.

Two entry points:
  * parse_intake(transcript) -> EvonIntakeResult  (Mode 1: citizen complaint facts)
  * extract_negotiation(transcript) -> EvonNegotiationResult  (Mode 4: brush-off + docket)

Live calls only when GNANI_API_KEY + GNANI_LLM_URL are configured; otherwise every
method falls back to deterministic regex extraction (offline mode, real transcription
still required upstream — no canned demo data is invented).

Owned by Engineer B (schema expectations). Never dials anything; pure client.
Env: GNANI_API_KEY, GNANI_LLM_URL, EVON_MODEL, EVON_TEMPERATURE, EVON_MAX_TOKENS.
"""

from __future__ import annotations

import json
import logging
import os
import re
from dataclasses import dataclass, field
from datetime import date

from . import dsp_audio
from .schemas import (
    AgentNegotiationExtraction,
    BrushOffType,
    CitizenIntake,
    DisputeType,
)

logger = logging.getLogger("haqvaani.evon_client")

DEFAULT_LLM_URL = "https://api.vachana.ai/api/v1/llm/chat"
DEFAULT_MODEL = "evon-v3.3"

_MONTHS = {m: i + 1 for i, m in enumerate(
    "jan feb mar apr may jun jul aug sep oct nov dec".split()
)}


@dataclass(frozen=True)
class EvonIntakeResult:
    """Outcome of an Evon intake parse."""

    intake: CitizenIntake
    raw_response: str = ""
    latency_ms: int = 0
    errors: tuple[str, ...] = field(default_factory=tuple)

    @property
    def ok(self) -> bool:
        return self.intake is not None and not self.errors


@dataclass(frozen=True)
class EvonNegotiationResult:
    """Outcome of an Evon negotiation extraction."""

    negotiation: AgentNegotiationExtraction
    raw_response: str = ""
    latency_ms: int = 0
    errors: tuple[str, ...] = field(default_factory=tuple)

    @property
    def ok(self) -> bool:
        return self.negotiation is not None and not self.errors


def available() -> bool:
    """True when a live call can be attempted (key + LLM URL configured)."""
    return bool(os.getenv("GNANI_API_KEY") and os.getenv("GNANI_LLM_URL"))


# ---------------------------------------------------------------- live client ---


def _llm_chat(
    messages: list[dict],
    *,
    model: str | None = None,
    temperature: float | str | None = None,
    max_tokens: int | str | None = None,
    api_key: str | None = None,
    url: str | None = None,
    timeout: float = 15.0,
) -> tuple[str, tuple[str, ...]]:
    """Single chat completion; returns (content, errors)."""
    import httpx  # optional dep — live path only

    model = model or os.getenv("EVON_MODEL", DEFAULT_MODEL)
    temperature = float(temperature if temperature is not None else os.getenv("EVON_TEMPERATURE", "0"))
    max_tokens = int(max_tokens if max_tokens is not None else os.getenv("EVON_MAX_TOKENS", "120"))
    headers = {
        "X-API-Key-ID": api_key or os.getenv("GNANI_API_KEY", ""),
        "Content-Type": "application/json",
    }
    sse_url = url or os.getenv("GNANI_LLM_URL", "") or DEFAULT_LLM_URL
    errors: list[str] = []

    try:
        with httpx.stream("POST", sse_url, json={
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }, headers=headers, timeout=timeout) as r:
            if r.status_code >= 400:
                body = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
                msg = body.get("message") or body.get("detail") or f"HTTP {r.status_code}"
                errors.append(str(msg))
                return "", tuple(errors)
            content = ""
            for line in r.iter_lines():
                if line is None:
                    continue
                line = line.strip()
                if not line or not line.startswith("data:"):
                    continue
                data = line[len("data:"):].strip()
                if data == "[DONE]":
                    break
                try:
                    obj = json.loads(data)
                except json.JSONDecodeError:
                    continue
                delta = obj.get("choices", [{}])[0].get("delta", {}) if isinstance(obj, dict) else {}
                piece = delta.get("content") or obj.get("content") or ""
                content += piece
    except Exception as exc:  # noqa: BLE001
        errors.append(str(exc))
        return "", tuple(errors)

    return content, tuple(errors)


# ---------------------------------------------------------------- intake --------


def parse_intake(transcript: str) -> EvonIntakeResult:
    """Extract CitizenIntake from a spoken complaint transcript.

    Live: Evon v3.3 JSON extraction. Offline: deterministic regex fallback
    (same transcript always yields the same intake).
    """
    import time

    start = time.perf_counter()
    url = os.getenv("GNANI_LLM_URL", "")

    if available() and url:
        try:
            content, errors = _llm_chat([
                {"role": "system", "content": (
                    "Extract complaint facts as JSON only: "
                    "{utr,amount_inr,txn_date,dispute_type,bank_name,language,confidence}. "
                    "dispute_type ∈ upi_p2p|imps|upi_p2m|atm_cash_not_dispensed|"
                    "pos_card_debit|unauthorised. txn_date ISO yyyy-mm-dd."
                )},
                {"role": "user", "content": transcript},
            ])
            if content:
                raw = json.loads(content) if isinstance(content, str) else content
                raw["raw_transcript"] = transcript
                intake = CitizenIntake.model_validate(raw)
                return EvonIntakeResult(
                    intake=intake, raw_response=content,
                    latency_ms=int((time.perf_counter() - start) * 1000),
                )
        except Exception as exc:  # noqa: BLE001
            logger.warning("Evon intake live attempt failed → regex fallback: %s", exc)

    return EvonIntakeResult(
        intake=_deterministic_intake(transcript),
        latency_ms=int((time.perf_counter() - start) * 1000),
    )


def _deterministic_intake(transcript: str) -> CitizenIntake:
    """No-LLM extraction from the actual transcript.

    Only facts that are actually present in the words are filled; everything
    else stays None so the citizen completes it (never demo constants).
    """
    found = 0.0

    # UTR / transaction reference: bare 12-digit runs, or prefixed runs.
    utr_m = re.search(r"\b(\d{12})\b", transcript)
    if not utr_m:
        utr_m = re.search(r"\butr\s*[:=\-]?\s*(\d{10,24})", transcript, flags=re.IGNORECASE)
    utr = utr_m.group(1) if utr_m else None
    if utr:
        found += 1.0

    # Amount: explicit currency or next to rupaye/rupees/₹ wording.
    amt_m = re.search(
        r"(?:₹|Rs\.?)\s*([0-9][0-9,]*(?:\.\d+)?)|"
        r"([0-9][0-9,]*(?:\.\d+)?)\s*(?:rupaye|rupees|रुपये|रुपए)",
        transcript,
        flags=re.IGNORECASE,
    )
    amount = None
    if amt_m:
        raw = (amt_m.group(1) or amt_m.group(2)).replace(",", "")
        try:
            amount = float(raw)
        except ValueError:
            amount = None
    if amount is None:
        # fallback: the only plausible money-sized number (not a year/date part)
        nums = [float(m.group(0).replace(",", ""))
                for m in re.finditer(r"\b([0-9][0-9,]*(?:\.\d+)?)\b", transcript)
                if m.group(0).replace(",", "").replace(".", "").isdigit()]
        plausible = [n for n in nums if 100 <= n <= 10_000_000]
        if len(plausible) == 1:
            amount = plausible[0]
    if amount is not None:
        found += 1.0

    # Date: "18 oct" month-name form, or numeric d/m/y (Indian) and ISO forms.
    txn_date = None
    month_m = re.search(
        r"\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)",
        transcript,
        flags=re.IGNORECASE,
    )
    if month_m:
        day = int(month_m.group(1))
        month = _MONTHS[month_m.group(2).lower()]
        try:
            txn_date = date(2026, month, min(day, 28))
        except ValueError:
            txn_date = None
    if txn_date is None:
        num_m = re.search(r"\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})\b", transcript)
        if num_m:
            d, m, y = int(num_m.group(1)), int(num_m.group(2)), int(num_m.group(3))
            if y < 100:
                y += 2000
            try:
                txn_date = date(y, m, d)
            except ValueError:
                txn_date = None
    if txn_date is None:
        iso_m = re.search(r"\b(\d{4})-(\d{2})-(\d{2})\b", transcript)
        if iso_m:
            try:
                txn_date = date(*map(int, iso_m.groups()))
            except ValueError:
                txn_date = None
    if txn_date is not None:
        found += 1.0

    # Dispute type: only "upi_p2p" is safely inferable from wording today.
    dispute_type = DisputeType.UPI_P2P if re.search(r"upi", transcript, flags=re.IGNORECASE) else None
    if dispute_type is not None:
        found += 1.0

    confidence = round(found / 4.0, 2)
    return CitizenIntake(
        utr=utr,
        amount_inr=amount,
        txn_date=txn_date,
        dispute_type=dispute_type,
        bank_name=None,
        language="hi-IN",
        confidence=confidence,
        raw_transcript=transcript,
    )


# ------------------------------------------------------------- negotiation ---


_BRUSH_KEYWORDS: dict[BrushOffType, tuple[str, ...]] = {
    BrushOffType.WAIT_7_TO_10_DAYS: ("7 to 10", "seven to ten"),
    BrushOffType.TELL_ME_UTR: ("utr", "tell"),
    BrushOffType.REQUEST_KYC_OTP: ("otp", "kyc"),
    BrushOffType.ESCALATE_AFTER_30_DAYS: ("30", "day"),
}


def extract_negotiation(ivr_transcript: str) -> EvonNegotiationResult:
    """Extract brush-off type + docket candidate from an IVR/call transcript.

    Live: Evon v3.3 JSON extraction. Offline: deterministic keyword + regex fallback.
    Verbatim docket verification is performed by the caller (safety.verify_verbatim_substring).
    """
    import time

    start = time.perf_counter()
    url = os.getenv("GNANI_LLM_URL", "")

    if available() and url:
        try:
            content, errors = _llm_chat([
                {"role": "system", "content": (
                    "Extract bank-agent negotiation from transcript as JSON only: "
                    "{brush_off_type,docket_id_candidate,suggested_script_en,suggested_script_hi}. "
                    "brush_off_type ∈ wait_7_to_10_days|tell_me_utr|request_kyc_otp|escalate_after_30_days|other."
                )},
                {"role": "user", "content": ivr_transcript},
            ])
            if content:
                raw = json.loads(content) if isinstance(content, str) else content
                neg = AgentNegotiationExtraction(
                    brush_off_type=(
                        BrushOffType(raw["brush_off_type"])
                        if raw.get("brush_off_type") else BrushOffType.OTHER
                    ),
                    docket_id_candidate=raw.get("docket_id_candidate"),
                    suggested_script_en=raw.get("suggested_script_en"),
                    suggested_script_hi=raw.get("suggested_script_hi"),
                    transcript_segment=ivr_transcript[:400],
                )
                return EvonNegotiationResult(
                    negotiation=neg, raw_response=content,
                    latency_ms=int((time.perf_counter() - start) * 1000),
                )
        except Exception as exc:  # noqa: BLE001
            logger.warning("Evon negotiation live attempt failed → regex fallback: %s", exc)

    return EvonNegotiationResult(
        negotiation=_deterministic_negotiation(ivr_transcript),
        latency_ms=int((time.perf_counter() - start) * 1000),
    )


def _deterministic_negotiation(ivr_transcript: str) -> AgentNegotiationExtraction:
    """Keyword + regex fallback for brush-off + docket extraction."""
    docket_m = re.search(r"\bSR-[A-Z0-9-]{4,}\b", ivr_transcript)
    low = ivr_transcript.lower()
    brush = BrushOffType.OTHER
    for btype, kws in _BRUSH_KEYWORDS.items():
        if all(kw in low for kw in kws):
            brush = btype
            break
    return AgentNegotiationExtraction(
        brush_off_type=brush,
        docket_id_candidate=docket_m.group(0) if docket_m else None,
        suggested_script_en=(
            '"Under RBI/2019-20/67, the applicable timeline has passed. '
            'Please register my complaint and provide the service request number."'
        ),
        suggested_script_hi=(
            '"आरबीआई/2019-20/67 के तहत, लागू समय-सीमा गुज़र चुकी है। कृपया मेरी '
            'शिकायत दर्ज करें और सर्विस रिक्वेस्ट नंबर दें।"'
        ),
        transcript_segment=ivr_transcript[:400],
    )


if __name__ == "__main__":  # pragma: no cover — `python -m haqvaani.evon_client`
    import sys
    print("evon_client — Evon v3.3 LLM contract module")
    print("  live available:", available())
    sys.exit(1 if not available() else 0)
