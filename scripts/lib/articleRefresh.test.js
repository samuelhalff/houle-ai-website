"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const {
  buildEditorialRules,
  buildRefreshPrompt,
  markUpdated,
  mergeRefreshedArticle,
  refreshArticles,
  validateArticleMetadata,
} = require("./articleRefresh");
const {
  buildSystemPrompt,
  buildDraftPromptFromResearch,
  buildDraftRepairPromptFromExistingArticle,
  buildDraftAppendPromptFromExistingArticle,
  buildRetryPrompt,
  buildResearchPrompt,
  editorialRules,
} = require("../ai-ressources-update");

const REPO = path.resolve(__dirname, "..", "..");

const BANNED = [
  /10\+\s*sections/i,
  /\b6 questions\b/i,
  /FAQ de 6/i,
  /2 tableaux/i,
  /2 checklists/i,
  /(ajoute|inclure|obligatoire)[^.\n]*(anecdote|étude de cas|cas pratique)/i,
  /cas pratique chiffré/i,
  /scénario illustratif chiffré/i,
  /chiffres réalistes/i,
  /1 à 2 anecdotes/i,
  /exemples? (concrets )?chiffrés/i,
  /Structure obligatoire/i,
];

function assertClean(prompt, label) {
  for (const re of BANNED) assert.doesNotMatch(prompt, re, `${label} matches ${re}`);
}

test("no prompt path demands template sections or invented cases", () => {
  const frJson = { Articles: [{ slug: "x", title: "X", date: "2026-01-01", content: "a" }] };
  assertClean(buildSystemPrompt(frJson), "system");
  assertClean(buildResearchPrompt(frJson, null, null), "research");
  assertClean(
    buildDraftPromptFromResearch({ slug: "s", title: "t", description: "d", outline: [] }, []),
    "draft",
  );
  const art = { slug: "s", title: "t", description: "d", content: "mot ".repeat(50), references: [] };
  assertClean(buildDraftRepairPromptFromExistingArticle(art, { mode: "expand", minWords: 1200, maxWords: 2500 }), "repair");
  assertClean(buildDraftAppendPromptFromExistingArticle(art, { minWords: 1200 }), "append");
  for (const code of ["TOO_SHORT", "TOO_LONG"]) {
    assertClean(buildRetryPrompt("base", { code, words: 10, minWords: 1200, maxWords: 2500 }, frJson), `retry ${code}`);
  }
  assertClean(buildRefreshPrompt(art, { today: "2026-10-24", servicePath: "/services/ai-consulting" }), "refresh");
});

test("research prompt does not steer outlines toward a FAQ nor a 1500-word floor", () => {
  const prompt = buildResearchPrompt({ Articles: [] }, null, null);
  assert.doesNotMatch(prompt, /"FAQ \.\.\."/);
  assert.match(prompt, /1200 à 2500 mots/);
});

test("word range defaults to 1200-2500 in the draft prompt", () => {
  const prev = { min: process.env.SEO_MIN_WORDS, max: process.env.SEO_MAX_WORDS };
  delete process.env.SEO_MIN_WORDS;
  delete process.env.SEO_MAX_WORDS;
  try {
    const prompt = buildDraftPromptFromResearch({ slug: "s", title: "t", description: "d", outline: [] }, []);
    assert.match(prompt, /entre 1200 et 2500 mots/);
  } finally {
    if (prev.min !== undefined) process.env.SEO_MIN_WORDS = prev.min;
    if (prev.max !== undefined) process.env.SEO_MAX_WORDS = prev.max;
  }
});

test("editorial rules forbid invention and describe the practitioner paragraph", () => {
  const rules = buildEditorialRules({ servicePath: "/services/ai-consulting" }).join("\n");
  assert.match(rules, /AUCUNE INVENTION/);
  assert.match(rules, /Exemple fictif/);
  assert.match(rules, /au plus 3 questions/);
  assert.match(rules, /Comment houle intervient/);
  assert.match(rules, /sans résultat promis/);
  assert.match(rules, /\/services\/ai-consulting/);
  assert.match(editorialRules().join("\n"), /AUCUNE INVENTION/);
});

test("markUpdated sets updated and never touches date", () => {
  const a = { slug: "a", date: "2026-01-01" };
  markUpdated(a, "2026-10-24");
  assert.equal(a.updated, "2026-10-24");
  assert.equal(a.date, "2026-01-01");
});

