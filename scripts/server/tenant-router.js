// Production entrypoint (shipped as dist/server.js by prepare-artifact.sh).
//
// v6 — self-healing multi-tenant router. One supervised child per tenant, no
// rolling swaps (they were the bug source). Incorporates the Fable 5.1 review:
// boot grace period so health checks never kill a still-booting child; error /
// uncaughtException handlers that SIGKILL children before the router exits (so
// the shell loop's fresh router never hits EADDRINUSE on orphans); kill() that
// actually frees the port from stale holders; single restart/retry timers to
// stop kill-respawn churn; write-after-end guards.
//
// The Infomaniak front proxies ONLY to PUBLIC_PORT (3000); this process must
// own it and dispatch by Host header. A deploy is a file drop; the supervisor
// notices BUILD_ID changed and cycles the child into the new release.
"use strict";

const fs = require("fs");
const http = require("http");
const net = require("net");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const intEnv = (n, d) => { const v = parseInt(process.env[n] || "", 10); return Number.isInteger(v) ? v : d; };
const PUBLIC_PORT = intEnv("PORT", 3000);
const RIDGER_HOSTS = new Set(["ridger.ch", "www.ridger.ch"]);
const CHILD_NODE_OPTIONS = "--max-old-space-size=384";
const BOOT_GRACE_MS = 40000;

const TENANTS = {
  houle:  { dir: "/srv/customer/sites/houle.ai/current",  entry: "server-app.js", port: intEnv("APP_PORT", 5010),   health: "/api/health/" },
  ridger: { dir: "/srv/customer/sites/ridger.ch/current", entry: "server.js",     port: intEnv("RIDGER_PORT", 5001), health: "/api/health/" },
};
for (const t of Object.values(TENANTS)) {
  if (t.port === PUBLIC_PORT) { console.error(`[router] tenant port == public ${PUBLIC_PORT}`); process.exit(1); }
}

let shuttingDown = false;
const allTenants = () => Object.values(tenants);

