/* HQ.state equivalent — the case record carried between screens.
   Lives in sessionStorage under "hv.state" (exactly like the old router.js):
   { consent, intake, entitlement, draft, call, docket, secretsBlocked,
     factsEdited, rawTranscript, suggestedIntake, disputeType }
   The consent record is the DPDP gate: { ts, disclosure, name, disclosureText } */

import React, { createContext, useContext, useMemo, useState } from "react";

const STORE_KEY = "hv.state";

function read() {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY) || "{}");
  } catch {
    return {};
  }
}
function write(s) {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(s));
  } catch { /* private mode: state stays in-memory only */ }
}

const StateCtx = createContext(null);

/* merge-and-save keeps one source of truth; every setter writes straight through.
   State lives in React state so context consumers (incl. the consent gate in
   App.jsx) see fresh values immediately after a commit — previously the provider
   published a one-time snapshot, so a submit→navigate could be re-redirected
   back by the still-stale gate (state wipe). */
export function CaseStateProvider({ children }) {
  const [state, setState] = useState(read);

  const value = useMemo(() => {
    const commit = (updater) => {
      setState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        const merged = { ...prev, ...next };
        write(merged);
        return merged;
      });
    };
    const subscribe = () => () => {}; // kept for API compat (state pushes via React)
    return { state, commit, subscribe };
  }, [state]);

  return <StateCtx.Provider value={value}>{children}</StateCtx.Provider>;
}

export function useCaseFile() {
  return useContext(StateCtx);
}

/* subscribe-to-state hook (authored screens read fresh state) */
export function useCaseState() {
  const { state, subscribe } = useCaseFile();
  const [, force] = React.useReducer((c) => c + 1, 0);
  React.useEffect(() => subscribe(force), [subscribe]);
  return state;
}

/* consent gate helper — HQ.guardConsent equivalent.
   Voice screens call it with theRoute; when consent is absent they land on
   the consent screen instead (hard gate, never a modal).                  */
export function consentGranted(state) {
  return Boolean(state && state.consent && state.consent.ts);
}
