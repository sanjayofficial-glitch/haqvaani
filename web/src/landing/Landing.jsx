/* ==========================================================================
   The HaqVaani landfall — scroll-driven, cinematic storytelling.
   Four acts mapped to the citizen's journey in the merged Heron×HaqVaani
   language: stark editorial white, charcoal ink, hairline rules, ONE orange
   signal accent (#fa3600), mono technical voice. Visual-first: ghost
   numerals, marquee tickers, masked line reveals, pinned scrub scenes,
   parallax art — prose is cut to short captions. (epic-design: 2.5D
   depth layers, marquee, line-mask reveal, scrub timelines — all GPU-safe
   transform/opacity/clip-path, all disabled under reduced motion.)
     Act 01  KAT GAYA   — payment breaks: coin travels, stops at the break
     Act 02  RULE       — the RBI clock: giant T+1 numeral, line draws
     Act 03  ₹100/DIN   — the compensation ticker counts (orange mono)
     Act 04  WAPAS      — refund credited: the ONLY place --success appears
   Lenis + GSAP ScrollTrigger. `data-tone` sections keep the old contract;
   the edge rail is scrub-linked to scroll.                          */

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useReducedMotion } from "../hooks/useReducedMotion.js";
import { useMode } from "../hooks/useMode.jsx";
import { useWorksExample } from "../hooks/useWorksExample.js";
import { fmtInr } from "../lib/format.js";
import { Pair } from "../lib/i18n.jsx";
import { TxnBreak, LedgerArt, WhisperArt, Stamp, DeadLineRule } from "../components/Svg.jsx";

gsap.registerPlugin(ScrollTrigger);

const RAIL_STEPS = [
  { en: "Speak",   hi: "बोलें",      el: "#actKat" },
  { en: "Check",   hi: "जाँच",       el: "#actRule" },
  { en: "Prepare", hi: "तैयार करें", el: "#actDin" },
  { en: "Call",    hi: "कॉल",        el: "#actWapas" },
  { en: "Prove",   hi: "सबूत",       el: "#journey" },
];

/* ------------------------------------------------------------ edge rail -- */
function EdgeRail({ reduced }) {
  const progressRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    let raf = null;
    const update = () => {
      raf = null;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (progressRef.current) progressRef.current.style.height = p * 100 + "%";
    };
    const onScroll = () => {
      if (raf || reduced) {
        update();
        return;
      }
      raf = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const idx = RAIL_STEPS.findIndex((s) => s.el === "#" + e.target.id);
          if (idx >= 0) setActiveIdx(idx);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    RAIL_STEPS.forEach((s) => {
      const t = document.querySelector(s.el);
      if (t) io.observe(t);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      io.disconnect();
    };
  }, [reduced]);

  return (
    <aside className="edge-rail" aria-hidden="true">
      <div className="er-line-rail" />
      <div className="er-line-progress" ref={progressRef} />
      {RAIL_STEPS.map((s, i) => (
        <div key={s.en} className={"er-step" + (i === activeIdx ? " on" : "")}>
          <span className="er-hashtag" />
          <span className="er-label">0{i + 1} {s.en}</span>
        </div>
      ))}
    </aside>
  );
}

