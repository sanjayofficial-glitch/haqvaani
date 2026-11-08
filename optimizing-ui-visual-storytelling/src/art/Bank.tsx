// Bank: architecture + an opening vault. `.bank-open` is the payoff layer a timeline can fade in.
import { INK, ORG } from "./Effects";

export function Bank({ x = 985, y = 425, open = false, scale = 1 }: { x?: number; y?: number; open?: boolean; scale?: number }) {
  return (
    <g className="bank" transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
      <rect x="10" y="84" width="140" height="111" fill="#fff" stroke="none" />
      <path d="M0 60 L80 14 L160 60 Z" fill="#fff" />
      <circle cx="80" cy="42" r="8" />
      <path d="M8 72 H152" />
      {[24, 62, 98, 136].map((cx) => (
        <g key={cx}>
          <path d={`M${cx - 7} 78 H${cx + 7} M${cx - 7} 84 H${cx + 7}`} />
          <path d={`M${cx} 84 V195`} strokeWidth="9" stroke="#e9e2d2" />
          <path d={`M${cx - 4.5} 84 V195 M${cx + 4.5} 84 V195`} />
        </g>
      ))}
      <rect x="4" y="195" width="152" height="10" fill="#fff" />
      <rect x="-6" y="205" width="172" height="10" fill="#fff" />
      <text x="80" y="62" textAnchor="middle" fontSize="13" className="t-up" stroke="none" fill={INK}>
        Bank
      </text>
      {open && (
        <g className="bank-open">
          <path d="M42 195 V128 Q80 96 118 128 V195 Z" fill="#fff4e8" stroke={INK} />
          <g stroke={ORG} opacity="0.9">
            <path d="M80 190 L22 112 M80 190 L80 82 M80 190 L138 112 M80 190 L48 100 M80 190 L112 100" strokeWidth="3" />
          </g>
          {[58, 80, 102].map((cx, i) => (
            <g key={cx}>
              <circle cx={cx} cy={184 - i * 4} r="8" fill="#fff" stroke={ORG} strokeWidth="2.5" />
              <text x={cx} y={188 - i * 4} textAnchor="middle" fontSize="10" stroke="none" fill={ORG} className="t-disp">
                ₹
              </text>
            </g>
          ))}
          <path d="M42 195 L30 138 L42 128 M118 195 L130 138 L118 128" strokeWidth="3.5" />
        </g>
      )}
    </g>
  );
}

export default Bank;
