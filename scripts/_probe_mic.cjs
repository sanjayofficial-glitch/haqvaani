/* One-off probe: does the voice-intake mic button start real recording
   (headless) or fall back to demo playback? Prints hint text before/after
   clicking .mic-big plus button states. */
const { spawn } = require("child_process");
const path = require("path");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:8001";
const PORT = "9777";

const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage",
  "--window-size=1440,900", "--remote-debugging-port=" + PORT,
  "--user-data-dir=" + path.join(__dirname, ".probe-" + PORT),
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
          await pc("Runtime.enable"); await pc("Page.enable");
          await pc("Page.navigate", { url: BASE + "/#/voice-intake" }); await sleep(2500);
          const ev = async (expression) => (await pc("Runtime.evaluate", { expression, returnByValue: true })).result.value;
          console.log("BEFORE:", JSON.stringify((await ev("document.body.innerText.slice(-240)"))));
          console.log("CLASSES:", JSON.stringify((await ev("[...document.querySelectorAll('button')].map(b=>b.className+':'+(b.getAttribute('aria-label')||''))"))));
          const rect = await ev("(()=>{const e=[...document.querySelectorAll('button')].find(b=>/mic|Mic/.test(b.className+b.getAttribute('aria-label')||''))||document.querySelectorAll('button')[2];const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()");
          await pc("Input.dispatchMouseEvent", { type: "mousePressed", x: rect.x, y: rect.y, button: "left", clickCount: 1 });
          await pc("Input.dispatchMouseEvent", { type: "mouseReleased", x: rect.x, y: rect.y, button: "left", clickCount: 1 });
          await sleep(4000);
          console.log("AFTER4s:", JSON.stringify((await ev("document.body.innerText.slice(-240)"))));
          console.log("BUTTONS:", JSON.stringify((await ev("[...document.querySelectorAll('button')].map(b=>b.disabled+':'+(b.innerText||'').replace(/\\s+/g,' ').slice(0,40))"))));
          chrome.kill(); process.exit(0);
        });
      });
    });
  });
}
