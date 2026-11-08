// Graphic effects shared by all four acts. Pure vector, no prose.
// Ported as-is from optimizing-ui-visual-storytelling (identical visuals).
import { useId } from "react";

export const INK = "#282828";
export const ORG = "#fa3600";
export const GRN = "#1a7f4b";
export const PAPER = "#f4efe4";

/** Diagonal hatch shadow, the flat-shading move. */
export function Hatch({ x, y, w, h, opacity = 0.14, gap = 7 }) {
  const id = useId();
  return (
    <>
      <defs>
        <pattern id={id} width={gap} height={gap} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2={gap} stroke={INK} strokeWidth="1.6" />
        </pattern>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} opacity={opacity} />
    </>
  );
}

/** Halftone dot field. */
export function Halftone({ x, y, w, h, gap = 14, r = 1.8, color = INK, opacity = 0.18 }) {
  const dots = [];
  for (let cy = y + gap / 2; cy < y + h; cy += gap) {
    for (let cx = x + gap / 2; cx < x + w; cx += gap) {
      const t = Math.min(1, Math.max(0.25, ((cx - x) / w + (1 - (cy - y) / h)) / 1.4));
      dots.push(<circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r * t * 1.5} fill={color} />);
    }
  }
  return <g opacity={opacity}>{dots}</g>;
}

/** Jagged starburst disc. */
export function Burst({ at, r = 60, n = 16, color = ORG, inner = 0.72, opacity = 1, className, style }) {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a = (i * Math.PI) / n;
    const rr = i % 2 === 0 ? r : r * inner;
    d += `${i === 0 ? "M" : "L"}${(at[0] + Math.cos(a) * rr).toFixed(1)} ${(at[1] + Math.sin(a) * rr).toFixed(1)}`;
  }
  return <path className={className} style={style} d={d + "Z"} fill={color} opacity={opacity} />;
}

/** Rotated rubber stamp: heavy border + uppercase display text. The show-don't-tell device. */
export function Stamp({ x, y, rotate = -8, w = 300, h = 84, color = ORG, lines, className, style, fontSize = 40 }) {
  return (
    <g className={className} style={style}>
      <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
        <rect x={-w / 2 + 6} y={-h / 2 + 6} width={w} height={h} fill={INK} opacity="0.1" rx={4} />
        <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#fffaf0" fillOpacity="0.85" stroke={color} strokeWidth="5" rx={4} />
        <rect x={-w / 2 + 8} y={-h / 2 + 8} width={w - 16} height={h - 16} fill="none" stroke={color} strokeWidth="1.5" rx={2} />
        {lines.map((l, i) => (
          <text
            key={i}
            y={lines.length === 1 ? fontSize * 0.36 : (i - (lines.length - 1) / 2) * (fontSize * 1.05) + fontSize * 0.36}
            textAnchor="middle"
            fontSize={lines.length === 1 ? fontSize : i === 0 ? fontSize : fontSize * 0.62}
            className="t-disp"
            style={{ fill: color, letterSpacing: "0.06em" }}
          >
            {l}
          </text>
        ))}
      </g>
    </g>
  );
}

/** Speed lines radiating along a direction (comic motion lines). */
export function SpeedLines({ from, to, n = 5, color = INK, spread = 26, className, style }) {
  const dx = to[0] - from[0], dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len, px = -uy, py = ux;
  return (
    <g className={className} style={style} stroke={color} strokeWidth="3" strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => {
        const off = (i - (n - 1) / 2) * spread;
        const l = len * (0.55 + (0.45 * Math.abs(i - (n - 1) / 2)) / ((n - 1) / 2 || 1));
        return <line key={i} x1={from[0] + px * off} y1={from[1] + py * off} x2={from[0] + ux * l + px * off} y2={from[1] + uy * l + py * off} />;
      })}
    </g>
  );
}

/** Jagged "shock" zigzag floating above a head. */
export function ShockMarks({ at, color = ORG, s = 1, className, style }) {
  return (
    <g className={className} style={style}>
      <g transform={`translate(${at[0]} ${at[1]}) scale(${s})`} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-26 -20 L-16 -30 L-20 -14 L-8 -24" />
        <path d="M10 -30 L18 -40 L16 -24 L28 -34" />
        <path d="M-2 -48 L6 -58 L4 -42" />
      </g>
    </g>
  );
}

/** Four-point sparkle (money glint). */
export function Spark({ at, r = 10, color = ORG, className, style }) {
  const [x, y] = at, k = r * 0.18;
  const d = `M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r} Z`;
  return (
    <g className={className} style={style}>
      <path d={d} fill={color} />
    </g>
  );
}

/** Scattered confetti (Act 04 only, the success state). */
export function Confetti({ box, n = 42 }) {
  const colors = [ORG, INK, GRN];
  return (
    <g className="confetti">
      {Array.from({ length: n }, (_, i) => {
        const cx = box.x + ((i * 97) % box.w), cy = box.y + ((i * 61) % box.h);
        const c = colors[i % 3];
        return (
          <g key={i} className="confetti-bit" style={{ opacity: 0 }}>
            {i % 2 === 0 ? (
              <rect x={cx} y={cy} width="7" height="11" rx="1.5" fill={c} transform={`rotate(${(i * 47) % 360} ${cx} ${cy})`} />
            ) : (
              <circle cx={cx} cy={cy} r="3.4" fill={c} />
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Ground line shared by every scene. */
export function Ground() {
  return (
    <g>
      <path d="M0 650 H1200" stroke={INK} strokeWidth="3" />
      <Hatch x={0} y={650} w={1200} h={50} opacity={0.1} />
    </g>
  );
}

/** Ear glyph (pictogram) with sound arcs. */
export function Ear({ at, s = 1, color = INK }) {
  return (
    <g transform={`translate(${at[0]} ${at[1]}) scale(${s})`} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-6 14 C-14 6 -14 -14 2 -16 C14 -17 18 -4 10 4 C6 8 6 12 2 16 C-2 20 -6 18 -6 14 Z" fill="#fff" />
      <path d="M-2 -6 C0 -9 6 -8 6 -3 C6 1 2 2 2 6" />
      <path d="M24 -6 Q30 0 24 6 M31 -12 Q42 0 31 12" stroke={ORG} />
    </g>
  );
}
