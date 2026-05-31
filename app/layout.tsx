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
import { getCurrentLocale } from "@/src/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://houle.ai"),
  title: {
    template: "%s - houle",
    default: "Houle | Swiss-Hosted Enterprise AI & Secure GPT Solutions",
  },
  description:
    "Houle provides secure, Swiss-hosted Enterprise AI solutions. Specializing in Human-AI collaboration, nLPD compliance, and private Azure-based GPT platforms.",
  keywords:
    "houle, enterprise ai, microsoft 365, outlook add-in, word add-in, private gpt, switzerland, swiss ai, azure switzerland, nlpd, data sovereignty, llm",
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
  // ✅ read nonce and UA headers from the middleware
  const hdrs = await headers();
  const nonce =
    process.env.NODE_ENV === "production"
      ? hdrs.get("x-nonce") || undefined
      : undefined;
  const userAgent = hdrs.get("user-agent") || "";
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const gaId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    process.env.NEXT_PUBLIC_GA_ID ||
    "G-H6EBEK7685";
  const currentLocale = await getCurrentLocale();

  const cookieLabels = {
    Title: "Cookies",
    Text: "We use cookies for analytics and a smoother experience.",
    LearnMore: "Cookie settings",
    Accept: "Accept",
    Decline: "Decline",
    Manage: "Manage cookies",
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
      "Swiss-hosted enterprise AI solutions for Microsoft 365. Private GPT, Office add-ins with AI, and consulting services.",
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
      "AI consulting firm in Geneva offering Microsoft 365 AI solutions, Swiss-hosted GPT platforms, and enterprise AI integration. nLPD and GDPR compliant. Serving Geneva, Lausanne, and Switzerland.",
    url: "https://houle.ai",
    logo: "https://houle.ai/assets/logo.svg",
    image: "https://houle.ai/assets/og/og-en.webp",
    email: "contact@houle.ai",
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
      name: "AI Consulting & Microsoft 365 Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "AI Consulting Geneva",
            description: "Custom AI solutions and Azure AI integration for Swiss businesses",
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
      name: "West-Bay SA",
      address: {
        "@type": "PostalAddress",
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

              <ClientOnlyProviders
                nonce={nonce}
                locale={currentLocale}
                gaId={gaId}
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
