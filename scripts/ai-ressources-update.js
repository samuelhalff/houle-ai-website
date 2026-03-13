"use strict";

/**
 * =============================================================================
 * AI ARTICLE GENERATION SYSTEM - TOPIC SCOPE DOCUMENTATION
 * =============================================================================
 * 
 * This script generates AI-powered articles for houle.ai, which is focused
 * EXCLUSIVELY on AI solutions for Microsoft 365 and related technology.
 * 
 * ALLOWED TOPICS (AI, Technology, and Microsoft 365 Focus):
 * ----------------------------------------------------------
 * ✅ AI privée et assistants internes (RAG, anti-hallucinations, contrôle des sources)
 * ✅ Add-ins Microsoft 365 (Outlook, Word, Teams) et intégrations
 * ✅ Architecture Azure OpenAI / Azure AI Foundry (sécurité, réseau, identité, clés)
 * ✅ Gouvernance IA, conformité et privacy (nLPD, RGPD, DPIA, registre des traitements)
 * ✅ Automatisation et productivité avec IA (Power Platform, Graph, workflows)
 * ✅ Évaluation qualité IA et monitoring (tests, scoring, régression, guardrails)
 * ✅ Adoption entreprise d'outils IA (ROI, cas d'usage, conduite du changement)
 * ✅ Technologies IA: LLM, GPT, fine-tuning, embeddings, vector databases
 * ✅ Hébergement en Suisse pour solutions IA et souveraineté des données
 * ✅ Sécurité et conformité SPÉCIFIQUES aux déploiements IA
 * 
 * FORBIDDEN TOPICS (Non-AI General Business Services):
 * -----------------------------------------------------
 * ❌ Comptabilité générale et tenue de livres (sauf si automatisée par IA)
 * ❌ TVA / VAT compliance générale (sauf si processus TVA automatisé par IA)
 * ❌ Services fiduciaires généraux non liés à l'IA
 * ❌ Gestion de la paie (salaires, AVS, LAA, LPP) sans contexte IA
 * ❌ Structure d'entreprise générique (SA, Sàrl, etc.) sans lien IA
 * ❌ Conseils juridiques ou fiscaux généraux
 * ❌ Réglementations commerciales suisses générales non liées à l'IA
 * ❌ Services de domiciliation d'entreprise
 * ❌ Audit financier traditionnel
 * 
 * WHY THIS RESTRICTION EXISTS:
 * ----------------------------
 * houle.ai provides AI and Microsoft 365 solutions, NOT general business services.
 * General accounting, VAT, fiduciary, and payroll services are offered by
 * ark-fid.ch (sister company). This separation ensures each brand maintains
 * clear positioning and serves its specific audience effectively.
 * 
 * VALIDATION APPROACH:
 * --------------------
 * 1. AI prompts explicitly exclude non-AI business topics
 * 2. Post-generation validation checks for off-topic keywords
 * 3. Articles are rejected if they focus on forbidden topics without AI context
 * 4. Better to reject an article than publish off-brand content
 * 
 * =============================================================================
 */

const fs = require("fs");
const path = require("path");

// Import trend and reference validation modules
const { getTopicSuggestions, buildSEOSuggestions } = require("./lib/trends");
const {
  validateReferences,
  deduplicateByDomain,
  getFallbackReferences,
  isTrustedDomain,
} = require("./lib/referenceValidator");

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const APPLY = args.has("--apply");
const DRY = args.has("--dry-run");
const TRANSLATE_EXISTING = args.has("--translate-existing");
let MOCK_PATH = null;

for (const arg of rawArgs) {
  if (arg.startsWith("--mock=")) {
    MOCK_PATH = arg.slice("--mock=".length);
  }
}

function loadMockData(filePath) {
  try {
    const abs = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);
    return JSON.parse(fs.readFileSync(abs, "utf8"));
  } catch (error) {
    throw new Error(
      `Failed to load mock data from ${filePath}: ${error.message}`,
    );
  }
}

const MOCK_DATA = MOCK_PATH ? loadMockData(MOCK_PATH) : null;
const OFFLINE_MODE = process.env.OFFLINE_MODE === "1";
const REQUIRE_TRANSLATIONS =
  process.env.REQUIRE_TRANSLATIONS === "1" || process.env.CI === "true";
const AI_TWO_STEP = process.env.AI_TWO_STEP === "1";

const AZURE_AGENT_ENDPOINT = process.env.AZURE_AGENT_ENDPOINT;
const AZURE_AGENT_NAME = process.env.AZURE_AGENT_NAME;
const AZURE_AGENT_API_KEY = process.env.AZURE_AGENT_API_KEY;
const AZURE_AGENT_RESEARCH_NAME =
  process.env.AZURE_AGENT_RESEARCH_NAME || AZURE_AGENT_NAME;
const AZURE_AGENT_RESPONSES_API_VERSION =
  process.env.AZURE_AGENT_RESPONSES_API_VERSION || "2025-11-15-preview";
const AZURE_AGENT_FORCE_RESPONSES =
  process.env.AZURE_AGENT_FORCE_RESPONSES === "1";
const AZURE_AGENT_FALLBACK_TO_OPENAI =
  process.env.AZURE_AGENT_FALLBACK_TO_OPENAI === "1";
const AZURE_AGENT_RESPONSES_RETRIES = parseInt(
  process.env.AZURE_AGENT_RESPONSES_RETRIES || "4",
  10,
);
const AZURE_AGENT_RESPONSES_BACKOFF_MS = parseInt(
  process.env.AZURE_AGENT_RESPONSES_BACKOFF_MS || "15000",
  10,
);
const AZURE_AGENT_RESPONSES_BACKOFF_MAX_MS = parseInt(
  process.env.AZURE_AGENT_RESPONSES_BACKOFF_MAX_MS || "120000",
  10,
);
const AZURE_AGENT_RESPONSES_BACKOFF_JITTER_MS = parseInt(
  process.env.AZURE_AGENT_RESPONSES_BACKOFF_JITTER_MS || "2000",
  10,
);
const AZURE_AGENT_RESPONSES_TIMEOUT_MS = parseInt(
  process.env.AZURE_AGENT_RESPONSES_TIMEOUT_MS || "180000",
  10,
);
const AZURE_AGENT_RESPONSES_COOLDOWN_MS = parseInt(
  process.env.AZURE_AGENT_RESPONSES_COOLDOWN_MS || "8000",
  10,
);
const AZURE_AGENT_RESPONSES_MAX_OUTPUT_TOKENS = parseInt(
  process.env.AZURE_AGENT_RESPONSES_MAX_OUTPUT_TOKENS || "0",
  10,
);

const REFERENCE_MIN_COUNT = parseInt(process.env.REFERENCE_MIN_COUNT || "3", 10);
const REFERENCE_MAX_COUNT = parseInt(process.env.REFERENCE_MAX_COUNT || "6", 10);
const REFERENCE_MIN_TRUSTED_DOMAINS = parseInt(
  process.env.REFERENCE_MIN_TRUSTED_DOMAINS || "1",
  10,
);

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_API_VERSION =
  process.env.AZURE_OPENAI_API_VERSION || "2024-05-01-preview";
const AZURE_OPENAI_DEPLOYMENT =
  process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4.1";
const AZURE_OPENAI_DRAFT_ENDPOINT =
  process.env.AZURE_OPENAI_DRAFT_ENDPOINT || AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_DRAFT_API_VERSION =
  process.env.AZURE_OPENAI_DRAFT_API_VERSION || AZURE_OPENAI_API_VERSION;
const AZURE_OPENAI_DRAFT_DEPLOYMENT =
  process.env.AZURE_OPENAI_DRAFT_DEPLOYMENT || AZURE_OPENAI_DEPLOYMENT;
const AZURE_OPENAI_DRAFT_MAX_TOKENS = parseInt(
  process.env.AZURE_OPENAI_DRAFT_MAX_TOKENS || "4096",
  10,
);
const AZURE_OPENAI_RESEARCH_ENDPOINT = process.env.AZURE_OPENAI_RESEARCH_ENDPOINT;
const AZURE_OPENAI_RESEARCH_API_VERSION =
  process.env.AZURE_OPENAI_RESEARCH_API_VERSION || AZURE_OPENAI_API_VERSION;
const AZURE_OPENAI_RESEARCH_DEPLOYMENT =
  process.env.AZURE_OPENAI_RESEARCH_DEPLOYMENT;
const AZURE_OPENAI_RESEARCH_API_KEY =
  process.env.AZURE_OPENAI_RESEARCH_API_KEY || AZURE_OPENAI_API_KEY;

const ROOT = process.cwd();
const TRANSLATIONS_DIR = path.join(ROOT, "src", "translations");
const FR_PATH = path.join(TRANSLATIONS_DIR, "fr", "ressources.json");
const LOCALES = ["en", "de", "es", "pt"];

const BRAND_NAME = "houle";
const AUTHOR_NAME = "Houle Team";

const SERVICES = [
  "ia privée et assistants internes (rag, anti-hallucinations, contrôle des sources)",
  "add-ins microsoft 365 (outlook, word, teams) et intégrations",
  "architecture azure openai / azure ai foundry (sécurité, réseau, identité, clés)",
  "gouvernance ia, conformité et privacy (nlpd, rgpd, dpia, registre des traitements pour systèmes ia)",
  "automatisation ia et productivité microsoft 365 (power platform, graph, workflows)",
  "évaluation qualité ia et monitoring (tests, scoring, régression, guardrails)",
  "adoption entreprise de solutions ia (roi, cas d'usage, conduite du changement)",
];

const TOPIC_KEYWORDS = [
  {
    topic: "private-ai",
    label: "IA privée et protection des données",
    patterns: [
      /ia\s*priv[ée]e/i,
      /donn[ée]es?\s*sensibles/i,
      /confidentialit[ée]/i,
      /\bnlpd\b/i,
      /\brgpd\b/i,
      /protection\s+des\s+donn[ée]es/i,
      /d(?:p|pi)a/i,
      /registre\s+des\s+traitements/i,
      /anonymis/i,
      /pseudonymis/i,
      /on-?prem/i,
      /souverainet[ée]\s+num[ée]rique/i,
    ],
  },
  {
    topic: "microsoft-365",
    label: "Microsoft 365 et add-ins",
    patterns: [
      /microsoft\s*365/i,
      /\bm365\b/i,
      /\boutlook\b/i,
      /\bteams\b/i,
      /add-?in/i,
      /office\.js/i,
      /copilot\s+(pour|for)\s+(microsoft|m365|office|word|excel)/i,
      /sharepoint\s+(ia|ai|search|index)/i,
    ],
  },
  {
    topic: "automation",
    label: "Automatisation et workflows IA",
    patterns: [
      /power\s*automate/i,
      /power\s*apps/i,
      /power\s*platform/i,
      /workflow.*ia/i,
      /ia.*workflow/i,
      /automatis.*workflow/i,
      /workflow.*automatis/i,
      /\brpa\b/i,
      /no-?code.*ia/i,
      /low-?code.*ia/i,
    ],
  },
  {
    topic: "rag-architecture",
    label: "RAG, embeddings et architecture IA",
    patterns: [
      /\brag\b/i,
      /retrieval/i,
      /vector/i,
      /embedding/i,
      /fine-?tuning/i,
      /guardrail/i,
      /hallucin/i,
      /chunking/i,
      /re-?rank/i,
      /index.*s[ée]mantique/i,
    ],
  },
  {
    topic: "prompt-engineering",
    label: "Prompt engineering et qualité LLM",
    patterns: [
      /prompt\s*engineering/i,
      /system\s*prompt/i,
      /chain[- ]of[- ]thought/i,
      /few[- ]shot/i,
      /zero[- ]shot/i,
      /\bllm\b.*qualit/i,
      /qualit.*\bllm\b/i,
      /\bllm\b.*[ée]valua/i,
      /[ée]valua.*\bllm\b/i,
      /jeux?\s+de\s+tests?\s+(?:ia|llm|prompt)/i,
      /scoring.*(?:ia|llm)/i,
    ],
  },
  {
    topic: "cloud-infra",
    label: "Infrastructure cloud et Azure AI",
    patterns: [
      /azure\s*open\s*ai/i,
      /azure\s*ai/i,
      /azure\s*cognitive/i,
      /\brbac\b/i,
      /infrastructure.*(?:ia|ai|cloud)/i,
      /(?:ia|ai|cloud).*infrastructure/i,
      /\baks\b/i,
      /conteneur.*(?:ia|ai)/i,
      /(?:ia|ai).*conteneur/i,
      /api\s*management/i,
      /\bgpu\b/i,
    ],
  },
  {
    topic: "governance",
    label: "Gouvernance et politique IA",
    patterns: [
      /gouvernance\s*(?:ia|ai|donn)/i,
      /politique\s*(?:ia|ai|usage)/i,
      /charte\s*(?:ia|ai)/i,
      /comit[ée]\s*(?:ia|ai|[ée]thique)/i,
      /[ée]thique\s*(?:ia|ai)/i,
      /regulat.*(?:ia|ai)/i,
      /(?:ia|ai).*regulat/i,
      /ai\s*act/i,
      /usage\s*responsable/i,
    ],
  },
  {
    topic: "adoption-roi",
    label: "Adoption IA et ROI",
    patterns: [
      /adoption\s*(?:ia|ai)/i,
      /(?:ia|ai)\s*adoption/i,
      /\broi\b.*(?:ia|ai)/i,
      /(?:ia|ai).*\broi\b/i,
      /conduite\s+du\s+changement/i,
      /change\s*management/i,
      /transformation\s*(?:num[ée]rique|digitale)/i,
      /feuille\s+de\s+route\s+(?:ia|ai)/i,
      /strat[ée]gie\s+(?:ia|ai)/i,
    ],
  },
  {
    topic: "copilot",
    label: "Copilot, assistants et agents IA",
    patterns: [
      /\bcopilot\b/i,
      /assistant\s*(?:ia|ai|virtuel|intelligent)/i,
      /(?:ia|ai)\s*assistant/i,
      /agent\s*(?:ia|ai|intelligent|autonome)/i,
      /(?:ia|ai)\s*agent/i,
      /chatbot/i,
      /multi[- ]agent/i,
      /\bagentic\b/i,
    ],
  },
  {
    topic: "data-analytics",
    label: "IA pour l'analyse de données et BI",
    patterns: [
      /power\s*bi/i,
      /tableau\s+de\s+bord/i,
      /business\s*intelligence/i,
      /\bbi\b.*(?:ia|ai)/i,
      /(?:ia|ai).*\bbi\b/i,
      /analyse\s+(?:donn[ée]es|pr[ée]dictive)/i,
      /pr[ée]di[ct].*(?:ia|ai|analytics)/i,
      /data\s*(?:lake|warehouse|pipeline)/i,
      /machine\s*learning/i,
      /\bml\b.*(?:mod[eè]l|pipeline|deploy)/i,
    ],
  },
  {
    topic: "cybersecurity-ai",
    label: "Cybersécurité et IA",
    patterns: [
      /cybers[ée]cu/i,
      /s[ée]curit[ée]\s*(?:ia|ai|informatique)/i,
      /(?:ia|ai).*s[ée]curit[ée]/i,
      /d[ée]tection\s*(?:menace|intrusion|anomalie)/i,
      /menace.*(?:ia|ai)/i,
      /soc\b.*(?:ia|ai)/i,
      /zero\s*trust/i,
      /phishing.*(?:ia|ai)/i,
      /(?:ia|ai).*phishing/i,
    ],
  },
  {
    topic: "sector-use-cases",
    label: "Cas d'usage sectoriels (santé, finance, industrie, RH)",
    patterns: [
      /cas\s+d['']usage/i,
      /sant[ée].*(?:ia|ai)/i,
      /(?:ia|ai).*sant[ée]/i,
      /finance.*(?:ia|ai)/i,
      /(?:ia|ai).*finance/i,
      /industri.*(?:ia|ai|4\.0)/i,
      /(?:ia|ai).*industri/i,
      /\brh\b.*(?:ia|ai)/i,
      /(?:ia|ai).*\brh\b/i,
      /logistique.*(?:ia|ai)/i,
      /(?:ia|ai).*logistique/i,
      /juridique.*(?:ia|ai)/i,
      /(?:ia|ai).*juridique/i,
    ],
  },
  {
    topic: "general",
    label: "Général",
    patterns: [/.*/],
  },
];

function loadJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function saveJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function isoDateToday() {
  const forced = process.env.FORCE_DATE;
  if (forced && /^\d{4}-\d{2}-\d{2}$/.test(forced)) return forced;
  return new Date().toISOString().slice(0, 10);
}

function hasUnnecessaryCaps(input) {
  if (!input || typeof input !== "string") return false;
  const tokens = input.split(/\s+/);
  for (const token of tokens) {
    if (!token) continue;
    const letters = token.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, "");
    if (letters.length <= 3) continue;
    const upper = letters.toUpperCase();
    if (letters === upper) {
      return true;
    }
  }
  return false;
}

/**
 * Detects untranslated payloads by comparing title, description and content
 * against the canonical article.
 */
function isDuplicateTranslation(localized, canonical) {
  if (!localized || !canonical) return false;
  const sameTitle = (localized.title || "") === (canonical.title || "");
  const sameDesc =
    (localized.description || "") === (canonical.description || "");
  const sameContent = (localized.content || "") === (canonical.content || "");
  return sameTitle && sameDesc && sameContent;
}

function detectTopic(article) {
  if (!article) return "general";
  const base = `${article.slug || ""} ${article.title || ""} ${
    article.description || ""
  }`.toLowerCase();
  for (const entry of TOPIC_KEYWORDS) {
    if (entry.patterns.some((rx) => rx.test(base))) {
      return entry.topic;
    }
  }
  return "general";
}

function describeTopic(topic) {
  const entry = TOPIC_KEYWORDS.find((t) => t.topic === topic);
  return entry ? entry.label : "Thème général";
}

function normalizeBrandCaseInText(input) {
  if (typeof input !== "string" || !input) return input;
  // Keep brand usage consistent with site conventions: "houle" lowercase.
  return input
    .replace(/\bHoule\.ai\b/g, "houle.ai")
    .replace(/\bHoule\b/g, BRAND_NAME);
}

function normalizeBrandCaseInArticle(article) {
  if (!article || typeof article !== "object") return;
  if (typeof article.title === "string") article.title = normalizeBrandCaseInText(article.title);
  if (typeof article.description === "string")
    article.description = normalizeBrandCaseInText(article.description);
  if (typeof article.content === "string") article.content = normalizeBrandCaseInText(article.content);
}

function assertNoForbiddenTermsInText(text, where = "text") {
  // No-op: brand-specific term blocking was removed.
  // Content validation is handled by the forbidden business topics checker below.
}

function assertNoForbiddenTermsInArticle(article, where = "article") {
  if (!article || typeof article !== "object") return;
  assertNoForbiddenTermsInText(article.title || "", `${where}.title`);
  assertNoForbiddenTermsInText(article.description || "", `${where}.description`);
  assertNoForbiddenTermsInText(article.content || "", `${where}.content`);
}

/**
 * Validates that an article is AI/technology-related and not about general
 * business topics like accounting, VAT, or fiduciary services.
 * 
 * This validation ensures houle.ai content stays focused on AI and Microsoft 365
 * solutions, not general business services (which are offered by ark-fid.ch).
 * 
 * @param {Object} article - The article to validate (must have slug, title, description)
 * @param {string} where - Context string for error messages
 * @throws {Error} If article appears to be about forbidden non-AI business topics
 */
function assertAIRelatedTopic(article, where = "article") {
  if (!article || typeof article !== "object") return;

  // Combine slug, title, and description for analysis
  const textToCheck = `${article.slug || ""} ${article.title || ""} ${article.description || ""}`.toLowerCase();

  // Define forbidden business terms (Swiss business topics unrelated to AI)
  const forbiddenTerms = [
    // Accounting & bookkeeping (without AI context)
    { pattern: /\bcomptabilit[ée]\b/i, label: "comptabilité", aiContext: /(ia|ai|intelligence artificielle|automatiser|automatisation|gpt|llm|assistant)/i },
    { pattern: /\btenue\s+de\s+livres?\b/i, label: "tenue de livres", aiContext: /(ia|ai|intelligence artificielle|automatiser|automatisation|gpt|llm)/i },
    { pattern: /\bcomptable\b/i, label: "comptable", aiContext: /(ia|ai|intelligence artificielle|automatiser|automatisation|assistant|gpt|llm)/i },
    
    // VAT/TVA (without AI context)
    { pattern: /\btva\b/i, label: "TVA", aiContext: /(ia|ai|intelligence artificielle|automatiser|automatisation|gpt|llm|assistant)/i },
    { pattern: /\btaxe\s+sur\s+la\s+valeur\s+ajout[ée]e\b/i, label: "taxe sur la valeur ajoutée", aiContext: /(ia|ai|intelligence artificielle|automatiser)/i },
    { pattern: /\bd[ée]claration\s+de\s+tva\b/i, label: "déclaration de TVA", aiContext: /(ia|ai|automatiser|automatisation)/i },
    
    // Fiduciary services (without AI context)
    { pattern: /\bfiduciaire\b/i, label: "fiduciaire", aiContext: /(ia|ai|intelligence artificielle|microsoft\s*365|automatisation|add-in|assistant)/i },
    { pattern: /\bservices\s+fiduciaires\b/i, label: "services fiduciaires", aiContext: /(ia|ai|automatisation)/i },
    
    // Payroll & social insurance (without AI context)
    { pattern: /\bsalaires?\b/i, label: "salaire", aiContext: /(ia|ai|intelligence artificielle|automatiser|automatisation|gpt|llm)/i },
    { pattern: /\bpaie\b/i, label: "paie", aiContext: /(ia|ai|intelligence artificielle|automatiser|automatisation|gpt|llm)/i },
    { pattern: /\bavs\b/i, label: "AVS", aiContext: /(ia|ai|intelligence artificielle|automatiser|automatisation)/i },
    { pattern: /\blaa\b/i, label: "LAA", aiContext: /(ia|ai|intelligence artificielle|automatiser|automatisation)/i },
    { pattern: /\blpp\b/i, label: "LPP", aiContext: /(ia|ai|intelligence artificielle|automatiser|automatisation)/i },
    { pattern: /\bassurances?\s+sociales?\b/i, label: "assurances sociales", aiContext: /(ia|ai|automatiser|automatisation)/i },
    
    // Corporate structure (without AI/tech context)
    { pattern: /\bcr[ée]ation\s+d'entreprise\b/i, label: "création d'entreprise", aiContext: /(ia|ai|microsoft|saas|cloud|technologie)/i },
    { pattern: /\bdomiciliation\b/i, label: "domiciliation", aiContext: /(cloud|azure|infrastructure)/i },
    
    // Generic legal/tax (without AI context)
    { pattern: /\bconseils?\s+fiscaux?\b/i, label: "conseil fiscal", aiContext: /(ia|ai|automatisation|technologie)/i },
    { pattern: /\bconseils?\s+juridiques?\b/i, label: "conseil juridique", aiContext: /(ia|ai|technologie|conformit[ée]\s+ia|nlpd|rgpd.*ia)/i },
    { pattern: /\boptimisation\s+fiscale\b/i, label: "optimisation fiscale", aiContext: /(ia|ai|automatisation)/i },
  ];

  // Check each forbidden term
  for (const term of forbiddenTerms) {
    if (term.pattern.test(textToCheck)) {
      // Term found - check if it's in an AI/tech context
      if (!term.aiContext.test(textToCheck)) {
        const err = new Error(
          `Article hors sujet détecté dans ${where}: le terme "${term.label}" est présent sans contexte IA/technologie. ` +
          `houle.ai est focalisé sur les solutions IA pour Microsoft 365, pas sur les services d'affaires généraux. ` +
          `Si l'article concerne l'automatisation IA de processus ${term.label}, assurez-vous que le contexte IA est clair dans le slug, titre et description.`
        );
        err.code = "OFF_TOPIC_ARTICLE";
        err.forbiddenTerm = term.label;
        err.slug = article.slug;
        err.title = article.title;
        throw err;
      }
    }
  }

  // Additional check: ensure at least SOME AI/tech related terms are present
  const aiTechTerms = /(ia|ai|intelligence artificielle|microsoft\s*365|m365|outlook|word|teams|add-in|gpt|llm|openai|azure|automatisation|assistant|rag|vector|embedding|prompt)/i;
  if (!aiTechTerms.test(textToCheck)) {
    const err = new Error(
      `Article potentiellement hors sujet dans ${where}: aucun terme lié à l'IA ou Microsoft 365 détecté. ` +
      `houle.ai doit se concentrer exclusivement sur l'IA et Microsoft 365. ` +
      `Slug: "${article.slug}", Titre: "${article.title}"`
    );
    err.code = "MISSING_AI_CONTEXT";
    err.slug = article.slug;
    err.title = article.title;
    throw err;
  }
}

function getLastArticle(frData) {
  const articles = Array.isArray(frData?.Articles) ? frData.Articles : [];
  if (!articles.length) return null;
  const sorted = [...articles].sort((a, b) =>
    (a.date || "").localeCompare(b.date || ""),
  );
  return sorted[sorted.length - 1];
}

/**
 * Analyze recent topic distribution and suggest underrepresented topics.
 * This ensures we don't keep writing about the same topics repeatedly.
 */
function analyzeRecentTopics(frData, recentCount = 15) {
  const articles = Array.isArray(frData?.Articles) ? frData.Articles : [];
  const sorted = [...articles].sort((a, b) =>
    (b.date || "").localeCompare(a.date || ""),
  );
  const recent = sorted.slice(0, recentCount);

  // Count topics in recent articles
  const topicCounts = {};
  for (const topic of TOPIC_KEYWORDS) {
    topicCounts[topic.topic] = 0;
  }
  topicCounts["general"] = 0;

  for (const article of recent) {
    const topic = detectTopic(article);
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  }

  // Find overrepresented topics (more than 2 articles in last 15)
  const overrepresented = [];
  for (const [topic, count] of Object.entries(topicCounts)) {
    if (count >= 2 && topic !== "general") {
      overrepresented.push({ topic, count, label: describeTopic(topic) });
    }
  }

  // Find underrepresented topics (0-1 articles in last 15)
  const underrepresented = TOPIC_KEYWORDS.filter(
    (t) => (topicCounts[t.topic] || 0) <= 1,
  ).map((t) => t.label);

  // Get last 3 topics to avoid immediate repetition (with 12 categories, 3 is sufficient)
  const lastThreeTopics = recent.slice(0, 3).map((a) => detectTopic(a));

  return {
    topicCounts,
    overrepresented,
    underrepresented,
    lastFiveTopics: lastThreeTopics,
    avoidTopics: [...new Set(lastThreeTopics.filter((t) => t !== "general"))],
  };
}

/**
 * Compute suggested topic labels for the AI prompt, always returning at least
 * one positive suggestion even when all categories are saturated.
 *
 * @param {string[]} underrepresented - Labels of underrepresented topics from analyzeRecentTopics
 * @param {string[]} avoidTopics - Topic keys to soft-avoid (e.g. last-5 topics)
 * @param {string[]} blockedCategories - Topic keys strictly blocked for this retry
 * @returns {string[]} List of topic labels to include as positive suggestions
 */
function computeSuggestedTopics(underrepresented, avoidTopics, blockedCategories) {
  if (underrepresented.length > 0) return underrepresented.slice(0, 4);

  // All topics are saturated – provide fallback suggestions so the AI always has
  // a concrete positive target rather than only "avoid everything" guidance.
  const allBlocked = new Set([...avoidTopics, ...blockedCategories]);
  const fallback = TOPIC_KEYWORDS
    .filter((t) => t.topic !== "general" && !allBlocked.has(t.topic))
    .map((t) => t.label);
  if (fallback.length > 0) return fallback.slice(0, 4);

  // Last resort: suggest categories not in the strict per-retry block list
  return TOPIC_KEYWORDS
    .filter((t) => t.topic !== "general" && !blockedCategories.includes(t.topic))
    .map((t) => t.label)
    .slice(0, 3);
}

function buildSystemPrompt(frJson, trendData = null) {
  const today = isoDateToday();
  const twelveMonthsAgo = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 12);
    return d.toISOString().slice(0, 10);
  })();
  const lastArticle = getLastArticle(frJson);
  const lastTopic = detectTopic(lastArticle);
  const minWords = parseInt(process.env.SEO_MIN_WORDS || "800", 10);
  const maxWords = parseInt(process.env.SEO_MAX_WORDS || "3000", 10);
  const lengthGuidance = process.env.SEO_MIN_WORDS
    ? `- Longueur MINIMALE: ${minWords} mots (objectif ${Math.max(minWords, 1500)} à ${Math.max(Math.max(minWords, 1500), maxWords)}). Si tu es en dessous, ajoute des sections (checklist, FAQ, exemples chiffrés, cas cantonaux, cas pratiques).`
    : "- Article format pratique (800 à 1500 mots), structuré avec sections claires, listes, exemples chiffrés.";
  const longFormRequirements =
    process.env.SEO_MIN_WORDS && minWords >= 1500
      ? [
          "- OBLIGATOIRE (pour atteindre la longueur): au moins 10 sections H2, plusieurs H3, 2 checklists, 2 tableaux, 1 cas pratique chiffré (CHF) et une FAQ de 6 questions.",
          "- OBLIGATOIRE: inclure une section 'processus étape-par-étape' et une section 'erreurs fréquentes + corrections'.",
        ]
      : [];
  const recentSlugs = (Array.isArray(frJson.Articles) ? frJson.Articles : [])
    .slice(-12)
    .map((a) => a.slug)
    .filter(Boolean);

  // Analyze topic distribution for better variety
  const topicAnalysis = analyzeRecentTopics(frJson, 15);

  // Build topic guidance based on analysis
  const blockedCategories = Array.isArray(trendData?.blockedCategories) ? trendData.blockedCategories : [];
  const avoidTopicsLabels = [...new Set([...topicAnalysis.avoidTopics, ...blockedCategories])].map(describeTopic);
  const suggestedTopics = computeSuggestedTopics(
    topicAnalysis.underrepresented,
    topicAnalysis.avoidTopics,
    blockedCategories,
  );

  const topicNote = lastArticle
    ? `Dernier article publié le ${lastArticle.date}: "${
        lastArticle.title
      }". Thème identifié: ${describeTopic(
        lastTopic,
      )}. Choisis un nouveau sujet CLAIREMENT DIFFÉRENT pour maintenir l'alternance éditoriale.`
    : "Aucun article récent identifié. Choisis un sujet à forte valeur pour dirigeants PME genevois.";

  // Build topic diversity guidance
  const diversityGuidance = [];
  if (avoidTopicsLabels.length > 0) {
    diversityGuidance.push(
      `⚠️ THÈMES À ÉVITER (traités récemment dans les 5 derniers articles): ${avoidTopicsLabels.join(", ")}.`,
    );
  }
  if (suggestedTopics.length > 0) {
    diversityGuidance.push(
      `✅ THÈMES SUGGÉRÉS (peu couverts récemment, à privilégier): ${suggestedTopics.join(", ")}.`,
    );
  }
  if (topicAnalysis.overrepresented.length > 0) {
    const overLabels = topicAnalysis.overrepresented.map(
      (t) => `${t.label} (${t.count} articles)`,
    );
    diversityGuidance.push(
      `📊 Thèmes surreprésentés (éviter absolument): ${overLabels.join(", ")}.`,
    );
  }

  // Build trend-based keyword guidance
  const trendGuidance = [];
  if (trendData && trendData.selectedTopic) {
    const { suggestedTopic, keywords, outline, category } =
      trendData.selectedTopic;
    trendGuidance.push(
      "",
      "=== SIGNAUX TENDANCE SEO (à intégrer si pertinent) ===",
      `📈 Sujet suggéré par tendance: "${suggestedTopic}"`,
      `🔑 Mots-clés SEO cibles: ${keywords.join(", ")}`,
    );
    if (outline && outline.length > 0) {
      trendGuidance.push(`📋 Plan suggéré: ${outline.join(" → ")}`);
    }
    if (category) {
      trendGuidance.push(`📁 Catégorie thématique: ${category}`);
    }
    if (trendData.usedFallback) {
      trendGuidance.push(
        "ℹ️ (Sujet basé sur liste evergreen - tendances indisponibles)",
      );
    }
    trendGuidance.push(
      "",
      "⚠️ IMPORTANT: Intègre ces mots-clés naturellement dans le titre, la description et le contenu pour optimiser le SEO.",
      "⚠️ Le sujet suggéré est une indication, adapte-le selon nos services IA et Microsoft 365.",
    );
  }

  return [
    `Tu es un assistant éditorial SEO expert pour ${BRAND_NAME}.ai (Suisse).`,
    `Date actuelle: ${today}. Privilégie des sources publiées ou mises à jour entre ${twelveMonthsAgo} et ${today}. Les sources officielles et techniques stables (fedlex.admin.ch, edoeb.admin.ch, ch.ch, nist.gov, learn.microsoft.com, azure.microsoft.com) peuvent être plus anciennes si elles restent valables.`,
    topicNote,
    "",
    "=== DIVERSITÉ THÉMATIQUE (CRITIQUE) ===",
    ...diversityGuidance,
    ...trendGuidance,
    "",
    "Objectif: proposer EXACTEMENT 1 nouvel article (section « Articles ») en français, utile pour des décideurs IT/produit, équipes conformité et dirigeants d'entreprises en Suisse.",
    "",
    "Contraintes impératives:",
    "- FOCUS sur du concret: checklists, erreurs fréquentes + correctifs, étapes de mise en œuvre, matrices de décision, exemples de gouvernance.",
    `- INTERDIT: mentionner Microsoft Copilot / M365 Copilot. N'écris pas le mot \"Copilot\".`,
    `- La marque doit être en minuscules: écris toujours \"${BRAND_NAME}\" (jamais \"Houle\").`,
    "- Sujet cohérent avec nos services (liste ci-dessous) et différent des articles récents.",
    "- Aucun doublon de slug, ni de sujet déjà traité récemment.",
    "",
    "=== SUJETS INTERDITS (CRITIQUE - NE JAMAIS ÉCRIRE SUR CES THÈMES) ===",
    "❌ INTERDIT: Comptabilité générale, tenue de livres, services comptables (sauf si explicitement lié à l'automatisation IA de la comptabilité)",
    "❌ INTERDIT: TVA / déclaration de TVA / compliance TVA (sauf si explicitement lié à l'automatisation IA des processus TVA)",
    "❌ INTERDIT: Services fiduciaires généraux non liés à l'IA ou à Microsoft 365",
    "❌ INTERDIT: Gestion de la paie, calcul des salaires (sauf si explicitement lié à l'automatisation IA)",
    "❌ INTERDIT: AVS, LAA, LPP, assurances sociales suisses (sauf si explicitement dans un contexte d'automatisation IA)",
    "❌ INTERDIT: Création d'entreprise (SA, Sàrl, etc.) et structure corporative générale",
    "❌ INTERDIT: Conseils fiscaux généraux, optimisation fiscale sans lien avec l'IA",
    "❌ INTERDIT: Conseils juridiques généraux sans rapport avec l'IA, la conformité IA, ou Microsoft 365",
    "❌ INTERDIT: Domiciliation d'entreprise, audit financier traditionnel",
    "❌ INTERDIT: Réglementations commerciales suisses générales non liées à l'IA ou à la protection des données",
    "",
    "⚠️ IMPORTANT: houle.ai est focalisé EXCLUSIVEMENT sur l'IA et Microsoft 365.",
    "⚠️ Les services d'affaires généraux (comptabilité, TVA, fiduciaire) sont offerts par ark-fid.ch.",
    "⚠️ Si un sujet semble proche d'un thème interdit, assure-toi qu'il est CLAIREMENT lié à l'IA, à Microsoft 365, ou à l'automatisation technologique.",
    "",
    lengthGuidance,
    ...longFormRequirements,
    "- Style professionnel, humain, sans capitales superflues. Évite les tics d'écriture IA (\"Moreover\", \"Furthermore\", répétitions).",
    "- Références: fournis 4 à 6 liens vérifiables (HTTP 200, pas de login), sans URL inventée.",
    "- Références: inclure au moins 1 source officielle/réglementaire (fedlex.admin.ch, edoeb.admin.ch, admin.ch, nist.gov).",
    "- Références: inclure au moins 1 source technique (learn.microsoft.com / github.com).",
    "- STRICT: 1 domaine = 1 lien (pas de doublons de domaine).",
    `Slugs récents à éviter: ${recentSlugs.join(", ") || "aucun"}.`,
    `Services à promouvoir: ${SERVICES.join(", ")}.`,
    "",
    "Format de sortie STRICT (application/json):",
    "{",
    '  "newArticle": {',
    '    "slug": "<slug-unique-fr>",',
    '    "title": "<titre FR>",',
    '    "description": "<description FR>",',
    '    "content": "<contenu FR complet (Markdown autorisé)>",',
    `    "author": ${JSON.stringify(AUTHOR_NAME)},`,
    '    "date": "YYYY-MM-DD",',
    '    "references": [ { "labelKey": "Libellé FR", "url": "https://..." }, ... ]',
    "  },",
    '  "newLabels": {',
    '    "Libellé FR": "Texte à afficher (FR)"',
    "  }",
    "}",
  ].join("\n");
}

