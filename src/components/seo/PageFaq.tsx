import React from "react";
import StructuredData from "@/src/components/seo/StructuredData";
import { buildFAQPage, type FAQEntry } from "@/src/lib/structuredData";

/**
 * Visible FAQ block plus its FAQPage JSON-LD, rendered from the same entries
 * so the structured data always matches the text on the page. Questions are
 * H3 under an H2 section title; answers stay in the HTML (closed <details>
 * are still crawled). Data: `Faq` in each page's translation file, or
 * `faq` on each article in ressources.json.
 */
export function faqEntries(items: unknown): FAQEntry[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((x) => {
      const o = (x ?? {}) as Record<string, unknown>;
      const question = String(o.Question ?? o.q ?? "").trim();
      const answer = String(o.Answer ?? o.a ?? "").trim();
      return { question, answer };
    })
    .filter((e) => e.question && e.answer);
}

export default function PageFaq({
  title,
  items,
  nonce,
  className = "",
  compact = false,
}: {
  title: string;
  items: FAQEntry[];
  nonce?: string;
  className?: string;
  /** Article layout: narrower, no tinted band. */
  compact?: boolean;
}) {
  if (!items.length) return null;
  const list = (
    <div className="space-y-3">
      {items.map((entry) => (
        <details key={entry.question} className="group rounded-2xl border bg-background p-5 shadow-sm">
          <summary className="cursor-pointer list-none">
            <h3 className="inline text-base font-semibold text-foreground">{entry.question}</h3>
          </summary>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{entry.answer}</p>
        </details>
      ))}
    </div>
  );
  return (
    <>
      <StructuredData nonce={nonce} data={buildFAQPage(items)} />
      {compact ? (
        <section id="faq" className={`mt-10 ${className}`}>
          <h2 className="mb-4 text-xl font-semibold text-foreground">{title}</h2>
          {list}
        </section>
      ) : (
        <section id="faq" className={`bg-surface-tint/40 px-5 py-16 sm:px-8 ${className}`}>
          <div className="mx-auto max-w-[860px]">
            <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h2>
            {list}
          </div>
        </section>
      )}
    </>
  );
}
