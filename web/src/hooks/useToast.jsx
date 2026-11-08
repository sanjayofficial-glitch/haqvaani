import { createContext, useCallback, useContext, useRef, useState } from "react";

/* HQ.toast equivalent — aria-live toast, 3200ms, kinds: ok | bad */
const ToastCtx = createContext(() => {});

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const timer = useRef(null);

  const toast = useCallback((text, kind) => {
    setMsg({ text, kind: kind || "ok" });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 3200);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div
        className={"toast" + (msg ? " show" : "") + (msg && msg.kind === "bad" ? " bad" : "")}
        role="status"
        aria-live="polite"
      >
        {msg ? msg.text : ""}
      </div>
    </ToastCtx.Provider>
  );
}
export function useToast() {
  return useContext(ToastCtx);
}
