import { NextResponse } from "next/server";
import { locales, type Locale } from "@/src/lib/i18n-locales";
import { localizePath } from "@/src/lib/paths";
import { hreflangFor } from "@/src/lib/hreflang";
import { getArticles, getValidLocalesForSlug } from "@/src/lib/articles";
import { getTranslationsRecord } from "@/src/lib/i18n";

const BASE = "https://houle.ai";
const canonicalLocale: Locale = "fr";
// CI checks out a shallow clone, so git dates are not available at build
// time. Static, service, product and solution pages carry the date of their
// last content change below: bump the entry when a page changes meaningfully
// (a build date would mark every URL as modified on each deploy, and IndexNow
// pings the URLs whose lastmod changed). Articles use `updated` or `date`.
const STATIC_LASTMOD: Record<string, string> = {
  "/": "2026-10-24",
  "/services": "2026-10-28",
  "/products": "2026-10-28",
  "/ressources": "2026-10-28",
  "/contact": "2026-10-26",
  "/solutions": "2026-07-24",
  "/legal/terms": "2026-10-26",
  "/legal/privacy": "2026-10-26",
  "/legal/cookies": "2026-10-26",
  "/services/ai-consulting": "2026-10-28",
  "/services/microsoft-consulting": "2026-10-28",
  "/products/ai-agents": "2026-10-28",
  "/products/word-addin": "2026-10-28",
  "/products/outlook-addin": "2026-10-30",
  "/products/swiss-gpt": "2026-10-28",
  "/products/chat-website": "2026-10-27",
};
// Solution pages share one content file (solutions.json).
const SOLUTIONS_LASTMOD = "2026-07-24";

function lastmodFor(entry: PathEntry): string | undefined {
  if (entry.path.startsWith("/ressources/articles/")) return entry.updated || entry.date;
  if (entry.path.startsWith("/solutions/")) return SOLUTIONS_LASTMOD;
  return STATIC_LASTMOD[entry.path];
}

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
  "/solutions",
  "/legal/terms",
  "/legal/privacy",
  "/legal/cookies",
];

const servicePaths = [
  "/services/ai-consulting",
  "/services/microsoft-consulting",
];

const productPaths = [
  "/products/ai-agents",
  "/products/word-addin",
  "/products/outlook-addin",
  "/products/swiss-gpt",
  "/products/chat-website",
];

// Enumerate all solution slugs from the FR solutions.json (canonical), like articles.
function buildSolutionEntries(): PathEntry[] {
  const solutions = getTranslationsRecord("fr", "solutions") as Record<
    string,
    { hero?: unknown }
  >;
  return Object.keys(solutions)
    .filter((slug) => {
      const entry = solutions[slug];
      return entry && typeof entry === "object" && (entry as { hero?: unknown }).hero;
    })
    .map((slug) => ({ path: `/solutions/${slug}` }));
}

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
  const solutionEntries = buildSolutionEntries();
  const paths: PathEntry[] = [
    ...staticPaths.map((path) => ({ path })),
    ...servicePaths.map((path) => ({ path })),
    ...productPaths.map((path) => ({ path })),
    ...solutionEntries,
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
      const lastmodValue = lastmodFor(pObj);
      const lastmodTag = lastmodValue
        ? `\n    <lastmod>${escapeXml(lastmodValue)}</lastmod>`
        : "";

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
    <loc>${escapeXml(loc)}</loc>${lastmodTag}
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
