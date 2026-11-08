import { useEffect, useState } from "react";

/* prefers-reduced-motion: when set, the landing and the rail render static
   final layouts — no Lenis, no ScrollTrigger pin/scrub, no SMIL, no counters */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = (e) => setReduced(e.matches);
    mq.addEventListener ? mq.addEventListener("change", fn) : mq.addListener(fn);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", fn) : mq.removeListener(fn);
    };
  }, []);
  return reduced;
}
