#!/usr/bin/env node
// Stage-1 duplicate consolidation: every removed source slug must be hidden from the
// article helpers and redirect (one hop, both slash forms, permanent, same locale) to a
// surviving article that exists in all locales. Survivors come from 90-day GSC clicks.
const { describe, it, before } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { loadTs } = require("./lib/loadTs");

const ROOT = path.resolve(__dirname, "..");
const LOCALES = ["fr", "en", "de", "es", "pt"];
const ARTICLE_PREFIX = "/:locale/ressources/articles/";
const mapping = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src/data/articles-consolidated.json"), "utf8"),
);
const toArk = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src/data/articles-redirected-to-ark.json"), "utf8"),
);

// Survivor per cluster (data-driven, see the commit message) and the runners-up that
// kept >= 20% of their cluster's clicks and therefore must NOT be redirected.
const SURVIVORS = {
  azure: "conducteurs-securite-azure-openai-securisation-reseau-contenu",
  quality: "evaluer-qualite-assistants-ia-tests-scoring-regression",
  powerAutomate: "automatisation-processus-rh-finance-conformite-power-automate",
  outlook: "outlook-add-in-automatiser-tri-securite-suivi-mails",
  roi: "comment-mesurer-roi-ia-kpi-pilotage",
  adoption: "adoption-ia-roi-gouvernance-risques-feuille-route",
  rag: "construire-solution-rag-entreprise",
};
const KEPT_RUNNERS_UP = [
  "utilisation-power-automate-automatisation-processus-rh-finance",
  "automatisation-processus-power-automate-rh-finance",
  "automatiser-tri-reponses-outlook-add-in",
];

const slugsFor = (locale) => {
  const data = JSON.parse(
    fs.readFileSync(path.join(ROOT, "src/translations", locale, "ressources.json"), "utf8"),
  );
  return new Set((data.Articles || []).map((a) => a.slug));
};

