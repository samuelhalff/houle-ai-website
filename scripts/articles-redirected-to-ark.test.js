#!/usr/bin/env node
// Regression test: houle.ai no longer carries ark-fid.ch article copies.
// Every mapped "<locale>/<slug>" must be excluded from the article helpers
// (sitemap, listings, feed, static params all go through them) and must have
// permanent redirects for both slash forms.
const { describe, it, before } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const ROOT = path.resolve(__dirname, "..");
const LOCALES = ["fr", "en", "de", "es", "pt"];
const mapping = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src/data/articles-redirected-to-ark.json"), "utf8"),
);

// Minimal TS loader so the real src/lib helpers run unmodified.
const loaded = new Map();
function loadTs(file) {
  if (loaded.has(file)) return loaded.get(file).exports;
  const out = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const mod = { exports: {} };
  loaded.set(file, mod);
  const localRequire = (spec) => {
    if (spec.startsWith(".")) {
      const base = path.resolve(path.dirname(file), spec);
      if (fs.existsSync(base + ".ts")) return loadTs(base + ".ts");
      return require(base);
    }
    if (spec === "react") return { cache: (fn) => fn }; // server-only memoisation
    return require(spec);
  };
  new Function("exports", "require", "module", "__filename", "__dirname", out)(
    mod.exports, localRequire, mod, file, path.dirname(file),
  );
  return mod.exports;
}

const slugs = [...new Set(Object.keys(mapping).map((k) => k.split("/")[1]))];

describe("articles redirected to ark-fid.ch", () => {
  let articles;
  let redirects;
  before(async () => {
    process.chdir(ROOT);
    articles = loadTs(path.join(ROOT, "src/lib/articles.ts"));
    redirects = await require(path.join(ROOT, "next.config.js")).redirects();
  });

  it("maps to absolute same-locale ark-fid.ch urls", () => {
    assert.ok(Object.keys(mapping).length > 0);
    for (const [key, dest] of Object.entries(mapping)) {
      const [locale] = key.split("/");
      assert.ok(LOCALES.includes(locale), key);
      assert.ok(dest.startsWith(`https://ark-fid.ch/${locale}/`), `${key} -> ${dest}`);
    }
  });

  it("excludes every mapped article from listings and sitemap helpers", async () => {
    for (const locale of LOCALES) {
      const list = new Set((await articles.getArticles(locale)).map((a) => a.slug));
      for (const key of Object.keys(mapping)) {
        const [l, slug] = key.split("/");
        if (l === locale) assert.ok(!list.has(slug), `${key} still listed`);
      }
    }
    for (const slug of slugs) {
      assert.deepEqual(await articles.getValidLocalesForSlug(slug), [], `${slug} still has valid locales`);
    }
  });

  it("keeps houle's own articles", async () => {
    const fr = await articles.getArticles("fr");
    assert.ok(fr.some((a) => a.slug === "houle-ai"));
  });

  it("emits permanent redirects for both slash forms", () => {
    for (const [key, dest] of Object.entries(mapping)) {
      const [locale, slug] = key.split("/");
      const source = `/${locale}/ressources/articles/${slug}`;
      for (const s of [source, `${source}/`]) {
        const r = redirects.find((x) => x.source === s);
        assert.ok(r, `missing redirect for ${s}`);
        assert.equal(r.destination, dest);
        assert.equal(r.permanent, true);
      }
    }
  });

  it("builds the sitemap and feed from the filtered helpers", () => {
    for (const file of ["app/sitemap.xml/route.ts", "app/[locale]/feed.xml/route.ts"]) {
      const src = fs.readFileSync(path.join(ROOT, file), "utf8");
      assert.match(src, /getArticles\(/, file);
      assert.doesNotMatch(src, /ressources\.json/, file);
    }
  });
});
