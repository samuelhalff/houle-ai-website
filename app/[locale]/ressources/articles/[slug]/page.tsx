import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import ContactSection from "../components/ContactSection";
import { getPageMetadata } from "@/src/lib/metadata";
import { getTranslations, isValidLocale, type Locale } from "@/src/lib/i18n";
import { getCspNonce } from "@/src/lib/csp";
import {
  getArticle,
  getArticles,
  getRessources,
  getValidLocalesForSlug,
  isGenuineTranslation,
  type ResourceArticle,
  type RessourcesDictionary,
  type ArticleReference,
} from "@/src/lib/articles";
import RelatedArticles from "../components/RelatedArticles";
import Breadcrumbs from "@/src/components/navigation/Breadcrumbs";
import { estimateReadingTime } from "@/src/lib/readingTime";
import Defer from "@/src/components/Defer";
import { getResourceCategoryLabel } from "@/src/lib/resourceCategories";
import {
  ShareButtons,
  ReadingProgress,
  BackToTop,
} from "../components/ArticleClientWidgets";

type Params = { params: Promise<{ slug: string; locale: string }> };

const markdownComponents: Components = {
  table({ node: _node, className, ...props }) {
    return (
      <div className="my-6 overflow-x-auto">
        <table className={["w-full", className].filter(Boolean).join(" ")} {...props} />
      </div>
    );
  },
};

