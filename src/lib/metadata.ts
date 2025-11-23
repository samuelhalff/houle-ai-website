import { Metadata } from "next";
import { Locale } from "./i18n";

const siteUrl = "https://houle.ai";
const brand = "houle";

const pageCopy: Record<string, { title: string; description: string }> = {
  "/": {
    title: "houle | Private AI for Microsoft 365",
    description:
      "houle brings private AI into Microsoft 365 with add-ins and GPT hosted in Switzerland.",
  },
  "/contact": {
    title: "Contact houle",
    description:
      "Reach our team to preview houle's AI tools or shape early integrations.",
  },
  "/services/ai-consulting": {
    title: "AI Consulting Geneva | Artificial Intelligence Solutions for SMEs",
    description:
      "AI consulting in Geneva for SMEs. We deploy Azure AI solutions: intelligent automation, predictive analytics, conversational assistants. Data sovereignty in Switzerland.",
  },
  "/services/microsoft-consulting": {
    title:
      "Microsoft 365 Consulting Geneva | Power Automate, SharePoint, Power BI",
    description:
      "Microsoft 365 consulting in Geneva. Experts in Power Automate, SharePoint, Power BI and SPFx. Automate your processes and optimize collaboration.",
  },
  "/ressources": {
    title: "Resources & Case Studies | AI and Microsoft 365 in Geneva",
    description:
      "Discover real case studies of AI and Microsoft 365 implementations in Geneva businesses. Practical guides and measurable results.",
  },
};

function canonicalFor(locale: Locale, path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}/${locale}${normalized}`;
}

export async function getPageMetadata(
  locale: Locale,
  path: string
): Promise<Metadata> {
  const info = pageCopy[path] || pageCopy["/"];
  const canonical = canonicalFor(locale, path || "/");

  // Enhanced keywords based on page type
  let keywords = [
    "houle",
    "ai",
    "microsoft 365",
    "outlook add-in",
    "word add-in",
    "private gpt",
    "switzerland",
    "swiss ai",
    "geneva",
    "lausanne",
    "bern",
    "valais",
    "zurich",
    "west-bay sa",
  ];

  if (path === "/services/ai-consulting") {
    keywords = [
      "ai consulting geneva",
      "artificial intelligence switzerland",
      "azure ai",
      "ai automation",
      "predictive analytics",
      "chatbot development",
      "machine learning geneva",
      "ai sme",
      "gpt-4 switzerland",
      "private ai",
      "data sovereignty",
      "semantic search",
      "document automation",
      "intelligent automation geneva",
      ...keywords,
    ];
  } else if (path === "/services/microsoft-consulting") {
    keywords = [
      "microsoft 365 consulting geneva",
      "power automate switzerland",
      "sharepoint consulting",
      "power bi geneva",
      "spfx development",
      "microsoft 365 automation",
      "sharepoint workflows",
      "power bi dashboards",
      "teams integration",
      "microsoft cloud geneva",
      "office 365 optimization",
      "power platform",
      ...keywords,
    ];
  }

  return {
    metadataBase: new URL(siteUrl),
    title: info.title,
    description: info.description,
    keywords,
    authors: [{ name: brand }],
    creator: brand,
    publisher: brand,
    openGraph: {
      type: "website",
      url: canonical,
      title: info.title,
      description: info.description,
      siteName: brand,
      locale: locale === "fr" ? "fr_CH" : locale === "de" ? "de_CH" : "en_US",
      images: [
        {
          url: `${siteUrl}/assets/og/og-${locale}.avif`,
          width: 1200,
          height: 630,
          alt: info.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: info.title,
      description: info.description,
      images: [`${siteUrl}/assets/og/og-${locale}.avif`],
    },
    alternates: {
      canonical,
      languages: {
        en: `${siteUrl}/en${path}`,
        fr: `${siteUrl}/fr${path}`,
        de: `${siteUrl}/de${path}`,
        es: `${siteUrl}/es${path}`,
        pt: `${siteUrl}/pt${path}`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export async function generateMetadataForPage(
  localeOrPath: Locale | string,
  path?: string
): Promise<Metadata> {
  if (typeof localeOrPath === "string" && !path) {
    return await getPageMetadata("en" as Locale, localeOrPath);
  } else if (typeof localeOrPath === "string" && path) {
    return await getPageMetadata(localeOrPath as Locale, path);
  } else {
    return await getPageMetadata(localeOrPath as Locale, path || "/");
  }
}

export async function generateMetadataForArticle(): Promise<Metadata> {
  return getPageMetadata("en", "/ressources/articles");
}

export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand,
    url: siteUrl,
    logo: `${siteUrl}/favicon.png`,
  };
}
