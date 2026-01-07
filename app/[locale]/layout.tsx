import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import nextDynamic from "next/dynamic";

import { locales, type Locale } from "@/src/lib/i18n-locales";
const isLocale = (value: string): value is Locale =>
  locales.includes(value as Locale);

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(locale)) {
    notFound();
  }

  const activeLocale: Locale = locale;
  const Navbar = nextDynamic(
    () => import("@/src/components/navigation/NavbarClient"),
    { ssr: true }
  );
  const Footer = nextDynamic(() => import("@/app/[locale]/shared/footer"), {
    suspense: true,
  });

  const navData =
    activeLocale === "fr"
      ? {
          labels: {
            home: "Accueil",
            products: "Produits",
            services: "Services",
            ressources: "Ressources",
            contact: "Contact",
            mobileNavigation: "Menu",
          },
          products: [
            {
              href: "/products/word-addin",
              title: "Add-in Word",
              description: "Assistant IA pour Microsoft Word",
            },
            {
              href: "/products/outlook-addin",
              title: "Add-in Outlook",
              description: "Assistant IA pour Outlook",
            },
            {
              href: "/products/swiss-gpt",
              title: "GPT Suisse",
              description: "Plateforme GPT hébergée en Suisse",
            },
          ],
          services: [
            {
              href: "/services/ai-consulting",
              title: "Conseil en IA",
              description:
                "Solutions d'intelligence artificielle sur mesure avec Azure AI",
            },
            {
              href: "/services/microsoft-consulting",
              title: "Conseil Microsoft",
              description:
                "Azure, Power Automate, SharePoint, Power BI et SPFx",
            },
          ],
          hideProducts: false,
        }
      : {
          labels: {
            home: "Home",
            products: "Products",
            services: "Services",
            ressources: "Resources",
            contact: "Contact",
            mobileNavigation: "Menu",
          },
          products: [
            {
              href: "/products/word-addin",
              title: "Word Add-in",
              description: "AI assistant for Microsoft Word",
            },
            {
              href: "/products/outlook-addin",
              title: "Outlook Add-in",
              description: "AI assistant for Microsoft Outlook",
            },
            {
              href: "/products/swiss-gpt",
              title: "Swiss GPT",
              description: "Swiss-hosted GPT platform",
            },
          ],
          services: [
            {
              href: "/services/ai-consulting",
              title: "AI consulting",
              description:
                "Custom artificial intelligence solutions with Azure AI",
            },
            {
              href: "/services/microsoft-consulting",
              title: "Microsoft consulting",
              description:
                "Azure, Power Automate, SharePoint, Power BI and SPFx",
            },
          ],
          hideProducts: false,
        };

  return (
    <div data-locale={activeLocale} lang={activeLocale}>
      <Navbar locale={activeLocale} navData={navData} />
      <main id="main-content" role="main">
        {children}
      </main>
      <Suspense fallback={<div className="h-64 bg-muted" aria-hidden="true" />}>
        <Footer locale={activeLocale} />
      </Suspense>
    </div>
  );
}
