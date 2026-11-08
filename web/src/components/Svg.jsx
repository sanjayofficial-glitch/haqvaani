/* The hairline SVG line-art library (metaphors kept from the v3.0 system,
   restyled to the merged palette: ink rules, --line supports, ONE accent for
   live/progress marks, --success only where a refund is credited).        */

const STROKE = {
  base: "rgba(40,40,40,0.55)",
  soft: "rgba(40,40,40,0.30)",
  softest: "rgba(40,40,40,0.16)",
};

/* payment line: coin stops exactly where the transaction broke (Hook / KAT GAYA) */
export function TxnBreak({ parallaxClass = "" }) {
  return (
    <figure className={"trxfigure " + parallaxClass}>
      <svg role="img" aria-label="भुगतान लाइन: सिक्का बहता है और वहीं रुक जाता है जहाँ लेन-देन कटी है; आगे बैंक।"
        viewBox="0 0 640 132" width="640" height="132" style={{ maxWidth: "100%" }}>
        <g fill="none" strokeLinecap="round">
          <line x1="24" y1="70" x2="366" y2="70" stroke={STROKE.base} strokeWidth="2" />
          <line x1="410" y1="70" x2="572" y2="70" stroke={STROKE.softest} strokeWidth="2" strokeDasharray="2 9" />
          {/* sender */}
          <circle cx="24" cy="70" r="9" stroke="#fa3600" strokeWidth="2.5" />
          <text x="24" y="104" textAnchor="middle" fill={STROKE.base} fontSize="12" fontFamily="'Geist Mono', monospace">आप · you</text>
          {/* the break */}
          <line x1="382" y1="61" x2="392" y2="79" stroke="#282828" strokeWidth="2.5" />
          <line x1="392" y1="61" x2="382" y2="79" stroke="#282828" strokeWidth="2.5" />
          <circle cx="387" cy="70" r="27" stroke={STROKE.soft} strokeWidth="1.5" strokeDasharray="1 7" />
          <text x="387" y="112" textAnchor="middle" fill="#fa3600" fontSize="12" fontFamily="'Geist Mono', monospace">लेन-देन कटी · payment broke</text>
          {/* bank */}
          <rect x="540" y="50" width="34" height="40" fill="none" stroke={STROKE.soft} strokeWidth="2" />
          <line x1="547" y1="61" x2="567" y2="61" stroke={STROKE.soft} strokeWidth="2" />
          <line x1="547" y1="70" x2="567" y2="70" stroke={STROKE.soft} strokeWidth="2" />
          <line x1="557" y1="79" x2="557" y2="82" stroke={STROKE.soft} strokeWidth="2" />
          <text x="584" y="96" fill={STROKE.base} fontSize="12" fontFamily="'Geist Mono', monospace">बैंक · bank</text>
        </g>
        {/* the coin (accent, static position at the break; the landing scrub nudges .coin-g) */}
        <g className="coin-g">
          <circle cx="356" cy="70" r="15" fill="#fa3600" />
          <text x="356" y="75" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="700" fontFamily="'Geist Mono', monospace">₹</text>
        </g>
      </svg>
    </figure>
  );
}

/* voice → four facts (Speak beat) */
export function VoiceTiles({ parallaxClass = "" }) {
  const tile = (x, y, label, value) => (
    <g>
      <rect x={x} y={y} width="126" height="52" fill="none" stroke={STROKE.soft} strokeWidth="2" />
      <text x={x + 12} y={y + 20} fill={STROKE.base} fontSize="11" fontFamily="'Geist Mono', monospace">{label}</text>
      <text x={x + 12} y={y + 41} fill="#282828" fontSize="13" fontWeight="600" fontFamily="'Geist Mono', monospace">{value}</text>
    </g>
  );
  return (
    <figure className={"trxfigure " + parallaxClass}>
      <svg role="img" viewBox="0 0 340 224" style={{ maxWidth: "100%" }}
        aria-label="आपकी बोली आवाज़ की लहर चार fact tiles में सिमटती है : राशि ₹3,200, तारीख़ 18 Oct, UTR 629188340112, UPI P2P">
        <g fill="none" strokeLinecap="round">
          <polyline points="16,36 32,36 42,16 54,56 64,22 74,50 86,36 104,36" stroke="#fa3600" strokeWidth="2.5" />
          <line x1="16" y1="36" x2="330" y2="36" stroke={STROKE.softest} strokeWidth="1.5" />
          <text x="16" y="22" fill={STROKE.base} fontSize="11" fontFamily="'Geist Mono', monospace">आपकी आवाज़ · your voice</text>
          <line x1="106" y1="36" x2="152" y2="72" stroke={STROKE.softest} strokeWidth="1.5" />
        </g>
        {tile(40, 78, "राशि · amount", "₹3,200")}
        {tile(180, 78, "तारीख़ · date", "18 Oct")}
        {tile(40, 140, "UTR", "629188340112")}
        {tile(180, 140, "क़िसम · type", "UPI P2P")}
      </svg>
      <figcaption className="caption mute-3">चार सच · four facts: amount, date, UTR, type</figcaption>
    </figure>
  );
}

