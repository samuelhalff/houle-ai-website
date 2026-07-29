#!/usr/bin/env node
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const productPages = [
  "app/[locale]/products/ai-agents/page.tsx",
  "app/[locale]/products/outlook-addin/page.tsx",
  "app/[locale]/products/swiss-gpt/page.tsx",
  "app/[locale]/products/word-addin/page.tsx",
];

describe("product structured data", () => {
  it("does not emit incomplete Product rich-result markup", () => {
    for (const relativePath of productPages) {
      const source = fs.readFileSync(path.join(ROOT, relativePath), "utf8");
      assert.doesNotMatch(
        source,
        /buildProductSchema\(/,
        `${relativePath} emits Product markup without verified offer data`,
      );
    }
  });
});
