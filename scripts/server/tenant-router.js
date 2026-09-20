// Production entrypoint (shipped as dist/server.js by prepare-artifact.sh).
//
// v5 — simple, self-healing multi-tenant router. Deliberately NOT zero-downtime:
// two small marketing sites don't need rolling swaps, and the swap machinery was
// the source of every router bug (2026-09 codex review). One supervised child
// per tenant; an active health loop restarts a wedged/dead child (SIGKILL, since
// Next ignores SIGTERM); the proxy fails fast so a dead upstream never hangs the
// front. The Infomaniak front proxies ONLY to PUBLIC_PORT (3000); this process
// must own it. A deploy is a file drop: the health loop notices the BUILD_ID
// changed and cycles the child into the new release.
"use strict";

const fs = require("fs");
const http = require("http");
const net = require("net");
const path = require("path");
const { spawn } = require("child_process");

const intEnv = (n, d) => { const v = parseInt(process.env[n] || "", 10); return Number.isInteger(v) ? v : d; };
const PUBLIC_PORT = intEnv("PORT", 3000);
const RIDGER_HOSTS = new Set(["ridger.ch", "www.ridger.ch"]);
const CHILD_NODE_OPTIONS = "--max-old-space-size=384";

const TENANTS = {
  houle:  { dir: "/srv/customer/sites/houle.ai/current",  entry: "server-app.js", port: intEnv("APP_PORT", 5010) },
  ridger: { dir: "/srv/customer/sites/ridger.ch/current", entry: "server.js",     port: intEnv("RIDGER_PORT", 5001) },
};
for (const t of Object.values(TENANTS)) {
  if (t.port === PUBLIC_PORT) { console.error(`[router] tenant port == public ${PUBLIC_PORT}`); process.exit(1); }
}

let shuttingDown = false;

class Tenant {
  constructor(name, cfg) {
    this.name = name; this.cfg = cfg;
    this.child = null; this.buildId = null;
    this.starting = false; this.fails = 0; this.exits = [];
  }
  buildIdOnDisk() {
    try { return fs.readFileSync(path.join(this.cfg.dir, ".next", "BUILD_ID"), "utf8").trim(); }
    catch { return null; }
  }
  start() {
    if (shuttingDown || this.starting) return;
    const entry = path.join(this.cfg.dir, this.cfg.entry);
    if (!fs.existsSync(entry)) { console.error(`[router] ${this.name}: ${entry} missing; retry 30s`); setTimeout(() => this.start(), 30000); return; }
    this.starting = true;
    // free the port from any stale holder first (Next ignores SIGTERM → KILL)
    this.kill(() => {
      const child = spawn(process.execPath, [entry], {
        cwd: this.cfg.dir,
        env: { ...process.env, PORT: String(this.cfg.port), HOSTNAME: "127.0.0.1", NODE_OPTIONS: CHILD_NODE_OPTIONS },
        stdio: "inherit",
      });
      this.child = child;
      this.buildId = this.buildIdOnDisk();
      child.on("exit", (code, sig) => {
        if (shuttingDown || this.child !== child) return;
        this.child = null;
        const now = Date.now(); this.exits = this.exits.filter(t => now - t < 60000); this.exits.push(now);
        const delay = this.exits.length > 5 ? 15000 : 1000;
        console.error(`[router] ${this.name} exited (code=${code} sig=${sig}); restart in ${delay}ms`);
        setTimeout(() => this.start(), delay);
      });
      console.log(`[router] ${this.name} started pid=${child.pid} :${this.cfg.port} build=${this.buildId}`);
      this.starting = false;
    });
  }
  kill(cb) {
    // kill anything holding our port (own child or a stale process), then cb
    const done = () => cb && cb();
    if (this.child && this.child.exitCode === null) {
      const c = this.child; this.child = null;
      try { c.kill("SIGKILL"); } catch {}
    }
    setTimeout(done, 500);
  }
  probe(cb) {
    let done = false;
    const finish = (v) => { if (done) return; done = true; cb(v); };
    const req = http.get({ host: "127.0.0.1", port: this.cfg.port, path: "/api/health/?d=router", timeout: 4000 }, (res) => {
      res.resume(); finish(res.statusCode === 200);
    });
    req.on("error", () => finish(false));
    req.on("timeout", () => { req.destroy(); finish(false); });
  }
  supervise() {
    if (shuttingDown) return;
    // build changed on disk → cycle into new release
    const disk = this.buildIdOnDisk();
    if (this.child && disk && this.buildId && disk !== this.buildId) {
      console.log(`[router] ${this.name}: new build ${disk} on disk (was ${this.buildId}); cycling`);
      this.buildId = disk; this.start(); return;
    }
    if (!this.child) { this.start(); return; }
    this.probe((ok) => {
      if (ok) { this.fails = 0; return; }
      this.fails += 1;
      console.error(`[router] ${this.name}: health fail ${this.fails}/3`);
      if (this.fails >= 3) { this.fails = 0; console.error(`[router] ${this.name}: unhealthy → restart`); this.start(); }
    });
  }
}

