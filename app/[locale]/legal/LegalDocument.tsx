import { type Metadata } from "next";
import { Separator } from "@/src/components/ui/separator";
import { getTranslationsRecord, isValidLocale, type Locale } from "@/src/lib/i18n";
import { PRIVACY_LAST_UPDATED } from "./constants";

/**
 * Privacy and cookies policies are stored as structured blocks in the
 * "legal" translation namespace (src/translations/<locale>/legal.json) so
 * every locale renders its own text.
 */
type Block =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "box"; heading?: string; lines?: string[]; items?: string[]; note?: string }
  | { type: "rights"; items: { label: string; text: string }[] }
  | { type: "links"; heading: string; items: { label: string; href: string }[] };

type LegalSection = { Title: string; Blocks: Block[] };

export type LegalDocumentKey = "Privacy" | "Cookies";

type LegalDocumentContent = {
  MetaTitle: string;
  MetaDescription: string;
  Title: string;
  Subtitle: string;
  Sections: LegalSection[];
};

function resolveLocale(locale: string): Locale {
  return isValidLocale(locale) ? locale : "en";
}

function loadDocument(locale: Locale, key: LegalDocumentKey) {
  const record = getTranslationsRecord(locale, "legal");
  const fallback = getTranslationsRecord("en", "legal");
  const doc = (record[key] ?? fallback[key]) as LegalDocumentContent;
  const lastUpdated = (record.LastUpdated ?? fallback.LastUpdated) as string;
  return { doc, lastUpdated };
}

function formatDate(date: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

export async function legalMetadata(
  params: Promise<{ locale: string }>,
  key: LegalDocumentKey
): Promise<Metadata> {
  const { locale } = await params;
  const { doc } = loadDocument(resolveLocale(locale), key);
  return { title: doc.MetaTitle, description: doc.MetaDescription };
}

function renderBlock(block: Block, index: number) {
  switch (block.type) {
    case "p":
      return <p key={index}>{block.text}</p>;
    case "h3":
      return (
        <h3 key={index} className="text-lg font-semibold mb-3 mt-6">
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul key={index} className="list-disc pl-6 space-y-2">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "box":
      return (
        <div key={index} className="bg-muted/50 p-6 rounded-lg">
          {block.heading ? (
            <p className={block.items ? "font-semibold mb-2" : "font-semibold"}>{block.heading}</p>
          ) : null}
          {block.lines?.map((line) => <p key={line}>{line}</p>)}
          {block.items ? (
            <ul className="list-disc pl-6 space-y-1">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {block.note ? (
            <p className="mt-2 text-sm">
              <strong>{block.note}</strong>
            </p>
          ) : null}
        </div>
      );
    case "rights":
      return (
        <ul key={index} className="list-disc pl-6 space-y-2">
          {block.items.map((item) => (
            <li key={item.label}>
              <strong>{item.label}</strong> {item.text}
            </li>
          ))}
        </ul>
      );
    case "links":
      return (
        <div key={index} className="mt-4">
          <p className="font-semibold mb-2">{block.heading}</p>
          <ul className="list-disc pl-6 space-y-1">
            {block.items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
    default:
      return null;
  }
}

export async function LegalDocument({
  params,
  documentKey,
}: {
  params: Promise<{ locale: string }>;
  documentKey: LegalDocumentKey;
}) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const { doc, lastUpdated } = loadDocument(locale, documentKey);

  return (
    <div className="container mx-auto px-4 py-16 max-w-[var(--breakpoint-xl)]">
      <div className="mb-12">
        <h1 className="text-4xl font-semibold tracking-tight mb-3">{doc.Title}</h1>
        <p className="text-base text-muted-foreground mb-2">{doc.Subtitle}</p>
        <p className="text-xs text-muted-foreground/70">
          {lastUpdated.replace("{date}", formatDate(PRIVACY_LAST_UPDATED, locale))}
        </p>
        <Separator className="mt-8" />
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        {doc.Sections.map((section) => (
          <section key={section.Title} className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">{section.Title}</h2>
            <div className="space-y-4">{section.Blocks.map(renderBlock)}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
