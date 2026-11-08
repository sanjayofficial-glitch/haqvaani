// Shared shell for an act: a tall section with a sticky stage; a scrubbed GSAP timeline
// plays as you scroll. With prefers-reduced-motion the timeline jumps to its final frame.
import { useLayoutEffect, useRef } from "react";
import type { DependencyList, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type Q = (selector: string) => Element[];
export type Build = (tl: gsap.core.Timeline, q: Q, root: HTMLElement) => void;

export function Act({
  id,
  num,
  title,
  en,
  hi,
  aria,
  build,
  deps,
  children,
}: {
  id: string;
  num: number;
  title: string;
  en: string;
  hi: string;
  aria: string;
  build: Build;
  deps: DependencyList;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const buildRef = useRef(build);
  buildRef.current = build;

  useLayoutEffect(() => {
    const root = ref.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root) as Q;
      const tl = gsap.timeline({
        paused: reduce,
        defaults: { ease: "none" },
        scrollTrigger: reduce
          ? undefined
          : { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true },
      });
      buildRef.current(tl, q, root);
      tl.to({}, { duration: 0.8 }); // hold the final frame a beat
      if (reduce) tl.progress(1);
    }, root);
    ScrollTrigger.refresh();
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return (
    <section ref={ref} id={id} className="act" aria-label={aria}>
      <div className="act__stage">
        <header className="act__head">
          <div>
            <div className="eyebrow">
              <span className="eyebrow__n">{String(num).padStart(2, "0")}</span> / 04
            </div>
            <h2 className="t-disp">{title}</h2>
          </div>
          <p className="annotation">
            {en}
            <span className="sec" lang="hi">{hi}</span>
          </p>
        </header>
        <svg className="scene" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMax meet" role="img" aria-label={aria}>
          {children}
        </svg>
      </div>
    </section>
  );
}
