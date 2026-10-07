"use strict";
/**
 * Article backlog + topic rotation for the ressources pipeline (houle).
 *
 * The backlog (data/article-backlog.json) is the single source of topics.
 * Selection is a pure function of (backlog, published articles): no network,
 * no clock, no randomness — so it can be unit-tested and simulated.
 *
 * Rotation rules enforced here (see `rules` in the backlog file):
 * - never two consecutive articles from the same category;
 * - capped categories (regulation-policy): at most 1 in any `window` articles
 *   and none while the category already has `maxInLast20` articles in the
 *   last 20 published;
 * - weighted preference for under-represented categories and for
 *   commercial/transactional intent;
 * - a topic is never used twice, and a topic too close to an existing
 *   article title (or to a reserved topic) is skipped.
 */

const fs = require("fs");
const path = require("path");

const LOCALES = ["fr", "en", "de", "es", "pt"];
const INTENTS = ["informational", "commercial", "transactional"];
const BACKLOG_PATH = path.join("data", "article-backlog.json");

const STATIC_SERVICE_PATHS = [
  "/contact",
  "/products",
  "/products/ai-agents",
  "/products/outlook-addin",
  "/products/swiss-gpt",
  "/products/word-addin",
  "/services",
  "/services/ai-consulting",
  "/services/microsoft-consulting",
  "/solutions",
];

// Localised anchors for non-solution pages (solution pages use their own
// hero title from src/translations/<locale>/solutions.json).
const SERVICE_LABELS = {
  "/services/ai-consulting": {
    fr: "notre conseil en intelligence artificielle",
    en: "our AI consulting",
    de: "unsere KI-Beratung",
    es: "nuestra consultoría en inteligencia artificial",
    pt: "a nossa consultoria em inteligência artificial",
  },
  "/services/microsoft-consulting": {
    fr: "notre conseil Microsoft 365 et Power Platform",
    en: "our Microsoft 365 and Power Platform consulting",
    de: "unsere Beratung zu Microsoft 365 und Power Platform",
    es: "nuestra consultoría de Microsoft 365 y Power Platform",
    pt: "a nossa consultoria de Microsoft 365 e Power Platform",
  },
  "/services": {
    fr: "nos services",
    en: "our services",
    de: "unsere Leistungen",
    es: "nuestros servicios",
    pt: "os nossos serviços",
  },
  "/products": {
    fr: "nos produits",
    en: "our products",
    de: "unsere Produkte",
    es: "nuestros productos",
    pt: "os nossos produtos",
  },
  "/products/ai-agents": {
    fr: "nos agents IA",
    en: "our AI agents",
    de: "unsere KI-Agenten",
    es: "nuestros agentes de IA",
    pt: "os nossos agentes de IA",
  },
  "/products/swiss-gpt": {
    fr: "Swiss GPT, l'assistant hébergé en Suisse",
    en: "Swiss GPT, the assistant hosted in Switzerland",
    de: "Swiss GPT, der in der Schweiz gehostete Assistent",
    es: "Swiss GPT, el asistente alojado en Suiza",
    pt: "Swiss GPT, o assistente alojado na Suíça",
  },
  "/products/outlook-addin": {
    fr: "notre add-in Outlook",
    en: "our Outlook add-in",
    de: "unser Outlook-Add-in",
    es: "nuestro complemento para Outlook",
    pt: "o nosso suplemento para Outlook",
  },
  "/products/word-addin": {
    fr: "notre add-in Word",
    en: "our Word add-in",
    de: "unser Word-Add-in",
    es: "nuestro complemento para Word",
    pt: "o nosso suplemento para Word",
  },
  "/solutions": {
    fr: "nos solutions par cas d'usage",
    en: "our solutions by use case",
    de: "unsere Lösungen nach Anwendungsfall",
    es: "nuestras soluciones por caso de uso",
    pt: "as nossas soluções por caso de uso",
  },
};

