import { Metadata } from "next";
import { Locale, locales } from "./i18n";
import fs from "fs";
import { join as pathJoin } from "path";

const siteUrl = "https://houle.ai";
const brand = "houle";

interface MetadataConfig {
  default: {
    title: string;
    description: string;
    keywords: string;
    author: string;
    siteName: string;
  };
  pages: Record<
    string,
    {
      title: string;
      description: string;
      keywords: string;
    }
  >;
  dynamic: {
    articles: {
      titleTemplate: string;
      descriptionTemplate: string;
      keywords: string;
    };
  };
}

// Function to load metadata config for a specific locale
async function loadMetadataConfig(locale: Locale): Promise<MetadataConfig> {
  const readMetadata = (loc: string): MetadataConfig | null => {
    try {
      const filePath = pathJoin(
        process.cwd(),
        "src",
        "translations",
        loc,
        "metadata.json"
      );
      if (!fs.existsSync(filePath)) return null;
      const fileContent = fs.readFileSync(filePath, "utf8");
      return JSON.parse(fileContent);
    } catch {
      return null;
    }
  };

  const primary = readMetadata(locale);
  const fallback = primary ? null : readMetadata("en");

  if (!primary && !fallback) {
    throw new Error(`Metadata config not found for locale ${locale}`);
  }

  return primary ?? fallback!;
}

const hreflangFor = (loc: Locale): string => {
  switch (loc) {
    case "fr":
      return "fr-CH";
    case "de":
      return "de-CH";
    case "es":
      return "es-ES";
    case "pt":
      return "pt-PT";
    default:
      return "en";
  }
};

export async function getPageMetadata(
  locale: Locale,
  path: string,
  customData?: {
    articleTitle?: string;
    articleDescription?: string;
    validLocales?: Locale[];
  }
): Promise<Metadata> {
  const config = await loadMetadataConfig(locale);

  // Respect placeholder locales (e.g., PLACEHOLDER_LOCALES="es,pt") to avoid
  // indexing incomplete placeholder locales. When a locale is marked as a
  // placeholder we will set robots.index/follow to false.
  function getPlaceholderLocales(): Set<Locale> {
    const raw = process.env.PLACEHOLDER_LOCALES || "";
    return new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) as Locale[]
    );
  }
  const placeholderLocales = getPlaceholderLocales();

  // Get page-specific metadata or fall back to default
  const pageData = config.pages[path] || config.default;

  let title = pageData.title;
  let description = pageData.description;

  // Handle dynamic pages (like articles)
  if (path.startsWith("/ressources/articles/") && customData?.articleTitle) {
    title = config.dynamic.articles.titleTemplate.replace(
      "{articleTitle}",
      customData.articleTitle
    );
    description = config.dynamic.articles.descriptionTemplate.replace(
      "{articleDescription}",
      customData.articleDescription || ""
    );
  }

  const canonicalPath = `/${locale}${path}/`;
  
  // Determine which locales to include in alternates
  // If validLocales is provided, use only those; otherwise use all locales
  // This allows dynamic pages (like articles) to limit alternates to actual content
  // while static pages continue to include all locales for backward compatibility
  const localesToInclude = customData?.validLocales ?? locales;
  
  const alternateUrls: Record<string, string> = {};
  for (const loc of localesToInclude) {
    const locPath = `/${loc}${path}/`;
    const key = hreflangFor(loc);
    alternateUrls[key] = `${siteUrl}${locPath}`;
  }

  const ogLocale =
    locale === "fr"
      ? "fr_CH"
      : locale === "de"
      ? "de_CH"
      : locale === "es"
      ? "es_ES"
      : locale === "pt"
      ? "pt_PT"
      : "en_US";

  const ogImage = `/assets/og/og-${locale}.avif`;

  const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: pageData.keywords || config.default.keywords,
    authors: [{ name: config.default.author }],
    creator: config.default.author,
    publisher: config.default.siteName,
    robots: {
      index: !placeholderLocales.has(locale),
      follow: !placeholderLocales.has(locale),
      googleBot: {
        index: !placeholderLocales.has(locale),
        follow: !placeholderLocales.has(locale),
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      url: `${siteUrl}${canonicalPath}`,
      title,
      description,
      siteName: config.default.siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: brand,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    icons: {
      icon: [
        {
          url: "/favicon.svg",
          type: "image/svg+xml",
        },
        {
          url: "/favicon.ico",
          sizes: "any",
        },
        {
          url: "/favicon.png",
          type: "image/png",
          sizes: "32x32",
        },
      ],
      apple: [
        {
          url: "/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
    alternates: {
      canonical: `${siteUrl}${canonicalPath}`,
      languages: Object.assign(
        {
          "x-default": (() => {
            const defaultLocale = localesToInclude.includes("en" as Locale)
              ? "en"
              : localesToInclude[0];
            return `${siteUrl}/${defaultLocale}${path}/`;
          })(),
        },
        alternateUrls
      ),
    },
    other: {
      "msvalidate.01": "C5C559E7A2F5598C1884F1DB1EBB8AA6",
    },
  };

  return metadata;
}

// Helper function for static pages (backward compatibility)
export async function generateMetadataForPage(
  localeOrPath: Locale | string,
  path?: string
): Promise<Metadata> {
  if (typeof localeOrPath === "string" && !path) {
    // Old signature: generateMetadataForPage("/path") - default to English
    return await getPageMetadata("en" as Locale, localeOrPath);
  } else if (typeof localeOrPath === "string" && path) {
    // New signature: generateMetadataForPage(locale, path)
    return await getPageMetadata(localeOrPath as Locale, path);
  } else {
    // New signature: generateMetadataForPage(locale, path)
    return await getPageMetadata(localeOrPath as Locale, path || "/");
  }
}

// Helper function for dynamic pages (like articles)
export async function generateMetadataForArticle(
  localeOrSlug: Locale | string,
  slugOrTitle?: string,
  titleOrDescription?: string,
  description?: string,
  validLocales?: Locale[]
): Promise<Metadata> {
  if (
    typeof localeOrSlug === "string" &&
    slugOrTitle &&
    titleOrDescription &&
    !description
  ) {
    // Old signature: generateMetadataForArticle(slug, title, description)
    return await getPageMetadata(
      "en" as Locale,
      `/ressources/articles/${localeOrSlug}`,
      {
        articleTitle: slugOrTitle,
        articleDescription: titleOrDescription,
        validLocales,
      }
    );
  } else {
    // New signature: generateMetadataForArticle(locale, slug, title, description, validLocales)
    return await getPageMetadata(
      localeOrSlug as Locale,
      `/ressources/articles/${slugOrTitle}`,
      {
        articleTitle: titleOrDescription,
        articleDescription: description,
        validLocales,
      }
    );
  }
}

export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand,
    description:
      "Swiss-hosted AI solutions for Microsoft 365. Office add-ins with AI and enterprise GPT platform.",
    url: siteUrl,
    logo: `${siteUrl}/favicon.png`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: [
        "English",
        "French",
        "German",
        "Spanish",
        "Portuguese",
      ],
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "CH",
    },
    areaServed: [
      "Geneva",
      "Lausanne",
      "Switzerland",
      "French-speaking Switzerland",
    ],
    knowsAbout: [
      "AI Microsoft 365",
      "Swiss AI solutions",
      "private GPT",
      "Outlook AI assistant",
      "Word AI add-in",
      "Microsoft 365 consulting",
      "Azure AI integration",
      "Swiss data sovereignty",
      "Power Automate Switzerland",
      "SharePoint consulting",
    ],
  };
}
