// app/layout.tsx
import { Providers } from "@/src/components/providers";
import { Metadata, Viewport } from "next";
import { generateOrganizationStructuredData } from "@/src/lib/metadata";
import { inter } from "./fonts";
import { headers } from "next/headers";
import dynamic from "next/dynamic";
import Defer from "@/src/components/Defer";
import ErrorBoundary from "@/src/components/ErrorBoundary";
import "./globals.css";
const CookieConsent = dynamic(() => import("@/src/components/CookieConsent"), {
  ssr: false,
  loading: () => null,
});
const ConsentAnalytics = dynamic(
  () => import("@/src/components/ConsentAnalytics"),
  { ssr: false, loading: () => null }
);
import { getCurrentLocale } from "@/src/lib/i18n";

export const metadata: Metadata = {
  metadataBase: new URL("https://houle.ai"),
  title: {
    template: "%s - houle",
    default: "houle | Private AI for Microsoft 365",
  },
  description:
    "houle brings private AI into Microsoft 365 with add-ins and GPT hosted in Switzerland.",
  keywords:
    "houle, ai, microsoft 365, outlook add-in, word add-in, private gpt, switzerland",
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
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
  const nonce = headers().get("x-nonce") || undefined;
  const userAgent = headers().get("user-agent") || "";
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const gaId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    process.env.NEXT_PUBLIC_GA_ID ||
    "G-H6EBEK7685";
  const currentLocale = getCurrentLocale();

  const cookieLabels = {
    Title: "Cookies",
    Text: "We use cookies for analytics and a smoother experience.",
    LearnMore: "Learn more",
    Accept: "Accept",
    Decline: "Decline",
    Manage: "Manage cookies",
  } as const;

  const orgJsonLd = generateOrganizationStructuredData();
  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://houle.ai",
    name: "houle",
  } as const;

  return (
    <html
      suppressHydrationWarning
      lang={currentLocale}
      className={inter.variable}
    >
      {/* ✅ add nonce to <head> so Next’s internal scripts use it */}
      <head nonce={nonce}>
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

        <Providers nonce={nonce}>
          <ErrorBoundary>
            <div className="pt-6 text-foreground bg-gradient-to-b from-background via-background to-background/60 min-h-screen">
              {children}

              <CookieConsent
                nonce={nonce}
                locale={currentLocale}
                labels={cookieLabels}
              />

              <Defer rootMargin="0px" idle={200} placeholder={null}>
                <ConsentAnalytics
                  gaId={gaId}
                  gtmId="GTM-P6QT792D"
                  nonce={nonce}
                />
              </Defer>
            </div>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