function buildTranslatePrompt(newArticle, newLabels) {
  return [
    "Tu es traducteur professionnel. Traduis les champs ci-dessous en conservant les structures, slugs, URLs et clés.",
    `Garde ${JSON.stringify(AUTHOR_NAME)} tel quel.`,
    `La marque doit être en minuscules: écris toujours "${BRAND_NAME}" (jamais "Houle").`,
    `INTERDIT: mentionner Microsoft Copilot / M365 Copilot. N'écris pas le mot "Copilot".`,
    "Fourni uniquement le JSON demandé, sans commentaire.",
    "IMPORTANT: Chaque locale (en, de, es, pt) doit être traduite. Ne retourne jamais le texte français pour une autre langue.",
    "",
    "Format attendu:",
    "{",
    '  "en": { "Article": { "title": "...", "description": "...", "content": "..." }, "labels": { "Libellé FR": "English label" } },',
    '  "de": { "Article": { ... }, "labels": { ... } },',
    '  "es": { "Article": { ... }, "labels": { ... } },',
    '  "pt": { "Article": { ... }, "labels": { ... } }',
    "}",
    "",
    "Entrée source:",
    JSON.stringify({ newArticle, newLabels }, null, 2),
  ].join("\n");
}

function buildResearchPrompt(frJson, trendData, seoSuggestions) {
  const today = isoDateToday();
  const twelveMonthsAgo = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 12);
    return d.toISOString().slice(0, 10);
  })();

  const topicAnalysis = analyzeRecentTopics(frJson, 15);
  const blockedCategories = Array.isArray(trendData?.blockedCategories) ? trendData.blockedCategories : [];
  const avoidTopicsLabels = [...new Set([...topicAnalysis.avoidTopics, ...blockedCategories])].map(describeTopic);
  const suggestedTopics = computeSuggestedTopics(
    topicAnalysis.underrepresented,
    topicAnalysis.avoidTopics,
    blockedCategories,
  );

  const recentSlugs = (Array.isArray(frJson.Articles) ? frJson.Articles : [])
    .slice(-12)
    .map((a) => a.slug)
    .filter(Boolean);

  const minWords = parseInt(process.env.SEO_MIN_WORDS || "800", 10);
  const maxWords = parseInt(process.env.SEO_MAX_WORDS || "3000", 10);

  const trendGuidance = [];
  if (trendData && trendData.selectedTopic) {
    const { suggestedTopic, keywords, outline, category } =
      trendData.selectedTopic;
    trendGuidance.push(
      "",
      "=== SIGNAUX TENDANCE SEO (à intégrer si pertinent) ===",
      `📈 Sujet suggéré par tendance: "${suggestedTopic}"`,
      `🔑 Mots-clés SEO cibles: ${Array.isArray(keywords) ? keywords.join(", ") : ""}`,
    );
    if (outline && outline.length > 0) {
      trendGuidance.push(`📋 Plan suggéré: ${outline.join(" → ")}`);
    }
    if (category) {
      trendGuidance.push(`📁 Catégorie thématique: ${category}`);
    }
  }

  return [
    `Tu es un stratège SEO + chercheur web pour ${BRAND_NAME}.ai (Suisse).`,
    `Date actuelle: ${today}. Privilégie des sources publiées ou mises à jour entre ${twelveMonthsAgo} et ${today}. Les sources stables (fedlex.admin.ch, edoeb.admin.ch, ch.ch, nist.gov, learn.microsoft.com, github.com) peuvent être plus anciennes si elles restent valables.`,
    "",
    "=== DIVERSITÉ THÉMATIQUE (CRITIQUE) ===",
    avoidTopicsLabels.length
      ? `⚠️ THÈMES À ÉVITER: ${avoidTopicsLabels.join(", ")}.`
      : "",
    suggestedTopics.length
      ? `✅ THÈMES SUGGÉRÉS: ${suggestedTopics.join(", ")}.`
      : "",
    ...trendGuidance,
    "",
    "Objectif: proposer 1 sujet + plan + références vérifiables (PAS l'article complet).",
    "",
    "Contraintes:",
    "- Sujet cohérent avec nos services (liste ci-dessous) et différent des articles récents.",
    `- INTERDIT: mentionner Microsoft Copilot / M365 Copilot. N'écris pas le mot \"Copilot\".`,
    `- La marque doit être en minuscules: écris toujours \"${BRAND_NAME}\" (jamais \"Houle\").`,
    "",
    "=== SUJETS INTERDITS (CRITIQUE - TOUS LES ARTICLES DOIVENT ÊTRE LIÉS À L'IA / MICROSOFT 365) ===",
    "❌ NE JAMAIS proposer de sujets sur: comptabilité générale, TVA/déclaration TVA, services fiduciaires, gestion de paie, AVS/LAA/LPP, création d'entreprise (SA/Sàrl), conseils fiscaux généraux, conseils juridiques généraux, domiciliation, audit financier traditionnel.",
    "❌ Ces sujets sont hors du scope de houle.ai (qui est focalisé IA + Microsoft 365).",
    "✅ TOUS les sujets proposés DOIVENT être clairement liés à: IA, Microsoft 365, automatisation avec IA, Azure OpenAI, add-ins Office, GPT, LLM, RAG, conformité IA (nLPD/RGPD), ou technologies IA.",
    "✅ Si un processus métier (ex: comptabilité) est mentionné, il DOIT être dans le contexte de son automatisation par IA.",
    "",
    `- L'article final fera ${Math.max(minWords, 1500)} à ${Math.max(Math.max(minWords, 1500), maxWords)} mots.`,
    "- Références: fournir 8 à 12 liens vérifiables (HTTP 200, pas de login), sans URL inventée.",
    "- Références: inclure au moins 2 sources officielles/réglementaires (fedlex.admin.ch, edoeb.admin.ch, nist.gov, admin.ch).",
    "- Références: inclure au moins 2 sources techniques (learn.microsoft.com, github.com, docs officiels).",
    "- Références: compléter avec des sources institutionnelles (associations, standards, universités) et éventuellement médias économiques si accessible sans paywall.",
    "- STRICT: chaque référence doit provenir d'un domaine différent (1 domaine = 1 lien). Si tu donnes 12 références, ce sont 12 domaines distincts, sinon la réponse est rejetée.",
    `Slugs récents à éviter: ${recentSlugs.join(", ") || "aucun"}.`,
    `Services à promouvoir: ${SERVICES.join(", ")}.`,
    "",
    seoSuggestions?.primaryKeyword
      ? `Mot-clé principal à viser: ${seoSuggestions.primaryKeyword}`
      : "",
    "",
    "Format de sortie STRICT (application/json):",
    "{",
    '  "research": {',
    '    "slug": "<slug-unique-fr>",',
    '    "title": "<titre FR>",',
    '    "description": "<description FR>",',
    '    "category": "<private-ai|microsoft-365|automation|rag-architecture|prompt-engineering|cloud-infra|governance|adoption-roi|copilot|data-analytics|cybersecurity-ai|sector-use-cases|general>",',
    '    "primaryKeyword": "<mot-clé principal>",',
    '    "secondaryKeywords": ["..."],',
    '    "outline": ["H2 ...", "H2 ...", "FAQ ..."],',
    '    "references": [ { "labelKey": "Libellé FR", "url": "https://..." }, ... ]',
    "  }",
    "}",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildDraftPromptFromResearch(research, validatedReferences) {
  const minWords = parseInt(process.env.SEO_MIN_WORDS || "1500", 10);
  const maxWords = parseInt(process.env.SEO_MAX_WORDS || "3000", 10);
  return [
    `Tu es un rédacteur SEO senior pour ${BRAND_NAME}.ai (Suisse).`,
    "Rédige un article long, utile et concret, sans blabla.",
    "",
    `CONTRAINTE DE LONGUEUR (STRICTE): entre ${Math.max(minWords, 1500)} et ${Math.max(maxWords, Math.max(minWords, 1500))} mots (viser ~2200).`,
    "Si tu es en dessous du minimum, tu DOIS ajouter du contenu (plus de H2/H3, plus d'exemples). Ne termine pas tôt.",
    "Structure obligatoire: 10+ sections H2, plusieurs H3, 2 tableaux, 2 checklists, 1 cas pratique chiffré (CHF), une section étape-par-étape, une section erreurs fréquentes + corrections, et une FAQ de 6 questions.",
    "",
    "=== FOCUS IA ET MICROSOFT 365 (OBLIGATOIRE) ===",
    "⚠️ RAPPEL CRITIQUE: houle.ai est focalisé EXCLUSIVEMENT sur l'IA et Microsoft 365.",
    "✅ L'article DOIT clairement concerner: IA, assistants IA, Microsoft 365, Azure OpenAI, automatisation IA, add-ins Office, GPT, LLM, RAG, ou technologies IA.",
    "❌ NE PAS écrire sur: comptabilité générale, TVA, services fiduciaires, paie, conseils fiscaux/juridiques généraux sans lien clair avec l'IA.",
    "",
    "IMPORTANT:",
    `- INTERDIT: mentionner Microsoft Copilot / M365 Copilot. N'écris pas le mot \"Copilot\".`,
    `- La marque doit être en minuscules: écris toujours \"${BRAND_NAME}\" (jamais \"Houle\").`,
    "- N'invente AUCUN lien ni URL.",
    "- N'inclus AUCUNE URL dans le texte (pas de http/https).",
    "- Quand tu cites une source, écris simplement (source: <labelKey>).",
    "- Utilise exactement le slug, titre et description fournis.",
    "",
    "Plan à suivre:",
    JSON.stringify(research.outline || [], null, 2),
    "",
    "Références disponibles (ne pas modifier, ne pas ajouter):",
    JSON.stringify(validatedReferences, null, 2),
    "",
    "Format de sortie STRICT (application/json):",
    "{",
    '  "newArticle": {',
    `    "slug": ${JSON.stringify(research.slug)},`,
    `    "title": ${JSON.stringify(research.title)},`,
    `    "description": ${JSON.stringify(research.description)},`,
    '    "content": "<contenu FR complet en Markdown (sans URLs)>",',
    `    "author": ${JSON.stringify(AUTHOR_NAME)},`,
    '    "date": "YYYY-MM-DD",',
    '    "references": [ { "labelKey": "Libellé FR", "url": "https://..." }, ... ]',
    "  },",
    '  "newLabels": {',
    '    "Libellé FR": "Texte à afficher (FR)"',
    "  }",
    "}",
  ].join("\n");
}

function buildDraftRepairPromptFromExistingArticle(article, { mode, minWords, maxWords }) {
  const targetMin = Math.max(parseInt(minWords || "1500", 10) || 1500, 1500);
  const targetMax = Math.max(parseInt(maxWords || "3000", 10) || 3000, targetMin);
  const currentWords = countWords(article?.content || "");
  const action =
    mode === "expand"
      ? `Allonge le contenu pour dépasser ${targetMin} mots (objectif ~2200).`
      : `Raccourcis le contenu pour être sous ${targetMax} mots (objectif ~2200).`;

  return [
    `Tu es un rédacteur SEO senior pour ${BRAND_NAME}.ai (Suisse).`,
    action,
    "IMPORTANT:",
    "- Ne change PAS le slug, le titre, la description, l'auteur, la date.",
    "- Ne change PAS les références; garde exactement la même liste.",
    "- N'inclus AUCUNE URL dans le texte (pas de http/https).",
    `- INTERDIT: mentionner Microsoft Copilot / M365 Copilot. N'écris pas le mot \"Copilot\".`,
    `- La marque doit être en minuscules: écris toujours \"${BRAND_NAME}\" (jamais \"Houle\").`,
    " - Conserve la structure (H2/H3) et les éléments obligatoires (2 tableaux, 2 checklists, 1 cas pratique chiffré CHF, étape-par-étape, erreurs fréquentes + corrections, FAQ 6 questions).",
    `- Longueur STRICTE: ${targetMin} à ${targetMax} mots. Le texte actuel fait ~${currentWords} mots.`,
    "",
    "Voici l'article actuel (JSON):",
    JSON.stringify(
      {
        newArticle: {
          slug: article?.slug,
          title: article?.title,
          description: article?.description,
          content: article?.content,
          author: article?.author,
          date: article?.date,
          references: Array.isArray(article?.references) ? article.references : [],
        },
      },
      null,
      2,
    ),
    "",
    "Retourne STRICTEMENT un JSON de la forme:",
    "{",
    '  "newArticle": {',
    '    "slug": "...",',
    '    "title": "...",',
    '    "description": "...",',
    '    "content": "...",',
    `    "author": ${JSON.stringify(AUTHOR_NAME)},`,
    '    "date": "YYYY-MM-DD",',
    '    "references": [ { "labelKey": "...", "url": "https://..." }, ... ]',
    "  }",
    "}",
  ].join("\n");
}

function buildDraftAppendPromptFromExistingArticle(article, { minWords }) {
  const targetMin = Math.max(parseInt(minWords || "1500", 10) || 1500, 1500);
  const currentWords = countWords(article?.content || "");
  const missing = Math.max(0, targetMin - currentWords);
  const safetyBuffer = 250;
  const addAtLeast = Math.max(400, missing + safetyBuffer);
  return [
    `Tu es un rédacteur SEO senior pour ${BRAND_NAME}.ai (Suisse).`,
    "Objectif: compléter l'article EXISTANT en ajoutant du contenu UTILE (pas de blabla) pour dépasser le minimum de mots.",
    "",
    `Contrainte: ajoute au moins ${addAtLeast} mots (l'article actuel est ~${currentWords} mots, minimum requis: ${targetMin}).`,
    "IMPORTANT:",
    "- Ne modifie pas le texte existant: tu ajoutes uniquement de nouvelles sections à la fin.",
    "- Ajoute 2 à 4 nouvelles sections H2, avec des sous-sections H3 si utile.",
    "- Ajoute 1 checklist et 1 tableau dans les nouvelles sections.",
    "- Ajoute 3 à 5 questions de FAQ supplémentaires (si une FAQ existe déjà, continue-la).",
    "- N'inclus AUCUNE URL dans le texte (pas de http/https).",
    `- INTERDIT: mentionner Microsoft Copilot / M365 Copilot. N'écris pas le mot \"Copilot\".`,
    `- La marque doit être en minuscules: écris toujours \"${BRAND_NAME}\" (jamais \"Houle\").`,
    "- Quand tu cites une source, écris seulement (source: <labelKey>) et utilise uniquement des labelKey déjà présents dans les références de l'article.",
    "",
    "Article existant (à compléter):",
    JSON.stringify(
      {
        title: article?.title,
        description: article?.description,
        content: article?.content,
        references: Array.isArray(article?.references) ? article.references : [],
      },
      null,
      2,
    ),
    "",
    "Retourne STRICTEMENT un JSON de la forme:",
    "{",
    '  "appendContent": "<Markdown à ajouter à la fin>",',
    '  "newLabels": { "Libellé FR": "Texte à afficher (FR)" }',
    "}",
  ].join("\n");
}

function extractJsonFromText(raw) {
  if (!raw || typeof raw !== "string") {
    throw new Error("Empty Azure Agent response");
  }
  const fixBadJsonEscapes = (input) =>
    // Fix invalid escape sequences like "\_" or "\'" that frequently appear in
    // markdown-ish content inside JSON strings.
    input.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");
  const fixControlCharsInStrings = (input) => {
    // JSON does not allow raw control characters inside strings (notably newlines).
    // Some models emit JSON-like text with raw newlines within quoted strings.
    let out = "";
    let inString = false;
    let escaped = false;
    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      if (!inString) {
        if (ch === "\"") inString = true;
        out += ch;
        continue;
      }

      if (escaped) {
        escaped = false;
        out += ch;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        out += ch;
        continue;
      }
      if (ch === "\"") {
        inString = false;
        out += ch;
        continue;
      }

      const code = ch.charCodeAt(0);
      if (code === 0x0a) {
        out += "\\n";
        continue;
      }
      if (code === 0x0d) {
        out += "\\r";
        continue;
      }
      if (code === 0x09) {
        out += "\\t";
        continue;
      }
      if (code < 0x20) {
        out += `\\u${code.toString(16).padStart(4, "0")}`;
        continue;
      }
      out += ch;
    }
    return out;
  };
  const fixLenientJson = (input) =>
    fixControlCharsInStrings(fixBadJsonEscapes(input));
  try {
    return JSON.parse(raw);
  } catch (error) {
    try {
      return JSON.parse(fixLenientJson(raw));
    } catch {}
    // Look for fenced code block
    const fence = raw.match(/```(?:json)?\n([\s\S]*?)```/i);
    if (fence) {
      const inner = fence[1].trim();
      try {
        return JSON.parse(inner);
      } catch {
        return JSON.parse(fixLenientJson(inner));
      }
    }
    // Fallback to first JSON object
    const firstBrace = raw.indexOf("{");
    if (firstBrace !== -1) {
      let depth = 0;
      for (let i = firstBrace; i < raw.length; i++) {
        const ch = raw[i];
        if (ch === "{") depth++;
        else if (ch === "}") {
          depth--;
          if (depth === 0) {
            const candidate = raw.slice(firstBrace, i + 1);
            try {
              return JSON.parse(candidate);
            } catch {
              return JSON.parse(fixLenientJson(candidate));
            }
          }
        }
      }
    }
    throw error;
  }
}

