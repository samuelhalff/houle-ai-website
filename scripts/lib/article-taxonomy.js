"use strict";

const RESOURCE_CATEGORIES = [
  {
    id: "ai-strategy-adoption",
    label: "Stratégie et adoption IA",
    keywords: [
      "adoption",
      "roi",
      "transformation",
      "deploiement",
      "déploiement",
      "strategie",
      "stratégie",
      "entreprise",
      "usage",
    ],
    tags: ["adoption ia", "roi", "transformation digitale", "gouvernance"],
  },
  {
    id: "microsoft-365-copilot",
    label: "Microsoft 365 et Copilot",
    keywords: [
      "microsoft 365",
      "m365",
      "copilot",
      "office 365",
      "teams",
      "sharepoint",
      "outlook",
      "word",
      "planner",
    ],
    tags: ["microsoft 365", "copilot", "teams", "sharepoint"],
  },
  {
    id: "private-llm-rag",
    label: "LLM privés, RAG et GPT",
    keywords: [
      "llm",
      "rag",
      "gpt",
      "openai",
      "azure openai",
      "fine-tuning",
      "embedding",
      "recherche semantique",
      "recherche sémantique",
      "assistant ia",
    ],
    tags: ["llm", "rag", "gpt privé", "azure openai"],
  },
  {
    id: "document-email-automation",
    label: "Automatisation documents et e-mails",
    keywords: [
      "document",
      "documents",
      "contrat",
      "contrats",
      "courrier",
      "email",
      "e-mail",
      "mail",
      "outlook",
      "word",
      "add-in",
      "proces-verbal",
      "procès-verbal",
    ],
    tags: ["automatisation documentaire", "outlook", "word", "add-in"],
  },
  {
    id: "security-compliance",
    label: "Sécurité et conformité",
    keywords: [
      "securite",
      "sécurité",
      "conformite",
      "conformité",
      "rgpd",
      "lpd",
      "nlpd",
      "donnees sensibles",
      "données sensibles",
      "confidentialite",
      "confidentialité",
      "zero trust",
      "acces",
      "accès",
    ],
    tags: ["sécurité", "conformité", "nLPD", "rgpd"],
  },
  {
    id: "data-integration-analytics",
    label: "Données, intégration et analyse",
    keywords: [
      "donnees",
      "données",
      "integration",
      "intégration",
      "power bi",
      "azure ml",
      "machine learning",
      "analyse",
      "tableau de bord",
      "predictive",
      "prédictive",
      "vision",
    ],
    tags: ["données", "intégration", "power bi", "analytics"],
  },
  {
    id: "workflow-automation",
    label: "Automatisation des processus",
    keywords: [
      "automatisation",
      "workflow",
      "workflows",
      "power automate",
      "power platform",
      "approbation",
      "processus",
      "flux",
      "forms",
      "adaptive cards",
    ],
    tags: ["automatisation", "power automate", "workflow", "productivité"],
  },
  {
    id: "quality-governance",
    label: "Qualité, gouvernance et politiques IA",
    keywords: [
      "gouvernance",
      "politique",
      "qualite",
      "qualité",
      "scoring",
      "regression",
      "régression",
      "test",
      "tests",
      "monitoring",
      "guardrails",
      "ethique",
      "éthique",
    ],
    tags: ["gouvernance ia", "qualité", "politique ia", "monitoring"],
  },
  {
    id: "case-studies",
    label: "Cas clients et retours d'expérience",
    keywords: [
      "ark",
      "fiduciaire",
      "cas",
      "retour d'expérience",
      "retour d’experience",
      "retour d’expérience",
      "a reduit",
      "a réduit",
      "une société",
      "un cabinet",
      "une banque",
    ],
    tags: ["cas client", "retour d'expérience", "pme suisse", "résultats"],
  },
  {
    id: "business-operations",
    label: "Opérations PME et services fiduciaires",
    keywords: [
      "tva",
      "paie",
      "lpp",
      "fiscal",
      "fiscalite",
      "fiscalité",
      "comptabilite",
      "comptabilité",
      "odoo",
      "pme",
      "geneve",
      "genève",
      "suisse romande",
      "fusion",
      "acquisition",
      "domiciliation",
      "salaire",
    ],
    tags: ["pme", "opérations", "fiduciaire", "genève"],
  },
];

const FALLBACK_CATEGORY_ID = "ai-strategy-adoption";

function normalize(input) {
  return String(input || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function articleText(article) {
  return normalize(
    [
      article?.slug,
      article?.title,
      article?.description,
      Array.isArray(article?.tags) ? article.tags.join(" ") : "",
    ].join(" "),
  );
}

function detectCategory(article) {
  const text = articleText(article);
  let best = { id: FALLBACK_CATEGORY_ID, score: 0 };
  for (const category of RESOURCE_CATEGORIES) {
    let score = 0;
    for (const keyword of category.keywords) {
      if (text.includes(normalize(keyword))) score += keyword.length;
    }
    if (score > best.score) {
      best = { id: category.id, score };
    }
  }
  return best.id;
}

function buildTags(article, categoryId = detectCategory(article)) {
  const category =
    RESOURCE_CATEGORIES.find((item) => item.id === categoryId) ||
    RESOURCE_CATEGORIES.find((item) => item.id === FALLBACK_CATEGORY_ID);
  const text = articleText(article);
  const tags = new Set(category.tags);

  const keywordTags = [
    ["azure", "azure"],
    ["openai", "azure openai"],
    ["microsoft 365", "microsoft 365"],
    ["m365", "microsoft 365"],
    ["outlook", "outlook"],
    ["word", "word"],
    ["teams", "teams"],
    ["power automate", "power automate"],
    ["power platform", "power platform"],
    ["sharepoint", "sharepoint"],
    ["rag", "rag"],
    ["gpt", "gpt privé"],
    ["llm", "llm"],
    ["nlpd", "nLPD"],
    ["rgpd", "rgpd"],
    ["securite", "sécurité"],
    ["conformite", "conformité"],
    ["odoo", "odoo"],
    ["pme", "pme"],
    ["geneve", "genève"],
  ];

  for (const [needle, tag] of keywordTags) {
    if (text.includes(normalize(needle))) tags.add(tag);
    if (tags.size >= 6) break;
  }

  return Array.from(tags).slice(0, 6);
}

function applyArticleTaxonomy(article, options = {}) {
  if (!article || typeof article !== "object") return article;
  const category = options.category || article.category || detectCategory(article);
  article.category = category;
  article.tags = buildTags(article, category);
  if (options.updated) {
    article.updated = options.updated;
  }
  return article;
}

module.exports = {
  RESOURCE_CATEGORIES,
  FALLBACK_CATEGORY_ID,
  detectCategory,
  buildTags,
  applyArticleTaxonomy,
};
