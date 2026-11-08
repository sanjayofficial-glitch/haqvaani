/* Landing narrative numbers — API-first (constraint: statutory numbers come
   from the API, never computed in the frontend). Order:
   1. an entitlement already computed by Python this session (state)
   2. compute one via POST /api/rights with the sample intake (needs consent;
      on 403 the honest fallback takes over)
   3. fallback: the statutory.py self-test mirrors, always labeled
      "synthetic demo · sample case".                                      */

import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { DEMO } from "../lib/demo.js";
import { useMode } from "./useMode.jsx";
import { useCaseState } from "../lib/state.jsx";

export function useWorksExample() {
  const mode = useMode();
  const state = useCaseState();
  const [res, setRes] = useState(() => ({
    ent: null,
    source: "pending", // "api" | "api-session" | "demo"
  }));

  useEffect(() => {
    let alive = true;

    (async () => {
      if (state.entitlement) {
        if (alive) setRes({ ent: state.entitlement, source: "api" });
        return;
      }
      if (mode === "live") {
        try {
          const ent = await api.post("/api/rights", DEMO.intake);
          if (alive) setRes({ ent, source: "api" });
          return;
        } catch {
          /* consent gate or API hiccup → honest labeled fallback below */
        }
      }
      if (alive) setRes({ ent: null, source: "demo" });
    })();

    return () => {
      alive = false;
    };
  }, [mode, state.entitlement]);

  /* demo display target: the self-test worked example (T+1 case or the
     zero-liability variant by the picked dispute type) */
  const demoEnt =
    state.disputeType === "unauthorised" ? DEMO.unauthorised : DEMO.entitlement;

  const ent = res.ent || demoEnt;
  return { ent, source: ent === res.ent ? res.source : "demo" };
}
