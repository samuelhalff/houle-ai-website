const http = require("http");
const path = require("path");
const fs = require("fs");
const { parse } = require("url");
const compression = require("compression");
const next = require("next");

const projectRoot = __dirname;
const standaloneDir = path.join(projectRoot, ".next", "standalone");
const distDir = fs.existsSync(standaloneDir)
  ? standaloneDir
  : path.join(projectRoot, "dist");

if (!fs.existsSync(distDir)) {
  console.error(
    "Unable to locate Next standalone output. Did you run `npm run build`?"
  );
  process.exit(1);
}

process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.chdir(distDir);

const currentPort = parseInt(process.env.PORT, 10) || 3000;
const hostname = process.env.HOSTNAME || "0.0.0.0";

let keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT || "", 10);
const shouldAssignKeepAlive =
  Number.isFinite(keepAliveTimeout) && keepAliveTimeout >= 0;

let nextConfig = require(path.join(projectRoot, "next.config.js"));
if (typeof nextConfig === "function") {
  nextConfig = nextConfig("phase-production-server", { defaultConfig: {} });
}

process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig);

const app = next({
  dev: false,
  dir: distDir,
  conf: nextConfig,
});

const compressionFilter = compression.filter;
const compressibleContentType = /^(application|text|image\/svg\+xml|font)/i;
const compressor = compression({
  threshold: 512,
  filter: (req, res) => {
    const hasEncoding =
      typeof res.hasHeader === "function" && res.hasHeader("Content-Encoding");
    if (hasEncoding) return false;
    const contentType =
      typeof res.getHeader === "function"
        ? res.getHeader("Content-Type")
        : undefined;
    if (contentType && !compressibleContentType.test(String(contentType))) {
      return false;
    }
    return compressionFilter(req, res);
  },
});

// Host-based tenant routing: ridger.ch is an Infomaniak alias of this site
// (the hosting allows a single Node.js site), so its traffic lands here and
// is proxied to the Ridger app supervised on RIDGER_PORT by its own deploy
// pipeline. Remove once ridger.ch moves to a dedicated hosting.
const RIDGER_PORT = parseInt(process.env.RIDGER_PORT || "5001", 10);
const RIDGER_HOSTS = new Set(["ridger.ch", "www.ridger.ch"]);

const isRidgerRequest = (req) => {
  const rawHost = req.headers["x-forwarded-host"] || req.headers.host || "";
  const host = String(rawHost).split(",")[0].trim().toLowerCase().split(":")[0];
  return RIDGER_HOSTS.has(host);
};

const proxyToRidger = (req, res) => {
  const upstream = http.request(
    {
      host: "127.0.0.1",
      port: RIDGER_PORT,
      method: req.method,
      path: req.url,
      headers: req.headers,
    },
    (upRes) => {
      res.writeHead(upRes.statusCode || 502, upRes.headers);
      upRes.pipe(res);
    }
  );
  upstream.setTimeout(30000, () => upstream.destroy(new Error("upstream timeout")));
  upstream.on("error", () => {
    if (!res.headersSent) {
      res.writeHead(503, { "Content-Type": "text/plain" });
    }
    res.end("Service temporarily unavailable");
  });
  req.pipe(upstream);
};

app
  .prepare()
  .then(() => {
    const handle = app.getRequestHandler();

    const server = http.createServer((req, res) => {
      if (isRidgerRequest(req)) {
        proxyToRidger(req, res);
        return;
      }
      req.originalUrl = req.url;
      compressor(req, res, () => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      });
    });

    if (shouldAssignKeepAlive) {
      server.keepAliveTimeout = keepAliveTimeout;
    }

    server.listen(currentPort, hostname, () => {
      console.log(`Ready on http://${hostname}:${currentPort}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
