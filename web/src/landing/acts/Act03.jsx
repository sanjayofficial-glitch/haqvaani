// Act 03 — ₹100 a day. The ruler, the coin stack, the giant compensation numeral.
// Ported as-is from optimizing-ui-visual-storytelling (identical scene + timeline).
import { Act } from "./Act";
import { Bank } from "../art/Bank";
import { Burst, Ground, INK, ORG, Stamp } from "../art/Effects";
import { inr } from "../data/scenario";

const CX = 380, RX = 110, RY = 14, T = 30, BASE = 590;
const MAX = 10;
const GOLD_TOP = "#ffd45e", GOLD_SIDE = "#e9b429";

function Coin({ k }) {
  const cy = BASE - (k - 1) * T;
  const ticks = [];
  for (let dx = -100; dx <= 100; dx += 10) if (Math.abs(dx) > 20) ticks.push(dx);
  const yEdge = (dx) => cy + RY * Math.sqrt(1 - (dx / RX) ** 2);
  return (
    <g className="coin-k" style={{ opacity: 0 }}>
      <path d={`M${CX - RX} ${cy} V${cy + T} A${RX} ${RY} 0 0 0 ${CX + RX} ${cy + T} V${cy} Z`} fill={GOLD_SIDE} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {ticks.map((dx) => (
        <line key={dx} x1={CX + dx} x2={CX + dx} y1={yEdge(dx) + 3} y2={yEdge(dx) + T - 3} stroke={INK} strokeOpacity="0.3" strokeWidth="1.8" />
      ))}
      <text x={CX} y={cy + RY + 22} textAnchor="middle" fontSize="22" className="t-disp" fill={INK}>₹</text>
      <ellipse cx={CX} cy={cy} rx={RX} ry={RY} fill={GOLD_TOP} stroke={INK} strokeWidth="3" />
      <ellipse cx={CX} cy={cy} rx={RX - 18} ry={RY - 4} fill="none" stroke={INK} strokeOpacity="0.35" strokeWidth="2" />
      {/* day label */}
      <path d={`M${CX + RX + 6} ${cy + 16} H${CX + RX + 26}`} stroke={INK} strokeWidth="2" strokeDasharray="2 4" strokeLinecap="round" />
      <text x={CX + RX + 34} y={cy + 22} fontSize="15" className="t-up" fill={INK} style={{ fontFamily: "var(--f-mono)", fontWeight: 700 }}>{`DAY ${k}`}</text>
    </g>
  );
}

export default function Act03({ s }) {
  const n = Math.min(s.overdue_days, MAX);
  const comp = inr(s.compensation);
  const fs = comp.length <= 4 ? 200 : comp.length === 5 ? 170 : comp.length === 6 ? 140 : 118;
  const top = BASE + T - n * T; // y of the ruler's top end

  return (
    <Act
      id="act3"
      num={3}
      title={`₹${s.per_day} × ${s.overdue_days} days.`}
      en={`${inr(s.per_day)} × ${s.overdue_days} days. The bank pays this.`}
      hi={`${inr(s.per_day)} × ${s.overdue_days} दिन। यह बैंक चुकाएगा।`}
      aria={`Act 3. The bank owes ${inr(s.per_day)} for each of ${s.overdue_days} days of delay, a total of ${comp}. / बैंक हर दिन ${inr(s.per_day)} देगा; कुल ${comp}।`}
      deps={[s.overdue_days, s.per_day]}
      build={(tl, q) => {
        const counter = { v: 0 };
        const el = q(".big-num")[0];
        const drop = 0.28;
        const dropEnd = 0.3 + drop * (n - 1) + 0.45;
        tl.fromTo(q(".stamp-rate"), { opacity: 0, scale: 1.6, svgOrigin: "930 130" }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, 0.1)
          .fromTo(q(".ruler"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.1)
          .fromTo(q(".coin-k"), { opacity: 0, y: -420 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.in", stagger: drop }, 0.3)
          .fromTo(q(".burst"), { opacity: 0, scale: 0.6, svgOrigin: "780 340" }, { opacity: 1, scale: 1, duration: dropEnd - 0.3 }, 0.3)
          .fromTo(q(".big-num"), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.4)
          .to(counter, { v: s.compensation, duration: dropEnd - 0.4, onUpdate: () => { el.textContent = inr(counter.v); } }, 0.4)
          .fromTo(q(".pays"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, dropEnd);
      }}
    >
      <Ground />

      {/* ruler: one tick per day */}
      <g className="ruler" style={{ opacity: 0 }}>
        <rect x="190" y={top} width="34" height={BASE + T - top} fill="#fffdf6" stroke={INK} strokeWidth="3" />
        {Array.from({ length: n + 1 }, (_, i) => {
          const y = BASE + T - i * T;
          return (
            <g key={i}>
              <line x1="190" x2={i % 5 === 0 ? 216 : 208} y1={y} y2={y} stroke={INK} strokeWidth="2.5" />
            </g>
          );
        })}
        <text transform={`translate(172 ${(BASE + T + top) / 2}) rotate(-90)`} textAnchor="middle" fontSize="18" className="t-disp" fill={INK} style={{ letterSpacing: "0.3em" }}>DAYS</text>
        {s.overdue_days > MAX && (
          <g transform={`translate(207 ${top - 24})`}>
            <circle r="18" fill={ORG} stroke={INK} strokeWidth="3" />
            <text y="6" textAnchor="middle" fontSize="16" className="t-disp" fill="#fff">{`+${s.overdue_days - MAX}`}</text>
          </g>
        )}
      </g>

      {/* the stack, bottom coin first so later days sit on top */}
      {Array.from({ length: n }, (_, i) => (
        <Coin key={i} k={i + 1} />
      ))}

      {/* giant numeral on a burst */}
      <g className="burst" style={{ opacity: 0 }}>
        <Burst at={[780, 340]} r={190} n={20} opacity={0.14} />
      </g>
      <text className="t-disp big-num" x="790" y={330 + fs * 0.36} textAnchor="middle" fontSize={fs} fill={ORG} style={{ opacity: 0 }}>₹0</text>

      {/* the bank pays */}
      <g className="pays" style={{ opacity: 0 }}>
        <path d="M1020 575 C 980 640, 880 640, 820 590" fill="none" stroke={INK} strokeWidth="3.5" strokeDasharray="2 11" strokeLinecap="round" />
        <path d="M836 594 L818 588 L824 606" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="920" cy="622" r="22" fill={GOLD_TOP} stroke={INK} strokeWidth="3" />
        <text x="920" y="631" textAnchor="middle" fontSize="26" className="t-disp" fill={INK}>₹</text>
      </g>
      <Bank x={1030} y={490} scale={0.75} />

      <Stamp x={930} y={130} rotate={-5} w={310} h={118} fontSize={46} lines={["₹" + s.per_day, "EVERY DAY"]} className="stamp-rate" style={{ opacity: 0 }} />
    </Act>
  );
}
