#!/usr/bin/env node
/**
 * IndexNow after a deploy: sends only the URLs that are new or whose <lastmod>
 * changed between the sitemap served before the deploy and the one served
 * after it. One POST to api.indexnow.org (key: src/data/indexnow.json, key
 * file public/<key>.txt). Exits 1 when IndexNow refuses (any 4xx/5xx).
 *
 * Usage:
 *   node scripts/indexnow-changed.js --snapshot before.xml   # before the deploy
 *   node scripts/indexnow-changed.js --before before.xml     # after the deploy
 *   add --dry-run to print the URLs without sending them
 */
const fs = require("fs");
const path = require("path");
const config = require(path.join(__dirname, "..", "src", "data", "indexnow.json"));

const SITEMAP = `https://${config.host}/sitemap.xml`;
const args = process.argv.slice(2);
const arg = (name) => {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : undefined;
};

/** loc -> lastmod ("" when absent) */
function parseSitemap(xml) {
  const map = new Map();
  for (const block of xml.match(/<url>[\s\S]*?<\/url>/g) || []) {
    const loc = (block.match(/<loc>([^<]+)<\/loc>/) || [])[1];
    if (!loc) continue;
    map.set(loc.trim(), ((block.match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1] || "").trim());
  }
  return map;
}

function changedUrls(beforeXml, afterXml) {
  const before = parseSitemap(beforeXml);
  const out = [];
  for (const [loc, lastmod] of parseSitemap(afterXml)) {
    if (!before.has(loc) || before.get(loc) !== lastmod) out.push(loc);
  }
  return out;
}

async function fetchSitemap() {
  const res = await fetch(`${SITEMAP}?d=${Date.now()}`, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`sitemap returned ${res.status}`);
  return res.text();
}

async function main() {
  const snapshot = arg("--snapshot");
  if (snapshot) {
    let xml = "";
    try {
      xml = await fetchSitemap();
    } catch (e) {
      console.warn(`[IndexNow] could not read the live sitemap (${e.message}); every URL will count as new`);
    }
    fs.writeFileSync(snapshot, xml);
    console.log(`[IndexNow] snapshot: ${parseSitemap(xml).size} URLs`);
    return;
  }
  const beforeFile = arg("--before");
  if (!beforeFile) throw new Error("--snapshot <file> or --before <file> required");
  const urls = changedUrls(fs.existsSync(beforeFile) ? fs.readFileSync(beforeFile, "utf8") : "", await fetchSitemap()).slice(0, 10000);
  if (!urls.length) {
    console.log("[IndexNow] no new or changed URL in the sitemap; nothing sent");
    return;
  }
  console.log(`[IndexNow] ${urls.length} new or changed URL(s):\n${urls.slice(0, 50).join("\n")}${urls.length > 50 ? "\n…" : ""}`);
  if (args.includes("--dry-run")) return;
  const res = await fetch(config.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: config.host, key: config.key, keyLocation: config.keyLocation, urlList: urls }),
    signal: AbortSignal.timeout(20000),
  });
  if (res.status === 200 || res.status === 202) {
    console.log(`[IndexNow] accepted (${res.status})`);
    return;
  }
  console.error(`[IndexNow] refused with status ${res.status}: ${(await res.text()).slice(0, 300)}`);
  process.exit(1);
}

if (require.main === module) {
  main().catch((e) => {
    console.error(`[IndexNow] ${e.message}`);
    process.exit(1);
  });
}

module.exports = { parseSitemap, changedUrls };
