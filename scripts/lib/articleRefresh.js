"use strict";

/**
 * Shared editorial rules + transactional "refresh an existing article" logic
 * (ported from ark-fid.ch scripts/lib/articleRefresh.js, adapted to houle:
 * lead-path block, brand rules, no tags regeneration).
 *
 * Pure (no network, no module-level side effects): every model call is injected
 * through `deps`, so the whole flow is testable with mocks.
 */

const fs = require("fs");
const path = require("path");

// Fields a refresh is allowed to regenerate on the FR article. Everything else
// (slug, date, category, author, image, tags, topicId, topicFamily, backlog and
// SEO fields, unknown fields...) is preserved untouched.
const GENERATED_FIELDS = ["title", "description", "content", "references"];
// Fields owned by the FR article and mirrored to locale entries when present.
// tags/topicId/topicFamily are deliberately NOT mirrored: locale entries keep
// their own (tags are localized, taxonomy ids are already identical).
const MIRRORED_FIELDS = [
  "date",
  "updated",
  "category",
  "author",
  "authorUrl",
  "image",
];
const TRANSLATED_FIELDS = ["title", "description", "content"];

/**
 * Editorial rules shared by every generation path (system prompt, two-step
 * draft, length recovery, retry, refresh). Topic drives structure; nothing is
 * mandatory beyond what the subject needs, and nothing may be invented.
 */
function buildStructureRules() {
  return [
    "- STRUCTURE DICTÉE PAR LE SUJET: autant de sections H2 que le sujet en demande (généralement 5 à 8), des H3 seulement si utile. Pas de plan imposé.",
    "- Un tableau ou une checklist uniquement s'il apporte une information que le texte n'exprime pas mieux. Pas de FAQ systématique: au plus 3 questions, seulement si des clients les posent réellement.",
    "- Ne rallonge jamais par remplissage (sections génériques, répétitions, FAQ ou tableaux ajoutés pour faire du volume).",
  ];
}

function buildNoFabricationRules() {
  return [
    "- AUCUNE INVENTION: pas d'anecdote, pas d'« observation de terrain », pas de formule du type « ce que nous voyons en projet », pas d'étude de cas chiffrée, pas de client ni d'entreprise type présentés comme réels, pas de gain ou de résultat promis.",
    "- Chiffres: uniquement s'ils sont sourcés (références fournies) ou s'il s'agit de seuils, taux ou délais légaux. Sans source, reste qualitatif.",
    "- Un exemple chiffré n'est admis que s'il est clairement présenté comme hypothétique (« Exemple fictif: … ») et sert à illustrer un calcul. Pas de « scénario chiffré » inventé.",
  ];
}

function buildOriginalityRule() {
  return "- ORIGINALITÉ: pas de synthèse de la documentation de l'éditeur (learn.microsoft.com, docs.mistral.ai…); apporte une lecture de praticien: arbitrages, ordre des étapes, points de vigilance, sans prétendre décrire des projets réels. Mentionne les contraintes suisses (nLPD, secret professionnel, hébergement) quand elles changent la réponse.";
}

function buildPractitionerRule(servicePath) {
  const where = servicePath
    ? `la page ${servicePath}`
    : "la page de service la plus pertinente";
  return `- PARAGRAPHE PRATICIEN: une courte section « Comment houle intervient » qui décrit seulement ce que houle fait sur ce sujet (périmètre, étapes de l'accompagnement: atelier, pilote, mise en production), sans résultat promis, sans chiffre ni cas client. N'y mets aucun lien: le bloc d'appel à l'action ajouté automatiquement juste après contient le lien vers ${where} et vers la page contact.`;
}

function buildEditorialRules({ servicePath = "" } = {}) {
  return [
    ...buildStructureRules(),
    ...buildNoFabricationRules(),
    buildOriginalityRule(),
    buildPractitionerRule(servicePath),
  ];
}

function toIsoDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

/** Sets `updated`, never touches `date`. Mutates and returns the article. */
function markUpdated(article, today) {
  if (!article || typeof article !== "object") return article;
  article.updated = toIsoDate(today);
  return article;
}

