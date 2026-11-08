/* HQ.state equivalent — the case record carried between screens.
   Lives in sessionStorage under "hv.state" (exactly like the old router.js):
   { consent, intake, entitlement, draft, call, docket, secretsBlocked,
     factsEdited, rawTranscript, suggestedIntake, disputeType }
   The consent record is the DPDP gate: { ts, disclosure, name, disclosureText } */

import React, { createContext, useContext, useMemo, useRef } from "react";

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

/* merge-and-save keeps one source of truth; every setter writes straight through */
export function CaseStateProvider({ children }) {
  const stateRef = useRef(read());
  const listeners = useRef(new Set());

  const value = useMemo(() => {
    const state = stateRef.current;
    const commit = (updater) => {
      const next = typeof updater === "function" ? updater(stateRef.current) : updater;
      stateRef.current = { ...stateRef.current, ...next };
      write(stateRef.current);
      listeners.current.forEach((fn) => fn(stateRef.current));
    };
    const subscribe = (fn) => {
      listeners.current.add(fn);
      return () => listeners.current.delete(fn);
    };
    return { state, commit, subscribe };
  }, []);

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
