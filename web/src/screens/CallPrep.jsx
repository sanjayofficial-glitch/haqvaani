/* Step 02b — the counter-script for the call you make yourself.
   Mirrors frontend/screens/call-prep.html: the say-this lines are narrative
   formatting only (numbers come from the Python calc in state.entitlement),
   spoken aloud via Timbre TTS with a browser fallback — and the phone is
   always the citizen's, the whisper is ours.                              */

import { useSpeak } from "../hooks/useSpeak.js";
import { useCaseFile } from "../lib/state.jsx";
import { DEMO } from "../lib/demo.js";
import { WhisperArt } from "../components/Svg.jsx";

export default function CallPrep() {
  const speak = useSpeak();
  const { state } = useCaseFile();
  const ent = state.entitlement || DEMO.entitlement;
  const intake = state.intake || DEMO.intake;

  /* the counter-script is narrative formatting of Python-computed values;
     numbers here are only ever read from state.entitlement / demo canned */
  const overdue = (ent.days_overdue || 0) > 0;
  const circ = ent.circular_ref || "RBI/2019-20/67";
  const tat = ent.tat_date;

  const sayHi = overdue
    ? "मैं " + (intake.bank_name || "अपने बैंक") + " से बात कर रहा/रही हूँ। " + tat + " को TAT पूरी हो चुकी थी और आज तक वापसी नहीं हुई। " + circ + " के अनुसार ₹100 प्रति दिन क्षतिपूर्ति मेरा सांविधिक हक़ है। कृपया मेरी शिकायत दर्ज करें और सर्विस रिक्वेस्ट / डॉकेट नंबर तुरंत दें : मैं लिख रहा/रही हूँ।"
    : "मेरी राशि अभी तक वापस नहीं आई है। TAT (" + tat + ") निकट है : कृपया अभी शिकायत दर्ज करें और डॉकेट नंबर दें, ताकि सांविधिक समय से पहले रिपोर्ट दर्ज रहे।";

  const sayEn = overdue
    ? "I have a failed transaction beyond the statutory TAT of " + tat + ". Under " + circ +
      " I am owed the refund plus ₹100 per day as statutory compensation. Please register my complaint now and give me the service request number : I will note it down."
    : "I want to pre-empt the TAT of " + tat + ". Please register my complaint today and give me the service request number for tracking.";

  return (
    <>
      <div className="col" style={{ gap: "var(--s-xs)" }}>
        <h1 className="d-lg" lang="hi-IN">फ़ोन आपके हाथ में, फ़ुसफ़ुसाहट हमारी।</h1>
        <p className="body mute-2" style={{ maxWidth: "62ch" }}>
          आप ख़ुद बैंक को कॉल करते हैं; हक़-वाणी सुनता है, क्या बोलना है दिखाता है, और डॉकेट नंबर नोट करता है।
          <span className="pair"><span className="alt" lang="en-IN">You dial the bank; HaqVaani listens, shows what to say, and writes down the docket number.</span></span>
        </p>
      </div>

      <section className="col" style={{ marginTop: "var(--s-md)", gap: "var(--s-md)" }} aria-label="कॉल की तैयारी">
        {/* you ↔ bank : the one move; the citizen dials, the assistant listens */}
        <div className="card" style={{ alignItems: "center" }}>
          <WhisperArt />
          <p className="xsmall mute-3" style={{ marginTop: 8, maxWidth: "72ch" }}>
            हक़-वाणी बीच में बैठता है : बाहरी लाइन पर कुछ भी नहीं भेजता · everything stays on your side of the call · <span className="tag">Simulated IVR / synthetic demo</span>
          </p>
        </div>

        {/* what to say when you're through */}
        <div className="scriptcard">
          <p className="xsmall mute-3" style={{ marginBottom: 12 }}>
            जुड़ते ही यह बोलिए · say this when the agent joins — क्रम से
          </p>
          <p className="say" lang="hi-IN">{sayHi}</p>
          <p className="say mute-2" style={{ marginTop: 10 }}>{sayEn}</p>
          <div className="row" style={{ marginTop: 18 }}>
            <button className="btn btn--line" type="button" aria-label="हिन्दी में बोली सुनें" onClick={() => speak(sayHi, "hi")}>
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.5 8.5a4 4 0 0 1 0 7" /></svg>
              सुनिए · hear it
            </button>
          </div>
        </div>

        {/* the bank's favourite requests : refuse freely */}
        <div className="card">
          <p className="h3" style={{ margin: "0 0 10px" }}>कभी न देना · never share</p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            <li className="you-bank"><span className="n" aria-hidden="true"></span><span>otp <span className="mute-3">(one-time password)</span></span></li>
            <li className="you-bank"><span className="n" aria-hidden="true"></span><span>pin · mpin</span></li>
            <li className="you-bank"><span className="n" aria-hidden="true"></span><span>cvv <span className="mute-3">(back of card)</span></span></li>
            <li className="you-bank"><span className="n" aria-hidden="true"></span><span lang="hi-IN">लोगिन पासवर्ड <span className="mute-3">banking password</span></span></li>
          </ul>
          <p className="xsmall mute-3" style={{ marginTop: 12 }}>
            ये बैंक ने कभी नहीं माँगा होता : जो भी पूछे, फ़ोन रख दीजिए।
            <span className="pair"><span className="alt" lang="en-IN">Even the bank never asks these : refuse and hang up.</span></span>
          </p>
        </div>
      </section>

      <div className="row" style={{ marginTop: "var(--s-md)" }}>
        <a className="btn btn--primary" href="#/assisted-call">
          कॉल शुरू करें : सुनना चालू करें · open assisted call
          <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
        </a>
        <a className="btn btn--line" href="#/complaint-builder">
          ड्राफ्ट पर वापस <span className="pair"><span className="alt" lang="en-IN">back to drafts</span></span>
        </a>
      </div>
    </>
  );
}
