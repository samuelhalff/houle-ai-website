import redirected from "../data/articles-redirected-to-ark.json";

// Articles that houle.ai used to carry as copies of ark-fid.ch articles.
// Key: "<locale>/<slug>", value: absolute ark-fid.ch destination (see next.config.js).
const mapping = redirected as Record<string, string>;

export function isRedirectedToArk(locale: string, slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(mapping, `${locale}/${slug}`);
}

// A slug is hidden in every locale once it is redirected in any (the fr entry
// is the canonical one the sitemap, feed and listings are built from).
const redirectedSlugs = new Set(Object.keys(mapping).map((key) => key.split("/")[1]));

export function isRedirectedSlug(slug: string): boolean {
  return redirectedSlugs.has(slug);
}

export function filterRedirectedArticles<T extends { slug?: string }>(
  locale: string,
  articles: T[],
): T[] {
  return articles.filter((a) => !a.slug || !isRedirectedToArk(locale, a.slug));
}

export function getRedirectedArticleMap(): Record<string, string> {
  return mapping;
}
