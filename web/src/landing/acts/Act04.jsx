// Act 04 — Your right, paid. The vault opens, the money returns, CREDITED.
// Ported as-is from optimizing-ui-visual-storytelling (identical scene + timeline).
import { Act } from "./Act";
import { Bank } from "../art/Bank";
import { CitizenFigure } from "../art/Citizen";
import { PhoneBase, PhoneCredited, PhoneFrame } from "../art/Phone";
import { Confetti, Ear, GRN, Ground, Hatch, INK, ORG, Spark, Stamp } from "../art/Effects";
import { inr } from "../data/scenario";

// the BACK route: bank vault -> phone (cubic bezier so sparks and coins can ride it)
const P = [[1060, 612], [960, 692], [720, 692], [598, 585]];
const bez = (t) => {
  const u = 1 - t;
  const f = (i) => u * u * u * P[0][i] + 3 * u * u * t * P[1][i] + 3 * u * t * t * P[2][i] + t * t * t * P[3][i];
  return [f(0), f(1)];
};

export default function Act04({ s }) {
  const total = inr(s.total_refund);
  const sparkAt = [0.25, 0.5, 0.75].map(bez);

  return (
    <Act
      id="act4"
      num={4}
      title="Your right, paid."
      en={`${total} back. Docket on record.`}
      hi={`${total} वापस। शिकायत दर्ज।`}
      aria={`Act 4. The bank refunds ${inr(s.principal)} plus ${inr(s.compensation)} compensation, ${total} in all, and the citizen celebrates. / ${total} खाते में वापस आए।`}
      deps={[s.total_refund]}
      build={(tl, q) => {
        tl.fromTo(q(".bank-open"), { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.1)
          .fromTo(q(".back-route"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.2);

        (q(".back-coin") || []).forEach((c, i) => {
          const p = { t: 0 };
          tl.fromTo(
            p,
            { t: 0 },
            {
              t: 1,
              duration: 1.6,
              ease: "power1.inOut",
              onUpdate: () => {
                const [x, y] = bez(p.t);
                c.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
                c.style.opacity = p.t > 0.01 && p.t < 0.99 ? "1" : "0";
              },
            },
            0.5 + i * 0.3
          );
        });

        tl.fromTo(q(".glint"), { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.3, stagger: 0.45, transformOrigin: "50% 50%" }, 0.9)
          .fromTo(q(".ph-credited"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 2.4)
          .fromTo(q(".tick-badge"), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 2.7)
          .fromTo(q(".tick"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4 }, 2.8)
          .to(q(".pose-waiting"), { opacity: 0, duration: 0.3 }, 2.5)
          .to(q(".pose-cheer"), { opacity: 1, duration: 0.3 }, 2.5)
          .fromTo(q(".stamp-credit"), { opacity: 0, scale: 1.7, svgOrigin: "840 290" }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, 3.0)
          .fromTo(q(".confetti-bit"), { opacity: 0, y: -70 }, { opacity: 1, y: 0, duration: 0.6, stagger: { each: 0.02, from: "random" } }, 3.1)
          .fromTo(q(".whisper"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 3.7);
      }}
    >
      <Ground />

      <Hatch x={314} y={64} w={288} h={586} opacity={0.12} />
      <PhoneFrame x={300} y={50} scale={0.8}>
        <PhoneBase amount={"+" + total} tone="in" utr={s.utr} />
        <PhoneCredited style={{ opacity: 0 }} />
      </PhoneFrame>

      <CitizenFigure x={40} y={350} poses={["waiting", "cheer"]} />

      {/* whisper: a voice (₹ chip) in the citizen's ear */}
      <g className="whisper" style={{ opacity: 0 }}>
        <path d="M216 266 Q 190 290 156 316" fill="none" stroke={INK} strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
        <circle cx="240" cy="252" r="26" fill="#fff" stroke={INK} strokeWidth="3.5" />
        <text x="240" y="263" textAnchor="middle" fontSize="32" className="t-disp" fill={GRN}>₹</text>
        <Ear at={[132, 326]} s={0.9} />
      </g>

      {/* the money comes BACK */}
      <path className="back-route" d={`M${P[0]} C${P[1]} ${P[2]} ${P[3]}`} fill="none" stroke={GRN} strokeWidth="3.5" strokeDasharray="2 11" strokeLinecap="round" style={{ opacity: 0 }} />
      <Bank open />
      {sparkAt.map(([x, y], i) => (
        <Spark key={i} at={[x, y - 38]} r={i === 1 ? 16 : 12} color={i === 1 ? GRN : ORG} className="glint" style={{ opacity: 0 }} />
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i} className="back-coin" style={{ opacity: 0 }}>
          <circle r="21" fill="#ffd45e" stroke={INK} strokeWidth="3.5" />
          <circle r="14.5" fill="none" stroke={INK} strokeOpacity="0.4" strokeWidth="2" />
          <text y="8" textAnchor="middle" fontSize="22" className="t-disp" fill={INK}>₹</text>
        </g>
      ))}

      <Confetti box={{ x: 60, y: 30, w: 1080, h: 300 }} />
      <Stamp x={840} y={290} rotate={-6} color={GRN} w={380} h={96} fontSize={46} lines={["CREDITED ✓"]} className="stamp-credit" style={{ opacity: 0 }} />
    </Act>
  );
}