function buildRefreshResearchPrompt(article, { today, allowedDomainsPrompt = "" } = {}) {
  return [
    "Tu es un chercheur web pour houle.ai (conseil en IA indépendant des éditeurs, Suisse).",
    `Date actuelle: ${toIsoDate(today)}.`,
    `Objectif: fournir 6 à 10 références vérifiables (HTTP 200, pas de login) pour mettre à jour l'article existant « ${article.title} » (slug: ${article.slug}). Le sujet ne change pas.`,
    "- Inclure au moins 1 source officielle ou institutionnelle (admin.ch, edoeb.admin.ch, fedlex.admin.ch, nist.gov…) et au moins 2 documentations techniques de projets ou d'éditeurs différents, sans privilégier un éditeur.",
    "- Un domaine = un lien. Aucune URL inventée.",
    allowedDomainsPrompt,
    'Retourne STRICTEMENT un JSON: { "references": [ { "labelKey": "Libellé FR", "url": "https://..." } ] }',
  ]
    .filter(Boolean)
    .join("\n");
}

function buildRefreshPrompt(
  article,
  { today, servicePath = "", references, minWords = 1200, maxWords = 2500 } = {},
) {
  const refs = Array.isArray(references)
    ? references
    : Array.isArray(article?.references)
      ? article.references
      : [];
  return [
    "Tu es un rédacteur senior pour houle.ai (conseil en IA indépendant des éditeurs, Suisse).",
    "Tu mets à jour un article existant. Garde le slug et le sujet.",
    `Date du jour: ${toIsoDate(today)}.`,
    "Vérifie chaque fait, chiffre et date contre les références fournies; mets à jour pour la date du jour, remplace les mentions d'année dépassées (y compris dans le titre si pertinent), supprime le remplissage (FAQ générique, tableaux vides, checklists génériques, passages inventés, scénarios chiffrés).",
    "Si un fait ne peut pas être vérifié avec les références, retire-le ou formule-le de manière prudente.",
    `Longueur: entre ${minWords} et ${Math.max(maxWords, minWords)} mots; ne rallonge pas pour faire du volume.`,
    "",
    "RÈGLES ÉDITORIALES:",
    ...buildEditorialRules({ servicePath }),
    "- Reste neutre entre fournisseurs (Microsoft/OpenAI, Anthropic, Mistral, modèles open source). La marque s'écrit toujours « houle » en minuscules.",
    "- Ton direct et humain; pas de formules IA (« il est important de noter », « en effet », « de plus », « en conclusion »). Ne commence pas par une section « Introduction ».",
    "- Aucune URL http/https dans le texte. Pour citer une source, écris (source: <labelKey>).",
    "- Titres: ## pour H2 et ### pour H3, sans préfixe « H2 »/« H3 ». Ne reproduis ni la section « Références » ni le bloc final d'appel à l'action: ils sont régénérés par le code.",
    "",
    "Références disponibles (ne pas modifier):",
    JSON.stringify(refs, null, 2),
    "",
    "Article actuel (JSON):",
    JSON.stringify(
      {
        slug: article.slug,
        title: article.title,
        description: article.description,
        content: article.content,
      },
      null,
      2,
    ),
    "",
    "Retourne STRICTEMENT un JSON:",
    '{ "article": { "title": "...", "description": "...", "content": "<Markdown>" }, "changeSummary": ["..."] }',
  ].join("\n");
}

function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/**
 * Merge generated fields into the existing FR article. Preserves every other
 * field (including unknown ones). Does NOT set `updated` (caller does that
 * once the whole refresh has succeeded).
 */
function mergeRefreshedArticle(existing, generated) {
  const merged = { ...existing };
  for (const field of GENERATED_FIELDS) {
    const value = generated?.[field];
    if (field === "references") {
      if (Array.isArray(value) && value.length) merged[field] = value;
      continue;
    }
    if (typeof value === "string" && value.trim()) merged[field] = value;
  }
  return merged;
}

/** Build the localized entry from the existing one (if any) + translation. */
function buildLocalizedArticle(frArticle, existingLocal, translation, labels = {}) {
  const base = existingLocal ? { ...existingLocal } : { ...frArticle };
  for (const field of TRANSLATED_FIELDS) base[field] = translation[field];
  for (const field of MIRRORED_FIELDS) {
    if (frArticle[field] !== undefined) base[field] = frArticle[field];
  }
  base.slug = frArticle.slug;
  if (Array.isArray(frArticle.references)) {
    base.references = frArticle.references.map((ref) =>
      ref && ref.labelKey && typeof labels[ref.labelKey] === "string" && labels[ref.labelKey]
        ? { ...ref, labelKey: labels[ref.labelKey] }
        : ref,
    );
  }
  return base;
}

