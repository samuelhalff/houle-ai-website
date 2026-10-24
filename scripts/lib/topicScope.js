"use strict";
/**
 * Editorial scope guard for houle.ai articles.
 *
 * houle.ai writes about AI, automation, Microsoft 365/Copilot, data/BI and AI
 * governance. Fiduciary topics (payroll, VAT, social insurance, company
 * formation, accounting, tax, wealth ...) belong to ark-fid.ch, the sister
 * site. This module is the single source of truth for that rule; topic
 * selection, backlog validation, the generator and validate-latest-article
 * all call it.
 *
 * Rule: a title (plus its slug) is out of scope when it contains a fiduciary
 * term AND no AI/automation term. A fiduciary term next to an AI/automation
 * term ("automatiser la saisie de factures avec Power Automate") is allowed.
 */

const fs = require("fs");
const path = require("path");

const REDIRECTED_PATH = path.join("src", "data", "articles-redirected-to-ark.json");

// Matching runs on accent-stripped lowercase text (see normalize). Plain terms
// get word boundaries on both sides; terms ending with "*" are prefixes.
// Regex fragments (containing \s, |, .) are written as { rx: "..." }.
const FIDUCIARY_TERMS = [
  // payroll
  "paie*", "salaire*", "payroll*", "lohn*", "gehalt*", "salario*", "nomina*", "folha de pagamento",
  "remuneration*",
  // VAT
  "tva", "vat", "mwst", "mehrwertsteuer*", "iva", "taxe sur la valeur ajoutee",
  // social insurance / pension
  "lpp", "avs", "ahv", "bvg", "laa", "cotisations sociales", "cotisation sociale", "charges sociales",
  "assurances sociales", "assurance sociale", "sozialversicherung*", "sozialabgaben",
  "social contributions", "social security contributions", "contribuciones sociales", "cotizaciones sociales",
  "contribuicoes sociais",
  // domiciliation
  "domiciliation*", "domizil*", "domiciliacion", "domiciliacao", "registered office service*",
  // company formation (fr/es/pt; apostrophes are normalised to ')
  { label: "company formation", rx: "(?:constitution|constitucion|constituicao)\\s+(?:d'une?\\s+|d'|de\\s+una?\\s+|de\\s+uma?\\s+|de\\s+|du\\s+|del\\s+|da\\s+)?(?:une?\\s+|una?\\s+|uma?\\s+)?(?:societe|entreprise|sarl|sa|gmbh|ag|company|empresa|sociedad|sociedade)(?![a-z0-9])" },
  { label: "company creation", rx: "(?:creation|creacion|criacao)\\s+(?:d'une?\\s+|d'|de\\s+una?\\s+|de\\s+uma?\\s+|de\\s+|du\\s+|del\\s+|da\\s+)?(?:une?\\s+|una?\\s+|uma?\\s+)?(?:societe|entreprise|sarl|sa|gmbh|ag|company|empresa|sociedad|sociedade)(?![a-z0-9])" },
  "firmengrundung*", "unternehmensgrundung*", "gesellschaftsgrundung*",
  "incorporation", "company formation", "company incorporation", "forming a company",
  // commercial register
  "registre du commerce", "registre de commerce", "handelsregister*", "commercial register", "registro mercantil",
  "registo comercial", "registro comercial",
  // M&A: company context required so "fusion de donnees" / "acquisition de donnees" stay allowed
  "m&a", "takeover*", "unternehmenskauf*", "unternehmensverkauf*", "unternehmensfusion*", "unternehmensubernahme*",
  "reprise d'entreprise*", "remise d'entreprise*", "rachat d'entreprise*", "succession d'entreprise*",
  "business acquisition*", "company acquisition*", "adquisicion de empresa*", "aquisicao de empresa*",
  { label: "mergers and acquisitions", rx: "mergers?\\s+(?:and|&|et)\\s+acquisitions?(?![a-z0-9])" },
  { label: "merger", rx: "mergers?(?![a-z0-9])" },
  { label: "fusion(s) et acquisition(s)", rx: "fusions?\\s*(?:et|y|e|-|&)\\s*acquisitions?(?![a-z0-9])" },
  { label: "fusiones y adquisiciones", rx: "(?:fusiones|fusoes)\\s+(?:y|e)\\s+(?:adquisiciones|aquisicoes)(?![a-z0-9])" },
  { label: "fusion d'entreprises", rx: "fusions?\\s+(?:d'|de\\s+|des\\s+|du\\s+|entre\\s+)?(?:entreprises?|societes?|pme|sarl|sa|companies|company|empresas?|sociedad(?:es)?|sociedades?)(?![a-z0-9])" },
  { label: "acquisition d'entreprise", rx: "acquisitions?\\s+(?:d'|de\\s+|des\\s+|du\\s+)?(?:une?\\s+)?(?:entreprises?|societes?|pme|sarl|companies|company|business(?:es)?)(?![a-z0-9])" },
  // liquidation / dissolution
  "liquidation*", "liquidacion*", "liquidacao*", "dissolution*", "faillite*", "konkurs*", "insolvency",
  // accounting / bookkeeping / statements
  "comptabilit*", "comptable*", "tenue de livres", "bouclement*", "buchhaltung*", "buchfuhrung*", "jahresabschluss*",
  "rechnungswesen", "bilan*", "bilanz*", "annual accounts", "annual account", "financial statements",
  "financial statement", "audit financier", "audit comptable", "financial audit", "comptes annuels", "cuentas anuales", "estados financieros", "demonstracoes financeiras", "jahresrechnung*", "obrigacoes fiscais", "obligaciones fiscales",
  "bookkeeping", "accounting", "accountant*", "contabilidad", "contabilidade", "contabilista*", "contable*",
  "cloture annuelle", "annual closing",
  "facturation*", "invoicing", "facturacion", "faturacao",
  // fiduciary
  "fiduciaire*", "fiduciary", "fiduciaria*", "fiduciario*", "treuhand*", "treuhaender*", "cfo externalise",
  "cfo externe", "cfo as a service", "fractional cfo", "externalisation administrative",
  "externalisation comptable", "outsourcing administratif", "administrative outsourcing",
  // tax
  "fiscalit*", "fiscal*", "impot*", "impots", "steuer*", "steuern", "tax", "taxes", "taxation", "taxe",
  "impuesto*", "imposto*", "tributari*",
  // wealth management (not "patrimoine de donnees" / "data wealth")
  { label: "patrimoine", rx: "patrimoine(?!\\s+(?:de\\s+|des\\s+)?(?:donnees|data))" },
  "patrimonial*", { label: "wealth", rx: "(?<!data\\s)wealth" },
  "gestion de fortune", "vermoegen*", "vermogen*", "patrimonio*",
  "gestao de patrimonio", "family office*",
  // ERP / accounting software
  "odoo",
];

