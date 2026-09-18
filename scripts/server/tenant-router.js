// Production entrypoint (shipped as dist/server.js by prepare-artifact.sh).
//
// v4 — self-rolling multi-tenant router. The Infomaniak hosting allows one
// Node.js site; houle.ai is primary and ridger.ch/www.ridger.ch are aliases.
// The router owns the public port and, for each tenant, supervises the app
// AND performs zero-downtime rolling swaps by watching current/.next/BUILD_ID:
// new child on the alternate port -> health-check -> switch -> retire old.
// Deploys are pure file drops; nothing external ever restarts a process
// (external kill-churn tripped Infomaniak's watchdog on 2026-09-18).
"use strict";

const fs = require("fs");
const http = require("http");
const net = require("net");
const path = require("path");
const { spawn } = require("child_process");

const intEnv = (name, fallback) => {
  const parsed = parseInt(process.env[name] || "", 10);
  return Number.isInteger(parsed) ? parsed : fallback;
};
const PUBLIC_PORT = intEnv("PORT", 3000);
const RIDGER_HOSTS = new Set(["ridger.ch", "www.ridger.ch"]);
// Cap child heaps: the container allowance is ~1GB and swaps briefly run
// three apps side by side.
const CHILD_NODE_OPTIONS = "--max-old-space-size=320";

const TENANTS = {
  houle: {
    dir: __dirname, // this release; swaps read the live symlink below
    currentDir: "/srv/customer/sites/houle.ai/current",
    entry: "server-app.js",
    ports: [intEnv("APP_PORT", 5010), intEnv("APP_PORT_ALT", 5011)],
  },
  ridger: {
    currentDir: process.env.RIDGER_DIR || "/srv/customer/sites/ridger.ch/current",
    entry: "server.js",
    ports: [intEnv("RIDGER_PORT", 5001), intEnv("RIDGER_PORT_ALT", 5002)],
  },
};
for (const t of Object.values(TENANTS)) {
  if (t.ports.includes(PUBLIC_PORT)) {
    console.error(`[router] port collision with public ${PUBLIC_PORT}`);
    process.exit(1);
  }
}

let shuttingDown = false;

class Tenant {
  constructor(name, cfg) {
    this.name = name;
    this.cfg = cfg;
    this.activePort = cfg.ports[0];
    this.child = null;
    this.buildId = null;
    this.swapping = false;
    this.exits = [];
  }
  readBuildId() {
    try {
      return fs.readFileSync(path.join(this.cfg.currentDir, ".next", "BUILD_ID"), "utf8").trim();
    } catch { return null; }
  }
  spawn(port) {
    const cwd = this.cfg.currentDir;
    const entry = path.join(cwd, this.name === "houle" ? "server-app.js" : "server.js");
    if (!fs.existsSync(entry)) {
      console.error(`[router] ${this.name}: entry missing (${entry}); retry in 30s`);
      return null;
    }
    const child = spawn(process.execPath, [entry], {
      cwd,
      env: {
        ...process.env,
        PORT: String(port),
        HOSTNAME: "127.0.0.1",
        NODE_OPTIONS: CHILD_NODE_OPTIONS,
      },
      stdio: "inherit",
    });
    return child;
  }
  attach(child, port) {
    this.child = child;
    this.activePort = port;
    child.on("exit", (code, signal) => {
      if (shuttingDown || this.child !== child) return; // retired old child
      const now = Date.now();
      this.exits = this.exits.filter((t) => now - t < 60000);
      this.exits.push(now);
      const delay = this.exits.length > 5 ? 15000 : 1000;
      console.error(`[router] ${this.name} exited (code=${code} sig=${signal}); respawn in ${delay}ms`);
      setTimeout(() => this.boot(), delay);
    });
  }
  boot() {
    if (shuttingDown) return;
    const child = this.spawn(this.activePort);
    if (!child) { setTimeout(() => this.boot(), 30000); return; }
    this.buildId = this.readBuildId();
    this.attach(child, this.activePort);
    console.log(`[router] ${this.name} booted on :${this.activePort} (build ${this.buildId})`);
  }
  healthy(port, cb) {
    const req = http.get({ host: "127.0.0.1", port, path: "/api/health/?d=router-swap", timeout: 4000 }, (res) => {
      res.resume();
      cb(res.statusCode === 200);
    });
    req.on("error", () => cb(false));
    req.on("timeout", () => { req.destroy(); cb(false); });
  }
  trySwap() {
    if (this.swapping || shuttingDown) return;
    const onDisk = this.readBuildId();
    if (!onDisk || onDisk === this.buildId) return;
    this.swapping = true;
    const nextPort = this.cfg.ports.find((p) => p !== this.activePort);
    console.log(`[router] ${this.name}: new build ${onDisk} detected; rolling to :${nextPort}`);
    const fresh = this.spawn(nextPort);
    if (!fresh) { this.swapping = false; return; }
    let checks = 0;
    const poll = () => {
      if (shuttingDown) return;
      checks += 1;
      this.healthy(nextPort, (ok) => {
        if (ok) {
          const old = this.child;
          this.attach(fresh, nextPort);
          this.buildId = onDisk;
          this.swapping = false;
          console.log(`[router] ${this.name}: swapped to :${nextPort} (build ${onDisk})`);
          if (old) setTimeout(() => { try { old.kill("SIGTERM"); } catch {} }, 5000);
        } else if (checks < 30) {
          setTimeout(poll, 3000);
        } else {
          console.error(`[router] ${this.name}: new build never got healthy; keeping old child`);
          try { fresh.kill("SIGTERM"); } catch {}
          this.swapping = false;
        }
      });
    };
    setTimeout(poll, 3000);
  }
}

