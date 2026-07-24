import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslationsRecord, isValidLocale, type Locale } from "@/src/lib/i18n";
import { getCspNonce } from "@/src/lib/csp";
import { getPageMetadata } from "@/src/lib/metadata";
import StructuredData from "@/src/components/seo/StructuredData";
import {
  buildBreadcrumbList,
  buildServiceSchema,
  buildOrganizationSchema,
  buildFAQPage,
} from "@/src/lib/structuredData";
import PageHero from "@/src/components/site/page-hero";
import SectionHeading from "@/src/components/site/section-heading";
import Reveal from "@/src/components/motion/reveal";
import { Button } from "@/src/components/ui/button";
import FAQ from "@/src/components/FAQ";

export const runtime = "nodejs";
export const revalidate = false;

const baseUrl = "https://houle.ai";

type StepItem = { title: string; description: string };
type FaqItem = { q: string; a: string };

type Solution = {
  product: "ai-agents" | "word-addin" | "outlook-addin" | "swiss-gpt";
  hero: { badge: string; title: string; description: string };
  answer: string;
  how: StepItem[];
  features: StepItem[];
  benefits: StepItem[];
  faq: FaqItem[];
  cta: { title: string; description: string };
};

function getSolutions(locale: Locale): Record<string, Solution> {
  return getTranslationsRecord(locale, "solutions") as Record<string, Solution>;
}

function getSolution(locale: Locale, slug: string): Solution | null {
  const solutions = getSolutions(locale);
  const entry = solutions[slug];
  return entry && typeof entry === "object" && entry.hero ? entry : null;
}

// Enumerate all slugs from the FR solutions.json (canonical).
export function generateStaticParams() {
  const solutions = getSolutions("fr");
  return Object.keys(solutions).map((useCase) => ({ useCase }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; useCase: string }>;
}): Promise<Metadata> {
  const { locale, useCase } = await props.params;
  const activeLocale: Locale = isValidLocale(locale) ? locale : "fr";
  const solution =
    getSolution(activeLocale, useCase) ?? getSolution("fr", useCase);
  if (!solution) return {};

  return await getPageMetadata(activeLocale, `/solutions/${useCase}`, {
    articleTitle: solution.hero.title,
    articleDescription: solution.hero.description,
  });
}

const productLabels: Record<Solution["product"], string> = {
  "ai-agents": "AI Agents",
  "word-addin": "Word Add-in",
  "outlook-addin": "Outlook Add-in",
  "swiss-gpt": "Swiss GPT",
};

const productPaths: Record<Solution["product"], string> = {
  "ai-agents": "/products/ai-agents/",
  "word-addin": "/products/word-addin/",
  "outlook-addin": "/products/outlook-addin/",
  "swiss-gpt": "/products/swiss-gpt/",
};

