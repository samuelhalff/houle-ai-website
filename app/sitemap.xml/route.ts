import { NextResponse } from "next/server";
import { locales, type Locale } from "@/src/lib/i18n-locales";
import { localizePath } from "@/src/lib/paths";
import { hreflangFor } from "@/src/lib/hreflang";
import { getArticles, getValidLocalesForSlug } from "@/src/lib/articles";

const BASE = "https://houle.ai";
const canonicalLocale: Locale = "fr";
const STATIC_LASTMOD = "2026-06-10";

function getPlaceholderLocales(): Set<string> {
  const raw = process.env.PLACEHOLDER_LOCALES || "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

function getSitemapLocales() {
  const placeholderLocales = getPlaceholderLocales();
  return locales.filter((locale) => !placeholderLocales.has(locale));
}

const staticPaths = [
  "/",
  "/services",
  "/products",
  "/ressources",
  "/contact",
  "/legal/terms",
  "/legal/privacy",
  "/legal/cookies",
];

const servicePaths = [
  "/services/ai-consulting",
  "/services/microsoft-consulting",
];

const productPaths = [
  "/products/word-addin",
  "/products/outlook-addin",
  "/products/swiss-gpt",
];

type PathEntry = {
  path: string;
  date?: string;
  updated?: string;
  locales?: Locale[];
};

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function buildArticleEntries(sitemapLocales: Locale[]): Promise<PathEntry[]> {
  const canonicalArticles = await getArticles(canonicalLocale);
  const entries: PathEntry[] = [];

  for (const article of canonicalArticles) {
    const validLocales = (await getValidLocalesForSlug(article.slug)).filter((locale) =>
      sitemapLocales.includes(locale),
    );
    entries.push({
      path: `/ressources/articles/${article.slug}`,
      date: article.date,
      updated: article.updated,
      locales: validLocales,
    });
  }

  return entries;
}

export async function GET() {
  const sitemapLocales = getSitemapLocales();
  const articleEntries = await buildArticleEntries(sitemapLocales);
  const paths: PathEntry[] = [
    ...staticPaths.map((path) => ({ path })),
    ...servicePaths.map((path) => ({ path })),
    ...productPaths.map((path) => ({ path })),
    ...articleEntries,
  ];

  const urlEntries = paths.flatMap((pObj) => {
    const p = pObj.path;
    const pathLocales = (pObj.locales?.length ? pObj.locales : sitemapLocales).filter(
      (locale) => sitemapLocales.includes(locale),
    );
    return pathLocales.map((locale) => {
      const basePath = p === "/" ? "" : p;
      const localized = basePath ? localizePath(basePath, locale) : "";
      const loc = `${BASE}/${locale}${localized}/`;
      const lastmod = p.startsWith("/ressources/articles/")
        ? pObj.updated || pObj.date || STATIC_LASTMOD
        : STATIC_LASTMOD;
      const isHome = p === "/";
      const isArticle = p.startsWith("/ressources/articles/");
      const isResources = p.startsWith("/ressources") && !isArticle;
      const isService = p.startsWith("/services");
      const isLegal = p.startsWith("/legal/");
      const changefreq =
        isHome || isArticle
          ? "weekly"
          : isService || isResources
            ? "monthly"
            : isLegal
              ? "yearly"
              : "monthly";
      const priority = isHome
        ? "1.0"
        : isArticle
          ? "0.8"
          : isService
            ? "0.7"
            : isResources
              ? "0.6"
              : isLegal
                ? "0.3"
                : "0.5";

      const alternates = [
        ...pathLocales.map((alt) => {
          const altPathBase = p === "/" ? "" : p;
          const altLocalized = altPathBase ? localizePath(altPathBase, alt) : "";
          const href = `${BASE}/${alt}${altLocalized}/`;
          const hreflang = hreflangFor(alt);
          return `    <xhtml:link rel="alternate" hreflang="${escapeXml(
            hreflang,
          )}" href="${escapeXml(href)}"/>`;
        }),
        (() => {
          if (p === "/") {
            return `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(BASE)}"/>`;
          }
          const xDefaultLocale = pathLocales.includes(canonicalLocale)
            ? canonicalLocale
            : pathLocales[0];
          const altPathBase = p === "/" ? "" : p;
          const altLocalized = altPathBase
            ? localizePath(altPathBase, xDefaultLocale)
            : "";
          const href = `${BASE}/${xDefaultLocale}${altLocalized}/`;
          return `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(
            href,
          )}"/>`;
        })(),
      ].join("\n");

      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${alternates}
  </url>`;
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.join("\n")}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
