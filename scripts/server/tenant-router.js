// Production entrypoint (shipped as dist/server.js by prepare-artifact.sh).
//
// The Infomaniak hosting allows a single Node.js site; ridger.ch and
// www.ridger.ch are aliases of this one. This launcher owns the public port,
// spawns the real Next standalone server (renamed server-app.js) on an
// internal port, and routes each request by Host header:
//   ridger hosts -> 127.0.0.1:RIDGER_PORT (deployed/supervised by the
//                   ridger.ch pipeline, /srv/customer/sites/ridger.ch)
//   anything else -> the local houle app.
// No external dependencies. Remove once ridger.ch has its own hosting.
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
const PUBLIC_PORT = intEnv("PORT", 5000);
const APP_PORT = intEnv("APP_PORT", 5010);
const RIDGER_PORT = intEnv("RIDGER_PORT", 5001);
if (APP_PORT === PUBLIC_PORT || RIDGER_PORT === PUBLIC_PORT) {
  console.error(
    `[router] port collision (public=${PUBLIC_PORT} app=${APP_PORT} ridger=${RIDGER_PORT})`
  );
  process.exit(1);
}
const RIDGER_HOSTS = new Set(["ridger.ch", "www.ridger.ch"]);

// ── spawn the real Next server on the internal port, respawn on exit ──
// The router must stay alive even if the app child dies: exiting with the
// child makes the whole site flap, which trips Infomaniak's process watchdog
// into "maintenance" mode (observed 2026-09-18). Respawn with backoff instead.
const appEntry = path.join(__dirname, "server-app.js");
let child = null;
let shuttingDown = false;
let recentExits = [];
const spawnApp = () => {
  child = spawn(process.execPath, [appEntry], {
    env: { ...process.env, PORT: String(APP_PORT), HOSTNAME: "127.0.0.1" },
    stdio: "inherit",
  });
  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    const now = Date.now();
    recentExits = recentExits.filter((t) => now - t < 60000);
    recentExits.push(now);
    // Crash-looping child (>5 exits/min): back off hard but keep the router
    // alive so the other tenant and the maintenance-free front survive.
    const delay = recentExits.length > 5 ? 15000 : 1000;
    console.error(
      `[router] app child exited (code=${code} signal=${signal}); respawn in ${delay}ms`
    );
    setTimeout(spawnApp, delay);
  });
};
spawnApp();

// ── supervise the Ridger tenant too ──
// The router is the only process the Infomaniak panel resurrects; if it does
// not own the Ridger app, a panel restart leaves ridger.ch dead until a
// pipeline ssh restart gets through the host's session throttle. Owning it
// also makes ridger deploys self-contained: the app exits via its /api/kill
// endpoint and is respawned here from the updated current/ symlink.
const RIDGER_DIR = process.env.RIDGER_DIR || "/srv/customer/sites/ridger.ch/current";
let ridgerChild = null;
let ridgerExits = [];
const spawnRidger = () => {
  const entry = path.join(RIDGER_DIR, "server.js");
  if (!fs.existsSync(entry)) {
    console.error(`[router] ridger entry missing (${entry}); retry in 30s`);
    setTimeout(spawnRidger, 30000);
    return;
  }
  ridgerChild = spawn(process.execPath, ["server.js"], {
    cwd: RIDGER_DIR,
    env: { ...process.env, PORT: String(RIDGER_PORT), HOSTNAME: "127.0.0.1" },
    stdio: "inherit",
  });
  ridgerChild.on("exit", (code, signal) => {
    if (shuttingDown) return;
    const now = Date.now();
    ridgerExits = ridgerExits.filter((t) => now - t < 60000);
    ridgerExits.push(now);
    const delay = ridgerExits.length > 5 ? 15000 : 1000;
    console.error(
      `[router] ridger child exited (code=${code} signal=${signal}); respawn in ${delay}ms`
    );
    setTimeout(spawnRidger, delay);
  });
};
spawnRidger();

for (const sig of ["SIGTERM", "SIGINT"]) {
  process.on(sig, () => {
    shuttingDown = true;
    if (child) child.kill(sig);
    if (ridgerChild) ridgerChild.kill(sig);
    process.exit(0);
  });
}

const targetPortFor = (req) => {
  // Host only — x-forwarded-host is client-spoofable and must not cross the
  // tenant boundary. The edge sets Host to the requested domain.
  const host = String(req.headers.host || "")
    .trim()
    .toLowerCase()
    .split(":")[0];
  return RIDGER_HOSTS.has(host) ? RIDGER_PORT : APP_PORT;
};

const server = http.createServer((req, res) => {
  const upstream = http.request(
    {
      host: "127.0.0.1",
      port: targetPortFor(req),
      method: req.method,
      path: req.url,
      // TLS terminates at the Infomaniak front; assert the public scheme so
      // apps never leak internal ports into redirects/canonical URLs.
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
    if (!res.headersSent) {
      res.writeHead(503, { "Content-Type": "text/plain" });
    }
    res.end("Service temporarily unavailable");
  });
  req.pipe(upstream);
});

// WebSocket/upgrade passthrough (agent chat and Next HMR-style connections).
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

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
server.listen(PUBLIC_PORT, "0.0.0.0", () => {
  console.log(
    `[router] public :${PUBLIC_PORT} → app :${APP_PORT}, ridger :${RIDGER_PORT}`
  );
});