export default async function ArticlePage(props: Params) {
  const params = await props.params;
  const nonce = await getCspNonce();
  const locale: Locale = isValidLocale(params.locale) ? params.locale : "fr";
  // Load the locale-specific translations on the server
  const ressources = await getRessources(locale);
  const tNav = await getTranslations(locale, "navbar");
  const frArticle = await getArticle("fr", params.slug);

  const localArticle = await getArticle(locale, params.slug);
  // If slug doesn't exist at all in this locale, return 404
  if (locale !== "fr" && !localArticle) return notFound();

  // Check if this is a duplicate/untranslated article (content identical to FR)
  // If so, return 404 to prevent soft 404 issues with Google
  if (locale !== "fr" && !isGenuineTranslation(localArticle, frArticle)) {
    // This is duplicate content - return 404 to avoid soft 404 reports
    return notFound();
  }
  const article = localArticle ?? frArticle;
  if (!article) return notFound();

  const references: ArticleReference[] = Array.isArray(article.references)
    ? article.references
    : [];

  const baseUrl = "https://houle.ai";
  const articleUrl = `${baseUrl}/${locale}/ressources/articles/${params.slug}/`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: (tNav("Home") as string) || "Home",
        item: `${baseUrl}/${locale}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: ressources.IntroTitle || "Resources",
        item: `${baseUrl}/${locale}/ressources/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: ressources.ArticlesTitle || "Articles",
        item: `${baseUrl}/${locale}/ressources/articles/`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: article.title,
        item: articleUrl,
      },
    ],
  } as const;
  const imageUrl = article.image
    ? `${baseUrl}/assets/${article.image.replace(/^\/?assets\//, "")}`
    : `${baseUrl}/assets/og/og-${locale}.webp`;
  const reading = estimateReadingTime(article.content || "");
  const categoryLabel = getResourceCategoryLabel(article.category);
  const tags = Array.isArray(article.tags) ? article.tags : [];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    author: {
      "@type": "Person",
      name: article.author,
      ...(article.authorUrl ? { url: article.authorUrl } : {}),
    },
    datePublished: article.date,
    url: articleUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    inLanguage: locale,
    publisher: {
      "@type": "Organization",
      name: "houle",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/favicon.png`,
        width: 512,
        height: 512,
      },
      url: baseUrl,
    },
    ...(article.updated ? { dateModified: article.updated } : {}),
    ...(reading ? { timeRequired: reading.timeRequiredISO } : {}),
    articleSection: categoryLabel,
    ...(tags.length ? { keywords: tags.join(", ") } : {}),
    image: {
      "@type": "ImageObject",
      url: imageUrl,
    },
    about: [
      {
        "@type": "Thing",
        name: categoryLabel,
      },
      ...tags.map((tag) => ({ "@type": "Thing", name: tag })),
    ],
  } as const;

  return (
    <main className="max-w-3xl mx-auto px-5 py-12 sm:px-6 mt-8">
      <Defer rootMargin="300px" idle={200}>
        <ReadingProgress targetSelector="#article-content" />
      </Defer>
      <Defer rootMargin="300px" idle={200}>
        <BackToTop />
      </Defer>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Breadcrumbs
        className="mb-6"
        baseLabel={ressources.IntroShort || "Resources"}
        rootLabel={(tNav("Home") as string) || "Home"}
        segments={[
          {
            segment: "ressources",
            label: ressources.IntroShort || "Resources",
          },
          {
            segment: "articles",
            label: ressources.ArticlesShort || "Articles",
          },
          { segment: params.slug, label: article.title },
        ]}
        maxLabelChars={56}
        hideRootWhenDuplicate={false}
      />
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl mt-8 mb-4 text-balance">
        {article.title}
      </h1>
      {/* Feature image intentionally not displayed to keep layout compact */}
      <p className="text-lg mb-8 leading-8 text-foreground/75">{article.description}</p>

      <div className="text-sm mb-6 space-y-1 text-muted-foreground border-b border-border pb-6">
        <p>
          {ressources.By} <span className="font-medium text-foreground">{article.author}</span>
        </p>
        <p>
          {ressources.Published} {formatDateDeterministic(article.date, locale)}
        </p>
        {article.updated && (
          <p>
            {ressources.LastUpdated}:{" "}
            {formatDateDeterministic(article.updated, locale)}
          </p>
        )}
        {reading && (
          <p>
            {ressources.ReadingTime}: {reading.minutes} {ressources.Minutes} (
            {reading.words} {ressources.Words as string})
          </p>
        )}
      </div>

      <div className="flex mb-10 min-h-[40px]">
        <Defer
          rootMargin="200px"
          idle={250}
          placeholder={<div className="h-[36px] w-64 rounded-md bg-muted/40" />}
        >
          <ShareButtons url={articleUrl} title={article.title} />
        </Defer>
      </div>

      <article
        id="article-content"
        className="prose prose-lg dark:prose-invert max-w-none"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {article.content ?? ""}
        </ReactMarkdown>
      </article>

      {references.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-2">
            {ressources.References}
          </h2>
          <ul className="list-disc pl-6">
            {references.map((ref) => {
              const value = ressources[ref.labelKey];
              const resolvedLabel =
                typeof value === "string" ? value : ref.labelKey;
              return (
                <li key={ref.url}>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand underline decoration-brand/40 underline-offset-4 hover:decoration-brand"
                  >
                    {resolvedLabel}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <RelatedArticles currentSlug={params.slug} locale={locale} />

      {(() => {
        const title =
          ressources.banner?.questions_about_article ||
          "Questions about this article?";
        const description =
          ressources.banner?.banner_body ||
          "Our experts are here to help you understand the details and implications for your business. Get personalized advice tailored to your situation.";
        const buttonText =
          ressources.banner?.contact_button || "Contact our team";
        return (
          <ContactSection
            locale={locale}
            title={title}
            description={description}
            buttonText={buttonText}
          />
        );
      })()}
    </main>
  );
}

// Enumerate slugs from the canonical French source at build-time (FR is canonical across tooling).
export async function generateStaticParams() {
  const articles = await getArticles("fr");
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata(props: Params) {
  const params = await props.params;
  const locale: Locale = isValidLocale(params.locale) ? params.locale : "fr";
  const frArticle = await getArticle("fr", params.slug);

  const localArticle = await getArticle(locale, params.slug);
  // If slug doesn't exist at all in this locale, return 404
  if (locale !== "fr" && !localArticle) return notFound();

  // Check if this is a duplicate/untranslated article (content identical to FR)
  // If so, return 404 to prevent soft 404 issues with Google
  if (locale !== "fr" && !isGenuineTranslation(localArticle, frArticle)) {
    // This is duplicate content - return 404 to avoid soft 404 reports
    return notFound();
  }
  const article = localArticle ?? frArticle;
  if (!article) return {};

  const validLocales = await getValidLocalesForSlug(params.slug);

  const reading = article.content ? estimateReadingTime(article.content) : null;
  const meta = await getPageMetadata(
    locale,
    `/ressources/articles/${params.slug}`,
    {
      articleTitle: article.title,
      articleDescription: article.description,
      validLocales,
    }
  );

  return {
    ...meta,
    title: article.title,
    description: article.description,
    robots: {
      index: true,
      follow: true,
    },
    other: {
      ...(meta.other || {}),
      estimatedReadingTime: reading ? reading.timeRequiredISO : undefined,
    },
  };
}

function formatDateDeterministic(date?: string, locale: string = "en") {
  if (!date) return "";
  try {
    // Normalize locale (fallback chain)
    const loc = locale || "en";
    return new Intl.DateTimeFormat(loc, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  } catch (e) {
    try {
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(date));
    } catch {
      return new Date(date).toISOString().split("T")[0];
    }
  }
}
