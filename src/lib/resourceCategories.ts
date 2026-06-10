export const RESOURCE_CATEGORIES = [
  { id: "ai-strategy-adoption", label: "Stratégie et adoption IA" },
  { id: "microsoft-365-copilot", label: "Microsoft 365 et Copilot" },
  { id: "private-llm-rag", label: "LLM privés, RAG et GPT" },
  { id: "document-email-automation", label: "Automatisation documents et e-mails" },
  { id: "security-compliance", label: "Sécurité et conformité" },
  { id: "data-integration-analytics", label: "Données, intégration et analyse" },
  { id: "workflow-automation", label: "Automatisation des processus" },
  { id: "quality-governance", label: "Qualité, gouvernance et politiques IA" },
  { id: "case-studies", label: "Cas clients et retours d'expérience" },
  { id: "business-operations", label: "Opérations PME et services fiduciaires" },
] as const;

export type ResourceCategoryId = (typeof RESOURCE_CATEGORIES)[number]["id"];

export type ResourceArticleForCategory = {
  slug?: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
};

const FALLBACK_CATEGORY_ID: ResourceCategoryId = "ai-strategy-adoption";

const keywordMap: Record<ResourceCategoryId, string[]> = {
  "ai-strategy-adoption": [
    "adoption",
    "roi",
    "transformation",
    "déploiement",
    "deploiement",
    "stratégie",
    "strategie",
    "entreprise",
    "usage",
  ],
  "microsoft-365-copilot": [
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
  "private-llm-rag": [
    "llm",
    "rag",
    "gpt",
    "openai",
    "azure openai",
    "fine-tuning",
    "embedding",
    "recherche sémantique",
    "recherche semantique",
    "assistant ia",
  ],
  "document-email-automation": [
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
    "procès-verbal",
    "proces-verbal",
  ],
  "security-compliance": [
    "sécurité",
    "securite",
    "conformité",
    "conformite",
    "rgpd",
    "lpd",
    "nlpd",
    "données sensibles",
    "donnees sensibles",
    "confidentialité",
    "confidentialite",
    "zero trust",
    "accès",
    "acces",
  ],
  "data-integration-analytics": [
    "données",
    "donnees",
    "intégration",
    "integration",
    "power bi",
    "azure ml",
    "machine learning",
    "analyse",
    "tableau de bord",
    "prédictive",
    "predictive",
    "vision",
  ],
  "workflow-automation": [
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
  "quality-governance": [
    "gouvernance",
    "politique",
    "qualité",
    "qualite",
    "scoring",
    "régression",
    "regression",
    "test",
    "tests",
    "monitoring",
    "guardrails",
    "éthique",
    "ethique",
  ],
  "case-studies": [
    "ark",
    "fiduciaire",
    "cas",
    "retour d'expérience",
    "retour d’experience",
    "retour d’expérience",
    "a réduit",
    "a reduit",
    "une société",
    "un cabinet",
    "une banque",
  ],
  "business-operations": [
    "tva",
    "paie",
    "lpp",
    "fiscal",
    "fiscalité",
    "fiscalite",
    "comptabilité",
    "comptabilite",
    "odoo",
    "pme",
    "genève",
    "geneve",
    "suisse romande",
    "fusion",
    "acquisition",
    "domiciliation",
    "salaire",
  ],
};

export { keywordMap };

function normalize(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function detectCategory(article: ResourceArticleForCategory): ResourceCategoryId {
  if (article.category && isResourceCategoryId(article.category)) {
    return article.category;
  }

  const text = normalize(
    [article.slug, article.title, article.description, article.tags?.join(" ")]
      .filter(Boolean)
      .join(" "),
  );
  let best: { id: ResourceCategoryId; score: number } = {
    id: FALLBACK_CATEGORY_ID,
    score: 0,
  };

  for (const [id, keywords] of Object.entries(keywordMap) as Array<
    [ResourceCategoryId, string[]]
  >) {
    const score = keywords.reduce(
      (sum, keyword) => (text.includes(normalize(keyword)) ? sum + keyword.length : sum),
      0,
    );
    if (score > best.score) best = { id, score };
  }

  return best.id;
}

export function buildResourceCategories<T extends ResourceArticleForCategory>(
  articles: T[],
) {
  return RESOURCE_CATEGORIES.map((category) => ({
    ...category,
    articles: articles.filter((article) => detectCategory(article) === category.id),
  })).filter((category) => category.articles.length > 0);
}

export function getResourceCategoryLabel(categoryId?: string) {
  return (
    RESOURCE_CATEGORIES.find((category) => category.id === categoryId)?.label ||
    RESOURCE_CATEGORIES.find((category) => category.id === FALLBACK_CATEGORY_ID)!.label
  );
}

export function isResourceCategoryId(value: string): value is ResourceCategoryId {
  return RESOURCE_CATEGORIES.some((category) => category.id === value);
}
