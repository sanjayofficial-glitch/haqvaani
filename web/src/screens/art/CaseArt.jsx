/* CaseArt — small hand-drawn scenes for the case screens (Speak / Check / Prepare /
   Call / Prove). Same convention as DisputeArt and the landing acts: INK hairline
   outlines, ONE orange accent for the "money went wrong / deadline is the issue"
   moment, white fills to occlude crossing lines, no text glyphs (font-proof), no
   shadows, no gradients. Each scene is decorative (aria-hidden wrapper) and sits
   above the screen's real copy, which carries the meaning.               */

import { INK, ORG } from "./DisputeArt.jsx";

const base = {
  fill: "none",
  stroke: INK,
  strokeWidth: 3,
  strokeLinejoin: "round",
  strokeLinecap: "round",
};

function Phone({ x, y, scale = 1, ...rest }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} {...base} {...rest}>
      <rect x="0" y="0" width="34" height="72" rx="8" fill="#fff" />
      <path d="M12 7 H22" strokeWidth="2.5" />
    </g>
  );
}

function BankHouse({ x, y, ...rest }) {
  return (
    <g transform={`translate(${x} ${y})`} {...base} {...rest}>
      <path d="M4 30 L20 12 L36 30 Z" fill="#fff" />
      <rect x="12" y="30" width="16" height="22" fill="#fff" />
      <path d="M18 41 H22" strokeWidth="2" />
      <path d="M13 30 H27" strokeWidth="2.5" opacity="0.55" />
    </g>
  );
}

function ClockHand({ late }) {
  const tipX = late ? 9 : 7;
  const tipY = late ? -6 : -9;
  return <path d={`M0 0 L${tipX} ${tipY}`} strokeWidth="2.5" stroke={late ? ORG : undefined} />;
}

function Clock({ x, y, r = 16, late = false, ...rest }) {
  return (
    <g transform={`translate(${x} ${y})`} {...base} {...rest}>
      <circle cx="0" cy="0" r={r} fill="#fff" />
      <circle cx="0" cy="0" r={r} strokeWidth="2" opacity="0.4" />
      <path d="M-11 0 H11" strokeWidth="2.5" />
      <ClockHand late={late} />
      <circle cx="0" cy="0" r="2" fill={INK} stroke="none" />
    </g>
  );
}

function Doc({ x, y, w = 40, h = 46, lines = 3, ...rest }) {
  const rows = Array.from({ length: lines }).map((_, i) => (
    <path key={i} d={`M6 ${10 + i * 11} H${w - 6}`} strokeWidth="2" opacity="0.5" />
  ));
  return (
    <g transform={`translate(${x} ${y})`} {...base} {...rest}>
      <rect x="0" y="0" width={w} height={h} rx="2" fill="#fff" />
      {rows}
    </g>
  );
}

function DocketStrip({ x, y, w = 56, h = 30, ...rest }) {
  return (
    <g transform={`translate(${x} ${y})`} {...base} {...rest}>
      <rect x="0" y="0" width={w} height={h} rx="3" fill="#fff" />
      <path d={`M6 6 H${w - 6}`} strokeWidth="2" opacity="0.4" />
      <path d={`M6 14 H${w - 6}`} strokeWidth="2" opacity="0.4" />
      <path d={`M6 22 H${w - 6}`} strokeWidth="2" opacity="0.4" />
      <path d={`M${w - 6} 4 V${h - 4}`} strokeWidth="2.5" strokeDasharray="2 3" opacity="0.5" />
    </g>
  );
}

