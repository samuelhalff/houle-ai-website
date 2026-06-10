import { cache } from "react";
import fs from "fs";
import path from "path";
import { locales, type Locale } from "./i18n-locales";

export type ArticleReference = {
  labelKey: string;
  url: string;
};

export type ResourceArticle = {
  slug: string;
  title: string;
  description?: string;
  content?: string;
  date?: string;
  updated?: string;
  author?: string;
  authorUrl?: string;
  image?: string;
  category?: string;
  tags?: string[];
  references?: ArticleReference[];
};

export type RessourcesDictionary = {
  Articles: ResourceArticle[];
  IntroTitle?: string;
  IntroText?: string;
  IntroShort?: string;
  ArticlesTitle?: string;
  ArticlesShort?: string;
  LoadMoreArticles?: string;
  ShowAllArticles?: string;
  ReadArticle?: string;
  ReadMore?: string;
  RelatedArticles?: string;
  By?: string;
  Published?: string;
  LastUpdated?: string;
  ReadingTime?: string;
  Minutes?: string;
  Words?: string;
  References?: string;
  FAQ?: {
    Title?: string;
    Items?: Array<{ q: string; a: string }>;
  };
  Links?: Record<string, string>;
  Contact?: {
    Title?: string;
    Description?: string;
    ButtonText?: string;
  };
  banner?: {
    questions_about_article?: string;
    banner_body?: string;
    contact_button?: string;
  };
  [key: string]: unknown;
};

const TTL_MS = 15 * 60 * 1000;

type CacheEntry = {
  expiresAt: number;
  data: RessourcesDictionary;
};

const ressourcesCache = new Map<Locale, CacheEntry>();

function ressourcesPath(locale: Locale) {
  return path.join(process.cwd(), "src", "translations", locale, "ressources.json");
}

function normalizeRessources(input: Partial<RessourcesDictionary>): RessourcesDictionary {
  const articles = Array.isArray(input.Articles)
    ? input.Articles.filter((article): article is ResourceArticle => {
        if (!article || typeof article !== "object") return false;
        return Boolean(article.slug && article.title);
      })
    : [];

  return {
    ...input,
    Articles: articles,
  };
}

export function readRessources(locale: Locale): RessourcesDictionary {
  const now = Date.now();
  const cached = ressourcesCache.get(locale);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const file = ressourcesPath(locale);
  const raw = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "{}";
  const data = normalizeRessources(JSON.parse(raw) as Partial<RessourcesDictionary>);
  ressourcesCache.set(locale, { data, expiresAt: now + TTL_MS });
  return data;
}

export const getRessources = cache(async (locale: Locale) => readRessources(locale));

export const getArticles = cache(async (locale: Locale) => {
  return (await getRessources(locale)).Articles;
});

export const getArticle = cache(async (locale: Locale, slug: string) => {
  return (await getArticles(locale)).find((article) => article.slug === slug);
});

export function isGenuineTranslation(
  article: ResourceArticle | undefined,
  canonicalArticle: ResourceArticle | undefined,
): boolean {
  if (!article || !canonicalArticle) return false;
  return !(
    (article.title || "") === (canonicalArticle.title || "") &&
    (article.description || "") === (canonicalArticle.description || "") &&
    (article.content || "") === (canonicalArticle.content || "")
  );
}

export const getValidLocalesForSlug = cache(async (slug: string) => {
  const canonicalArticle = await getArticle("fr", slug);
  if (!canonicalArticle) return [] as Locale[];

  const validLocales: Locale[] = [];
  for (const locale of locales) {
    const article = await getArticle(locale, slug);
    if (!article) continue;
    if (locale === "fr" || isGenuineTranslation(article, canonicalArticle)) {
      validLocales.push(locale);
    }
  }
  return validLocales;
});

export function clearArticleCacheForTests() {
  ressourcesCache.clear();
}
