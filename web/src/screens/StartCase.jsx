/* Step 00 — pick your dispute type; the pick decides which RBI circular follows
   the case. Mirrors frontend/screens/start-case.html: every pick resets the
   dated facts and any previous mode outputs; the "not sure" card starts as
   upi_p2p and can be changed at fact review. Navigation then goes to the
   consent screen (DPDP gate) with next=voice-intake.                        */

import { useCaseFile } from "../lib/state.jsx";
import { navigate } from "../lib/router.js";
import { Pair } from "../lib/i18n.jsx";

const CARDS = [
  {
    k: "upi_p2p",
    kick: "T+1 rule · RBI/2019-20/67",
    h1: "पैसे कटे, व्यक्ति तक नहीं पहुँचे",
    d: "UPI payment debited, beneficiary never credited. बैंक को अगले कार्य दिवस (T+1) तक सुलझाना है।",
    tat: "upi_p2p : T+1, ₹100/दिन बाद",
  },
  {
    k: "atm_cash_not_dispensed",
    kick: "T+5 rule · RBI/2019-20/67",
    h1: "ATM कैश नहीं निकला, हिसाब से कट गया",
    d: "ATM dispensed nothing yet the debit sits. समय-सीमा 5 कार्य दिवस (T+5)।",
    tat: "atm_cash_not_dispensed : T+5",
  },
  {
    k: "unauthorised",
    kick: "zero liability · शून्य देयता",
    h1: "जो मैंने नहीं किया, वह कटा (धोखा)",
    d: "A debit you never authorised. अगर 3 वर्किंग दिन में रिपोर्ट करें तो देयता शून्य रहती है।",
    tat: "unauthorised : report ≤ 3 working days",
  },
  {
    k: "upi_p2p",
    unsure: true,
    kick: "not sure · यक़ीन नहीं",
    h1: "कारण का पता नहीं : बस पैसे कटे",
    d: "Just start talking : आवाज़ में पहचान लेंगे; समीक्षा में आप सच बदल भी सकते हैं।",
    tat: "starts as upi_p2p : change at fact review",
  },
];

export default function StartCase() {
  const { commit } = useCaseFile();

  const pick = (dispute, unsure) => (e) => {
    e.preventDefault();
    /* a new case resets every dated stage output (old contract) */
    commit({
      disputeType: dispute,
      unsure: unsure ? true : null,
      intake: null,
      suggestedIntake: null,
      entitlement: null,
      draft: null,
      call: null,
      docket: null,
      factsEdited: null,
      rawTranscript: null,
      draftChecklist: null,
      secretFlaggedThisScreen: null,
    });
    navigate("#/consent?next=voice-intake");
  };

  return (
    <>
      <div className="screen-ghost" aria-hidden="true">₹</div>
      <div className="col" style={{ gap: "var(--s-xs)" }}>
        <h1 className="d-lg" lang="hi-IN">आपकी शिकायत किस तरह की है?</h1>
        <p className="body mute-2" style={{ maxWidth: "62ch" }}>
          <Pair
            hi="एक चुनाव तय करता है कि कौन-सा RBI परिपत्र लागू होगा : समीक्षा पर बदला जा सकता है।"
            en="One pick decides which RBI circular applies : you can change it later at fact review."
          />
        </p>
      </div>

      <section className="case-cards" style={{ marginTop: "var(--s-md)" }} aria-label="शिकायत प्रकार">
        {CARDS.map((c) => (
          <a
            key={c.kick}
            className="case-card"
            href="#/consent?next=voice-intake"
            data-dispute={c.k}
            data-unsure={c.unsure ? "true" : undefined}
            onClick={pick(c.k, c.unsure)}
          >
            <span className="kick">{c.kick}</span>
            <h2 lang="hi-IN">{c.h1}</h2>
            <p className="d"><Pair hi={c.d} en={c.d} /></p>
            <p className="tat num" aria-hidden="true">{c.tat}</p>
          </a>
        ))}
      </section>

      <section style={{ marginTop: "var(--s-lg)" }} aria-label="एक नोट">
        <p className="caption mute-3" style={{ maxWidth: "60ch" }}>
          <Pair
            hi="आगे माइक चालू होगा : उससे पहले सहमति स्क्रीन आएगी (DPDP Act 2023)। सब कुछ इसी सत्र तक रहता है।"
            en="Consent comes first (DPDP Act 2023), then the mic. Nothing is stored beyond this session."
          />
        </p>
      </section>
    </>
  );
}