test("mergeRefreshedArticle only takes generated fields and keeps the rest", () => {
  const existing = {
    slug: "a", date: "2026-01-01", category: "ai-strategy-adoption", image: "i.png", author: "Houle Team",
    topicId: "t-1", topicFamily: "cost-roi", seoTitle: "keep", custom: { k: 1 },
    title: "old", description: "d", content: "c", tags: ["a", "b", "c"], references: [{ labelKey: "L", url: "https://admin.ch" }],
  };
  const merged = mergeRefreshedArticle(existing, {
    slug: "HACK", date: "2000-01-01", category: "x", image: "no.png", topicId: "evil", seoTitle: "evil",
    title: "new", content: "new content", tags: ["z"],
  });
  assert.equal(merged.title, "new");
  assert.equal(merged.content, "new content");
  assert.equal(merged.description, "d");
  assert.deepEqual(merged.tags, ["a", "b", "c"]);
  assert.deepEqual(merged.references, existing.references);
  for (const k of ["slug", "date", "category", "image", "author", "topicId", "topicFamily", "seoTitle", "custom"]) {
    assert.deepEqual(merged[k], existing[k], k);
  }
});

// ---- transactional refresh -------------------------------------------------
const LOCALES = ["en", "de", "es", "pt"];
const words = (n, w = "mot") => Array.from({ length: n }, () => w).join(" ");

function makeFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "houle-refresh-"));
  const fr = { Articles: [
    { slug: "one", date: "2026-01-01", category: "ai-strategy-adoption", image: "one.png", author: "Houle Team",
      topicId: "topic-one", topicFamily: "cost-roi", extra: 42, title: "Un 2025", description: "d1", content: words(800),
      tags: ["a", "b", "c"], references: [{ labelKey: "Ref", url: "https://www.admin.ch/x" }] },
    { slug: "two", date: "2026-02-01", category: "ai-strategy-adoption", author: "Houle Team", title: "Deux", description: "d2", content: words(800), tags: ["a", "b", "c"], references: [] },
  ] };
  fs.mkdirSync(path.join(dir, "fr"));
  fs.writeFileSync(path.join(dir, "fr", "ressources.json"), JSON.stringify(fr, null, 2));
  for (const l of LOCALES) {
    fs.mkdirSync(path.join(dir, l));
    const articles = fr.Articles.map((a) => ({ ...a, tags: [`tag-${l}`], title: `${l} ${a.title}`, content: `${l} ${a.content}`, legacyLocalField: l }));
    fs.writeFileSync(path.join(dir, l, "ressources.json"), JSON.stringify({ Articles: articles, Other: { k: "v" } }, null, 2));
  }
  return dir;
}

function snapshot(dir) {
  const out = {};
  for (const l of ["fr", ...LOCALES]) out[l] = fs.readFileSync(path.join(dir, l, "ressources.json"), "utf8");
  return out;
}

function makeDeps({ failTranslateOn } = {}) {
  return {
    research: async () => [{ labelKey: "Ref2", url: "https://www.fedlex.admin.ch/y" }],
    draft: async (prompt, art) => {
      assert.match(prompt, /Tu mets à jour un article existant/);
      return { article: { title: `${art.title} MAJ 2026`, description: "nd", content: words(900, "neuf"), tags: ["x", "y", "z"] }, changeSummary: [`maj ${art.slug}`] };
    },
    postProcess: async () => {},
    translate: async (article) => {
      if (failTranslateOn === article.slug) throw new Error("boom");
      const out = {};
      for (const l of LOCALES) out[l] = { Article: { title: `${l} ${article.title}`, description: `${l} d`, content: `${l} ${article.content}` }, labels: { Ref2: `${l} Ref2` } };
      return out;
    },
  };
}

const run = (dir, overrides = {}) =>
  refreshArticles({ slugs: ["one"], today: "2026-10-24", translationsDir: dir, apply: true, deps: makeDeps(), log: () => {}, ...overrides });

test("refresh --apply merges generated fields, preserves the rest, mirrors metadata", async () => {
  const dir = makeFixture();
  const results = await run(dir, { servicePaths: { one: "/services/ai-consulting" } });
  assert.equal(results[0].wordsAfter, 900);
  const fr = JSON.parse(fs.readFileSync(path.join(dir, "fr", "ressources.json"), "utf8"));
  const one = fr.Articles[0];
  assert.equal(one.title, "Un 2025 MAJ 2026");
  assert.equal(one.updated, "2026-10-24");
  assert.equal(one.date, "2026-01-01");
  for (const [k, v] of Object.entries({ category: "ai-strategy-adoption", image: "one.png", author: "Houle Team", topicId: "topic-one", topicFamily: "cost-roi", extra: 42 })) {
    assert.equal(one[k], v, k);
  }
  assert.deepEqual(one.tags, ["a", "b", "c"]); // model-supplied tags ignored
  assert.deepEqual(one.references, [{ labelKey: "Ref2", url: "https://www.fedlex.admin.ch/y" }]);
  assert.equal(fr.Articles[1].title, "Deux"); // untouched
  for (const l of LOCALES) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, l, "ressources.json"), "utf8"));
    assert.deepEqual(data.Other, { k: "v" });
    assert.equal(data["Ref2"], `${l} Ref2`); // label merged at the locale root
    const a = data.Articles[0];
    assert.equal(a.title, `${l} Un 2025 MAJ 2026`);
    assert.equal(a.updated, "2026-10-24");
    assert.equal(a.image, "one.png");
    assert.equal(a.topicId, "topic-one");
    assert.deepEqual(a.tags, [`tag-${l}`]); // localized tags preserved
    assert.equal(a.legacyLocalField, l); // unknown local field preserved
    assert.equal(a.references[0].labelKey, `${l} Ref2`);
    assert.equal(data.Articles[1].title, `${l} Deux`);
  }
  assert.deepEqual(fs.readdirSync(path.join(dir, "fr")), ["ressources.json"]); // no temp leftovers
});

