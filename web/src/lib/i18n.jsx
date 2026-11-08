/* Language: en-IN default (per the merged brief), हिन्दी first-class toggle.
   Devices: <Pair hi= en=/> renders lead + small supplement, the lead flips with
   the toggle; <T en= hi=/> renders just the active language. Hindi display
   sizes inherit Noto Sans Devanagari from the token above them.            */

import React, { createContext, useContext, useState } from "react";

const LangCtx = createContext({ lang: "en", setLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem("hv.lang") || "en";
    } catch {
      return "en";
    }
  });
  const setLang = (next) => {
    setLangState(next);
    try {
      localStorage.setItem("hv.lang", next);
    } catch { /* ignore */ }
  };
  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}

/* lead/supplement pair — the bilingual device */
export function Pair({ hi, en, lead }) {
  const { lang } = useLang();
  const active = lead || lang; // "en" | "hi"
  const first = active === "hi" ? hi : en;
  const alt = active === "hi" ? en : hi;
  if (!alt) return <span>{first}</span>;
  return (
    <span className="pair">
      <span>{first}</span>
      <span className="alt" lang={active === "hi" ? "en-IN" : "hi-IN"}>{alt}</span>
    </span>
  );
}

/* single active-language string */
export function T({ en, hi }) {
  const { lang } = useLang();
  return <span lang={lang === "hi" ? "hi-IN" : "en-IN"}>{lang === "hi" ? hi : en}</span>;
}

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang-seg" role="group" aria-label="भाषा / language">
      <button
        type="button"
        className="chip chip-toggle"
        aria-pressed={lang === "hi"}
        onClick={() => setLang("hi")}
      >
        हिन्दी
      </button>
      <button
        type="button"
        className="chip chip-toggle"
        aria-pressed={lang === "en"}
        onClick={() => setLang("en")}
      >
        English
      </button>
    </div>
  );
}
