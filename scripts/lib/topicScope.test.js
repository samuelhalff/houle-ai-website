"use strict";
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const scope = require("./topicScope");
const backlogLib = require("./articleBacklog");
const trends = require("./trends");

const ROOT = path.resolve(__dirname, "..", "..");

const REJECTED = [
  "Gestion de la paie en Suisse romande: obligations 2026",
  "Optimiser la TVA des PME genevoises",
  "Swiss VAT return: common mistakes",
  "Mehrwertsteuer: Abrechnung für KMU",
  "Lohnabrechnung und AHV-Beiträge richtig erfassen",
  "LPP 2026: nouvelles obligations employeurs",
  "Cotisations sociales des indépendants",
  "Domiciliation d'entreprise à Genève",
  "Firmengründung in der Schweiz: Schritte",
  "Constitution d'une société à Genève",
  "How to incorporate: Swiss company incorporation guide",
  "Inscription au registre du commerce: étapes",
  "Fusion et acquisition de PME en Suisse romande",
  "M&A for Swiss SMEs",
  "Liquidation d'une Sàrl: marche à suivre",
  "Comptabilité des PME: bonnes pratiques",
  "Buchhaltung für Startups",
  "Choisir une fiduciaire à Genève",
  "Treuhand und Steuerberatung",
  "Fiscalité des entreprises en 2026",
  "Impôts à Genève: baisse en 2026",
  "Steuerreform 2026",
  "Gestion de patrimoine pour dirigeants",
  "Wealth planning for founders",
  "Odoo 18: nouveautés pour les PME",
  "Contabilidad para pymes en Suiza",
  "Folha de pagamento na Suíça",
  // codex review: bare "agent" and decorative "AI" must not rescue fiduciary titles
  "Agent fiduciaire : obligations fiscales",
  "Guide fiscal pour agents immobiliers",
  "AI company tax guide",
  // codex review: false negatives
  "Mergers and acquisitions in Switzerland",
  "Création d’une entreprise à Genève",
  "Constitución de empresa en Suiza",
  "Constituição de sociedade na Suíça",
  "Annual accounts for Swiss SMEs",
  "Financial statements: what to prepare",
  "Audit financier des PME",
  "Facturation et TVA des indépendants",
  "Le bilan annuel de votre société",
  "Jahresabschluss für KMU",
  "Contabilidad y contabilidade",
  "Nómina y IVA en Suiza",
  "Fusion d’entreprises: étapes clés",
  "Gestion du patrimoine privé",
  // final round: obligation phrases beat AI terms
  "AI news and payroll obligations",
  "KI‑Trends und Steuerpflichten",
  "Novedades de IA y obligaciones fiscales",
  "IA et obligations fiscales des PME",
  "Pflichten des Arbeitgebers und KI",
  "Novidades de IA e obrigações fiscais",
  "Novedades de IA y obligaciones laborales",
  "Copilot et obligations de l'employeur",
  "Estados financieros en Suiza",
  "Demonstrações financeiras das PME",
  "Jahresrechnung für KMU",
];

const ALLOWED = [
  "Automatiser la saisie de factures avec Power Automate",
  "Copilot pour l'analyse des charges salariales dans Excel",
  "IA et TVA: détecter les anomalies dans les écritures",
  "Automatisierte Lohnabrechnung mit KI prüfen",
  "Using an LLM agent to reconcile accounting entries",
  "Microsoft 365: sécuriser les données de paie",
  "Gouvernance des données M365 et IA privée",
  "RAG sur documents internes: choisir un modèle",
  "Agents IA pour le support client",
  "Power BI: tableaux de bord pour dirigeants",
  "Automatiser la facturation avec l'IA",
  "Fusion de données entre systèmes avec Power BI",
  "Acquisition de données: pipelines pour l'IA",
  "Patrimoine de données: gouverner vos données avec Copilot",
  "Agents IA pour fiduciaires: cas d'usage",
  "IA fiduciaire: cas d'usage rentables",
  "Détection d'anomalies TVA avec l'IA",
  "Data fusion and data acquisition with LLM agents",
  "Automating accounting with Odoo agents and Teams",
  "Automatización de la contabilidad con IA",
  "Automação da contabilidade com Power Automate",
  "Automatisierung der Buchhaltung mit KI",
  "Künstliche Intelligenz für die Buchhaltung",
  "Inteligência artificial para estados financieros",
  "Intelligence artificielle pour la comptabilité",
  "Automated invoice matching",
];

