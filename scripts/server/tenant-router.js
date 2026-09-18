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

const http = require("http");
const net = require("net");
const path = require("path");
const { spawn } = require("child_process");

const PUBLIC_PORT = parseInt(process.env.PORT, 10) || 5000;
const APP_PORT = parseInt(process.env.APP_PORT, 10) || 5010;
const parsedRidgerPort = parseInt(process.env.RIDGER_PORT || "5001", 10);
const RIDGER_PORT = Number.isInteger(parsedRidgerPort) ? parsedRidgerPort : 5001;
const RIDGER_HOSTS = new Set(["ridger.ch", "www.ridger.ch"]);

// ── spawn the real Next server on the internal port ──
const appEntry = path.join(__dirname, "server-app.js");
const child = spawn(process.execPath, [appEntry], {
  env: { ...process.env, PORT: String(APP_PORT), HOSTNAME: "127.0.0.1" },
  stdio: "inherit",
});
child.on("exit", (code, signal) => {
  // The supervisor loop restarts the whole entrypoint; die with the child so
  // we never serve a half-dead tenant pair.
  console.error(`[router] app child exited (code=${code} signal=${signal})`);
  process.exit(code === null ? 1 : code);
});
for (const sig of ["SIGTERM", "SIGINT"]) {
  process.on(sig, () => {
    child.kill(sig);
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
      headers: req.headers,
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
server.listen(PUBLIC_PORT, "0.0.0.0", () => {
  console.log(
    `[router] public :${PUBLIC_PORT} → app :${APP_PORT}, ridger :${RIDGER_PORT}`
  );
});
