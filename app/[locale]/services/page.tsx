import React from "react";
import { headers } from "next/headers";
import { Metadata } from "next";
import Link from "next/link";
import { getTranslations, type Locale } from "@/src/lib/i18n";
import { generateMetadataForPage } from "@/src/lib/metadata";
import StructuredData from "@/src/components/seo/StructuredData";
import { buildBreadcrumbList } from "@/src/lib/structuredData";

export const revalidate = false;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return await generateMetadataForPage(locale as Locale, "/services");
}

export default async function ServicesPage({
  params,
}: {
  params: { locale: string };
}) {
  const nonce = headers().get("x-nonce") || undefined;
  const locale = params.locale as Locale;
  const tNav = await getTranslations(locale, "navbar");

  const baseUrl = "https://houle.ai";
  const localePrefix = `/${locale}`;

  const services = [
    {
      href: `${localePrefix}/services/ai-consulting/`,
      title:
        locale === "fr"
          ? "Conseil en IA"
          : locale === "de"
          ? "KI-Beratung"
          : locale === "es"
          ? "Consultoría en IA"
          : locale === "pt"
          ? "Consultoria em IA"
          : "AI consulting",
      description:
        locale === "fr"
          ? "Solutions d'intelligence artificielle sur mesure pour automatiser vos processus et améliorer vos décisions."
          : locale === "de"
          ? "Maßgeschneiderte KI-Lösungen zur Automatisierung Ihrer Prozesse und Verbesserung Ihrer Entscheidungen."
          : locale === "es"
          ? "Soluciones de inteligencia artificial a medida para automatizar sus procesos y mejorar sus decisiones."
          : locale === "pt"
          ? "Soluções de inteligência artificial personalizadas para automatizar seus processos e melhorar suas decisões."
          : "Custom artificial intelligence solutions to automate your processes and improve your decisions.",
    },
    {
      href: `${localePrefix}/services/microsoft-consulting/`,
      title:
        locale === "fr"
          ? "Conseil Microsoft"
          : locale === "de"
          ? "Microsoft-Beratung"
          : locale === "es"
          ? "Consultoría Microsoft"
          : locale === "pt"
          ? "Consultoria Microsoft"
          : "Microsoft consulting",
      description:
        locale === "fr"
          ? "Exploitez pleinement Power Automate, SharePoint, Power BI et SPFx pour optimiser votre productivité."
          : locale === "de"
          ? "Nutzen Sie Power Automate, SharePoint, Power BI und SPFx voll aus, um Ihre Produktivität zu optimieren."
          : locale === "es"
          ? "Aproveche plenamente Power Automate, SharePoint, Power BI y SPFx para optimizar su productividad."
          : locale === "pt"
          ? "Explore plenamente Power Automate, SharePoint, Power BI e SPFx para otimizar sua produtividade."
          : "Fully leverage Power Automate, SharePoint, Power BI and SPFx to optimize your productivity.",
    },
  ];

  const breadcrumbJsonLd = buildBreadcrumbList([
    {
      name:
        locale === "fr"
          ? "Services"
          : locale === "de"
          ? "Dienstleistungen"
          : locale === "es"
          ? "Servicios"
          : locale === "pt"
          ? "Serviços"
          : "Services",
      item: `${baseUrl}${localePrefix}/services/`,
    },
  ]);

  const pageTitle =
    locale === "fr"
      ? "Nos services"
      : locale === "de"
      ? "Unsere Dienstleistungen"
      : locale === "es"
      ? "Nuestros servicios"
      : locale === "pt"
      ? "Nossos serviços"
      : "Our services";

  const pageIntro =
    locale === "fr"
      ? "Nous proposons des services de conseil spécialisés en intelligence artificielle et technologies Microsoft pour accompagner votre transformation digitale."
      : locale === "de"
      ? "Wir bieten spezialisierte Beratungsdienstleistungen in künstlicher Intelligenz und Microsoft-Technologien, um Ihre digitale Transformation zu begleiten."
      : locale === "es"
      ? "Ofrecemos servicios de consultoría especializados en inteligencia artificial y tecnologías Microsoft para acompañar su transformación digital."
      : locale === "pt"
      ? "Oferecemos serviços de consultoria especializados em inteligência artificial e tecnologias Microsoft para acompanhar sua transformação digital."
      : "We offer specialized consulting services in artificial intelligence and Microsoft technologies to support your digital transformation.";

  return (
    <div className="min-h-screen">
      <StructuredData nonce={nonce} data={[breadcrumbJsonLd]} />

      <nav
        aria-label="Breadcrumb"
        className="w-full max-w-[1200px] mx-auto mt-20 mb-6 px-6"
      >
        <ol className="flex items-center gap-1 text-sm text-muted-foreground">
          <li>
            <Link href={`${localePrefix}/`} className="hover:underline">
              {(tNav("Home") as string) || "Home"}
            </Link>
          </li>
          <li className="flex items-center gap-1">
            <span className="text-muted-foreground/60">/</span>
            <span aria-current="page" className="font-medium text-foreground">
              {pageTitle}
            </span>
          </li>
        </ol>
      </nav>

      <main className="max-w-[1200px] mx-auto px-6 pb-20">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{pageTitle}</h1>
          <p className="text-lg text-muted-foreground max-w-[700px]">
            {pageIntro}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="group block p-8 rounded-lg border border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-200"
            >
              <h2 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
                {service.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
              <div className="mt-4 inline-flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                <span>
                  {locale === "fr"
                    ? "En savoir plus"
                    : locale === "de"
                    ? "Mehr erfahren"
                    : locale === "es"
                    ? "Saber más"
                    : locale === "pt"
                    ? "Saiba mais"
                    : "Learn more"}
                </span>
                <svg
                  className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
