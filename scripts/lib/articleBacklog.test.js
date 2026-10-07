"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const lib = require("./articleBacklog");
const { RESOURCE_CATEGORIES } = require("./article-taxonomy");

const ROOT = path.join(__dirname, "..", "..");
const backlog = lib.loadBacklog(ROOT);
// Live data is only used for a smoke test; rule tests use fixtures.
const articles = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src", "translations", "fr", "ressources.json"), "utf8"),
).Articles;

// Fixture mirroring the situation of October 2026: 14 policy articles in the
// last 20. Tests use it so they do not depend on what gets published later.
const POLICY_HEAVY = [];
for (let i = 0; i < 20; i++) {
  const policy = ![3, 7, 9, 12, 15, 18].includes(i);
  POLICY_HEAVY.push({
    slug: policy ? `politique-usage-ia-entreprise-${i}` : `azure-openai-checklist-securite-${i}`,
    title: policy
      ? `Rédiger une politique d'usage de l'IA en entreprise : modèle et clauses (${i})`
      : `Azure OpenAI en entreprise : checklist sécurité, réseau et monitoring (${i})`,
    date: `2026-09-${String(i + 1).padStart(2, "0")}`,
  });
}

function fakeHistory(families) {
  return families.map((family, i) => ({
    slug: `a-${i}`,
    title: `zzz${i} qqq${i}`,
    date: "",
    topicId: "",
    family,
  }));
}

test("backlog is valid: 60+ topics, 8+ categories, keywords in 5 locales, real service pages", () => {
  const errors = lib.validateBacklog(backlog, {
    servicePaths: lib.loadServicePaths(ROOT),
    siteCategories: new Set(RESOURCE_CATEGORIES.map((c) => c.id)),
  });
  assert.deepEqual(errors, []);
  assert.ok(backlog.topics.length >= 60);
  assert.ok(backlog.categories.length >= 8);
  for (const c of backlog.categories) {
    assert.ok(
      backlog.topics.some((t) => t.category === c.id),
      `category ${c.id} has no topic`,
    );
  }
});

test("lead-generating topics dominate the backlog", () => {
  const buyer = backlog.topics.filter((t) => t.intent !== "informational").length;
  assert.ok(buyer / backlog.topics.length >= 0.8);
  const policy = backlog.topics.filter((t) => t.category === "regulation-policy").length;
  assert.ok(policy / backlog.topics.length <= 0.1);
});

test("legacy articles are classified by family", () => {
  const f = (title, slug = "") => lib.classifyFamily({ title, slug });
  assert.equal(f("Rédiger une politique d'usage de l'IA en entreprise : modèle et clauses"), "regulation-policy");
  assert.equal(f("Créer une charte de gouvernance pour l'IA en entreprise"), "regulation-policy");
  assert.equal(f("x", "rediger-politique-usage-ia-entreprise"), "regulation-policy");
  assert.equal(f("Décompte tva annuel en suisse : points clés pour 2025"), "legacy-fiduciary");
  assert.equal(f("Power Automate et IA : Automatiser les processus RH et Finance en conformité"), "process-automation");
  assert.equal(f("Agents IA vs RPA et automatisation traditionnelle"), "vendor-neutral-models");
  assert.equal(lib.classifyFamily({ title: "anything", topicFamily: "ai-triage" }), "ai-triage");
});

test("selection is deterministic", () => {
  const a = lib.simulateSequence({ backlog, articles: POLICY_HEAVY, count: 12 }).map((t) => t.id);
  const b = lib.simulateSequence({ backlog, articles: POLICY_HEAVY, count: 12 }).map((t) => t.id);
  assert.deepEqual(a, b);
  assert.equal(a.length, 12);
});

test("published articles: the next topic respects the rules", () => {
  assert.equal(lib.classifyFamily(POLICY_HEAVY[0]), "regulation-policy");
  const history = lib.buildHistory(articles);
  const { topic } = lib.selectNextTopic({ backlog, history });
  if (!topic) return; // backlog exhausted: reported by article-topic-plan --check
  assert.notEqual(topic.category, history[history.length - 1].family);
  assert.equal(lib.categoryBlockReason(topic.category, history, lib.getRules(backlog)), null);
  assert.ok(!history.some((h) => h.topicId === topic.id));
});

