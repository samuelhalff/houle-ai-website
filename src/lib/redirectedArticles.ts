import redirected from "../data/articles-redirected-to-ark.json";
import consolidated from "../data/articles-consolidated.json";

// Articles that houle.ai used to carry as copies of ark-fid.ch articles.
// Key: "<locale>/<slug>", value: absolute ark-fid.ch destination (see next.config.js).
const mapping = redirected as Record<string, string>;

export function isRedirectedToArk(locale: string, slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(mapping, `${locale}/${slug}`);
}

// A slug is hidden in every locale once it is redirected in any (the fr entry
// is the canonical one the sitemap, feed and listings are built from).
//
// Duplicate articles consolidated into a stronger houle.ai article: key is the
// removed source slug, value the surviving slug (same locale, one hop, see
// next.config.js). Sources stay in the JSON data but are never listed.
const consolidatedMap = consolidated as Record<string, string>;

export function isConsolidatedSlug(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(consolidatedMap, slug);
}

export function getConsolidatedTarget(slug: string): string | null {
  return isConsolidatedSlug(slug) ? consolidatedMap[slug] : null;
}

const redirectedSlugs = new Set(Object.keys(mapping).map((key) => key.split("/")[1]));

export function isRedirectedSlug(slug: string): boolean {
  return redirectedSlugs.has(slug) || isConsolidatedSlug(slug);
}

export function filterRedirectedArticles<T extends { slug?: string }>(
  locale: string,
  articles: T[],
): T[] {
  return articles.filter(
    (a) => !a.slug || (!isRedirectedToArk(locale, a.slug) && !isConsolidatedSlug(a.slug)),
  );
}

export function getRedirectedArticleMap(): Record<string, string> {
  return mapping;
}