describe("consolidated articles", () => {
  let articles;
  let redirected;
  let rules = [];
  before(async () => {
    process.chdir(ROOT);
    articles = loadTs(path.join(ROOT, "src/lib/articles.ts"));
    redirected = loadTs(path.join(ROOT, "src/lib/redirectedArticles.ts"));
    rules = await require(path.join(ROOT, "next.config.js")).redirects();
  });

  it("is a non-empty slug -> slug map without self references", () => {
    assert.ok(Object.keys(mapping).length > 0);
    for (const [from, to] of Object.entries(mapping)) {
      assert.match(from, /^[\p{L}0-9-]+$/u);
      assert.match(to, /^[a-z0-9-]+$/);
      assert.notEqual(from, to);
    }
  });

  it("targets exist in every locale and are never sources (no chains)", () => {
    for (const locale of LOCALES) {
      const slugs = slugsFor(locale);
      for (const [from, to] of Object.entries(mapping)) {
        assert.ok(slugs.has(to), `${locale}: target ${to} (from ${from}) missing`);
        assert.equal(Object.prototype.hasOwnProperty.call(mapping, to), false, `${to} is also a source`);
      }
    }
  });

  it("does not overlap the ark-fid.ch redirects", () => {
    const arkSlugs = new Set(Object.keys(toArk).map((k) => k.split("/")[1]));
    for (const from of Object.keys(mapping)) assert.equal(arkSlugs.has(from), false, from);
    for (const to of Object.values(mapping)) assert.equal(arkSlugs.has(to), false, to);
  });

  it("uses the GSC-driven survivors and keeps the >=20% runners-up", () => {
    const targets = new Set(Object.values(mapping));
    for (const survivor of Object.values(SURVIVORS)) {
      assert.ok(targets.has(survivor), `${survivor} should be a survivor`);
      assert.equal(Object.prototype.hasOwnProperty.call(mapping, survivor), false);
    }
    for (const slug of KEPT_RUNNERS_UP) {
      assert.equal(Object.prototype.hasOwnProperty.call(mapping, slug), false, `${slug} must stay live`);
      assert.equal(redirected.isRedirectedSlug(slug), false);
    }
    // AI usage policy cluster (2026-10-28): single survivor, distinct-intent siblings stay live.
    const POLICY = "politique-usage-ia-clauses-gouvernance";
    assert.equal(mapping["rediger-politique-utilisation-ia-entreprise"], POLICY);
    assert.equal(Object.prototype.hasOwnProperty.call(mapping, POLICY), false);
    for (const slug of [
      "mise-a-jour-politique-ia-gouvernance-bonnes-pratiques",
      "elaborer-cadre-efficace-gouvernance-ia",
      "creer-charte-gouvernance-ia-entreprise",
    ]) {
      assert.equal(Object.prototype.hasOwnProperty.call(mapping, slug), false, `${slug} must stay live`);
    }
  });

  it("hides every source from listings and valid-locale helpers", async () => {
    for (const locale of LOCALES) {
      const list = new Set((await articles.getArticles(locale)).map((a) => a.slug));
      for (const from of Object.keys(mapping)) assert.ok(!list.has(from), `${locale}/${from} still listed`);
      for (const to of Object.values(mapping)) assert.ok(list.has(to), `${locale}/${to} not listed`);
      for (const slug of KEPT_RUNNERS_UP) assert.ok(list.has(slug), `${locale}/${slug} should stay listed`);
    }
    for (const from of Object.keys(mapping)) {
      assert.deepEqual(await articles.getValidLocalesForSlug(from), [], `${from} still has valid locales`);
      assert.equal(redirected.isRedirectedSlug(from), true);
    }
  });

  it("emits one permanent same-locale redirect per slash form, locale and source", () => {
    for (const locale of LOCALES) {
      for (const [from, to] of Object.entries(mapping)) {
        const source = encodeURI(`/${locale}/ressources/articles/${from}`);
        for (const form of [source, `${source}/`]) {
          const matches = rules.filter((r) => r.source === form);
          assert.equal(matches.length, 1, `exactly one rule for ${form}`);
          assert.equal(matches[0].permanent, true);
          assert.equal(matches[0].destination, `/${locale}/ressources/articles/${to}/`);
        }
      }
    }
    const consolidatedRules = rules.filter((r) =>
      Object.keys(mapping).some((from) => r.source.replace(/\/$/, "").endsWith(`/${encodeURI(from)}`)),
    );
    assert.equal(consolidatedRules.length, Object.keys(mapping).length * LOCALES.length * 2);
  });

  it("has no redirect rule whose destination is itself a redirect source (one hop)", () => {
    const sources = new Set(rules.map((r) => r.source));
    for (const r of rules) {
      if (!r.destination.startsWith("/")) continue;
      assert.equal(sources.has(r.destination), false, `${r.source} -> ${r.destination} chains`);
      assert.equal(sources.has(r.destination.replace(/\/$/, "")), false, `${r.source} chains`);
    }
  });

  it("leaves no article content or references linking to a removed slug", () => {
    for (const locale of LOCALES) {
      const raw = fs.readFileSync(
        path.join(ROOT, "src/translations", locale, "ressources.json"),
        "utf8",
      );
      const data = JSON.parse(raw);
      for (const article of data.Articles || []) {
        const text = JSON.stringify([article.content, article.references, article.description]);
        for (const from of Object.keys(mapping)) {
          const re = new RegExp(`ressources/articles/${from}(?![\\w-])`);
          assert.equal(re.test(text), false, `${locale}/${article.slug} links to ${from}`);
        }
      }
    }
  });

  it("is not referenced by static pages or data outside the translations", () => {
    const hits = [];
    for (const dir of ["app", "public", "data"]) {
      const stack = [path.join(ROOT, dir)];
      while (stack.length) {
        const cur = stack.pop();
        if (!fs.existsSync(cur)) continue;
        for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
          const full = path.join(cur, entry.name);
          if (entry.isDirectory()) stack.push(full);
          else if (/\.(tsx?|json|txt|xml|md)$/.test(entry.name)) {
            const text = fs.readFileSync(full, "utf8");
            for (const from of Object.keys(mapping)) {
              if (new RegExp(`(?<![\\w-])${from}(?![\\w-])`).test(text)) hits.push(`${full}: ${from}`);
            }
          }
        }
      }
    }
    assert.deepEqual(hits, []);
  });
});