const LEAD_COPY = {
  fr: {
    heading: "Passer à l'action avec houle",
    body: (service, contact) =>
      `houle accompagne les entreprises de Suisse romande de façon indépendante des éditeurs: cadrage du cas d'usage, choix du modèle et de l'hébergement, mise en production. Pour aller plus loin, découvrez ${service} ou ${contact} pour décrire votre situation.`,
    contact: "contactez l'équipe houle",
  },
  en: {
    heading: "Take the next step with houle",
    body: (service, contact) =>
      `houle supports companies in Switzerland independently of any vendor: scoping the use case, choosing the model and the hosting, going live. To go further, see ${service} or ${contact} to describe your situation.`,
    contact: "contact the houle team",
  },
  de: {
    heading: "Der nächste Schritt mit houle",
    body: (service, contact) =>
      `houle begleitet Unternehmen in der Schweiz herstellerunabhängig: Anwendungsfall klären, Modell und Hosting wählen, in Betrieb nehmen. Mehr dazu: ${service}, oder ${contact} und schildern Sie Ihre Situation.`,
    contact: "kontaktieren Sie das houle-Team",
  },
  es: {
    heading: "Dar el siguiente paso con houle",
    body: (service, contact) =>
      `houle acompaña a las empresas en Suiza con independencia de los proveedores: definición del caso de uso, elección del modelo y del alojamiento, puesta en producción. Para ir más lejos, descubra ${service} o ${contact} para describir su situación.`,
    contact: "contacte con el equipo de houle",
  },
  pt: {
    heading: "Dar o próximo passo com a houle",
    body: (service, contact) =>
      `A houle acompanha as empresas na Suíça de forma independente dos fornecedores: definição do caso de uso, escolha do modelo e do alojamento, entrada em produção. Para ir mais longe, descubra ${service} ou ${contact} para descrever a sua situação.`,
    contact: "contacte a equipa houle",
  },
};

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

