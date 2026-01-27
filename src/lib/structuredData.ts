/**
 * Structured Data (JSON-LD) builder utilities.
 * Keep objects small & serialisable – we only assemble plain JSON here.
 * All functions return POJOs ready to be stringified.
 */

export interface FAQEntry {
  question: string;
  answer: string;
}

export function buildFAQPage(entries: FAQEntry[], limit?: number) {
  const list = entries
    .filter((e) => e.question && e.answer)
    .slice(0, limit || entries.length)
    .map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: { "@type": "Answer", text: e.answer },
    }));
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: list,
  } as const;
}

export interface HowToStep {
  name: string;
  text?: string;
  /** Optional extra details (e.g. tools, supplies) appended for later enrichment */
  image?: string;
  url?: string;
  /** Estimated time in ISO 8601 duration (e.g. PT10M) */
  estimatedTime?: string;
}

export interface HowToConfig {
  name: string;
  description: string;
  steps: HowToStep[];
  /** Total estimated time (ISO 8601) */
  totalTime?: string;
  /** Tools used across the process */
  tools?: string[];
  /** Supplies / materials required */
  supplies?: string[];
  /** Overall cost description */
  estimatedCost?: { currency: string; value: string; name?: string };
}

export function buildHowTo(cfg: HowToConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: cfg.name,
    description: cfg.description,
    ...(cfg.totalTime ? { totalTime: cfg.totalTime } : {}),
    ...(cfg.estimatedCost
      ? {
          estimatedCost: {
            "@type": "MonetaryAmount",
            currency: cfg.estimatedCost.currency,
            value: cfg.estimatedCost.value,
            ...(cfg.estimatedCost.name ? { name: cfg.estimatedCost.name } : {}),
          },
        }
      : {}),
    ...(cfg.tools
      ? { tool: cfg.tools.map((t) => ({ "@type": "HowToTool", name: t })) }
      : {}),
    ...(cfg.supplies
      ? {
          supply: cfg.supplies.map((s) => ({
            "@type": "HowToSupply",
            name: s,
          })),
        }
      : {}),
    step: cfg.steps.map((s, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: s.name,
      ...(s.text ? { text: s.text } : {}),
      ...(s.image ? { image: s.image } : {}),
      ...(s.url ? { url: s.url } : {}),
      ...(s.estimatedTime ? { estimatedTime: s.estimatedTime } : {}),
    })),
  } as const;
}

export interface BreadcrumbItem {
  name: string;
  item: string; // absolute URL
}

export function buildBreadcrumbList(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  } as const;
}

export interface OrganizationAggregateRatingConfig {
  name: string;
  url: string;
  ratingValue: string;
  reviewCount: number;
  logo?: string;
}

export function buildOrganizationAggregateRating(
  cfg: OrganizationAggregateRatingConfig
) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: cfg.name,
    url: cfg.url,
    ...(cfg.logo ? { logo: cfg.logo } : {}),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: cfg.ratingValue,
      reviewCount: cfg.reviewCount,
    },
  } as const;
}

export function buildWebSiteSearchAction(siteUrl: string) {
  // Potential future enhancement – not wired yet.
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  } as const;
}

export interface ServiceSchemaConfig {
  name: string;
  description: string;
  serviceType?: string;
  url: string; // absolute URL
  areaServed?: string[];
  provider?: { name: string; url?: string; logo?: string };
}

export function buildServiceSchema(cfg: ServiceSchemaConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: cfg.name,
    description: cfg.description,
    ...(cfg.serviceType ? { serviceType: cfg.serviceType } : {}),
    url: cfg.url,
    ...(cfg.areaServed ? { areaServed: cfg.areaServed } : {}),
    ...(cfg.provider
      ? {
          provider: {
            "@type": "Organization",
            name: cfg.provider.name,
            ...(cfg.provider.url ? { url: cfg.provider.url } : {}),
            ...(cfg.provider.logo ? { logo: cfg.provider.logo } : {}),
          },
        }
      : {}),
    audience: {
      "@type": "Audience",
      audienceType: "Business",
    },
    category: "Professional Services",
  } as const;
}

export interface ProductSchemaConfig {
  name: string;
  description: string;
  url: string;
  brand?: string;
  offers?: {
    price?: string;
    priceCurrency?: string;
  };
}

export function buildProductSchema(cfg: ProductSchemaConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: cfg.name,
    description: cfg.description,
    url: cfg.url,
    brand: {
      "@type": "Organization",
      name: cfg.brand || "houle.ai",
    },
    ...(cfg.offers
      ? {
          offers: {
            "@type": "Offer",
            availability: "https://schema.org/PreOrder",
            ...(cfg.offers.price ? { price: cfg.offers.price } : {}),
            ...(cfg.offers.priceCurrency
              ? { priceCurrency: cfg.offers.priceCurrency }
              : {}),
          },
        }
      : {}),
  } as const;
}

