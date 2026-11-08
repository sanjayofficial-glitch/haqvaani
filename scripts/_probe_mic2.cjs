/* Classify voice-intake mic behavior: seeds server+local consent, opens
   #/voice-intake, clicks the mic, prints the hint line (listening / demo). */
const { spawn } = require("child_process");
const path = require("path");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:8001";
const PORT = "9889";

const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage",
  "--window-size=1440,900", "--remote-debugging-port=" + PORT,
  "--user-data-dir=" + path.join(__dirname, ".probe2-" + PORT),
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
          const ev = async (expression) => (await pc("Runtime.evaluate", { expression, returnByValue: true })).result.value;

          // seed consent: local + server
          await ev(`(() => {
            const sid = 'probe-' + Math.random().toString(36).slice(2);
            sessionStorage.setItem('hv.session', sid);
            sessionStorage.setItem('hv.state', JSON.stringify({
              consent: { ts: new Date().toISOString(), disclosure: true, name: 'Probe', local: false, disclosureText: 'This is an AI assistant assisting you.' }
            }));
            window.__sid = sid;
            return sid;
          })()`);
          const sid = await ev("window.__sid");
          await ev(`fetch('/api/consent', { method:'POST', headers:{'Content-Type':'application/json','X-Haqvaani-Session':${JSON.stringify("__SID__")}.replace('__SID__', window.__sid)}, body: JSON.stringify({user_name:'Probe'}) }).then(r=>r.status)`);
          await pc("Page.navigate", { url: BASE + "/#/voice-intake" }); await sleep(2500);

          const hintBefore = await ev(`() => {
            const t = document.body.innerText;
            const lines = t.split('\\n').filter(l => /सुन|listening|माइक|mic|बोली|speech|dem/i.test(l));
            return lines.slice(-4);
          }`);
          console.log("HINT BEFORE:", JSON.stringify(hintBefore));

          const micSel = await ev(`(() => {
            const b = [...document.querySelectorAll('button')].find(x => /mic/i.test(x.className + ' ' + (x.getAttribute('aria-label') || '')));
            return b ? b.className + '|' + (b.getAttribute('aria-label') || '') : null;
          })()`);
          console.log("MIC BUTTON:", micSel);

          const rect = await ev(`(() => {
            const b = [...document.querySelectorAll('button')].find(x => /mic/i.test(x.className + ' ' + (x.getAttribute('aria-label') || '')));
            const r = b.getBoundingClientRect();
            return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
          })()`);
          if (rect) {
            await pc("Input.dispatchMouseEvent", { type: "mousePressed", x: rect.x, y: rect.y, button: "left", clickCount: 1 });
            await pc("Input.dispatchMouseEvent", { type: "mouseReleased", x: rect.x, y: rect.y, button: "left", clickCount: 1 });
          }
          await sleep(3000);
          const hintAfter = await ev(`() => {
            const t = document.body.innerText;
            const lines = t.split('\\n').filter(l => /सुन|listening|माइक|mic|बोली|speech|dem/i.test(l));
            return lines.slice(-4);
          }`);
          console.log("HINT AFTER 3s:", JSON.stringify(hintAfter));
          const btnState = await ev(`[ ...document.querySelectorAll('button')].map(b=>b.className+'|disabled='+b.disabled+'|'+(b.innerText||'').replace(/\\s+/g,' ').slice(0,30))`);
          console.log("BUTTONS:", JSON.stringify(btnState));
          chrome.kill(); process.exit(0);
        });
      });
    });
  });
}