describe("topicScope.checkTopicScope", () => {
  for (const title of REJECTED) {
    it(`rejects: ${title}`, () => {
      const r = scope.checkTopicScope({ title });
      assert.equal(r.ok, false, `expected rejection, got ${JSON.stringify(r)}`);
      assert.ok(r.fiduciary.length > 0);
    });
  }
  for (const title of ALLOWED) {
    it(`allows: ${title}`, () => {
      assert.equal(scope.checkTopicScope({ title }).ok, true);
    });
  }

  it("does not match fiduciary terms inside unrelated words", () => {
    assert.deepEqual(scope.findFiduciaryTerms("Evaluation d'un assistant IA"), []);
    assert.deepEqual(scope.findFiduciaryTerms("Salesforce vs tavern"), []);
  });

  it("does not treat 'ia' inside another word as an AI term", () => {
    // 'domiciliation' contains 'ia'; it must stay rejected.
    assert.equal(scope.checkTopicScope({ title: "Domiciliation et siège social" }).ok, false);
  });

  it("also scans the slug", () => {
    assert.equal(scope.checkTopicScope({ title: "Guide pratique", slug: "guide-tva-geneve" }).ok, false);
  });
});

describe("topicScope.articleScopeProblems", () => {
  const redirected = new Set(["fr/gestion-paie-geneve", "en/gestion-paie-geneve"]);

  it("passes an in-scope article", () => {
    const a = { slug: "agents-ia-pme", title: "Agents IA pour PME", category: "ai-strategy-adoption" };
    assert.deepEqual(scope.articleScopeProblems(a, { redirectedKeys: redirected }), []);
  });
  it("fails a fiduciary title", () => {
    const a = { slug: "guide-tva", title: "Guide TVA 2026", category: "business-operations" };
    assert.ok(scope.articleScopeProblems(a, { redirectedKeys: redirected }).length >= 1);
  });
  it("fails a slug redirected to ark", () => {
    const a = { slug: "gestion-paie-geneve", title: "Agents IA pour PME", category: "workflow-automation" };
    const p = scope.articleScopeProblems(a, { redirectedKeys: redirected });
    assert.ok(p.some((x) => x.includes("redirected-to-ark")));
  });
  it("fails business-operations without an AI term in the title", () => {
    const a = { slug: "gouvernance-pme", title: "Gouvernance d'entreprise en PME", category: "business-operations" };
    const p = scope.articleScopeProblems(a, { redirectedKeys: redirected });
    assert.ok(p.some((x) => x.includes("business-operations")));
  });
  it("allows business-operations with an AI term in the title", () => {
    const a = { slug: "x", title: "Automatiser les relances clients avec Power Automate", category: "business-operations" };
    assert.deepEqual(scope.articleScopeProblems(a, { redirectedKeys: redirected }), []);
  });
});

describe("pipeline integration", () => {
  it("the backlog has no out-of-scope topic", () => {
    const backlog = backlogLib.loadBacklog(ROOT);
    const bad = backlog.topics.filter((t) => !scope.isInScope(t)).map((t) => t.id);
    assert.deepEqual(bad, []);
  });

  it("validateBacklog reports an out-of-scope topic", () => {
    const backlog = JSON.parse(JSON.stringify(backlogLib.loadBacklog(ROOT)));
    backlog.topics.push({ ...backlog.topics[0], id: "guide-tva-pme", title: "Guide TVA pour PME" });
    const errors = backlogLib.validateBacklog(backlog);
    assert.ok(errors.some((e) => e.includes("guide-tva-pme") && e.includes("fiduciary")));
  });

  it("selectNextTopic never returns an out-of-scope topic", () => {
    const backlog = JSON.parse(JSON.stringify(backlogLib.loadBacklog(ROOT)));
    const fid = { ...backlog.topics[0], id: "guide-tva-pme", title: "Guide TVA pour PME", priority: 1 };
    backlog.topics = [fid];
    const sel = backlogLib.selectNextTopic({ backlog, articles: [], skipRotation: true });
    assert.equal(sel.topic, null);
  });

  it("a forced fiduciary topic is refused even with skipRotation", () => {
    const backlog = backlogLib.loadBacklog(ROOT);
    const forced = backlogLib.resolveForcedTopic(backlog, { topic: "Déclaration de TVA trimestrielle" });
    assert.match(backlogLib.forcedTopicViolation(backlog, forced, [], { skipRotation: true }), /out of scope/);
  });

  it("trend filtering drops fiduciary trends", () => {
    const kept = trends.filterRelevantTrends([
      { title: "TVA suisse 2026 et outlook", relatedQueries: ["gpt"] },
      { title: "Microsoft 365 Copilot nouveautés", relatedQueries: [] },
    ]);
    assert.deepEqual(kept.map((t) => t.title), ["Microsoft 365 Copilot nouveautés"]);
    assert.equal(trends.mapTrendToArticleParams({ title: "Paie 2026" }), null);
  });
});

