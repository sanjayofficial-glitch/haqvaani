/* Post-polish verification: responsive overflow at 375/768 widths + header
   back-button presence/action on the React SPA (http://localhost:8001). */
const { spawn } = require("child_process");
const path = require("path");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:8001";
const PORT = "9999";

const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage",
  "--window-size=768,1024", "--remote-debugging-port=" + PORT,
  "--user-data-dir=" + path.join(__dirname, ".verify-polish-" + PORT),
  "--host-resolver-rules=MAP localhost:" + PORT + " 127.0.0.1:" + PORT,
  BASE,
], { stdio: ["ignore", "pipe", "pipe"] });
chrome.stderr.on("data", (d) => {
  const m = d.toString().match(/DevTools listening on (ws:\/\/[^\s]+)/);
  if (m) run(m[1]);
});

function run(wsUrl) {
  const WebSocket = require(path.join(__dirname, "..", "web", "node_modules", "ws"));
  const ws = new WebSocket(wsUrl);
  ws.on("open", async () => {
    let id = 0; const pending = new Map();
    ws.on("message", (raw) => {
      const m = JSON.parse(raw);
      if (m.id !== undefined && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
    });
    const call = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const http = require("http");
    http.get("http://127.0.0.1:" + PORT + "/json/list", (res) => {
      let b = ""; res.on("data", (c) => (b += c));
      res.on("end", async () => {
        const page = JSON.parse(b).find((p) => p.type === "page");
        const pws = new WebSocket(page.webSocketDebuggerUrl);
        pws.on("open", async () => {
          let pid = 0; const pp = new Map();
          pws.on("message", (raw) => {
            const m = JSON.parse(raw);
            if (m.id !== undefined && pp.has(m.id)) { pp.get(m.id)(m.result); pp.delete(m.id); }
          });
          const pc = (method, params = {}) => new Promise((r) => { const i = ++pid; pp.set(i, r); pws.send(JSON.stringify({ id: i, method, params })); });
          const ev = async (expression) => (await pc("Runtime.evaluate", { expression, returnByValue: true })).result.value;
          await pc("Runtime.enable"); await pc("Page.enable");

          const ROUTES = ["#/start-case", "#/consent", "#/voice-intake", "#/fact-review", "#/rights-check", "#/complaint-builder", "#/call-prep", "#/assisted-call", "#/docket-capture", "#/post-call", "#/dossier"];
          let fail = 0;
          for (const width of [375, 768]) {
            await pc("Emulation.setDeviceMetricsOverride", { width, height: width === 375 ? 812 : 1024, deviceScaleFactor: 1, mobile: width === 375 });
            for (const r of ROUTES) {
              await pc("Page.navigate", { url: BASE + r }); await sleep(1900);
              const o = await ev(`(() => ({
                hash: location.hash,
                over: document.documentElement.scrollWidth - window.innerWidth,
                back: !!document.querySelector('button.back'),
              }))()`);
              const bad = o.over > 1;
              if (bad) fail++;
              console.log((bad ? "🔴 " : "🟢 ") + "w=" + width + " " + String(o.hash).padEnd(34) + " overflow=" + o.over + " back=" + o.back);
            }
          }

          // back button action: from rights-check → fact-review
          await pc("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
          await pc("Page.navigate", { url: BASE + "#/rights-check" }); await sleep(1900);
          const hasBack = await ev("!!document.querySelector('button.back')");
          await ev("document.querySelector('button.back')?.click()"); await sleep(1600);
          const afterBack = await ev("location.hash");
          console.log("\nBack button on rights-check:", hasBack, "→", afterBack);

          console.log("\nRESULT:", fail === 0 && hasBack && afterBack === "#/fact-review" ? "ALL GOOD" : "ISSUES");
          chrome.kill(); process.exit(fail === 0 && hasBack && afterBack === "#/fact-review" ? 0 : 2);
        });
      });
    });
  });
}
