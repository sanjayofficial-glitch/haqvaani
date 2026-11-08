import React from "react";

/* Tiny hash router — the HQ.router equivalent for the SPA.
   Routes are hash paths (works on any static host, no server rewrites):
     /            landing
     /start-case  ... ten case screens            /dossier
   Hash queries:  #/consent?next=/voice-intake                                      */

const listeners = new Set();

export function parseHash() {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const qIndex = raw.indexOf("?");
  const path = (qIndex === -1 ? raw : raw.slice(0, qIndex)) || "/";
  const params = new URLSearchParams(qIndex === -1 ? "" : raw.slice(qIndex + 1));
  return { path, params };
}

export function navigate(to, { replace = false } = {}) {
  const hash = to.startsWith("#") ? to : "#" + to;
  if (window.location.hash === hash) return;
  if (replace) window.location.replace(hash);
  else window.location.hash = hash;
}

export function useRoute() {
  const [route, setRoute] = React.useState(parseHash());
  React.useEffect(() => {
    const onChange = () => setRoute(parseHash());
    listeners.add(onChange);
    window.addEventListener("hashchange", onChange);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener("hashchange", onChange);
    };
  }, []);
  return route;
}

/* route → {screen, step, canvas, needsConsent} intent table (mirrors the old
   screen map in docs/DESIGN.md section 9) */
export const SCREENS = {
  "/start-case":        { step: 0, canvas: "story",   title: "Start case" },
  "/consent":           { step: 0, canvas: "story",   title: "Consent" },
  "/voice-intake":      { step: 0, canvas: "story",   title: "Voice intake",   consent: true },
  "/fact-review":       { step: 1, canvas: "story",   title: "Fact review" },
  "/rights-check":      { step: 1, canvas: "story",   title: "Rights check" },
  "/complaint-builder": { step: 2, canvas: "story",   title: "Complaint" },
  "/call-prep":         { step: 2, canvas: "story",   title: "Call prep" },
  "/assisted-call":     { step: 3, canvas: "story",   title: "Assisted call",  consent: true },
  "/docket-capture":    { step: 3, canvas: "story",   title: "Docket" },
  "/post-call":         { step: 4, canvas: "story",   title: "Post-call" },
  "/dossier":           { step: 4, canvas: "story",   title: "Dossier" },
};