test("refresh without --apply (dry run) writes nothing", async () => {
  const dir = makeFixture();
  const before = snapshot(dir);
  await run(dir, { apply: false });
  assert.deepEqual(snapshot(dir), before);
});

test("any failure (second slug translation) writes nothing at all", async () => {
  const dir = makeFixture();
  const before = snapshot(dir);
  await assert.rejects(run(dir, { slugs: ["one", "two"], deps: makeDeps({ failTranslateOn: "two" }) }), /boom/);
  assert.deepEqual(snapshot(dir), before);
});

test("incomplete or untranslated locale payload aborts without writing", async () => {
  for (const mutate of [
    (t) => { delete t.pt; },
    (t, art) => { t.de.Article.content = art.content; },
    (t) => { t.es.Article.title = ""; },
  ]) {
    const dir = makeFixture();
    const before = snapshot(dir);
    const deps = makeDeps();
    const base = deps.translate;
    deps.translate = async (art, labels) => { const t = await base(art, labels); mutate(t, art); return t; };
    await assert.rejects(run(dir, { deps }));
    assert.deepEqual(snapshot(dir), before);
  }
});

test("a failing locale hook or final validation aborts without writing", async () => {
  for (const hook of ["localize", "validateFinal", "postProcess"]) {
    const dir = makeFixture();
    const before = snapshot(dir);
    const deps = makeDeps();
    deps[hook] = async () => { throw new Error(`${hook} failed`); };
    await assert.rejects(run(dir, { deps }), new RegExp(`${hook} failed`));
    assert.deepEqual(snapshot(dir), before);
  }
});

test("too-short refreshed article aborts without writing; slug/category changes are refused", async () => {
  const dir = makeFixture();
  const before = snapshot(dir);
  const short = makeDeps();
  short.draft = async () => ({ article: { content: words(50) }, changeSummary: [] });
  await assert.rejects(run(dir, { deps: short }), /too short/);
  const recat = makeDeps();
  recat.postProcess = async (article) => { article.category = "other"; };
  await assert.rejects(run(dir, { deps: recat }), /category changed/);
  assert.deepEqual(snapshot(dir), before);
});

test("unknown or redirected slugs fail before any model call", async () => {
  const dir = makeFixture();
  const deps = makeDeps();
  let called = false;
  deps.research = async () => { called = true; return []; };
  await assert.rejects(run(dir, { slugs: ["nope"], deps }), /not found/);
  await assert.rejects(run(dir, { slugs: ["one"], deps, blockedSlugs: new Set(["one"]) }), /redirected/);
  assert.equal(called, false);
});

// ---- metadata validator ----------------------------------------------------
test("validateArticleMetadata enforces updated format and updated >= date", () => {
  assert.deepEqual(validateArticleMetadata([{ slug: "ok", date: "2026-01-01" }]), []);
  assert.deepEqual(validateArticleMetadata([{ slug: "ok", date: "2026-01-01", updated: "2026-01-01" }]), []);
  assert.deepEqual(validateArticleMetadata([{ slug: "ok", date: "2026-01-01", updated: "2026-02-01" }]), []);
  assert.equal(validateArticleMetadata([{ slug: "x", date: "2026-03-01", updated: "2026-02-01" }]).length, 1);
  assert.equal(validateArticleMetadata([{ slug: "x", date: "2026-03-01", updated: "24/10/2026" }]).length, 1);
});