test("rotation rules hold over a long simulated run", () => {
  const articles = POLICY_HEAVY;
  const count = 60;
  const sequence = lib.simulateSequence({ backlog, articles, count });
  assert.equal(sequence.length, count);

  // no topic repeated
  assert.equal(new Set(sequence.map((t) => t.id)).size, count);

  const families = [
    ...lib.buildHistory(articles).map((h) => h.family),
    ...sequence.map((t) => t.category),
  ];
  const start = families.length - count;
  const cap = backlog.rules.cappedCategories["regulation-policy"];
  for (let i = start; i < families.length; i++) {
    // never two consecutive articles from the same category
    assert.notEqual(families[i], families[i - 1], `consecutive ${families[i]} at ${i - start}`);
    if (families[i] === "regulation-policy") {
      // at most 1 in any `window` articles
      const before = families.slice(Math.max(0, i - (cap.window - 1)), i);
      assert.ok(!before.includes("regulation-policy"), `policy cap broken at ${i - start}`);
      // none while over-represented in the last 20
      const last20 = families.slice(Math.max(0, i - 20), i);
      assert.ok(last20.filter((f) => f === "regulation-policy").length < cap.maxInLast20);
    }
  }

  // policy is over-represented today: none of the next 12 is a policy article
  assert.ok(sequence.slice(0, 12).every((t) => t.category !== "regulation-policy"));
  // variety: at least 6 categories in the next 12
  assert.ok(new Set(sequence.slice(0, 12).map((t) => t.category)).size >= 6);
  // buyer intent first
  const buyer = sequence.slice(0, 12).filter((t) => t.intent !== "informational").length;
  assert.ok(buyer >= 10);
});

test("capped category: blocked inside the window and when over-represented", () => {
  const rules = lib.getRules(backlog);
  const P = "regulation-policy";
  assert.match(
    lib.categoryBlockReason(P, fakeHistory([P, "industry", "cost-roi", "ai-triage", "industry"]), rules),
    /at most 1/,
  );
  const spaced = [];
  for (let i = 0; i < 20; i++) spaced.push(i % 6 === 0 && i < 13 ? P : i % 2 ? "industry" : "cost-roi");
  // 3 policy articles in the last 20, the latest one 7 articles ago
  assert.match(lib.categoryBlockReason(P, fakeHistory(spaced), rules), /over-represented/);
  assert.equal(
    lib.categoryBlockReason(P, fakeHistory(["industry", "cost-roi", "ai-triage", "industry", "cost-roi"]), rules),
    null,
  );
  assert.match(lib.categoryBlockReason("industry", fakeHistory(["industry"]), rules), /previous article/);
});

test("under-represented categories are preferred", () => {
  const history = fakeHistory(Array.from({ length: 19 }, (_, i) => (i % 2 ? "industry" : "cost-roi")).concat("microsoft-365"));
  const { topic } = lib.selectNextTopic({ backlog, history });
  assert.ok(!["industry", "cost-roi", "microsoft-365"].includes(topic.category));
});

test("used, near-duplicate and reserved topics are skipped", () => {
  const first = lib.selectNextTopic({ backlog, history: [] }).topic;
  const used = [{ slug: "x", title: "zzz", date: "", topicId: first.id, family: "other" }];
  assert.notEqual(lib.selectNextTopic({ backlog, history: used }).topic.id, first.id);

  const paraphrase = [{ slug: "y", title: first.title, date: "", topicId: "", family: "other" }];
  assert.notEqual(lib.selectNextTopic({ backlog, history: paraphrase }).topic.id, first.id);

  const reserved = { ...backlog, reserved: [{ title: first.title, slugs: [] }] };
  assert.notEqual(lib.selectNextTopic({ backlog: reserved, history: [] }).topic.id, first.id);

  for (const r of backlog.reserved) {
    const clash = backlog.topics.find(
      (t) => lib.titleSimilarity(t.title, r.title) >= backlog.rules.similarityThreshold,
    );
    assert.equal(clash, undefined, `backlog topic too close to reserved "${r.title}"`);
  }
});

test("copilot topics can be switched off", () => {
  const off = { ...backlog, rules: { ...backlog.rules, allowCopilot: false } };
  const sequence = lib.simulateSequence({ backlog: off, articles: [], count: backlog.topics.length });
  assert.ok(sequence.every((t) => t.requires !== "copilot"));
});