class Tenant {
  constructor(name, cfg) {
    this.name = name; this.cfg = cfg;
    this.child = null; this.buildId = null; this.startedAt = 0;
    this.starting = false; this.fails = 0; this.exits = [];
    this.restartTimer = null;
  }
  buildIdOnDisk() {
    try { return fs.readFileSync(path.join(this.cfg.dir, ".next", "BUILD_ID"), "utf8").trim(); } catch { return null; }
  }
  portBusy() {
    // synchronous-ish TCP check; returns true if something accepts on the port
    const r = spawnSync("bash", ["-c", `exec 3<>/dev/tcp/127.0.0.1/${this.cfg.port}`], { timeout: 2000 });
    return r.status === 0;
  }
  freePort() {
    // kill our own child and any stale holder of the entry, then wait for the port
    if (this.child) { try { this.child.kill("SIGKILL"); } catch {} this.child = null; }
    { const r = spawnSync("pkill", ["-KILL", "-f", path.join(this.cfg.dir, this.cfg.entry)], { timeout: 3000 }); if (r.error) console.error(`[router] ${this.name}: pkill ${r.error.message}`); }
    const deadline = Date.now() + 5000;
    while (this.portBusy() && Date.now() < deadline) { spawnSync("sleep", ["0.25"]); }
  }
  clearTimer() { if (this.restartTimer) { clearTimeout(this.restartTimer); this.restartTimer = null; } }
  scheduleStart(delay) { this.clearTimer(); this.restartTimer = setTimeout(() => this.start(), delay); }
  start() {
    if (shuttingDown || this.starting) { return; }
    this.clearTimer();
    const entry = path.join(this.cfg.dir, this.cfg.entry);
    if (!fs.existsSync(entry)) { console.error(`[router] ${this.name}: ${entry} missing; retry 30s`); this.scheduleStart(30000); return; }
    this.starting = true;
    try { this.freePort(); } catch (e) { console.error(`[router] ${this.name}: freePort ${e && e.message}`); }
    let child;
    try {
      child = spawn(process.execPath, [entry], {
        cwd: this.cfg.dir,
        env: { ...process.env, PORT: String(this.cfg.port), HOSTNAME: "127.0.0.1", NODE_OPTIONS: CHILD_NODE_OPTIONS },
        stdio: "inherit",
      });
    } catch (e) {
      console.error(`[router] ${this.name}: spawn threw ${e && e.message}`);
      this.starting = false; this.scheduleStart(2000); return;
    }
    this.child = child; this.startedAt = Date.now(); this.fails = 0;
    this.buildId = this.buildIdOnDisk();
    let settled = false;
    const onGone = (why) => {
      if (settled) return; settled = true;
      if (shuttingDown || this.child !== child) return;
      this.child = null;
      const now = Date.now(); this.exits = this.exits.filter(t => now - t < 60000); this.exits.push(now);
      const delay = this.exits.length > 5 ? 15000 : 1000;
      console.error(`[router] ${this.name} gone (${why}); restart in ${delay}ms`);
      this.scheduleStart(delay);
    };
    child.on("exit", (code, sig) => onGone(`exit code=${code} sig=${sig}`));
    child.on("error", (e) => onGone(`error ${e && e.message}`));
    console.log(`[router] ${this.name} started pid=${child.pid} :${this.cfg.port} build=${this.buildId}`);
    this.starting = false;
  }
  probe(cb) {
    let done = false; const finish = (v) => { if (!done) { done = true; cb(v); } };
    const req = http.get({ host: "127.0.0.1", port: this.cfg.port, path: this.cfg.health + "?d=router", timeout: 4000 }, (res) => {
      res.resume(); finish((res.statusCode || 0) < 500); // <500 = alive (redirects/404 count as up)
    });
    req.on("error", () => finish(false));
    req.on("timeout", () => { req.destroy(); finish(false); });
  }
  supervise() {
    if (shuttingDown || this.starting) return;
    const disk = this.buildIdOnDisk();
    if (this.child && disk && this.buildId && disk !== this.buildId) {
      console.log(`[router] ${this.name}: new build ${disk} (was ${this.buildId}); cycling`);
      this.start(); return;
    }
    if (!this.child) { if (!this.restartTimer) this.start(); return; }
    if (Date.now() - this.startedAt < BOOT_GRACE_MS) return; // don't probe a booting child
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
setInterval(() => allTenants().forEach(t => t.supervise()), 10000).unref();

const tenantFor = (req) => {
  const host = String(req.headers.host || "").trim().toLowerCase().split(":")[0];
  return RIDGER_HOSTS.has(host) ? tenants.ridger : tenants.houle;
};

const server = http.createServer((req, res) => {
  req.on("error", () => {});
  res.on("error", () => {});
  const t = tenantFor(req);
  const up = http.request(
    { host: "127.0.0.1", port: t.cfg.port, method: req.method, path: req.url,
      headers: { ...req.headers, "x-forwarded-proto": "https", "x-forwarded-host": req.headers.host || "", "x-forwarded-port": "443" } },
    (upRes) => { if (!res.writableEnded) { res.writeHead(upRes.statusCode || 502, upRes.headers); upRes.pipe(res); } }
  );
  up.setTimeout(15000, () => up.destroy(new Error("upstream timeout")));
  up.on("error", () => { if (res.headersSent) { if (!res.writableEnded) res.destroy(); return; } if (!res.writableEnded) { res.writeHead(502, { "Content-Type": "text/plain" }); res.end("Bad gateway"); } });
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

// forensic status log
const LOG = process.env.ROUTER_STATUS_LOG || "/srv/customer/sites/houle.ai/router-status.log";
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

const shutdown = (code = 0) => { if (shuttingDown) return; shuttingDown = true; allTenants().forEach(t => { if (t.child) try { t.child.kill("SIGKILL"); } catch {} }); process.exit(code); };
for (const s of ["SIGTERM", "SIGINT"]) process.on(s, shutdown);
process.on("uncaughtException", (e) => { console.error("[router] uncaughtException", e && e.stack || e); shutdown(1); });
process.on("unhandledRejection", (e) => { console.error("[router] unhandledRejection", e); shutdown(1); });

server.keepAliveTimeout = 65000; server.headersTimeout = 66000;
server.listen(PUBLIC_PORT, "0.0.0.0", () => console.log(`[router] v6 :${PUBLIC_PORT} houle:${TENANTS.houle.port} ridger:${TENANTS.ridger.port}`));
