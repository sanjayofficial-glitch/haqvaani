/* Step 02 — three drafts, one approval.
   Mirrors frontend/screens/complaint-builder.html: drafts come from
   /api/complaint (EN + hindi_drafts) or the synthetic worked example;
   edits are kept per language:channel key, the secret pre-check mirrors
   the server rule (an OTP/PIN word never leaves), and the approve gate
   is checkbox + clean text + non-empty. Evidence ticks stay in state.    */

import { useEffect, useRef, useState } from "react";
import { useMode } from "../hooks/useMode.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { useLang } from "../lib/i18n.jsx";
import { useCaseFile } from "../lib/state.jsx";
import { api } from "../lib/api.js";
import { DEMO, AI_DISCLOSURE } from "../lib/demo.js";
import { SECRET_RE, fmtInr } from "../lib/format.js";
import { navigate } from "../lib/router.js";

const CHANNELS = ["bank", "whatsapp", "email"];
const FIELD = { bank: "bank_complaint_text", whatsapp: "whatsapp_draft", email: "email_draft" };
const CH_LABEL = { bank: "बैंक पत्र", whatsapp: "व्हाट्सएप", email: "ईमेल" };
const CH_EN = { bank: "bank letter", whatsapp: "WhatsApp", email: "email" };

export default function ComplaintBuilder() {
  const { state, commit } = useCaseFile();
  const mode = useMode();
  const toast = useToast();
  const { lang } = useLang();

  const intake = state.intake || DEMO.intake;
  const entitlement = state.entitlement || DEMO.entitlement;

  /* the draft fetch is one-shot (StrictMode double effect) */
  const builtRef = useRef(false);
  const [drafts, setDrafts] = useState({ en: null, hi: null });
  const [meta, setMeta] = useState(null); /* { demo: bool } — source honesty */

  const [channel, setChannel] = useState(
    (state.draft && state.draft.channel) || "bank"
  );
  const [texts, setTexts] = useState({}); /* user edits keyed "en:bank" */
  const [evList, setEvList] = useState([]); /* from drafts.en.evidence_checklist */
  const [checks, setChecks] = useState(state.draftChecklist || []);
  const [approved, setApproved] = useState(Boolean(state.draft && state.draft.approved));

  /* one-time secretsBlocked bump per screen visit (flaggedRef) */
  const baselineRef = useRef(state.secretsBlocked || 0);
  const flaggedRef = useRef(false);
  const [blocked, setBlocked] = useState(state.secretsBlocked || 0);

  const key = lang + ":" + channel;
  const ready = Boolean(drafts[lang]);
  const text = (ready && (texts[key] != null ? texts[key] : drafts[lang][FIELD[channel]])) || "";

  /* -------------------------------------------------- drafts fetch ----- */
  useEffect(() => {
    if (builtRef.current) return;
    builtRef.current = true;
    const demo = () => {
      setDrafts({ en: DEMO.draft, hi: DEMO.hindiDrafts });
      setMeta({ demo: true });
    };
    if (mode === "live") {
      api
        .post("/api/complaint", { intake, entitlement })
        .then((d) => {
          setDrafts({ en: d, hi: d.hindi_drafts || DEMO.hindiDrafts }); /* api returns EN drafts + hindi_drafts */
          setMeta({ demo: false });
        })
        .catch(() => {
          toast("API नहीं मिला : सैंपल ड्राफ्ट दिखे (synthetic demo)", "bad");
          demo();
        });
    } else {
      demo();
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [mode]);

  /* evidence list rides the EN drafts (labels stay API-furnished) */
  useEffect(() => {
    setEvList((drafts.en && drafts.en.evidence_checklist) || []);
  }, [drafts.en]);

  /* -------------------------------------------------- secret pre-check -- */
  /* the UI never crafts outbound secrets: same rule the server enforces */
  const secretHit = SECRET_RE.test(text || "");

  function onEdit(v) {
    setTexts((t) => ({ ...t, [key]: v }));
    if (SECRET_RE.test(v) && !flaggedRef.current) {
      flaggedRef.current = true;
      const n = baselineRef.current + 1;
      commit({ secretsBlocked: n });
      baselineRef.current = n;
      setBlocked(n);
    }
  }

  function restore() {
    setTexts((t) => {
      const n = { ...t };
      delete n[key];
      return n;
    });
    toast("मूल ड्राफ्ट लौट आया · original restored");
  }

  /* ---------------------------------------------------- approve gate --- */
  const notEmpty = (text || "").trim() !== "";
  const ok = approved && !secretHit && notEmpty && ready;

  function goPrep() {
    if (!approved || secretHit) {
      toast(approved ? "लाल शब्द पहले हटाइए · remove the flagged word first" : "पहले मंजूरी का टिक लगाइए · approve first", "bad");
      return;
    }
    commit({
      draft: {
        text,
        channel,
        lang,
        approved: true,
        evidence_checklist: (drafts.en && drafts.en.evidence_checklist) || [],
      },
    });
    navigate("#/call-prep");
  }

  /* list wording switches with the saved drafts, labels below stay simple */
  return (
    <>
      <div className="col" style={{ gap: "var(--s-xs)" }}>
        <h1 className="d-lg" lang="hi-IN">आपकी शिकायत : पढ़कर, बदल भी सकते हैं।</h1>
        <p className="body mute-2" style={{ maxWidth: "62ch" }}>
          {AI_DISCLOSURE} तीन ड्राफ़्ट आपके सचों और RBI संदर्भ से — एक को पढ़कर मंजूरी दीजिए।
          <span className="pair"><span className="alt" lang="en-IN">Three ready drafts from your facts; read, edit, approve the one you will send.</span></span>
        </p>
      </div>

      <section className="col" style={{ marginTop: "var(--s-md)", gap: "var(--s-md)" }} aria-label="शिकायत ड्राफ्ट">
        {/* source honesty strip */}
        <div className="state-strip is-demo">
          <p className="xsmall" style={{ margin: 0 }}>
            {!meta || meta.demo ? (
              <><b>सैंपल केस के ड्राफ्ट : synthetic demo</b> · letter text mirrors the demo worked example; with the API running these are built from your facts</>
            ) : (
              <><b>API से बने ड्राफ्ट</b> : आपके सच + RBI संदर्भ <span className="mono">{entitlement.circular_ref || "…"}</span></>
            )}
          </p>
        </div>

        {/* channel tabs + restore */}
        <div className="card">
          <div className="row segrow">
            <div className="seg" role="tablist" aria-label="शिकायत चैनल">
              {CHANNELS.map((c) => (
                <button key={c} type="button" role="tab" aria-selected={c === channel}
                  className="chip chip-toggle" aria-pressed={c === channel}
                  onClick={() => setChannel(c)}>
                  {CH_LABEL[c]}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn--line" onClick={restore} aria-label="मूल ड्राफ्ट लौटाएँ">
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><polyline points="3 3 3 8 8 8" /></svg>
              मूल लौटाएँ · restore
            </button>
          </div>

          <div className="field" style={{ maxWidth: "none", marginTop: "16px" }}>
            <label htmlFor="draftText">
              आपका पाठ · your text — <span className="xsmall">{CH_LABEL[channel]} ({CH_EN[channel]})</span>
            </label>
            <textarea id="draftText" className="draft-area" spellCheck="false"
              value={text} onChange={(e) => onEdit(e.target.value)}
              aria-invalid={secretHit} aria-describedby="secretNote" disabled={!ready} />
            <p className="field-err" hidden={!secretHit}>
              OTP/PIN/CVV जैसा शब्द बाहर नहीं जाएगा : रेडैक्टेड · a forbidden secret word was detected — nothing will be approved or sent
            </p>
          </div>

          {/* one-time warning card when a secret word is typed (flagged per visit) */}
          <div className="state-strip" hidden={!secretHit} role="alert">
            <p style={{ margin: 0 }} className="hi">
              <b>लाल झंडा</b> : पाठ में OTP/PIN/CVV/पासवर्ड जैसा शब्द आया। यह शब्द कभी नहीं भेजा जाएगा; हटाइए, फिर अप्रूव करें। (nothing was sent : the word only sat in your box)
              <span className="pair" style={{ marginTop: 4 }}><span className="alt" lang="en-IN">HaqueVaani blocked it for you — {blocked} block(s) on this demo so far.</span></span>
            </p>
          </div>
        </div>

        {/* evidence checklist (ids are indices into the API list) */}
        <div className="card">
          <h2 className="h3" lang="hi-IN">सबूत साथ निभाएँ · evidence checklist</h2>
          <p className="xsmall mute-2">जो मिल गया पर टिक लगाइए : डॉकेट लेने के बाद काम आएगा · tick what's ready</p>
          <ul className="col evlist">
            {evList.map((t, i) => (
              <li className="check-row evrow" key={i}>
                <input type="checkbox" id={"ev" + i} checked={checks.includes(i)}
                  onChange={(e) => {
                    const next = e.target.checked ? [...checks, i] : checks.filter((x) => x !== i);
                    setChecks(next);
                    commit({ draftChecklist: next });
                  }} />
                <label htmlFor={"ev" + i}><span className="xsmall">{t}</span></label>
              </li>
            ))}
          </ul>
        </div>

        {/* claim reminder */}
        <details>
          <summary>आपका दावा क्या बताता है · what your claim says</summary>
          <div className="card" style={{ marginTop: "10px" }}>
            <div className="kv">
              <span className="k">कुल दावा · total claim</span>
              <span className="v num">{fmtInr(entitlement.total_inr)}</span>
            </div>
            <p className="xsmall mute-3" style={{ marginTop: 8 }}>
              संदर्भ <span className="mono">{entitlement.circular_ref || "…"}</span> · संख्याएँ पायथन से : बैंक से बात करते समय यही संदर्भ सुरुवात में बोलिए (lead with this circular on the call).
            </p>
          </div>
        </details>

        {/* the honest approval gate */}
        <div className="check-row card" style={{ padding: "16px 18px" }}>
          <input type="checkbox" id="fixCheck" checked={approved} onChange={(e) => setApproved(e.target.checked)} />
          <label htmlFor="fixCheck" style={{ margin: 0 }}>
            <span lang="hi-IN">मैंने पढ़ लिया और स्वीकृत करता हूँ : यह शिकायत मैंने खुद भेजी/बोली।</span>
            <span className="xsmall mute-3" style={{ display: "block" }}>I have read and approve this draft : I am the one sending it.</span>
          </label>
        </div>

        <div className="row">
          <button className="btn btn--primary go" style={{ opacity: ok ? "" : ".45" }} aria-disabled={!ok} onClick={goPrep}>
            मंजूर करें → कॉल की तैयारी · approve → call prep
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </button>
          <a className="btn btn--line" href="#/rights-check">
            वापस हिसाब <span className="pair"><span className="alt" lang="en-IN">back to numbers</span></span>
          </a>
        </div>
      </section>
    </>
  );
}
