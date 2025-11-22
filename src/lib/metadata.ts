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

  return {
    metadataBase: new URL(siteUrl),
    title: info.title,
    description: info.description,
    keywords: [
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
    ],
    authors: [{ name: brand }],
    creator: brand,
    publisher: brand,
    openGraph: {
      type: "website",
      url: canonical,
      title: info.title,
      description: info.description,
      siteName: brand,
    },
    twitter: {
      card: "summary_large_image",
      title: info.title,
      description: info.description,
    },
    alternates: {
      canonical,
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
