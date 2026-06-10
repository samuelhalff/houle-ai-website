import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/src/lib/i18n-locales";
import {
  getArticles,
  isGenuineTranslation,
  type ResourceArticle,
} from "@/src/lib/articles";

type Params = { params: Promise<{ locale: string }> };

const BASE = "https://houle.ai";

function escapeXml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function pubDate(article: ResourceArticle) {
  const value = article.updated || article.date;
  const date = value ? new Date(value) : new Date("2026-06-10T00:00:00Z");
  return Number.isNaN(date.getTime()) ? "" : date.toUTCString();
}

export async function GET(_request: Request, props: Params) {
  const { locale: rawLocale } = await props.params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const frArticles = await getArticles("fr");
  const localeArticles = await getArticles(locale);
  const bySlug = new Map(localeArticles.map((article) => [article.slug, article]));

  const articles = (
    await Promise.all(
      frArticles
        .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
        .map(async (frArticle) => {
          const article = bySlug.get(frArticle.slug);
          if (!article) return null;
          if (locale !== "fr" && !isGenuineTranslation(article, frArticle)) {
            return null;
          }
          return article;
        }),
    )
  )
    .filter((article): article is ResourceArticle => Boolean(article))
    .slice(0, 20);

  const items = articles
    .map((article) => {
      const url = `${BASE}/${locale}/ressources/articles/${article.slug}/`;
      return `<item>
  <title>${escapeXml(article.title)}</title>
  <link>${escapeXml(url)}</link>
  <guid isPermaLink="true">${escapeXml(url)}</guid>
  ${article.description ? `<description>${escapeXml(article.description)}</description>` : ""}
  ${pubDate(article) ? `<pubDate>${pubDate(article)}</pubDate>` : ""}
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>houle.ai resources (${escapeXml(locale)})</title>
  <link>${escapeXml(`${BASE}/${locale}/ressources/`)}</link>
  <description>Latest houle.ai articles and resources</description>
  <language>${escapeXml(locale)}</language>
${items}
</channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=900",
    },
  });
}
