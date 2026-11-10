/* Studio v2 recordings store.
   - Voice clips are small → persisted as data: URLs in localStorage (survive
     reload). Cap: ~3.5 MB per clip; larger clips are kept in memory only.
   - Screen captures are larger → kept in memory for the session (honest
     label "session only"); they do not survive reload.
   All clips are local & synthetic-demo; nothing leaves the device. */

const KEY = "hv.recordings";
const AUDIO_DATAURL_CAP = 3.5 * 1024 * 1024; // bytes

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch { /* private mode: keep in-memory */ }
}

const mem = new Map(); // id -> blob URL (screen captures / oversized clips)

let seq = 0;
function id() {
  seq = (seq + 1) % 100000;
  return "rec-" + Date.now().toString(36) + "-" + seq.toString(36);
}

export function fmtDur(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function fmtTs(ts) {
  try {
    return new Date(ts).toLocaleString("en-IN", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export async function addRecording({ kind, title, blob, durMs }) {
  const rec = {
    id: id(),
    kind, // "voice" | "screen"
    title: title || (kind === "voice" ? "Voice clip" : "Screen capture"),
    ts: Date.now(),
    durMs: durMs || 0,
    mime: blob.type || (kind === "voice" ? "audio/webm" : "video/webm"),
    dataUrl: null,
    sessionOnly: false,
  };
  if (kind === "voice" && blob.size <= AUDIO_DATAURL_CAP) {
    rec.dataUrl = await blobToDataURL(blob);
  } else {
    // screen captures & big clips: in-memory object URL (session only)
    const url = URL.createObjectURL(blob);
    mem.set(rec.id, url);
    rec.sessionOnly = true;
  }
  const list = read();
  list.unshift(rec);
  write(list);
  return rec;
}

export function listRecordings() {
  return read();
}

export function playbackURL(rec) {
  if (rec.dataUrl) return rec.dataUrl;
  const url = mem.get(rec.id);
  return url || null;
}

export function removeRecording(id) {
  const url = mem.get(id);
  if (url) {
    try { URL.revokeObjectURL(url); } catch { /* ignore */ }
    mem.delete(id);
  }
  write(read().filter((r) => r.id !== id));
}

export function clearRecordings() {
  for (const url of mem.values()) {
    try { URL.revokeObjectURL(url); } catch { /* ignore */ }
  }
  mem.clear();
  write([]);
}

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(blob);
  });
}