const SolutionPage = async (props: {
  params: Promise<{ locale: string; useCase: string }>;
}) => {
  const { locale, useCase } = await props.params;
  const activeLocale: Locale = isValidLocale(locale) ? locale : "fr";
  const nonce = await getCspNonce();
  const localePrefix = `/${activeLocale}`;

  const solution = getSolution(activeLocale, useCase);
  if (!solution) notFound();

  const labels = uiLabels(activeLocale);
  const solutionsHref = `${localePrefix}/solutions/`;
  const pageHref = `${localePrefix}/solutions/${useCase}/`;
  const productHref = `${localePrefix}${productPaths[solution.product]}`;

  const breadcrumbJsonLd = buildBreadcrumbList([
    { name: labels.solutions, item: `${baseUrl}${solutionsHref}` },
    { name: solution.hero.title, item: `${baseUrl}${pageHref}` },
  ]);

  const serviceJsonLd = buildServiceSchema({
    name: solution.hero.title,
    description: solution.hero.description,
    url: `${baseUrl}${pageHref}`,
    areaServed: ["Switzerland"],
    provider: { name: "houle.ai", url: baseUrl },
  });

  const faqJsonLd = buildFAQPage(
    solution.faq.map((f) => ({ question: f.q, answer: f.a })),
  );

  return (
    <div>
      <StructuredData
        nonce={nonce}
        data={[
          breadcrumbJsonLd,
          serviceJsonLd,
          faqJsonLd,
          buildOrganizationSchema(),
        ]}
      />

      {/* Hero */}
      <div className="abstract-background">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <PageHero
            eyebrow={solution.hero.badge}
            title={solution.hero.title}
            description={solution.hero.description}
          >
            <div className="flex flex-wrap items-center justify-start gap-4">
              <Link href={`${localePrefix}/contact/`} prefetch={false}>
                <Button size="lg" className="btn-main-cta rounded-full bg-foreground px-8 text-base text-background">
                  <span>{labels.cta}</span>
                </Button>
              </Link>
              <Link
                href={productHref}
                prefetch={false}
                className="text-sm font-medium text-brand-hover underline-offset-4 hover:underline dark:text-brand"
              >
                {labels.poweredBy} {productLabels[solution.product]}
              </Link>
            </div>
          </PageHero>
        </div>
      </div>

      {/* Answer-first paragraph */}
      <section className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8">
        <Reveal>
          <p className="max-w-[70ch] text-lg leading-8 text-foreground/80">
            {solution.answer}
          </p>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="bg-surface-tint/40 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <SectionHeading
              eyebrow={labels.how}
              title={labels.howTitle}
              align="center"
              className="mb-12"
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {solution.how.map((step, index) => (
                <div key={index} className="rounded-2xl border bg-background p-6 shadow-sm">
                  <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-hover dark:text-brand">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow={labels.features}
            title={labels.featuresTitle}
            align="center"
            className="mb-12"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {solution.features.map((feature, index) => (
              <div key={index} className="rounded-2xl border bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Benefits */}
      <section className="bg-surface-tint/40 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <SectionHeading
              eyebrow={labels.benefits}
              title={labels.benefitsTitle}
              align="center"
              className="mb-12"
            />
            <div className="grid gap-5 sm:grid-cols-3">
              {solution.benefits.map((benefit, index) => (
                <div key={index} className="border-l-2 border-brand/30 pl-5">
                  <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <FAQ
        title={labels.faqTitle}
        lastUpdated={labels.lastUpdated}
        lastUpdatedDate={labels.lastUpdatedDate}
        items={solution.faq.map((f) => ({ question: f.q, answer: f.a }))}
      />

      {/* CTA */}
      <section className="mx-auto max-w-[1200px] px-5 pb-20 sm:px-8">
        <Reveal>
          <div className="mt-4 rounded-2xl border border-brand/15 bg-brand-soft px-8 py-12 text-center sm:px-12">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {solution.cta.title}
            </h2>
            <p className="mx-auto mt-4 max-w-[48ch] text-base text-foreground/70">
              {solution.cta.description}
            </p>
            <div className="mt-8 flex justify-center">
              <Link href={`${localePrefix}/contact/`} prefetch={false}>
                <Button size="lg" className="btn-main-cta rounded-full bg-foreground px-8 text-base text-background">
                  <span>{labels.cta}</span>
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

function uiLabels(locale: Locale) {
  switch (locale) {
    case "fr":
      return {
        solutions: "Solutions",
        cta: "Discuter de vos besoins",
        poweredBy: "Propulsé par",
        how: "Fonctionnement",
        howTitle: "Comment ça marche",
        features: "Fonctionnalités",
        featuresTitle: "Ce que la solution fait",
        benefits: "Bénéfices",
        benefitsTitle: "Pourquoi les entreprises suisses l'adoptent",
        faqTitle: "Questions fréquentes",
        lastUpdated: "Dernière mise à jour :",
        lastUpdatedDate: "juillet 2026",
      };
    case "de":
      return {
        solutions: "Lösungen",
        cta: "Ihre Anforderungen besprechen",
        poweredBy: "Basiert auf",
        how: "Funktionsweise",
        howTitle: "So funktioniert es",
        features: "Funktionen",
        featuresTitle: "Was die Lösung leistet",
        benefits: "Vorteile",
        benefitsTitle: "Warum Schweizer Unternehmen darauf setzen",
        faqTitle: "Häufig gestellte Fragen",
        lastUpdated: "Zuletzt aktualisiert:",
        lastUpdatedDate: "Juli 2026",
      };
    case "es":
      return {
        solutions: "Soluciones",
        cta: "Hablar de sus necesidades",
        poweredBy: "Impulsado por",
        how: "Funcionamiento",
        howTitle: "Cómo funciona",
        features: "Funcionalidades",
        featuresTitle: "Lo que hace la solución",
        benefits: "Beneficios",
        benefitsTitle: "Por qué las empresas suizas lo adoptan",
        faqTitle: "Preguntas frecuentes",
        lastUpdated: "Última actualización:",
        lastUpdatedDate: "julio de 2026",
      };
    case "pt":
      return {
        solutions: "Soluções",
        cta: "Discutir suas necessidades",
        poweredBy: "Desenvolvido com",
        how: "Funcionamento",
        howTitle: "Como funciona",
        features: "Funcionalidades",
        featuresTitle: "O que a solução faz",
        benefits: "Benefícios",
        benefitsTitle: "Por que as empresas suíças adotam",
        faqTitle: "Perguntas frequentes",
        lastUpdated: "Última atualização:",
        lastUpdatedDate: "julho de 2026",
      };
    default:
      return {
        solutions: "Solutions",
        cta: "Discuss Your Requirements",
        poweredBy: "Powered by",
        how: "How it works",
        howTitle: "How it works",
        features: "Features",
        featuresTitle: "What the solution does",
        benefits: "Benefits",
        benefitsTitle: "Why Swiss businesses adopt it",
        faqTitle: "Frequently Asked Questions",
        lastUpdated: "Last updated:",
        lastUpdatedDate: "July 2026",
      };
  }
}

export default SolutionPage;