/** Adds label translations to the locale file root, never overwriting. */
function mergeLabelsInto(target, labels) {
  if (!labels || typeof labels !== "object") return;
  for (const [key, value] of Object.entries(labels)) {
    if (value && typeof value === "string" && !(key in target)) target[key] = value;
  }
}

function safeUnlink(file) {
  try {
    fs.unlinkSync(file);
  } catch {
    /* ignore */
  }
}

/**
 * Write several JSON files all-or-nothing: stage to temp files, then rename;
 * if anything fails, restore already-renamed files and remove temps.
 */
function writeJsonFilesAtomically(files) {
  const staged = [];
  try {
    for (const { path: target, data } of files) {
      const tmp = `${target}.refresh-${process.pid}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n", "utf8");
      staged.push({ target, tmp, original: fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null });
    }
  } catch (error) {
    for (const s of staged) safeUnlink(s.tmp);
    throw error;
  }
  const renamed = [];
  try {
    for (const s of staged) {
      fs.renameSync(s.tmp, s.target);
      renamed.push(s);
    }
  } catch (error) {
    for (const s of renamed) {
      if (s.original !== null) fs.writeFileSync(s.target, s.original, "utf8");
    }
    for (const s of staged) safeUnlink(s.tmp);
    throw error;
  }
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/**
 * Refresh one or several FR articles + their EN/DE/ES/PT translations as one
 * transaction. Nothing is written unless EVERYTHING succeeded.
 *
 * deps (all async, injectable):
 *   research(article)                    -> references array (already validated/repaired by caller)
 *   draft(prompt, article)               -> { article:{title,description,content}, changeSummary }
 *   promptView(article)        [optional] -> article view fed to the refresh prompt (e.g. content without CTA/refs)
 *   postProcess(article, frData)[optional]-> mutates the FR candidate (links, lead path, brand case...) ; may throw
 *   translate(article, labels)           -> { en:{Article:{title,description,content},labels}, de:..., es:..., pt:... }
 *   localize(entry, locale, article)[optional] -> mutates a localized entry (lead links, parity...) ; may throw
 *   validateFinal(article, locale)[optional]   -> throws on a final-state problem
 */
async function refreshArticles({
  slugs,
  today,
  translationsDir,
  locales = ["en", "de", "es", "pt"],
  servicePaths = {},
  blockedSlugs = new Set(),
  minWords = 700,
  draftMinWords = 1200,
  draftMaxWords = 2500,
  apply = false,
  deps,
  log = console.log,
}) {
  if (!Array.isArray(slugs) || !slugs.length) throw new Error("refresh: no slug given");
  const frPath = path.join(translationsDir, "fr", "ressources.json");
  const frData = loadJson(frPath);
  const localeData = {};
  for (const locale of locales) {
    const p = path.join(translationsDir, locale, "ressources.json");
    if (!fs.existsSync(p)) throw new Error(`refresh: missing ${locale}/ressources.json`);
    localeData[locale] = loadJson(p);
  }
  frData.Articles = Array.isArray(frData.Articles) ? frData.Articles : [];
  const results = [];

  for (const slug of slugs) {
    if (blockedSlugs.has(slug)) {
      throw new Error(`refresh: ${slug} is redirected (consolidated or moved to ark-fid.ch); refresh its survivor instead`);
    }
    const idx = frData.Articles.findIndex((a) => a.slug === slug);
    if (idx < 0) throw new Error(`refresh: FR article not found: ${slug}`);
    const existing = frData.Articles[idx];
    const servicePath = servicePaths[slug] || "";
    log(`[refresh] ${slug}: research`);
    const references = await deps.research(existing);
    if (!Array.isArray(references) || !references.length) {
      throw new Error(`refresh: ${slug}: no usable references`);
    }
    log(`[refresh] ${slug}: draft`);
    const view = deps.promptView ? deps.promptView(existing) : existing;
    const prompt = buildRefreshPrompt(view, {
      today,
      servicePath,
      references,
      minWords: draftMinWords,
      maxWords: draftMaxWords,
    });
    const drafted = await deps.draft(prompt, existing);
    const generated = drafted?.article;
    if (!generated || typeof generated.content !== "string") {
      throw new Error(`refresh: ${slug}: draft payload missing article.content`);
    }
    const candidate = mergeRefreshedArticle(existing, { ...generated, references });
    if (deps.postProcess) await deps.postProcess(candidate, frData);
    const words = countWords(candidate.content);
    if (words < minWords) {
      throw new Error(`refresh: ${slug}: refreshed article too short (${words} < ${minWords} words)`);
    }
    if (candidate.slug !== existing.slug) throw new Error(`refresh: ${slug}: slug changed`);
    if (candidate.category !== existing.category) throw new Error(`refresh: ${slug}: category changed`);

    const labels = {};
    for (const ref of candidate.references || []) if (ref?.labelKey) labels[ref.labelKey] = ref.labelKey;
    log(`[refresh] ${slug}: translate`);
    const translations = await deps.translate(candidate, labels);
    for (const locale of locales) {
      const t = translations?.[locale]?.Article;
      if (!t || !t.title || !t.description || !t.content) {
        throw new Error(`refresh: ${slug}: incomplete ${locale} translation`);
      }
      if (t.content === candidate.content) {
        throw new Error(`refresh: ${slug}: ${locale} translation identical to FR`);
      }
    }

    // Everything for this slug validated: finalize in memory.
    markUpdated(candidate, today);
    if (deps.validateFinal) await deps.validateFinal(candidate, "fr");
    const nextLocalized = {};
    for (const locale of locales) {
      const data = localeData[locale];
      data.Articles = Array.isArray(data.Articles) ? data.Articles : [];
      const li = data.Articles.findIndex((a) => a.slug === slug);
      const entry = buildLocalizedArticle(
        candidate,
        li >= 0 ? data.Articles[li] : null,
        translations[locale].Article,
        translations[locale].labels || {},
      );
      if (deps.localize) await deps.localize(entry, locale, candidate);
      if (deps.validateFinal) await deps.validateFinal(entry, locale);
      nextLocalized[locale] = { li, entry, labels: translations[locale].labels || {} };
    }
    // All five versions passed: commit them to the in-memory state.
    frData.Articles[idx] = candidate;
    for (const locale of locales) {
      const { li, entry, labels: tl } = nextLocalized[locale];
      const data = localeData[locale];
      if (li >= 0) data.Articles[li] = entry;
      else data.Articles.push(entry);
      mergeLabelsInto(data, tl);
    }
    results.push({
      slug,
      wordsBefore: countWords(existing.content),
      wordsAfter: words,
      changeSummary: Array.isArray(drafted.changeSummary) ? drafted.changeSummary : [],
    });
  }

  if (apply) {
    const files = [{ path: frPath, data: frData }];
    for (const locale of locales) {
      files.push({ path: path.join(translationsDir, locale, "ressources.json"), data: localeData[locale] });
    }
    writeJsonFilesAtomically(files);
    log(`[refresh] wrote ${files.length} files`);
  } else {
    log("[refresh] dry-run: nothing written (use --apply)");
  }
  return results;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Metadata rules: `updated` must be YYYY-MM-DD and >= `date`. Returns error strings. */
function validateArticleMetadata(articles) {
  const errors = [];
  for (const a of articles) {
    const id = a.slug || "(no slug)";
    if (a.updated === undefined) continue;
    if (!ISO_DATE_RE.test(String(a.updated))) errors.push(`${id}: updated is not YYYY-MM-DD`);
    else if (a.date && String(a.updated) < String(a.date)) {
      errors.push(`${id}: updated (${a.updated}) is before date (${a.date})`);
    }
  }
  return errors;
}

module.exports = {
  GENERATED_FIELDS,
  MIRRORED_FIELDS,
  buildStructureRules,
  buildNoFabricationRules,
  buildOriginalityRule,
  buildPractitionerRule,
  buildEditorialRules,
  markUpdated,
  buildRefreshResearchPrompt,
  buildRefreshPrompt,
  mergeRefreshedArticle,
  buildLocalizedArticle,
  mergeLabelsInto,
  writeJsonFilesAtomically,
  refreshArticles,
  validateArticleMetadata,
  countWords,
};