/**
 * Legacy Azure agents use OpenAI-style IDs that start with "asst".
 */
function isLegacyAgentId(agentIdentifier) {
  return (
    typeof agentIdentifier === "string" && agentIdentifier.startsWith("asst")
  );
}

/**
 * Build a Responses API agent_reference payload from "name" or "name:version".
 * @param {string} agentName
 * @returns {{name: string, type: string, version?: string}}
 */
function buildAgentReference(agentName) {
  if (typeof agentName !== "string" || !agentName.trim()) {
    throw new Error("AZURE_AGENT_NAME must be a non-empty string");
  }
  const trimmedName = agentName.trim();
  const [name, version] = trimmedName.split(":", 2);
  if (!name) {
    throw new Error("AZURE_AGENT_NAME must include a name");
  }
  const agent = { name, type: "agent_reference" };
  if (version) {
    agent.version = version;
  }
  return agent;
}

async function listAgentsViaRest(credential) {
  if (typeof fetch !== "function") {
    return [];
  }

  const token = await credential.getToken("https://ai.azure.com/.default");
  if (!token?.token) {
    throw new Error("Failed to obtain Azure token for ai.azure.com scope");
  }

  const baseUrl = AZURE_AGENT_ENDPOINT.replace(/\/+$/, "");
  const url = `${baseUrl}/agents?api-version=${AZURE_AGENT_RESPONSES_API_VERSION}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token.token}` },
  });

  if (!response.ok) {
    throw new Error(
      `Foundry agents REST list failed: ${response.status} ${response.statusText}`,
    );
  }

  const payload = await response.json();
  const data = Array.isArray(payload?.data) ? payload.data : [];
  return data.map((agent) => ({
    id: agent.id,
    name: (agent.name || agent.id || "").trim(),
    version: agent.versions?.latest?.version,
  }));
}

async function listAgentVersionsViaRest(credential, agentId) {
  if (typeof fetch !== "function") {
    return [];
  }

  const token = await credential.getToken("https://ai.azure.com/.default");
  if (!token?.token) {
    throw new Error("Failed to obtain Azure token for ai.azure.com scope");
  }

  const baseUrl = AZURE_AGENT_ENDPOINT.replace(/\/+$/, "");
  const encoded = encodeURIComponent(agentId);
  const url = `${baseUrl}/agents/${encoded}/versions?api-version=${AZURE_AGENT_RESPONSES_API_VERSION}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token.token}` },
  });

  if (!response.ok) {
    throw new Error(
      `Foundry agent versions REST list failed: ${response.status} ${response.statusText}`,
    );
  }

  const payload = await response.json();
  const data = Array.isArray(payload?.data) ? payload.data : [];
  return data.map((version) => ({
    id: version.id,
    name: (version.name || "").trim(),
    version: version.version,
  }));
}

const agentReferenceCache = new Map();

