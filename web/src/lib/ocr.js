/* OCR text → structured facts for the screenshot prefill (Fact Review).
   Runs fully on-device (tesseract.js); nothing leaves the browser.
   Parsers deliberately accept the messy layouts of payment screenshots:
   grouped UTRs, ₹ amounts with commas, several date formats.              */

/** best-effort date parser: dd/mm/yyyy, dd-mm-yyyy, dd MMM yyyy */
export function parseOcrDate(text) {
  const d1 = text.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if (d1) {
    return `${d1[3]}-${String(d1[2]).padStart(2, "0")}-${String(d1[1]).padStart(2, "0")}`;
  }
  const d2 = text.match(/\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})\b/i);
  if (d2) {
    const mo = {
      jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
      jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
    }[d2[2].toLowerCase()];
    return `${d2[3]}-${mo}-${String(d2[1]).padStart(2, "0")}`;
  }
  return null;
}

/** best-effort UTR parser: 12-digit runs, with or without group spaces */
export function parseOcrUtr(text) {
  const grouped = text.match(/\b(\d{4}\s?\d{4}\s?\d{4})\b/);
  if (grouped) return grouped[1].replace(/\s/g, "");
  const flat = text.match(/\b(\d{12})\b/);
  if (flat) return flat[1];
  return null;
}

/** best-effort amount parser: ₹ / Rs / INR with Indian grouping */
export function parseOcrAmount(text) {
  const m = text.match(/(?:₹|Rs\.?|INR)\s*([\d]{1,3}(?:,[\d]{3})+|\d+)(?:\.\d{1,2})?/i);
  if (!m) return null;
  return Number(m[1].replace(/,/g, ""));
}

/** run every parser; returns {amount, utr, date} with only found fields */
export function parseOcrText(text) {
  const out = {};
  const amount = parseOcrAmount(text);
  if (amount) out.amount = amount;
  const utr = parseOcrUtr(text);
  if (utr) out.utr = utr;
  const date = parseOcrDate(text);
  if (date) out.date = date;
  return out;
}