/* ------------------------------------------------------------------ nav -- */
function LandingNav({ mode }) {
  return (
    <nav className="landing-nav" aria-label="मुख्य नेविगेशन">
      <div className="wrap">
        <a className="brand" href="#top" aria-label="हक़-वाणी · HaqVaani">
          <span className="hi" lang="hi-IN">हक़-वाणी</span>
          <small>RBI statutory refund advocate</small>
        </a>
        <div className="links">
          <a href="#actKat"><Pair hi="कट गया" en="Act 01" /></a>
          <a href="#actRule"><Pair hi="क़ानून" en="Act 02" /></a>
          <a href="#actDin"><Pair hi="₹100/दिन" en="Act 03" /></a>
          <a href="#actWapas"><Pair hi="वापस" en="Act 04" /></a>
          <a href="#journey"><Pair hi="5 क़दम" en="the 5 steps" /></a>
        </div>
        <div className="head-tools">
          <span className="chip" data-mode={mode}>
            <span className="dot" aria-hidden="true"></span>
            {mode === "live" ? "Live · Gnani connected" : "Synthetic demo (demo)"}
          </span>
          <a className="btn btn--primary" style={{ minHeight: 52, minWidth: 0, padding: "12px 22px" }} href="#/start-case">
            <Pair hi="शुरू करें" en="Start my case" />
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ---------------------------------------------------------------- acts --- */
function ActKicker({ n, en, hi }) {
  return (
    <p className="act-kicker">
      <span style={{ color: "var(--accent)" }}>{n}</span>&nbsp;·&nbsp;<Pair hi={hi} en={en} />
    </p>
  );
}

/* ghost layer: giant background numeral (depth-0) */
function GhostNum({ children, cls = "", style = {} }) {
  return (
    <div className={"ghost-num " + cls} aria-hidden="true" style={style}>
      {children}
    </div>
  );
}

/* mono marquee ticker — pure CSS loop (killed by reduced motion) */
function Marquee({ items, tone = "" }) {
  const row = items.concat(items); /* duplicate for seamless loop */
  return (
    <div className={"marquee " + tone} aria-hidden="true">
      <div className="marquee-track">
        {row.map((it, i) => (
          <span className="marquee-item" key={i}>{it}</span>
        ))}
      </div>
    </div>
  );
}

/* masked line reveal: each <Line mask> wraps one line of the headline */
function Line({ children, as = "span" }) {
  const Tag = as;
  return (
    <span className="hd-mask">
      <Tag className="hd-line">{children}</Tag>
    </span>
  );
}

/* Act 01 — KAT GAYA · hero + the break diagram + coin travel */
function HeroAct({ reduced, works }) {
  const sceneRef = useRef(null);
  const coinWrap = useRef(null);

  useEffect(() => {
    if (reduced || !sceneRef.current) return undefined;
    const ctx = gsap.context(() => {
      /* headline lines rise out of their masks */
      gsap.from(sceneRef.current.querySelectorAll(".hd-line"), {
        yPercent: 115,
        stagger: 0.1,
        duration: 0.9,
        ease: "power4.out",
        scrollTrigger: { trigger: sceneRef.current, start: "top 70%", toggleActions: "play none none none" },
      });
      /* the coin travels the hairline, stops at the break */
      const coin = coinWrap.current && coinWrap.current.querySelector(".coin-g");
      if (coin) {
        gsap.fromTo(
          coin,
          { xPercent: -26, opacity: 0.2 },
          {
            xPercent: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: coinWrap.current, start: "top 85%", end: "center 60%", scrub: true },
          }
        );
      }
      /* subtle parallax on the ghost numeral */
      gsap.to(sceneRef.current.querySelector(".ghost-num"), {
        yPercent: 18,
        ease: "none",
        scrollTrigger: { trigger: sceneRef.current, start: "top bottom", end: "bottom top", scrub: true },
      });
      /* art and info float at different depths */
      gsap.to(sceneRef.current.querySelector(".hero-art"), {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: sceneRef.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    });
    return () => ctx.revert();
  }, [reduced]);

  const over = works.ent.days_overdue || 0;

  return (
    <section className="act act-hero" id="actKat" data-tone="cyan" ref={sceneRef} style={{ paddingTop: "110px" }}>
      <GhostNum cls="hero-ghost">{fmtInr(3200)}</GhostNum>
      <div className="act-inner">
        <ActKicker n="ACT 01" en="kat gaya — money deducted" hi="कट गया — पैसा कट गया" />
        <h1 className="display hero-h1" lang="hi-IN">
          <Line>पैसा कट गया,</Line>
          <Line>पहुँचा नहीं।</Line>
        </h1>
        <p className="sub hero-sub" style={{ color: "var(--ink-2)" }}>
          Money left. The law has a clock. Your voice builds the proof.
        </p>
        <div className="hero-cta row">
          <a className="btn btn--primary" href="#/start-case">
            <span style={{ display: "inline-flex", alignItems: "baseline", gap: 10 }}>
              <span lang="hi-IN" style={{ fontWeight: 700 }}>शुरू करें</span>
              <span style={{ fontSize: ".78em", opacity: 0.85 }}>Start my case</span>
            </span>
          </a>
          <a className="btn btn--line" href="#/rights-check">
            <span style={{ display: "inline-flex", alignItems: "baseline", gap: 10 }}>
              <span lang="hi-IN">हक जाँचें</span>
              <span style={{ fontSize: ".78em", opacity: 0.85 }}>check my rights</span>
            </span>
          </a>
        </div>
        <div ref={coinWrap} className="hero-art" style={{ marginTop: "var(--s-lg)" }}>
          <TxnBreak parallaxClass="act-fig" />
        </div>
        <p className="caption mute-3 src-note" style={{ marginTop: "var(--s-sm)" }}>
          <Pair
            hi={over > 0 ? `सैंपल · ${over} दिन देरी = ${fmtInr(works.ent.penalty_inr)} क्षतिपूर्ति तक` : "सैंपल · synthetic demo"}
            en={over > 0 ? `Sample · ${over} days overdue = up to ${fmtInr(works.ent.penalty_inr)} compensation` : "Sample · synthetic demo"}
          />
        </p>
      </div>
      <Marquee
        tone="accent"
        items={[
          "UTR 629188340112",
          "18 OCT 2026",
          "₹3,200 · UPI P2P",
          "KAT GAYA — पैसा कट गया",
          "RBI/2019-20/67",
        ]}
      />
    </section>
  );
}

/* Act 02 — RULE · the RBI clock, pinned scrub scene */
function RuleAct({ reduced, works }) {
  const sceneRef = useRef(null);
  const lineDraw = useRef(null);
  const [staticProgress, setStaticProgress] = useState(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      setStaticProgress(1);
      return undefined;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineDraw.current,
        { scaleX: 0.02 },
        {
          scaleX: 1,
          transformOrigin: "0 20px",
          ease: "none",
          scrollTrigger: {
            trigger: sceneRef.current,
            start: "top 70%",
            end: "center 40%",
            scrub: true,
          },
        }
      );
      gsap.from(sceneRef.current.querySelectorAll(".rule-payload > *"), {
        opacity: 0,
        y: 24,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: { trigger: sceneRef.current, start: "top 55%" },
      });
      gsap.to(sceneRef.current.querySelector(".ghost-num"), {
        yPercent: 20,
        ease: "none",
        scrollTrigger: { trigger: sceneRef.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    });
    return () => ctx.revert();
  }, [reduced]);

  const tat = works.ent.tat_date;

  return (
    <section className="act" id="actRule" data-tone="red" ref={sceneRef}>
      <GhostNum cls="rule-ghost">T+1</GhostNum>
      <div className="act-inner">
        <div className="rule-payload">
          <ActKicker n="ACT 02" en="rule — the law's clock" hi="क़ानून की घड़ी" />
          <h2 className="d-lg" lang="hi-IN" style={{ marginBottom: "var(--s-md)" }}>
            नियम आपकी तरफ़ है।
          </h2>
          <div className="rule-meta">
            <div className="rule-chip"><span className="k">T</span><span className="v num">18 OCT</span></div>
            <div className="rule-chip"><span className="k">TAT</span><span className="v num">{tat ? String(tat).toUpperCase() : "—"}</span></div>
            <div className="rule-chip"><span className="k">RBI</span><span className="v">/2019-20/67</span></div>
          </div>
        </div>
        <DeadLineRule progressRef={lineDraw} staticProgress={staticProgress} />
        <p className="omega-num num" style={{ marginTop: "var(--s-xs)" }}>T+1</p>
        <p className="tag" style={{ color: "var(--ink-3)", marginTop: "var(--s-sm)" }}>
          {works.source === "demo" ? "SAMPLE CASE · SYNTHETIC DEMO" : "FROM PYTHON — never AI"}
        </p>
        <LedgerArt parallaxClass="act-fig" />
      </div>
    </section>
  );
}

/* Act 03 — ₹100/DIN · compensation ticker */
function DinAct({ reduced, works }) {
  const secRef = useRef(null);
  const [value, setValue] = useState(reduced ? works.ent.penalty_inr || 100 : 0);

  useEffect(() => {
    if (reduced) {
      setValue(works.ent.penalty_inr || 100);
      return undefined;
    }
    const target = works.ent.penalty_inr || 100;
    const obj = { v: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        v: target,
        ease: "none",
        onUpdate: () => setValue(Math.round(obj.v)),
        scrollTrigger: { trigger: secRef.current, start: "top 75%", end: "center 45%", scrub: 0.4 },
      });
      gsap.from(secRef.current.querySelectorAll(".tick-payload > *"), {
        opacity: 0,
        y: 20,
        stagger: 0.09,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: { trigger: secRef.current, start: "top 60%" },
      });
      gsap.to(secRef.current.querySelector(".ghost-num"), {
        yPercent: 16,
        ease: "none",
        scrollTrigger: { trigger: secRef.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    });
    return () => ctx.revert();
  }, [reduced, works.ent.penalty_inr]);

  return (
    <section className="act" id="actDin" data-tone="indigo" ref={secRef}>
      <GhostNum cls="din-ghost">₹</GhostNum>
      <div className="act-inner">
        <div className="tick-payload">
          <ActKicker n="ACT 03" en="₹100 din — every late day pays" hi="₹100 हर दिन" />
          <p className="omega-num num" aria-live="off">
            {fmtInr(value)}<span style={{ fontSize: "0.28em", color: "var(--ink-3)" }}> / दिन</span>
          </p>
          <p className="tag" style={{ color: "var(--ink-3)" }}>
            RBI suo motu compensation · open Python, never an AI guess
          </p>
        </div>
        <DraftGhostArt />
      </div>
    </section>
  );
}

/* tiny recurring-coin stack (visual, not a number source) */
function DraftGhostArt() {
  return (
    <div className="draft-ghost-art" aria-hidden="true">
      <WhisperArt parallaxClass="act-fig" />
    </div>
  );
}

/* Act 04 — WAPAS · refund credited — the ONLY --success moment */
function WapasAct({ reduced, works }) {
  const ref = useRef(null);
  useEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      gsap.from(ref.current.querySelectorAll(".wapas-payload > *"), {
        opacity: 0,
        y: 22,
        stagger: 0.1,
        duration: 0.55,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 55%" },
      });
    });
    return () => ctx.revert();
  }, [reduced]);

  const total = works.ent.total_inr || works.ent.claim_inr;

  return (
    <section className="act" id="actWapas" data-tone="green" ref={ref}>
      <GhostNum cls="wapas-ghost">{total ? fmtInr(total) : "₹"}</GhostNum>
      <div className="act-inner">
        <div className="wapas-payload">
          <ActKicker n="ACT 04" en="wapas — refund credited" hi="पैसा वापस" />
          <div style={{ display: "flex", gap: "var(--s-md)", alignItems: "center", flexWrap: "wrap" }}>
            <Stamp tone="success" />
            <h2 className="display" style={{ color: "var(--success)" }}>
              पैसा वापस आ गया।
            </h2>
          </div>
          <p className="sub num" style={{ color: "var(--success)", marginTop: "var(--s-sm)" }}>
            REFUND CREDITED {total ? "· " + fmtInr(total) : ""}
          </p>
          <p className="caption mute-2" style={{ maxWidth: "52ch", marginTop: "var(--s-sm)" }}>
            <Pair
              hi="हर शिकायत की कहानी यहीं ख़त्म होनी चाहिए : रिफंड, क्षतिपूर्ति, सबूत आपके पास। यह पूरे प्रोडक्ट में इकलौती हरी जगह है।"
              en="Every complaint ends here: refund, compensation, evidence in your hands. The only green in the product."
            />
          </p>
          <WhisperArt parallaxClass="act-fig" />
        </div>
      </div>
      <Marquee
        tone="success"
        items={["REFUND CREDITED", "पैसा वापस", "ऊपर लौटा", "₹" + (total ? fmtInr(total).replace("₹", "") : "3,800")]}
      />
    </section>
  );
}

