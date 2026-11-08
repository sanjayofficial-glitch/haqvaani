/* Step 00 — pick your dispute type; the pick decides which RBI circular follows
   the case. Mirrors frontend/screens/start-case.html: every pick resets the
   dated facts and any previous mode outputs; the "not sure" card starts as
   upi_p2p and can be changed at fact review. Navigation then goes to the
   consent screen (DPDP gate) with next=voice-intake.

   Accessibility contract (updated):
   - each card leads with a pictorial scene (screens/art/DisputeArt.jsx, same
     hand-drawn vector convention as the landing art) so the dispute type is
     recognisable WITHOUT reading; copy is trimmed to one short line + the
     mono deadline footer;
   - the four cards are a real choice group (ul > li > a, labelled section);
   - the statutory readout (.tat) is VISIBLE text, not aria-hidden — SR users
     keep the T+1/T+5 deadline and the ₹100/day compensation;
   - hover and keyboard-focus carry the same affordance (accent border + wash
     + sliding arrow), the press feedback is transform-only;
   - small copy sits at --ink-2 (≈5.9:1) to hold WCAG AA on white.           */

import { useCaseFile } from "../lib/state.jsx";
import { navigate } from "../lib/router.js";
import { Pair } from "../lib/i18n.jsx";
import { UPIArt, AtmArt, FraudArt, UnsureArt } from "./art/DisputeArt.jsx";
import { Arrow } from "../components/Icon.jsx";

const CARDS = [
  {
    k: "upi_p2p",
    Art: UPIArt,
    kick: "T+1 rule · RBI/2019-20/67",
    h1: "पैसे कटे, व्यक्ति तक नहीं पहुँचे",
    dHi: "पैसे कटे : दूसरे को नहीं पहुँचे।",
    dEn: "Pay went out : it never reached them.",
    tatHi: "समय-सीमा : T+1 कार्य दिवस · बाद में ₹100/दिन",
    tatEn: "deadline T+1 working day · ₹100/day after",
  },
  {
    k: "atm_cash_not_dispensed",
    Art: AtmArt,
    kick: "T+5 rule · RBI/2019-20/67",
    h1: "ATM कैश नहीं निकला, हिसाब से कट गया",
    dHi: "ATM से कैश नहीं निकला : पैसे कट गए।",
    dEn: "No cash from the ATM : the money was still debited.",
    tatHi: "समय-सीमा : T+5 कार्य दिवस",
    tatEn: "deadline T+5 working days",
  },
  {
    k: "unauthorised",
    Art: FraudArt,
    tone: "accent",
    kick: "zero liability · शून्य देयता",
    h1: "जो मैंने नहीं किया, वह कटा (धोखा)",
    dHi: "आपने जो नहीं किया, वही कट गया।",
    dEn: "A debit you never made.",
    tatHi: "रिपोर्ट ≤ 3 वर्किंग दिन · देयता शून्य",
    tatEn: "report ≤ 3 working days · zero liability",
  },
  {
    k: "upi_p2p",
    Art: UnsureArt,
    unsure: true,
    kick: "not sure · यक़ीन नहीं",
    h1: "कारण का पता नहीं : बस पैसे कटे",
    dHi: "बस बोलिए : हम सुनकर तय कर देंगे।",
    dEn: "Just talk : listening will decide the type.",
    tatHi: "शुरुआत upi_p2p से · बाद में बदला जा सकता है",
    tatEn: "starts as upi_p2p · changeable later",
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
        <h1 className="d-lg" lang="hi">आपकी शिकायत किस तरह की है?</h1>
        <p className="body mute-2" style={{ maxWidth: "62ch" }}>
          <Pair
            hi="एक चुनाव तय करता है कि कौन-सा RBI परिपत्र लागू होगा : समीक्षा पर बदला जा सकता है।"
            en="One pick decides which RBI circular applies : you can change it later at fact review."
          />
        </p>
      </div>

      <section style={{ marginTop: "var(--s-md)" }} aria-label="शिकायत प्रकार · dispute type">
        <ul className="case-cards" role="list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {CARDS.map((c) => (
            <li key={c.kick}>
              <a
                className={`case-card${c.unsure ? " case-card--unsure" : ""}`}
                href="#/consent?next=voice-intake"
                data-dispute={c.k}
                data-unsure={c.unsure ? "true" : undefined}
                onClick={pick(c.k, c.unsure)}
              >
                <div className="art" aria-hidden="true">
                  <c.Art />
                </div>
                <span className={`kick${c.tone === "accent" ? " tone-accent" : ""}`}>{c.kick}</span>
                <h2 lang="hi">{c.h1}</h2>
                <p className="d">
                  <Pair hi={c.dHi} en={c.dEn} />
                </p>
                <p className="tat num">
                  <Pair hi={c.tatHi} en={c.tatEn} />
                  <Arrow size={12} />
                </p>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: "var(--s-lg)" }} aria-label="एक नोट · a note">
        <p className="caption mute-2" style={{ maxWidth: "60ch" }}>
          <Pair
            hi="आगे माइक चालू होगा : उससे पहले सहमति स्क्रीन आएगी (DPDP Act 2023)। सब कुछ इसी सत्र तक रहता है।"
            en="Consent comes first (DPDP Act 2023), then the mic. Nothing is stored beyond this session."
          />
        </p>
      </section>
    </>
  );
}
