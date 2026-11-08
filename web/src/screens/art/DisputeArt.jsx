/* DisputeArt — pictorial dispute types for the start-case choice cards.
   Same convention as landing/art (hand-drawn vector, INK lines, ONE accent
   for the failure/signal moment): no text glyphs (font-proof), no shadows,
   no gradients — the app screens sit on the white token canvas, so fills
   are #fff to occlude crossing lines. Each scene keeps a fixed grammar:
   the citizen's device/asset on the left, what happened to the money on
   the right, accent only where money went wrong. Decorative: rendered
   inside cards whose link text carries the meaning (aria-hidden wrapper). */

export const INK = "#282828";
export const ORG = "#fa3600";

/* shared stroke setup for the little scenes */
const base = {
  fill: "none",
  stroke: INK,
  strokeWidth: 3,
  strokeLinejoin: "round",
  strokeLinecap: "round",
};

/* upright phone, default art anchor (left side of every scene) */
function Phone({ x, y, ...rest }) {
  return (
    <g transform={`translate(${x} ${y})`} {...base} {...rest}>
      <rect x="0" y="0" width="34" height="72" rx="8" fill="#fff" />
      <path d="M12 7 H22" strokeWidth="2.5" />
    </g>
  );
}

/* thin banknote with a centre band; accents the "moved money" */
function Note({ x, y, w = 16, h = 10, band = false, ...rest }) {
  return (
    <g transform={`translate(${x} ${y})`} {...base} {...rest}>
      <rect x="0" y="0" width={w} height={h} rx="2" fill="#fff" />
      {band && <rect x={w / 2 - 2.5} y="0" width="5" height={h} fill={ORG} stroke="none" />}
    </g>
  );
}

/* one HEAD+SHOULDERS figure; `phantom` = dashed "unknown actor" */
function Person({ x, y, phantom, ...rest }) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      {...base}
      strokeDasharray={phantom ? "4 4" : undefined}
      opacity={phantom ? 0.55 : 1}
      {...rest}
    >
      <circle cx="0" cy="0" r="8" fill="#fff" />
      <path d="M-12 22 Q0 10 12 22" />
    </g>
  );
}

/* accent X = the money never landed / nothing came out / not yours */
function Cross({ x, y, r = 9, ...rest }) {
  return (
    <g transform={`translate(${x} ${y})`} {...base} stroke={ORG} strokeWidth="3.5" {...rest}>
      <path d={`M${-r} ${-r} L${r} ${r} M${r} ${-r} L${-r} ${r}`} />
    </g>
  );
}

/* 01 — UPI · money debited, person never credited */
export function UPIArt() {
  return (
    <svg viewBox="0 0 128 96" aria-hidden="true">
      <Phone x={24} y={12} />
      <Note x={33} y={26} band />
      {/* debit arrow leaves the phone… */}
      <g {...base}>
        <path d="M62 48 H90" />
        <path d="M84 41 L92 48 L84 55" />
      </g>
      {/* …but the person's side is marked paid-without-received */}
      <Person x={104} y={30} />
      <Cross x={104} y={52} />
    </svg>
  );
}

/* 02 — ATM · cash did not dispense, debit did */
export function AtmArt() {
  return (
    <svg viewBox="0 0 128 96" aria-hidden="true">
      <g {...base}>
        {/* machine body, screen, keys, card slot */}
        <rect x="18" y="6" width="46" height="84" rx="5" fill="#fff" />
        <rect x="25" y="14" width="32" height="20" rx="2" />
        <path d="M29 20 H45" strokeWidth="2.5" opacity="0.5" />
        <path d="M34 48 H48" strokeWidth="5" opacity="0.25" />
        <rect x="26" y="70" width="30" height="7" rx="3.5" />
        {/* card pushed in */}
        <rect x="30" y="62" width="22" height="8" rx="2" fill="#fff" strokeWidth="2.5" />
      </g>
      {/* the note went IN… (motion dashes) */}
      <g {...base} opacity="0.85">
        <Note x={74} y={24} w={22} h={13} />
        <path d="M68 32 H72 M70 40 H73" strokeWidth="2.5" />
      </g>
      {/* …nothing came OUT (accent empty dashed tray) */}
      <g {...base} strokeDasharray="4 3" stroke={ORG}>
        <rect x="98" y="62" width="20" height="15" rx="3" />
      </g>
      <Cross x={108} y={69} r={5} strokeWidth={3} />
    </svg>
  );
}

/* 03 — unauthorised · a debit you never made (unknown actor) */
export function FraudArt() {
  return (
    <svg viewBox="0 0 128 96" aria-hidden="true">
      {/* your card */}
      <g {...base}>
        <rect x="14" y="50" width="42" height="28" rx="4" fill="#fff" />
        <path d="M14 58 H56" strokeWidth="5" opacity="0.25" />
        <rect x="19" y="64" width="9" height="7" rx="1.5" strokeWidth="2.5" />
      </g>
      {/* money pulled away to nobody (dashed) — accent X = not yours */}
      <g {...base} opacity="0.85">
        <path d="M58 60 H80" strokeDasharray="4 4" />
        <path d="M74 53 L82 60 L74 67" />
      </g>
      <Note x={84} y={54} band />
      <Cross x={104} y={59} r={7} />
      {/* unknown grabber, dashed head+shoulders above the takeaway */}
      <Person x={104} y={28} phantom />
    </svg>
  );
}

/* 04 — not sure · why it happened is unknown (accent question mark) */
export function UnsureArt() {
  return (
    <svg viewBox="0 0 128 96" aria-hidden="true">
      <Phone x={34} y={12} />
      {/* unknown call path: dashed link up to a drawn question mark */}
      <g {...base} strokeDasharray="4 4" opacity="0.6">
        <path d="M51 24 Q66 18 74 26" strokeWidth="2.5" />
      </g>
      <g {...base} stroke={ORG} strokeWidth="4">
        <path d="M70 22 Q70 10 82 10 Q96 10 96 22 Q96 31 84 35 V41" />
        <circle cx="84" cy="50" r="2.4" fill={ORG} stroke="none" />
      </g>
    </svg>
  );
}
