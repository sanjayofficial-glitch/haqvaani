/* Headless render audit for the HaqVaani React SPA (web/dist) served at
   http://localhost:8001. Loads every hash route, waits for React to mount,
   measures the DOM (root children, visible text, key shell elements),
   collects JS exceptions / console errors / failed network loads, and
   screenshots the start-case screen.

   Usage:  node scripts/_verify_app_screens.cjs [base] [debugPort]
   Base defaults to http://localhost:8001; debugPort defaults to 9333.
   (Chrome must be installed at the path in CHROME below.) */

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.argv[2] || "http://localhost:8001";
const DEBUG_PORT = process.argv[3] || "9333";
const SHOT = require("path").join(__dirname, "..", "artifacts", "verify-start-case.png");

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const WS_MODULE = path.resolve(__dirname, "..", "web", "node_modules", "ws");

const ROUTES = [
  ["start-case", "#/start-case"],
  ["consent", "#/consent"],
  ["voice-intake", "#/voice-intake"],
  ["fact-review", "#/fact-review"],
  ["rights-check", "#/rights-check"],
  ["complaint-builder", "#/complaint-builder"],
  ["call-prep", "#/call-prep"],
  ["assisted-call", "#/assisted-call"],
  ["docket-capture", "#/docket-capture"],
  ["post-call", "#/post-call"],
  ["dossier", "#/dossier"],
];

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--disable-dev-shm-usage",
  "--window-size=1440,900",
  "--remote-debugging-port=" + DEBUG_PORT,
  "--user-data-dir=" + path.join(__dirname, ".verify-cdp-profile"),
  "--host-resolver-rules=MAP localhost:" + DEBUG_PORT + " 127.0.0.1:" + DEBUG_PORT,
  BASE,
], { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env } });

let chromeStderr = "";
chrome.stderr.on("data", (d) => { chromeStderr += d.toString(); });

const waitForChrome = () =>
  new Promise((resolve, reject) => {
    const to = setTimeout(() => reject(new Error("Chrome startup timeout")), 25000);
    const onData = (d) => {
      const m = d.toString().match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (m) { clearTimeout(to); chrome.stderr.removeListener("data", onData); resolve(m[1]); }
    };
    chrome.stderr.on("data", onData);
    chrome.on("close", () => { clearTimeout(to); reject(new Error("Chrome exited early")); });
  });