// Qualified AI/automation signals. Bare "agent" is deliberately NOT one
// ("agent fiduciaire", "agents immobiliers"); "ia/ai/ki" only as standalone tokens.
const AI_TERMS = [
  "ia", "ai", "ki", "agents? (?:ia|ai|ki)", "agentic", "agentique*", "copilot*", "power automate", "power bi", "power apps",
  "power platform", "llm*", "gpt*", "chatgpt", "openai", "anthropic", "claude", "mistral", "automatis*", "automation*",
  "automatiz*", "automating", "automate*", "automacao*", "automatic*", "automatisier*", "automatiza*", "m365", "microsoft 365", "office 365",
  "microsoft copilot", "azure openai", "azure ai", "intelligence artificielle", "artificial intelligence",
  { label: "kunstliche intelligenz", rx: "kunstliche[rn]?\\s+intelligenz(?![a-z0-9])" }, "inteligencia artificial", "machine learning", "apprentissage automatique", "rag", "ocr",
  "chatbot*", "prompt*", "n8n",
];

// Employer/tax/accounting obligation phrases are fiduciary content whatever else the title says.
const OBLIGATION_RX = [
  /(?<![a-z0-9])obligations?\s+(?:fiscales?|sociales?|comptables?|salariales?|(?:legales?\s+)?(?:de\s+l'|d')employeur)(?![a-z0-9])/,
  /(?<![a-z0-9])(?:payroll|tax|accounting|vat|social|employer)\s+obligations?(?![a-z0-9])/,
  /(?<![a-z0-9])(?:steuerpflicht\w*|arbeitgeberpflicht\w*|pflichten\s+des\s+arbeitgebers)(?![a-z0-9])/,
  /(?<![a-z0-9])obligaciones\s+(?:fiscales|laborales|contables|sociales)(?![a-z0-9])/,
  /(?<![a-z0-9])obrigacoes\s+(?:fiscais|trabalhistas|contabeis|sociais|do\s+empregador)(?![a-z0-9])/,
];

