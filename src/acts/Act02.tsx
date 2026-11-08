import { Act } from "./Act";
import { CitizenFigure } from "../art/Citizen";
import { Ground, GRN, Hatch, INK, ORG, Stamp } from "../art/Effects";
import type { Scenario } from "../data/scenario";

// torn, zig-zag top edge for the peeling calendar sheet
function tornSheet(x0: number, x1: number, yTop: number, yBottom: number) {
  let d = `M${x0} ${yTop + 6}`;
  let up = true;
  for (let x = x0 + 14; x < x1; x += 14) {
    d += ` L${x} ${yTop + (up ? -5 : 8)}`;
    up = !up;
  }
  return d + ` L${x1} ${yTop + 4} V${yBottom} H${x0} Z`;
}

const TILE = 76, GAP = 14, GX = 700, GY = 240;

export default function Act02({ s }: { s: Scenario }) {
  const shown = Math.min(s.elapsed, 9) + 1; // tiles 0..9
  const tiles = Array.from({ length: shown }, (_, i) => i);
  const pos = (i: number): [number, number] => [GX + (i % 5) * (TILE + GAP), GY + Math.floor(i / 5) * (TILE + GAP)];
  const overTiles = tiles.filter((i) => i > s.tat);
  const label = (i: number) => (i === 0 ? "T" : i === 9 && s.elapsed > 9 ? String(s.elapsed) : String(i));
  const [dx, dy] = pos(s.tat);

  return (
    <Act
      id="act2"
      num={2}
      title="The clock ran out."
      en={`RBI rule: T+${s.tat} days. Today is day ${s.overdue_days} past it.`}
      hi={`RBI नियम: T+${s.tat} दिन। आज नियम से ${s.overdue_days} दिन ऊपर।`}
      aria={`Act 2. RBI requires reversal within T+${s.tat} day. It is now ${s.overdue_days} days past the deadline. / RBI नियम T+${s.tat} दिन; अब ${s.overdue_days} दिन देरी।`}
      deps={[s.elapsed, s.tat, s.overdue_days]}
      build={(tl, q) => {
        const counter = { v: 1 };
        const num = q(".day-num")[0] as SVGTextElement;
        tl.fromTo(q(".seal"), { opacity: 0, scale: 1.4, svgOrigin: "760 120" }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 0)
          .fromTo(q(".seal-link"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.4)
          .to(q(".sheet-fly"), { rotate: -24, x: -90, y: 70, opacity: 0, duration: 0.8, svgOrigin: "250 590", ease: "power2.in" }, 0.3)
          .to(counter, { v: s.elapsed, duration: 0.3 + overTiles.length * 0.22, ease: "none", onUpdate: () => { num.textContent = String(Math.round(counter.v)); } }, 0.9)
          .fromTo(q(".over-tile"), { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.22 }, 1.0)
          .fromTo(q(".stamp-overdue"), { opacity: 0, scale: 1.7, svgOrigin: "930 500" }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, 1.1 + overTiles.length * 0.22);
      }}
    >
      <Ground />
      <CitizenFigure x={40} y={350} poses={["waiting"]} />

      {/* wall calendar */}
      <Hatch x={264} y={104} w={390} h={500} opacity={0.12} />
      <rect x="250" y="90" width="390" height="500" rx="14" fill="#fff" stroke={INK} strokeWidth="3.5" />
      <path d="M250 104 Q250 90 264 90 H626 Q640 90 640 104 V160 H250 Z" fill={ORG} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <text x="445" y="143" textAnchor="middle" fontSize="40" className="t-disp" fill="#fff" style={{ letterSpacing: "0.12em" }}>DAYS WAITING</text>
      <text x="445" y="440" textAnchor="middle" fontSize="300" className="t-disp day-num" fill={ORG}>1</text>
      <path d="M290 500 H600" stroke={INK} strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
      <g transform="translate(445 545)" fill={INK}>
        <path d="M-14 -16 V14 M-14 -16 H12 L6 -8 L12 0 H-14" fill={GRN} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <text x="26" y="9" fontSize="30" className="t-disp" fill={GRN}>{`T+${s.tat}`}</text>
      </g>
      {[300, 445, 590].map((cx) => (
        <g key={cx}>
          <rect x={cx - 6} y="72" width="12" height="34" rx="6" fill="#fff" stroke={INK} strokeWidth="3" />
        </g>
      ))}

      {/* the sheet that peels away, torn edge on top */}
      <g className="sheet-fly">
        <path d={tornSheet(250, 640, 160, 590)} fill="#fffdf6" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M250 590 H640" stroke={INK} strokeWidth="3.5" />
        <text x="445" y="440" textAnchor="middle" fontSize="300" className="t-disp" fill={INK}>0</text>
        <text x="445" y="540" textAnchor="middle" fontSize="30" className="t-disp" fill="#9a9384" style={{ letterSpacing: "0.12em" }}>MONEY LEFT TODAY</text>
        <path d="M640 590 L640 540 Q616 570 586 590 Z" fill="#e9e2d2" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      </g>

      {/* RBI seal -> deadline tile */}
      <path className="seal-link" d={`M790 168 Q ${dx + 10} 196 ${dx + 8} ${dy - 10}`} fill="none" stroke={GRN} strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
      <g className="seal">
        <g transform="translate(760 120)">
          <circle r="54" fill="#fff" stroke={INK} strokeWidth="4" />
          <circle r="46" fill="none" stroke={INK} strokeWidth="1.8" strokeDasharray="3 4" />
          <text y="-22" textAnchor="middle" fontSize="15" className="t-disp" fill={INK} style={{ letterSpacing: "0.2em" }}>RBI</text>
          <text y="14" textAnchor="middle" fontSize="42" className="t-disp" fill={INK}>₹</text>
          <text y="36" textAnchor="middle" fontSize="18" className="t-disp" fill={ORG} style={{ letterSpacing: "0.1em" }}>{`T+${s.tat}`}</text>
        </g>
      </g>

      {/* the day tiles: white until the deadline, orange after it */}
      {tiles.map((i) => {
        const [x, y] = pos(i);
        const isDeadline = i === s.tat;
        const over = i > s.tat;
        const fs = label(i).length > 1 ? 28 : 38;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <rect width={TILE} height={TILE} rx="9" fill={isDeadline ? "#e8f5ee" : "#fff"} stroke={isDeadline ? GRN : INK} strokeWidth={isDeadline ? 5 : 3} />
            <text x={TILE / 2} y={TILE / 2 + fs * 0.36} textAnchor="middle" fontSize={fs} className="t-disp" fill={isDeadline ? GRN : INK}>{label(i)}</text>
            {over && (
              <g className="over-tile" style={{ opacity: 0 }}>
                <rect width={TILE} height={TILE} rx="9" fill={ORG} stroke={INK} strokeWidth="3" />
                <path d="M10 66 L66 10 M24 70 L70 24 M0 52 L52 0" stroke="#fff" strokeOpacity="0.22" strokeWidth="4" />
                <text x={TILE / 2} y={TILE / 2 + fs * 0.36} textAnchor="middle" fontSize={fs} className="t-disp" fill="#fff">{label(i)}</text>
              </g>
            )}
          </g>
        );
      })}
      <g transform={`translate(${dx + TILE / 2} ${dy - 14})`}>
        <path d="M-9 8 V-14 M-9 -14 H11 L6 -8 L11 -2 H-9" fill={GRN} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      </g>

      <Stamp x={930} y={500} rotate={7} w={320} h={118} fontSize={44} lines={["OVERDUE", "+" + s.overdue_days + " DAYS"]} className="stamp-overdue" style={{ opacity: 0 }} />
    </Act>
  );
}
