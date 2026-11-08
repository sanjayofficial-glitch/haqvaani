/* ==========================================================================
   HaqVaani rail.js — the one signature device.
   · Landing (`body[data-page="landing"]`): a thin vertical line down the left
     edge; a coin rides it with scroll; the line takes the colour of the
     current beat (cyan → red → indigo → cyan → green).
   · App screens (`body[data-page="app"]`): the same rail becomes the 5-step
     progress bar (Speak, Check, Prepare, Call, Prove) in #stepMount.
   prefers-reduced-motion: no smoothing, final states only (CSS handles the rest).
   ========================================================================== */
(function () {
  "use strict";

  var TONE = "--tone";
  var BEATS = [
    { name: "Speak",   hi: "बोलें",      tone: "var(--live-cyan)" },
    { name: "Check",   hi: "जाँच",       tone: "var(--blocked-red)" },
    { name: "Prepare", hi: "तैयार करें", tone: "var(--primary)" },
    { name: "Call",    hi: "कॉल",        tone: "var(--live-cyan)" },
    { name: "Prove",   hi: "सबूत",       tone: "var(--verified-green)" }
  ];

  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function buildRail() {
    var el = document.createElement("div");
    el.className = "rail";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
      '<div class="rail-line"></div>' +
      '<div class="rail-fill"></div>' +
      '<div class="rail-coin">₹</div>';
    document.body.appendChild(el);
    return {
      fill: el.querySelector(".rail-fill"),
      coin: el.querySelector(".rail-coin")
    };
  }

  /* ---- landing: scroll-linked fill + coin, beat colour follows sections ---- */
  function initScrollRail() {
    var rail = buildRail();
    var raf = null;

    function update() {
      raf = null;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      rail.fill.style.height = (p * 100) + "%";
      rail.coin.style.top = (p * 100) + "%";
    }
    function onScroll() {
      if (raf || reducedMotion()) { update(); return; }
      raf = window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    // beat tone: nearest section carrying data-tone wins (600ms colour change)
    var sections = document.querySelectorAll("[data-tone]");
    var current = null;
    function setTone(tone) {
      if (current === tone) return;
      current = tone;
      document.body.style.setProperty("--rail-tone", tone);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target.getAttribute("data-tone");
        if (t) setTone(t);
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    sections.forEach(function (s) { io.observe(s); });
    if (sections[0]) setTone(sections[0].getAttribute("data-tone"));
  }

  /* ---- app: the rail becomes the 5-step progress bar ---- */
  function initStepBar() {
    var mount = document.getElementById("stepMount");
    if (!mount) return;
    var active = parseInt(document.body.getAttribute("data-step"), 10);
    if (isNaN(active)) active = 0;
    var ol = document.createElement("ol");
    ol.className = "stepbar";
    ol.setAttribute("aria-label", "प्रक्रिया — process steps");
    BEATS.forEach(function (b, i) {
      var li = document.createElement("li");
      li.style.setProperty(TONE, b.tone);
      var state = i < active ? "done" : (i === active ? "active" : "");
      if (state) li.classList.add(state);
      li.setAttribute("data-done", i < active ? "true" : "false");
      if (i === active) {
        li.setAttribute("aria-current", "step");
        li.setAttribute("data-tone", i === 1 ? "red" : (i === 4 ? "green" : (i === 2 ? "indigo" : "cyan")));
      }
      li.innerHTML =
        '<span class="b-dot" aria-hidden="true"></span>' +
        '<span>' + b.hi + " · " + b.name + "</span>";
      ol.appendChild(li);
    });
    mount.appendChild(ol);
  }

  /* looping motion pauses when off-screen (hero coin SMIL, whisper flow) */
  function initLoopPause() {
    if (reducedMotion()) return;
    var coin = document.querySelector(".coin-anim");
    var svg = coin ? coin.ownerSVGElement : null;
    var whispers = Array.prototype.slice.call(document.querySelectorAll(".whisper"));
    if (!svg && !whispers.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.target === svg) {
          if (e.isIntersecting) svg.unpauseAnimations();
          else svg.pauseAnimations();
        } else {
          e.target.style.animationPlayState = e.isIntersecting ? "" : "paused";
        }
      });
    }, { threshold: 0 });
    if (svg) io.observe(svg);
    whispers.forEach(function (w) { io.observe(w); });
  }

  function init() {
    var page = document.body.getAttribute("data-page");
    if (page === "landing") initScrollRail();
    if (page === "app") initStepBar();
    initLoopPause();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