function makeTransport(ws) {
  const pending = new Map();
  const events = [];
  let seq = 0;
  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    if (msg.id !== undefined) {
      const p = pending.get(msg.id);
      if (!p) return;
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(msg.error.message || JSON.stringify(msg.error)));
      else p.resolve(msg.result);
    } else {
      events.push(msg);
    }
  });
  return {
    call(method, params = {}, sessionId = null) {
      const id = ++seq;
      return new Promise((resolve, reject) => {
        const to = setTimeout(() => { pending.delete(id); reject(new Error("CDP timeout: " + method)); }, 20000);
        pending.set(id, {
          resolve: (r) => { clearTimeout(to); resolve(r); },
          reject: (e) => { clearTimeout(to); reject(e); },
        });
        const sent = JSON.stringify({ id, method, params: sessionId ? { ...params, sessionId } : params });
        if (ws.readyState === 1) ws.send(sent, (err) => { if (err) reject(err); });
        else reject(new Error("ws not open"));
      });
    },
    drain() { return new Promise((r) => setTimeout(r, 300)); },
    events,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  let browserWsUrl;
  try {
    browserWsUrl = await waitForChrome();
    const WebSocket = require(WS_MODULE);
    const ws = new WebSocket(browserWsUrl);
    await new Promise((resolve, reject) => {
      const to = setTimeout(() => reject(new Error("CDP connect timeout")), 10000);
      ws.on("open", () => { clearTimeout(to); resolve(); });
      ws.on("error", (e) => { clearTimeout(to); reject(e); });
    });

    const cdp = makeTransport(ws);

    // Find the page target via the HTTP /json list endpoint (reliably exposes
    // per-page webSocketDebuggerUrl, unlike Target.getTargets on this Chrome).
    const http = require("http");
    const listBody = await new Promise((resolve, reject) => {
      const req = http.get("http://127.0.0.1:" + DEBUG_PORT + "/json/list", { timeout: 5000 }, (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve(body));
      });
      req.on("error", reject);
      req.on("timeout", () => { req.destroy(); reject(new Error("json/list timeout")); });
    });
    const pages = JSON.parse(listBody).filter(p => p.type === "page" && p.url && p.url.startsWith(BASE));
    if (!pages.length) throw new Error("No page target found for " + BASE);
    const pageWsUrl = pages[0].webSocketDebuggerUrl;
    console.log("Page WS (from /json/list):", pageWsUrl);
    ws.close();
    await sleep(300);

    const pageWs = new WebSocket(pageWsUrl);
    await new Promise((resolve, reject) => {
      const to = setTimeout(() => reject(new Error("page WS connect timeout")), 10000);
      pageWs.on("open", () => { clearTimeout(to); resolve(); });
      pageWs.on("error", (e) => { clearTimeout(to); reject(e); });
    });
    const screen = makeTransport(pageWs);
    const doCall = (method, params = {}) => screen.call(method, params, null);

    await doCall("Page.enable");
    await doCall("Runtime.enable");
    await doCall("Log.enable");
    await doCall("DOM.enable");
    await doCall("Network.enable");
    await screen.drain();

    const probe = `(() => {
      const root = document.getElementById('root');
      const bodyText = (document.body.innerText || '').replace(/\\s+/g, ' ').trim();
      return {
        path: location.hash,
        title: document.title,
        rootChildren: root ? root.children.length : -1,
        rootHTML: root ? root.innerHTML.length : -1,
        textLen: bodyText.length,
        textHead: bodyText.slice(0, 90),
        h1s: document.querySelectorAll('h1').length,
        buttons: document.querySelectorAll('button').length,
        links: [...document.querySelectorAll('a')].map(a => a.getAttribute('href')).filter(Boolean),
        stepBar: !!document.querySelector('#stepMount, .steps, [class*="step"'),
        safety: !!document.querySelector('.safety'),
        modeChip: !!document.querySelector('#modeChip, [class*="chip"]'),
      };
    })()`;

    const results = [];
    for (const [name, hash] of ROUTES) {
      const t0 = Date.now();
      // Clear event buffer for this screen.
      screen.events.length = 0;
      await doCall("Page.navigate", { url: BASE + hash });
      await sleep(2200);
      let data = null, evalErr = null;
      try {
        const r = await doCall("Runtime.evaluate", { expression: probe, returnByValue: true });
        data = r.result?.value ?? null;
      } catch (e) { evalErr = e.message; }

      const errs = [];
      for (const ev of screen.events) {
        if (ev.method === "Runtime.exceptionThrown") {
          const d = ev.params?.exceptionDetails;
          errs.push("JS-EXC: " + (d?.exception?.description || d?.text || "unknown"));
        } else if (ev.method === "Runtime.consoleAPICalled" && ev.params?.type === "error") {
          errs.push("CONSOLE-ERR: " + JSON.stringify(ev.params.args?.map(a => a.value ?? a.description).slice(0, 2)));
        } else if (ev.method === "Log.entryAdded" && (ev.params?.entry?.level === "error" || ev.params?.entry?.level === "warning")) {
          const e = ev.params.entry;
          errs.push("LOG-" + e.level.toUpperCase() + ": " + (e.text || "").slice(0, 160));
        } else if (ev.method === "Network.responseReceived") {
          const r = ev.params?.response;
          if (r && r.status >= 400) errs.push("HTTP " + r.status + ": " + (r.url || "").slice(0, 120));
        } else if (ev.method === "Network.loadingFailed") {
          const f = ev.params;
          if (f && f.errorText) errs.push("NET-FAIL: " + (f.url || "").slice(0, 120) + " → " + f.errorText);
        }
      }

      const blank = !data || data.rootChildren === 0 || data.textLen < 30;
      results.push({
        name, hash, blank, evalErr, errors: errs.slice(0, 6), ms: Date.now() - t0,
        rootChildren: data?.rootChildren, textLen: data?.textLen,
        textHead: data?.textHead, stepBar: data?.stepBar, safety: data?.safety,
      });
      console.log((blank ? "🔴 BLANK? " : "🟢 ") + name.padEnd(18) +
        " rootChildren=" + (data?.rootChildren) + " textLen=" + (data?.textLen) +
        " (" + (Date.now() - t0) + "ms)" + (errs.length ? " ERRORS=" + errs.length : ""));
      for (const e of errs.slice(0, 3)) console.log("     " + e);
    }

    // Deep check on start-case: screenshot + first-case-card click-through.
    await doCall("Page.navigate", { url: BASE + "#/start-case" });
    await sleep(2200);
    const shot = await doCall("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: true });
    if (shot?.data) {
      fs.mkdirSync(path.dirname(SHOT), { recursive: true });
      fs.writeFileSync(SHOT, Buffer.from(shot.data, "base64"));
      console.log("\nSaved start-case screenshot:", SHOT);
    }

    const clickProbe = `(() => {
      const cards = [...document.querySelectorAll('a[href*="consent"], button[data-type], .case-card, a.case-card')];
      const first = cards[0] || document.querySelector('a[href]');
      if (first) { first.click(); return { clicked: true, href: first.getAttribute('href') || first.tagName }; }
      return { clicked: false };
    })()`;
    const cr = await doCall("Runtime.evaluate", { expression: clickProbe, returnByValue: true });
    await sleep(1800);
    const after = await doCall("Runtime.evaluate", { expression: `location.hash`, returnByValue: true });
    console.log("Start-case card click →", JSON.stringify(cr.result?.value), "→ hash now:", after.result?.value);

    const blankCount = results.filter(r => r.blank).length;
    const errCount = results.reduce((n, r) => n + r.errors.length, 0);
    console.log("\n=== SUMMARY: " + blankCount + " blank/white screens, " + errCount + " JS/console errors across " + results.length + " routes ===");

    // Print a compact verdict table.
    for (const r of results) {
      if (r.blank) console.log("BLANK:", r.name, "root=" + r.rootChildren, "text=" + r.textLen, JSON.stringify(r.textHead), r.evalErr || "");
    }

    ws.close();
    chrome.kill();
    process.exit(blankCount === 0 && errCount === 0 ? 0 : 2);
  } catch (e) {
    console.error("ERROR:", e.message);
    try { if (chromeStderr) console.log("CHROME STDERR:\n" + chromeStderr.slice(0, 1200)); } catch {}
    try { chrome.kill(); } catch {}
    process.exit(1);
  }
}

main();
