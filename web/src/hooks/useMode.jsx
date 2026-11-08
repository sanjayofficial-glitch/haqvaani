import { createContext, useContext, useEffect, useState } from "react";
import { detectMode } from "../lib/api.js";

/* "live" = API on :8000 with Gnani wired · "demo" = honest synthetic fixtures */
const ModeCtx = createContext("demo");

export function ModeProvider({ children }) {
  const [mode, setMode] = useState("demo");
  useEffect(() => {
    let alive = true;
    detectMode().then((m) => {
      if (alive) setMode(m);
    });
    return () => {
      alive = false;
    };
  }, []);
  return <ModeCtx.Provider value={mode}>{children}</ModeCtx.Provider>;
}

export function useMode() {
  return useContext(ModeCtx);
}