const tenants = { houle: new Tenant("houle", TENANTS.houle), ridger: new Tenant("ridger", TENANTS.ridger) };
tenants.houle.start(); tenants.ridger.start();
setInterval(() => { tenants.houle.supervise(); tenants.ridger.supervise(); }, 10000).unref();

const tenantFor = (req) => {
  const host = String(req.headers.host || "").trim().toLowerCase().split(":")[0];
  return RIDGER_HOSTS.has(host) ? tenants.ridger : tenants.houle;
};

const server = http.createServer((req, res) => {
  const t = tenantFor(req);
  const up = http.request(
    { host: "127.0.0.1", port: t.cfg.port, method: req.method, path: req.url,
      headers: { ...req.headers, "x-forwarded-proto": "https", "x-forwarded-host": req.headers.host || "", "x-forwarded-port": "443" } },
    (upRes) => { res.writeHead(upRes.statusCode || 502, upRes.headers); upRes.pipe(res); }
  );
  up.setTimeout(15000, () => up.destroy(new Error("upstream timeout")));
  up.on("error", () => { t.fails += 1; if (!res.headersSent) res.writeHead(502, { "Content-Type": "text/plain" }); res.end("Bad gateway"); });
  req.pipe(up);
});

server.on("upgrade", (req, socket, head) => {
  const t = tenantFor(req);
  const up = net.connect(t.cfg.port, "127.0.0.1", () => {
    const lines = [`${req.method} ${req.url} HTTP/1.1`];
    for (let i = 0; i < req.rawHeaders.length; i += 2) lines.push(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}`);
    up.write(lines.join("\r\n") + "\r\n\r\n"); if (head && head.length) up.write(head);
    socket.pipe(up); up.pipe(socket);
  });
  up.setTimeout(15000, () => up.destroy());
  up.on("error", () => socket.destroy());
  socket.on("error", () => up.destroy());
});

// forensic status log (1/min, capped 512KB)
const LOG = process.env.ROUTER_STATUS_LOG || path.join("/srv/customer/sites/houle.ai", "router-status.log");
const rd = (p) => { try { return fs.readFileSync(p, "utf8").trim(); } catch { return "?"; } };
const rss = (pid) => { try { const m = fs.readFileSync(`/proc/${pid}/status`, "utf8").match(/VmRSS:\s+(\d+)/); return m ? Math.round(+m[1] / 1024) : -1; } catch { return -1; } };
setInterval(() => {
  try { if (fs.statSync(LOG).size > 512 * 1024) fs.truncateSync(LOG, 0); } catch {}
  const line = [new Date().toISOString(),
    `houle=${tenants.houle.child ? rss(tenants.houle.child.pid) : "down"}:${tenants.houle.buildId}`,
    `ridger=${tenants.ridger.child ? rss(tenants.ridger.child.pid) : "down"}:${tenants.ridger.buildId}`,
    `cg=${rd("/sys/fs/cgroup/memory.current")}`].join(" ");
  fs.appendFile(LOG, line + "\n", () => {});
}, 60000).unref();

for (const s of ["SIGTERM", "SIGINT"]) process.on(s, () => { shuttingDown = true; for (const t of Object.values(tenants)) if (t.child) try { t.child.kill("SIGKILL"); } catch {} process.exit(0); });

server.keepAliveTimeout = 65000; server.headersTimeout = 66000;
server.listen(PUBLIC_PORT, "0.0.0.0", () => console.log(`[router] v5 :${PUBLIC_PORT} houle:${TENANTS.houle.port} ridger:${TENANTS.ridger.port}`));