async function resolveAgentReference(agentName, credential) {
  if (agentReferenceCache.has(agentName)) {
    return agentReferenceCache.get(agentName);
  }

  if (typeof agentName !== "string" || !agentName.trim()) {
    throw new Error("AZURE_AGENT_NAME must be a non-empty string");
  }

  const trimmed = agentName.trim();
  const [namePart, versionPart] = trimmed.split(":", 2);
  const candidates = await listAgentsViaRest(credential);
  const idMatch = candidates.find(
    (agent) => agent.id === trimmed || agent.id === namePart,
  );
  const nameMatches = candidates.filter(
    (agent) =>
      agent.name &&
      (agent.name === namePart ||
        agent.name.toLowerCase() === namePart.toLowerCase()),
  );

  let chosen = null;
  if (versionPart) {
    const target = nameMatches[0] || idMatch;
    if (!target) {
      const available =
        candidates
          .map((c) => `${c.name || "(unnamed)"} (${c.id})`)
          .join(", ") || "(none)";
      const err = new Error(
        `Agent "${trimmed}" not found in project. Available agents: ${available}`,
      );
      err.code = "AGENT_NOT_FOUND";
      throw err;
    }
    const versions = await listAgentVersionsViaRest(
      credential,
      target.id || target.name,
    );
    const versionMatch = versions.find(
      (agent) => `${agent.version || ""}` === `${versionPart}`,
    );
    if (!versionMatch) {
      const availableVersions = versions
        .map((v) => v.version)
        .filter(Boolean)
        .map((v) => `${v}`);
      const err = new Error(
        `Agent "${namePart}" found, but version "${versionPart}" does not match available versions: ${
          availableVersions.length ? availableVersions.join(", ") : "(unknown)"
        }`,
      );
      err.code = "AGENT_VERSION_NOT_FOUND";
      throw err;
    }
    chosen = { name: target.name, version: versionMatch.version };
  }

  if (!chosen) {
    chosen = nameMatches[0] || idMatch;
  }

  if (!chosen) {
    const available =
      candidates
        .map((c) => `${c.name || "(unnamed)"} (${c.id})`)
        .join(", ") || "(none)";
    const err = new Error(
      `Agent "${trimmed}" not found in project. Available agents: ${available}`,
    );
    err.code = "AGENT_NOT_FOUND";
    throw err;
  }

  const ref = { name: chosen.name, type: "agent_reference" };
  if (versionPart) {
    ref.version = versionPart;
  } else if (chosen.version) {
    ref.version = chosen.version;
  }

  agentReferenceCache.set(agentName, ref);
  return ref;
}

function extractResponseText(response) {
  if (!response || typeof response !== "object") return "";
  if (response.output_text) return response.output_text;
  let outputText = "";
  if (response.output) {
    if (typeof response.output === "string") {
      outputText = response.output;
    } else if (Array.isArray(response.output)) {
      for (const item of response.output) {
        if (item.type === "text" && item.text) {
          outputText =
            typeof item.text === "string" ? item.text : item.text.value || "";
        } else if (item.type === "message" && item.content) {
          for (const c of item.content) {
            if (c.type === "text" && c.text) {
              outputText =
                typeof c.text === "string" ? c.text : c.text.value || "";
            } else if (c.type === "output_text" && c.text) {
              outputText = c.text;
            }
          }
        }
      }
    } else if (response.output.content) {
      for (const c of response.output.content) {
        if (c.type === "text" && c.text) {
          outputText = typeof c.text === "string" ? c.text : c.text.value || "";
        } else if (c.type === "output_text" && c.text) {
          outputText = c.text;
        }
      }
    }
  }
  if (!outputText && response.choices?.[0]?.message?.content) {
    outputText = response.choices[0].message.content;
  }
  return outputText;
}

function sleep(ms) {
  if (!ms || ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getHeaderValue(headers, name) {
  if (!headers) return null;
  const lower = name.toLowerCase();
  if (typeof headers.get === "function") {
    return headers.get(name) || headers.get(lower) || null;
  }
  if (typeof headers === "object") {
    return headers[name] || headers[lower] || null;
  }
  return null;
}

function getRetryAfterMsFromError(error) {
  const headersCandidates = [
    error?.headers,
    error?.response?.headers,
    error?.res?.headers,
  ];
  for (const headers of headersCandidates) {
    const msRaw = getHeaderValue(headers, "x-ms-retry-after-ms");
    const ms = msRaw ? parseInt(`${msRaw}`, 10) : NaN;
    if (Number.isFinite(ms)) return Math.max(0, ms);

    const secRaw = getHeaderValue(headers, "retry-after");
    const sec = secRaw ? parseInt(`${secRaw}`, 10) : NaN;
    if (Number.isFinite(sec)) return Math.max(0, sec) * 1000;
  }
  return null;
}

function ensureHttpsUrl(input) {
  const raw = String(input || "").trim();
  if (!raw) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  return `https://${raw}`;
}

function buildAzureOpenAIChatUrlFor({ endpoint, deployment, apiVersion }) {
  if (!endpoint) throw new Error("Missing Azure OpenAI endpoint");
  let url = ensureHttpsUrl(String(endpoint).trim());
  if (!url) throw new Error("Missing Azure OpenAI endpoint");
  if (!deployment) throw new Error("Missing Azure OpenAI deployment");
  if (!apiVersion) throw new Error("Missing Azure OpenAI apiVersion");

  const u = new URL(url);
  const hasDeploymentPath = /\/openai\/deployments\//.test(u.pathname);
  const hasChatCompletions = /\/chat\/completions$/.test(u.pathname);

  if (hasDeploymentPath) {
    u.pathname = u.pathname.replace(
      /(\/openai\/deployments\/)([^\/]+)/,
      `$1${deployment}`,
    );
    if (!hasChatCompletions) {
      u.pathname = `${u.pathname.replace(/\/+$/, "")}/chat/completions`;
    }
  } else {
    u.pathname = `/openai/deployments/${deployment}/chat/completions`;
  }

  if (!u.searchParams.has("api-version")) {
    u.searchParams.set("api-version", apiVersion);
  }

  return u.toString();
}

async function azureOpenAIJson(prompt, options = {}) {
  const {
    endpoint = AZURE_OPENAI_ENDPOINT,
    deployment = AZURE_OPENAI_DEPLOYMENT,
    apiVersion = AZURE_OPENAI_API_VERSION,
    apiKey = AZURE_OPENAI_API_KEY,
    temperature = 0.2,
    topP = 0.9,
    maxTokens = null,
    system = "You are a professional assistant. Output ONLY a JSON object.",
  } = options;

  if (!apiKey) {
    throw new Error("Missing AZURE_OPENAI_API_KEY");
  }
  const url = buildAzureOpenAIChatUrlFor({
    endpoint,
    deployment,
    apiVersion,
  });
  const body = {
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    temperature,
    top_p: topP,
    response_format: { type: "json_object" },
    ...(maxTokens ? { max_tokens: maxTokens } : {}),
  };

  const maxRetries = parseInt(process.env.AZURE_OPENAI_RETRIES || "6", 10);
  const fetchTimeoutMs = parseInt(
    process.env.AZURE_OPENAI_FETCH_TIMEOUT_MS || "600000",
    10,
  ); // default 10 min — translations of long articles can exceed undici's 5 min headersTimeout
  let attempt = 0;
  while (true) {
    attempt += 1;
    let res;
    try {
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), fetchTimeoutMs);
      try {
        res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
          },
          body: JSON.stringify(body),
          signal: ac.signal,
        });
      } finally {
        clearTimeout(timer);
      }
    } catch (error) {
      const cause = error?.cause;
      const code = cause?.code || "";
      const isNetworkError =
        error?.name === "AbortError" ||
        code === "UND_ERR_HEADERS_TIMEOUT" ||
        code === "UND_ERR_CONNECT_TIMEOUT" ||
        code === "ECONNRESET" ||
        code === "ETIMEDOUT" ||
        code === "ENOTFOUND" ||
        /fetch failed|network|socket/i.test(error?.message || "");
      if (isNetworkError && attempt <= maxRetries) {
        const delay = Math.min(30000, 2000 * Math.pow(2, attempt - 1)) + Math.floor(Math.random() * 400);
        console.warn(
          `[WARN] Azure OpenAI network error (attempt ${attempt}/${maxRetries}): ${error?.message || "unknown"}. Retrying in ${delay}ms...`,
        );
        await sleep(delay);
        continue;
      }
      const details = [];
      if (cause?.code) details.push(`code=${cause.code}`);
      if (cause?.errno) details.push(`errno=${cause.errno}`);
      if (cause?.syscall) details.push(`syscall=${cause.syscall}`);
      if (cause?.address) details.push(`address=${cause.address}`);
      if (cause?.port) details.push(`port=${cause.port}`);
      const detailSuffix = details.length ? ` (${details.join(", ")})` : "";
      throw new Error(
        `Azure OpenAI fetch failed: ${error?.message || "unknown error"}${detailSuffix}`,
      );
    }
    const text = await res.text().catch(() => "");
    if (res.ok) {
      const parsed = JSON.parse(text);
      const content = parsed?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Azure OpenAI returned no content.");
      return extractJsonFromText(content);
    }
    const retryable = [408, 429, 500, 502, 503, 504];
    if (retryable.includes(res.status) && attempt <= maxRetries) {
      const retryAfterHeader = res.headers.get("retry-after");
      const retryAfterSeconds = retryAfterHeader
        ? parseInt(retryAfterHeader, 10)
        : NaN;
      const retryAfterMsHeader = res.headers.get("x-ms-retry-after-ms");
      const retryAfterMs = retryAfterMsHeader
        ? parseInt(retryAfterMsHeader, 10)
        : NaN;

      const serverDelayMs = Number.isFinite(retryAfterMs)
        ? Math.max(0, retryAfterMs)
        : Number.isFinite(retryAfterSeconds)
          ? Math.max(0, retryAfterSeconds) * 1000
          : null;
      const expBackoffMs = Math.min(30000, 2000 * Math.pow(2, attempt - 1));
      const jitterMs = Math.floor(Math.random() * 400);
      const delay = Math.max(serverDelayMs || 0, expBackoffMs + jitterMs);
      console.warn(
        `[WARN] Azure OpenAI HTTP ${res.status} (attempt ${attempt}/${maxRetries}) retrying in ${delay}ms`,
      );
      await sleep(delay);
      continue;
    }
    throw new Error(`Azure OpenAI HTTP ${res.status}: ${text.slice(0, 400)}`);
  }
}

async function azureOpenAITranslateJson(prompt) {
  return await azureOpenAIJson(prompt, {
    system: "You are a professional translator. Output ONLY a JSON object.",
    temperature: 0.2,
    topP: 0.9,
  });
}

/**
 * Resolve an agent name or ID to the internal assistant ID (asst_* format).
 * If the identifier already looks like an assistant ID, returns it directly.
 * Otherwise, lists all agents and finds the one matching by name.
 * @param {import("@azure/ai-projects").AgentsOperations | any} agentsClient
 * @param {string} agentNameOrId - Agent name or assistant ID
 * @returns {Promise<string>} The resolved assistant ID (asst_* format)
 */
async function resolveAgentId(agentsClient, agentNameOrId) {
  const debugAgent = !!process.env.DEBUG_AGENT;
  if (typeof agentNameOrId !== "string" || !agentNameOrId.trim()) {
    throw new Error("AZURE_AGENT_NAME must be a non-empty string");
  }
  const trimmed = agentNameOrId.trim();
  const [nameCandidate] = trimmed.split(":", 1);
  // If it already looks like an assistant ID, use it directly
  if (trimmed.startsWith("asst_") || trimmed.startsWith("asst-")) {
    if (debugAgent)
      console.log(`[agent] Using direct assistant ID: ${trimmed}`);
    return trimmed;
  }

  // List agents and find by name
  if (debugAgent)
    console.log(`[agent] Resolving agent name "${trimmed}" to assistant ID...`);
  const listFn =
    typeof agentsClient.list === "function"
      ? agentsClient.list.bind(agentsClient)
      : typeof agentsClient.listAgents === "function"
        ? agentsClient.listAgents.bind(agentsClient)
        : null;
  if (!listFn) {
    throw new Error("Azure agents client does not support list/listAgents");
  }
  const agentsIter = listFn();
  const candidates = [];
  for await (const agent of agentsIter) {
    if (debugAgent)
      console.log(`[agent]   found: id=${agent.id} name=${agent.name}`);
    const agentName = (agent.name || "").trim();
    if (
      agentName === trimmed ||
      agentName.toLowerCase() === trimmed.toLowerCase() ||
      agentName === nameCandidate ||
      agentName.toLowerCase() === nameCandidate.toLowerCase()
    ) {
      if (!isLegacyAgentId(agent.id)) {
        const err = new Error(
          `Agent "${trimmed}" resolved to non-legacy id "${agent.id}".`,
        );
        err.code = "AGENT_NOT_CLASSIC";
        throw err;
      }
      if (debugAgent) {
        console.log(`[agent] Resolved "${trimmed}" -> ${agent.id}`);
      }
      return agent.id;
    }
    candidates.push({ id: agent.id, name: agent.name });
  }

  const available =
    candidates.map((c) => `"${c.name}" (${c.id})`).join(", ") || "(none)";
  const err = new Error(
    `Agent with name "${trimmed}" not found. Available agents: ${available}`,
  );
  err.code = "AGENT_NOT_FOUND";
  throw err;
}

/**
 * Call an Azure AI Foundry Agent using the standard thread/run API.
 * Supports both agent names and legacy assistant IDs (asst_*).
 * @param {string} prompt - The user prompt
 * @param {Object} options - Options including agentId (agent name or ID)
 * @returns {Promise<Object>} Parsed JSON response
 */
async function azureAgentJson(prompt, { agentId = AZURE_AGENT_NAME } = {}) {
  if (!AZURE_AGENT_ENDPOINT) throw new Error("Missing AZURE_AGENT_ENDPOINT");
  if (!agentId) throw new Error("Missing AZURE_AGENT_NAME");

  const { AIProjectClient } = require("@azure/ai-projects");
  const { DefaultAzureCredential } = require("@azure/identity");
  const credential = new DefaultAzureCredential();
  const client = new AIProjectClient(AZURE_AGENT_ENDPOINT, credential);
  const debugAgent = !!process.env.DEBUG_AGENT;
  const timeoutMs = parseInt(
    process.env.AZURE_AGENT_RUN_TIMEOUT_MS || "180000",
    10,
  );

  // Resolve agent name to assistant ID if needed
  const assistantId = await resolveAgentId(client.agents, agentId);
  if (debugAgent) {
    console.log(
      `[agent] Using assistantId=${assistantId} (from input: ${agentId})`,
    );
  }

  // Create thread and send user message
  const thread = await client.agents.threads.create();
  await client.agents.messages.create(thread.id, "user", prompt);

  if (debugAgent) {
    console.log(`[agent] Created thread ${thread.id}, starting run...`);
  }

  // Create run and poll until complete, enforcing an overall timeout.
  // The poller's requestOptions.timeout only covers individual HTTP calls,
  // so we use AbortController to enforce the total wall-clock timeout.
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);

  let run;
  try {
    const poller = client.agents.runs.createAndPoll(thread.id, assistantId, {
      pollingOptions: { intervalInMs: 2000 },
    });
    run = await poller.pollUntilDone({ abortSignal: ac.signal });
  } catch (err) {
    clearTimeout(timer);
    if (ac.signal.aborted) {
      throw new Error(`Azure Agent run timeout after ${timeoutMs} ms`);
    }
    throw err;
  }
  clearTimeout(timer);

  if (debugAgent) {
    console.log(`[agent] Run completed with status: ${run.status}`);
  }

  // Retrieve assistant messages
  const messages = await client.agents.messages.list(thread.id, {
    order: "asc",
  });
  let lastAssistantText = "";
  for await (const message of messages) {
    if (message.role !== "assistant" || !Array.isArray(message.content)) {
      continue;
    }
    for (const c of message.content) {
      if (c.type === "text" && c.text && typeof c.text.value === "string") {
        lastAssistantText = c.text.value;
      }
    }
  }
  if (!lastAssistantText) {
    throw new Error("Azure Agent returned no assistant text content");
  }
  return extractJsonFromText(lastAssistantText);
}

