/* ==========================================================================
   The HaqVaani landfall — scroll-driven, interactive storytelling.
   Four acts mapped to the citizen's journey in the merged Heron×HaqVaani
   language: stark editorial white, charcoal ink, hairline rules, ONE orange
   signal accent, mono technical voice.
     Act 01  KAT GAYA   — money deducted, UTR in mono, hairline break diagram
     Act 02  RULE       — the RBI clock: display numeral + orange progress line
     Act 03  ₹100/DIN   — the compensation ticker counts (orange mono)
     Act 04  WAPAS      — refund credited: the ONLY place --success appears
   Lenis smooth scroll + GSAP ScrollTrigger (pin/scrub); both fully disabled
   under prefers-reduced-motion (static layouts, final states).
   `data-tone` beat sections keep the old design contract; the edge rail is
   scrub-linked to scroll.                                                */

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useReducedMotion } from "../hooks/useReducedMotion.js";
import { useMode } from "../hooks/useMode.jsx";
import { useWorksExample } from "../hooks/useWorksExample.js";
import { fmtInr } from "../lib/format.js";
import { Pair } from "../lib/i18n.jsx";
import { TxnBreak, VoiceTiles, LedgerArt, DraftArt, WhisperArt, Stamp, DeadLineRule } from "../components/Svg.jsx";

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
    /* progress line: exact same scroll math as the old rail.js */
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

    /* beat activation: nearest act wins, root margin mid-viewport */
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

/* Act 01 — KAT GAYA · the hero + the break diagram */
function ActKat({ reduced, works }) {
  const figWrap = useRef(null);

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      /* hairline diagram draws in as you settle on it */
      gsap.from(".act-hero .trxfigure svg g", {
        opacity: 0,
        yPercent: 8,
        stagger: 0.08,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: ".act-hero", start: "top 60%", toggleActions: "play none none none" },
      });
      /* precise parallax on the line-art block */
      gsap.to(figWrap.current, {
        yPercent: -9,
        ease: "none",
        scrollTrigger: { trigger: figWrap.current, start: "top bottom", end: "bottom top", scrub: true },
      });
      /* the coin stops exactly at the break (small precise nudge, scrubbed) */
      const coin = figWrap.current && figWrap.current.querySelector(".coin-g");
      if (coin) {
        gsap.fromTo(
          coin,
          { xPercent: -34 },
          {
            xPercent: 0,
            ease: "none",
            scrollTrigger: { trigger: figWrap.current, start: "top bottom", end: "center center", scrub: true },
          }
        );
      }
    });
    return () => ctx.revert();
  }, [reduced]);

  const over = works.ent.days_overdue || 0;
  return (
    <section className="act act-hero" id="actKat" data-tone="cyan" style={{ paddingTop: "110px" }}>
      <div className="act-inner">
        <ActKicker n="ACT 01" en="kat gaya — money deducted" hi="कट गया — पैसा कट गया" />
        <h1 className="display" style={{ marginBottom: "var(--s-sm)" }} lang="hi-IN">
          पैसा कट गया,<br />पर पहुँचा नहीं।
        </h1>
        <p className="sub" style={{ color: "var(--ink-2)", marginBottom: "var(--s-sm)" }}>
          Money left. The law has a clock. Your voice builds the proof.
        </p>
        <p className="tag" style={{ color: "var(--accent)", marginBottom: "var(--s-md)" }}>
          UTR {utrid(works)} · {fmtInr(3200)} · 18 OCT 2026
        </p>
        <div ref={figWrap} style={{ marginTop: "var(--s-xs)" }}>
          <TxnBreak parallaxClass="act-fig" />
        </div>
        <p className="body mute-2" style={{ maxWidth: "60ch", marginTop: "var(--s-sm)" }}>
          <Pair
            hi={`विफल UPI, IMPS या ATM लेन-देन। RBI के नियम आपके पक्ष में हैं: पूरा रिफंड और ₹100/दिन देरी की क्षतिपूर्ति। हक़-वाणी गणना करता है, आपकी आवाज़ सबूत बनाता है, और कॉल में आपका साथी रहता है। कॉल हमेशा आप करते हैं। ${over > 0 ? "सैंपल में " + over + " दिन देरी = " + fmtInr(works.ent.penalty_inr) + " क्षतिपूर्ति तक।" : ""}`}
            en="Failed UPI, IMPS or ATM transaction? RBI rules are exact in your favour: the full refund plus ₹100 per day of delay. HaqVaani computes them in plain Python, turns your spoken words into evidence, and stays beside you on the call. You always make the call yourself."
          />
        </p>
        <VoiceTiles parallaxClass="act-fig" />
      </div>
    </section>
  );
}

function utrid(works) {
  const it = works.ent.utr || (works.source === "demo" ? "629188340112" : "");
  return it ? it : "—";
}

