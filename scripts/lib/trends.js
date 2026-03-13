"use strict";
/**
 * Trend signals for topic selection (Houle).
 *
 * Goals:
 * - Pick business-relevant topics for Houle's services.
 * - Stay robust in CI: no extra npm deps required.
 * - Prefer editorial rotation when "trends" are irrelevant (sports/celebs/etc.).
 *
 * Providers (TRENDS_PROVIDER):
 * - hybrid (default): google-trends-api if installed, else Google Trends RSS + evergreen rotation + Google Suggest
 * - google_rss: Google Trends RSS only
 * - google_trends: google-trends-api only (optional dependency)
 *
 * Env:
 * - TRENDS_GEO (default: CH)
 * - TRENDS_LANGUAGE (default: fr)
 * - TRENDS_MAX_TOPICS (default: 10)
 * - TRENDS_SUGGEST (default: 1)
 * - TRENDS_SUGGEST_MAX (default: 8)
 */

const EVERGREEN_TOPICS = [
  // --- private-ai ---
  {
    topic: "ia-privee-microsoft-365-suisse",
    title: "IA privée pour Microsoft 365: architecture, hébergement en Suisse et bonnes pratiques",
    keywords: ["IA privée", "Microsoft 365", "hébergement en Suisse", "confidentialité", "sécurité", "conformité"],
    category: "private-ai",
    outline: ["Pourquoi l'IA privée", "Architecture cible", "Hébergement et isolation", "Gouvernance et contrôles", "Checklist de déploiement"],
  },
  {
    topic: "nlpd-rgpd-assistant-ia-entreprise",
    title: "nLPD et RGPD pour un assistant IA en entreprise: ce qu'il faut documenter",
    keywords: ["nLPD", "RGPD", "protection des données", "assistant IA", "registre des traitements", "DPIA"],
    category: "private-ai",
    outline: ["Cadre légal", "Données et finalités", "Mesures techniques et organisationnelles", "Sous-traitants", "Checklist conformité"],
  },
  {
    topic: "ia-on-prem-ou-cloud-choisir",
    title: "IA on-prem vs cloud: critères pour choisir (données sensibles, latence, coûts)",
    keywords: ["on-prem", "cloud", "données sensibles", "latence", "coûts", "sécurité"],
    category: "private-ai",
    outline: ["Critères", "Modèles de menace", "Coûts", "Gouvernance", "Checklist"],
  },
  // --- microsoft-365 ---
  {
    topic: "outlook-add-in-tri-reponses-automatiques",
    title: "Outlook add-in: automatiser tri, réponses et suivi sans exposer vos emails",
    keywords: ["Outlook add-in", "automatisation", "emails", "productivité", "sécurité", "Microsoft 365"],
    category: "microsoft-365",
    outline: ["Cas d'usage", "Architecture et permissions", "Sécurité et logs", "Déploiement IT", "Erreurs fréquentes"],
  },
  {
    topic: "word-add-in-generation-documents-ia",
    title: "Word add-in: générer des documents fiables (contrats, PV, rapports) avec IA et sources internes",
    keywords: ["Word add-in", "génération de documents", "RAG", "modèles", "validation", "Microsoft 365"],
    category: "microsoft-365",
    outline: ["Cas d'usage", "Règles de qualité", "Sources et citations", "Process de validation", "Checklist"],
  },
  // --- automation ---
  {
    topic: "automatisation-ia-workflows-gains-rapides",
    title: "Automatiser les workflows avec l'IA: 10 gains de productivité pour équipes IT",
    keywords: ["automatisation", "workflow", "Power Automate", "productivité", "IA", "processus"],
    category: "automation",
    outline: ["Prioriser les processus", "Exemples concrets", "Contrôles et audit", "Déploiement", "Erreurs fréquentes"],
  },
  {
    topic: "power-automate-ia-processus-rh-finance",
    title: "Power Automate et IA: automatiser les processus RH et finance conformément",
    keywords: ["Power Automate", "automatisation", "RH", "finance", "conformité", "IA"],
    category: "automation",
    outline: ["Cas d'usage RH", "Cas d'usage finance", "Contrôles de conformité", "Déploiement", "Checklist"],
  },
  // --- rag-architecture ---
  {
    topic: "rag-ou-finetuning-choisir",
    title: "RAG ou fine-tuning: comment choisir pour des documents internes (et éviter les hallucinations)",
    keywords: ["RAG", "fine-tuning", "hallucinations", "documents internes", "évaluation", "qualité"],
    category: "rag-architecture",
    outline: ["Définitions", "Quand RAG est meilleur", "Quand fine-tuning aide", "Évaluation et métriques", "Plan de mise en œuvre"],
  },
  {
    topic: "chunking-strategies-rag-performance",
    title: "Stratégies de chunking pour un RAG performant: taille, overlap et re-ranking",
    keywords: ["chunking", "RAG", "re-ranking", "embeddings", "overlap", "performance"],
    category: "rag-architecture",
    outline: ["Pourquoi le chunking compte", "Taille et overlap", "Re-ranking", "Métriques", "Exemples"],
  },
  // --- prompt-engineering ---
  {
    topic: "evaluation-qualite-prompts-llm",
    title: "Évaluer la qualité d'un assistant IA: jeux de tests, scoring et régression",
    keywords: ["évaluation", "prompt", "LLM", "tests", "régression", "qualité"],
    category: "prompt-engineering",
    outline: ["Pourquoi tester", "Jeux de tests", "Métriques", "CI et régression", "Bonnes pratiques"],
  },
  {
    topic: "prompt-engineering-techniques-avancees",
    title: "Prompt engineering avancé: chain-of-thought, few-shot et system prompts efficaces",
    keywords: ["prompt engineering", "chain-of-thought", "few-shot", "system prompt", "LLM", "qualité"],
    category: "prompt-engineering",
    outline: ["Fondamentaux", "Chain-of-thought", "Few-shot learning", "System prompts", "Erreurs courantes"],
  },
  // --- cloud-infra ---
  {
    topic: "azure-openai-entreprise-checklist-securite",
    title: "Azure OpenAI en entreprise: checklist sécurité, réseau, clés et monitoring",
    keywords: ["Azure OpenAI", "sécurité", "réseau", "monitoring", "clés", "RBAC"],
    category: "cloud-infra",
    outline: ["Architecture réseau", "Gestion des identités", "Secrets et clés", "Observabilité", "Checklist déploiement"],
  },
  {
    topic: "gpu-serverless-vs-dedicated-ia",
    title: "GPU serverless ou dédié pour l'IA: coûts, latence et architecture sur Azure",
    keywords: ["GPU", "serverless", "Azure", "latence", "coûts", "infrastructure IA"],
    category: "cloud-infra",
    outline: ["Serverless vs dédié", "Cas d'usage", "Coûts", "Architecture", "Checklist"],
  },
  // --- governance ---
  {
    topic: "politique-usage-ia-entreprise-rediger",
    title: "Rédiger une politique d'usage de l'IA en entreprise: modèle et clauses",
    keywords: ["politique IA", "gouvernance", "usage acceptable", "conformité", "charte", "employés"],
    category: "governance",
    outline: ["Pourquoi une politique", "Clauses obligatoires", "Gouvernance", "Communication", "Révision"],
  },
  {
    topic: "comite-ethique-ia-entreprise-mise-en-place",
    title: "Mettre en place un comité éthique IA: rôles, processus et critères d'évaluation",
    keywords: ["comité éthique", "IA", "gouvernance", "évaluation", "risques", "processus"],
    category: "governance",
    outline: ["Pourquoi un comité", "Composition", "Critères d'évaluation", "Processus de décision", "Suivi"],
  },
  // --- adoption-roi ---
  {
    topic: "strategie-adoption-ia-roi-gouvernance",
    title: "Adoption IA: cadrer le ROI, la gouvernance et les risques avant de déployer",
    keywords: ["adoption IA", "ROI", "gouvernance", "risques", "pilotage", "change management"],
    category: "adoption-roi",
    outline: ["Choisir les cas d'usage", "Modèle de gouvernance", "KPIs et ROI", "Gestion des risques", "Feuille de route 90 jours"],
  },
  {
    topic: "mesurer-roi-ia-entreprise-kpis-pilotage",
    title: "Mesurer le ROI de l'IA en entreprise: KPIs, tableaux de bord et pilotage",
    keywords: ["ROI IA", "KPIs", "tableau de bord", "pilotage", "valeur ajoutée", "dirigeants"],
    category: "adoption-roi",
    outline: ["Définir le ROI IA", "KPIs métier", "Tableau de bord", "Feuille de route", "Erreurs fréquentes"],
  },
  // --- copilot ---
  {
    topic: "copilot-microsoft-365-deploiement-guide",
    title: "Copilot pour Microsoft 365: guide de déploiement, licences et bonnes pratiques",
    keywords: ["Copilot", "Microsoft 365", "déploiement", "licences", "productivité", "IA"],
    category: "copilot",
    outline: ["Qu'est-ce que Copilot", "Licences et prérequis", "Déploiement", "Formation", "Mesurer l'impact"],
  },
  {
    topic: "agents-ia-autonomes-multi-agents-entreprise",
    title: "Agents IA autonomes et multi-agents: architecturer des workflows intelligents en entreprise",
    keywords: ["agents IA", "multi-agent", "agentic", "workflow", "autonome", "orchestration"],
    category: "copilot",
    outline: ["Agents vs assistants", "Architecture multi-agent", "Cas d'usage", "Risques", "Mise en œuvre"],
  },
  // --- data-analytics ---
  {
    topic: "power-bi-ia-tableaux-bord-predictifs",
    title: "Power BI et IA: créer des tableaux de bord prédictifs pour dirigeants",
    keywords: ["Power BI", "IA", "prédictif", "tableau de bord", "analyse", "dirigeants"],
    category: "data-analytics",
    outline: ["Pourquoi le prédictif", "Intégration IA", "Exemples", "Gouvernance données", "Bonnes pratiques"],
  },
  {
    topic: "machine-learning-donnees-entreprise-pipeline",
    title: "Pipeline ML sur données d'entreprise: de la collecte au déploiement du modèle",
    keywords: ["machine learning", "pipeline", "données", "modèle", "déploiement", "MLOps"],
    category: "data-analytics",
    outline: ["Collecte et nettoyage", "Feature engineering", "Entraînement", "Déploiement", "Monitoring"],
  },
  // --- cybersecurity-ai ---
  {
    topic: "cybersecurite-ia-detection-menaces",
    title: "IA et cybersécurité: détecter les menaces plus vite avec le machine learning",
    keywords: ["cybersécurité", "IA", "détection menaces", "machine learning", "SOC", "anomalies"],
    category: "cybersecurity-ai",
    outline: ["Paysage des menaces", "IA pour la détection", "Intégration SOC", "Faux positifs", "Bonnes pratiques"],
  },
  {
    topic: "zero-trust-ia-identite-acces",
    title: "Zero trust et IA: renforcer la gestion des identités et des accès",
    keywords: ["zero trust", "IA", "identité", "accès", "RBAC", "sécurité"],
    category: "cybersecurity-ai",
    outline: ["Principes zero trust", "IA pour l'authentification", "Détection anomalies", "Architecture", "Mise en œuvre"],
  },
  // --- sector-use-cases ---
  {
    topic: "ia-sante-cas-usage-suisse",
    title: "IA dans la santé en Suisse: cas d'usage, réglementation et perspectives",
    keywords: ["IA santé", "Suisse", "cas d'usage", "réglementation", "données patients", "éthique"],
    category: "sector-use-cases",
    outline: ["Cas d'usage cliniques", "Réglementation suisse", "Protection des données", "Exemples concrets", "Perspectives"],
  },
  {
    topic: "ia-rh-recrutement-gestion-talents",
    title: "IA pour les RH: automatiser le recrutement et la gestion des talents",
    keywords: ["IA RH", "recrutement", "gestion des talents", "automatisation", "biais", "éthique"],
    category: "sector-use-cases",
    outline: ["Screening CV", "Chatbots RH", "Gestion des talents", "Biais algorithmiques", "Bonnes pratiques"],
  },
];

