const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { changedUrls } = require("./indexnow-changed");
const config = require("../src/data/indexnow.json");

const sm = (entries) =>
  `<urlset>${entries.map(([loc, lm]) => `<url><loc>${loc}</loc>${lm ? `<lastmod>${lm}</lastmod>` : ""}</url>`).join("")}</urlset>`;

test("only new URLs and URLs whose lastmod changed are sent", () => {
  const before = sm([["https://houle.ai/fr/", "2026-10-01"], ["https://houle.ai/en/", "2026-10-01"], ["https://houle.ai/fr/a/", "2026-09-01"]]);
  const after = sm([["https://houle.ai/fr/", "2026-10-01"], ["https://houle.ai/en/", "2026-11-02"], ["https://houle.ai/fr/b/", "2026-11-02"]]);
  assert.deepEqual(changedUrls(before, after), ["https://houle.ai/en/", "https://houle.ai/fr/b/"]);
});

test("an empty snapshot sends every URL", () => {
  assert.equal(changedUrls("", sm([["https://houle.ai/fr/", "2026-10-01"]])).length, 1);
});

test("the key file in public/ matches the configured key and location", () => {
  const file = path.join(__dirname, "..", "public", `${config.key}.txt`);
  assert.equal(fs.readFileSync(file, "utf8").trim(), config.key);
  assert.equal(config.keyLocation, `https://${config.host}/${config.key}.txt`);
  assert.match(config.endpoint, /^https:\/\/api\.indexnow\.org\//);
});