// ---- end-to-end: the real CLI refresh mode with mocked model output ---------
function cliFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "houle-cli-"));
  fs.mkdirSync(path.join(dir, "data"), { recursive: true });
  fs.copyFileSync(path.join(REPO, "data", "article-backlog.json"), path.join(dir, "data", "article-backlog.json"));
  const slug = "comment-mesurer-roi-ia-kpi-pilotage";
  const body = (prefix) => `## Section A\n\n${words(450, `${prefix}a`)}\n\n## Section B\n\n${words(450, `${prefix}b`)}\n`;
  const fr = { Articles: [{
    slug, date: "2026-04-19", category: "ai-strategy-adoption", author: "Houle Team", image: "x.png",
    title: "Mesurer le ROI de l'IA en entreprise", description: "d", content: `${body("fr")}\n---\n### Références\n- [Ref](https://www.admin.ch/x)\n`,
    tags: ["roi"], references: [{ labelKey: "Ref", url: "https://www.admin.ch/x" }], seoTitle: "keep-me",
  }] };
  const translations = {};
  for (const l of ["fr", ...LOCALES]) {
    const d = path.join(dir, "src", "translations", l);
    fs.mkdirSync(d, { recursive: true });
    const data = l === "fr" ? fr : { Articles: [{ ...fr.Articles[0], title: `${l} titre`, content: `${l} ${body(l)}`, tags: [`tag-${l}`] }], Marker: l };
    fs.writeFileSync(path.join(d, "ressources.json"), JSON.stringify(data, null, 2) + "\n");
  }
  const refreshedBody = (prefix) => `## Cadrer les indicateurs\n\n${words(500, `${prefix}x`)}\n\n## Comment houle intervient\n\nhoule cadre les indicateurs avec vous et met en place le suivi.\n\n## Piloter dans la durée\n\n${words(300, `${prefix}y`)}\n`;
  const mock = {
    refresh: {
      references: [{ labelKey: "NIST AI RMF", url: "https://www.nist.gov/itl/ai-risk-management-framework" }],
      draft: { article: { title: "Mesurer le ROI de l'IA en entreprise en 2026", description: "nouvelle description", content: refreshedBody("fr") }, changeSummary: ["maj 2026"] },
      translations: Object.fromEntries(LOCALES.map((l) => [l, {
        Article: { title: `${l} Mesurer le ROI de l'IA 2026`, description: `${l} description`, content: refreshedBody(l) },
        labels: { "NIST AI RMF": `${l} NIST AI RMF` },
      }])),
    },
  };
  const mockPath = path.join(dir, "mock.json");
  fs.writeFileSync(mockPath, JSON.stringify(mock));
  return { dir, slug, mockPath };
}

function runCli(dir, args) {
  return spawnSync(process.execPath, [path.join(REPO, "scripts", "ai-ressources-update.js"), ...args], {
    cwd: dir,
    encoding: "utf8",
    env: { ...process.env, AZURE_OPENAI_API_KEY: "", AZURE_AGENT_API_KEY: "", AZURE_OPENAI_ENDPOINT: "", AZURE_AGENT_ENDPOINT: "" },
  });
}

test("CLI --refresh dry-run writes nothing; --apply updates all five locales atomically", () => {
  const { dir, slug, mockPath } = cliFixture();
  const before = snapshot(path.join(dir, "src", "translations"));
  const dry = runCli(dir, [`--refresh=${slug}`, `--mock=${mockPath}`]);
  assert.equal(dry.status, 0, dry.stderr + dry.stdout);
  assert.match(dry.stdout, /dry-run: nothing written/);
  assert.deepEqual(snapshot(path.join(dir, "src", "translations")), before);

  const applied = runCli(dir, [`--refresh=${slug}`, "--apply", `--mock=${mockPath}`]);
  assert.equal(applied.status, 0, applied.stderr + applied.stdout);
  const today = new Date().toISOString().slice(0, 10);
  for (const l of ["fr", ...LOCALES]) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, "src", "translations", l, "ressources.json"), "utf8"));
    const a = data.Articles[0];
    assert.equal(a.updated, today, l);
    assert.equal(a.date, "2026-04-19", l);
    assert.equal(a.slug, slug);
    assert.equal(a.image, "x.png");
    assert.ok(a.content.includes(`](/${l}/contact/)`), `${l} lead path`);
    assert.ok(a.content.includes(`](/${l}/services/ai-consulting/)`), `${l} service link`);
    assert.ok(a.content.includes("Comment houle intervient"), l);
    const refsAt = a.content.indexOf("### Références");
    if (refsAt >= 0) assert.ok(a.content.indexOf(`](/${l}/contact/)`) < refsAt, `${l} CTA before references`);
    if (l === "fr") {
      assert.equal(a.seoTitle, "keep-me");
      assert.deepEqual(a.tags, ["roi"]);
    } else {
      assert.equal(data.Marker, l);
      assert.deepEqual(a.tags, [`tag-${l}`]);
    }
  }
});

test("CLI --refresh refuses consolidated sources and leaves files untouched", () => {
  const { dir, mockPath } = cliFixture();
  const before = snapshot(path.join(dir, "src", "translations"));
  const res = runCli(dir, ["--refresh=power-automate-automatisez-rh-finance", "--apply", `--mock=${mockPath}`]);
  assert.notEqual(res.status, 0);
  assert.match(res.stderr + res.stdout, /redirected|not found/);
  assert.deepEqual(snapshot(path.join(dir, "src", "translations")), before);
});