function isoDateToday() {
  return new Date().toISOString().slice(0, 10);
}

function safeText(s) {
  if (!s || typeof s !== "string") return "";
  return s.replace(/\s+/g, " ").trim();
}

function decodeXmlEntities(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractXmlTag(block, tag) {
  const m = block.match(
    new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"),
  );
  return m ? decodeXmlEntities(m[1]) : "";
}

function extractXmlTags(block, tag) {
  const rx = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "ig");
  const out = [];
  let m;
  while ((m = rx.exec(block))) out.push(decodeXmlEntities(m[1]));
  return out;
}

async function fetchText(url, { timeoutMs = 8000, headers = null } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "*/*",
        ...(headers || {}),
      },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

async function fetchGoogleTrendingRss(config = {}) {
  const {
    geo = process.env.TRENDS_GEO || "CH",
    hl = (process.env.TRENDS_LANGUAGE || "fr") + "-CH",
    maxTopics = parseInt(process.env.TRENDS_MAX_TOPICS || "10", 10),
  } = config;

  const url = `https://trends.google.com/trending/rss?geo=${encodeURIComponent(
    geo,
  )}&hl=${encodeURIComponent(hl)}`;
  try {
    const xml = await fetchText(url, {
      timeoutMs: 8000,
      headers: {
        Accept:
          "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5",
      },
    });
    const items = xml
      .split(/<item>/i)
      .slice(1)
      .map((s) => s.split(/<\/item>/i)[0] || "");
    const topics = [];
    for (const raw of items) {
      const title = safeText(extractXmlTag(raw, "title"));
      if (!title) continue;
      const traffic = safeText(extractXmlTag(raw, "ht:approx_traffic"));
      const pubDate = safeText(extractXmlTag(raw, "pubDate"));
      const newsUrls = extractXmlTags(raw, "ht:news_item_url").slice(0, 3);
      const newsSources = extractXmlTags(raw, "ht:news_item_source").slice(0, 3);
      const articles = [];
      for (let i = 0; i < Math.min(newsUrls.length, newsSources.length, 3); i++) {
        articles.push({ title: "", source: newsSources[i], url: newsUrls[i] });
      }
      topics.push({
        title,
        traffic: traffic || "unknown",
        relatedQueries: [],
        articles,
        pubDate,
      });
      if (topics.length >= Math.max(5, maxTopics * 2)) break;
    }
    return { topics: topics.slice(0, maxTopics), geo, language: hl, timestamp: new Date().toISOString() };
  } catch (error) {
    console.warn(`[trends] Google RSS error: ${error.message}`);
    return { topics: [], error: error.message };
  }
}

