import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import nextDynamic from "next/dynamic";

import { locales, type Locale } from "@/src/lib/i18n-locales";
const isLocale = (value: string): value is Locale =>
  locales.includes(value as Locale);

export const dynamic = "force-dynamic";

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
  const Navbar = (await import("@/src/components/navigation/NavbarServer"))
    .default;
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
          products: [],
          services: [
            {
              href: "/services/ai-consulting",
              title: "Conseil en IA",
              description: "Solutions d'intelligence artificielle sur mesure",
            },
            {
              href: "/services/microsoft-consulting",
              title: "Conseil Microsoft",
              description: "Power Automate, SharePoint, Power BI et SPFx",
            },
          ],
          hideProducts: true,
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
          products: [],
          services: [
            {
              href: "/services/ai-consulting",
              title: "AI consulting",
              description: "Custom artificial intelligence solutions",
            },
            {
              href: "/services/microsoft-consulting",
              title: "Microsoft consulting",
              description: "Power Automate, SharePoint, Power BI and SPFx",
            },
          ],
          hideProducts: true,
        };

  return (
    <div data-locale={activeLocale} lang={activeLocale}>
      <Navbar locale={activeLocale} navData={navData} />
      <main id="main-content" role="main">
        {children}
      </main>
      <Suspense fallback={null}>
        <Footer locale={activeLocale} />
      </Suspense>
    </div>
  );
}