/* numbered process steps — the signature numbered pattern */
function Journey({ reduced }) {
  const ref = useRef(null);
  useEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      gsap.from(ref.current.querySelectorAll(".steps li"), {
        opacity: 0,
        y: 30,
        stagger: 0.08,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
    });
    return () => ctx.revert();
  }, [reduced]);

  const steps = [
    {
      n: "01",
      hi: "बोलिए",
      en: "Voice intake — one breath becomes four checked facts.",
      href: "#/voice-intake",
      cta: "बोलना शुरू करें · start speaking",
    },
    {
      n: "02",
      hi: "जाँचें",
      en: "Rights check — Python prints the RBI timeline and ₹100/day ledger.",
      href: "#/rights-check",
      cta: "मेरा हक देखें · my rights",
    },
    {
      n: "03",
      hi: "तैयार करें",
      en: "Complaint drafts in Hindi & English — you approve every word.",
      href: "#/complaint-builder",
      cta: "ड्राफ़्ट बनाइए · build the draft",
    },
    {
      n: "04",
      hi: "कॉल",
      en: "Assisted call — you dial, HaqVaani whispers what to say, catches the docket.",
      href: "#/assisted-call",
      cta: "साथ में कॉल · the call — Simulated IVR / synthetic demo",
    },
    {
      n: "05",
      hi: "सबूत",
      en: "Docket, dossier, export — the whole case verbatim-verified, JSON in your hand.",
      href: "#/dossier",
      cta: "पूरा फ़ोल्डर · the dossier",
    },
  ];

  return (
    <section id="journey" data-tone="indigo" style={{ padding: "var(--pad-section) 0" }}>
      <div className="act-inner" ref={ref}>
        <ActKicker n="HOW" en="the five steps" hi="पाँच क़दम" />
        <h2 className="d-lg" style={{ marginBottom: "var(--s-md)" }} lang="hi-IN">
          पाँच क़दम, एक कहानी।
        </h2>
        <ol className="steps steps-visual">
          {steps.map((s) => (
            <li key={s.n}>
              <span className="step-num" aria-hidden="true">{s.n}</span>
              <div>
                <h3 lang="hi-IN">{s.hi}</h3>
                <p className="mute-2" lang="en-IN">{s.en}</p>
                <a href={s.href}>{s.cta}</a>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* CTA band + footers — safety + honesty labels live here too */
function Cta({ works }) {
  return (
    <section style={{ borderTop: "1px solid var(--line)", padding: "var(--pad-section) 0 calc(var(--s-xl) * 0.9)" }}>
      <div className="act-inner">
        <h2 className="d-lg" lang="hi-IN" style={{ marginBottom: "var(--s-sm)" }}>
          अपना मामला शुरू करें।
        </h2>
        <p className="caption mute-2" style={{ maxWidth: "56ch", marginBottom: "var(--s-md)" }}>
          <Pair
            hi="सबसे पहले सहमति (DPDP Act 2023), फिर माइक। सब कुछ सिर्फ़ इसी सत्र तक।"
            en="Consent first (DPDP Act 2023), then the mic. Everything stays within this session."
          />
        </p>
        <div className="row">
          <a className="btn btn--primary" href="#/start-case">
            <span style={{ display: "inline-flex", alignItems: "baseline", gap: 10 }}>
              <span lang="hi-IN" style={{ fontWeight: 700 }}>शुरू करें</span>
              <span style={{ fontSize: ".78em", opacity: 0.85 }}>Start my case</span>
            </span>
          </a>
          <a className="btn btn--ink" href="#/rights-check">
            <span style={{ display: "inline-flex", alignItems: "baseline", gap: 10 }}>
              <span lang="hi-IN">हक जाँचें</span>
              <span style={{ fontSize: ".78em", opacity: 0.85 }}>check my rights</span>
            </span>
          </a>
        </div>

        <div className="evidence-block" style={{ marginTop: "var(--s-lg)", maxWidth: 640 }}>
          <p className="eb-label">safety · सुरक्षा</p>
          <p className="caption mute-2">
            Never share OTP, PIN or CVV — the bank never asks. · कभी OTP, PIN या CVV न बोलें।
            <br />
            No autonomous dialing — HaqVaani never calls the bank. · हक़-वाणी कभी बैंक को ख़ुद डायल नहीं करता.
            <br />
            Simulated IVR / synthetic demo in every screen. · सारी स्क्रीन पर सिम्युलेटेड डेमो.
          </p>
        </div>

        <p className="tiny mute-3" style={{ marginTop: "var(--s-lg)" }}>
          हक़-वाणी · HaqVaani — built free on the Gnani sovereign stack (Prisma v2.5 · Evon v3.3 · Timbre) for the
          Great Indian AI Internship Challenge 2026. Statutory numbers compute in Python; this page never invents them.
          {works.source === "demo" ? " Numbers above: synthetic demo · sample case." : " Numbers above: from the Python engine."}
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- landing -- */
export default function Landing() {
  const reduced = useReducedMotion();
  const mode = useMode();
  const works = useWorksExample();
  const rootRef = useRef(null);
  const lenisRef = useRef(null);

  useEffect(() => {
    document.title = "हक़-वाणी · HaqVaani — पैसा कट गया, पर पहुँचा नहीं";
    if (reduced) return undefined;
    const lenis = new Lenis({ autoRaf: false, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenisRef.current = null;
      gsap.ticker.remove(tick);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [reduced]);

  function onNavClick(e) {
    const a = e.target && e.target.closest && e.target.closest("a[href^='#']");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#/")) return;
    if (e.defaultPrevented) return;
    e.preventDefault();
    if (href === "#top" || href === "#") {
      if (lenisRef.current) lenisRef.current.scrollTo(0);
      else window.scrollTo({ top: 0 });
      return;
    }
    const el = document.querySelector(href);
    if (!el) return;
    if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: -84, duration: 1.05 });
    else el.scrollIntoView({ block: "start" });
  }

  return (
    <div ref={rootRef} onClick={onNavClick} style={{ paddingLeft: "74px" }}>
      <LandingNav mode={mode} />
      <EdgeRail reduced={reduced} />
      <main>
        <HeroAct reduced={reduced} works={works} />
        <RuleAct reduced={reduced} works={works} />
        <DinAct reduced={reduced} works={works} />
        <WapasAct reduced={reduced} works={works} />
        <Journey reduced={reduced} />
        <Cta works={works} />
      </main>
      <span data-tone-hits="cyan red indigo green" hidden aria-hidden="true" />
    </div>
  );
}