async function fetchGoogleSuggest(keyword, config = {}) {
  const { hl = process.env.TRENDS_LANGUAGE || "fr" } = config;
  const suggestUrl =
    "https://suggestqueries.google.com/complete/search" +
    `?client=firefox&hl=${encodeURIComponent(hl)}&q=${encodeURIComponent(keyword)}`;
  try {
    const text = await fetchText(suggestUrl, {
      timeoutMs: 6000,
      headers: { Accept: "application/json, text/plain;q=0.9, */*;q=0.5" },
    });
    const parsed = JSON.parse(text);
    const suggestions = Array.isArray(parsed?.[1]) ? parsed[1] : [];
    return suggestions.map(safeText).filter(Boolean);
  } catch {
    return [];
  }
}

async function fetchGoogleTrends(config = {}) {
  const {
    geo = process.env.TRENDS_GEO || "CH",
    hl = process.env.TRENDS_LANGUAGE || "fr",
    maxTopics = parseInt(process.env.TRENDS_MAX_TOPICS || "10", 10),
  } = config;

  let googleTrends;
  try {
    googleTrends = require("google-trends-api");
  } catch (err) {
    console.warn("[trends] google-trends-api not installed, falling back to RSS/evergreen topics");
    return { topics: [], error: "google-trends-api not installed" };
  }

  try {
    const dailyTrendsResult = await googleTrends.dailyTrends({ geo, hl });
    const parsed = JSON.parse(dailyTrendsResult);
    const trendingSearchesDays = parsed?.default?.trendingSearchesDays || [];
    const allTrends = [];
    for (const day of trendingSearchesDays) {
      const searches = day?.trendingSearches || [];
      for (const search of searches) {
        if (allTrends.length >= maxTopics * 2) break;
        allTrends.push({
          title: search.title?.query || "",
          traffic: search.formattedTraffic || "",
          relatedQueries: (search.relatedQueries || []).map((q) => q.query).slice(0, 5),
          articles: (search.articles || [])
            .map((a) => ({ title: a.title || "", source: a.source || "", url: a.url || "" }))
            .slice(0, 3),
        });
      }
    }
    return { topics: allTrends.slice(0, maxTopics), geo, language: hl, timestamp: new Date().toISOString() };
  } catch (error) {
    console.warn(`[trends] Google Trends API error: ${error.message}`);
    return { topics: [], error: error.message };
  }
}

