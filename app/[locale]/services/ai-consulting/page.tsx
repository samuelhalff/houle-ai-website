import { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { getTranslations, type Locale } from "@/src/lib/i18n";
import { generateMetadataForPage } from "@/src/lib/metadata";
import StructuredData from "@/src/components/seo/StructuredData";
import {
  buildBreadcrumbList,
  buildServiceSchema,
  buildOrganizationSchema,
  buildProfessionalServiceSchema,
} from "@/src/lib/structuredData";
import { localizePath } from "@/src/lib/paths";
import ResponsiveImage from "@/src/components/media/ResponsiveImage";
import PageHero from "@/src/components/site/page-hero";
import SectionHeading from "@/src/components/site/section-heading";
import Reveal from "@/src/components/motion/reveal";
import { Button } from "@/src/components/ui/button";

export const runtime = "nodejs";
export const revalidate = false;

export async function generateMetadata(
  props: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await props.params;
  return await generateMetadataForPage(locale as Locale, "/services/ai-consulting");
}

const AIConsultingPage = async (props: { params: Promise<{ locale: string }> }) => {
  const params = await props.params;
  const nonce = (await headers()).get("x-nonce") || undefined;
  const baseUrl = "https://houle.ai";
  const localePrefix = `/${params.locale}`;
  const tService = await getTranslations(params.locale as Locale, "ai-consulting");

  const servicesLabel =
    params.locale === "fr" ? "Services"
    : params.locale === "de" ? "Dienstleistungen"
    : params.locale === "es" ? "Servicios"
    : params.locale === "pt" ? "Serviços"
    : "Services";

  const ctaTitle =
    params.locale === "fr" ? "Discutons de votre projet"
    : params.locale === "de" ? "Lassen Sie uns über Ihr Projekt sprechen"
    : params.locale === "es" ? "Hablemos de su proyecto"
    : params.locale === "pt" ? "Vamos falar sobre seu projeto"
    : "Let's discuss your project";

  const ctaBody =
    params.locale === "fr" ? "Contactez-nous pour découvrir comment l'IA peut transformer votre entreprise."
    : params.locale === "de" ? "Kontaktieren Sie uns, um zu erfahren, wie KI Ihr Unternehmen transformieren kann."
    : params.locale === "es" ? "Contáctenos para descubrir cómo la IA puede transformar su empresa."
    : params.locale === "pt" ? "Entre em contato para descobrir como a IA pode transformar sua empresa."
    : "Contact us to discover how AI can transform your business.";

  const ctaBtn =
    params.locale === "fr" ? "Discuter de votre projet IA"
    : params.locale === "de" ? "Ihr KI-Projekt besprechen"
    : params.locale === "es" ? "Hablar de su proyecto de IA"
    : params.locale === "pt" ? "Discutir seu projeto de IA"
    : "Discuss Your AI Project";

  const readArticle =
    params.locale === "fr" ? "Lire l'article"
    : params.locale === "de" ? "Artikel lesen"
    : params.locale === "es" ? "Leer el artículo"
    : params.locale === "pt" ? "Ler o artigo"
    : "Read article";

  const breadcrumbJsonLd = buildBreadcrumbList([
    { name: servicesLabel, item: `${baseUrl}${localePrefix}/services/` },
    {
      name: (tService("Hero.Title") as string) || "AI consulting",
      item: `${baseUrl}/${params.locale}${localizePath("/services/ai-consulting/", params.locale as Locale)}/`,
    },
  ]);

  const serviceJsonLd = buildServiceSchema({
    name: (tService("Hero.Title") as string) || "AI consulting",
    description: (tService("Hero.Description") as string) || "Transform your business with AI solutions.",
    serviceType: "Consulting",
    url: `${baseUrl}/${params.locale}${localizePath("/services/ai-consulting/", params.locale as Locale)}/`,
    areaServed: ["Geneva", "Lausanne", "Zürich", "Switzerland"],
    provider: { name: "houle.ai", url: baseUrl, logo: `${baseUrl}/assets/logo.svg` },
  });

  return (
    <div>
      <StructuredData
        nonce={nonce}
        data={[breadcrumbJsonLd, serviceJsonLd, buildOrganizationSchema(),
          buildProfessionalServiceSchema(
            `${baseUrl}/${params.locale}${localizePath("/services/ai-consulting/", params.locale as Locale)}/`,
            (tService("Hero.Title") as string) || "AI consulting",
            (tService("Hero.Description") as string) || "Transform your business with AI solutions."
          ),
        ]}
      />

      {/* Hero */}
      <div className="abstract-background">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <PageHero
            eyebrow={servicesLabel}
            title={(tService("Hero.Title") as string) || "AI consulting"}
            description={(tService("Hero.Description") as string) || ""}
          >
            <div className="relative aspect-[16/7] max-w-4xl overflow-hidden rounded-2xl shadow-xl">
              <ResponsiveImage
                mobileSrc="/assets/hero/services/ai-consulting-hero-mobile.avif"
                desktopSrc="/assets/hero/services/ai-consulting-hero.avif"
                alt={(tService("Hero.Title") as string) || "AI consulting"}
                width={1600}
                height={700}
                priority
                className="object-cover w-full h-full"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          </PageHero>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1200px] px-5 pb-20 sm:px-8">

        {/* Introduction */}
        <Reveal>
          <section className="mb-16 max-w-4xl">
            <p className="text-lg leading-8 text-foreground/80">
              {tService("Presentation.Intro") as string}
            </p>
          </section>
        </Reveal>

        {/* Why + Services two-column */}
        <Reveal>
          <section className="mb-16 grid gap-x-14 gap-y-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-1">
                {tService("Presentation.Why.Title") as string}
              </h2>
              <p className="mt-3 text-sm leading-7 text-foreground/75">
                {tService("Presentation.Why.Text") as string}
              </p>
            </div>
            <div className="space-y-6">
              {["Automation", "Analytics", "Chatbots", "Custom"].map((key) => (
                <div key={key} className="border-l-2 border-brand/30 pl-5">
                  <h3 className="font-semibold text-foreground">
                    {tService(`Presentation.Services.${key}.Title`) as string}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {tService(`Presentation.Services.${key}.Text`) as string}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Approach */}
        <Reveal>
          <section className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">
              {tService("Presentation.Approach.Title") as string}
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-foreground/75">
              {tService("Presentation.Approach.Text") as string}
            </p>
          </section>
        </Reveal>

        {/* Technologies */}
        <Reveal>
          <section className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">
              {tService("Presentation.Technologies.Title") as string}
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-foreground/75">
              {tService("Presentation.Technologies.Text") as string}
            </p>
          </section>
        </Reveal>

        {/* Benefits */}
        {(() => {
          const items = tService("Presentation.Benefits.Items");
          if (!Array.isArray(items) || items.length === 0) return null;
          return (
            <Reveal>
              <section className="mb-16">
                <h2 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">
                  {tService("Presentation.Benefits.Title") as string}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-sm"
                    >
                      <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft">
                        <svg className="h-3.5 w-3.5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <div>
                        <h4 className="font-semibold text-foreground">{item.Title}</h4>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.Desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          );
        })()}

        {/* Azure AI */}
        {tService("Presentation.AzureAI.Title") ? (
          <Reveal>
            <section className="mb-16">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                {tService("Presentation.AzureAI.Title") as string}
              </h2>
              <p className="mb-8 max-w-3xl text-sm leading-7 text-foreground/75">
                {tService("Presentation.AzureAI.Intro") as string}
              </p>
              <div className="space-y-6">
                {["Models", "Indexing", "Agents", "Grounding"].map((key) => (
                  <div key={key} className="border-l-2 border-brand/30 pl-5">
                    <h3 className="font-semibold text-foreground">
                      {tService(`Presentation.AzureAI.${key}.Title`) as string}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {tService(`Presentation.AzureAI.${key}.Text`) as string}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        ) : null}

        {/* Use Cases */}
        {tService("Presentation.UseCases.Title") ? (
          <Reveal>
            <section className="mb-16">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                {tService("Presentation.UseCases.Title") as string}
              </h2>
              <p className="mb-8 max-w-3xl text-sm leading-7 text-foreground/75">
                {tService("Presentation.UseCases.Intro") as string}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {(() => {
                  const cases = tService("Presentation.UseCases.Cases");
                  if (!Array.isArray(cases)) return null;
                  return cases.map((item: any, index: number) => (
                    <Link
                      key={index}
                      href={`${localePrefix}/ressources/articles/${item.Slug}`}
                      className="group flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:border-brand/30 hover:shadow-md"
                    >
                      <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors">
                        {item.Title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{item.Summary}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                        {readArticle}
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </Link>
                  ));
                })()}
              </div>
            </section>
          </Reveal>
        ) : null}

        {/* CTA */}
        <Reveal>
          <div className="rounded-2xl border border-brand/15 bg-brand-soft px-8 py-10 text-center sm:px-12">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">{ctaTitle}</h2>
            <p className="mx-auto mt-3 max-w-[48ch] text-sm leading-7 text-foreground/70">{ctaBody}</p>
            <div className="mt-8 flex justify-center">
              <Link href={`${localePrefix}/contact/`} prefetch={false}>
                <Button size="lg" className="btn-main-cta rounded-full bg-foreground px-8 text-base text-background">
                  <span>{ctaBtn}</span>
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default AIConsultingPage;
