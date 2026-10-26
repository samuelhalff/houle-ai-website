// app/layout.tsx
import { Providers } from "@/src/components/providers";
import { Metadata, Viewport } from "next";
import {
  generateOrganizationStructuredData,
  generateEnterpriseGPTServiceStructuredData,
  generateSwissAIIntegrationStructuredData,
} from "@/src/lib/metadata";
import { inter } from "./fonts";
import { headers } from "next/headers";
import ErrorBoundary from "@/src/components/ErrorBoundary";
import ClientOnlyProviders from "@/src/components/ClientOnlyProviders";
import { getCurrentLocale, getTranslations } from "@/src/lib/i18n";
import AttributionTracker from "@/src/components/AttributionTracker";
import {
  buildConsentBootstrap,
  isValidMeasurementId,
} from "@/src/lib/consent-mode";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://houle.ai"),
  title: {
    template: "%s - houle",
    default: "houle | Independent AI consulting in Geneva",
  },
  description:
    "houle is an independent AI consulting and integration firm in Geneva. The right model for each case: Microsoft, OpenAI, Anthropic, Mistral or open-source models hosted in Switzerland.",
  keywords:
    "houle, ai consulting geneva, vendor-neutral ai, open-source llm, swiss-hosted ai, self-hosted llm, private gpt, switzerland, nlpd, data sovereignty, microsoft 365, outlook add-in, word add-in",
  authors: [{ name: "houle" }],
  creator: "houle",
  publisher: "houle",
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
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "msvalidate.01": "C5C559E7A2F5598C1884F1DB1EBB8AA6",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ read nonce from the middleware
  const hdrs = await headers();
  const nonce =
    process.env.NODE_ENV === "production"
      ? hdrs.get("x-nonce") || undefined
      : undefined;
  const configuredGaId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID;
  const gaId = isValidMeasurementId(configuredGaId)
    ? configuredGaId
    : "G-H6EBEK7685";
  const currentLocale = await getCurrentLocale();

  const tCookie = await getTranslations(currentLocale, "cookie");
  const cookieLabels = {
    Title: tCookie("Title") as string,
    Text: tCookie("Text") as string,
    LearnMore: tCookie("LearnMore") as string,
    Accept: tCookie("Accept") as string,
    Decline: tCookie("Decline") as string,
    Manage: tCookie("Manage") as string,
  } as const;

  const orgJsonLd = generateOrganizationStructuredData();
  const enterpriseGPTJsonLd = generateEnterpriseGPTServiceStructuredData();
  const swissAIJsonLd = generateSwissAIIntegrationStructuredData();
  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://houle.ai/#website",
    url: "https://houle.ai",
    name: "houle",
    description:
      "Independent AI consulting and integration in Geneva. Vendor-neutral model choice, open-source models hosted in Switzerland, Microsoft 365 expertise and Office add-ins with AI.",
    publisher: {
      "@type": "Organization",
      "@id": "https://houle.ai/#organization",
    },
    inLanguage: ["en", "fr", "de", "es", "pt"],
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".site-hero-description", "article p:first-of-type"],
    },
  } as const;

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": "https://houle.ai/#localbusiness",
    name: "houle.ai",
    alternateName: "houle",
    description:
      "Independent AI consulting and integration firm in Geneva. Vendor-neutral model choice, including open-source models hosted in Switzerland, and Microsoft 365 expertise. Serving Geneva, Lausanne, and Switzerland.",
    url: "https://houle.ai",
    logo: "https://houle.ai/assets/logo.svg",
    image: "https://houle.ai/assets/og/og-en.webp",
    email: "contact@houle.ai",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Chemin du Pré-Roset 19",
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
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    areaServed: [
      { "@type": "City", name: "Geneva" },
      { "@type": "City", name: "Lausanne" },
      { "@type": "City", name: "Zürich" },
      { "@type": "Country", name: "Switzerland" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "AI Consulting and Integration Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "AI Consulting Geneva",
            description: "Vendor-neutral AI consulting: use-case selection, model choice including open-source models hosted in Switzerland, pilot and production",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Microsoft 365 Consulting",
            description: "Power Automate, SharePoint, Power BI, and SPFx expertise",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "SoftwareApplication",
            name: "Swiss GPT",
            description: "Enterprise GPT platform hosted on Microsoft Azure Switzerland",
          },
        },
      ],
    },
    sameAs: ["https://www.linkedin.com/company/houle-ai/"],
    parentOrganization: {
      "@type": "Corporation",
      name: "West Bay SA",
      legalName: "West Bay SA",
      taxID: "CHE-107.892.984",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Chemin du Pré-Roset 19",
        addressLocality: "Genthod",
        addressRegion: "Geneva",
        postalCode: "1294",
        addressCountry: "CH",
      },
    },
  } as const;

  return (
    <html
      suppressHydrationWarning
      lang={currentLocale}
      className={inter.variable}
    >
      <head>
        {/* Consent Mode v2 bootstrap: regional defaults + stored choice, then
            gtag.js. Must run before any other gtag call. */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: buildConsentBootstrap(gaId) }}
        />
        {nonce ? <meta name="csp-nonce" content={nonce} /> : null}
        <meta httpEquiv="Accept-CH" content="Sec-CH-Prefers-Color-Scheme" />
      </head>

      <body className={inter.className}>
        {/* ✅ expose nonce to client so dynamic scripts can reuse it */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `window.__CSP_NONCE__ = ${JSON.stringify(nonce)};`,
          }}
        />

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[999] focus:w-auto focus:h-auto focus:px-5 focus:py-3 focus:rounded-lg bg-primary text-primary-foreground focus:shadow-xl"
        >
          Skip to content
        </a>

        {/* ✅ All inline JSON-LD scripts keep the same nonce */}
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(enterpriseGPTJsonLd) }}
        />
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(swissAIJsonLd) }}
        />

        <Providers nonce={nonce}>
          <ErrorBoundary>
            <div className="pt-6 text-foreground bg-gradient-to-b from-background via-background to-background/60 min-h-screen">
              {children}

              <AttributionTracker />
              <ClientOnlyProviders
                nonce={nonce}
                locale={currentLocale}
                gtmId="GTM-P6QT792D"
                cookieLabels={cookieLabels}
              />
            </div>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
