/**
 * /llms-full.txt: the text of every public page in French and English, as
 * Markdown, built once at build time (app/llms-full.txt/route.ts).
 * Page list and content: src/lib/public-pages.ts. Index: public/llms.txt.
 */
import { PUBLIC_LOCALES, SITE_URL, publicPages, type PublicPage } from "./public-pages";

const INTRO =
  "houle is an independent, vendor-neutral AI consulting and integration firm based in Geneva, Switzerland (a brand of West Bay SA). It helps organisations choose the use cases worth automating and the right model for each of them, including open-source models hosted in Switzerland when data residency, professional secrecy, cost or independence matter.";

function pageBlock(p: PublicPage): string {
  const head = [`# ${p.title}`, "", `URL: ${p.url}`];
  if (p.updated) head.push(p.locale === "fr" ? `Mis à jour le ${p.updated}` : `Updated: ${p.updated}`);
  return [...head, "", p.body().trim(), ""].join("\n");
}

export async function llmsFullTxt(): Promise<string> {
  const lines = [
    "# houle.ai: full text of the public pages",
    "",
    `> ${INTRO}`,
    "",
    "This file holds the text of the public pages of houle.ai in French, the main language, then in English, as Markdown. Each page starts with its title and its canonical URL. The German, Spanish and Portuguese versions translate the same pages and are not repeated here.",
    "",
    `Index: ${SITE_URL}/llms.txt`,
    "",
  ];
  for (const locale of PUBLIC_LOCALES) {
    for (const page of await publicPages(locale)) lines.push("---", "", pageBlock(page));
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}
