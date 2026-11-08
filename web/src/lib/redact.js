/* Sliding-window secret redactor.
   Callers pause mid-OTP/PIN across VAD frames, so a per-utterance check can
   miss a secret split across segments. This keeps a rolling buffer of recent
   text and runs FORBIDDEN_SECRET_RE over the whole window — if any part of
   a secret ever appears, it is blocked and counted.                        */

import { SECRET_RE } from "./format.js";

export class RollingRedactor {
  constructor({ windowMs = 10000, regex = SECRET_RE } = {}) {
    this.windowMs = windowMs;
    this.regex = regex;
    this.buffer = [];
  }

  /** push new text (e.g. a transcript segment / typed line), returns the
      block verdict for the whole current window */
  push(text, now = Date.now()) {
    if (text && text.trim()) this.buffer.push({ at: now, text });
    const cutoff = now - this.windowMs;
    this.buffer = this.buffer.filter((s) => s.at >= cutoff);
    const joined = this.buffer.map((s) => s.text).join(" ");
    const m = this.regex.exec(joined);
    return { blocked: !!m, match: m ? m[0] : null, segments: this.buffer.length };
  }

  reset() {
    this.buffer = [];
  }
}
