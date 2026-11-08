/* HQ.fmt / HQ.dfmt / HQ.speak-display-aid / substringVerify equivalents.
   Currency and date are display formatting only — statutory numbers always
   arrive from the API (pure Python), never computed here.                     */

export function fmtInr(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

const HI_MONTHS = ["जनवरी","फ़रवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"];
const EN_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function fmtDate(iso, lang /* "en" | "hi" */) {
  if (!iso) return "—";
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  if (isNaN(d)) return iso;
  const day = d.getDate();
  const m = d.getMonth();
  const y = d.getFullYear();
  return lang === "hi" ? `${day} ${HI_MONTHS[m]} ${y}` : `${day} ${EN_MONTHS[m]} ${y}`;
}

export function fmtTs(ts, locale /* default en-IN */) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d)) return ts;
  return d.toLocaleString(locale || "en-IN", { dateStyle: "medium", timeStyle: "short" });
}

/* client-side verbatim substring re-check — a display aid; the authoritative
   verify lives server-side (safety.verify_verbatim_substring via /api/assisted) */
export function substringVerify(candidate, transcript) {
  if (!candidate || !transcript) return false;
  return transcript.toLowerCase().indexOf(candidate.trim().toLowerCase()) !== -1;
}

export function isoToday() {
  const t = new Date();
  return t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
}

/* FORBIDDEN-surface display strip: the UI never crafts outbound text with
   secrets; this mirrors the server rule so drafts typed by the user that
   contain an OTP/PIN word are caught before being shown as "the script" */
export const SECRET_RE = /\b(?:otp|pin|mpin|cvv|password)\b/i;
