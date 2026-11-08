/* Capture full-page screenshot of http://localhost:8000 via Chrome DevTools Protocol.
   Uses Chrome's headless mode + CDP directly. ws module lives in web/node_modules.
   Chrome emits a browser-level WebSocket URL like:
     ws://[::1]:9222/devtools/browser/<uuid>
   We connect there, call Target.getTargets, attach to the page, then captureScreenshot. */

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const URL = "http://localhost:8000";
const OUT = "haqvaani_fullpage.png";

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// ws lives in web/node_modules (installed for the Vite dev server).
const WS_MODULE = path.resolve(__dirname, "..", "web", "node_modules", "ws");

// 1. Start Chrome in headless CDP mode, listening on localhost IPv4 so we can reach it.
const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--disable-dev-shm-usage",
  "--window-size=1440,9000",  // tall window for full-page capture
  "--remote-debugging-port=9222",
  "--user-data-dir=" + path.join(__dirname, ".cdp-profile"),
  "--host-resolver-rules=MAP localhost:8000 127.0.0.1:8000",
  URL,
], { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env } });

// Collect Chrome's stderr to extract the browser-level WS URL.
let chromeStderr = "";
const chromeStderrBuf = [];
chrome.stderr.on("data", (d) => { chromeStderr += d.toString(); chromeStderrBuf.push(d); });

const waitForChrome = () =>
  new Promise((resolve, reject) => {
    const to = setTimeout(() => {
      try { console.log("CHROME STDERR:\n" + chromeStderr.slice(0, 2000)); } catch {}
      reject(new Error("Chrome startup timeout"));
    }, 25000);
    const onData = (d) => {
      const s = d.toString();
      const m = s.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (m) {
        clearTimeout(to);
        chrome.stderr.removeListener("data", onData);
        resolve(m[1]); // the browser-level WebSocket URL
      }
    };
    chrome.stderr.on("data", onData);
    chrome.on("close", (code) => {
      clearTimeout(to);
      reject(new Error("Chrome exited with code " + code));
    });
  });

// Minimal message-matched CDP transport.
function makeTransport(ws) {
  const pending = new Map(); // id -> { resolve, reject }
  let seq = 0;

  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    const p = pending.get(msg.id);
    if (!p) return; // stale/event message we don't care about
    pending.delete(msg.id);
    if (msg.error) p.reject(new Error(msg.error.message || JSON.stringify(msg.error)));
    else p.resolve(msg.result);
  });    return {
      call(method, params = {}, sessionId = null) {
        const id = ++seq;
        const wrapped = sessionId
          ? { ...params, sessionId }
          : params;
        return new Promise((resolve, reject) => {
          const to = setTimeout(() => {
            pending.delete(id);
            reject(new Error("CDP timeout: " + method));
          }, 20000);
          pending.set(id, {
            resolve: (r) => { clearTimeout(to); resolve(r); },
            reject: (e) => { clearTimeout(to); reject(e); },
          });
          const sent = JSON.stringify({ id, method, params: wrapped });
          if (ws.readyState === 1) ws.send(sent, (err) => { if (err) reject(err); });
          else reject(new Error("ws not open"));
        });
      },
    drain() { return new Promise((r) => setTimeout(r, 500)); },
  };
}

