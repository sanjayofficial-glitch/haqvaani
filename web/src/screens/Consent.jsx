/* Step 00 — the DPDP Act 2023 consent gate. Timestamped, both boxes forced,
   the AI-disclosure line readable without sound and spoken on demand.
   Mirrors frontend/screens/consent.html: live mode records consent server-side
   (per X-Haqvaani-Session), demo mode stores an honest local timestamp;
   ?next= is an allowlisted in-app path, everything else → voice intake.      */

import { useState } from "react";
import { api } from "../lib/api.js";
import { useCaseFile, useCaseState } from "../lib/state.jsx";
import { useMode } from "../hooks/useMode.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { useSpeak } from "../hooks/useSpeak.js";
import { useRoute, parseHash, navigate } from "../lib/router.js";
import { AI_DISCLOSURE } from "../lib/demo.js";
import { LangToggle, Pair } from "../lib/i18n.jsx";

/* consent ?next values may only be bare in-app screen names (no paths) */
const NEXT_RE = /^[a-z0-9-]+$/i;

export default function Consent() {
  const { commit } = useCaseFile();
  const st = useCaseState();
  const mode = useMode();
  const toast = useToast();
  const speak = useSpeak();

  /* already consented? keep moving to wherever consent's next points */
  const { params } = useRoute();
  const next = (parseHash ? params.get("next") : null) || "/voice-intake";

  const [cData, setCData] = useState(Boolean(st.consent));
  const [cAi, setCAi] = useState(Boolean(st.consent));
  const [name, setName] = useState((st.consent && st.consent.name) || "");
  const [showDataErr, setShowDataErr] = useState(false);
  const [showAiErr, setShowAiErr] = useState(false);

  const allowNext = NEXT_RE.test(next) ? next : "/voice-intake";
  if (st.consent && st.consent.ts) {
    /* gate already satisfied on re-entry: honour it silently */
  }

  function onDisclose() {
    /* the exact line that precedes any voice capture (RULES.md) */
    speak(AI_DISCLOSURE, "en");
  }

  function onSubmit(e) {
    e.preventDefault();
    setShowDataErr(!cData);
    setShowAiErr(!cAi);
    if (!cData || !cAi) {
      toast("दोनों बॉक्स शर्त हैं · both boxes are required", "bad");
      return;
    }
    const trimmed = name.trim() || "citizen";
    const ts = new Date().toISOString();
    const store = (remoteRec) => {
      commit({
        consent: {
          ts: (remoteRec && (remoteRec.consent_timestamp || remoteRec.ts)) || ts,
          disclosure: true,
          name: trimmed,
          local: !remoteRec,
          disclosureText: AI_DISCLOSURE,
        },
      });
      navigate("#/" + allowNext.replace(/^\//, ""));
    };
    if (mode === "live") {
      api
        .post("/api/consent", { user_name: trimmed })
        .then(store)
        .catch(() => {
          toast("सर्वर सहमति नहीं दर्ज हो पाई : स्थानीय टाइमस्टैम्प ले लिया (demo)", "bad");
          store(null);
        });
    } else {
      store(null);
    }
  }

  return (
    <>
      <div className="head-right" style={{ justifyContent: "flex-end", display: "none" }} aria-hidden="true">
        {/* lang toggle lives in the shell header; keeps DOM tidy */}
        <LangToggle />
      </div>

      <div className="col" style={{ gap: "var(--s-xs)" }}>
        <h1 className="d-lg" lang="hi-IN">माइक से पहले, सहमति आपके समय की।</h1>
        <p className="body mute-2" style={{ maxWidth: "62ch" }}>
          <Pair
            hi="DPDP Act 2023 के तहत, आवाज़ पर प्रक्रिया से पहले आपकी अनुमति पूछी जाती है : और आप कभी भी वापस ले सकते हैं।"
            en="Under the DPDP Act 2023 your permission is asked before your voice is processed : and you can withdraw it any time."
          />
        </p>
      </div>

      <section className="col" style={{ marginTop: "var(--s-md)", gap: "var(--s-sm)" }} aria-label="सहमति">
        <div className="card">
          <p className="h2" style={{ marginBottom: 4 }}>ईमानदारी की सूचना · AI disclosure</p>
          <div className="ai-line">
            <p lang="hi-IN" style={{ margin: "0 0 6px", fontWeight: 600 }}>“यह एआई सहायक आपकी सहायता कर रहा है।”</p>
            <p className="caption mute-2" style={{ margin: 0 }}>
              “{AI_DISCLOSURE}” — यही लाइन कॉल के दौरान सबसे पहले सुनाई जाती है।
            </p>
          </div>
          <p className="caption mute-3">
            <Pair
              hi="यह घोषणा आवाज़ में भी यही शब्द कहती है : माइक शुरू होने से पहले बजती है। हक़-वाणी कभी बैंक को खुद डायल नहीं करता; फ़ोन आपके हाथ में रहता है।"
              en="The same line is spoken out loud before any voice capture. No autonomous dialing : ever."
            />
          </p>
          <div className="row" style={{ marginTop: 14 }}>
            <button type="button" className="btn btn--line" aria-label="घोषणा आवाज़ में सुनें" style={{ minHeight: 56, minWidth: 0, padding: "12px 22px" }} onClick={onDisclose}>
              घोषणा सुनिए · hear the disclosure
            </button>
          </div>
        </div>

        <div className="card">
          <form novalidate onSubmit={onSubmit}>
            <div className="evidence-block check-row">
              <input id="cData" type="checkbox" checked={cData} onChange={(e) => setCData(e.target.checked)} aria-describedby="cDataErr" />
              <label htmlFor="cData" style={{ margin: 0 }}>
                <span lang="hi-IN" style={{ display: "block" }}>
                  मैं सहमत हूँ : बोली और चार सच, केवल इस सत्र के लिए, RBI शिकायत बनाने हेतु प्रसंस्करण होंगे।
                </span>
                <span className="caption mute-3" style={{ display: "block" }}>
                  I consent to processing my voice and the four facts for this session, only to build an RBI complaint. No payment data is carried any further.
                </span>
              </label>
            </div>
            <p className="field-err" id="cDataErr" hidden={!showDataErr}>
              पहला बॉक्स ज़रूरी है · the first box is required
            </p>

            <div className="evidence-block check-row">
              <input id="cAi" type="checkbox" checked={cAi} onChange={(e) => setCAi(e.target.checked)} aria-describedby="cAiErr" />
              <label htmlFor="cAi" style={{ margin: 0 }}>
                <span lang="hi-IN" style={{ display: "block" }}>
                  मैंने प्रकटीकरण पंक्ति पढ़ी/सुनी : कॉल-सहायता “यह एआई सहायक आपकी सहायता कर रहा है” कहकर शुरू होती है।
                </span>
                <span className="caption mute-3" style={{ display: "block" }}>
                  I acknowledge the spoken AI-disclosure line (“{AI_DISCLOSURE}”) goes out before any voice capture.
                </span>
              </label>
            </div>
            <p className="field-err" id="cAiErr" hidden={!showAiErr}>
              दूसरा बॉक्स ज़रूरी है · the second box is required
            </p>

            <div className="evidence-block field">
              <label htmlFor="cName">
                आपका नाम <span className="mute-3">(वैकल्पिक)</span> · your name (optional)
              </label>
              <input
                id="cName"
                type="text"
                maxLength={60}
                autoComplete="off"
                placeholder="citizen"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="hint">
                नाम केवल पत्र के अंत में लगता है : कोई पहचान-तथ्य सुरक्षित नहीं।
                <span className="mute-3"> It only signs the letters : no PII is stored.</span>
              </p>
            </div>

            <div className="evidence-block col" style={{ gap: 14 }}>
              <button className="btn btn--primary" type="submit" aria-label="दोनों सहमतियाँ दें और आगे बढ़ें">
                मंज़ूर : माइक चालू कर दीजिए · I agree : start the mic
              </button>
              <a className="btn btn--line" href="#/start-case">वापस · back</a>
              <p className="caption mute-2" style={{ margin: 0 }}>
                <Pair
                  hi="आप इसे वापस ले सकते हैं : सहमति हटने पर सत्र साफ़ होता है; टाइमस्टैम्प सुरक्षा पैनल में दिखता है।"
                  en="You can withdraw any time : the safety panel shows exactly when you agreed."
                />
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
