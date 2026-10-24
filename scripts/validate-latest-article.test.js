"use strict";
// Guard tests for scripts/validate-latest-article.js (title near-duplicates, updated >= date).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const SCRIPT = path.resolve(__dirname, "validate-latest-article.js");
const words = (n) => Array.from({ length: n }, () => "mot").join(" ");

function fixture(articles, { consolidated = {} } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "houle-validate-"));
  fs.mkdirSync(path.join(dir, "src", "data"), { recursive: true });
  fs.writeFileSync(path.join(dir, "src", "data", "articles-consolidated.json"), JSON.stringify(consolidated));
  fs.writeFileSync(path.join(dir, "src", "data", "articles-redirected-to-ark.json"), "{}");
  for (const l of ["fr", "en", "de", "es", "pt"]) {
    fs.mkdirSync(path.join(dir, "src", "translations", l), { recursive: true });
    fs.writeFileSync(path.join(dir, "src", "translations", l, "ressources.json"), JSON.stringify({ Articles: articles }));
  }
  return dir;
}

const run = (dir) => spawnSync(process.execPath, [SCRIPT], { cwd: dir, encoding: "utf8" });
const base = { category: "ai-strategy-adoption", author: "Houle Team", description: "d", content: words(800), references: [] };

test("passes when the latest title is distinct", () => {
  const dir = fixture([
    { ...base, slug: "a", date: "2026-01-01", title: "Évaluer la qualité d'un assistant IA par des tests" },
    { ...base, slug: "b", date: "2026-02-01", title: "Hébergement de modèles open source en Suisse" },
  ]);
  const res = run(dir);
  assert.equal(res.status, 0, res.stderr);
});

test("fails when the latest title paraphrases a live title (Jaccard >= 0.6)", () => {
  const dir = fixture([
    { ...base, slug: "a", date: "2026-01-01", title: "Évaluer la qualité d'un assistant IA : tests, scoring et régression" },
    { ...base, slug: "b", date: "2026-02-01", title: "Évaluer la qualité des assistants IA : tests, scoring, régression" },
  ]);
  const res = run(dir);
  assert.notEqual(res.status, 0);
  assert.match(res.stderr, /too close to live articles/);
});

test("ignores near-duplicates that are consolidated (not live)", () => {
  const dir = fixture(
    [
      { ...base, slug: "a", date: "2026-01-01", title: "Évaluer la qualité d'un assistant IA : tests, scoring et régression" },
      { ...base, slug: "b", date: "2026-02-01", title: "Évaluer la qualité des assistants IA : tests, scoring, régression" },
    ],
    { consolidated: { a: "b" } },
  );
  assert.equal(run(dir).status, 0);
});

test("fails when updated is before date", () => {
  const dir = fixture([
    { ...base, slug: "a", date: "2026-03-01", updated: "2026-02-01", title: "Hébergement de modèles open source en Suisse" },
  ]);
  const res = run(dir);
  assert.notEqual(res.status, 0);
  assert.match(res.stderr, /before date/);
});