const tenants = {
  houle: new Tenant("houle", TENANTS.houle),
  ridger: new Tenant("ridger", TENANTS.ridger),
};
tenants.houle.boot();
tenants.ridger.boot();
setInterval(() => {
  tenants.houle.trySwap();
  tenants.ridger.trySwap();
}, 20000).unref();

const targetPortFor = (req) => {
  const host = String(req.headers.host || "").trim().toLowerCase().split(":")[0];
  return RIDGER_HOSTS.has(host) ? tenants.ridger.activePort : tenants.houle.activePort;
};

const server = http.createServer((req, res) => {
  const upstream = http.request(
    {
      host: "127.0.0.1",
      port: targetPortFor(req),
      method: req.method,
      path: req.url,
      headers: {
        ...req.headers,
        "x-forwarded-proto": "https",
        "x-forwarded-host": req.headers.host || "",
        "x-forwarded-port": "443",
      },
    },
    (upRes) => {
      res.writeHead(upRes.statusCode || 502, upRes.headers);
      upRes.pipe(res);
    }
  );
  upstream.setTimeout(120000, () => upstream.destroy(new Error("upstream timeout")));
  upstream.on("error", () => {
    if (!res.headersSent) res.writeHead(503, { "Content-Type": "text/plain" });
    res.end("Service temporarily unavailable");
  });
  req.pipe(upstream);
});

server.on("upgrade", (req, socket, head) => {
  const upstream = net.connect(targetPortFor(req), "127.0.0.1", () => {
    const headerLines = [`${req.method} ${req.url} HTTP/1.1`];
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      headerLines.push(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}`);
    }
    upstream.write(headerLines.join("\r\n") + "\r\n\r\n");
    if (head && head.length) upstream.write(head);
    socket.pipe(upstream);
    upstream.pipe(socket);
  });
  upstream.on("error", () => socket.destroy());
  socket.on("error", () => upstream.destroy());
});

// forensic status log (1 line/min, capped)
const STATUS_LOG = process.env.ROUTER_STATUS_LOG || path.join(__dirname, "..", "router-status.log");
const readNum = (p) => { try { return fs.readFileSync(p, "utf8").trim(); } catch { return "?"; } };
const rssOf = (pid) => {
  try {
    const m = fs.readFileSync(`/proc/${pid}/status`, "utf8").match(/VmRSS:\s+(\d+) kB/);
    return m ? Math.round(parseInt(m[1], 10) / 1024) : -1;
  } catch { return -1; }
};
setInterval(() => {
  try {
    const st = fs.statSync(STATUS_LOG);
    if (st.size > 512 * 1024) fs.truncateSync(STATUS_LOG, 0);
  } catch {}
  const line = [
    new Date().toISOString(),
    `router=${rssOf(process.pid)}MB`,
    `houle=${tenants.houle.child ? rssOf(tenants.houle.child.pid) : "down"}MB:${tenants.houle.activePort}:${tenants.houle.buildId}`,
    `ridger=${tenants.ridger.child ? rssOf(tenants.ridger.child.pid) : "down"}MB:${tenants.ridger.activePort}:${tenants.ridger.buildId}`,
    `cgroup=${readNum("/sys/fs/cgroup/memory.current")}/${readNum("/sys/fs/cgroup/memory.max")}`,
    `load=${readNum("/proc/loadavg").split(" ").slice(0, 1)}`,
  ].join(" ");
  fs.appendFile(STATUS_LOG, line + "\n", () => {});
}, 60000).unref();

for (const sig of ["SIGTERM", "SIGINT"]) {
  process.on(sig, () => {
    shuttingDown = true;
    for (const t of Object.values(tenants)) { if (t.child) try { t.child.kill(sig); } catch {} }
    process.exit(0);
  });
}

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
server.listen(PUBLIC_PORT, "0.0.0.0", () => {
  console.log(`[router] v4 public :${PUBLIC_PORT} houle:${tenants.houle.activePort} ridger:${tenants.ridger.activePort}`);
});
