/* HQ.api equivalent — fetch client for the FastAPI bridge (haqvaani/api.py).
   HTTP:
     dev  → Vite proxy strips CORS (/api → localhost:8000)
     prod → VITE_API_BASE env at build time, or '' when served same-origin.
   Sessions ride the X-Haqvaani-Session header (the API's consent scope).  */

const BASE = import.meta.env.VITE_API_BASE || "";

export function sessionId() {
  let id;
  try {
    id = sessionStorage.getItem("hv.session");
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + "-" + Math.random().toString(16).slice(2, 10));
      sessionStorage.setItem("hv.session", id);
    }
  } catch {
    id = "default";
  }
  return id;
}

async function toJson(r) {
  if (!r.ok) {
    let reason = "HTTP " + r.status;
    try {
      const j = await r.json();
      if (j && j.detail) reason = j.detail.reason || j.detail.code || reason;
    } catch { /* non-json error body */ }
    throw new Error(reason);
  }
  return r.json();
}

function headersJson() {
  return { "Content-Type": "application/json", "X-Haqvaani-Session": sessionId() };
}

export const api = {
  get: (path) =>
    fetch(BASE + path, { headers: { "X-Haqvaani-Session": sessionId() }, signal: timeout(2500) }).then(toJson),

  post: (path, body) =>
    fetch(BASE + path, { method: "POST", headers: headersJson(), body: JSON.stringify(body) }).then(toJson),

  upload: (path, field, file, extra) => {
    const fd = new FormData();
    fd.append(field, file);
    if (extra) fd.append("intake", JSON.stringify(extra));
    const h = { "X-Haqvaani-Session": sessionId() };
    return fetch(BASE + path, { method: "POST", headers: h, body: fd }).then(toJson);
  },
};

function timeout(ms) {
  if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) return AbortSignal.timeout(ms);
  return undefined;
}

/* memoised /api/health → "live" | "demo" (server-side honesty flag) */
let modePromise = null;
export function detectMode() {
  if (!modePromise) {
    modePromise = api
      .get("/api/health")
      .then((h) => (h && h.ok && h.mode === "live" ? "live" : "demo"))
      .catch(() => "demo");
  }
  return modePromise;
}