/* Act 02 — RULE · the RBI clock */
function ActRule({ reduced, works }) {
  const ruleRef = useRef(null);
  const lineDraw = useRef(null);
  const [staticProgress, setStaticProgress] = useState(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      setStaticProgress(1);
      return;
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
            trigger: ruleRef.current,
            start: "top 70%",
            end: "center 40%",
            scrub: true,
          },
        }
      );
      gsap.from(ruleRef.current.querySelectorAll(".rule-payload > *"), {
        opacity: 0,
        y: 24,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: { trigger: ruleRef.current, start: "top 55%" },
      });
    });
    return () => ctx.revert();
  }, [reduced]);

  const tat = works.ent.tat_date;
  return (
    <section className="act" id="actRule" data-tone="red">
      <div className="act-inner" ref={ruleRef}>
        <ActKicker n="ACT 02" en="rule — the law's clock" hi="क़ानून की घड़ी" />
        <div className="rule-payload">
          <h2 className="d-lg" lang="hi-IN" style={{ marginBottom: "var(--s-xs)" }}>
            नियम आपकी तरफ़ है।
          </h2>
          <p className="body mute-2" style={{ maxWidth: "58ch", marginBottom: "var(--s-sm)" }}>
            <Pair
              hi="UPI P2P में बैंक को अगले कार्य दिवस (T+1) तक सुलझाना है — RBI/2019-20/67। उसको पार करने का हर दिन महँगा है (बैंक के लिए)।"
              en="For a failed UPI P2P payment the bank must settle by the next working day (T+1) — circular RBI/2019-20/67. Every day past it becomes expensive for the bank."
            />
          </p>
        </div>
        {/* the orange progress line draws toward the deadline numeral (scrub) */}
        <DeadLineRule progressRef={lineDraw} staticProgress={staticProgress} />
        <p className="omega-num num" style={{ marginTop: "var(--s-xs)" }}>T+1</p>
        <p className="tag" style={{ color: "var(--ink-3)", marginTop: "var(--s-sm)" }}>
          {tat && <span>BANK TAT · {String(tat).toUpperCase()}</span>} {works.source === "demo" ? "· SAMPLE CASE · SYNTHETIC DEMO" : "· FROM PYTHON"}
        </p>
        <LedgerArt parallaxClass="act-fig" />
      </div>
    </section>
  );
}

/* Act 03 — ₹100/DIN · the compensation ticker */
function ActDin({ reduced, works }) {
  const secRef = useRef(null);
  const [value, setValue] = useState(reduced ? works.ent.penalty_inr || 100 : 0);

  useEffect(() => {
    if (reduced) {
      setValue(works.ent.penalty_inr || 100);
      return;
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
    });
    return () => ctx.revert();
  }, [reduced, works.ent.penalty_inr]);

  return (
    <section className="act" id="actDin" data-tone="indigo">
      <div className="act-inner" ref={secRef}>
        <ActKicker n="ACT 03" en="₹100 din — every late day pays" hi="₹100 हर दिन" />
        <div className="tick-payload">
          <p className="tag" style={{ color: "var(--ink-3)" }}>RBI suo motu compensation</p>
          <p className="omega-num num" aria-live="off" style={{ fontVariantNumeric: "tabular-nums" }}>
            {fmtInr(value)}<span style={{ fontSize: "0.28em", color: "var(--ink-3)" }}> / दिन</span>
          </p>
          <p className="body mute-2" style={{ maxWidth: "58ch" }}>
            <Pair
              hi="यह हिसाब कोई AI नहीं : खुले Python कोड (haqvaani/statutory.py) से निकलता है। गणना दिखाएँ, हर क़दम देखें।"
              en="The math is never an AI guess: it comes from open Python (haqvaani/statutory.py). Open the calculation drawer and see every line."
            />
          </p>
        </div>
        <DraftArt parallaxClass="act-fig" />
      </div>
    </section>
  );
}

