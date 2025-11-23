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
  return await generateMetadataForPage(locale as Locale, "/products");
}

export default async function ProductsPage({
  params,
}: {
  params: { locale: string };
}) {
  const nonce = headers().get("x-nonce") || undefined;
  const locale = params.locale as Locale;
  const tNav = await getTranslations(locale, "navbar");

  const baseUrl = "https://houle.ai";
  const localePrefix = `/${locale}`;

  const products = [
    {
      href: `${localePrefix}/products/word-addin`,
      title:
        locale === "fr"
          ? "Add-in Word"
          : locale === "de"
          ? "Word Add-in"
          : locale === "es"
          ? "Complemento de Word"
          : locale === "pt"
          ? "Suplemento do Word"
          : "Word Add-in",
      description:
        locale === "fr"
          ? "Assistant IA intelligent pour Word qui améliore votre rédaction, génère du contenu et automatise vos tâches de traitement de texte."
          : locale === "de"
          ? "Intelligenter KI-Assistent für Word, der Ihr Schreiben verbessert, Inhalte generiert und Ihre Textverarbeitungsaufgaben automatisiert."
          : locale === "es"
          ? "Asistente de IA inteligente para Word que mejora su escritura, genera contenido y automatiza sus tareas de procesamiento de textos."
          : locale === "pt"
          ? "Assistente de IA inteligente para Word que melhora sua escrita, gera conteúdo e automatiza suas tarefas de processamento de texto."
          : "Intelligent AI assistant for Word that enhances your writing, generates content, and automates your word processing tasks.",
    },
    {
      href: `${localePrefix}/products/outlook-addin`,
      title:
        locale === "fr"
          ? "Add-in Outlook"
          : locale === "de"
          ? "Outlook Add-in"
          : locale === "es"
          ? "Complemento de Outlook"
          : locale === "pt"
          ? "Suplemento do Outlook"
          : "Outlook Add-in",
      description:
        locale === "fr"
          ? "Boostez votre productivité email avec l'IA : réponses automatiques, résumés de messages et gestion intelligente de votre boîte de réception."
          : locale === "de"
          ? "Steigern Sie Ihre E-Mail-Produktivität mit KI: automatische Antworten, Nachrichtenzusammenfassungen und intelligente Verwaltung Ihres Posteingangs."
          : locale === "es"
          ? "Aumente su productividad de correo electrónico con IA: respuestas automáticas, resúmenes de mensajes y gestión inteligente de su bandeja de entrada."
          : locale === "pt"
          ? "Aumente sua produtividade de e-mail com IA: respostas automáticas, resumos de mensagens e gerenciamento inteligente de sua caixa de entrada."
          : "Boost your email productivity with AI: automatic replies, message summaries, and intelligent inbox management.",
    },
    {
      href: `${localePrefix}/products/swiss-gpt`,
      title:
        locale === "fr"
          ? "Swiss GPT"
          : locale === "de"
          ? "Swiss GPT"
          : locale === "es"
          ? "Swiss GPT"
          : locale === "pt"
          ? "Swiss GPT"
          : "Swiss GPT",
      description:
        locale === "fr"
          ? "Plateforme GPT d'entreprise hébergée en Suisse avec souveraineté complète des données. Accédez aux derniers modèles IA (GPT-4.1, GPT-5, o3) en toute conformité."
          : locale === "de"
          ? "In der Schweiz gehostete Unternehmens-GPT-Plattform mit vollständiger Datensouveränität. Zugriff auf die neuesten KI-Modelle (GPT-4.1, GPT-5, o3) in voller Compliance."
          : locale === "es"
          ? "Plataforma GPT empresarial alojada en Suiza con soberanía completa de datos. Acceda a los últimos modelos de IA (GPT-4.1, GPT-5, o3) en total conformidad."
          : locale === "pt"
          ? "Plataforma GPT empresarial hospedada na Suíça com soberania completa de dados. Acesse os modelos de IA mais recentes (GPT-4.1, GPT-5, o3) em total conformidade."
          : "Enterprise GPT platform hosted in Switzerland with complete data sovereignty. Access the latest AI models (GPT-4.1, GPT-5, o3) in full compliance.",
    },
  ];

  const breadcrumbJsonLd = buildBreadcrumbList([
    {
      name:
        locale === "fr"
          ? "Produits"
          : locale === "de"
          ? "Produkte"
          : locale === "es"
          ? "Productos"
          : locale === "pt"
          ? "Produtos"
          : "Products",
      item: `${baseUrl}${localePrefix}/products/`,
    },
  ]);

  const pageTitle =
    locale === "fr"
      ? "Nos produits"
      : locale === "de"
      ? "Unsere Produkte"
      : locale === "es"
      ? "Nuestros productos"
      : locale === "pt"
      ? "Nossos produtos"
      : "Our products";

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Link
              key={product.href}
              href={product.href}
              className="group block p-8 rounded-lg border border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-200"
            >
              <h2 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
                {product.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
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
