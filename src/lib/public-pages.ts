/**
 * Public pages of houle.ai in French and English, read from the same
 * translation files the pages render. Shared by /llms-full.txt (full text
 * for LLMs) and the per-page Open Graph images (/assets/og-pages/<key>.webp).
 *
 * Only pages listed in the sitemap are included (app/sitemap.xml/route.ts):
 * no API, demo pages or untranslated article copies. DE, ES and PT translate
 * the same content and are left out to keep the file readable.
 */
import fs from "fs";
import path from "path";
import { localizePath } from "./paths";
import { getArticles, getValidLocalesForSlug } from "./articles";

export const SITE_URL = "https://houle.ai";
export type PublicLocale = "fr" | "en";
export const PUBLIC_LOCALES: readonly PublicLocale[] = ["fr", "en"];

export type PublicPage = {
  /** Base path, e.g. "/services/ai-consulting" (not localized). */
  path: string;
  locale: PublicLocale;
  url: string;
  title: string;
  /** Short section label shown above the title on the share image. */
  rubric: string;
  updated?: string;
  description?: string;
  /** Markdown body (without the title), built on demand. */
  body: () => string;
};

type Json = Record<string, unknown>;

const jsonCache = new Map<string, Json | null>();
function readNs(locale: PublicLocale, ns: string): Json | null {
  const key = `${locale}/${ns}`;
  if (jsonCache.has(key)) return jsonCache.get(key)!;
  let value: Json | null = null;
  try {
    const file = path.join(process.cwd(), "src", "translations", locale, `${ns}.json`);
    value = JSON.parse(fs.readFileSync(file, "utf8")) as Json;
  } catch {
    value = null;
  }
  jsonCache.set(key, value);
  return value;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
const get = (o: unknown, dotted: string): unknown =>
  dotted.split(".").reduce<unknown>((acc, k) => (acc && typeof acc === "object" ? (acc as Json)[k] : undefined), o);

export const pageUrl = (p: string, locale: PublicLocale) => {
  const localized = p === "/" ? "" : localizePath(p, locale);
  return `${SITE_URL}/${locale}${localized}/`;
};

/** Root-relative links in Markdown become absolute: the file is read off-site. */
export const absoluteLinks = (md: string) => md.replace(/\]\(\//g, `](${SITE_URL}/`);

const clean = (s: string) =>
  s
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();

/* UI strings that are not page content (buttons, badges, form fields, demo scripts, links). */
const SKIP_EXACT = new Set(["meta", "alt", "form", "error", "errors", "success", "sending", "lastupdated", "eyebrow", "badge", "demo", "breadcrumb", "name", "href", "url", "icon", "product", "toasts", "labels", "placeholders"]);
const SKIP_PART = ["cta", "button", "imagealt", "placeholder", "calltoaction"];
const skipKey = (k: string) => {
  const l = k.toLowerCase();
  return SKIP_EXACT.has(l) || SKIP_PART.some((p) => l.includes(p));
};
const isTitleKey = (k: string) => /^(title|question\d*)$/i.test(k);
const heading = (depth: number, text: string) => `${"#".repeat(Math.min(Math.max(depth, 2), 4))} ${text}`;

/** Translation JSON to Markdown: titles become headings, string arrays bullets, the rest paragraphs. */
function jsonToMarkdown(node: unknown, depth: number, out: string[]) {
  if (typeof node === "string") {
    const t = clean(node);
    if (t) out.push(t, "");
    return;
  }
  if (Array.isArray(node)) {
    if (node.every((x) => typeof x === "string")) {
      const items = node.map((x) => clean(x as string)).filter(Boolean);
      if (items.length) out.push(...items.map((x) => `- ${x}`), "");
      return;
    }
    for (const x of node) jsonToMarkdown(x, depth, out);
    return;
  }
  if (!node || typeof node !== "object") return;
  const entries = Object.entries(node as Json).filter(([k]) => !skipKey(k));
  const titleEntry = entries.find(([k, v]) => isTitleKey(k) && typeof v === "string");
  if (titleEntry) out.push(heading(depth, clean(titleEntry[1] as string)), "");
  for (const [k, v] of entries) {
    if (titleEntry && k === titleEntry[0]) continue;
    if (typeof v === "string" && /^question\d*$/i.test(k)) {
      out.push(heading(depth + 1, clean(v)), "");
      continue;
    }
    jsonToMarkdown(v, depth + 1, out);
  }
}

function nsMarkdown(locale: PublicLocale, ns: string, pick?: string) {
  let data: unknown = readNs(locale, ns);
  if (pick) data = get(data, pick);
  const out: string[] = [];
  jsonToMarkdown(data, 1, out);
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

const metaPage = (locale: PublicLocale, p: string) =>
  ((readNs(locale, "metadata")?.pages ?? {}) as Record<string, { title?: string; description?: string }>)[p] ?? {};

/** Page title from metadata.json without the brand. */
function pageTitle(locale: PublicLocale, p: string): string {
  const raw = clean(str(metaPage(locale, p).title));
  const t = raw
    .replace(/^houle\s*\|\s*/i, "")
    .replace(/\s*[|–-]\s*houle\b[^|]*$/i, "")
    .trim();
  return t || "houle";
}

const section = (locale: PublicLocale, key: "services" | "products" | "solutions" | "ressources" | "contact") => {
  const labels: Record<string, [string, string]> = {
    services: ["Services", "Services"],
    products: ["Produits", "Products"],
    solutions: ["Solutions", "Solutions"],
    ressources: ["Ressources", "Resources"],
    contact: ["Contact", "Contact"],
  };
  return labels[key][locale === "fr" ? 0 : 1];
};

type Spec = { path: string; rubric: (l: PublicLocale) => string; sections: { ns: string; pick?: string }[] };

const SPECS: Spec[] = [
  { path: "/", rubric: () => "houle.ai", sections: [{ ns: "home" }, { ns: "faq" }] },
  { path: "/services", rubric: (l) => section(l, "services"), sections: [] },
  { path: "/services/ai-consulting", rubric: (l) => section(l, "services"), sections: [{ ns: "ai-consulting" }] },
  { path: "/services/microsoft-consulting", rubric: (l) => section(l, "services"), sections: [{ ns: "microsoft-consulting" }] },
  { path: "/products", rubric: (l) => section(l, "products"), sections: [] },
  { path: "/products/ai-agents", rubric: (l) => section(l, "products"), sections: [{ ns: "ai-agents" }] },
  { path: "/products/word-addin", rubric: (l) => section(l, "products"), sections: [{ ns: "word-addin" }] },
  { path: "/products/outlook-addin", rubric: (l) => section(l, "products"), sections: [{ ns: "outlook-addin" }] },
  { path: "/products/swiss-gpt", rubric: (l) => section(l, "products"), sections: [{ ns: "swiss-gpt" }] },
  { path: "/products/chat-website", rubric: (l) => section(l, "products"), sections: [{ ns: "chat-website" }] },
  { path: "/solutions", rubric: (l) => section(l, "solutions"), sections: [] },
  { path: "/contact", rubric: (l) => section(l, "contact"), sections: [{ ns: "contact", pick: "Faq" }] },
  { path: "/ressources", rubric: (l) => section(l, "ressources"), sections: [] },
  { path: "/legal/terms", rubric: () => "", sections: [{ ns: "legal", pick: "Terms" }] },
  { path: "/legal/privacy", rubric: () => "", sections: [{ ns: "legal", pick: "Privacy" }] },
  { path: "/legal/cookies", rubric: () => "", sections: [{ ns: "legal", pick: "Cookies" }] },
];

function solutionPages(locale: PublicLocale): PublicPage[] {
  // Same list as the sitemap: FR entries with a hero section.
  const fr = readNs("fr", "solutions") ?? {};
  const local = readNs(locale, "solutions") ?? {};
  return Object.keys(fr)
    .filter((slug) => get(fr, `${slug}.hero`) && get(local, `${slug}.hero`))
    .map((slug): PublicPage => {
      const p = `/solutions/${slug}`;
      return {
        path: p,
        locale,
        url: pageUrl(p, locale),
        title: clean(str(get(local, `${slug}.hero.title`))),
        description: clean(str(get(local, `${slug}.hero.description`))),
        rubric: section(locale, "solutions"),
        body: () => nsMarkdown(locale, "solutions", slug),
      };
    });
}

const faqMarkdown = (faq: unknown) =>
  Array.isArray(faq)
    ? (faq as { q?: string; a?: string }[])
        .filter((x) => x?.q && x?.a)
        .map((x) => `### ${clean(x.q!)}\n\n${clean(x.a!)}`)
        .join("\n\n")
    : "";

async function articlePages(locale: PublicLocale): Promise<PublicPage[]> {
  const out: PublicPage[] = [];
  const faqTitle = locale === "fr" ? "Questions fréquentes" : "Frequently asked questions";
  for (const a of await getArticles(locale)) {
    if (!(await getValidLocalesForSlug(a.slug)).includes(locale)) continue;
    const p = `/ressources/articles/${a.slug}`;
    out.push({
      path: p,
      locale,
      url: pageUrl(p, locale),
      title: a.title,
      rubric: section(locale, "ressources"),
      updated: a.updated ?? a.date,
      description: a.description ? clean(a.description) : undefined,
      body: () => {
        const faq = faqMarkdown(a.faq);
        return [a.description ? clean(a.description) : "", absoluteLinks(a.content ?? "").trim(), faq ? `## ${faqTitle}\n\n${faq}` : ""]
          .filter(Boolean)
          .join("\n\n");
      },
    });
  }
  return out;
}

const pagesCache = new Map<PublicLocale, PublicPage[]>();

/** Every public page of a locale: static pages, solutions, legal pages, then articles. */
export async function publicPages(locale: PublicLocale): Promise<PublicPage[]> {
  const cached = pagesCache.get(locale);
  if (cached) return cached;
  const statics = SPECS.map(
    (s): PublicPage => ({
      path: s.path,
      locale,
      url: pageUrl(s.path, locale),
      title: pageTitle(locale, s.path),
      description: clean(str(metaPage(locale, s.path).description)),
      rubric: s.rubric(locale),
      body: () =>
        [clean(str(metaPage(locale, s.path).description)), ...s.sections.map((x) => nsMarkdown(locale, x.ns, x.pick))]
          .filter(Boolean)
          .join("\n\n"),
    }),
  );
  const legalStart = statics.findIndex((p) => p.path.startsWith("/legal/"));
  const pages = [...statics.slice(0, legalStart), ...solutionPages(locale), ...statics.slice(legalStart), ...(await articlePages(locale))];
  pagesCache.set(locale, pages);
  return pages;
}

/* ---- Open Graph images ---- */

/** "/" -> "fr", "/services/ai-consulting" -> "fr--services--ai-consulting". */
export const ogKey = (locale: PublicLocale, p: string) => (p === "/" ? locale : `${locale}${p.replace(/\/+$/, "").replace(/\//g, "--")}`);

const shortHash = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
};

let ogIndex: Promise<Map<string, PublicPage>> | null = null;
export function ogPages(): Promise<Map<string, PublicPage>> {
  if (!ogIndex) {
    ogIndex = Promise.all(PUBLIC_LOCALES.map((l) => publicPages(l))).then(
      (lists) => new Map(lists.flat().map((p) => [ogKey(p.locale, p.path), p] as const)),
    );
  }
  return ogIndex;
}

/**
 * Share image of a page, or null when it has none (DE/ES/PT, pages outside
 * the sitemap): callers then keep the per-language image. The query string
 * changes with the title, so caches drop an outdated image.
 */
export async function ogImageFor(locale: string, p: string): Promise<string | null> {
  if (locale !== "fr" && locale !== "en") return null;
  const normalized = p === "/" ? "/" : p.replace(/\/+$/, "");
  const key = ogKey(locale, normalized);
  const page = (await ogPages()).get(key);
  return page ? `/assets/og-pages/${key}.webp?v=${shortHash(page.title + page.rubric)}` : null;
}
