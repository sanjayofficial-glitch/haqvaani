/* ==========================================================================
   HaqVaani router.js — real navigation + shared helpers for all screens.
   · Every navigation is a real <a href> (no alert() navigation anywhere).
   · HQ.state: case state carried between screens in sessionStorage.
   · HQ.mode: "live" (API running + Gnani creds) or "demo" (synthetic, honest).
   · Demo data mirrors the offline API exactly (haqvaani/voice_clients.py +
     statutory.py self-test: ₹3,200 · 18 Oct · UPI P2P · UTB RBI/2019-20/67).
     In demo mode nothing pretends to be a real bank, transcript or docket.
   ========================================================================== */
(function () {
  "use strict";

  var HQ = {};
  window.HQ = HQ;

  /* ------------------------------------------------------------- helpers -- */
  HQ.q  = function (sel, root) { return (root || document).querySelector(sel); };
  HQ.qa = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  HQ.el = function (id) { return document.getElementById(id); };

  HQ.fmt = function (n) {
    return "₹" + Number(n || 0).toLocaleString("en-IN");
  };
  var HI_MONTHS = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
    "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
  var EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  HQ.dfmt = function (iso, hi) {
    if (!iso) return "—";
    var d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
    if (isNaN(d)) return iso;
    var day = d.getDate(), m = d.getMonth(), y = d.getFullYear();
    return hi ? (day + " " + HI_MONTHS[m] + " " + y)
              : (day + " " + EN_MONTHS[m] + " " + y);
  };
  HQ.tfmt = function (iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  };

  HQ.brushLabels = {
    wait_7_to_10_days:      { en: "Wait 7–10 days (brush-off)", hi: "7–10 दिन बाद आइए (टाल रहे हैं)", kind: "warn" },
    tell_me_utr:            { en: "Bank asks UTR again",         hi: "बैंक ने UTR फिर माँगा",               kind: "warn" },
    request_kyc_otp:        { en: "Agent asks OTP — never share", hi: "एजेंट ने OTP माँगा — कभी न दें",     kind: "bad" },
    escalate_after_30_days: { en: "Come back after 30 days",     hi: "30 दिन बाद आइए",                     kind: "warn" },
    other:                  { en: "Other brash reply",           hi: "अन्य टाल",                            kind: "warn" }
  };

  HQ.secretRE = /\b(?:otp|pin|mpin|cvv|password)\b/i;

  /* ------------------------------------------------------------- state --- */
  var STORE_KEY = "hv.state";
  function read() {
    try { return JSON.parse(sessionStorage.getItem(STORE_KEY) || "{}"); }
    catch (e) { return {}; }
  }
  function write(s) {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) { /* private mode */ }
  }
  HQ.state = read();
  HQ.save = function () { write(HQ.state); };

  /* demo flags */
  HQ.DEMO = {
    transcript: "Bhaiya 18 Oct ko 3,200 UPI kiya tha, paisa kat gaya par pahuncha nahi — UTR 629188340112",
    intake: {
      utr: "629188340112", amount_inr: 3200, txn_date: "2026-10-18",
      dispute_type: "upi_p2p", bank_name: "DemoBank Support", language: "hi-IN", confidence: 0.97
    },
    /* mirrors haqvaani/statutory.py::_self_test() (today = 2026-10-25, T+1) */
    entitlement: {
      circular_ref: "RBI/2019-20/67 (DPSS.CO.PD No.629/02.01.014/2019-20)",
      protection_note: "Suo motu compensation ₹100/day beyond T+1",
      tat_date: "2026-10-19", days_overdue: 6,
      claim_inr: 3200, penalty_inr: 600, total_inr: 3800,
      eligible_for_rbi_cms: false, rbi_filing_deadline: null
    },
    /* unauthorised (DBR.No.Leg.BC.78/09.07.005/2017-18) — synthetic constants */
    unauthorised: {
      circular_ref: "DBR.No.Leg.BC.78/09.07.005/2017-18",
      protection_note: "Zero Customer Liability (report within 3 working days)",
      tat_date: "2026-10-21", days_overdue: 0,
      claim_inr: 3200, penalty_inr: 0, total_inr: 3200,
      eligible_for_rbi_cms: false, rbi_filing_deadline: "2027-02-22",
      shadow_credit_due_date: "2026-11-06"
    },
    ivr: "Thank you for calling DemoBank. Your complaint is registered under SR-DB-884120.",
    call: {
      transcript: "Thank you for calling DemoBank. Your complaint is registered under SR-DB-884120.",
      docket_id: "SR-DB-884120", verbatim_verified: true,
      brush_off_type: "other",
      suggested_script_en: '"' + "Under RBI/2019-20/67, the applicable timeline has passed. Please register my complaint and provide the service request number." + '"',
      suggested_script_hi: '"' + "आरबीआई/2019-20/67 के तहत, लागू समय-सीमा गुज़र चुकी है। कृपया मेरी शिकायत दर्ज करें और सर्विस रिक्वेस्ट नंबर दें।" + '"'
    },
    draft: {
      bank_complaint_text: "Subject: Failed UPI transaction — refund + statutory compensation under RBI/2019-20/67\n\nI am Ramesh. On 2026-10-18 I attempted a payment of ₹3,200 via UPI. My account was debited but the beneficiary was not credited (UTR: 629188340112).\n\nUnder RBI/2019-20/67 (DPSS.CO.PD No.629/02.01.014/2019-20), the statutory turnaround time was 2026-10-19 (T+1). As of today, 6 day(s) have elapsed beyond TAT, so I am entitled to ₹600 compensation (₹100/day) in addition to the refund of ₹3,200. Total claim: ₹3,800.\n\nI request that you reverse the failed debit and credit the statutory compensation — both suo motu, as mandated by RBI. Please register this grievance and provide a Service Request / docket number for tracking.\n\nThank you.\nRamesh\nPhone: +91-90000-00000",
      whatsapp_draft: "Dear DemoBank Support, I am Ramesh. UPI payment of ₹3,200 on 2026-10-18 was debited but not credited (UTR: 629188340112). Under RBI/2019-20/67, please reverse ₹3,200 and pay ₹600 compensation (₹100/day beyond TAT). Log SR/docket ID and share it.",
      email_draft: "To: complaints@demobanksupport.in\nSubject: Refund + ₹100/day compensation — failed UPI (UTR: 629188340112)\n\n(as in bank complaint draft)",
      evidence_checklist: ["UPI transaction reference (UTR) — screenshot from payment app", "Bank statement / passbook entry showing the debit", "Beneficiary confirmation (if P2P) — friend/vendor screenshot", "This complaint letter with the date of lodging", "Bank's acknowledgment / SR / docket ID once provided"]
    },
    hindiDrafts: {
      bank_complaint_text: "विषय: विफल UPI लेन-देन — धनवापसी + RBI/2019-20/67 के तहत सांविधिक क्षतिपूर्ति\n\nमैं Ramesh हूँ। 2026-10-18 को मैंने UPI से ₹3,200 का भुगतान किया था। मेरे खाते से राशि कट गई पर लाभार्थी को नहीं पहुँची (UTR: 629188340112)।\n\nRBI/2019-20/67 (DPSS.CO.PD No.629/02.01.014/2019-20) के तहत सांविधिक समय-सीमा 2026-10-19 (T+1) थी। आज तक 6 दिन की देरी हो चुकी है, इसलिए मैं ₹600 (₹100/दिन) क्षतिपूर्ति का अधिकारी हूँ, साथ में ₹3,200 की वापसी। कुल दावा: ₹3,800।\n\nमैं अनुरोध करता हूँ कि विफल डेबिट उलट दी जाए और सांविधिक क्षतिपूर्ति जोड़ी जाए — दोनों RBI के निर्देशानुसार suo motu। कृपया शिकायत दर्ज करें और सर्विस रिक्वेस्ट / डॉकेट नंबर दें।\n\nधन्यवाद।\nRamesh\nफ़ोन: +91-90000-00000",
      whatsapp_draft: "प्रिय DemoBank Support, मैं Ramesh हूँ। 2026-10-18 को ₹3,200 का UPI भुगतान डेबिट हुआ पर क्रेडिट नहीं हुआ (UTR: 629188340112)। RBI/2019-20/67 के तहत कृपया ₹3,200 वापस करें और ₹600 क्षतिपूर्ति (₹100/दिन) दें। SR/डॉकेट आईडी दर्ज कर साझा करें।",
      email_draft: "To: complaints@demobanksupport.in\nविषय: धनवापसी + ₹100/दिन क्षतिपूर्ति — विफल UPI (UTR: 629188340112)\n\n(बैंक शिकायत ड्राफ्ट के अनुसार)",
      evidence_checklist: ["UPI लेन-देन संदर्भ (UTR) — भुगतान एप का स्क्रीनशॉट", "बैंक स्टेटमेंट / पासबुक प्रविष्टि जो डेबिट दिखाती है", "लाभार्थी की पुष्टि (P2P हो तो) — मित्र/विक्रेता स्क्रीनशॉट", "यह शिकायत पत्र शिकायत की तारीख के साथ", "बैंक का स्वीकृति / SR / डॉकेट आईडी मिलने पर"]
    }
  };

  /* --------------------------------------------------------------- api --- */
  HQ.api = {
    get: function (path) {
      return fetch(path, { signal: AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined })
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); });
    },
    post: function (path, body) {
      return fetch(path, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      });
    },
    upload: function (path, field, file, extra) {
      var fd = new FormData();
      fd.append(field, file);
      if (extra) fd.append("intake", JSON.stringify(extra));
      return fetch(path, { method: "POST", body: fd }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      });
    }
  };

  var modeReady = null;
  HQ.detectMode = function () {
    if (modeReady) return modeReady;
    modeReady = HQ.api.get("/api/health")
      .then(function (h) {
        HQ.mode = (h && h.ok && h.mode === "live") ? "live" : "demo";
      })
      .catch(function () { HQ.mode = "demo"; });
    return modeReady;
  };

  /* ------------------------------------------------------------- toast --- */
  var toastTimer = null;
  HQ.toast = function (msg, kind) {
    var t = document.getElementById("hqToast");
    if (!t) {
      t = document.createElement("div");
      t.id = "hqToast"; t.className = "toast"; t.setAttribute("role", "status"); t.setAttribute("aria-live", "polite");
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.toggle("bad", kind === "bad");
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 3200);
  };

  /* --------------------------------------------------------- language ---- */
  HQ.lang = (function () {
    try { return localStorage.getItem("hv.lang") || "hi"; } catch (e) { return "hi"; }
  })();
  document.documentElement.setAttribute("data-lang", HQ.lang);
  var langHandlers = [];
  HQ.onLang = function (fn) { langHandlers.push(fn); fn(HQ.lang); };
  function applyLang() {
    document.documentElement.setAttribute("data-lang", HQ.lang);
    HQ.qa("[data-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === HQ.lang));
    });
    langHandlers.forEach(function (fn) { fn(HQ.lang); });
    try { localStorage.setItem("hv.lang", HQ.lang); } catch (e) { /* ignore */ }
  }
  function wireLang() {
    HQ.qa("[data-lang]").forEach(function (b) {
      b.addEventListener("click", function () {
        HQ.lang = b.getAttribute("data-lang");
        applyLang();
      });
    });
    applyLang();
  }

  /* -------------------------------------------------- persistent shell --- */
  function chipEl() {
    var chip = HQ.el("modeChip");
    if (!chip) return;
    var live = HQ.mode === "live";
    chip.setAttribute("data-mode", live ? "live" : "demo");
    /* demo honesty: the synthetic-demo line stays visible in demo mode */
    chip.innerHTML = (live ? '<span class="dot"></span>Live · Gnani connected'
                           : '<span class="dot"></span>Synthetic demo') +
      (live ? "" : ' <span class="xsmall" style="opacity:.8">(demo)</span>');
  }

  function safetyEl() {
    var panel = HQ.el("safetyPanel");
    if (!panel) return;
    var c = HQ.state.consent || {};
    var call = HQ.state.call || (HQ.state.docket ? { docket_id: HQ.state.docket, verbatim_verified: HQ.state.docketVerified } : null);
    var rows = [
      ["Consent (DPDP)", c.ts ? ("recorded " + HQ.tfmt(c.ts)) : "not yet"],
      ["AI disclosure", c.disclosure ? "played before any voice capture" : "not yet"],
      ["Secrets blocked (OTP/PIN/CVV)", String(HQ.state.secretsBlocked || 0)],
      ["Autonomous dialing", "0 — the citizen always dials"],
      ["Your call mode", HQ.mode === "live" ? "live API" : "synthetic demo only"]
    ];
    if (call && call.docket_id) {
      rows.splice(3, 0, ["Docket " + (call.docket_id || "") + (call.verbatim_verified ? "" : " (unverified)"), "—"]);
    }
    panel.innerHTML = rows.map(function (r) {
      return '<div class="kv"><span class="k">' + r[0] + "</span><span>" + r[1] + "</span></div>";
    }).join("");
  }

  HQ.onConsent = function () {
    /* expose exact TRAI disclosure text used when consent is granted */
    return "This is an AI assistant assisting you.";
  };

  /* client-side substring re-check — a display aid; authoritative verify is
     safety.verify_verbatim_substring on the server (/api/assisted) */
  HQ.substringVerify = function (candidate, transcript) {
    if (!candidate || !transcript) return false;
    return transcript.toLowerCase().indexOf(candidate.trim().toLowerCase()) !== -1;
  };

  /* TTS: server Timbre (redaction-gated) → browser speechSynthesis fallback */
  HQ.speak = function (text, lang) {
    var post = HQ.mode === "live"
      ? HQ.api.post("/api/tts", { text: text, lang: lang === "en" ? "en-IN" : "hi-IN" })
      : Promise.reject(new Error("demo"));
    post.then(function (j) {
      if (j && j.audio_base64) {
        var a = new Audio("data:audio/wav;base64," + j.audio_base64);
        a.play();
        return;
      }
      return Promise.reject(new Error("no audio"));
    }).catch(function () {
      if ("speechSynthesis" in window) {
        var u = new SpeechSynthesisUtterance(text);
        u.lang = lang === "en" ? "en-IN" : "hi-IN";
        var v = speechSynthesis.getVoices().find(function (v) {
          return v.lang && v.lang.toLowerCase().indexOf(lang === "en" ? "en" : "hi") !== -1;
        });
        if (v) u.voice = v;
        speechSynthesis.speak(u);
      } else {
        HQ.toast(text);
      }
    });
  };

  /* consent gate: voice pages redirect here until consent exists */
  HQ.guardConsent = function (nextUrl) {
    if (HQ.state.consent && HQ.state.consent.ts) return true;
    location.replace(nextUrl || "consent.html");
    return false;
  };

  /* ---------------------------------------------------------------- init -- */
  function init() {
    wireLang();
    HQ.detectMode().then(function () {
      chipEl();
      safetyEl();
      HQ.qa("[data-page-run]").forEach(function (el) {
        var fn = window[el.getAttribute("data-page-run")];
        if (typeof fn === "function") fn();
      });
    });
    safetyEl();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
