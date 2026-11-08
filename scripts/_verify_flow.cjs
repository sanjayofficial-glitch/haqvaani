/* Full user-journey click-through for the HaqVaani React SPA at
   http://localhost:8001. Drives the real UI with trusted CDP input events:
   start-case → consent → voice-intake (demo speech) → fact-review →
   rights-check → complaint-builder → call-prep → assisted-call →
   docket-capture → post-call → dossier.

   Usage: node scripts/_verify_flow.cjs [base] [debugPort] */

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.argv[2] || "http://localhost:8001";
const DEBUG_PORT = process.argv[3] || "9444";

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const WS_MODULE = path.resolve(__dirname, "..", "web", "node_modules", "ws");

const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage",
  "--window-size=1440,900", "--remote-debugging-port=" + DEBUG_PORT,
  "--user-data-dir=" + path.join(__dirname, ".verify-flow-cdp-profile-" + DEBUG_PORT),
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
    let msg; try { msg = JSON.parse(raw); } catch { return; }
    if (msg.id !== undefined) {
      const p = pending.get(msg.id);
      if (!p) return;
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(msg.error.message || JSON.stringify(msg.error)));
      else p.resolve(msg.result);
    } else events.push(msg);
  });
  return {
    call(method, params = {}) {
      const id = ++seq;
      return new Promise((resolve, reject) => {
        const to = setTimeout(() => { pending.delete(id); reject(new Error("CDP timeout: " + method)); }, 20000);
        pending.set(id, {
          resolve: (r) => { clearTimeout(to); resolve(r); },
          reject: (e) => { clearTimeout(to); reject(e); },
        });
        const sent = JSON.stringify({ id, method, params });
        if (ws.readyState === 1) ws.send(sent, (err) => { if (err) reject(err); });
        else reject(new Error("ws not open"));
      });
    },
    drain() { return new Promise((r) => setTimeout(r, 250)); },
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
    const pageWsUrl = pages[0].webSocketDebuggerUrl;
    ws.close();
    await sleep(300);

    const pageWs = new WebSocket(pageWsUrl);
    await new Promise((resolve, reject) => {
      const to = setTimeout(() => reject(new Error("page WS connect timeout")), 10000);
      pageWs.on("open", () => { clearTimeout(to); resolve(); });
      pageWs.on("error", (e) => { clearTimeout(to); reject(e); });
    });
    const cdp = makeTransport(pageWs);

    await cdp.call("Page.enable");
    await cdp.call("Runtime.enable");
    await cdp.call("Log.enable");
    await cdp.call("Network.enable");
    await cdp.drain();

    const evalJs = async (expression) => {
      const r = await cdp.call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error("page eval failed: " + JSON.stringify(r.exceptionDetails).slice(0, 240));
      return r.result?.value;
    };

    const mouseClick = async (x, y) => {
      await cdp.call("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
      await cdp.call("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
    };

    // Scroll an element into the middle of the viewport, then return its center.
    const centerOf = async (sel) => {
      const rect = await evalJs(`(async () => {
        const el = document.querySelector(${JSON.stringify(sel)});
        if (!el) return null;
        el.scrollIntoView({ block: 'center', inline: 'center' });
        await new Promise(r => setTimeout(r, 250));
        const r = el.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      })()`);
      return rect;
    };

    // Trusted click on the first element matching a selector (scrolls first).
    const clickSel = async (sel) => {
      const rect = await centerOf(sel);
      if (!rect) return "no-el:" + sel;
      await mouseClick(rect.x, rect.y);
      return "clicked:" + sel;
    };

    // Trusted click on the first primary button.
    const clickPrimary = async () => {
      const rect = await evalJs(`(async () => {
        const b = [...document.querySelectorAll('button')].find(x => x.className && x.className.includes('btn--primary'));
        if (!b) return null;
        b.scrollIntoView({ block: 'center', inline: 'center' });
        await new Promise(r => setTimeout(r, 250));
        const r = b.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2, label: (b.innerText || '').slice(0, 50) };
      })()`);
      if (!rect) return "no-primary-btn";
      await mouseClick(rect.x, rect.y);
      return "primary:" + rect.label;
    };

    // Trusted click on the first button whose text matches a regex.
    const clickButtonByText = async (re) => {
      const hit = await evalJs(`(async () => {
        const b = [...document.querySelectorAll('button')].find(x => ${re}.test((x.innerText || '').replace(/\\s+/g, ' ').trim()));
        if (!b) return null;
        b.scrollIntoView({ block: 'center', inline: 'center' });
        await new Promise(r => setTimeout(r, 250));
        const r = b.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2, label: (b.innerText || '').slice(0, 50) };
      })()`);
      if (!hit) return null;
      await mouseClick(hit.x, hit.y);
      return hit.label;
    };

    // Trusted typing into a focused input (React-controlled friendly).
    const typeInto = async (sel, text) => {
      const ok = await evalJs(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return false; el.focus(); return true; })()`);
      if (!ok) return "no-el:" + sel;
      await cdp.call("Input.insertText", { text });
      return "typed:" + text;
    };

    const PROBE = `(() => {
      const root = document.getElementById('root');
      const t = (document.body.innerText||'').replace(/\\s+/g,' ').trim();
      return { hash: location.hash, rootChildren: root?root.children.length:-1, textLen: t.length,
               textHead: t.slice(0,60) };
    })()`;

    const step = async (label, action, expectHash) => {
      cdp.events.length = 0;
      const actionInfo = await action();
      await sleep(2400);
      const p = await evalJs(PROBE);
      const errs = [];
      const navigations = [];
      for (const ev of cdp.events) {
        if (ev.method === "Runtime.exceptionThrown") errs.push("JS-EXC");
        else if (ev.method === "Runtime.consoleAPICalled" && ev.params?.type === "error") errs.push("CONSOLE-ERR");
        else if (ev.method === "Log.entryAdded" && ["error", "warning"].includes(ev.params?.entry?.level)) errs.push("LOG");
        else if (ev.method === "Network.responseReceived" && ev.params?.response?.status >= 400) errs.push("HTTP" + ev.params.response.status);
        else if (ev.method === "Network.loadingFailed") errs.push("NET-FAIL");
        else if (ev.method === "Page.frameNavigated") navigations.push(ev.params?.frame?.url || "?");
      }
      if (navigations.length) console.log("     [frames navigated]", navigations.join(" | "));
      const blank = p.rootChildren === 0 || p.textLen < 30;
      const hashOk = !expectHash || p.hash === expectHash;
      console.log((blank || !hashOk ? "🔴 " : "🟢 ") + label.padEnd(18) +
        " → " + p.hash.padEnd(34) + " text=" + String(p.textLen).padStart(4) +
        (actionInfo ? " | " + String(actionInfo).slice(0, 60) : "") +
        (errs.length ? " | ERRORS " + errs.join(",") : "") +
        (blank ? " | BLANK?" : "") + (!hashOk ? " | expected " + expectHash : ""));
      for (const e of errs.slice(0, 3)) console.log("     " + e);
      return { ...p, blank, hashOk, errs, label };
    };

    const results = [];

    // 1. start-case → click first case card (UPI) → consent
    await evalJs(`location.hash = '#/start-case'`);
    await sleep(2000);
    results.push(await step("start-case", async () =>
      clickSel('a[href*="consent"], a.case-card, .case-card a'),
      "#/consent?next=voice-intake"));

    // 2. consent → accept both boxes, type name, submit
    results.push(await step("consent", async () => {
      await evalJs(`(() => {
        window.__log = [];
        window.__hashes = [];
        window.addEventListener('hashchange', () => window.__hashes.push(location.hash));
        const of = window.fetch.bind(window);
        window.fetch = (...a) => {
          window.__log.push('REQ ' + (a[1] && a[1].method || 'GET') + ' ' + String(a[0]));
          const p = of(...a);
          p.then(r => window.__log.push('RESP ' + r.status)).catch(e => window.__log.push('ERR ' + e.message));
          return p;
        };
        return true;
      })()`);
      const before = await evalJs(`(() => {
        const els = document.querySelectorAll('#cData, #cAi, #cName');
        return [...els].map(e => {
          const r = e.getBoundingClientRect();
          return { id: e.id, n: document.querySelectorAll('#' + e.id).length,
                   visible: r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight,
                   rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) } };
        });
      })()`);
      console.log("     [consent before]", JSON.stringify(before));
      const c1 = await clickSel("#cData");
      const afterC1 = await evalJs(`new Promise(r => setTimeout(() => r({
        checked: document.querySelector('#cData')?.checked,
        count: document.querySelectorAll('#cData').length,
      }), 250))`);
      console.log("     [after cData click]", JSON.stringify(afterC1), c1);
      const c2 = await clickSel("#cAi");
      const n = await typeInto("#cName", "E2E Citizen");
      const afterTyping = await evalJs(`(() => ({
        name: document.querySelector('#cName')?.value,
        active: document.activeElement?.id || document.activeElement?.tagName,
      }))()`);
      console.log("     [after typing]", JSON.stringify(afterTyping), n);
      const sub = await clickSel("button[type=submit], button.btn--primary");
      await sleep(1500);
      const diag = await evalJs(`(() => ({
        cData: document.querySelector('#cData')?.checked,
        cAi: document.querySelector('#cAi')?.checked,
        name: document.querySelector('#cName')?.value,
        hash: location.hash,
        hashes: window.__hashes || [],
        fetchLog: window.__log || [],
        storage: { ...sessionStorage },
      }))()`);
      console.log("     [consent diag]", JSON.stringify(diag));
      return [c1, c2, n, sub].join(" | ");
    }, "#/voice-intake"));

    // 3. voice-intake → click mic, then either pause (real rec) or demo
    //    auto-type; wait until primary enabled, then click
    results.push(await step("voice-intake", async () => {
      const btns = await evalJs(`(() => [...document.querySelectorAll('button')].map(b => (b.innerText || '').replace(/\\s+/g,' ').trim().slice(0, 50)))()`);
      console.log("     [voice-intake buttons]", JSON.stringify(btns));
      const mic = await clickSel(".mic-big, button.mic-big, [class*='mic']");
      await sleep(3000);
      await clickButtonByText(/रोकें|pause/i);
      let enabled = false;
      for (let i = 0; i < 12 && !enabled; i++) {
        await sleep(2000);
        enabled = await evalJs(`(() => {
          const b = [...document.querySelectorAll('button')].find(x => x.className && x.className.includes('btn--primary'));
          return !!b && !b.disabled;
        })()`);
      }
      return mic + " | primaryEnabled=" + enabled;
    }, null));
    results.push(await step("intake → fact-review", clickPrimary, "#/fact-review"));

    // 4. fact-review → rights-check
    results.push(await step("fact-review", clickPrimary, "#/rights-check"));

    // 5. rights-check → complaint-builder
    results.push(await step("rights-check", clickPrimary, "#/complaint-builder"));

    // 6. complaint-builder → call-prep (approve gate)
    results.push(await step("complaint-builder", clickPrimary, "#/call-prep"));

    // 7. call-prep → assisted-call
    results.push(await step("call-prep", clickPrimary, "#/assisted-call"));

    // 8. assisted-call → click mic, then pause (or demo auto-type), wait for
    //    primary to enable, then continue → docket-capture
    results.push(await step("assisted-call", async () => {
      const btns = await evalJs(`(() => [...document.querySelectorAll('button')].map(b => (b.innerText || '').replace(/\\s+/g,' ').trim().slice(0, 50)))()`);
      console.log("     [assisted-call buttons]", JSON.stringify(btns));
      const mic = await clickSel(".mic-big, button.mic-big, [class*='mic']");
      await sleep(3000);
      await clickButtonByText(/रोकें|pause/i);
      let enabled = false;
      for (let i = 0; i < 12 && !enabled; i++) {
        await sleep(2000);
        enabled = await evalJs(`(() => {
          const b = [...document.querySelectorAll('button')].find(x => x.className && x.className.includes('btn--primary'));
          return !!b && !b.disabled;
        })()`);
      }
      return mic + " | primaryEnabled=" + enabled;
    }, null));
    results.push(await step("assisted → docket", clickPrimary, "#/docket-capture"));

    // 9. docket-capture → post-call
    results.push(await step("docket-capture", clickPrimary, "#/post-call"));

    // 10. post-call → dossier
    results.push(await step("post-call", clickPrimary, "#/dossier"));

    // 11. dossier → assert ledger + JSON export present
    results.push(await step("dossier", async () => {
      const info = await evalJs(`(() => {
        const jsonBtn = [...document.querySelectorAll('button')].find(b => /json|export|डाउनलोड/i.test((b.innerText || '')));
        const ledger = !!document.querySelector('.ledger, table, [class*="ledger"]');
        return 'jsonBtn=' + !!jsonBtn + ' ledger=' + ledger;
      })()`);
      await sleep(1200);
      return info;
    }, null));

    const blanks = results.filter(r => r.blank);
    const badNav = results.filter(r => !r.hashOk);
    const errTotal = results.reduce((n, r) => n + r.errs.length, 0);
    console.log("\n=== FLOW SUMMARY: " + results.length + " steps | blanks=" + blanks.length +
      " | wrong-nav=" + badNav.length + " | errors=" + errTotal + " ===");
    for (const r of blanks) console.log("BLANK:", r.label, JSON.stringify(r.textHead));
    for (const r of badNav) console.log("NAV FAIL:", r.label, "expected", r.hash, "got", r.hash);

    pageWs.close();
    chrome.kill();
    process.exit(blanks.length === 0 && badNav.length === 0 ? 0 : 2);
  } catch (e) {
    console.error("ERROR:", e.message);
    try { if (chromeStderr) console.log("CHROME STDERR:\n" + chromeStderr.slice(0, 1200)); } catch {}
    try { chrome.kill(); } catch {}
    process.exit(1);
  }
}

main();
