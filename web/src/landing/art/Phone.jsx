// A real payment-app screen. The screen itself narrates: a 3-step tracker shows
// sent -> processing -> stuck (or sent -> sent -> credited).
// Ported as-is from optimizing-ui-visual-storytelling (identical visuals).
import { GRN, INK, ORG } from "./Effects";

/** Phone body (320x740 screen space). Children are drawn on the glass. */
export function PhoneFrame({ x = 0, y = 0, scale = 1, children, className = "" }) {
  return (
    <g className={`phone ${className}`} transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-4" y="140" width="6" height="52" rx="3" fill={INK} />
      <rect x="-4" y="210" width="6" height="52" rx="3" fill={INK} />
      <rect x="358" y="180" width="6" height="84" rx="3" fill={INK} />
      <rect x="0" y="0" width="360" height="740" rx="52" fill={INK} />
      <rect x="12" y="12" width="336" height="716" rx="42" fill="#fff" />
      <rect x="130" y="24" width="100" height="26" rx="13" fill={INK} />
      {children}
      <rect x="120" y="708" width="120" height="6" rx="3" fill={INK} opacity="0.85" />
    </g>
  );
}

/** Static part of the screen: status bar, avatar, amount, merchant row, UTR chip. */
export function PhoneBase({ amount, tone = "out", utr }) {
  const c = tone === "in" ? GRN : INK;
  return (
    <g className="ph-base">
      <text x="44" y="46" fontSize="17" fontWeight="700" fill={INK} style={{ fontFamily: "var(--f-body)" }}>9:41</text>
      <g fill={INK} transform="translate(250 34)">
        <rect x="0" y="9" width="4" height="5" rx="1" />
        <rect x="6" y="6" width="4" height="8" rx="1" />
        <rect x="12" y="3" width="4" height="11" rx="1" />
        <rect x="18" y="0" width="4" height="14" rx="1" />
        <path d="M30 4 Q38 -2 46 4 M33 8 Q38 4 43 8" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="38" cy="12" r="1.8" />
        <rect x="52" y="0" width="26" height="14" rx="4" fill="none" stroke={INK} strokeWidth="1.8" />
        <rect x="54.5" y="2.5" width="16" height="9" rx="2" />
      </g>
      <circle cx="180" cy="124" r="40" fill="#f4efe4" stroke={INK} strokeWidth="3" />
      <text x="180" y="140" textAnchor="middle" fontSize="44" className="t-disp" fill={INK}>₹</text>
      <text x="180" y="236" textAnchor="middle" fontSize="60" className="t-disp ph-amount" fill={c}>
        {amount}
      </text>
      <g transform="translate(36 284)">
        <rect x="0" y="0" width="288" height="64" rx="14" fill="#faf7f0" stroke="#e5e0d2" strokeWidth="2" />
        <g transform="translate(20 22)" fill="none" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
          <path d="M0 6 H24 V22 H0 Z" fill="#fff" />
          <path d="M-3 6 L0 -2 H24 L27 6 Z" fill={ORG} />
          <path d="M9 22 V14 H15 V22" />
        </g>
        <rect x="68" y="18" width="130" height="10" rx="5" fill="#d9d3c3" />
        <rect x="68" y="36" width="80" height="9" rx="4.5" fill="#e8e3d5" />
        <path d="M262 24 L268 32 L262 40" fill="none" stroke="#b8b2a1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="ph-utr" transform="translate(36 376)">
        <rect x="0" y="0" width="288" height="52" rx="12" fill="#fff" stroke={INK} strokeWidth="2.2" strokeDasharray="6 5" />
        <text x="18" y="22" fontSize="11" fill="#7a7466" className="t-up">UTR</text>
        <text x="18" y="42" fontSize="19" fill={INK} style={{ fontFamily: "var(--f-mono)", fontWeight: 600 }}>{utr}</text>
        <g transform="translate(250 15)" fill="none" stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
          <rect x="6" y="0" width="16" height="18" rx="3" />
          <path d="M3 5 V20 Q3 22 5 22 H17" />
        </g>
      </g>
      <path d="M36 466 H324" stroke="#e5e0d2" strokeWidth="2" />
    </g>
  );
}

function Step({ y, state, label, last }) {
  const c = state === "warn" ? ORG : state === "okg" ? GRN : INK;
  return (
    <g transform={`translate(64 ${y})`}>
      {state === "ok" && <path d="M-7 0 L-2 6 L9 -8" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}
      {state === "okg" && <path d="M-7 0 L-2 6 L9 -8" fill="none" stroke={GRN} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}
      {state === "warn" && (
        <g fill="none" stroke={ORG} strokeWidth="3" strokeLinejoin="round">
          <path d="M0 -11 L11 8 H-11 Z" />
          <path d="M0 -4 V1" strokeLinecap="round" />
          <circle cy="4.5" r="1.2" fill={ORG} stroke="none" />
        </g>
      )}
      {state === "spin" && (
        <g transform="scale(0.7)">
          <g className="ph-proc">
            <circle r="17" fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
            <path d="M0 -17 A17 17 0 0 1 17 0" fill="none" stroke={ORG} strokeWidth="3.5" strokeLinecap="round" />
          </g>
        </g>
      )}
      <text x="34" y="7" fontSize="20" fontWeight={state === "warn" || state === "okg" ? 700 : 500} style={{ fill: c, fontFamily: "var(--f-body)" }}>
        {label}
      </text>
      {!last && <path d="M0 18 V42" stroke="#e5e7eb" strokeWidth="2.5" />}
    </g>
  );
}

/** Tracker for the failed payment: sent, processing (spinner never ends), stuck. */
export function PhoneStuck({ className = "", style }) {
  return (
    <g className={`ph-stuck ${className}`} style={style}>
      <Step y={520} state="ok" label="Sent from your account" />
      <Step y={580} state="spin" label="Bank processing…" />
      <Step y={640} state="warn" label="Stuck mid-transfer" last />
    </g>
  );
}

/** Tracker for the refund: the only green on screen, plus a drawn tick badge. */
export function PhoneCredited({ className = "", style }) {
  return (
    <g className={`ph-credited ${className}`} style={style}>
      <Step y={520} state="ok" label="Sent from your account" />
      <Step y={580} state="ok" label="Bank reviewed claim" />
      <Step y={640} state="okg" label="Refund credited" last />
      <g className="tick-badge" style={{ opacity: 0 }} transform="translate(218 158)">
        <circle r="19" fill={GRN} stroke="#fff" strokeWidth="4" />
        <path className="tick" d="M-8 0 L-2 7 L9 -7" pathLength={1} strokeDasharray="1" strokeDashoffset="1" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
}