function StampMark({ x, y, big = false, ...rest }) {
  const r = big ? 26 : 14;
  const pts = big ? "10,14 18,22 34,6" : "5,7 9,11 17,3";
  return (
    <g transform={`translate(${x} ${y})`} {...base} stroke={INK} strokeWidth={big ? 2.5 : 2.5} {...rest}>
      <circle cx="0" cy="0" r={r} fill="none" />
      <polyline
        points={pts}
        fill="none"
        strokeWidth={big ? 3 : 2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

/* Speak — mic scene: phone on the left, big mic on the right, one orange sound arc */
export function SpeakScene() {
  return (
    <svg viewBox="0 0 128 96" aria-hidden="true">
      <Phone x={18} y={12} scale={0.85} />
      <path d="M40 40 Q58 26 70 30" {...base} stroke={ORG} strokeWidth="2.5" opacity="0.85" />
      <path d="M38 50 Q58 40 72 46" {...base} stroke={ORG} strokeWidth="2.5" opacity="0.55" strokeDasharray="3 3" />
      <g transform="translate(92 22)" {...base}>
        <path d="M0 6 H22" strokeWidth="2.5" />
        <path d="M6 6 V26 A11 11 0 0 0 16 26 V6" fill="#fff" />
        <path d="M3 20 H21" strokeWidth="2.5" />
        <line x1="6" y1="32" x2="16" y2="32" strokeWidth="2.5" />
        <line x1="2" y1="38" x2="20" y2="38" strokeWidth="2.5" />
      </g>
    </svg>
  );
}

/* Check — four-tile scene: 2x2 tiles, the time tile has an orange edge */
export function CheckScene() {
  const tile = (x, y, accent = false) => (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="38" height="30" rx="2" fill="#fff" {...base} strokeWidth={2.5} />
      {accent && <rect x="2" y="2" width="34" height="26" rx="1" fill="none" stroke={ORG} strokeWidth={2.5} opacity="0.9" />}
      <path d="M6 9 H32" strokeWidth="2" opacity="0.4" />
      <path d="M6 19 H32" strokeWidth="2" opacity="0.4" />
    </g>
  );
  return (
    <svg viewBox="0 0 128 96" aria-hidden="true">
      {tile(12, 10)}
      {tile(78, 10, true)}
      {tile(12, 50)}
      {tile(78, 50)}
      <path d="M60 30 H66 Q70 36 74 30" {...base} stroke={ORG} strokeWidth="2.5" opacity="0.85" />
    </svg>
  );
}

/* Prepare — counter-script scene: phone to agent, orange "say this" tick */
export function PrepareScene() {
  return (
    <svg viewBox="0 0 128 96" aria-hidden="true">
      <Phone x={14} y={14} scale={0.85} />
      <g transform="translate(104 30)" {...base}>
        <circle cx="0" cy="0" r="11" fill="#fff" />
        <path d="M-13 30 Q0 14 13 30" />
      </g>
      <path d="M46 44 H86" {...base} strokeWidth="2.5" />
      <path d="M80 38 L88 44 L80 50" {...base} strokeWidth="2.5" />
      <path d="M56 20 L60 24" {...base} strokeWidth="2" opacity="0.5" />
      <path d="M56 58 L60 62" {...base} strokeWidth="2" opacity="0.5" />
      <path d="M70 30 L74 26 L78 32" {...base} stroke={ORG} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Call — assisted call scene: phone, listening pulses, HaqVaani ear */
export function CallScene() {
  return (
    <svg viewBox="0 0 128 96" aria-hidden="true">
      <Phone x={18} y={12} scale={0.9} />
      <path d="M52 36 Q62 28 72 36" {...base} stroke={ORG} strokeWidth="2.5" opacity="0.9" />
      <path d="M48 44 Q62 34 76 44" {...base} stroke={ORG} strokeWidth="2.5" opacity="0.5" strokeDasharray="3 3" />
      <path d="M44 52 Q62 42 80 52" {...base} stroke={ORG} strokeWidth="2.5" opacity="0.3" strokeDasharray="2 4" />
      <g transform="translate(96 44)" {...base}>
        <circle cx="0" cy="0" r="9" fill="#fff" />
        <path d="M4 2 V9" strokeWidth="2.5" stroke={ORG} />
      </g>
    </svg>
  );
}

/* Docket — capture scene: transcript lines, orange tick, docket strip, small stamp */
export function DocketScene() {
  return (
    <svg viewBox="0 0 128 96" aria-hidden="true">
      <g transform="translate(12 14)">
        <rect width="50" height="60" rx="2" fill="#fff" {...base} strokeWidth={2.5} />
        <path d="M6 10 H44" strokeWidth="2" opacity="0.4" />
        <path d="M6 23 H44" strokeWidth="2" opacity="0.4" />
        <path d="M6 36 H44" strokeWidth="2" opacity="0.4" />
        <path d="M6 49 H44" strokeWidth="2" opacity="0.4" />
      </g>
      <path d="M66 44 L74 36 L84 48" {...base} stroke={ORG} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
      <DocketStrip x={78} y={34} w={48} h={28} />
      <g transform="translate(38 64)" {...base}>
        <circle cx="0" cy="0" r="8" fill="none" stroke={ORG} strokeWidth={2.5} />
        <polyline points="2,2 4,6 8,0" fill="none" stroke={ORG} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/* Rights — rights scene: clock at deadline + ledger doc + docket strip. Companion to RightsCheck. */
export function RightsScene() {
  return (
    <svg viewBox="0 0 128 96" aria-hidden="true">
      <Clock x={26} y={36} r={28} late={true} />
      <Doc x={72} y={16} w={48} h={62} lines={5} />
      <path d="M80 40 L88 34 L98 46" stroke={ORG} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.95} />
      <DocketStrip x={22} y={66} w={56} h={18} />
    </svg>
  );
}

/* Dossier — folder scene: folder with tab, docket tab, big stamp */
export function DossierScene() {
  return (
    <svg viewBox="0 0 128 96" aria-hidden="true">
      <g transform="translate(22 14)" {...base}>
        <path d="M0 12 H64 V50 H0 Z" fill="#fff" />
        <path d="M0 12 L20 0 L44 12" fill="#fff" strokeWidth={2.5} />
        <path d="M6 22 H58" strokeWidth="2" opacity="0.4" />
        <path d="M6 32 H58" strokeWidth="2" opacity="0.4" />
        <path d="M6 42 H58" strokeWidth="2" opacity="0.4" />
      </g>
      <g transform="translate(72 14)" {...base}>
        <rect x="0" y="0" width="30" height="20" rx="2" fill="#fff" />
        <path d="M6 6 H24" strokeWidth="2" opacity="0.4" />
        <path d="M6 12 H24" strokeWidth="2" opacity="0.4" />
      </g>
      <g transform="translate(44 58)">
        <StampMark x={0} y={0} big />
      </g>
    </svg>
  );
}
