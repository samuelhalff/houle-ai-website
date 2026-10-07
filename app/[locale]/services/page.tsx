import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { type Locale } from "@/src/lib/i18n";
import { getCspNonce } from "@/src/lib/csp";
import { generateMetadataForPage } from "@/src/lib/metadata";
import StructuredData from "@/src/components/seo/StructuredData";
import { buildBreadcrumbList } from "@/src/lib/structuredData";
import PageHero from "@/src/components/site/page-hero";
import Reveal from "@/src/components/motion/reveal";

export const revalidate = false;

export async function generateMetadata(
  props: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await props.params;
  return await generateMetadataForPage(locale as Locale, "/services");
}

export default async function ServicesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const nonce = await getCspNonce();
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
      ? "Un conseil IA indépendant des éditeurs, du choix des cas d'usage au choix du modèle, y compris open source hébergé en Suisse. Et une expertise Microsoft 365 pour les équipes qui y travaillent déjà."
    : locale === "de"
      ? "Herstellerneutrale KI-Beratung, von der Auswahl der Anwendungsfälle bis zur Modellwahl, auch Open Source mit Hosting in der Schweiz. Dazu Microsoft-365-Expertise für Teams, die bereits damit arbeiten."
    : locale === "es"
      ? "Consultoría de IA independiente de los proveedores, de la elección de los casos de uso a la del modelo, incluido el código abierto alojado en Suiza. Y experiencia en Microsoft 365 para los equipos que ya trabajan con él."
    : locale === "pt"
      ? "Consultoria de IA independente dos fornecedores, da escolha dos casos de uso à do modelo, incluindo código aberto hospedado na Suíça. E experiência em Microsoft 365 para as equipes que já trabalham com ele."
    : "Vendor-neutral AI consulting, from choosing the use cases to choosing the model, including open source hosted in Switzerland. Plus Microsoft 365 expertise for teams that already work in it.";

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
          ? "Atelier de découverte, choix des cas d'usage et du modèle (propriétaire ou open source hébergé en Suisse), pilote mesuré, mise en production et gouvernance."
        : locale === "de"
          ? "Discovery-Workshop, Auswahl der Anwendungsfälle und des Modells (proprietär oder Open Source mit Hosting in der Schweiz), gemessener Pilot, Produktion und Governance."
        : locale === "es"
          ? "Taller de descubrimiento, elección de los casos de uso y del modelo (propietario o de código abierto alojado en Suiza), piloto medido, producción y gobernanza."
        : locale === "pt"
          ? "Workshop de descoberta, escolha dos casos de uso e do modelo (proprietário ou de código aberto hospedado na Suíça), piloto medido, produção e governança."
        : "Discovery workshop, choice of use cases and model (proprietary or open source hosted in Switzerland), measured pilot, production and governance.",
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
