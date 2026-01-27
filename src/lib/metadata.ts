import { Metadata } from "next";
import { Locale, locales } from "./i18n";
import fs from "fs";
import { join as pathJoin } from "path";
import { buildInternalUrl } from "./paths";

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

const metadataConfigCache = new Map<Locale, MetadataConfig>();

// Function to load metadata config for a specific locale
async function loadMetadataConfig(locale: Locale): Promise<MetadataConfig> {
  const cached = metadataConfigCache.get(locale);
  if (cached) return cached;

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

  const resolved = primary ?? fallback!;
  metadataConfigCache.set(locale, resolved);
  return resolved;
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

  const canonicalPath = buildInternalUrl(path, locale);
  
  // Determine which locales to include in alternates
  // If validLocales is provided, use only those; otherwise use all locales
  // This allows dynamic pages (like articles) to limit alternates to actual content
  // while static pages continue to include all locales for backward compatibility
  const localesToInclude = customData?.validLocales ?? locales;
  
  const alternateUrls: Record<string, string> = {};
  for (const loc of localesToInclude) {
    const key = hreflangFor(loc);
    alternateUrls[key] = `${siteUrl}${buildInternalUrl(path, loc)}`;
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
            // x-default should point to the root domain for the homepage
            if (path === "/") {
              return siteUrl;
            }
            const defaultLocale: Locale = localesToInclude.includes("en" as Locale)
              ? "en"
              : localesToInclude[0];
            return `${siteUrl}${buildInternalUrl(path, defaultLocale)}`;
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
    "@id": `${siteUrl}/#organization`,
    name: brand,
    legalName: "West-Bay SA",
    alternateName: ["Houle", "houle"],
    description:
      "Swiss-hosted enterprise AI platform for Microsoft 365. Private GPT solutions with Azure Switzerland, Office add-ins with AI, and consulting services ensuring data sovereignty and nLPD compliance.",
    url: siteUrl,
    foundingDate: "2024-01-01",
    slogan: "Private AI built into the Microsoft tools you already use",
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/assets/logo.svg`,
      width: "512",
      height: "512",
    },
    image: `${siteUrl}/assets/logo.svg`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "contact@houle.ai",
      availableLanguage: [
        "English",
        "French",
        "German",
        "Spanish",
        "Portuguese",
      ],
      areaServed: "CH",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Chemin Pré-Roset",
      addressLocality: "Genthod",
      addressRegion: "Geneva",
      postalCode: "1294",
      addressCountry: "CH",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 46.2667,
      longitude: 6.1569,
    },
    areaServed: [
      { "@type": "City", name: "Geneva" },
      { "@type": "City", name: "Lausanne" },
      { "@type": "City", name: "Zürich" },
      { "@type": "City", name: "Bern" },
      { "@type": "Country", name: "Switzerland" },
    ],
    sameAs: ["https://www.linkedin.com/company/houle-ai/"],
    knowsAbout: [
      "AI Microsoft 365",
      "Swiss AI solutions",
      "private GPT",
      "Swiss Azure Hosting",
      "Data Sovereignty",
      "nLPD Compliance",
      "FADP Compliance",
      "GDPR Compliance",
      "Outlook AI assistant",
      "Word AI add-in",
      "Microsoft 365 consulting",
      "Azure AI integration",
      "Power Automate Switzerland",
      "SharePoint consulting",
      "Large Language Models",
      "Human-in-the-loop AI",
    ],
    parentOrganization: {
      "@type": "Corporation",
      name: "West-Bay SA",
      legalName: "West-Bay SA",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Genthod",
        addressRegion: "Geneva",
        postalCode: "1294",
        addressCountry: "CH",
      },
    },
  };
}

/**
 * Generate Service structured data for Enterprise GPT Solutions
 */
export function generateEnterpriseGPTServiceStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteUrl}/#enterprise-gpt-service`,
    name: "Enterprise GPT Solutions",
    description:
      "Private GPT platform for enterprises, hosted exclusively on Microsoft Azure Switzerland. Features include document analysis, email automation, and custom AI workflows with complete data sovereignty.",
    serviceType: [
      "Enterprise AI Platform",
      "Data Sovereignty",
      "nLPD/GDPR Compliance",
      "Swiss Azure Hosting",
    ],
    url: `${siteUrl}/en/products/swiss-gpt/`,
    provider: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "houle.ai",
      legalName: "West-Bay SA",
    },
    areaServed: {
      "@type": "Country",
      name: "Switzerland",
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${siteUrl}/en/contact/`,
      serviceType: "Consultation",
    },
    termsOfService: `${siteUrl}/en/legal/terms/`,
    category: "Business Technology Services",
    audience: {
      "@type": "Audience",
      audienceType: "Enterprise",
    },
  };
}

/**
 * Generate Service structured data for Swiss AI Integration
 */
export function generateSwissAIIntegrationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteUrl}/#swiss-ai-integration`,
    name: "Swiss-Hosted AI Integration",
    description:
      "End-to-end AI integration services for Microsoft 365, Power Platform, and custom enterprise applications. All processing occurs within Swiss borders, ensuring compliance with nLPD (Swiss Data Protection Act) and GDPR regulations.",
    serviceType: [
      "AI Integration Consulting",
      "Data Sovereignty",
      "nLPD/GDPR Compliance",
      "Swiss Azure Hosting",
      "Microsoft 365 Integration",
    ],
    url: `${siteUrl}/en/services/ai-consulting/`,
    provider: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "houle.ai",
      legalName: "West-Bay SA",
    },
    areaServed: [
      { "@type": "Country", name: "Switzerland" },
      { "@type": "City", name: "Geneva" },
      { "@type": "City", name: "Lausanne" },
      { "@type": "City", name: "Zürich" },
      { "@type": "City", name: "Bern" },
    ],
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${siteUrl}/en/contact/`,
      serviceType: "Consultation",
    },
    category: "Professional IT Services",
    knowsAbout: [
      "Microsoft Azure Switzerland",
      "Large Language Models (LLM)",
      "Human-in-the-loop AI",
      "Operational Efficiency",
      "Enterprise AI Governance",
    ],
  };
}
