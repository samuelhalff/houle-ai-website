#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const {
  applyArticleTaxonomy,
  detectCategory,
  buildTags,
} = require("./lib/article-taxonomy");

const LOCALES = ["fr", "en", "de", "es", "pt"];
const APPLY = process.argv.includes("--apply");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function localePath(locale) {
  return path.join(process.cwd(), "src", "translations", locale, "ressources.json");
}

const frPath = localePath("fr");
const frData = readJson(frPath);
const frArticles = Array.isArray(frData.Articles) ? frData.Articles : [];
const taxonomyBySlug = new Map();

for (const article of frArticles) {
  const category = detectCategory(article);
  const tags = buildTags(article, category);
  taxonomyBySlug.set(article.slug, { category, tags });
}

let changedFiles = 0;

for (const locale of LOCALES) {
  const file = localePath(locale);
  if (!fs.existsSync(file)) continue;
  const data = locale === "fr" ? frData : readJson(file);
  const articles = Array.isArray(data.Articles) ? data.Articles : [];
  let changed = false;

  for (const article of articles) {
    const taxonomy = taxonomyBySlug.get(article.slug);
    if (!taxonomy) continue;
    const currentTags = Array.isArray(article.tags) ? article.tags : [];
    if (
      article.category !== taxonomy.category ||
      JSON.stringify(currentTags) !== JSON.stringify(taxonomy.tags)
    ) {
      article.category = taxonomy.category;
      article.tags = taxonomy.tags;
      changed = true;
    }
  }

  if (changed) {
    changedFiles += 1;
    if (APPLY) writeJson(file, data);
    console.log(`${APPLY ? "updated" : "would update"} ${file}`);
  }
}

console.log(
  `${APPLY ? "Applied" : "Dry run"} taxonomy to ${taxonomyBySlug.size} FR articles across ${changedFiles} locale files.`,
);
