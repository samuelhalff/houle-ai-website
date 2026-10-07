#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const MIN_WORDS = 700;
const file = path.join(process.cwd(), "src", "translations", "fr", "ressources.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const articles = Array.isArray(data.Articles) ? data.Articles : [];

const latest = articles
  .filter((article) => article.slug && article.date)
  .sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];

if (!latest) {
  console.error("No dated FR articles found.");
  process.exit(1);
}

const words = String(latest.content || "")
  .trim()
  .split(/\s+/)
  .filter(Boolean).length;

if (words < MIN_WORDS) {
  console.error(
    `Latest FR article "${latest.slug}" has ${words} words; expected at least ${MIN_WORDS}.`,
  );
  process.exit(1);
}

console.log(`Latest FR article "${latest.slug}" has ${words} words.`);

// Articles produced from the backlog (they carry topicId) must exist in every
// locale with the same metadata and sections, and keep their lead path.
if (latest.topicId) {
  const backlogLib = require("./lib/articleBacklog");
  const backlog = backlogLib.loadBacklog(process.cwd());
  const topic = backlog.topics.find((t) => t.id === latest.topicId);
  const category = backlog.categories.find((c) => c.id === latest.topicFamily);
  const service = (topic && topic.service) || (category && category.defaultService);
  const problems = [];
  if (!category) problems.push(`fr: unknown topicFamily "${latest.topicFamily}"`);
  for (const locale of backlogLib.LOCALES) {
    let article = latest;
    if (locale !== "fr") {
      const localeFile = path.join(process.cwd(), "src", "translations", locale, "ressources.json");
      const localeData = JSON.parse(fs.readFileSync(localeFile, "utf8"));
      article = (localeData.Articles || []).find((a) => a.slug === latest.slug);
      for (const issue of backlogLib.translationParityIssues(latest, article)) {
        problems.push(`${locale}: ${issue}`);
      }
    }
    if (article && service && !backlogLib.hasLeadPath(article.content, locale, service)) {
      problems.push(`${locale}: lead path missing (links to /${locale}${service}/ and /${locale}/contact/)`);
    }
  }
  if (problems.length) {
    console.error(`Latest article "${latest.slug}" failed parity checks:\n- ${problems.join("\n- ")}`);
    process.exit(1);
  }
  console.log(`Latest article "${latest.slug}": 5 locales in parity, lead path present (${latest.topicFamily}).`);
}
