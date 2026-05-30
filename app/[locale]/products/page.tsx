import React from "react";
import { headers } from "next/headers";
import { Metadata } from "next";
import Link from "next/link";
import { getTranslations, type Locale } from "@/src/lib/i18n";
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
  return await generateMetadataForPage(locale as Locale, "/products");
}

export default async function ProductsPage({ params }: { params: { locale: string } }) {
  const nonce = headers().get("x-nonce") || undefined;
  const locale = params.locale as Locale;

  const baseUrl = "https://houle.ai";
  const localePrefix = `/${locale}`;

  const pageTitle =
    locale === "fr" ? "Nos produits"
    : locale === "de" ? "Unsere Produkte"
    : locale === "es" ? "Nuestros productos"
    : locale === "pt" ? "Nossos produtos"
    : "Our products";

  const pageEyebrow =
    locale === "fr" ? "Produits"
    : locale === "de" ? "Produkte"
    : locale === "es" ? "Productos"
    : locale === "pt" ? "Produtos"
    : "Products";

  const pageIntro =
    locale === "fr"
      ? "Découvrez nos solutions IA prêtes à l'emploi pour Microsoft 365, conçues pour améliorer votre productivité tout en garantissant la souveraineté de vos données."
    : locale === "de"
      ? "Entdecken Sie unsere einsatzbereiten KI-Lösungen für Microsoft 365, die Ihre Produktivität steigern und gleichzeitig die Souveränität Ihrer Daten gewährleisten."
    : locale === "es"
      ? "Descubra nuestras soluciones de IA listas para usar para Microsoft 365, diseñadas para mejorar su productividad mientras garantizan la soberanía de sus datos."
    : locale === "pt"
      ? "Descubra nossas soluções de IA prontas para uso para Microsoft 365, projetadas para melhorar sua produtividade enquanto garantem a soberania de seus dados."
    : "Discover our ready-to-use AI solutions for Microsoft 365, designed to enhance your productivity while ensuring your data sovereignty.";

  const learnMore =
    locale === "fr" ? "En savoir plus"
    : locale === "de" ? "Mehr erfahren"
    : locale === "es" ? "Saber más"
    : locale === "pt" ? "Saiba mais"
    : "Learn more";

  const products = [
    {
      href: `${localePrefix}/products/word-addin/`,
      eyebrow: "Word",
      title:
        locale === "fr" ? "Add-in Word"
        : locale === "de" ? "Word Add-in"
        : locale === "es" ? "Complemento de Word"
        : locale === "pt" ? "Suplemento do Word"
        : "Word Add-in",
      description:
        locale === "fr"
          ? "Assistant IA pour Word qui améliore votre rédaction, génère du contenu et automatise vos tâches de traitement de texte."
        : locale === "de"
          ? "KI-Assistent für Word, der Ihr Schreiben verbessert, Inhalte generiert und Textverarbeitungsaufgaben automatisiert."
        : locale === "es"
          ? "Asistente de IA para Word que mejora su escritura, genera contenido y automatiza sus tareas de procesamiento de textos."
        : locale === "pt"
          ? "Assistente de IA para Word que melhora sua escrita, gera conteúdo e automatiza suas tarefas de processamento de texto."
        : "Intelligent AI assistant for Word that enhances your writing, generates content, and automates your word processing tasks.",
    },
    {
      href: `${localePrefix}/products/outlook-addin/`,
      eyebrow: "Outlook",
      title:
        locale === "fr" ? "Add-in Outlook"
        : locale === "de" ? "Outlook Add-in"
        : locale === "es" ? "Complemento de Outlook"
        : locale === "pt" ? "Suplemento do Outlook"
        : "Outlook Add-in",
      description:
        locale === "fr"
          ? "Boostez votre productivité email : réponses automatiques, résumés de messages et gestion intelligente de votre boîte de réception."
        : locale === "de"
          ? "Steigern Sie Ihre E-Mail-Produktivität: automatische Antworten, Nachrichtenzusammenfassungen und intelligente Verwaltung Ihres Posteingangs."
        : locale === "es"
          ? "Aumente su productividad de correo: respuestas automáticas, resúmenes de mensajes y gestión inteligente de su bandeja de entrada."
        : locale === "pt"
          ? "Aumente sua produtividade de e-mail: respostas automáticas, resumos de mensagens e gerenciamento inteligente da sua caixa de entrada."
        : "Boost your email productivity with AI: automatic replies, message summaries, and intelligent inbox management.",
    },
    {
      href: `${localePrefix}/products/swiss-gpt/`,
      eyebrow: "GPT",
      title: "Swiss GPT",
      description:
        locale === "fr"
          ? "Plateforme GPT d'entreprise hébergée en Suisse avec souveraineté complète des données. Accédez aux derniers modèles IA en toute conformité."
        : locale === "de"
          ? "In der Schweiz gehostete Unternehmens-GPT-Plattform mit vollständiger Datensouveränität. Zugriff auf die neuesten KI-Modelle in voller Compliance."
        : locale === "es"
          ? "Plataforma GPT empresarial alojada en Suiza con soberanía completa de datos. Acceda a los últimos modelos de IA en total conformidad."
        : locale === "pt"
          ? "Plataforma GPT empresarial hospedada na Suíça com soberania completa de dados. Acesse os modelos de IA mais recentes em total conformidade."
        : "Enterprise GPT platform hosted in Switzerland with complete data sovereignty. Access the latest AI models in full compliance.",
    },
  ];

  const breadcrumbJsonLd = buildBreadcrumbList([
    { name: pageTitle, item: `${baseUrl}${localePrefix}/products/` },
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
          <div className="grid gap-5 pb-20 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, i) => (
              <Link
                key={product.href}
                href={product.href}
                prefetch={false}
                className="group flex flex-col rounded-2xl border bg-card p-8 shadow-sm transition-all duration-300 hover:border-brand/30 hover:shadow-md"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-hover dark:text-brand">
                  {product.eyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {product.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                  {product.description}
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
