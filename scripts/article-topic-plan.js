#!/usr/bin/env node
"use strict";
/**
 * Inspect the article backlog and the topic rotation. No network, no writes.
 *
 *   node scripts/article-topic-plan.js --check       validate the backlog (CI)
 *   node scripts/article-topic-plan.js --next 12     simulate the next 12 topics
 *   node scripts/article-topic-plan.js --diagnose    family distribution of published articles
 */

const fs = require("fs");
const path = require("path");
const backlogLib = require("./lib/articleBacklog");
const { RESOURCE_CATEGORIES } = require("./lib/article-taxonomy");

const ROOT = process.cwd();
const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const valueOf = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};

const backlog = backlogLib.loadBacklog(ROOT);
const articles = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src", "translations", "fr", "ressources.json"), "utf8"),
).Articles;
const history = backlogLib.buildHistory(articles);

function formatCounts(counts, total) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `  ${String(v).padStart(3)}  ${String(Math.round((v / total) * 100)).padStart(3)}%  ${k}`)
    .join("\n");
}

let exitCode = 0;

const errors = backlogLib.validateBacklog(backlog, {
  servicePaths: backlogLib.loadServicePaths(ROOT),
  siteCategories: new Set(RESOURCE_CATEGORIES.map((c) => c.id)),
});
if (errors.length) {
  console.error(`Backlog invalid:\n- ${errors.join("\n- ")}`);
  exitCode = 1;
} else if (has("--check")) {
  const used = new Set(history.map((h) => h.topicId).filter(Boolean));
  const remaining = backlog.topics.filter((t) => !used.has(t.id)).length;
  console.log(
    `Backlog ok: ${backlog.topics.length} topics, ${backlog.categories.length} categories, ${remaining} unused.`,
  );
  if (remaining < 15) {
    console.warn(`WARNING: only ${remaining} unused topics left; add topics to ${backlogLib.BACKLOG_PATH}.`);
  }
}

if (has("--diagnose")) {
  console.log(`\nPublished articles by family (all ${history.length}):`);
  console.log(formatCounts(backlogLib.countFamilies(history), history.length));
  const last = Math.min(20, history.length);
  console.log(`\nLast ${last}:`);
  console.log(formatCounts(backlogLib.countFamilies(history, last), last));
}

if (has("--next") && !errors.length) {
  const count = parseInt(valueOf("--next", "12"), 10) || 12;
  const sequence = backlogLib.simulateSequence({ backlog, articles, count });
  console.log(`\nNext ${sequence.length} topics:`);
  sequence.forEach((t, i) => {
    console.log(
      `${String(i + 1).padStart(2)}. [${t.category}] (${t.intent}) ${t.title}  ->  ${t.service}`,
    );
  });
  // Only an empty plan blocks a run; a short one is a warning, so the last topics still get published.
  if (sequence.length === 0) {
    console.error("No eligible topic: the backlog needs new entries.");
    exitCode = 1;
  } else if (sequence.length < Math.max(count, 6)) {
    console.warn(`Only ${sequence.length} eligible topics left: add entries to data/article-backlog.json.`);
  }
}

process.exit(exitCode);
