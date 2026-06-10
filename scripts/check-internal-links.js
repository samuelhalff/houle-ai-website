#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOTS = ["app", "src/components"];
const EXTENSIONS = new Set([".tsx"]);
const LOCALE_PREFIX = /^\/(?:fr|en|de|es|pt)(?:\/|$)/;
const FILE_PATH = /\.[a-zA-Z0-9]+(?:[?#].*)?$/;

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function lineAndColumn(source, index) {
  const before = source.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

const violations = [];
const hrefPattern = /\bhref=(["'])(\/[^"'{}]*)\1/g;

for (const file of ROOTS.flatMap((root) => walk(path.join(process.cwd(), root)))) {
  const source = fs.readFileSync(file, "utf8");
  let match;
  while ((match = hrefPattern.exec(source))) {
    const href = match[2];
    if (
      href.startsWith("//") ||
      href.startsWith("/#") ||
      href.startsWith("/api/") ||
      href.startsWith("/_next/") ||
      href.startsWith("/assets/") ||
      FILE_PATH.test(href)
    ) {
      continue;
    }

    const hasLocale = LOCALE_PREFIX.test(href);
    const hasTrailingSlash = href.endsWith("/");
    if (!hasLocale || !hasTrailingSlash) {
      const loc = lineAndColumn(source, match.index);
      violations.push(
        `${path.relative(process.cwd(), file)}:${loc.line}:${loc.column} href="${href}" ${
          !hasLocale ? "missing locale prefix" : "missing trailing slash"
        }`,
      );
    }
  }
}

if (violations.length) {
  console.error(`Internal link lint found ${violations.length} violation(s):`);
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("Internal link lint: 0 violations");
