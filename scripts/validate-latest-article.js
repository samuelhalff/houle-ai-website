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
