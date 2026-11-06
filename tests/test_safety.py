"""Safety gate tests — consent, disclosure, redaction, verbatim docket verify."""

import pytest

from haqvaani.safety import (
    SafetyGuardBlock,
    assert_no_forbidden_secret,
    contains_forbidden_secret,
    disclosure_line,
    grant_consent,
    require_consent,
    verify_verbatim_substring,
)
from haqvaani.schemas import ConsentRecord


@pytest.mark.parametrize(
    "text",
    [
        "your OTP is 1234",
        "enter your PIN",
        "My MPIN please",
        "CVV on the back",
        "use the password",
        "oTP",
        "Please share your PASSWORD now",
    ],
)
def test_forbidden_secret_detected(text):
    assert contains_forbidden_secret(text)


@pytest.mark.parametrize(
    "text",
    [
        "the amount was deducted",
        "UTR 629188340112",
        "bank did not credit",
        "complaint number 12345",
    ],
)
def test_clean_text_passes(text):
    assert not contains_forbidden_secret(text)


def test_block_raises():
    with pytest.raises(SafetyGuardBlock):
        assert_no_forbidden_secret("Please share your OTP")


def test_consent_gate_blocks_without_consent():
    with pytest.raises(SafetyGuardBlock):
        require_consent(ConsentRecord())


def test_consent_gate_passes_after_grant():
    c = ConsentRecord()
    grant_consent(c)
    require_consent(c)  # must not raise


def test_disclosure_required_even_with_consent():
    c = ConsentRecord()
    grant_consent(c, disclosure_played=False)
    with pytest.raises(SafetyGuardBlock):
        require_consent(c)


def test_verbatim_substring():
    transcript = "your service request ID is SR-DB-884120, thank you"
    assert verify_verbatim_substring("sr-db-884120", transcript)
    assert verify_verbatim_substring("SR-DB-884120", transcript)
    assert not verify_verbatim_substring("SR-DB-999999", transcript)
    assert not verify_verbatim_substring(None, transcript)
    assert not verify_verbatim_substring("SR-DB-884120", "")


def test_disclosure_line():
    assert disclosure_line("Ramesh") == "This is an AI assistant assisting Ramesh."