export interface LocalBusinessConfig {
  name: string;
  description: string;
  url: string;
  logo: string;
  telephone?: string;
  email: string;
  address: {
    streetAddress: string;
    postalCode: string;
    addressLocality: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
  priceRange?: string;
  areaServed?: string[];
}

export function buildLocalBusiness(cfg: LocalBusinessConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": cfg.url,
    name: cfg.name,
    description: cfg.description,
    url: cfg.url,
    logo: cfg.logo,
    ...(cfg.telephone ? { telephone: cfg.telephone } : {}),
    email: cfg.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: cfg.address.streetAddress,
      postalCode: cfg.address.postalCode,
      addressLocality: cfg.address.addressLocality,
      addressCountry: cfg.address.addressCountry,
    },
    ...(cfg.geo
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: cfg.geo.latitude,
            longitude: cfg.geo.longitude,
          },
        }
      : {}),
    ...(cfg.openingHours ? { openingHours: cfg.openingHours } : {}),
    ...(cfg.priceRange ? { priceRange: cfg.priceRange } : {}),
    ...(cfg.areaServed ? { areaServed: cfg.areaServed } : {}),
  } as const;
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://houle.ai/#organization",
    name: "houle.ai",
    legalName: "West-Bay SA",
    alternateName: ["Houle", "houle"],
    url: "https://houle.ai",
    logo: {
      "@type": "ImageObject",
      url: "https://houle.ai/assets/logo.svg",
      width: "512",
      height: "512",
    },
    image: "https://houle.ai/assets/logo.svg",
    email: "contact@houle.ai",
    description:
      "Swiss-hosted enterprise AI platform for Microsoft 365. Private GPT solutions with Azure Switzerland, Office add-ins with AI, and consulting services ensuring data sovereignty and nLPD compliance.",
    foundingDate: "2024",
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
      {
        "@type": "City",
        name: "Geneva",
      },
      {
        "@type": "City",
        name: "Lausanne",
      },
      {
        "@type": "City",
        name: "Zürich",
      },
      {
        "@type": "City",
        name: "Bern",
      },
      {
        "@type": "Country",
        name: "Switzerland",
      },
    ],
    sameAs: ["https://www.linkedin.com/company/houle-ai/"],
    knowsAbout: [
      "Artificial Intelligence",
      "Azure AI",
      "Microsoft 365",
      "Swiss Azure Hosting",
      "Data Sovereignty",
      "nLPD Compliance",
      "FADP Compliance",
      "GDPR Compliance",
      "Enterprise GPT",
      "Private AI Solutions",
      "Power Automate",
      "SharePoint",
      "Power BI",
      "SPFx",
      "Machine Learning",
      "Business Automation",
      "Large Language Models",
      "Human-in-the-loop AI",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "AI Products and Services",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "AI Products",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "SoftwareApplication",
                name: "Swiss GPT",
                description:
                  "Enterprise GPT platform hosted in Switzerland with Azure",
                applicationCategory: "BusinessApplication",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "SoftwareApplication",
                name: "AI for Word",
                description: "AI-powered add-in for Microsoft Word",
                applicationCategory: "BusinessApplication",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "SoftwareApplication",
                name: "AI for Outlook",
                description: "AI-powered add-in for Microsoft Outlook",
                applicationCategory: "BusinessApplication",
              },
            },
          ],
        },
        {
          "@type": "OfferCatalog",
          name: "Consulting Services",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "AI Consulting",
                description:
                  "Custom AI solutions and implementation consulting",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Microsoft 365 Consulting",
                description:
                  "Microsoft 365 optimization, Power Platform, and SharePoint consulting",
              },
            },
          ],
        },
      ],
    },
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
  } as const;
}

/**
 * Enterprise GPT Solutions service schema with Swiss trust signals
 */
export function buildEnterpriseGPTServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://houle.ai/#enterprise-gpt-service",
    name: "Enterprise GPT Solutions",
    description:
      "Private GPT platform for enterprises, hosted exclusively on Microsoft Azure Switzerland. Features include document analysis, email automation, and custom AI workflows with complete data sovereignty.",
    serviceType: [
      "Enterprise AI Platform",
      "Data Sovereignty",
      "nLPD/GDPR Compliance",
      "Swiss Azure Hosting",
    ],
    url: "https://houle.ai/en/products/swiss-gpt/",
    provider: {
      "@type": "Organization",
      "@id": "https://houle.ai/#organization",
      name: "houle.ai",
      legalName: "West-Bay SA",
    },
    areaServed: {
      "@type": "Country",
      name: "Switzerland",
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: "https://houle.ai/en/contact/",
      serviceType: "Consultation",
    },
    termsOfService: "https://houle.ai/en/legal/terms/",
    category: "Business Technology Services",
    audience: {
      "@type": "Audience",
      audienceType: "Enterprise",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Enterprise GPT Features",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Swiss-Hosted GPT",
            description: "Large Language Model hosted on Azure Switzerland datacenter",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Document Intelligence",
            description: "AI-powered document analysis with human-in-the-loop validation",
          },
        },
      ],
    },
  } as const;
}

/**
 * Swiss AI Integration service schema for compliance-focused buyers
 */
export function buildSwissAIIntegrationServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://houle.ai/#swiss-ai-integration",
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
    url: "https://houle.ai/en/services/ai-consulting/",
    provider: {
      "@type": "Organization",
      "@id": "https://houle.ai/#organization",
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
      serviceUrl: "https://houle.ai/en/contact/",
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
  } as const;
}

export function buildProfessionalServiceSchema(
  serviceUrl: string,
  serviceName: string,
  serviceDescription: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${serviceUrl}#service`,
    name: serviceName,
    description: serviceDescription,
    url: serviceUrl,
    provider: {
      "@type": "Organization",
      "@id": "https://houle.ai/#organization",
      name: "houle.ai",
    },
    areaServed: {
      "@type": "Country",
      name: "Switzerland",
    },
    availableLanguage: ["fr", "en", "de"],
  } as const;
}
