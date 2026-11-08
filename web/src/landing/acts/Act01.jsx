// Act 01 — Money gone. The payment breaks; the coin freezes; FAILED.
// Ported as-is from optimizing-ui-visual-storytelling (identical scene + timeline).
import { useId } from "react";
import { Act } from "./Act";
import { Bank } from "../art/Bank";
import { CitizenFigure } from "../art/Citizen";
import { PhoneBase, PhoneFrame, PhoneStuck } from "../art/Phone";
import { Ground, Halftone, Hatch, INK, ORG, SpeedLines, Stamp } from "../art/Effects";
import { inr } from "../data/scenario";

function Barrier({ x, y }) {
  const id = useId();
  return (
    <g className="barrier" style={{ opacity: 0 }} transform={`translate(${x} ${y})`}>
      <defs>
        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="16" height="16" fill="#fff" />
          <rect width="8" height="16" fill={ORG} />
        </pattern>
      </defs>
      <path d="M7 0 V-96" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <rect x="-34" y="-118" width="82" height="30" rx="4" fill={ORG} stroke={INK} strokeWidth="3" />
      <text x="7" y="-96" textAnchor="middle" fontSize="22" className="t-disp" fill="#fff" style={{ letterSpacing: "0.1em" }}>HELD</text>
      <rect x="-4" y="-60" width="22" height="60" fill={`url(#${id})`} stroke={INK} strokeWidth="3" />
      <rect x="-12" y="-4" width="38" height="8" rx="2" fill={INK} />
    </g>
  );
}

export default function Act01({ s }) {
  const amt = inr(s.principal);
  return (
    <Act
      id="act1"
      num={1}
      title="Money gone."
      en={`${amt} left your account. Never reached the bank.`}
      hi={`${amt} आपके खाते से कट गए। बैंक तक पहुँचे ही नहीं।`}
      aria={`Act 1. ${amt} was debited from the citizen's account but the payment got stuck before reaching the bank. / ${amt} खाते से कट गए पर बैंक तक नहीं पहुँचे।`}
      deps={[s.principal]}
      build={(tl, q) => {
        tl.fromTo(q(".ph-stuck"), { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.3)
          .fromTo(q(".barrier"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.8)
          .to(q(".pose-tapping"), { opacity: 0, duration: 0.3 }, 0.8)
          .to(q(".pose-frozen"), { opacity: 1, duration: 0.3 }, 0.8)
          .fromTo(q(".coin-g"), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.8)
          .fromTo(q(".coin-g"), { x: 0 }, { x: 250, duration: 1.2, ease: "power1.in" }, 1.0)
          .to(q(".speed"), { opacity: 0, duration: 0.2 }, 2.1)
          .to(q(".pose-frozen"), { opacity: 0, duration: 0.25 }, 2.05)
          .to(q(".pose-shocked"), { opacity: 1, duration: 0.25 }, 2.05)
          .fromTo(q(".freeze"), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 2.2)
          .fromTo(q(".stamp-fail"), { opacity: 0, scale: 1.7, svgOrigin: "760 300" }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, 2.25);
      }}
    >
      <Halftone x={880} y={40} w={300} h={300} />
      <Ground />

      <Hatch x={314} y={64} w={288} h={586} opacity={0.12} />
      <PhoneFrame x={300} y={50} scale={0.8}>
        <PhoneBase amount={"-" + amt} utr={s.utr} />
        <PhoneStuck style={{ opacity: 0 }} />
      </PhoneFrame>

      <CitizenFigure x={40} y={350} poses={["tapping", "frozen", "shocked"]} />

      {/* the route the money was supposed to take */}
      <path d="M600 585 H895" stroke={INK} strokeWidth="3" strokeDasharray="2 12" strokeLinecap="round" />
      <path d="M884 573 L898 585 L884 597" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      <Barrier x={902} y={650} />
      <Bank />

      {/* the coin: flies, then freezes in an ice shell */}
      <g transform="translate(600 585)">
        <g className="coin-g" style={{ opacity: 0 }}>
          <SpeedLines className="speed" from={[-34, 0]} to={[-130, 0]} n={5} spread={13} />
          <g className="freeze" style={{ opacity: 0 }}>
            <path d="M0 -40 L9 -30 L24 -34 L30 -20 L42 -10 L34 4 L40 18 L26 26 L20 40 L4 34 L-10 42 L-18 28 L-34 26 L-34 10 L-42 -4 L-30 -14 L-30 -30 L-14 -30 Z" fill="#bfe3ee" fillOpacity="0.85" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M-10 -34 L-4 -20 L-14 -12 M20 30 L12 18 L22 10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          </g>
          <circle r="25" fill="#fff" stroke={INK} strokeWidth="3.5" />
          <circle r="18" fill="none" stroke={ORG} strokeWidth="2.5" />
          <text y="9" textAnchor="middle" fontSize="26" className="t-disp" fill={ORG}>₹</text>
        </g>
      </g>

      <Stamp x={760} y={300} rotate={-9} w={340} h={96} fontSize={52} color={ORG} lines={["FAILED"]} className="stamp-fail" style={{ opacity: 0 }} />
    </Act>
  );
}