function normalizeText(input) {
  return String(input || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

const STOPWORDS = new Set(
  (
    "les des une pour avec dans sur par aux est que qui son ses leur vos votre nos notre " +
    "comment pourquoi quel quelle quels quelles sans plus tout tous cette ces ou et en de du la le un au " +
    "the and for with how what why your from into " +
    "entreprise entreprises guide pratique pratiques complet complete bonnes meilleures " +
    "suisse geneve romande pme 2025 2026 2027"
  ).split(/\s+/),
);

function tokenize(input) {
  const out = new Set();
  for (const raw of normalizeText(input).split(/[^a-z0-9]+/)) {
    if (!raw) continue;
    let tok = raw;
    if (tok.length > 4 && /[sx]$/.test(tok)) tok = tok.slice(0, -1);
    if (tok.length < 3 && tok !== "ia" && tok !== "ai" && tok !== "rh") continue;
    if (STOPWORDS.has(tok)) continue;
    out.add(tok);
  }
  return out;
}

/** Jaccard similarity of the significant tokens of two strings (0..1). */
function titleSimilarity(a, b) {
  const ta = tokenize(a);
  const tb = tokenize(b);
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / (ta.size + tb.size - inter);
}

function slugify(input) {
  return normalizeText(input)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ---------------------------------------------------------------------------
// Family classifier for articles published before the backlog existed
// ---------------------------------------------------------------------------

const AI_CONTEXT =
  /\b(ia|ai|agents?|automatis\w*|power automate|microsoft|azure|gpt|llm|add-?ins?|workflows?)\b/;

const FAMILY_RULES = [
  ["odoo-erp", /\bodoo\b|\berp\b/],
  [
    "regulation-policy",
    /politique\w*\s+(d['’ ]?\s*)?(usage|utilisation|ia|de gouvernance)|politique-(usage|utilisation|ia)|\bcharte\b|\bclauses?\b|cadre\s+\w+\s+(de\s+)?gouvernance|gouvernance[- ](de[- ]l[- '’]?)?(ia|des donnees)|gouvernance d['’]une intelligence|gouvernance (solide )?de l['’ ]?intelligence artificielle|gouvernance-ia|\bai[- ]act\b|comite\s+(ia|ethique)|\bfinma\b|secret professionnel|\baipd\b|\bdpia\b/,
  ],
  [
    "legacy-fiduciary",
    {
      test: (s) =>
        /\btva\b|\bvat\b|\bpaie\b|salaires?|\blpp\b|swissdec|fiscal\w*|impots?|domiciliation|constitution de societe|creer son entreprise|acquisition|transmission d|patrimoine|proces-verbal|proces-verbaux|externalisation|outsourcing|controle interne|\bbeps\b|sa ou une sarl|cryptomonnaies|direction financiere|digitalisation de la comptabilite/.test(
          s,
        ) && !AI_CONTEXT.test(s),
    },
  ],
  ["worked-scenario", /cas client|ark[- ]fid|retour d['’ ]experience|scenario/],
  ["ai-triage", /\btriage\b|\btri(er)? (par|avec) (une |l['’ ])?ia\b|\btrier\b|routage des (tickets|demandes)|filtrer les (cas|dossiers)/],
  [
    "vendor-neutral-models",
    /\bvs\b|\bversus\b|comparatif|alternatives?\b|\bou\b.*\bchoisir\b|pourquoi preferer|open[- ]source|\bmistral\b|\bllama\b|\bclaude\b|anthropic/,
  ],
  ["cost-roi", /\broi\b|\bcouts?\b|\bprix\b|\btarifs?\b|\bbudget\b|rentabilit|licences?\b/],
  [
    "industry",
    /sante\b|medical|hopital|clinique|horlog|juridiques?\b|avocats?|notaires?|fiduciaires?\b|family office|immobili|regies?\b|commerce de detail|hotel|restaurant|banques?\b|\bassur(ance|eur)|gerants? de fortune|administration publique/,
  ],
  [
    "process-automation",
    /automatis|workflows?|power automate|approbation|relance|onboarding|courrier|notes de frais|transcription|\bdevis\b|helpdesk|factures?|allocation|detection automatique|gestion de contrats|redaction de contrats|resume automatique|analyse automatique|controle qualite/,
  ],
  [
    "swiss-hosted-open-source",
    /heberge\w*|llm locaux|on-?prem|souverain|residence des donnees|\bgpu\b/,
  ],
  [
    "technical-architecture",
    /securi\w*|\brbac\b|zero trust|cyber|\brag\b|prompt|\bllms?\b|fine-?tuning|qualite d['’ ]?un|scoring|calibrage|azure openai|architecture|proteger|donnees sensibles|confidenti|machine learning|recherche semantique/,
  ],
  [
    "microsoft-365",
    /microsoft 365|\bm365\b|office 365|outlook|\bword\b|\bteams\b|sharepoint|power bi|power platform|power apps|copilot|add-?ins?\b|spfx/,
  ],
  ["regulation-policy", /conformite|\bnlpd\b|\blpd\b|\brgpd\b|reglement|protection des donnees/],
  [
    "implementation-guide",
    /adoption|adopter|deploiement|deployer|strategie|transformation|les bases|prestataire|consultant|cahier des charges|pilote|former\b|formation/,
  ],
  ["private-ai-assistants", /assistants?\b|\bgpt\b|ia privee|agents?\b|base de connaissances|chatbot/],
];

/**
 * Topic family of an article. New articles carry `topicFamily`; older ones
 * are classified from their slug and title.
 */
function classifyFamily(article) {
  if (!article) return "other";
  if (typeof article.topicFamily === "string" && article.topicFamily) {
    return article.topicFamily;
  }
  const text = normalizeText(
    `${String(article.slug || "").replace(/-/g, " ")} ${article.title || ""}`,
  );
  for (const [family, rule] of FAMILY_RULES) {
    if (rule.test(text)) return family;
  }
  return "other";
}

// ---------------------------------------------------------------------------
// Backlog loading and validation
// ---------------------------------------------------------------------------

function loadBacklog(root = process.cwd()) {
  return JSON.parse(fs.readFileSync(path.join(root, BACKLOG_PATH), "utf8"));
}

function loadServicePaths(root = process.cwd()) {
  const paths = new Set(STATIC_SERVICE_PATHS);
  try {
    const solutions = JSON.parse(
      fs.readFileSync(
        path.join(root, "src", "translations", "fr", "solutions.json"),
        "utf8",
      ),
    );
    for (const key of Object.keys(solutions)) paths.add(`/solutions/${key}`);
  } catch {
    // solutions file is optional for validation in isolated tests
  }
  return paths;
}

function getRules(backlog) {
  const rules = (backlog && backlog.rules) || {};
  return {
    window: 20,
    cappedCategories: {},
    intentBonus: { informational: 0, commercial: 8, transactional: 12 },
    similarityThreshold: 0.6,
    allowCopilot: true,
    ...rules,
  };
}

/** Returns a list of problems; empty when the backlog is valid. */
function validateBacklog(backlog, { servicePaths = null, siteCategories = null } = {}) {
  const errors = [];
  if (!backlog || typeof backlog !== "object") return ["backlog is not an object"];
  const categories = Array.isArray(backlog.categories) ? backlog.categories : [];
  const topics = Array.isArray(backlog.topics) ? backlog.topics : [];
  const catIds = new Set();
  for (const c of categories) {
    if (!c.id || !c.label) errors.push(`category without id/label: ${JSON.stringify(c)}`);
    if (catIds.has(c.id)) errors.push(`duplicate category: ${c.id}`);
    catIds.add(c.id);
    if (!(Number(c.weight) > 0)) errors.push(`category ${c.id}: weight must be > 0`);
    if (siteCategories && !siteCategories.has(c.siteCategory)) {
      errors.push(`category ${c.id}: unknown siteCategory "${c.siteCategory}"`);
    }
    if (servicePaths && !servicePaths.has(c.defaultService)) {
      errors.push(`category ${c.id}: unknown defaultService "${c.defaultService}"`);
    }
  }
  if (categories.length < 8) errors.push(`expected at least 8 categories, got ${categories.length}`);
  if (topics.length < 60) errors.push(`expected at least 60 topics, got ${topics.length}`);

  const ids = new Set();
  for (const t of topics) {
    const where = `topic ${t.id || "(no id)"}`;
    if (!t.id || t.id !== slugify(t.id)) errors.push(`${where}: id must be a slug`);
    if (ids.has(t.id)) errors.push(`${where}: duplicate id`);
    ids.add(t.id);
    if (!catIds.has(t.category)) errors.push(`${where}: unknown category "${t.category}"`);
    if (!INTENTS.includes(t.intent)) errors.push(`${where}: invalid intent "${t.intent}"`);
    if (!t.title || !t.angle) errors.push(`${where}: title and angle are required`);
    if (servicePaths && !servicePaths.has(t.service)) {
      errors.push(`${where}: unknown service page "${t.service}"`);
    }
    if (siteCategories && t.siteCategory && !siteCategories.has(t.siteCategory)) {
      errors.push(`${where}: unknown siteCategory "${t.siteCategory}"`);
    }
    for (const locale of LOCALES) {
      const kw = t.keywords && t.keywords[locale];
      if (!Array.isArray(kw) || kw.length === 0 || kw.some((k) => !k || typeof k !== "string")) {
        errors.push(`${where}: keywords.${locale} missing`);
      }
    }
  }
  for (const r of Array.isArray(backlog.reserved) ? backlog.reserved : []) {
    if (!r.title) errors.push(`reserved entry without title: ${JSON.stringify(r)}`);
  }
  const rules = getRules(backlog);
  for (const id of Object.keys(rules.cappedCategories || {})) {
    if (!catIds.has(id)) errors.push(`rules.cappedCategories: unknown category "${id}"`);
  }
  return errors;
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

/** Published articles, oldest first (stable on equal dates). */
function buildHistory(articles) {
  return (Array.isArray(articles) ? articles : [])
    .map((a, index) => ({ a, index }))
    .sort(
      (x, y) =>
        String(x.a.date || "").localeCompare(String(y.a.date || "")) || x.index - y.index,
    )
    .map(({ a }) => ({
      slug: a.slug || "",
      title: a.title || "",
      date: a.date || "",
      topicId: a.topicId || "",
      family: classifyFamily(a),
    }));
}

function countFamilies(history, last = 0) {
  const slice = last > 0 ? history.slice(-last) : history;
  const counts = {};
  for (const h of slice) counts[h.family] = (counts[h.family] || 0) + 1;
  return counts;
}

function findNearDuplicate(candidate, entries, threshold) {
  let best = null;
  for (const e of entries) {
    const score = Math.max(
      titleSimilarity(candidate.title, e.title),
      candidate.slug && e.slug
        ? titleSimilarity(candidate.slug.replace(/-/g, " "), e.slug.replace(/-/g, " "))
        : 0,
    );
    if (score >= threshold && (!best || score > best.score)) {
      best = { score, title: e.title, slug: e.slug || "" };
    }
  }
  return best;
}

function reservedEntries(backlog) {
  const out = [];
  for (const r of Array.isArray(backlog.reserved) ? backlog.reserved : []) {
    out.push({ title: r.title, slug: "" });
    for (const slug of Array.isArray(r.slugs) ? r.slugs : []) {
      out.push({ title: r.title, slug });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Rotation
// ---------------------------------------------------------------------------

/** Why a category cannot be used for the next article, or null if it can. */
function categoryBlockReason(category, history, rules) {
  const cap = (rules.cappedCategories || {})[category];
  if (cap) {
    const window = Math.max(1, Number(cap.window) || 6);
    if (history.slice(-(window - 1)).some((h) => h.family === category)) {
      return `capped: at most 1 "${category}" article in any ${window}`;
    }
    const max = Number(cap.maxInLast20);
    if (Number.isFinite(max)) {
      const count = history.slice(-20).filter((h) => h.family === category).length;
      if (count >= max) {
        return `capped: "${category}" is over-represented (${count} of the last 20)`;
      }
    }
  }
  const last = history[history.length - 1];
  if (last && last.family === category) {
    return "same category as the previous article";
  }
  return null;
}

function topicUnavailableReason(topic, history, backlog, rules) {
  if (topic.requires === "copilot" && !rules.allowCopilot) return "copilot topics disabled";
  if (history.some((h) => h.topicId === topic.id || h.slug === topic.id)) return "already used";
  const reserved = reservedEntries(backlog);
  if (reserved.some((r) => r.slug && r.slug === topic.id)) return "reserved";
  const dup = findNearDuplicate(
    { title: topic.title, slug: topic.id },
    [...history, ...reserved],
    rules.similarityThreshold,
  );
  if (dup) return `too close to "${dup.title}"`;
  return null;
}

function scoreTopic(topic, history, backlog, rules) {
  const categories = backlog.categories;
  const totalWeight = categories.reduce((sum, c) => sum + Number(c.weight || 0), 0) || 1;
  const cat = categories.find((c) => c.id === topic.category);
  const window = history.slice(-rules.window);
  const share = window.length
    ? window.filter((h) => h.family === topic.category).length / window.length
    : 0;
  const target = Number(cat.weight || 0) / totalWeight;
  let score = (target - share) * 100;
  score += Number((rules.intentBonus || {})[topic.intent] || 0);
  score += (4 - Math.min(3, Math.max(1, Number(topic.priority) || 2))) * 3;
  if (history.slice(-3).some((h) => h.family === topic.category)) score -= 15;
  return score;
}

/**
 * Pick the next topic. Pure and deterministic.
 * @returns {{topic: object|null, score?: number, reason?: string, blocked: object}}
 */
function selectNextTopic({ backlog, articles = [], history = null, skipRotation = false }) {
  const rules = getRules(backlog);
  const hist = history || buildHistory(articles);
  const blocked = {};
  const candidates = [];
  for (const topic of backlog.topics) {
    if (!skipRotation) {
      if (!(topic.category in blocked)) {
        blocked[topic.category] = categoryBlockReason(topic.category, hist, rules);
      }
      if (blocked[topic.category]) continue;
    }
    if (topicUnavailableReason(topic, hist, backlog, rules)) continue;
    candidates.push({ topic, score: scoreTopic(topic, hist, backlog, rules) });
  }
  if (!candidates.length) {
    return { topic: null, reason: "no eligible topic left in the backlog", blocked };
  }
  candidates.sort(
    (a, b) =>
      b.score - a.score ||
      hashString(a.topic.id) - hashString(b.topic.id) ||
      a.topic.id.localeCompare(b.topic.id),
  );
  return { topic: candidates[0].topic, score: candidates[0].score, blocked };
}

/** Simulate the next `count` selections (each pick is appended to history). */
function simulateSequence({ backlog, articles = [], count = 12 }) {
  const history = buildHistory(articles);
  const sequence = [];
  for (let i = 0; i < count; i++) {
    const { topic } = selectNextTopic({ backlog, history });
    if (!topic) break;
    sequence.push(topic);
    history.push({
      slug: topic.id,
      title: topic.title,
      date: "",
      topicId: topic.id,
      family: topic.category,
    });
  }
  return sequence;
}

/**
 * Manual override (workflow inputs force_topic / force_topic_keywords /
 * force_topic_category). `topic` may be a backlog id or free text.
 */
function resolveForcedTopic(backlog, { topic, keywords = [], category = "" }) {
  const wanted = String(topic || "").trim();
  if (!wanted) return null;
  const byId = backlog.topics.find(
    (t) => t.id === wanted || t.id === slugify(wanted) || normalizeText(t.title) === normalizeText(wanted),
  );
  const cleanKeywords = (Array.isArray(keywords) ? keywords : [])
    .map((k) => String(k).trim())
    .filter(Boolean);
  if (byId) {
    if (!cleanKeywords.length) return byId;
    return {
      ...byId,
      keywords: { ...byId.keywords, fr: [...new Set([...cleanKeywords, ...byId.keywords.fr])] },
    };
  }
  const catIds = backlog.categories.map((c) => c.id);
  let cat = catIds.includes(category) ? category : classifyFamily({ title: wanted });
  if (!catIds.includes(cat)) cat = "implementation-guide";
  if (!catIds.includes(cat)) cat = catIds[0];
  const catDef = backlog.categories.find((c) => c.id === cat);
  const kw = cleanKeywords.length ? cleanKeywords : [wanted];
  return {
    id: slugify(wanted),
    category: cat,
    intent: "commercial",
    priority: 1,
    service: catDef.defaultService,
    siteCategory: catDef.siteCategory,
    title: wanted,
    angle: `Sujet demandé manuellement: ${wanted}.`,
    keywords: Object.fromEntries(LOCALES.map((l) => [l, kw])),
    forced: true,
  };
}

/**
 * Guard for a manual override: rotation rules still apply unless
 * skipRotation is set. Returns an error message or null.
 */
function forcedTopicViolation(backlog, topic, articles, { skipRotation = false } = {}) {
  if (skipRotation) return null;
  const rules = getRules(backlog);
  const history = buildHistory(articles);
  return (
    categoryBlockReason(topic.category, history, rules) ||
    topicUnavailableReason(topic, history, backlog, rules)
  );
}

/** Tags shown on the article card: the topic's own keywords, per locale. */
function topicTags(topic, locale) {
  const kw = (topic.keywords && (topic.keywords[locale] || topic.keywords.fr)) || [];
  return kw.slice(0, 4);
}

function topicSiteCategory(backlog, topic) {
  if (topic.siteCategory) return topic.siteCategory;
  const cat = backlog.categories.find((c) => c.id === topic.category);
  return cat ? cat.siteCategory : undefined;
}

// ---------------------------------------------------------------------------
// Guards on generated content
// ---------------------------------------------------------------------------

/**
 * Throws when the generated title/slug drifts into a capped family the
 * topic does not belong to, or paraphrases an existing or reserved article.
 */
function assertTopicFit({ backlog, topic, article, articles }) {
  const rules = getRules(backlog);
  const capped = Object.keys(rules.cappedCategories || {});
  const family = classifyFamily({ slug: article.slug, title: article.title });
  if (capped.includes(family) && topic.category !== family) {
    const err = new Error(
      `Le titre "${article.title}" relève de "${family}" alors que le sujet imposé est "${topic.title}" (${topic.category}). Reste strictement sur le sujet imposé.`,
    );
    err.code = "TOPIC_DRIFT";
    throw err;
  }
  const dup = findNearDuplicate(
    { title: article.title, slug: article.slug },
    [...buildHistory(articles), ...reservedEntries(backlog)],
    rules.similarityThreshold,
  );
  if (dup) {
    const err = new Error(
      `Le titre "${article.title}" est trop proche d'un article existant ou réservé ("${dup.title}"). Reformule autour du sujet imposé: "${topic.title}".`,
    );
    err.code = "NEAR_DUPLICATE";
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Lead path (CTA + internal links)
// ---------------------------------------------------------------------------

function resolveServiceLabel(root, locale, service) {
  const m = /^\/solutions\/([^/]+)$/.exec(service);
  if (m) {
    for (const loc of [locale, "fr"]) {
      try {
        const solutions = JSON.parse(
          fs.readFileSync(path.join(root, "src", "translations", loc, "solutions.json"), "utf8"),
        );
        const title = solutions[m[1]] && solutions[m[1]].hero && solutions[m[1]].hero.title;
        if (title) {
          // Mid-sentence anchor: lower the initial in Romance languages only,
          // and never for acronyms ("AI-agent…") or German nouns.
          const lower = ["fr", "es", "pt"].includes(loc) && /^[A-ZÀ-Ý][a-zà-ÿ]/.test(title);
          return lower ? title.charAt(0).toLowerCase() + title.slice(1) : title;
        }
      } catch {
        // fall through to the generic label
      }
    }
    return SERVICE_LABELS["/solutions"][locale];
  }
  const labels = SERVICE_LABELS[service] || SERVICE_LABELS["/services/ai-consulting"];
  return labels[locale] || labels.fr;
}

function leadLinks(locale, service) {
  return {
    service: `/${locale}${service.replace(/\/+$/, "")}/`,
    contact: `/${locale}/contact/`,
  };
}

function buildLeadBlock({ locale, service, serviceLabel }) {
  const copy = LEAD_COPY[locale] || LEAD_COPY.fr;
  const links = leadLinks(locale, service);
  const serviceLink = `[${serviceLabel}](${links.service})`;
  const contactLink = `[${copy.contact}](${links.contact})`;
  return `## ${copy.heading}\n\n${copy.body(serviceLink, contactLink)}`;
}

function hasLeadPath(content, locale, service) {
  const links = leadLinks(locale, service);
  const text = String(content || "");
  return text.includes(`](${links.contact})`) && text.includes(`](${links.service})`);
}

/**
 * Insert the CTA block before the trailing references section (or at the
 * end). Idempotent.
 */
function insertLeadPath(content, { locale, service, serviceLabel }) {
  const text = String(content || "").trimEnd();
  if (hasLeadPath(text, locale, service)) return `${text}\n`;
  const block = buildLeadBlock({ locale, service, serviceLabel });
  const re = /\n+---\s*\n#{2,3} [^\n]*\n(?:- \[[^\n]*\n?)+\s*$/;
  const m = re.exec(text);
  if (m) {
    return `${text.slice(0, m.index).trimEnd()}\n\n${block}\n${text.slice(m.index).replace(/^\n+/, "\n")}\n`;
  }
  return `${text}\n\n${block}\n`;
}

function assertLeadPath(article, locale, service) {
  if (!hasLeadPath(article.content, locale, service)) {
    const err = new Error(
      `Lead path missing in ${locale}:${article.slug} (expected links to ${leadLinks(locale, service).service} and ${leadLinks(locale, service).contact}).`,
    );
    err.code = "MISSING_LEAD_PATH";
    throw err;
  }
}

/** Point FR lead links to the target locale after a translation. */
function localizeLeadLinks(content, locale) {
  if (locale === "fr") return content;
  return String(content || "").replace(
    /\]\(\/fr\/(contact|services|products|solutions)(\/[^)\s]*)?\)/g,
    (_m, section, rest) => `](/${locale}/${section}${rest || ""})`,
  );
}

// ---------------------------------------------------------------------------
// Translation parity
// ---------------------------------------------------------------------------

function countH2(content) {
  return (String(content || "").match(/^##\s/gm) || []).length;
}

function countWords(content) {
  return String(content || "").trim().split(/\s+/).filter(Boolean).length;
}

/** Problems between the FR article and one localized version (empty = ok). */
function translationParityIssues(frArticle, localized, { minRatio = 0.5, h2Tolerance = 1 } = {}) {
  const issues = [];
  if (!localized) return ["missing article"];
  for (const key of ["slug", "date", "category", "topicId", "topicFamily"]) {
    if ((frArticle[key] || "") !== (localized[key] || "")) {
      issues.push(`${key} differs ("${localized[key] || ""}" vs FR "${frArticle[key] || ""}")`);
    }
  }
  for (const key of ["title", "description", "content"]) {
    if (!localized[key]) issues.push(`${key} is empty`);
  }
  const h2Fr = countH2(frArticle.content);
  const h2Loc = countH2(localized.content);
  if (Math.abs(h2Fr - h2Loc) > h2Tolerance) {
    issues.push(`section count differs (${h2Loc} H2 vs FR ${h2Fr})`);
  }
  const wFr = countWords(frArticle.content);
  const wLoc = countWords(localized.content);
  if (wFr > 0 && wLoc / wFr < minRatio) {
    issues.push(`translation looks truncated (${wLoc} words vs FR ${wFr})`);
  }
  return issues;
}

module.exports = {
  LOCALES,
  INTENTS,
  BACKLOG_PATH,
  normalizeText,
  titleSimilarity,
  slugify,
  classifyFamily,
  loadBacklog,
  loadServicePaths,
  getRules,
  validateBacklog,
  buildHistory,
  countFamilies,
  findNearDuplicate,
  categoryBlockReason,
  selectNextTopic,
  simulateSequence,
  resolveForcedTopic,
  forcedTopicViolation,
  topicSiteCategory,
  topicTags,
  assertTopicFit,
  resolveServiceLabel,
  buildLeadBlock,
  hasLeadPath,
  insertLeadPath,
  assertLeadPath,
  localizeLeadLinks,
  translationParityIssues,
};