function filterRelevantTrends(trends = []) {
  const relevantKeywords = [
    /microsoft/i,
    /microsoft 365/i,
    /\bm365\b/i,
    /office 365/i,
    /outlook/i,
    /word/i,
    /excel/i,
    /powerpoint/i,
    /teams/i,
    /add-?in/i,
    /extension/i,
    /\bllm\b/i,
    /\bgpt\b/i,
    /openai/i,
    /azure/i,
    /\brag\b/i,
    /\bvector\b/i,
    /prompt/i,
    /agent/i,
    /automation|automatisation/i,
    /productivit[ée]/i,
    /s[ée]curit[ée]/i,
    /privacy|confidentialit[ée]/i,
    /gdpr|rgpd/i,
    /nlpd/i,
    /compliance|conformit[ée]/i,
    /entreprise|enterprise/i,
    /suisse|switzerland/i,
  ];

  return trends.filter((trend) => {
    const searchText = `${trend.title || ""} ${(trend.relatedQueries || []).join(" ")}`.toLowerCase();

    // Avoid false positives on short tokens (e.g. "braga" contains "rag").
    // Require at least one strong signal OR two weak signals.
    const matches = relevantKeywords.filter((rx) => rx.test(searchText));
    if (matches.length === 0) return false;

    const strongSignals = [
      /\bm365\b/i,
      /microsoft 365/i,
      /office 365/i,
      /outlook/i,
      /teams/i,
      /\bgpt\b/i,
      /\bllm\b/i,
      /openai/i,
      /azure/i,
      /gdpr|rgpd/i,
      /nlpd/i,
    ];
    const hasStrong = strongSignals.some((rx) => rx.test(searchText));
    return hasStrong || matches.length >= 2;
  });
}

