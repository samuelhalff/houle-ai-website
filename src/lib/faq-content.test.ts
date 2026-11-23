/**
 * FAQ blocks (visible section + FAQPage JSON-LD, src/components/seo/PageFaq.tsx):
 * every product, service and contact page and every indexable article has
 * one in each locale, with clean text, and the JSON-LD carries exactly the
 * visible strings.
 */
import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import { buildFAQPage } from "./structuredData.ts";

const ROOT = process.cwd();
const LOCALES = ["fr", "en", "de", "es", "pt"] as const;
const PAGE_NS = ["ai-agents", "word-addin", "outlook-addin", "swiss-gpt", "ai-consulting", "microsoft-consulting", "contact"];

type QA = { question: string; answer: string };
const readJson = (p: string) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const redirected = readJson("src/data/articles-redirected-to-ark.json") as Record<string, unknown>;
const consolidated = readJson("src/data/articles-consolidated.json") as Record<string, unknown>;

function textProblems(s: string, locale: string): string[] {
  const out: string[] = [];
  if (/[—–]/.test(s)) out.push("em/en dash");
  if (/[*_`#\[\]]/.test(s)) out.push("markdown");
  if (locale === "fr" && /[^\s  ][?!;:](\s|$)/.test(s.replace(/https?:\/\/\S+/g, ""))) out.push("missing narrow space before ? ! ; :");
  if (locale === "fr" && / [?!;:]/.test(s)) out.push("plain space before ? ! ; :");
  return out;
}

function check(where: string, items: QA[], locale: string, min: number, max: number) {
  assert.ok(items.length >= min && items.length <= max, `${where}: ${items.length} questions (expected ${min}-${max})`);
  for (const { question, answer } of items) {
    assert.ok(question.trim() && answer.trim(), `${where}: empty question or answer`);
    const problems = [...textProblems(question, locale), ...textProblems(answer, locale)];
    assert.deepEqual(problems, [], `${where}: "${question}" -> ${problems.join(", ")}`);
  }
  // JSON-LD = visible text, with the required properties.
  const ld = buildFAQPage(items);
  assert.equal(ld["@type"], "FAQPage");
  assert.equal(ld.mainEntity.length, items.length);
  ld.mainEntity.forEach((q, i) => {
    assert.equal(q.name, items[i].question);
    assert.equal(q.acceptedAnswer.text, items[i].answer);
    assert.equal(q.acceptedAnswer["@type"], "Answer");
  });
  JSON.parse(JSON.stringify(ld));
}

test("product, service and contact pages carry a FAQ in every locale", () => {
  for (const locale of LOCALES) {
    for (const ns of PAGE_NS) {
      const faq = readJson(`src/translations/${locale}/${ns}.json`).Faq;
      assert.ok(faq && faq.Title, `${locale}/${ns}: Faq.Title missing`);
      const items = (faq.Items as { Question: string; Answer: string }[]).map((x) => ({ question: x.Question, answer: x.Answer }));
      check(`${locale}/${ns}`, items, locale, 3, 6);
    }
  }
});

test("every indexable article carries a FAQ and no FAQ section left in its Markdown", () => {
  const fr = readJson("src/translations/fr/ressources.json").Articles as { slug: string; title: string; description: string; content: string }[];
  const frBySlug = new Map(fr.map((a) => [a.slug, a]));
  for (const locale of LOCALES) {
    const articles = readJson(`src/translations/${locale}/ressources.json`).Articles as {
      slug: string; title: string; description: string; content: string; faq?: { q: string; a: string }[];
    }[];
    for (const a of articles) {
      if (redirected[`${locale}/${a.slug}`] || consolidated[a.slug]) continue;
      const canon = frBySlug.get(a.slug);
      if (!canon) continue;
      // Untranslated copies are 404 (getValidLocalesForSlug): skip them.
      if (locale !== "fr" && a.title === canon.title && a.description === canon.description && a.content === canon.content) continue;
      const items = (a.faq ?? []).map((x) => ({ question: x.q, answer: x.a }));
      check(`${locale}/${a.slug}`, items, locale, 3, 5);
      assert.doesNotMatch(
        a.content,
        /^#{2,3} .*(FAQ|Questions fréquentes|Frequently asked|Häufig gestellte Fragen|Häufige Fragen|Preguntas frecuentes|Perguntas frequentes)/im,
        `${locale}/${a.slug}: FAQ section still in content`,
      );
    }
  }
});