/**
 * Call Azure AI Foundry Agent using the OpenAI Responses API with agent reference.
 * Uses direct fetch() because the OpenAI SDK's options.body replaces (not merges)
 * the params body, which would drop the "input" field when injecting "agent".
 * @param {string} prompt - The user prompt
 * @param {Object} options - Options including agentName
 * @returns {Promise<Object>} Parsed JSON response
 */
async function azureAgentResponsesApi(
  prompt,
  { agentName = AZURE_AGENT_NAME } = {},
) {
  if (!AZURE_AGENT_ENDPOINT) throw new Error("Missing AZURE_AGENT_ENDPOINT");
  if (!agentName) throw new Error("Missing AZURE_AGENT_NAME");

  const { AzureOpenAI } = require("openai");
  const apiKey = (AZURE_AGENT_API_KEY || "").trim();
  const useApiKey = !!apiKey;
  const credential = useApiKey ? null : (() => {
    const { DefaultAzureCredential } = require("@azure/identity");
    return new DefaultAzureCredential();
  })();
  const debugAgent = !!process.env.DEBUG_AGENT;

  const azureADTokenProvider = useApiKey
    ? null
    : async () => {
        const token = await credential.getToken("https://ai.azure.com/.default");
        if (!token?.token) {
          throw new Error("Failed to obtain Azure token for ai.azure.com scope");
        }
        return token.token;
      };

  const baseURL = `${AZURE_AGENT_ENDPOINT.replace(/\/+$/, "")}/openai`;
  const openAIClient = new AzureOpenAI({
    apiVersion: AZURE_AGENT_RESPONSES_API_VERSION,
    baseURL,
    ...(useApiKey
      ? { apiKey }
      : { azureADTokenProvider, apiKey: null }),
  });
  const agentRef = useApiKey
    ? buildAgentReference(agentName)
    : await resolveAgentReference(agentName, credential);

  if (debugAgent) {
    console.log(
      `[agent] Responses API (SDK) using agent=${agentRef.name}${
        agentRef.version ? `:${agentRef.version}` : ""
      }`,
    );
  }

  let response;
  let useMaxOutputTokens = AZURE_AGENT_RESPONSES_MAX_OUTPUT_TOKENS > 0;
  for (let attempt = 0; attempt <= AZURE_AGENT_RESPONSES_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      AZURE_AGENT_RESPONSES_TIMEOUT_MS,
    );
    try {
      const conversation = await openAIClient.conversations.create(
        {
          items: [{ type: "message", role: "user", content: prompt }],
        },
        { signal: controller.signal },
      );

      response = await openAIClient.responses.create(
        {
          conversation: conversation.id,
          agent: agentRef,
          ...(useMaxOutputTokens
            ? { max_output_tokens: AZURE_AGENT_RESPONSES_MAX_OUTPUT_TOKENS }
            : {}),
        },
        { signal: controller.signal },
      );

      if (
        response.status === "incomplete" &&
        response.incomplete_details?.reason === "max_output_tokens"
      ) {
        if (useMaxOutputTokens && attempt < AZURE_AGENT_RESPONSES_RETRIES) {
          useMaxOutputTokens = false;
          if (debugAgent) {
            console.log(
              "[agent] Responses API hit max_output_tokens. Retrying once without a cap...",
            );
          }
          await sleep(AZURE_AGENT_RESPONSES_BACKOFF_MS);
          response = null;
          continue;
        }
        throw new Error(
          "Responses API returned incomplete output because max_output_tokens was reached. Increase AZURE_AGENT_RESPONSES_MAX_OUTPUT_TOKENS.",
        );
      }
      break;
    } catch (error) {
      if (controller.signal.aborted) {
        if (attempt < AZURE_AGENT_RESPONSES_RETRIES) {
          if (debugAgent) {
            console.log(
              `[agent] Responses API timeout after ${AZURE_AGENT_RESPONSES_TIMEOUT_MS}ms. Retrying...`,
            );
          }
          continue;
        }
        throw new Error(
          `Responses API timeout after ${AZURE_AGENT_RESPONSES_TIMEOUT_MS}ms`,
        );
      }

      const status = error?.status || error?.statusCode;
      if (
        (status === 408 ||
          status === 429 ||
          status === 500 ||
          status === 502 ||
          status === 503 ||
          status === 504) &&
        attempt < AZURE_AGENT_RESPONSES_RETRIES
      ) {
        const baseBackoff = AZURE_AGENT_RESPONSES_BACKOFF_MS * (attempt + 1);
        const jitter =
          AZURE_AGENT_RESPONSES_BACKOFF_JITTER_MS > 0
            ? Math.floor(
                Math.random() * AZURE_AGENT_RESPONSES_BACKOFF_JITTER_MS,
              )
            : 0;
        const proposed = baseBackoff + jitter;
        const backoffMs =
          AZURE_AGENT_RESPONSES_BACKOFF_MAX_MS > 0
            ? Math.min(proposed, AZURE_AGENT_RESPONSES_BACKOFF_MAX_MS)
            : proposed;
        const retryAfterMs = getRetryAfterMsFromError(error);
        const effectiveBackoffMs = Math.max(backoffMs, retryAfterMs || 0);
        if (debugAgent) {
          console.log(
            `[agent] Responses API ${status} received. Retrying in ${effectiveBackoffMs}ms...`,
          );
        }
        await sleep(effectiveBackoffMs);
        continue;
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  if (!response) {
    throw new Error("Responses API request failed without a response");
  }

  const outputText = extractResponseText(response);
  if (!outputText) {
    if (debugAgent) {
      console.log(
        "[agent] Responses API raw response:",
        JSON.stringify(response, null, 2),
      );
    }
    throw new Error("Responses API returned no output text");
  }

  return extractJsonFromText(outputText);
}

async function requestAgentJson(prompt, { agentName = AZURE_AGENT_NAME } = {}) {
  if (!agentName) throw new Error("Missing AZURE_AGENT_NAME");

  // Legacy assistant IDs (asst_*) are not allowed.
  if (isLegacyAgentId(agentName)) {
    throw new Error(
      `Legacy agent IDs are not allowed. Update AZURE_AGENT_NAME to a Foundry agent name like "web-deep-search:4".`,
    );
  }

  const isPermissionError = (error) => {
    const status = error?.status || error?.statusCode;
    if (status === 401 || status === 403) return true;
    const message = `${error?.message || ""}`.toLowerCase();
    return (
      message.includes("rbac") ||
      message.includes("access denied") ||
      message.includes("not have permissions") ||
      message.includes("permissions")
    );
  };

  const tryAgent = async () => {
    const result = await azureAgentResponsesApi(prompt, { agentName });
    if (AZURE_AGENT_RESPONSES_COOLDOWN_MS > 0) {
      await sleep(AZURE_AGENT_RESPONSES_COOLDOWN_MS);
    }
    return result;
  };

  try {
    if (AZURE_AGENT_FORCE_RESPONSES) {
      return await tryAgent();
    }
    // New Foundry agents use the Responses API by default.
    return await tryAgent();
  } catch (error) {
    if (AZURE_AGENT_FALLBACK_TO_OPENAI && isPermissionError(error)) {
      if (
        !AZURE_OPENAI_RESEARCH_ENDPOINT ||
        !AZURE_OPENAI_RESEARCH_DEPLOYMENT ||
        !AZURE_OPENAI_RESEARCH_API_KEY
      ) {
        throw error;
      }
      console.warn(
        `[agent] Permission denied (${error?.status || "unknown"}). Falling back to Azure OpenAI.`,
      );
      return await azureOpenAIJson(prompt, {
        endpoint: AZURE_OPENAI_RESEARCH_ENDPOINT,
        deployment: AZURE_OPENAI_RESEARCH_DEPLOYMENT,
        apiVersion: AZURE_OPENAI_RESEARCH_API_VERSION,
        maxTokens: Math.min(2048, AZURE_OPENAI_DRAFT_MAX_TOKENS),
        system:
          "You are an expert research assistant. Output ONLY a JSON object.",
      });
    }
    throw error;
  }
}

function ensureAzureEnv() {
  const missing = [];
  if (!AZURE_AGENT_ENDPOINT) missing.push("AZURE_AGENT_ENDPOINT");
  if (!AZURE_AGENT_NAME) missing.push("AZURE_AGENT_NAME (or AZURE_AGENT_ID)");
  if (missing.length) {
    throw new Error(
      `Missing required Azure env vars: ${missing.join(", ")}. See README.`,
    );
  }
}

function ensureOpenAIEnv() {
  const missing = [];
  if (!AZURE_OPENAI_ENDPOINT) missing.push("AZURE_OPENAI_ENDPOINT");
  if (!AZURE_OPENAI_API_KEY) missing.push("AZURE_OPENAI_API_KEY");
  if (missing.length) {
    throw new Error(
      `Missing required Azure OpenAI env vars: ${missing.join(", ")}. See README.`,
    );
  }
}

function validateNewArticle(frData, article) {
  if (!article || typeof article !== "object") {
    const err = new Error("Réponse agent invalide: newArticle manquant");
    err.code = "MISSING_ARTICLE";
    throw err;
  }

  const required = [
    "slug",
    "title",
    "description",
    "content",
    "author",
    "date",
    "references",
  ];
  for (const key of required) {
    if (
      !article[key] ||
      (Array.isArray(article[key]) && !article[key].length)
    ) {
      const err = new Error(`Champ manquant ou vide: ${key}`);
      err.code = "MISSING_FIELD";
      err.field = key;
      throw err;
    }
  }

  const slugs = new Set(
    (Array.isArray(frData.Articles) ? frData.Articles : [])
      .map((a) => a.slug)
      .filter(Boolean),
  );
  if (slugs.has(article.slug)) {
    const err = new Error(`Slug déjà existant: ${article.slug}`);
    err.code = "DUPLICATE_SLUG";
    err.slug = article.slug;
    throw err;
  }

  if (!Array.isArray(article.references) || !article.references.length) {
    const err = new Error("Au moins une référence est requise");
    err.code = "MISSING_REFERENCES";
    throw err;
  }
  for (const ref of article.references) {
    if (
      !ref ||
      typeof ref !== "object" ||
      typeof ref.labelKey !== "string" ||
      typeof ref.url !== "string"
    ) {
      const err = new Error("Référence mal formée");
      err.code = "BAD_REFERENCE";
      throw err;
    }
  }

  const minWords = parseInt(process.env.SEO_MIN_WORDS || "0", 10);
  if (minWords > 0) {
    const words = countWords(article.content || "");
    if (words < minWords) {
      const err = new Error(`Article trop court: ${words} mots (min: ${minWords})`);
      err.code = "TOO_SHORT";
      err.words = words;
      err.minWords = minWords;
      throw err;
    }
  }
  const maxWords = parseInt(process.env.SEO_MAX_WORDS || "0", 10);
  if (maxWords > 0) {
    const words = countWords(article.content || "");
    if (words > maxWords) {
      const err = new Error(`Article trop long: ${words} mots (max: ${maxWords})`);
      err.code = "TOO_LONG";
      err.words = words;
      err.maxWords = maxWords;
      throw err;
    }
  }
}

function enforceTopicRotation(frData, newArticle, { relaxed = false } = {}) {
  const articles = Array.isArray(frData?.Articles) ? frData.Articles : [];
  if (!articles.length) return;

  // Get last 3 articles sorted by date (or 2 when relaxed on final retry)
  // relaxed=true is used on the last retry attempt to widen the topic space
  let windowSize = relaxed ? 2 : 3;
  const sorted = [...articles].sort((a, b) =>
    (b.date || "").localeCompare(a.date || ""),
  );

  const nextTopic = detectTopic(newArticle);
  if (nextTopic === "general") return; // General topics are always allowed

  // Auto-relax: when all non-general categories appear in the last 3 articles
  // (unlikely with 12 categories), shrink the window to 2.
  if (!relaxed) {
    const nonGeneralTopics = TOPIC_KEYWORDS
      .filter((t) => t.topic !== "general")
      .map((t) => t.topic);
    const topicsInThree = new Set(
      sorted.slice(0, 3).map((a) => detectTopic(a)).filter((t) => t !== "general"),
    );
    if (nonGeneralTopics.every((t) => topicsInThree.has(t))) {
      windowSize = 2;
    }
  }

  const recentArticles = sorted.slice(0, windowSize);

  // Check if this topic appears in any of the recent articles
  for (const article of recentArticles) {
    const articleTopic = detectTopic(article);
    if (articleTopic === nextTopic) {
      const err = new Error(
        `Le thème "${describeTopic(nextTopic)}" a déjà été traité récemment (article: "${article.title}")`,
      );
      err.code = "TOPIC_DUPLICATE";
      err.topic = nextTopic;
      err.previousTitle = article.title;
      throw err;
    }
  }
}

function normalizeArticleDates(article) {
  const today = isoDateToday();
  // Always set publication date to "today" for newly generated content.
  article.date = today;
}

function buildRetryPrompt(basePrompt, error, frData) {
  const recentSlugs = (Array.isArray(frData.Articles) ? frData.Articles : [])
    .slice(-12)
    .map((a) => a.slug)
    .filter(Boolean);
  let hint = `⚠️ Correction requise (${error.message}). Génère un nouvel article en respectant les contraintes précédentes.`;

  if (error.code === "DUPLICATE_SLUG") {
    hint =
      `⚠️ Le slug "${error.slug}" existe déjà. Choisis un nouveau sujet et un slug unique.\n` +
      `Slugs récents à éviter: ${recentSlugs.join(", ") || "aucun"}.`;
  } else if (error.code === "TOPIC_DUPLICATE") {
    hint =
      `⚠️ Le dernier article (${
        error.previousTitle
      }) couvrait déjà ${describeTopic(error.topic)}.\n` +
      "Choisis un autre axe stratégique (ia privée, microsoft 365 add-ins, productivité/automatisation, architecture/rag, gouvernance/roi, etc.).";
  } else if (error.code === "TOO_SHORT") {
    hint = [
      `⚠️ L'article est trop court (${error.words || "?"} mots).`,
      `Vise une longueur nette de ${error.minWords || "800"}+ mots (objectif +25%).`,
      "OBLIGATOIRE: ajoute 10+ sections H2, plusieurs H3, 2 checklists, 2 tableaux, 1 cas pratique chiffré (CHF), 1 section étape-par-étape et une FAQ de 6 questions.",
    ].join(" ");
  } else if (error.code === "TOO_LONG") {
    hint = [
      `⚠️ L'article est trop long (${error.words || "?"} mots).`,
      `Réduis à ${error.maxWords || "3000"} mots max sans perdre en utilité.`,
      "Supprime les répétitions, garde les tableaux/checklists/cas pratique et condense les sections redondantes.",
    ].join(" ");
  } else if (error.code === "MISSING_FIELD" && error.field) {
    hint = `⚠️ Le champ ${error.field} est manquant. Fournis un article complet avec ce champ rempli.`;
  }

  return `${basePrompt}\n\n${hint}`;
}

async function httpOk(
  url,
  timeoutMs = parseInt(process.env.LINK_CHECK_TIMEOUT_MS || "10000", 10),
) {
  if (OFFLINE_MODE) return true;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.status === 405 || res.status === 403) {
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), timeoutMs);
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller2.signal,
      });
      clearTimeout(timeout2);
    }
    return res.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Validate and repair article references using the referenceValidator module.
 * Replaces invalid references with verified fallbacks if needed.
 * @param {Object} article - Article with references array
 * @param {string} category - Topic category for fallback selection
 */
