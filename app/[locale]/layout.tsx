import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import NavbarClient from "@/src/components/navigation/NavbarClient";
import Footer from "@/app/[locale]/shared/footer";
import WhatsAppButton from "@/src/components/WhatsAppButton";
import { locales, isLocale, type Locale } from "@/src/lib/i18n-locales";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: paramsPromise,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await paramsPromise;
  if (!isLocale(locale)) {
    notFound();
  }

  const activeLocale: Locale = locale;

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
              href: "/products/word-addin/",
              title: "Add-in Word",
              description: "Assistant IA pour Microsoft Word",
            },
            {
              href: "/products/outlook-addin/",
              title: "Add-in Outlook",
              description: "Assistant IA pour Outlook",
            },
            {
              href: "/products/swiss-gpt/",
              title: "GPT Suisse",
              description: "Plateforme GPT hébergée en Suisse",
            },
          ],
          services: [
            {
              href: "/services/ai-consulting/",
              title: "Conseil en IA",
              description:
                "Solutions d'intelligence artificielle sur mesure avec Azure AI",
            },
            {
              href: "/services/microsoft-consulting/",
              title: "Conseil Microsoft",
              description:
                "Azure, Power Automate, SharePoint, Power BI et SPFx",
            },
          ],
          hideProducts: false,
        }
      : activeLocale === "de"
        ? {
            labels: {
              home: "Startseite",
              products: "Produkte",
              services: "Dienstleistungen",
              ressources: "Ressourcen",
              contact: "Kontakt",
              mobileNavigation: "Menü",
            },
            products: [
              {
                href: "/products/word-addin/",
                title: "KI-Add-in für Word",
                description: "KI-Assistent für Microsoft Word",
              },
              {
                href: "/products/outlook-addin/",
                title: "KI-Add-in für Outlook",
                description: "KI-Assistent für Outlook",
              },
              {
                href: "/products/swiss-gpt/",
                title: "Swiss GPT",
                description: "Schweizer GPT-Plattform",
              },
            ],
            services: [
              {
                href: "/services/ai-consulting/",
                title: "KI-Beratung",
                description:
                  "Maßgeschneiderte KI-Lösungen mit Azure AI",
              },
              {
                href: "/services/microsoft-consulting/",
                title: "Microsoft-Beratung",
                description:
                  "Azure, Power Automate, SharePoint, Power BI und SPFx",
              },
            ],
            hideProducts: false,
          }
        : activeLocale === "es"
          ? {
              labels: {
                home: "Inicio",
                products: "Productos",
                services: "Servicios",
                ressources: "Recursos",
                contact: "Contacto",
                mobileNavigation: "Menú",
              },
              products: [
                {
                  href: "/products/word-addin/",
                  title: "Add-in para Word",
                  description: "Asistente IA para Microsoft Word",
                },
                {
                  href: "/products/outlook-addin/",
                  title: "Add-in para Outlook",
                  description: "Asistente IA para Outlook",
                },
                {
                  href: "/products/swiss-gpt/",
                  title: "Swiss GPT",
                  description: "Plataforma GPT alojada en Suiza",
                },
              ],
              services: [
                {
                  href: "/services/ai-consulting/",
                  title: "Consultoría IA",
                  description:
                    "Soluciones de inteligencia artificial con Azure AI",
                },
                {
                  href: "/services/microsoft-consulting/",
                  title: "Consultoría Microsoft",
                  description:
                    "Azure, Power Automate, SharePoint, Power BI y SPFx",
                },
              ],
              hideProducts: false,
            }
          : activeLocale === "pt"
            ? {
                labels: {
                  home: "Início",
                  products: "Produtos",
                  services: "Serviços",
                  ressources: "Recursos",
                  contact: "Contato",
                  mobileNavigation: "Menu",
                },
                products: [
                  {
                    href: "/products/word-addin/",
                    title: "Add-in para Word",
                    description: "Assistente IA para Microsoft Word",
                  },
                  {
                    href: "/products/outlook-addin/",
                    title: "Add-in para Outlook",
                    description: "Assistente IA para Outlook",
                  },
                  {
                    href: "/products/swiss-gpt/",
                    title: "Swiss GPT",
                    description: "Plataforma GPT hospedada na Suíça",
                  },
                ],
                services: [
                  {
                    href: "/services/ai-consulting/",
                    title: "Consultoria IA",
                    description:
                      "Soluções de inteligência artificial com Azure AI",
                  },
                  {
                    href: "/services/microsoft-consulting/",
                    title: "Consultoria Microsoft",
                    description:
                      "Azure, Power Automate, SharePoint, Power BI e SPFx",
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
                    href: "/products/word-addin/",
                    title: "Word Add-in",
                    description: "AI assistant for Microsoft Word",
                  },
                  {
                    href: "/products/outlook-addin/",
                    title: "Outlook Add-in",
                    description: "AI assistant for Microsoft Outlook",
                  },
                  {
                    href: "/products/swiss-gpt/",
                    title: "Swiss GPT",
                    description: "Swiss-hosted GPT platform",
                  },
                ],
                services: [
                  {
                    href: "/services/ai-consulting/",
                    title: "AI consulting",
                    description:
                      "Custom artificial intelligence solutions with Azure AI",
                  },
                  {
                    href: "/services/microsoft-consulting/",
                    title: "Microsoft consulting",
                    description:
                      "Azure, Power Automate, SharePoint, Power BI and SPFx",
                  },
                ],
                hideProducts: false,
              };

  return (
    <div data-locale={activeLocale} lang={activeLocale}>
      <NavbarClient locale={activeLocale} navData={navData} />
      <main id="main-content" role="main">
        {children}
      </main>
      <WhatsAppButton locale={activeLocale} />
      <Suspense fallback={<div className="h-64 bg-muted" aria-hidden="true" />}>
        <Footer locale={activeLocale} />
      </Suspense>
    </div>
  );
}