test("manual override: backlog id, free text, rotation guard and skip", () => {
  const known = backlog.topics[0];
  assert.equal(lib.resolveForcedTopic(backlog, { topic: known.id }).id, known.id);
  assert.equal(lib.resolveForcedTopic(backlog, { topic: "" }), null);

  const free = lib.resolveForcedTopic(backlog, {
    topic: "Agent vocal pour cabinet dentaire",
    keywords: ["agent vocal ia", " cabinet dentaire "],
    category: "industry",
  });
  assert.equal(free.category, "industry");
  assert.equal(free.id, "agent-vocal-pour-cabinet-dentaire");
  assert.deepEqual(free.keywords.fr, ["agent vocal ia", "cabinet dentaire"]);
  assert.ok(free.service);

  const unknownCat = lib.resolveForcedTopic(backlog, { topic: "Sujet libre", category: "copilot" });
  assert.ok(backlog.categories.some((c) => c.id === unknownCat.category));

  const policy = lib.resolveForcedTopic(backlog, {
    topic: "Charte IA pour les communes",
    category: "regulation-policy",
  });
  assert.ok(lib.forcedTopicViolation(backlog, policy, POLICY_HEAVY));
  assert.equal(lib.forcedTopicViolation(backlog, policy, POLICY_HEAVY, { skipRotation: true }), null);
});

test("generated titles that drift to policy or paraphrase an article are refused", () => {
  const topic = backlog.topics.find((t) => t.category === "ai-triage");
  const articles = POLICY_HEAVY;
  assert.throws(
    () =>
      lib.assertTopicFit({
        backlog,
        topic,
        articles,
        article: { slug: "charte-ia-triage", title: "Charte et gouvernance de l'IA pour le triage" },
      }),
    { code: "TOPIC_DRIFT" },
  );
  assert.throws(
    () =>
      lib.assertTopicFit({
        backlog,
        topic,
        articles,
        article: {
          slug: "azure-openai-checklist-securite",
          title: "Azure OpenAI en entreprise : checklist sécurité, réseau et monitoring",
        },
      }),
    { code: "NEAR_DUPLICATE" },
  );
  assert.doesNotThrow(() =>
    lib.assertTopicFit({ backlog, topic, articles, article: { slug: topic.id, title: topic.title } }),
  );
});

test("lead path: CTA inserted before references, idempotent, localised", () => {
  const service = "/solutions/invoice-processing";
  const content = "## Intro\n\ntexte\n\n---\n### Références\n- [A](https://a.ch)\n- [B](https://b.ch)\n";
  const opts = { locale: "fr", service, serviceLabel: "traitement des factures" };
  const out = lib.insertLeadPath(content, opts);
  assert.ok(out.includes("](/fr/solutions/invoice-processing/)"));
  assert.ok(out.includes("](/fr/contact/)"));
  assert.ok(out.indexOf("/fr/contact/") < out.indexOf("### Références"));
  assert.ok(out.includes("- [B](https://b.ch)"));
  assert.equal(lib.insertLeadPath(out, opts), out);
  assert.doesNotThrow(() => lib.assertLeadPath({ slug: "s", content: out }, "fr", service));
  assert.throws(() => lib.assertLeadPath({ slug: "s", content }, "fr", service), {
    code: "MISSING_LEAD_PATH",
  });

  const noRefs = lib.insertLeadPath("## Intro\n\ntexte", { ...opts, locale: "de" });
  assert.ok(noRefs.trimEnd().endsWith("."));
  assert.ok(noRefs.includes("](/de/contact/)"));

  const translated = lib.localizeLeadLinks(out, "en");
  assert.ok(translated.includes("](/en/contact/)") && !translated.includes("](/fr/"));
  assert.ok(translated.includes("https://a.ch"));

  for (const locale of lib.LOCALES) {
    const label = lib.resolveServiceLabel(ROOT, locale, service);
    assert.ok(label && label.length > 5, `no label for ${locale}`);
    assert.ok(lib.resolveServiceLabel(ROOT, locale, "/services/ai-consulting"));
  }
});

test("translation parity: metadata, sections and length", () => {
  const fr = {
    slug: "s",
    date: "2026-10-07",
    category: "workflow-automation",
    topicId: "t",
    topicFamily: "ai-triage",
    title: "t",
    description: "d",
    content: "## a\n\nun deux trois quatre\n\n## b\n\ncinq six sept huit\n\n## c\n\nneuf dix",
  };
  assert.deepEqual(lib.translationParityIssues(fr, { ...fr, content: "## a\n\none two three four\n\n## b\n\nfive six seven\n\n## c\n\nnine ten" }), []);
  assert.ok(lib.translationParityIssues(fr, null).length);
  assert.match(lib.translationParityIssues(fr, { ...fr, topicFamily: "" }).join(), /topicFamily/);
  assert.match(lib.translationParityIssues(fr, { ...fr, category: "x" }).join(), /category/);
  assert.match(lib.translationParityIssues(fr, { ...fr, content: "## a\n\none two three four five six seven" }).join(), /section count/);
  assert.match(lib.translationParityIssues(fr, { ...fr, content: "## a\n\n## b\n\n## c\n\none" }).join(), /truncated/);
});