async function repairReferences(article, category = "general") {
  if (OFFLINE_MODE) {
    console.log("[refs] Offline mode: skipping reference validation");
    return;
  }

  const validateOpts = {
    timeout: parseInt(process.env.LINK_CHECK_TIMEOUT_MS || "10000", 10),
    minBytes: parseInt(process.env.LINK_CHECK_MIN_BYTES || "600", 10),
  };

  const minCount = Math.max(2, REFERENCE_MIN_COUNT || 3);
  const maxCount = Math.max(minCount, REFERENCE_MAX_COUNT || 6);
  const minTrusted = Math.max(0, REFERENCE_MIN_TRUSTED_DOMAINS || 0);
  const trustedCount = (refs) =>
    (Array.isArray(refs) ? refs : []).filter((r) =>
      r?.url ? isTrustedDomain(r.url) : false,
    ).length;

  console.log(
    `[refs] Validating ${article.references?.length || 0} references...`,
  );

  // First, deduplicate by domain
  const dedupedRefs = deduplicateByDomain(article.references || []);
  if (dedupedRefs.length < (article.references || []).length) {
    console.log(
      `[refs] Removed ${(article.references || []).length - dedupedRefs.length} duplicate domain references`,
    );
    article.references = dedupedRefs;
  }

  // Validate all references
  const validationResult = await validateReferences(article.references, validateOpts);

  console.log(
    `[refs] Validation results: ${validationResult.stats.valid} valid, ${validationResult.stats.invalid} invalid`,
  );

  // Log rejected references
  for (const ref of validationResult.invalid) {
    const reason = ref._validation?.reason || "unknown";
    const error = ref._validation?.error || "";
    console.warn(`[refs] Rejected: ${ref.url} (${reason}: ${error})`);
  }

  // Keep only valid references (may be empty). This ensures invalid references
  // don't block regeneration/fallback logic.
  article.references = validationResult.valid.map((ref) => {
    const { _validation, ...cleanRef } = ref;
    return cleanRef;
  });

  // If we don't have enough valid references, try to regenerate
  const maxRetries = parseInt(process.env.AI_REF_RETRIES || "2", 10);
  let attempt = 0;

  while (
    (article.references.length < minCount || trustedCount(article.references) < minTrusted) &&
    attempt < maxRetries
  ) {
    attempt++;
    console.warn(
      `[refs] Need more references (have ${article.references.length}/${minCount}, trusted ${trustedCount(article.references)}/${minTrusted}). Regeneration attempt ${attempt}/${maxRetries}...`,
    );

    const regenPrompt = [
      "Certaines références générées sont inaccessibles ou invalides.",
      'Fournis UNIQUEMENT un JSON de la forme {"references": [ {"labelKey": "...", "url": "https://..."}, ... ]}.',
      "URLs acceptables: sources officielles (admin.ch, ge.ch, vd.ch, fedlex.admin.ch, bsv.admin.ch, estv.admin.ch, seco.admin.ch, finma.ch, etc.), institutions (chambres de commerce, caisses de pension), associations professionnelles, médias économiques (si accessible sans paywall).",
      `Contraintes: au moins ${minCount} références, dont au moins ${minTrusted} source(s) officielle(s).`,
      "Chaque domaine ne doit être représenté qu'une seule fois dans les références (pas de doublons de domaine).",
      `Thème de l'article: ${article.title} (slug: ${article.slug}).`,
      "Fournis au moins 5 références pour maximiser les chances après déduplication/validation.",
    ].join("\n");

    let regen;
    try {
      if (MOCK_DATA?.regenReferences?.[attempt - 1]) {
        regen = MOCK_DATA.regenReferences[attempt - 1];
      } else {
        regen = await requestAgentJson(regenPrompt, {
          agentName: AZURE_AGENT_NAME,
        });
      }
    } catch (error) {
      console.warn(`[refs] Regeneration failed: ${error.message}`);
      break;
    }

    if (regen && Array.isArray(regen.references) && regen.references.length) {
      // Validate the new references
      const newValidation = await validateReferences(regen.references, validateOpts);
      if (newValidation.valid.length > 0) {
        // Merge with existing valid references
        const existingUrls = new Set(article.references.map((r) => r.url));
        for (const ref of newValidation.valid) {
          if (!existingUrls.has(ref.url) && article.references.length < maxCount) {
            const { _validation, ...cleanRef } = ref;
            article.references.push(cleanRef);
          }
        }
      }
    } else {
      console.warn("[refs] Regeneration returned no valid references.");
      break;
    }
  }

  // If still not enough references, use verified fallbacks
  if (article.references.length < minCount || trustedCount(article.references) < minTrusted) {
    console.warn(
      `[refs] Using verified fallback references for category: ${category}`,
    );
    const fallbacks = getFallbackReferences(category);
    const existingUrls = new Set(article.references.map((r) => r.url));

    for (const fallback of fallbacks) {
      if (!existingUrls.has(fallback.url) && article.references.length < maxCount) {
        article.references.push({ ...fallback });
        existingUrls.add(fallback.url);
      }
    }
  }

  // Final deduplication
  article.references = deduplicateByDomain(article.references);

  // Final validation pass (especially important when fallbacks were used)
  const finalValidation = await validateReferences(article.references, validateOpts);
  if (finalValidation.invalid.length) {
    for (const ref of finalValidation.invalid) {
      const reason = ref._validation?.reason || "unknown";
      const error = ref._validation?.error || "";
      console.warn(`[refs] Final rejected: ${ref.url} (${reason}: ${error})`);
    }
  }
  article.references = finalValidation.valid.map((ref) => {
    const { _validation, ...cleanRef } = ref;
    return cleanRef;
  });

  // If strict validation removed too many refs, try to top-up with validated fallbacks.
  if (article.references.length < minCount || trustedCount(article.references) < minTrusted) {
    const fallbacks = getFallbackReferences(category);
    const existingUrls = new Set(article.references.map((r) => r.url));
    const candidates = fallbacks.filter((r) => r && r.url && !existingUrls.has(r.url));
    const fallbackValidation = await validateReferences(candidates, validateOpts);
    for (const ref of fallbackValidation.valid) {
      if (article.references.length >= maxCount) break;
      const { _validation, ...cleanRef } = ref;
      article.references.push(cleanRef);
    }
    article.references = deduplicateByDomain(article.references);
  }

  console.log(
    `[refs] Final reference count: ${article.references.length} (trusted: ${trustedCount(article.references)})`,
  );

  const enforceMinimums =
    process.env.REFERENCE_ENFORCE_MINIMUMS === "1" || process.env.CI === "true";
  if (
    enforceMinimums &&
    (article.references.length < minCount ||
      trustedCount(article.references) < minTrusted)
  ) {
    throw new Error(
      `[refs] Minimum references not met after repair: have ${article.references.length}/${minCount}, trusted ${trustedCount(article.references)}/${minTrusted}`,
    );
  }
}

function sanitizeContentExternalLinks(article) {
  if (!article || typeof article !== "object") return;
  if (typeof article.content !== "string" || !article.content) return;
  const allowed = new Set(
    (Array.isArray(article.references) ? article.references : [])
      .map((r) => r && typeof r.url === "string" ? r.url : "")
      .filter(Boolean),
  );

  // Remove markdown links that aren't in the validated references list.
  // Keep the link text to preserve readability.
  let content = article.content.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    (match, text, url) => (allowed.has(url) ? match : text),
  );

  // Remove bare URLs that aren't validated references.
  content = content.replace(/https?:\/\/[^\s)]+/g, (url) =>
    allowed.has(url) ? url : "",
  );

  // Collapse accidental double spaces introduced by removals.
  content = content.replace(/[ \t]{2,}/g, " ");

  article.content = content;
}

function syncContentReferencesSection(article) {
  if (!article || typeof article !== "object") return;
  if (typeof article.content !== "string" || !article.content) return;
  if (!Array.isArray(article.references) || article.references.length === 0) {
    return;
  }

  const refs = article.references
    .filter((r) => r && typeof r.url === "string" && typeof r.labelKey === "string")
    .map((r) => ({ labelKey: r.labelKey.trim(), url: r.url.trim() }))
    .filter((r) => r.labelKey && r.url);

  if (refs.length === 0) return;

  let content = article.content;
  // Match headings like:
  // - "### Références"
  // - "### **Références**"
  // - "## References utiles"
  const headingRe =
    /^#{2,3}\s*(?:\*\*)?(références?|references?)(?:\*\*)?(?:\s+.*)?$/gim;
  const indices = [];
  for (const m of content.matchAll(headingRe)) {
    if (typeof m.index === "number") indices.push(m.index);
  }
  if (indices.length) {
    // Remove any agent-generated references sections and replace with
    // a deterministic one derived from validated `article.references`.
    content = content.slice(0, indices[0]).trimEnd();
  } else {
    content = content.trimEnd();
  }

  const list = refs.map((r) => `- [${r.labelKey}](${r.url})`).join("\n");
  article.content = `${content}\n\n---\n### Références\n${list}\n`;
}

function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

function logArticleMetrics(article, label = "article") {
  if (!article) return;
  const words = countWords(article.content || "");
  const chars = typeof article.content === "string" ? article.content.length : 0;
  const refCount = Array.isArray(article.references) ? article.references.length : 0;
  console.log(`[seo] ${label} word count: ${words} (chars: ${chars})`);
  console.log(`[refs] ${label} references: ${refCount}`);
  if (refCount) {
    for (const ref of article.references) {
      if (ref?.url) console.log(`[refs]   - ${ref.url}`);
    }
  }
}

async function generateArticleWithRetries(frData, attempts, trendData = null) {
  let currentTrendData = trendData;
  let basePrompt = buildSystemPrompt(frData, currentTrendData);
  let prompt = basePrompt;
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    console.log(
      `Requesting Azure Agent for new FR article... (attempt ${attempt}/${attempts})`,
    );

    let draft;
    if (MOCK_DATA?.draft) {
      draft = MOCK_DATA.draft;
    } else {
      draft = await requestAgentJson(prompt, { agentName: AZURE_AGENT_NAME });
    }

    try {
      const newArticle = draft.newArticle;
      const newLabels = draft.newLabels || {};
      if (newArticle && typeof newArticle === "object") {
        newArticle.author = AUTHOR_NAME;
        normalizeBrandCaseInArticle(newArticle);
        assertNoForbiddenTermsInArticle(newArticle, "fr");
      }
      validateNewArticle(frData, newArticle);
      enforceTopicRotation(frData, newArticle, { relaxed: attempt === attempts });
      normalizeArticleDates(newArticle);
      return { newArticle, newLabels, trendData: currentTrendData };
    } catch (error) {
      lastError = error;
      console.warn(`Draft invalid: ${error.message}`);
      if (error.code === "TOPIC_DUPLICATE" && error.topic) {
        currentTrendData = {
          ...currentTrendData,
          selectedTopic: null,
          blockedCategories: [...(currentTrendData?.blockedCategories || []), error.topic],
        };
        basePrompt = buildSystemPrompt(frData, currentTrendData);
      }
      prompt = buildRetryPrompt(basePrompt, error, frData);
    }
  }

  throw (
    lastError ||
    new Error("Échec génération article après plusieurs tentatives")
  );
}

function validateResearchPayload(frData, payload) {
  const research = payload?.research;
  if (!research || typeof research !== "object") {
    const err = new Error("Réponse agent invalide: research manquant");
    err.code = "MISSING_RESEARCH";
    throw err;
  }
  const required = [
    "slug",
    "title",
    "description",
    "category",
    "primaryKeyword",
    "outline",
    "references",
  ];
  for (const key of required) {
    if (
      !research[key] ||
      (Array.isArray(research[key]) && research[key].length === 0)
    ) {
      const err = new Error(`Champ research manquant ou vide: ${key}`);
      err.code = "MISSING_FIELD";
      err.field = key;
      throw err;
    }
  }
  if (!Array.isArray(research.outline)) {
    const err = new Error("research.outline doit être un tableau");
    err.code = "BAD_RESEARCH";
    throw err;
  }
  if (!Array.isArray(research.references) || research.references.length === 0) {
    const err = new Error("research.references doit être un tableau non vide");
    err.code = "BAD_RESEARCH";
    throw err;
  }
  for (const ref of research.references) {
    if (
      !ref ||
      typeof ref !== "object" ||
      typeof ref.labelKey !== "string" ||
      typeof ref.url !== "string"
    ) {
      const err = new Error("Référence mal formée dans research.references");
      err.code = "BAD_REFERENCE";
      throw err;
    }
  }

  const slugs = new Set(
    (Array.isArray(frData.Articles) ? frData.Articles : [])
      .map((a) => a.slug)
      .filter(Boolean),
  );
  if (slugs.has(research.slug)) {
    const err = new Error(`Slug déjà existant: ${research.slug}`);
    err.code = "DUPLICATE_SLUG";
    err.slug = research.slug;
    throw err;
  }

  return research;
}

