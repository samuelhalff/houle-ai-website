import { NextResponse } from "next/server";
import { locales } from "@/src/lib/i18n-locales";
import { localizePath } from "@/src/lib/paths";
import fs from "fs";
import path from "path";

const BASE = "https://houle.ai";

// Static routes
const staticPaths = ["/", "/contact"];

// Service routes
const servicePaths = [
  "/services/ai-consulting",
  "/services/microsoft-consulting",
];

// Product routes
const productPaths = [
  "/products/word-addin",
  "/products/outlook-addin",
  "/products/swiss-gpt",
];

// Resources routes
const resourcePaths = ["/ressources", "/ressources/articles"];

// Enumerate articles from the canonical English translations JSON
const ressourcesArticles = (() => {
  const file = path.join(
    process.cwd(),
    "src",
    "translations",
    "en",
    "ressources.json"
  );
  try {
    if (fs.existsSync(file)) {
      const json = JSON.parse(fs.readFileSync(file, "utf8")) as {
        Articles?: Array<{ slug: string; date?: string }>;
      };
      return (json.Articles || []).map((a) => ({
        path: `/ressources/articles/${a.slug}`,
        date: a.date,
      }));
    }
  } catch (_) {
    // fall through
  }
  return [] as Array<{ path: string; date?: string }>;
})();

type PathEntry = { path: string; date?: string } | string;
const toPathEntry = (p: PathEntry) => (typeof p === "string" ? { path: p } : p);

const paths = [
  ...staticPaths.map(toPathEntry),
  ...servicePaths.map(toPathEntry),
  ...productPaths.map(toPathEntry),
  ...resourcePaths.map(toPathEntry),
  ...ressourcesArticles,
] as Array<{ path: string; date?: string }>;

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const defaultLastmod = new Date().toISOString().slice(0, 10);

  const urlEntries = paths.flatMap((pObj) => {
    const p = pObj.path;
    // Build per-locale entries
    return locales.map((locale) => {
      const basePath = p === "/" ? "" : p;
      const localized = basePath ? localizePath(basePath, locale) : "";
      const loc = `${BASE}/${locale}${localized}`;
      const lastmod = pObj.date || defaultLastmod;

      // Derive changefreq/priority
      const isHome = p === "/";
      const isArticle = p.startsWith("/ressources/articles/");
      const isResources = p.startsWith("/ressources") && !isArticle;
      const isService = p.startsWith("/services");
      const isProduct = p.startsWith("/products");

      const changefreq =
        isHome || isArticle
          ? "weekly"
          : isService || isProduct || isResources
          ? "monthly"
          : "monthly";
      const priority = isHome
        ? "1.0"
        : isArticle
        ? "0.8"
        : isService || isProduct
        ? "0.7"
        : isResources
        ? "0.6"
        : "0.5";

      // Build alternates block
      const alternates = [
        ...locales.map((alt) => {
          const altPathBase = p === "/" ? "" : p;
          const altLocalized = altPathBase
            ? localizePath(altPathBase, alt)
            : "";
          const href = `${BASE}/${alt}${altLocalized}`;
          return `    <xhtml:link rel="alternate" hreflang="${escapeXml(
            alt
          )}" href="${escapeXml(href)}"/>`;
        }),
        // x-default points to EN per canonical policy
        (() => {
          const altPathBase = p === "/" ? "" : p;
          const altLocalized = altPathBase
            ? localizePath(altPathBase, "en")
            : "";
          const href = `${BASE}/en${altLocalized}`;
          return `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(
            href
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
