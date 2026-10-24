"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { validateRefreshedArticle, internalLinkProblems } = require("./validate-refreshed-article");

const TODAY = "2026-10-24";
const LOCALES = ["fr", "en", "de", "es", "pt"];
const ROUTES = {
  services: new Set(["ai-consulting"]),
  products: new Set(["outlook-addin"]),
  legal: new Set(["privacy"]),
  solutions: new Set(["invoice-processing"]),
  slugs: new Set(["a", "other-article"]),
};
const ENV = { SEO_MIN_WORDS: "100", SEO_MAX_WORDS: "300", REFERENCE_MIN_COUNT: "2" };
const REFS = [
  { labelKey: "x", url: "https://example.com/a" },
  { labelKey: "y", url: "https://example.org/b" },
];

function body(locale, word) {
  return `## Intro\n\n${Array(150).fill(`${word}${locale}`).join(" ")}\n\n[Service](/${locale}/services/ai-consulting/) [Contact](/${locale}/contact/) [Art](/${locale}/ressources/articles/other-article/)`;
}
function article(locale, over = {}) {
  return {
    slug: "a",
    date: "2025-01-01",
    updated: TODAY,
    category: "c",
    title: `Titre long ${locale} pour test`,
    description: `Description ${locale}`,
    content: body(locale, "mot"),
    tags: ["t"],
    references: REFS,
    ...over,
  };
}
function fixture(overs = {}) {
  const articlesByLocale = {};
  const baseByLocale = {};
  for (const l of LOCALES) {
    articlesByLocale[l] = [article(l, overs[l] || {})];
    baseByLocale[l] = [article(l, { updated: "2025-02-02" })];
  }
  return { articlesByLocale, baseByLocale };
}
const run = (overs, extra = {}) =>
  validateRefreshedArticle({
    slug: "a",
    today: TODAY,
    routes: ROUTES,
    env: ENV,
    resolveService: () => "/services/ai-consulting",
    ...fixture(overs),
    ...extra,
  });

test("valid refreshed article passes", () => {
  assert.deepEqual(run({}), []);
});

test("rejects too-short and too-long content", () => {
  assert.ok(run({ fr: { content: "## x\n\nshort [S](/fr/services/ai-consulting/) [C](/fr/contact/)" } }).some((p) => /fr: \d+ words \(min 100\)/.test(p)));
  assert.ok(run({ fr: { content: body("fr", "mot") + ` ${Array(400).fill("x").join(" ")}` } }).some((p) => /max 300/.test(p)));
});

test("rejects a missing / untranslated locale", () => {
  const fr = article("fr");
  assert.ok(run({ de: { content: fr.content, description: fr.description, title: fr.title } }).some((p) => /de: content identical to FR/.test(p)));
  const f = fixture();
  f.articlesByLocale.es = [];
  assert.ok(validateRefreshedArticle({ slug: "a", today: TODAY, routes: ROUTES, env: ENV, resolveService: () => "/services/ai-consulting", ...f }).includes("es: article missing"));
});

test("rejects bad, unlocalized or malformed internal links", () => {
  assert.ok(run({ en: { content: `${body("en", "word")} [x](/services/payroll)` } }).some((p) => /not localized/.test(p)));
  assert.ok(run({ en: { content: `${body("en", "word")} [x](/en/ressources/articles/ghost/)` } }).some((p) => /does not resolve/.test(p)));
  assert.ok(run({ en: { content: `${body("en", "word")} [x](/en/services/ai-consulting)` } }).some((p) => /trailing slash/.test(p)));
  assert.ok(internalLinkProblems("[x](/[team](/team))", "fr", ROUTES).some((p) => /malformed/.test(p)));
});

test("rejects changed date/slug/category and stale updated", () => {
  assert.ok(run({ pt: { date: "2026-10-01" } }).some((p) => /pt: date changed/.test(p)));
  assert.ok(run({ pt: { category: "zzz" } }).some((p) => /pt: category changed/.test(p)));
  assert.ok(run({ fr: { updated: "2026-09-01" } }).some((p) => /fr: updated is "2026-09-01"/.test(p)));
});

test("rejects missing tags, few or duplicate references, missing lead path", () => {
  assert.ok(run({ de: { tags: [] } }).some((p) => /de: tags missing/.test(p)));
  assert.ok(run({ fr: { references: [REFS[0]] } }).some((p) => /only 1 references/.test(p)));
  assert.ok(run({ fr: { references: [REFS[0], REFS[0]] } }).some((p) => /duplicate reference/.test(p)));
  assert.ok(run({ fr: { references: [REFS[0], { url: "http://insecure.com" }] } }).some((p) => /not https/.test(p)));
  assert.ok(run({ fr: { content: `## I\n\n${Array(150).fill("mot").join(" ")}` } }).some((p) => /lead path missing/.test(p)));
});