async function generateResearchWithRetries(frData, attempts, trendData, seoSuggestions) {
  let currentTrendData = trendData;
  let basePrompt = buildResearchPrompt(frData, currentTrendData, seoSuggestions);
  let prompt = basePrompt;
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    console.log(
      `Requesting Azure Agent for topic+references research... (attempt ${attempt}/${attempts})`,
    );
    try {
      const payload = await requestAgentJson(prompt, {
        agentName: AZURE_AGENT_RESEARCH_NAME,
      });
      const research = validateResearchPayload(frData, payload);
      enforceTopicRotation(frData, research, { relaxed: attempt === attempts });
      return { research, trendData: currentTrendData };
    } catch (error) {
      lastError = error;
      console.warn(`Research invalid: ${error.message}`);
      if (error.code === "TOPIC_DUPLICATE" && error.topic) {
        const updatedBlockedCategories = [...(currentTrendData?.blockedCategories || []), error.topic];
        // Re-fetch trend suggestions with the newly blocked category so the AI gets
        // a concrete alternative target rather than just an "avoid everything" list.
        console.log(`[trends] Re-fetching topic after TOPIC_DUPLICATE (blocked: ${updatedBlockedCategories.join(", ")})`);
        const topicAnalysis = analyzeRecentTopics(frData, 15);
        const updatedAvoidTopics = [...new Set([...topicAnalysis.avoidTopics, ...updatedBlockedCategories])];
        const freshTrendData = await getTopicSuggestions({
          existingSlugs: (Array.isArray(frData.Articles) ? frData.Articles : []).map((a) => a.slug).filter(Boolean),
          avoidTopics: updatedAvoidTopics,
          recentTopicCategories: topicAnalysis.lastFiveTopics,
          topicCounts: topicAnalysis.topicCounts,
        });
        if (freshTrendData.selectedTopic) {
          console.log(`[trends] Fresh topic for retry: "${freshTrendData.selectedTopic.suggestedTopic}" (${freshTrendData.selectedTopic.category})`);
        }
        currentTrendData = {
          ...freshTrendData,
          blockedCategories: updatedBlockedCategories,
        };
        basePrompt = buildResearchPrompt(frData, currentTrendData, seoSuggestions);
      }
      prompt = `${basePrompt}\n\n⚠️ Correction requise: ${error.message}. Retourne STRICTEMENT le JSON demandé.`;
    }
  }

  throw (
    lastError ||
    new Error("Échec génération research après plusieurs tentatives")
  );
}

async function draftArticleFromResearch(frData, research, validatedReferences) {
  const maxRetries = parseInt(process.env.AI_DRAFT_RETRIES || "2", 10);
  let lastError = null;
  const basePrompt = buildDraftPromptFromResearch(research, validatedReferences);
  let draftArticle = null;
  let accumulatedLabels = {};
  const appendDraftContent = async (minWords) => {
    const appendPayload = await azureOpenAIJson(
      buildDraftAppendPromptFromExistingArticle(draftArticle, { minWords }),
      {
        endpoint: AZURE_OPENAI_DRAFT_ENDPOINT,
        deployment: AZURE_OPENAI_DRAFT_DEPLOYMENT,
        apiVersion: AZURE_OPENAI_DRAFT_API_VERSION,
        temperature: 0.2,
        topP: 0.9,
        maxTokens: Math.min(2048, AZURE_OPENAI_DRAFT_MAX_TOKENS),
        system: "You are an expert French SEO writer. Output ONLY a JSON object.",
      },
    );
    const appendContent = appendPayload?.appendContent;
    if (!appendContent || typeof appendContent !== "string") {
      throw new Error("Append payload missing appendContent");
    }
    if (/https?:\/\//i.test(appendContent)) {
      const err = new Error("Append content contains URLs (forbidden)");
      err.code = "APPEND_HAS_URLS";
      throw err;
    }
    accumulatedLabels = {
      ...accumulatedLabels,
      ...(appendPayload?.newLabels || {}),
    };
    draftArticle.content = `${String(draftArticle.content || "").trim()}\n\n${appendContent.trim()}`;
  };
  const finalizeDraftArticle = () => {
    // Lock references to the already validated list.
    draftArticle.references = validatedReferences;
    // Normalize expected author for this repo.
    draftArticle.author = AUTHOR_NAME;
    normalizeBrandCaseInArticle(draftArticle);
    assertNoForbiddenTermsInArticle(draftArticle, "fr");
    validateNewArticle(frData, draftArticle);
    enforceTopicRotation(frData, draftArticle);
    normalizeArticleDates(draftArticle);
  };
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    console.log(
      `Requesting Azure OpenAI draft... (attempt ${attempt}/${maxRetries + 1})`,
    );
    try {
      if (draftArticle && lastError && lastError.code === "TOO_SHORT") {
        await appendDraftContent(lastError.minWords);
      } else {
        const prompt =
          draftArticle && lastError && lastError.code === "TOO_LONG"
            ? buildDraftRepairPromptFromExistingArticle(draftArticle, {
                mode: "condense",
                minWords: process.env.SEO_MIN_WORDS || "1500",
                maxWords: lastError.maxWords,
              })
            : basePrompt;

        const payload = await azureOpenAIJson(prompt, {
          endpoint: AZURE_OPENAI_DRAFT_ENDPOINT,
          deployment: AZURE_OPENAI_DRAFT_DEPLOYMENT,
          apiVersion: AZURE_OPENAI_DRAFT_API_VERSION,
          temperature:
            draftArticle && lastError && lastError.code === "TOO_LONG" ? 0.2 : 0.3,
          topP: 0.9,
          maxTokens: AZURE_OPENAI_DRAFT_MAX_TOKENS,
          system: "You are an expert French SEO writer. Output ONLY a JSON object.",
        });

        const newArticle = payload?.newArticle;
        const newLabels = payload?.newLabels || {};
        if (!newArticle || typeof newArticle !== "object") {
          throw new Error("Draft payload missing newArticle");
        }

        accumulatedLabels = { ...accumulatedLabels, ...newLabels };
        draftArticle = newArticle;
      }

      finalizeDraftArticle();
      return { newArticle: draftArticle, newLabels: accumulatedLabels };
    } catch (error) {
      lastError = error;
      console.warn(`Draft invalid: ${error.message}`);
    }
  }

  if (draftArticle && lastError && lastError.code === "TOO_SHORT") {
    console.warn(
      "Draft still too short after retries, requesting a final expansion...",
    );
    try {
      await appendDraftContent(lastError.minWords);
      finalizeDraftArticle();
      return { newArticle: draftArticle, newLabels: accumulatedLabels };
    } catch (error) {
      lastError = error;
      console.warn(`Draft invalid: ${error.message}`);
    }
  }

  throw lastError || new Error("Échec génération draft Azure OpenAI");
}

function mergeLabels(target, labels) {
  if (!labels || typeof labels !== "object") return;
  for (const [key, value] of Object.entries(labels)) {
    if (value && typeof value === "string" && !(key in target)) {
      target[key] = value;
    }
  }
}

function assertTranslationPayload(translations, locales) {
  if (!translations || typeof translations !== "object") {
    throw new Error(
      `Translation payload missing or invalid. Received: ${typeof translations}`,
    );
  }
  const missing = [];
  for (const locale of locales) {
    const payload = translations[locale];
    if (!payload || !payload.Article) {
      missing.push(`${locale}.Article`);
      continue;
    }
    if (!payload.Article.title) missing.push(`${locale}.title`);
    if (!payload.Article.description) missing.push(`${locale}.description`);
    if (!payload.Article.content) missing.push(`${locale}.content`);
  }
  if (missing.length) {
    throw new Error(`Translation payload incomplete: ${missing.join(", ")}`);
  }
}

async function main() {
  if (!fs.existsSync(FR_PATH)) {
    throw new Error(`Canonical FR ressources file not found: ${FR_PATH}`);
  }
  if (!MOCK_DATA) {
    ensureAzureEnv();
  }

  const frData = loadJSON(FR_PATH);

  // Get existing slugs and topic analysis for trend selection
  const existingSlugs = (Array.isArray(frData.Articles) ? frData.Articles : [])
    .map((a) => a.slug)
    .filter(Boolean);
  const topicAnalysis = analyzeRecentTopics(frData, 15);

  // Fetch trend-based topic suggestions
  console.log("\n📊 Fetching trend signals for topic selection...");
  const trendData = await getTopicSuggestions({
    existingSlugs,
    avoidTopics: topicAnalysis.avoidTopics,
    recentTopicCategories: topicAnalysis.lastFiveTopics,
    topicCounts: topicAnalysis.topicCounts,
  });

  // Log trend information (keywords only, not sensitive)
  if (trendData.selectedTopic) {
    console.log(`[trends] Provider: ${trendData.provider}`);
    console.log(`[trends] Trends checked: ${trendData.trendsChecked}`);
    console.log(`[trends] Used fallback: ${trendData.usedFallback}`);
    console.log(
      `[trends] Selected topic: "${trendData.selectedTopic.suggestedTopic}"`,
    );
    console.log(
      `[trends] Target keywords: ${trendData.selectedTopic.keywords?.join(", ")}`,
    );
    if (trendData.error) {
      console.warn(`[trends] API warning: ${trendData.error}`);
    }
  }

  // Build SEO suggestions
  const seoSuggestions = buildSEOSuggestions(trendData.selectedTopic);
  if (seoSuggestions) {
    console.log(`[seo] Primary keyword: "${seoSuggestions.primaryKeyword}"`);
    console.log(`[seo] Category: ${seoSuggestions.category}`);
  }

  let newArticle;
  let newLabels;

  if (AI_TWO_STEP) {
    if (!MOCK_DATA) {
      ensureOpenAIEnv();
    }
    const { research } = await generateResearchWithRetries(
      frData,
      parseInt(process.env.AI_RESEARCH_RETRIES || "2", 10),
      trendData,
      seoSuggestions,
    );

    const refCarrier = {
      title: research.title,
      slug: research.slug,
      content: "",
      references: Array.isArray(research.references) ? research.references : [],
    };
    await repairReferences(refCarrier, research.category || "general");
    const validatedReferences = Array.isArray(refCarrier.references)
      ? refCarrier.references
      : [];

    const drafted = await draftArticleFromResearch(
      frData,
      research,
      validatedReferences,
    );
    newArticle = drafted.newArticle;
    newLabels = drafted.newLabels || {};
  } else {
    const drafted = await generateArticleWithRetries(
      frData,
      parseInt(process.env.AI_ARTICLE_RETRIES || "3", 10),
      trendData,
    );
    newArticle = drafted.newArticle;
    newLabels = drafted.newLabels || {};
  }

  // Validate that the article is AI/Microsoft 365 related (not general business topics)
  console.log("Validating article topic relevance...");
  assertAIRelatedTopic(newArticle, "generated article");
  console.log("✅ Article topic validation passed - AI/Microsoft 365 focus confirmed");

  // Detect the article category for reference fallback
  const articleCategory =
    seoSuggestions?.category || detectTopic(newArticle) || "general";
  await repairReferences(newArticle, articleCategory);
  syncContentReferencesSection(newArticle);
  sanitizeContentExternalLinks(newArticle);
  normalizeArticleDates(newArticle);
  logArticleMetrics(newArticle, "FR");

  if (DRY || !APPLY) {
    console.log("[dry-run] Would append article to FR:", {
      newArticle,
      newLabels,
    });
  } else {
    const updated = { ...frData };
    updated.Articles = Array.isArray(updated.Articles)
      ? updated.Articles.slice()
      : [];
    updated.Articles.push({ ...newArticle, content: newArticle.content });
    mergeLabels(updated, newLabels);
    saveJSON(FR_PATH, updated);
    console.log("FR updated with 1 Article.");
  }

  console.log("Requesting Azure OpenAI translations (EN/DE/ES/PT)...");
  let translations;
  if (MOCK_DATA?.translations) {
    translations = MOCK_DATA.translations;
  } else {
    ensureOpenAIEnv();
    translations = await azureOpenAITranslateJson(
      buildTranslatePrompt(newArticle, newLabels),
    );
  }
  if (REQUIRE_TRANSLATIONS) {
    assertTranslationPayload(translations, LOCALES);
  }

  for (const locale of LOCALES) {
    const targetPath = path.join(TRANSLATIONS_DIR, locale, "ressources.json");
    if (!fs.existsSync(targetPath)) {
      console.warn(`[WARN] Missing ${locale}/ressources.json; skipping.`);
      continue;
    }
    const data = loadJSON(targetPath);
    data.Articles = Array.isArray(data.Articles) ? data.Articles : [];
    const seenSlugs = new Set(data.Articles.map((a) => a.slug));

    const payload = translations[locale];
    if (!payload || !payload.Article) {
      const message = `[WARN] Missing translation payload for ${locale}; skipping.`;
      if (REQUIRE_TRANSLATIONS) {
        throw new Error(message);
      }
      console.warn(message);
      continue;
    }
    const articleTr = payload.Article;
    const labelsTr = payload.labels || {};
    const localizedArticle = {
      slug: newArticle.slug,
      title: articleTr.title,
      description: articleTr.description,
      content: articleTr.content,
      author: newArticle.author,
      date: newArticle.date,
      references: newArticle.references,
    };
    normalizeBrandCaseInArticle(localizedArticle);
    assertNoForbiddenTermsInArticle(localizedArticle, locale);

    if (
      REQUIRE_TRANSLATIONS &&
      isDuplicateTranslation(localizedArticle, newArticle)
    ) {
      throw new Error(
        `[ERROR] ${locale} translation matches FR content for ${newArticle.slug}.`,
      );
    }

    if (
      hasUnnecessaryCaps(localizedArticle.title) ||
      hasUnnecessaryCaps(localizedArticle.description)
    ) {
      console.warn(`[WARN] Caps heuristic flagged in ${locale} article text.`);
    }

    if (DRY || !APPLY) {
      console.log(`[dry-run] Would append to ${locale}:`, {
        article: localizedArticle,
        labels: labelsTr,
      });
      continue;
    }

    if (!seenSlugs.has(localizedArticle.slug)) {
      data.Articles.push(localizedArticle);
    }
    mergeLabels(data, labelsTr);
    saveJSON(targetPath, data);
    console.log(`${locale} updated.`);
  }

  if (TRANSLATE_EXISTING && APPLY && !DRY) {
    const spawnSync = require("child_process").spawnSync;
    console.log("Regenerating translations for existing articles...");
    const result = spawnSync(
      "node",
      // Translate only missing/untranslated items. Forcing full retranslation
      // every run is expensive and increases 429/timeout risk in CI.
      ["scripts/translate-articles.js", "--apply"],
      {
        stdio: "inherit",
        env: process.env,
      },
    );
    if (result.status !== 0) {
      throw new Error(
        `translate-articles.js failed with exit code ${result.status}`,
      );
    }
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