describe("validate-latest-article exit code", () => {
  function run(article) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "vla-"));
    const frDir = path.join(dir, "src", "translations", "fr");
    fs.mkdirSync(frDir, { recursive: true });
    fs.mkdirSync(path.join(dir, "src", "data"), { recursive: true });
    const content = Array(800).fill("mot").join(" ");
    fs.writeFileSync(
      path.join(frDir, "ressources.json"),
      JSON.stringify({ Articles: [{ date: "2099-01-01", content, ...article }] }),
    );
    fs.writeFileSync(
      path.join(dir, "src", "data", "articles-redirected-to-ark.json"),
      JSON.stringify({ "fr/slug-redirige": "https://ark-fid.ch/x" }),
    );
    const res = spawnSync(process.execPath, [path.join(ROOT, "scripts", "validate-latest-article.js")], {
      cwd: dir,
      encoding: "utf8",
    });
    fs.rmSync(dir, { recursive: true, force: true });
    return res;
  }

  it("fails on a fiduciary title", () => {
    const r = run({ slug: "guide-tva-pme", title: "Guide TVA pour PME", category: "business-operations" });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /out of houle\.ai scope/);
  });
  it("fails on a slug redirected to ark", () => {
    const r = run({ slug: "slug-redirige", title: "Agents IA pour PME", category: "ai-strategy-adoption" });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /redirected-to-ark/);
  });
  it("fails on business-operations without AI term", () => {
    const r = run({ slug: "gouvernance-pme", title: "Gouvernance d'entreprise en PME", category: "business-operations" });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /business-operations/);
  });
  it("requires an AI category when a fiduciary term is in the title", () => {
    const base = { slug: "x", title: "Copilot pour la comptabilité" };
    const bad = scope.articleScopeProblems({ ...base, category: "business-operations" }, {});
    assert.ok(bad.some((x) => x.includes("non-AI category")));
    assert.deepEqual(scope.articleScopeProblems({ ...base, category: "microsoft-365-copilot" }, {}), []);
    assert.deepEqual(
      scope.articleScopeProblems({ slug: "y", title: "Automating accounting with Odoo agents", category: "business-operations" }, {}),
      [],
    );
  });
  it("fails when a translation drifts into fiduciary territory", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "vla-"));
    for (const l of ["fr", "en"]) fs.mkdirSync(path.join(dir, "src", "translations", l), { recursive: true });
    fs.mkdirSync(path.join(dir, "src", "data"), { recursive: true });
    const base = { slug: "agents-ia-pme", date: "2099-01-01", category: "ai-strategy-adoption", content: Array(800).fill("mot").join(" ") };
    fs.writeFileSync(path.join(dir, "src/translations/fr/ressources.json"), JSON.stringify({ Articles: [{ ...base, title: "Agents IA pour PME" }] }));
    fs.writeFileSync(path.join(dir, "src/translations/en/ressources.json"), JSON.stringify({ Articles: [{ ...base, title: "Swiss VAT guide for SMEs" }] }));
    const res = spawnSync(process.execPath, [path.join(ROOT, "scripts", "validate-latest-article.js")], { cwd: dir, encoding: "utf8" });
    fs.rmSync(dir, { recursive: true, force: true });
    assert.notEqual(res.status, 0);
    assert.match(res.stderr, /translations/);
  });
  it("passes an in-scope article", () => {
    const r = run({ slug: "agents-ia-pme", title: "Agents IA pour PME", category: "ai-strategy-adoption" });
    assert.equal(r.status, 0, r.stderr);
  });
});
