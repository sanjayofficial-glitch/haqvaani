/* Step 01 — four facts on the table, one bar of judgment.
   Mirrors frontend/screens/fact-review.html: prefill is frozen at mount
   (server extraction → demo speech → sample case), error rows stay hidden
   until a field is touched, and the facts leave the browser only after
   validation passes. Zero-liability teaser for the unauthorised type.     */

import { useState, useRef } from "react";
import { useCaseFile } from "../lib/state.jsx";
import { DEMO } from "../lib/demo.js";
import { isoToday } from "../lib/format.js";
import { parseOcrText } from "../lib/ocr.js";
import { navigate } from "../lib/router.js";

export default function FactReview() {
  const { state, commit } = useCaseFile();

  /* source and kind are read once (frozen) so live edits never re-pick the prefill */
  const srcRef = useRef(null);
  if (!srcRef.current) {
    const src = state.intake || state.suggestedIntake || DEMO.intake;
    const srcKind = state.intake ? "server" : state.suggestedIntake ? "demo-speech" : "sample";
    srcRef.current = { src, srcKind };
  }
  const { src, srcKind } = srcRef.current;

  const TODAY = isoToday();
  const [amount, setAmount] = useState(src.amount_inr || "");
  const [date, setDate] = useState(src.txn_date || "");
  const [utr, setUtr] = useState(src.utr || "");
  const [type, setType] = useState(src.dispute_type || "upi_p2p");
  const [bank, setBank] = useState(src.bank_name || "");
  const [touched, setTouched] = useState({});
  const [badSubmit, setBadSubmit] = useState(false);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrMsg, setOcrMsg] = useState(null);

  /* screenshot OCR → prefill the four facts; runs entirely on this device */
  async function onOcr(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    setOcrBusy(true);
    setOcrMsg("पढ़ रहा है… यहीं इसी डिवाइस पर · reading on this device…");
    try {
      const Tesseract = await import("tesseract.js");
      const { data } = await Tesseract.recognize(f, "eng+hin", { logger: () => {} });
      const box = parseOcrText(data.text);
      const applied = [];
      if (box.amount) { setAmount(String(box.amount)); applied.push("राशि · amount"); }
      if (box.utr) { setUtr(box.utr); applied.push("UTR"); }
      if (box.date) { setDate(box.date); applied.push("तारीख़ · date"); }
      setOcrMsg(
        applied.length
          ? "OCR से भरा गया · prefilled from the screenshot: " + applied.join(", ")
          : "OCR में पैसे / UTR / तारीख़ नहीं मिले · nothing recognized — fill by hand"
      );
    } catch {
      setOcrMsg("OCR असफल · could not read this screenshot");
    } finally {
      setOcrBusy(false);
    }
  }

  /* ------------------------------------------------------- validation --- */
  /* amount ₹1–1 Cr; date ≤ today; UTR optional but digits-only 10–24 */
  function errs() {
    const out = {};
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || amt > 10000000) out.amount = true;

    if (!date) out.date = true;
    else {
      const dd = new Date(date + "T00:00:00");
      if (isNaN(dd) || dd.getTime() > new Date(TODAY + "T23:59:59").getTime()) out.date = true;
    }

    const u = utr.trim();
    if (u && (!/^\d+$/.test(u) || u.length < 10 || u.length > 24)) out.utr = true;
    return out;
  }

  /* demo-difference: did the user move any of the four facts off the sample? */
  function editedBeyondDemo() {
    const d = DEMO.intake;
    return (
      parseFloat(amount) !== d.amount_inr ||
      date !== d.txn_date ||
      utr.trim() !== d.utr ||
      type !== d.dispute_type
    );
  }

  const err = errs();
  const good = Object.keys(err).length === 0;
  const showErr = (k) => Boolean(touched[k] && err[k]) || Boolean(badSubmit && err[k]);
  const demoDiff = srcKind !== "server" && editedBeyondDemo();

  function touch(k) {
    setTouched((t) => ({ ...t, [k]: true }));
    setBadSubmit(false);
  }

  /* the gated hop: state changes only after the four facts validate */
  function goRights(e) {
    e.preventDefault();
    setTouched({ amount: true, date: true, utr: true, type: true, bank: true });
    if (!good) return;
    commit({
      intake: {
        utr: utr.trim() || null,
        amount_inr: parseFloat(amount),
        txn_date: date,
        dispute_type: type,
        bank_name: bank.trim() || null,
        language: src.language || "hi-IN",
        confidence: (src && src.confidence) || (srcKind === "server" ? 0.97 : 0.9),
        raw_transcript: state.rawTranscript || "",
      },
      factsEdited: editedBeyondDemo(),
    });
    navigate("#/rights-check");
  }

  /* ----------------------------------------------------------- markup --- */
  return (
    <>
      <div className="col" style={{ gap: "var(--s-xs)" }}>
        <h1 className="d-lg" lang="hi-IN">चार सच। एक बार जाँच लीजिए।</h1>
        <p className="body mute-2" style={{ maxWidth: "62ch" }}>
          राशि, तारीख़, UTR और कटौती क़िसम — यही चार सच आपके पैसे तय करते हैं।
          <span className="pair"><span className="alt" lang="en-IN">Amount, date, UTR, dispute type — four facts decide your money.</span></span>
        </p>
      </div>

      <form className="card facts-form" noValidate onSubmit={goRights} style={{ marginTop: "var(--s-md)", gap: "var(--s-md)" }}>
        {/* source honesty strip */}
        <div className="kv src-note" aria-label="स्रोत">
          <span className="k">यह कहाँ से मिला · source</span>
          <span className="xsmall">
            {srcKind === "server" ? (
              <>सर्वर से निकाला ·<b> extracted by the API from your recording</b></>
            ) : srcKind === "demo-speech" ? (
              <>सैंपल बोली से भरा (<b>synthetic demo</b>) · pre-filled from the sample transcript</>
            ) : (
              <>सैंपल केस : <b>synthetic demo</b> · ₹3,200 · 18 Oct · UPI P2P — the worked example</>
            )}
          </span>
        </div>

        {/* screenshot OCR prefill (optional, on-device) */}
        <div className="kv src-note" aria-label="स्क्रीनशॉट OCR">
          <span className="k">स्क्रीनशॉट से भरें · fill from a screenshot</span>
          <span className="xsmall">
            <label className="btn btn--line" style={{ minHeight: 36, padding: "6px 14px", cursor: "pointer" }}>
              {ocrBusy ? "पढ़ रहा है… · reading…" : "UPI स्क्रीनशॉट चुनें · choose screenshot"}
              <input type="file" accept="image/*" hidden disabled={ocrBusy} onChange={onOcr} aria-label="UPI screenshot upload" />
            </label>
            {ocrMsg && <span className="mute-2" style={{ display: "block", marginTop: 6 }}>{ocrMsg}</span>}
            <span className="mute-3" style={{ display: "block", marginTop: 4, fontSize: 12 }}>
              राशि / UTR / तारीख़ भर जाएँगे — यहाँ इसी डिवाइस पर, कुछ भी बाहर नहीं जाता।
            </span>
          </span>
        </div>

        <div className="split2">
          <div className="field">
            <label htmlFor="fAmount">राशि कितनी कटी? · amount debited (₹)</label>
            <input id="fAmount" type="number" inputMode="decimal" min="1" step="1" placeholder="3200"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              onBlur={() => touch("amount")} aria-invalid={showErr("amount")} />
            <p className="field-err" hidden={!showErr("amount")}>राशि 1 या अधिक होनी चाहिए · amount must be ₹1 or more</p>
          </div>
          <div className="field">
            <label htmlFor="fDate">किस तारीख़ को कटा? · date of debit</label>
            <input id="fDate" type="date" value={date} max={TODAY}
              onChange={(e) => setDate(e.target.value)}
              onBlur={() => touch("date")} aria-invalid={showErr("date")} />
            <p className="hint">आज से पहले की तारीख़ · today or earlier (bank window: 90 days)</p>
            <p className="field-err" hidden={!showErr("date")}>तारीख़ आज या उससे पहले होनी चाहिए · date must be today or earlier</p>
          </div>
        </div>

        <div className="split2">
          <div className="field">
            <label htmlFor="fUtr">UTR / लेन-देन नंबर · transaction ref</label>
            <input id="fUtr" type="text" inputMode="numeric" autoComplete="off" maxLength={24}
              placeholder="629188340112" value={utr}
              onChange={(e) => setUtr(e.target.value)}
              onBlur={() => touch("utr")} aria-invalid={showErr("utr")} />
            <p className="hint">10 से 24 अंक, खाली भी चलेगा · digits only, optional</p>
            <p className="field-err" hidden={!showErr("utr")}>केवल अंक, कम से कम 10 · digits only, at least 10</p>
          </div>
          <div className="field">
            <label htmlFor="fType">कैसी कटौती है? · dispute type</label>
            <select id="fType" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="upi_p2p">UPI P2P : पैसे कटे, पहुँचे नहीं (friend/person)</option>
              <option value="upi_p2m">UPI P2M : दुकान/QR पर भुगतान कटे</option>
              <option value="imps">IMPS ट्रांसफ़र कटा, पहुँचा नहीं</option>
              <option value="atm_cash_not_dispensed">ATM में कैश नहीं निकला</option>
              <option value="pos_card_debit">POS / कार्ड से कटौती</option>
              <option value="unauthorised">अनधिकृत कटौती : मैंने नहीं अनुमति दी (fraud)</option>
            </select>
            <p className="hint">
              {type === "unauthorised"
                ? <><b>शून्य-देयता वाला प्रकार</b> · zero-liability case : report within 3 working days, next screen</>
                : "हर प्रकार का सांविधिक समय अलग है · each type has its own RBI timeline"}
            </p>
          </div>
        </div>

        <div className="field">
          <label htmlFor="fBank">बैंक कौन-सा? (वैकल्पिक) · bank name (optional)</label>
          <input id="fBank" type="text" autoComplete="off" maxLength={80} placeholder="DemoBank Support"
            value={bank} onChange={(e) => setBank(e.target.value)} />
          <p className="hint">शिकायत पत्र में यही नाम जुड़ता है · joins your complaint letter</p>
        </div>

        {demoDiff && (
          <div className="state-strip is-demo">
            <p className="hi" lang="hi-IN" style={{ margin: 0 }}>
              ये अब <b>आपके सच</b> हैं : सैंपल केस का डेमो डेटा आगे नहीं दिखेगा। बिना सर्वर चालू दिखने वाला हिसाब सैंपल केस का है।
              <span className="pair"><span className="alt" lang="en-IN">These are now your own facts : with no live server the next calculation stays the sample case.</span></span>
            </p>
          </div>
        )}

        <div className="state-strip" role="status" aria-live="polite">
          <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" hidden={badSubmit && !good}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" hidden={!(badSubmit && !good)}>
            <circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="16.5" x2="12" y2="16.6" />
          </svg>
          <p style={{ margin: 0 }}>
            {badSubmit && !good
              ? "कुछ सच जाँचें : लाल रेखा देखिए · fix the marked facts first"
              : good ? "चार सच ठीक हैं · all four facts look right"
              : "जाँच जारी… · checking…"}
          </p>
        </div>

        <div className="row" style={{ marginTop: "var(--s-sm)" }}>
          <button className="btn btn--primary" type="submit">
            हक जाँचें · check my rights
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </button>
          <a className="btn btn--line" href="#/voice-intake">
            वापस बोलें <span className="pair"><span className="alt" lang="en-IN">record again</span></span>
          </a>
        </div>
      </form>

      <p className="xsmall mute-3" style={{ marginTop: "var(--s-md)" }}>
        आगे हक़-वाणी RBI नियमों से आपकी क्षतिपूर्ति गणना करेगा : हिसाब पायथन में, कोई AI नहीं।
        <span className="pair"><span className="alt" lang="en-IN">Next, HaqVaani computes your entitlement from the RBI rules in deterministic Python : never an AI guess.</span></span>
      </p>
    </>
  );
}