/* ledger (Rule beat) */
export function LedgerArt({ parallaxClass = "" }) {
  const row = (y, label, value, strong) => (
    <g>
      <rect x="20" y={y} width="300" height="44" fill="none" stroke={strong ? "#282828" : STROKE.soft} strokeWidth={strong ? 2 : 2} />
      <text x="34" y={y + 27} fill={STROKE.base} fontSize="12" fontFamily="'Geist Mono', monospace">{label}</text>
      <text x={306} y={y + 27} textAnchor="end" fill={strong ? "#fa3600" : "#282828"} fontSize="14" fontWeight="600" fontFamily="'Geist Mono', monospace">{value}</text>
    </g>
  );
  return (
    <figure className={"trxfigure " + parallaxClass}>
      <svg role="img" viewBox="0 0 340 200" style={{ maxWidth: "100%" }}
        aria-label="बाक़ायदा बही : T+1 गुज़रे दिन, ₹100 × हर दिन, कुल दावा">
        {row(24, "एक दिन की देरी · one day late", "+₹100")}
        {row(76, "₹100 × 6 दिन", "₹600")}
        {row(128, "कुल दावा · total claim", "₹3,800", true)}
      </svg>
      <figcaption className="caption mute-3">बही हर देर वाले दिन ₹100 छापती है · the ledger prints ₹100 for every late day</figcaption>
    </figure>
  );
}

/* draft + your approval mark (Prepare beat; check is ink — approval, not credited) */
export function DraftArt({ parallaxClass = "" }) {
  return (
    <figure className={"trxfigure " + parallaxClass}>
      <svg role="img" viewBox="0 0 340 156" style={{ maxWidth: "100%" }}
        aria-label="शिकायत ड्राफ़्ट लाइनें और आपके अनुमोदन का चिह्न">
        <g fill="none" strokeLinecap="round">
          <rect x="20" y="14" width="240" height="120" fill="none" stroke={STROKE.soft} strokeWidth="2" />
          <line x1="40" y1="44" x2="220" y2="44" stroke={STROKE.base} strokeWidth="2.5" />
          <line x1="40" y1="66" x2="236" y2="66" stroke={STROKE.softest} strokeWidth="2.5" />
          <line x1="40" y1="88" x2="188" y2="88" stroke={STROKE.softest} strokeWidth="2.5" />
          <circle cx="292" cy="72" r="23" stroke="#282828" strokeWidth="2.5" />
          <polyline points="282,72 289,79 303,63" stroke="#282828" strokeWidth="2.5" />
        </g>
      </svg>
      <figcaption className="caption mute-3">आप सहमति के बिना कुछ नहीं जाने देते · you approve every word</figcaption>
    </figure>
  );
}

/* you — phone line — bank; the whisper flows from us to your ear (Call beat) */
export function WhisperArt({ parallaxClass = "" }) {
  return (
    <figure className={"trxfigure " + parallaxClass}>
      <svg role="img" viewBox="0 0 340 150" style={{ maxWidth: "100%" }}
        aria-label="आप बैंक को ख़ुद कॉल करते हैं; हक़-वाणी की फ़ुसफ़ुसाहट टूटी रेखा से आप तक पहुँचती है : कभी किसी को कॉल नहीं करता">
        <g fill="none" strokeLinecap="round">
          <circle cx="60" cy="86" r="9" stroke="#fa3600" strokeWidth="2.5" />
          <text x="60" y="118" textAnchor="middle" fill={STROKE.base} fontSize="12" fontFamily="'Geist Mono', monospace">आप · you</text>
          <line x1="74" y1="86" x2="252" y2="86" stroke={STROKE.base} strokeWidth="2" />
          <text x="162" y="76" textAnchor="middle" fill={STROKE.base} fontSize="11" fontFamily="'Geist Mono', monospace">फ़ोन लाइन · phone line</text>
          <circle cx="262" cy="86" r="9" stroke={STROKE.base} strokeWidth="2.5" />
          <text x="262" y="118" textAnchor="middle" fill={STROKE.base} fontSize="12" fontFamily="'Geist Mono', monospace">बैंक · bank</text>
          <path className="whisper" d="M96 44 C 130 20, 200 20, 232 44" stroke="#fa3600" strokeWidth="2" strokeDasharray="5 8" />
          <text x="162" y="14" textAnchor="middle" fill="#fa3600" fontSize="11" fontFamily="'Geist Mono', monospace">हक़-वाणी की फ़ुसफ़ुसाहट · whisper, to you</text>
        </g>
      </svg>
      <figcaption className="caption mute-3">फ़ोन हमेशा आपके हाथ में · the phone is always in your hand</figcaption>
    </figure>
  );
}

/* stamp — verbatim/docket confirmation (accent) or credited (the one --success use).
   Drawing handled by CSS (.stamp-stamp) with reduced-motion-safe keyframes. */
export function Stamp({ tone = "accent", label }) {
  const color = tone === "success" ? "var(--success)" : "var(--accent)";
  return (
    <>
      <svg className="stamp-stamp" viewBox="0 0 56 56" width="56" height="56" aria-hidden="true">
        <circle cx="28" cy="28" r="25" fill="none" stroke={color} strokeWidth="2.5" />
        <polyline points="16,29 25,38 41,20" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label ? <span className="caption" style={{ marginTop: 8, display: "block", color }}>{label}</span> : null}
    </>
  );
}

/* big progress rule with an arrow — the orange progress line that draws toward
   the deadline numeral (Rule act); width driven by scroll in the landing */
export function DeadLineRule({ progressRef, staticProgress = 1 }) {
  return (
    <svg className="deadline-rule" viewBox="0 0 720 40" style={{ width: "100%", height: 40 }} aria-hidden="true">
      <line ref={progressRef} x1="0" y1="20" x2={640} y2="20" stroke="var(--accent)" strokeWidth="2"
        data-static-progress={staticProgress}
        style={{ transformOrigin: "0 20px", transform: staticProgress < 1 ? `scaleX(${staticProgress})` : undefined }} />
      <path d="M640 12 L664 20 L640 28 Z" fill="#fa3600" />
      <line x1="684" y1="6" x2="684" y2="34" stroke="#282828" strokeWidth="2" />
    </svg>
  );
}