/* Act 04 — WAPAS · refund credited — the ONLY --success moment */
function ActWapas({ reduced, works }) {
  const ref = useRef(null);
  useEffect(() => {
    if (reduced) return;
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
    <section className="act" id="actWapas" data-tone="green">
      <div className="act-inner" ref={ref}>
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
          <p className="body mute-2" style={{ maxWidth: "58ch", marginTop: "var(--s-sm)" }}>
            <Pair
              hi="हर शिकायत की कहानी यहीं ख़त्म होनी चाहिए : रिफंड, क्षतिपूर्ति, सबूत आपके पास। इसी लिए यह पूरे प्रोडक्ट में इकलौती हरी जगह है।"
              en="Every complaint should end exactly here: refund, compensation, and evidence in your hands. This is the only green in the entire product."
            />
          </p>
          <WhisperArt parallaxClass="act-fig" />
        </div>
      </div>
    </section>
  );
}

/* numbered process steps — the signature numbered pattern */
function Journey({ reduced }) {
  const ref = useRef(null);
  useEffect(() => {
    if (reduced) return;
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
      hi: "बोलिए · Speak",
      en: "Voice intake — one messy Hinglish breath condenses into four checked facts.",
      hiLong: "एक गड़बड़ Hinglish शिकायत सुनिए : राशि, तारीख़, UTR, क़िसम — हर सच आप जाँचेंगे।",
      href: "#/voice-intake",
      cta: "बोलना शुरू करें · start speaking",
    },
    {
      n: "02",
      hi: "जाँचें · Check",
      en: "Rights check — pure Python prints the RBI timeline and ₹100/day ledger.",
      hiLong: "हक की जाँच : Python स ही मेरा आगे कहना क्षतिपूर्ति है — कोई AI नहीं।",
      href: "#/rights-check",
      cta: "मेरा हक देखें · my rights",
    },
    {
      n: "03",
      hi: "तैयार करें · Prepare",
      en: "Complaint drafts in Hindi & English — you approve every single word.",
      hiLong: "बैंक, व्हाट्सएप, ईमेल ड्राफ़्ट : हिन्दी + English : आपकी सहमति के बिना कुछ नहीं जाता।",
      href: "#/complaint-builder",
      cta: "ड्राफ़्ट बनाइए · build the draft",
    },
    {
      n: "04",
      hi: "कॉल · Call",
      en: "Assisted call — you dial the bank, HaqVaani whispers what to say, and catches the docket.",
      hiLong: "सहायता कॉल : आप डायल करते हैं, हक़-वाणी क्या कहना है दिखाता है और डॉकेट नंबर पकड़ता है — Simulated IVR / synthetic demo.",
      href: "#/assisted-call",
      cta: "साथ में कॉल · the call",
    },
    {
      n: "05",
      hi: "सबूत · Prove",
      en: "Docket, dossier, export — the whole case verbatim-verified, JSON in your hand.",
      hiLong: "जाँचा हुआ डॉकेट, पूरा केस फ़ोल्डर — JSON सेव व प्रिंट : सबूत आपके पास।",
      href: "#/dossier",
      cta: "पूरा फ़ोल्डर · the dossier",
    },
  ];

  return (
    <section id="journey" data-tone="indigo" style={{ padding: "var(--pad-section) 0" }}>
      <div className="act-inner" ref={ref}>
        <ActKicker n="HOW" en="the five steps" hi="पाँच क़दम" />
        <h2 className="d-lg" style={{ marginBottom: "var(--s-lg)" }} lang="hi-IN">
          पाँच क़दम, एक कहानी।
        </h2>
        <ol className="steps">
          {steps.map((s) => (
            <li key={s.n}>
              <span className="step-num" aria-hidden="true">{s.n}</span>
              <div>
                <h3 lang="hi-IN">{s.hi}</h3>
                <p>
                  <Pair hi={s.hiLong} en={s.en} />
                  <br />
                  <a href={s.href}>{s.cta}</a>
                </p>
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
        <p className="body mute-2" style={{ maxWidth: "58ch", marginBottom: "var(--s-md)" }}>
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

  /* in-page anchors (#actKat…) scroll in place — they must never become
     routes: the hash router parses location.hash, so a bare #actKat would
     re-parse as a path and App's scroll-reset would kill the glide.
     #/… links stay with the router untouched. Reduced-motion → instant. */
  function onNavClick(e) {
    const a = e.target && e.target.closest && e.target.closest("a[href^='#']");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#/")) return; /* hash routes: leave to the router */
    if (e.defaultPrevented) return;
    e.preventDefault();
    if (href === "#top" || href === "#") {
      if (lenisRef.current) lenisRef.current.scrollTo(0);
      else window.scrollTo({ top: 0 }); /* reduced motion: instant */
      return;
    }
    const el = document.querySelector(href);
    if (!el) return;
    if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: -84, duration: 1.05 });
    else el.scrollIntoView({ block: "start" }); /* reduced motion: instant */
  }

  return (
    <div ref={rootRef} onClick={onNavClick} style={{ paddingLeft: "74px" }}>
      <LandingNav mode={mode} />
      <EdgeRail reduced={reduced} />
      <main>
        <ActKat reduced={reduced} works={works} />
        <ActRule reduced={reduced} works={works} />
        <ActDin reduced={reduced} works={works} />
        <ActWapas reduced={reduced} works={works} />
        <Journey reduced={reduced} />
        <Cta works={works} />
      </main>
      <span data-tone-hits="cyan red indigo green" hidden aria-hidden="true" />
    </div>
  );
}
