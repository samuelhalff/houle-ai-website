import React from "react";
import { headers } from "next/headers";
import { Metadata } from "next";
import Link from "next/link";
import { type Locale } from "@/src/lib/i18n";
import { generateMetadataForPage } from "@/src/lib/metadata";
import StructuredData from "@/src/components/seo/StructuredData";
import { buildBreadcrumbList } from "@/src/lib/structuredData";
import PageHero from "@/src/components/site/page-hero";
import Reveal from "@/src/components/motion/reveal";

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
  const baseUrl = "https://houle.ai";
  const localePrefix = `/${locale}`;

  const pageTitle =
    locale === "fr" ? "Nos services"
    : locale === "de" ? "Unsere Dienstleistungen"
    : locale === "es" ? "Nuestros servicios"
    : locale === "pt" ? "Nossos serviços"
    : "Our services";

  const pageEyebrow =
    locale === "fr" ? "Conseil"
    : locale === "de" ? "Beratung"
    : locale === "es" ? "Consultoría"
    : locale === "pt" ? "Consultoria"
    : "Consulting";

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

  const learnMore =
    locale === "fr" ? "En savoir plus"
    : locale === "de" ? "Mehr erfahren"
    : locale === "es" ? "Saber más"
    : locale === "pt" ? "Saiba mais"
    : "Learn more";

  const services = [
    {
      href: `${localePrefix}/services/ai-consulting/`,
      eyebrow: locale === "fr" ? "IA" : locale === "de" ? "KI" : "AI",
      title:
        locale === "fr" ? "Conseil en IA"
        : locale === "de" ? "KI-Beratung"
        : locale === "es" ? "Consultoría en IA"
        : locale === "pt" ? "Consultoria em IA"
        : "AI Consulting",
      description:
        locale === "fr"
          ? "Solutions d'intelligence artificielle sur mesure pour automatiser vos processus et améliorer vos décisions."
        : locale === "de"
          ? "Maßgeschneiderte KI-Lösungen zur Automatisierung Ihrer Prozesse und Verbesserung Ihrer Entscheidungen."
        : locale === "es"
          ? "Soluciones de inteligencia artificial a medida para automatizar sus procesos y mejorar sus decisiones."
        : locale === "pt"
          ? "Soluções de inteligência artificial personalizadas para automatizar seus processos e melhorar suas decisões."
        : "Custom AI solutions to automate your processes, connect your knowledge, and improve decisions across your organization.",
    },
    {
      href: `${localePrefix}/services/microsoft-consulting/`,
      eyebrow: "Microsoft",
      title:
        locale === "fr" ? "Conseil Microsoft"
        : locale === "de" ? "Microsoft-Beratung"
        : locale === "es" ? "Consultoría Microsoft"
        : locale === "pt" ? "Consultoria Microsoft"
        : "Microsoft Consulting",
      description:
        locale === "fr"
          ? "Exploitez pleinement Power Automate, SharePoint, Power BI et SPFx pour optimiser votre productivité."
        : locale === "de"
          ? "Nutzen Sie Power Automate, SharePoint, Power BI und SPFx voll aus, um Ihre Produktivität zu optimieren."
        : locale === "es"
          ? "Aproveche plenamente Power Automate, SharePoint, Power BI y SPFx para optimizar su productividad."
        : locale === "pt"
          ? "Explore plenamente Power Automate, SharePoint, Power BI e SPFx para otimizar sua produtividade."
        : "Deep expertise across the full Microsoft 365 stack — Azure, Power Automate, SharePoint, Power BI, and SPFx.",
    },
  ];

  const breadcrumbJsonLd = buildBreadcrumbList([
    {
      name: pageTitle,
      item: `${baseUrl}${localePrefix}/services/`,
    },
  ]);

  return (
    <div>
      <StructuredData nonce={nonce} data={[breadcrumbJsonLd]} />

      <div className="abstract-background">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <PageHero
            eyebrow={pageEyebrow}
            title={pageTitle}
            description={pageIntro}
          />
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <div className="grid gap-5 pb-20 sm:grid-cols-2">
            {services.map((service, i) => (
              <Link
                key={service.href}
                href={service.href}
                prefetch={false}
                className="group flex flex-col rounded-2xl border bg-card p-8 shadow-sm transition-all duration-300 hover:border-brand/30 hover:shadow-md"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-hover dark:text-brand">
                  {service.eyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {service.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                  {service.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-[gap] duration-200 group-hover:gap-2.5">
                  {learnMore}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

