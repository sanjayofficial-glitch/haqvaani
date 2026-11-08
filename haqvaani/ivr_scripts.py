"""
HaqVaani synthetic bank IVR scripts + test utterances — Mode 4 assisted call.

All data is synthetic (DemoBank + simulated IVR) per RULES.md §3.4. No real
phone numbers, bank accounts, UTRs, or recordings. Used by the orchestrator
and frontend for the simulated assisted-call demo.

Brush-off types map to schemas.BrushOffType:
  * WAIT_7_TO_10_DAYS — bank asks customer to wait
  * TELL_ME_UTR — bank asks for UTR again (stall)
  * REQUEST_KYC_OTP — bank asks for KYC/OTP (secret — never share)
  * ESCALATE_AFTER_30_DAYS — bank says escalate after 30 days
  * OTHER — generic / no brush-off
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from .schemas import BrushOffType


class IVRScript(str, Enum):
    """Synthetic IVR menu prompts (DemoBank)."""

    GREETING = "greeting"
    MAIN_MENU = "main_menu"
    COMPLAINT_REGISTERED = "complaint_registered"
    BRUSH_OFF_WAIT = "brush_off_wait"
    BRUSH_OFF_UTR = "brush_off_utr"
    BRUSH_OFF_KYC_OTP = "brush_off_kyc_otp"
    BRUSH_OFF_30_DAYS = "brush_off_30_days"
    DOCKET_READOUT = "docket_readout"
    CLOSING = "closing"


IVR_SCRIPTS: dict[IVRScript, str] = {
    IVRScript.GREETING:
        "Thank you for calling DemoBank customer care. Your call may be recorded for quality purposes.",
    IVRScript.MAIN_MENU:
        "Press one for balance inquiry, press two for transaction dispute, press three for UPI complaints.",
    IVRScript.COMPLAINT_REGISTERED:
        "Thank you for calling DemoBank. Your complaint is registered under SR-DB-884120.",
    IVRScript.BRUSH_OFF_WAIT:
        "Our team will look into this. Please wait seven to ten working days for resolution.",
    IVRScript.BRUSH_OFF_UTR:
        "Could you please share the UTR number again so we can trace the transaction?",
    IVRScript.BRUSH_OFF_KYC_OTP:
        "For verification, please share your KYC details and OTP sent to your registered mobile.",
    IVRScript.BRUSH_OFF_30_DAYS:
        "If the issue is not resolved, you may escalate after thirty days through the RBI ombudsman.",
    IVRScript.DOCKET_READOUT:
        "Your service request ID is SR-DB-884120. Please note this down for tracking.",
    IVRScript.CLOSING:
        "Thank you for calling DemoBank. Have a good day.",
}


@dataclass(frozen=True)
class IVRTestCase:
    """A synthetic assisted-call test case: transcript + expected brush-off + docket."""

    name: str
    transcript: str
    brush_off: BrushOffType
    docket_id: str | None
    verified: bool


IVR_TEST_CASES: tuple[IVRTestCase, ...] = (
    IVRTestCase(
        name="complaint_registered_docket",
        transcript=IVR_SCRIPTS[IVRScript.COMPLAINT_REGISTERED],
        brush_off=BrushOffType.OTHER,
        docket_id="SR-DB-884120",
        verified=True,
    ),
    IVRTestCase(
        name="brush_off_wait_7_to_10_days",
        transcript=(
            "Hello, this is DemoBank support. Your complaint is noted. "
            + IVR_SCRIPTS[IVRScript.BRUSH_OFF_WAIT]
        ),
        brush_off=BrushOffType.WAIT_7_TO_10_DAYS,
        docket_id=None,
        verified=False,
    ),
    IVRTestCase(
        name="brush_off_tell_me_utr",
        transcript=(
            "I can help with that. " + IVR_SCRIPTS[IVRScript.BRUSH_OFF_UTR]
        ),
        brush_off=BrushOffType.TELL_ME_UTR,
        docket_id=None,
        verified=False,
    ),
    IVRTestCase(
        name="brush_off_request_kyc_otp_secret",
        transcript=(
            "Before I proceed, " + IVR_SCRIPTS[IVRScript.BRUSH_OFF_KYC_OTP]
        ),
        brush_off=BrushOffType.REQUEST_KYC_OTP,
        docket_id=None,
        verified=False,
    ),
    IVRTestCase(
        name="brush_off_escalate_after_30_days",
        transcript=(
            IVR_SCRIPTS[IVRScript.BRUSH_OFF_30_DAYS]
        ),
        brush_off=BrushOffType.ESCALATE_AFTER_30_DAYS,
        docket_id=None,
        verified=False,
    ),
    IVRTestCase(
        name="docket_readout_verified",
        transcript=(
            IVR_SCRIPTS[IVRScript.GREETING] + " "
            + IVR_SCRIPTS[IVRScript.DOCKET_READOUT] + " "
            + IVR_SCRIPTS[IVRScript.CLOSING]
        ),
        brush_off=BrushOffType.OTHER,
        docket_id="SR-DB-884120",
        verified=True,
    ),
    IVRTestCase(
        name="no_docket_generic",
        transcript=(
            IVR_SCRIPTS[IVRScript.GREETING] + " "
            + IVR_SCRIPTS[IVRScript.MAIN_MENU] + " "
            + IVR_SCRIPTS[IVRScript.CLOSING]
        ),
        brush_off=BrushOffType.OTHER,
        docket_id=None,
        verified=False,
    ),
)

__all__ = ["IVRScript", "IVR_SCRIPTS", "IVRTestCase", "IVR_TEST_CASES"]