async function main() {
  let browserWsUrl = null;
  try {
    browserWsUrl = await waitForChrome();
    console.log("Chrome started. Browser WS URL:", browserWsUrl);

    const WebSocket = require(WS_MODULE);
    const ws = new WebSocket(browserWsUrl);

    await new Promise((resolve, reject) => {
      const to = setTimeout(() => reject(new Error("CDP connect timeout")), 10000);
      ws.on("open", () => { clearTimeout(to); resolve(); });
      ws.on("error", (e) => { clearTimeout(to); reject(e); });
      ws.on("close", () => reject(new Error("CDP connection closed")));
    });

    const cdp = makeTransport(ws);

    // 2. List targets, pick the page target that opened our URL.
    const targets = await cdp.call("Target.getTargets");
    const tInfos = targets?.targetInfos || [];
    console.log("Targets:", tInfos.length, "->",
      JSON.stringify(tInfos.map(t => ({ type: t.type, title: t.title, url: t.url, id: t.targetId, ws: t.webSocketDebuggerUrl }))));

    // Prefer a page whose URL matches localhost:8000.
    let targetId = null;
    let pageWsUrl = null;
    const ours = tInfos.filter(t => t.type === "page" && t.url && t.url.includes("localhost:8000"));
    if (ours.length) {
      targetId = ours[0].targetId;
      pageWsUrl = ours[0].webSocketDebuggerUrl;
    } else {
      const anyPage = tInfos.find(t => t.type === "page");
      if (anyPage) { targetId = anyPage.targetId; pageWsUrl = anyPage.webSocketDebuggerUrl; }
    }

    if (!targetId) throw new Error("No page target found");
    console.log("Target ID:", targetId, "page WS:", pageWsUrl || "(none — will use browser WS + attach)");

    // 3. Try the HTTP /json endpoint first (it reliably exposes webSocketDebuggerUrl per page).
    let pageWsUrl2 = pageWsUrl;
    if (!pageWsUrl2) {
      try {
        const http = require("http");
        const httpRes = await new Promise((resolve, reject) => {
          const req = http.get("http://127.0.0.1:9222/json", { timeout: 5000 }, (res) => {
            let body = "";
            res.on("data", (c) => (body += c));
            res.on("end", () => resolve(body));
          });
          req.on("error", reject);
          req.on("timeout", () => { req.destroy(); reject(new Error("http timeout")); });
        });
        const pages = JSON.parse(httpRes).filter(p => p.type === "page" && p.url && p.url.includes("localhost:8000"));
        if (pages.length && pages[0].webSocketDebuggerUrl) {
          pageWsUrl2 = pages[0].webSocketDebuggerUrl;
          console.log("Got page WS from /json:", pageWsUrl2);
        }
      } catch (e) { console.log("/json failed:", e.message); }
    }

    let screenCdp;
    if (pageWsUrl2) {
      // Use the page's own CDP WebSocket directly.
      ws.close();
      await new Promise((r) => setTimeout(r, 300));
      const pageWs = new WebSocket(pageWsUrl2);
      await new Promise((resolve, reject) => {
        const to = setTimeout(() => reject(new Error("page WS connect timeout")), 10000);
        pageWs.on("open", () => { clearTimeout(to); resolve(); });
        pageWs.on("error", (e) => { clearTimeout(to); reject(e); });
        pageWs.on("close", () => reject(new Error("page WS closed")));
      });
      console.log("Connected to page-level CDP WS");
      screenCdp = makeTransport(pageWs);
      await screenCdp.call("Page.enable");
      await screenCdp.call("DOM.enable");
    } else {
      // Fallback: attach to the page target on the browser-level WS (flatten).
      const attachResult = await cdp.call("Target.attachToTarget", { targetId, flatten: true });
      console.log("Attach result:", JSON.stringify(attachResult));
      await cdp.drain();
      console.log("Attached (flatten) to target", targetId);
      screenCdp = cdp;
      await screenCdp.call("Page.enable");
      await screenCdp.call("DOM.enable");
    }
    await screenCdp.drain();
    console.log("CDP domains enabled");

    // 4. Wait for the SPA to render fully.
    await screenCdp.drain();
    await new Promise((r) => setTimeout(r, 5000));
    console.log("Wait done");

    // 5. Capture full-page screenshot.
    const shot = await screenCdp.call("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: true,
    });

    if (!shot || !shot.data) throw new Error("No image data in screenshot response");
    fs.writeFileSync(OUT, Buffer.from(shot.data, "base64"));
    console.log("Saved screenshot:", OUT, "=>", fs.statSync(OUT).size, "bytes");

    ws.close();
    chrome.kill();
    console.log("Done");
  } catch (e) {
    console.error("ERROR:", e.message);
    try { if (chromeStderr) console.log("CHROME STDERR:\n" + chromeStderr.slice(0, 1500)); } catch {}
    try { chrome.kill(); } catch {}
    process.exit(1);
  }
}

main();