// Site categories that count as AI/automation topics.
const AI_CATEGORIES = new Set([
  "ai-strategy-adoption", "quality-governance", "security-compliance", "private-llm-rag", "case-studies",
  "microsoft-365-copilot", "document-email-automation", "workflow-automation", "data-integration-analytics",
]);

// Explicit "AI automation of a process" exception in the title.
const AUTOMATION_RX = /(?<![a-z0-9])(?:automatis\w*|automating|automate\w*|automation\w*|automatiz\w*|automacao\w*)/;

// A fiduciary guide stays out of scope even if "AI" is a decoration word
// ("AI company tax guide").
const PURE_GUIDE_RX = [
  /(?<![a-z0-9])(?:tax|fiscal|fiscale|steuer|vat|tva|payroll|accounting|bookkeeping|treuhand|fiduciary)\s+(?:guide|handbook|basics|checklist|ratgeber)(?![a-z0-9])/,
  /(?<![a-z0-9])(?:guide|ratgeber|handbook|manuel)\s+(?:de\s+la\s+|du\s+|de\s+)?(?:tva|paie|fiscal\w*|comptab\w*|fiduciaire|impots?|steuer\w*|tax)(?![a-z0-9])/,
];

function normalize(input) {
  return String(input || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[\u2010\u2011\u2012\u2013\u2212]/g, "-")
    .replace(/[\u00a0\u202f\u2009\u2007]/g, " ")
    .replace(/ß/g, "ss")
    .replace(/[’‘ʼ`´]/g, "'")
    .toLowerCase();
}

function escapeRx(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const LEFT = "(?<![a-z0-9])";
const RIGHT = "(?![a-z0-9])";

function compile(terms) {
  return terms.map((t) => {
    if (typeof t === "object") {
      return { label: t.label, re: new RegExp(`${LEFT}(?:${t.rx})`, "i") };
    }
    const prefix = t.endsWith("*");
    const body = escapeRx(prefix ? t.slice(0, -1) : t).replace(/ /g, "\\s+");
    return { label: t.replace(/\*$/, ""), re: new RegExp(`${LEFT}${body}${prefix ? "" : RIGHT}`, "i") };
  });
}

const FIDUCIARY_RX = compile(FIDUCIARY_TERMS);
const AI_RX = compile(AI_TERMS);

function scan(rxList, text) {
  const hits = [];
  for (const { label, re } of rxList) {
    if (re.test(text)) hits.push(label);
  }
  return hits;
}

function findFiduciaryTerms(text) {
  return [...new Set(scan(FIDUCIARY_RX, normalize(text)))];
}

function findAiTerms(text) {
  return [...new Set(scan(AI_RX, normalize(text)))];
}

function haystack({ title, slug }) {
  return `${title || ""} ${String(slug || "").replace(/[-_]+/g, " ")}`;
}

/**
 * @param {{title?: string, slug?: string, id?: string}} item
 * @returns {{ok: boolean, fiduciary: string[], ai: string[], reason: string}}
 */
function checkTopicScope(item) {
  const text = haystack({ title: item && item.title, slug: (item && (item.slug || item.id)) || "" });
  const fiduciary = findFiduciaryTerms(text);
  const ai = findAiTerms(text);
  const norm = normalize(text);
  if (OBLIGATION_RX.some((rx) => rx.test(norm))) {
    return {
      ok: false,
      fiduciary: fiduciary.length ? fiduciary : ["obligations"],
      ai,
      reason: "fiduciary obligations (tax/payroll/employer/accounting); belongs to ark-fid.ch",
    };
  }
  if (fiduciary.length && PURE_GUIDE_RX.some((rx) => rx.test(norm))) {
    return {
      ok: false,
      fiduciary,
      ai,
      reason: `fiduciary guide (${fiduciary.join(", ")}); AI term does not make it an AI topic; belongs to ark-fid.ch`,
    };
  }
  if (fiduciary.length && !ai.length) {
    return {
      ok: false,
      fiduciary,
      ai,
      reason: `fiduciary topic (${fiduciary.join(", ")}) without AI/automation term; belongs to ark-fid.ch`,
    };
  }
  return { ok: true, fiduciary, ai, reason: "" };
}

function isInScope(item) {
  return checkTopicScope(item).ok;
}

/** Set of "<locale>/<slug>" keys redirected to ark-fid.ch. */
function loadRedirectedKeys(root = process.cwd()) {
  const file = path.join(root, REDIRECTED_PATH);
  if (!fs.existsSync(file)) return new Set();
  return new Set(Object.keys(JSON.parse(fs.readFileSync(file, "utf8"))));
}

function isRedirectedToArk(slug, redirectedKeys) {
  if (!slug) return false;
  for (const key of redirectedKeys) {
    if (key.slice(key.indexOf("/") + 1) === slug) return true;
  }
  return false;
}

/**
 * Full article gate used by validate-latest-article.
 * @returns {string[]} problems; empty when the article may stay published.
 */
function articleScopeProblems(article, { redirectedKeys = new Set() } = {}) {
  const problems = [];
  const scope = checkTopicScope({ title: article.title, slug: article.slug });
  if (!scope.ok) problems.push(`out of scope: ${scope.reason}`);
  if (isRedirectedToArk(article.slug, redirectedKeys)) {
    problems.push("slug is listed in src/data/articles-redirected-to-ark.json");
  }
  if (article.category === "business-operations" && findAiTerms(article.title || "").length === 0) {
    problems.push('category "business-operations" requires an AI/automation term in the title');
  }
  const fid = findFiduciaryTerms(haystack({ title: article.title, slug: article.slug }));
  if (fid.length && article.category) {
    const explicitAutomation = AUTOMATION_RX.test(normalize(article.title));
    if (!AI_CATEGORIES.has(article.category) && !explicitAutomation) {
      problems.push(
        `fiduciary term (${fid.join(", ")}) with non-AI category "${article.category}" and no explicit automation in the title`,
      );
    }
  }
  return problems;
}

/** Prompt block shared by every generation prompt. */
const SCOPE_PROMPT_LINES = [
  "=== PÉRIMÈTRE ÉDITORIAL (OBLIGATOIRE, NON NÉGOCIABLE) ===",
  "- houle.ai écrit UNIQUEMENT sur: l'IA, l'automatisation de processus, Microsoft 365 / Copilot, la data et la BI, la gouvernance et la sécurité de l'IA.",
  "- JAMAIS de sujet fiduciaire, comptable, fiscal, salarial ou de création/gestion de société: paie, salaires, TVA, AVS/LPP/cotisations sociales, domiciliation, constitution de société, registre du commerce, fusions-acquisitions, liquidation, comptabilité, fiscalité, gestion de patrimoine, Odoo/ERP comptable. Ces sujets appartiennent à ark-fid.ch, le site de la fiduciaire sœur.",
  "- Seule exception: un article clairement centré sur l'IA, l'automatisation ou Microsoft appliqués à un processus métier (ex: « automatiser la saisie de factures avec Power Automate »). Le titre doit alors contenir explicitement un terme IA/automatisation (IA, Copilot, Power Automate, agent, LLM, automatisation, Microsoft 365…).",
  "- Si le sujet imposé semble fiduciaire, recentre-le sur l'angle IA/automatisation dès le titre; ne rédige jamais un guide fiduciaire classique.",
];

module.exports = {
  FIDUCIARY_TERMS,
  AI_TERMS,
  normalize,
  findFiduciaryTerms,
  findAiTerms,
  checkTopicScope,
  isInScope,
  loadRedirectedKeys,
  isRedirectedToArk,
  articleScopeProblems,
  AI_CATEGORIES,
  SCOPE_PROMPT_LINES,
};