function guessCategoryFromText(text) {
  const s = String(text || "").toLowerCase();
  // Order matters: more specific patterns first
  if (/(rgpd|gdpr|nlpd|privacy|confidentialit|protection des donn|on-?prem|souverainet)/i.test(s)) return "private-ai";
  if (/(outlook|word|excel|powerpoint|teams|office 365|microsoft 365|add-?in|compl[ée]ment|sharepoint)/i.test(s))
    return "microsoft-365";
  if (/(copilot|assistant\s*(?:ia|ai|virtuel)|agent\s*(?:ia|ai|intelligent|autonome)|chatbot|multi[- ]agent|agentic)/i.test(s))
    return "copilot";
  if (/(cybers[ée]cu|d[ée]tection\s*(?:menace|intrusion)|zero\s*trust|phishing.*ia|soc\b.*ia)/i.test(s))
    return "cybersecurity-ai";
  if (/(\brag\b|retrieval|vector|embedding|fine-?tuning|guardrail|hallucin|chunking|re-?rank)/i.test(s))
    return "rag-architecture";
  if (/(prompt\s*engineering|system\s*prompt|chain[- ]of[- ]thought|few[- ]shot|zero[- ]shot|scoring.*llm|jeux?\s+de\s+tests?)/i.test(s))
    return "prompt-engineering";
  if (/(azure\s*(?:open\s*ai|ai|cognitive)|\brbac\b|infrastructure.*(?:ia|cloud)|\baks\b|\bgpu\b|api\s*management)/i.test(s))
    return "cloud-infra";
  if (/(power\s*(?:automate|apps|platform)|\brpa\b|no-?code.*ia|low-?code.*ia|workflow.*(?:ia|automatis)|automatis.*workflow)/i.test(s))
    return "automation";
  if (/(gouvernance\s*(?:ia|ai)|politique\s*(?:ia|ai)|charte\s*(?:ia|ai)|[ée]thique\s*(?:ia|ai)|ai\s*act|usage\s*responsable)/i.test(s))
    return "governance";
  if (/(adoption\s*(?:ia|ai)|\broi\b.*(?:ia|ai)|conduite\s+du\s+changement|transformation\s*(?:num|digit)|feuille\s+de\s+route|strat[ée]gie\s+(?:ia|ai))/i.test(s))
    return "adoption-roi";
  if (/(power\s*bi|business\s*intelligence|analyse\s+(?:donn|pr[ée]dict)|machine\s*learning|data\s*(?:lake|warehouse|pipeline)|\bml\b.*(?:mod|pipeline))/i.test(s))
    return "data-analytics";
  if (/(cas\s+d[''']usage|sant[ée].*ia|ia.*sant[ée]|finance.*ia|ia.*finance|industri.*(?:ia|4\.0)|\brh\b.*ia|ia.*\brh\b|logistique.*ia|juridique.*ia)/i.test(s))
    return "sector-use-cases";
  return "general";
}

function mapTrendToArticleParams(trend, existingSlugs = []) {
  if (!trend || !trend.title) return null;

  const title = trend.title;
  const keywords = [title, ...(trend.relatedQueries || [])].filter(Boolean).slice(0, 6);

  const baseSlug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);

  let slug = baseSlug;
  let counter = 1;
  while (existingSlugs.includes(slug)) slug = `${baseSlug}-${counter++}`;

  return {
    suggestedTopic: title,
    keywords,
    suggestedSlug: slug,
    category: guessCategoryFromText(title),
    trendSignal: {
      traffic: trend.traffic || "unknown",
      sources: (trend.articles || []).map((a) => a.source).filter(Boolean).slice(0, 3),
      relatedQueries: trend.relatedQueries || [],
    },
  };
}

function scoreEvergreenTopic(topic, { avoidTopics = [], recentTopicCategories = [], topicCounts = null } = {}) {
  if (!topic) return -Infinity;
  if (avoidTopics.includes(topic.category)) return -Infinity;
  if (recentTopicCategories.includes(topic.category)) return -50;

  let score = 0;
  score += recentTopicCategories.includes(topic.category) ? 0 : 15;
  if (topicCounts && typeof topicCounts === "object") {
    const count = Number(topicCounts[topic.category]);
    if (Number.isFinite(count)) score += Math.max(0, 12 - count * 4);
  }

  const joined = `${topic.title} ${(topic.keywords || []).join(" ")}`.toLowerCase();
  if (/(checklist|guide|architecture|s[ée]curit[ée]|conformit|d[ée]ployer|monitoring|gouvernance|roi|tests|r[ée]gression)/i.test(joined))
    score += 10;
  if (/(entreprise|it|dsi|s[ée]curit[ée]|compliance|microsoft 365|outlook|word|azure)/i.test(joined)) score += 8;
  return score;
}

async function enrichKeywordsWithSuggest(topic) {
  const enabled = (process.env.TRENDS_SUGGEST || "1") === "1";
  if (!enabled || !topic) return topic;
  const max = parseInt(process.env.TRENDS_SUGGEST_MAX || "8", 10);
  const base = topic.keywords?.[0] || topic.suggestedTopic || topic.title;
  if (!base) return topic;
  const suggestions = await fetchGoogleSuggest(base, {});
  const cleaned = suggestions
    .map((s) => s.replace(/\s*\(\s*.*?\s*\)\s*/g, " ").trim())
    .filter(Boolean)
    .filter((s) => s.length >= 8 && s.length <= 80)
    .filter((s) => !/^(youtube|facebook|instagram|tiktok)\b/i.test(s));

  const merged = [
    ...(Array.isArray(topic.keywords) ? topic.keywords : []).slice(0, 6),
    ...cleaned.slice(0, max),
  ];
  const uniq = [];
  const seen = new Set();
  for (const k of merged) {
    const norm = k.toLowerCase();
    if (seen.has(norm)) continue;
    seen.add(norm);
    uniq.push(k);
  }
  return {
    ...topic,
    keywords: uniq.slice(0, 10),
    trendSignal: {
      ...(topic.trendSignal || {}),
      suggest: { base, suggestions: cleaned.slice(0, max) },
      indicators: [ ...(((topic.trendSignal || {}).indicators) || []), "google_suggest" ],
    },
  };
}

async function getTopicSuggestions(options = {}) {
  const { existingSlugs = [], avoidTopics = [], recentTopicCategories = [], topicCounts = null } = options;

  const provider = process.env.TRENDS_PROVIDER || "hybrid";
  let trendsResult = { topics: [], error: null };
  let usedFallback = false;
  let selectedTopic = null;

  if (provider === "google_trends") {
    trendsResult = await fetchGoogleTrends();
  } else if (provider === "google_rss") {
    trendsResult = await fetchGoogleTrendingRss();
  } else {
    trendsResult = await fetchGoogleTrends();
    if (!Array.isArray(trendsResult.topics) || trendsResult.topics.length === 0) {
      trendsResult = await fetchGoogleTrendingRss();
    }
  }

  const relevantTrends = filterRelevantTrends(trendsResult.topics || []);
  if (relevantTrends.length > 0) {
    for (const trend of relevantTrends) {
      const params = mapTrendToArticleParams(trend, existingSlugs);
      if (!params) continue;
      if (avoidTopics.includes(params.category)) continue;
      selectedTopic = params;
      selectedTopic.trendSignal = {
        ...(selectedTopic.trendSignal || {}),
        indicators: [
          provider === "google_rss" ? "google_trends_rss" : "google_trends_api",
        ],
      };
      break;
    }
  }

  if (!selectedTopic) {
    usedFallback = true;
    console.log("[trends] No suitable trending topic found, using evergreen topics");
    const candidates = EVERGREEN_TOPICS
      .filter((t) => !existingSlugs.includes(t.topic))
      .filter((t) => !avoidTopics.includes(t.category))
      .map((t) => ({
        t,
        score: scoreEvergreenTopic(t, { avoidTopics, recentTopicCategories, topicCounts }),
      }))
      .sort((a, b) => b.score - a.score);
    // When all categories are in avoidTopics (complete cycle), relax the constraint
    // and pick the topic from the least-frequently-used category instead of
    // hard-coding EVERGREEN_TOPICS[0] which is always the same "private-ai" topic.
    let best;
    if (candidates.length > 0) {
      best = candidates[0].t;
    } else {
      const relaxedCandidates = EVERGREEN_TOPICS
        .filter((t) => !existingSlugs.includes(t.topic))
        .map((t) => ({
          t,
          count: (topicCounts && typeof topicCounts === "object")
            ? (Number(topicCounts[t.category]) || 0)
            : 0,
        }))
        .sort((a, b) => a.count - b.count);
      best = (relaxedCandidates[0] && relaxedCandidates[0].t) || EVERGREEN_TOPICS[0];
      const bestCount = (topicCounts && typeof topicCounts === "object") ? (Number(topicCounts[best.category]) || 0) : "?";
      console.log(`[trends] All categories in avoidTopics; relaxed selection: "${best.category}" (count: ${bestCount})`);
    }
    selectedTopic = {
      suggestedTopic: best.title,
      keywords: best.keywords,
      suggestedSlug: best.topic,
      category: best.category,
      outline: best.outline,
      trendSignal: { source: "evergreen_fallback", indicators: ["evergreen_rotation"], date: isoDateToday() },
    };
  }

  selectedTopic = await enrichKeywordsWithSuggest(selectedTopic);

  return {
    selectedTopic,
    usedFallback,
    trendsChecked: Array.isArray(trendsResult.topics) ? trendsResult.topics.length : 0,
    relevantTrendsChecked: relevantTrends.length,
    provider,
    error: trendsResult.error || null,
  };
}

function buildSEOSuggestions(topicParams) {
  if (!topicParams) return null;

  const { suggestedTopic, keywords = [], category } = topicParams;
  const primaryKeyword = keywords[0] || suggestedTopic;
  const secondaryKeywords = keywords.slice(1, 7);
  const localKeywords = ["Suisse", "Genève", "Microsoft 365", "IA privée"];
  const allKeywords = [...new Set([primaryKeyword, ...secondaryKeywords, ...localKeywords])];

  const metaTitle = `${suggestedTopic} | houle`.slice(0, 60);
  const metaDescription = `Guide concret sur ${primaryKeyword.toLowerCase()} pour équipes IT et métiers. Sécurité, conformité et intégration Microsoft 365. houle.`.slice(0, 160);

  return { primaryKeyword, secondaryKeywords, allKeywords, metaTitle, metaDescription, category: category || "general" };
}

module.exports = {
  fetchGoogleTrends,
  fetchGoogleTrendingRss,
  fetchGoogleSuggest,
  filterRelevantTrends,
  mapTrendToArticleParams,
  getTopicSuggestions,
  buildSEOSuggestions,
  EVERGREEN_TOPICS,
};
