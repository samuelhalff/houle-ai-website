import React from "react";
import { type Metadata } from "next";
import { Suspense } from "react";
import FAQSection from "./components/FAQSection";
import ContactSection from "./articles/components/ContactSection";
import ProgressiveResourceGrid from "./components/ProgressiveResourceGrid";
import { notFound } from "next/navigation";
import { getPageMetadata } from "@/src/lib/metadata";
import { getCspNonce } from "@/src/lib/csp";
import { getTranslations, isValidLocale, type Locale } from "@/src/lib/i18n";
import PageHero from "@/src/components/site/page-hero";
import Reveal from "@/src/components/motion/reveal";

type ArticlesSearchParams = Record<string, string | string[] | undefined>;

interface RessourceArticle {
  slug: string;
  title: string;
  description: string;
  author?: string;
  date?: string;
}

interface FAQEntry {
  q: string;
  a: string;
}

interface FAQContent {
  Title?: string;
  Items?: FAQEntry[];
}

interface RessourcesLinks {
  Accounting?: string;
  Tax?: string;
  Payroll?: string;
}

interface RessourcesData {
  IntroTitle?: string;
  IntroText?: string;
  IntroShort?: string;
  ArticlesTitle?: string;
  LoadMoreArticles?: string;
  ShowAllArticles?: string;
  ReadArticle?: string;
  By?: string;
  Published?: string;
  Articles: RessourceArticle[];
  FAQ?: FAQContent;
  Links?: RessourcesLinks;
  Contact?: {
    Title?: string;
    Description?: string;
    ButtonText?: string;
  };
}

async function loadRessources(locale: Locale): Promise<RessourcesData> {
  try {
    const ressourcesModule: {
      default: Partial<RessourcesData> & {
        Files?: unknown;
        Articles?: unknown;
      };
    } = await import(`@/src/translations/${locale}/ressources.json`);
    const data = ressourcesModule.default;
    const normalizeArticles = (input: unknown): RessourceArticle[] => {
      if (!Array.isArray(input)) return [];
      return input.filter((article): article is RessourceArticle => {
        if (!article || typeof article !== "object") return false;
        const candidate = article as Partial<RessourceArticle>;
        return Boolean(
          candidate.slug && candidate.title && candidate.description
        );
      });
    };
    const normalizeFaq = (input: unknown): FAQContent | undefined => {
      if (!input || typeof input !== "object") return undefined;
      const faq = input as { Title?: unknown; Items?: unknown };
      const items = Array.isArray(faq.Items)
        ? faq.Items.filter((entry): entry is FAQEntry => {
            if (!entry || typeof entry !== "object") return false;
            const candidate = entry as Partial<FAQEntry>;
            return Boolean(candidate.q && candidate.a);
          })
        : undefined;
      return {
        Title: typeof faq.Title === "string" ? faq.Title : undefined,
        Items: items,
      };
    };

    return {
      IntroTitle: data.IntroTitle,
      IntroText: data.IntroText,
      IntroShort: data.IntroShort,
      ArticlesTitle: data.ArticlesTitle,
      LoadMoreArticles: data.LoadMoreArticles,
      ShowAllArticles: data.ShowAllArticles,
      ReadArticle: data.ReadArticle,
      By: data.By,
      Published: data.Published,
      Articles: normalizeArticles(data.Articles),
      FAQ: normalizeFaq(data.FAQ),
      Links: data.Links,
      Contact: data.Contact,
    };
  } catch (error) {
    if (locale !== "fr") {
      return loadRessources("fr");
    }
    notFound();
  }
}

export const dynamic = "force-dynamic";

export default async function RessourcesPage(
  props: { params: Promise<{ locale: string }> }
) {
  const params = await props.params;
  const nonce = await getCspNonce();
  const requestedLocale = params?.locale;
  const locale: Locale = isValidLocale(requestedLocale)
    ? requestedLocale
    : "fr";
  const tNav = await getTranslations(locale, "navbar");
  const tRessources = await getTranslations(locale, "ressources");

  const ressources = await loadRessources(locale);
  const ressourcesFr =
    locale === "fr" ? ressources : await loadRessources("fr");

  const articlesLocale = ressources.Articles;
  const articlesFr = ressourcesFr.Articles;
  const articlesMap = new Map(
    articlesLocale.map((article) => [article.slug, article])
  );
  const articlesCanonical = [...articlesFr]
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .map((article) => articlesMap.get(article.slug) ?? article);

  const labels = {
    ReadArticle: ressources.ReadArticle || "Read Article",
    By: ressources.By || "By",
    Published: ressources.Published || "Published on",
  };

  const eyebrow =
    locale === "fr" ? "Ressources"
    : locale === "de" ? "Ressourcen"
    : locale === "es" ? "Recursos"
    : locale === "pt" ? "Recursos"
    : "Resources";

  return (
    <div>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: (tNav("Home") as string) || "Home",
                item: `https://houle.ai/${locale}/`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: eyebrow,
                item: `https://houle.ai/${locale}/ressources/`,
              },
            ],
          }),
        }}
      />

      {/* Hero */}
      <div className="abstract-background">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <PageHero
            eyebrow={eyebrow}
            title={ressources.IntroTitle || "Resources"}
            description={ressources.IntroText || ""}
          />
        </div>
      </div>

      <main className="mx-auto max-w-[1200px] px-5 sm:px-8 pb-10">

      <section id="articles" className="mb-20 mt-16">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {ressources.ArticlesTitle || "Articles"}
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
              <div className="h-40 rounded-lg bg-muted/40" />
              <div className="h-40 rounded-lg bg-muted/40" />
              <div className="h-40 rounded-lg bg-muted/40" />
            </div>
          }
        >
          <ProgressiveResourceGrid
            articles={articlesCanonical}
            locale={locale}
            labels={labels}
            step={12}
            loadMoreLabel={ressources.LoadMoreArticles || "Load more articles"}
            showAllLabel={ressources.ShowAllArticles || "Show all"}
          />
        </Suspense>
      </section>
      <FAQSection faq={ressources.FAQ || {}} locale={locale} nonce={nonce} />

      <ContactSection
        locale={locale}
        title={
          (tRessources("Contact.Title") as string) ||
          "Questions about our resources?"
        }
        description={
          (tRessources("Contact.Description") as string) ||
          "Our experts are here to help you understand the details and implications for your business. Get personalized advice tailored to your situation."
        }
        buttonText={
          (tRessources("Contact.ButtonText") as string) || "Contact Our Team"
        }
      />
      </main>
    </div>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<ArticlesSearchParams>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const targetLocale = isValidLocale(locale) ? locale : "fr";
  const metadata = await getPageMetadata(targetLocale, "/ressources");

  if (searchParams && Object.keys(searchParams).length > 0) {
    return {
      ...metadata,
      robots: {
        index: false,
        follow: true,
        googleBot: {
          index: false,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  }

  return metadata;
}
