#!/usr/bin/env node
"use strict";
// Blocking validator for ONE refreshed article across the 5 locales.
// Usage: node scripts/validate-refreshed-article.js --slug=<slug> [--base=HEAD] [--today=YYYY-MM-DD]
// Env: SEO_MIN_WORDS, SEO_MAX_WORDS, REFERENCE_MIN_COUNT.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const { validateArticleMetadata, countWords } = require("./lib/articleRefresh");
const backlog = require("./lib/articleBacklog");
const topicScope = require("./lib/topicScope");

const LOCALES = ["fr", "en", "de", "es", "pt"];
// Translations are never longer-winded than FR by much but are routinely 10-20% shorter.
// Owner decision: translations (en/de/es/pt) only need 80% of SEO_MIN_WORDS (translated text is
// shorter than the French source); FR enforces the full minimum and every locale the maximum.
const TRANSLATION_MIN_RATIO = 0.8;

function envInt(env, name, fallback) {
  const n = parseInt(env[name] || "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function loadArticles(root, locale) {
  const file = path.join(root, "src", "translations", locale, "ressources.json");
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")).Articles || [];
}

function gitBaseArticles(root, base, locale) {
  try {
    const out = execFileSync("git", ["show", `${base}:src/translations/${locale}/ressources.json`], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
    return JSON.parse(out).Articles || [];
  } catch {
    return null;
  }
}

function listDirs(dir) {
  try {
    return new Set(
      fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name),
    );
  } catch {
    return new Set();
  }
}

/** Existing internal routes (second-level segments) derived from the app router + data. */
function loadRoutes(root, frArticles) {
  const base = path.join(root, "app", "[locale]");
  let solutions = new Set();
  try {
    solutions = new Set(Object.keys(JSON.parse(fs.readFileSync(path.join(root, "src", "translations", "fr", "solutions.json"), "utf8"))));
  } catch {
    // no solutions file
  }
  return {
    services: listDirs(path.join(base, "services")),
    products: listDirs(path.join(base, "products")),
    legal: listDirs(path.join(base, "legal")),
    solutions,
    slugs: new Set(frArticles.map((a) => a.slug)),
  };
}

function internalLinkProblems(content, locale, routes) {
  const problems = [];
  const re = /\]\(\s*(\/[^)\s]*|\[[^)]*)\)/g;
  let m;
  while ((m = re.exec(String(content || "")))) {
    const raw = m[1];
    if (raw.startsWith("[") || /[\[\]()]/.test(raw)) {
      problems.push(`malformed internal link "${raw}"`);
      continue;
    }
    if (raw.startsWith("//")) continue;
    const target = raw.split(/[?#]/)[0];
    if (/\.[a-zA-Z0-9]+$/.test(target)) continue; // static file
    const parts = target.split("/").filter(Boolean);
    if (parts[0] !== locale) {
      problems.push(`link "${raw}" is not localized to /${locale}/`);
      continue;
    }
    if (!target.endsWith("/")) {
      problems.push(`link "${raw}" lacks trailing slash`);
      continue;
    }
    const [, section, leaf, extra, more] = parts;
    let ok = false;
    if (!section) ok = true;
    else if (section === "ressources" && leaf === "articles") ok = Boolean(extra) && !more && routes.slugs.has(extra);
    else if (extra) ok = false;
    else if (section === "contact" || section === "ressources") ok = !leaf;
    else if (section === "services") ok = !leaf || routes.services.has(leaf);
    else if (section === "products") ok = !leaf || routes.products.has(leaf);
    else if (section === "solutions") ok = !leaf || routes.solutions.has(leaf);
    else if (section === "legal") ok = !leaf || routes.legal.has(leaf);
    if (!ok) problems.push(`link "${raw}" does not resolve to an existing route`);
  }
  return problems;
}

function referenceProblems(article, minCount) {
  const problems = [];
  const refs = Array.isArray(article.references) ? article.references : [];
  if (refs.length < minCount) problems.push(`only ${refs.length} references (min ${minCount})`);
  const seen = new Set();
  for (const ref of refs) {
    const url = ref && ref.url;
    let parsed;
    try {
      parsed = new URL(String(url));
    } catch {
      problems.push(`invalid reference URL "${url}"`);
      continue;
    }
    if (parsed.protocol !== "https:") problems.push(`reference URL is not https: ${url}`);
    const key = parsed.href.replace(/\/$/, "");
    if (seen.has(key)) problems.push(`duplicate reference URL ${url}`);
    seen.add(key);
  }
  return problems;
}

/**
 * Pure validation. Returns an array of problem strings (empty = OK).
 * Inputs are injectable so tests need no filesystem/git.
 */
function validateRefreshedArticle({
  slug,
  today,
  articlesByLocale, // { fr: [...], en: [...], ... }
  baseByLocale = {}, // same shape, article state before the refresh (may be missing)
  routes,
  env = process.env,
  resolveService,
  redirectedKeys = new Set(),
}) {
  const problems = [];
  const add = (locale, msg) => problems.push(`${locale}: ${msg}`);
  const minWords = envInt(env, "SEO_MIN_WORDS", 700);
  const maxWords = envInt(env, "SEO_MAX_WORDS", Infinity);
  const minRefs = envInt(env, "REFERENCE_MIN_COUNT", 3);

  const find = (locale) => (articlesByLocale[locale] || []).find((a) => a.slug === slug);
  const fr = find("fr");
  if (!fr) return [`fr: article ${slug} not found`];

  const service = resolveService ? resolveService(fr) : null;
  const scope = topicScope.articleScopeProblems(fr, { redirectedKeys });
  for (const p of scope) add("fr", `out of scope: ${p}`);

  for (const locale of LOCALES) {
    const a = find(locale);
    if (!a) {
      add(locale, "article missing");
      continue;
    }
    for (const key of ["title", "description", "content"]) {
      if (!String(a[key] || "").trim()) add(locale, `${key} is empty`);
    }
    if (!Array.isArray(a.tags) || !a.tags.length) add(locale, "tags missing");

    const words = countWords(a.content);
    const floor = locale === "fr" ? minWords : Math.floor(minWords * TRANSLATION_MIN_RATIO);
    if (words < floor) add(locale, `${words} words (min ${floor})`);
    if (words > maxWords) add(locale, `${words} words (max ${maxWords})`);

    for (const p of referenceProblems(a, minRefs)) add(locale, p);
    for (const p of internalLinkProblems(a.content, locale, routes)) add(locale, p);

    if (String(a.updated || "") !== today) add(locale, `updated is "${a.updated || ""}", expected ${today}`);

    const base = (baseByLocale[locale] || []).find((b) => b.slug === slug);
    if (base) {
      for (const key of ["slug", "date", "category"]) {
        if ((base[key] || "") !== (a[key] || "")) add(locale, `${key} changed ("${base[key]}" -> "${a[key]}")`);
      }
    }

    if (locale !== "fr") {
      const same = (k) => String(a[k] || "").trim().toLowerCase() === String(fr[k] || "").trim().toLowerCase();
      if (same("content")) add(locale, "content identical to FR (not translated)");
      if (same("description")) add(locale, "description identical to FR (not translated)");
      if (same("title") && String(fr.title || "").trim().split(/\s+/).length > 3) {
        add(locale, "title identical to FR (not translated)");
      }
      for (const issue of backlog.translationParityIssues(fr, a)) add(locale, `parity: ${issue}`);
    }

    if (service && !backlog.hasLeadPath(a.content, locale, service)) {
      add(locale, `lead path missing (links to /${locale}${service}/ and /${locale}/contact/)`);
    }
  }

  for (const locale of LOCALES) {
    const list = articlesByLocale[locale] || [];
    const a = list.find((x) => x.slug === slug);
    if (a) for (const p of validateArticleMetadata([a])) add(locale, p);
  }
  return problems;
}

function parseArgs(argv) {
  const get = (name) => (argv.find((a) => a.startsWith(`--${name}=`)) || "").slice(name.length + 3);
  return { slug: get("slug"), base: get("base") || "HEAD", today: get("today") || new Date().toISOString().slice(0, 10) };
}

function main() {
  const { slug, base, today } = parseArgs(process.argv.slice(2));
  if (!slug) {
    console.error("Usage: validate-refreshed-article.js --slug=<slug> [--base=HEAD]");
    process.exit(2);
  }
  const root = process.cwd();
  const articlesByLocale = {};
  const baseByLocale = {};
  for (const locale of LOCALES) {
    articlesByLocale[locale] = loadArticles(root, locale) || [];
    const b = gitBaseArticles(root, base, locale);
    if (b) baseByLocale[locale] = b;
  }
  const problems = validateRefreshedArticle({
    slug,
    today,
    articlesByLocale,
    baseByLocale,
    routes: loadRoutes(root, articlesByLocale.fr),
    resolveService: (article) => require("./ai-ressources-update").resolveRefreshService(article),
    redirectedKeys: topicScope.loadRedirectedKeys(root),
  });
  if (problems.length) {
    console.error(`Refreshed article "${slug}" failed validation:\n- ${problems.join("\n- ")}`);
    process.exit(1);
  }
  console.log(`Refreshed article "${slug}": 5 locales OK.`);
}

if (require.main === module) main();

module.exports = { validateRefreshedArticle, internalLinkProblems, referenceProblems, loadRoutes, LOCALES };
