// One figure, six poses. Poses are stacked layers (class `pose pose-<name>`) so a timeline
// can cross-fade them. The first pose in `poses` starts visible.
import type { ReactNode } from "react";
import { INK, ORG, ShockMarks } from "./Effects";

export type Pose = "idle" | "tapping" | "frozen" | "shocked" | "waiting" | "cheer";

const SKIN = "#f1c9a5";
const SHIRT = "#ffffff";
const PANTS = "#d4cbb8";

function Arm({ d, hand }: { d: string; hand: [number, number] }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth="12" />
      <path d={d} stroke={SHIRT} strokeWidth="6" />
      <circle cx={hand[0]} cy={hand[1]} r="6" fill={SKIN} stroke={INK} strokeWidth="2.5" />
    </g>
  );
}

function Mouth({ d, fill = "none" }: { d: string; fill?: string }) {
  return <path d={d} fill={fill} strokeWidth="2.6" />;
}

function Phone({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  return (
    <g transform={`rotate(${rot} ${x + 8} ${y + 14})`}>
      <rect x={x} y={y} width="17" height="29" rx="3.5" fill={INK} stroke={INK} />
      <rect x={x + 2.5} y={y + 4} width="12" height="21" rx="1.5" fill={ORG} stroke="none" />
    </g>
  );
}

const LAYERS: Record<Pose, () => ReactNode> = {
  idle: () => (
    <>
      <Mouth d="M73 60 Q80 65 87 60" />
      <Arm d="M62 94 L52 140 L54 182" hand={[54, 186]} />
      <Arm d="M98 94 L108 140 L106 182" hand={[106, 186]} />
    </>
  ),
  tapping: () => (
    <>
      <Mouth d="M73 60 Q80 65 87 60" />
      <Arm d="M62 94 L52 140 L54 182" hand={[54, 186]} />
      <Arm d="M98 94 L116 138 L144 120" hand={[144, 120]} />
      <Phone x={140} y={96} rot={14} />
    </>
  ),
  frozen: () => (
    <>
      <Mouth d="M74 61 H86" />
      <Arm d="M62 94 L70 138 L106 126" hand={[107, 126]} />
      <Phone x={102} y={100} />
      <Arm d="M98 94 L118 136 L114 122" hand={[114, 122]} />
      <path d="M110 22 Q105 31 110 36 Q115 31 110 22 Z" fill="#bfe3ee" strokeWidth="2" />
      <path d="M122 34 Q118 41 122 45 Q126 41 122 34 Z" fill="#bfe3ee" strokeWidth="2" />
    </>
  ),
  shocked: () => (
    <>
      <Mouth d="M76 58 A4.5 5 0 1 0 84 58 Z" fill="#fff" />
      <Arm d="M60 94 L50 68 L66 60" hand={[67, 60]} />
      <Arm d="M100 94 L110 68 L94 60" hand={[93, 60]} />
      <ShockMarks at={[80, -2]} />
    </>
  ),
  waiting: () => (
    <>
      <Mouth d="M74 62 Q80 58 86 62" />
      <Arm d="M62 94 L70 132 L100 124" hand={[101, 124]} />
      <Arm d="M98 94 L90 136 L60 128" hand={[59, 128]} />
    </>
  ),
  cheer: () => (
    <>
      <Mouth d="M70 57 Q80 74 90 57 Z" fill="#fff" />
      <Arm d="M62 94 L40 62 L34 26" hand={[34, 22]} />
      <Arm d="M98 94 L120 62 L126 26" hand={[126, 22]} />
      <path d="M18 40 L8 34 M20 12 L12 4 M142 40 L152 34 M140 12 L148 4" stroke={ORG} strokeWidth="3.5" strokeLinecap="round" />
    </>
  ),
};

export function CitizenFigure({ x = 0, y = 0, scale = 1, poses, className = "" }: { x?: number; y?: number; scale?: number; poses: Pose[]; className?: string }) {
  return (
    <g className={`citizen ${className}`} transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {/* legs + shoes */}
      <path d="M62 176 L60 300 L78 300 L80 196 L82 196 L84 300 L100 300 L98 176 Z" fill={PANTS} />
      <path d="M64 300 H44 M96 300 H116" strokeWidth="7" />
      <path d="M62 150 H98 M60 176 H100" opacity="0.35" />
      {/* torso: shirt, collar, placket, buttons, pocket */}
      <path d="M74 66 V86 M86 66 V86" stroke={INK} strokeWidth="3" fill={SKIN} />
      <path d="M60 94 Q60 84 70 84 H90 Q100 84 100 94 L100 176 H60 Z" fill={SHIRT} />
      <path d="M66 84 L80 96 L94 84 M80 96 V176" />
      <circle cx="80" cy="116" r="1.8" fill={INK} />
      <circle cx="80" cy="140" r="1.8" fill={INK} />
      <rect x="86" y="112" width="12" height="12" rx="2" opacity="0.5" />
      {/* head: ears, face, hair, eyes, brows, nose */}
      <circle cx="57" cy="46" r="4.5" fill={SKIN} />
      <circle cx="103" cy="46" r="4.5" fill={SKIN} />
      <circle cx="80" cy="46" r="24" fill={SKIN} />
      <path d="M57 44 C55 22 70 16 80 16 C94 16 106 26 103 46 C100 36 96 26 84 24 C72 22 62 30 57 44 Z" fill={INK} />
      <circle cx="72" cy="50" r="3.4" fill="#fff" strokeWidth="2" />
      <circle cx="72" cy="50" r="1.7" fill={INK} stroke="none" />
      <circle cx="88" cy="50" r="3.4" fill="#fff" strokeWidth="2" />
      <circle cx="88" cy="50" r="1.7" fill={INK} stroke="none" />
      <path d="M66 41 Q72 38 77 41 M83 41 Q89 38 94 41" strokeWidth="2.4" />
      <path d="M80 49 Q83 54 79 55" strokeWidth="2.2" />
      {/* pose layers */}
      {poses.map((p, i) => (
        <g key={p} className={`pose pose-${p}`} style={{ opacity: i === 0 ? 1 : 0 }}>
          {LAYERS[p]()}
        </g>
      ))}
    </g>
  );
}

export default CitizenFigure;
