import { Metadata } from "next";
import Link from "next/link";
import { getTranslations, getTranslationsRecord, type Locale } from "@/src/lib/i18n";
import { getCspNonce } from "@/src/lib/csp";
import { generateMetadataForPage } from "@/src/lib/metadata";
import StructuredData from "@/src/components/seo/StructuredData";
import {
  buildBreadcrumbList,
  buildProductSchema,
  buildOrganizationSchema,
} from "@/src/lib/structuredData";
import PageHero from "@/src/components/site/page-hero";
import SectionHeading from "@/src/components/site/section-heading";
import Reveal from "@/src/components/motion/reveal";
import { Button } from "@/src/components/ui/button";

export const runtime = "nodejs";
export const revalidate = false;

const baseUrl = "https://houle.ai";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  return await generateMetadataForPage(locale as Locale, "/products/ai-agents");
}

type Solution = {
  product: string;
  hero: { badge: string; title: string; description: string };
};

const AIAgentsPage = async (props: { params: Promise<{ locale: string }> }) => {
  const params = await props.params;
  const activeLocale = params.locale as Locale;
  const nonce = await getCspNonce();
  const localePrefix = `/${params.locale}`;
  const t = await getTranslations(activeLocale, "ai-agents");

  const productsLabel =
    params.locale === "fr" ? "Produits"
    : params.locale === "de" ? "Produkte"
    : params.locale === "es" ? "Productos"
    : params.locale === "pt" ? "Produtos"
    : "Products";

  const ctaBtn =
    params.locale === "fr" ? "Discuter de vos besoins"
    : params.locale === "de" ? "Ihre Anforderungen besprechen"
    : params.locale === "es" ? "Hablar de sus necesidades"
    : params.locale === "pt" ? "Discutir suas necessidades"
    : "Discuss Your Requirements";

  // Use-case grid: pull ai-agents solutions from the solutions namespace.
  const solutions = getTranslationsRecord(activeLocale, "solutions") as Record<
    string,
    Solution
  >;
  const agentSolutions = Object.entries(solutions).filter(
    ([, s]) => s && typeof s === "object" && s.hero && s.product === "ai-agents",
  );

  const breadcrumbJsonLd = buildBreadcrumbList([
    { name: productsLabel, item: `${baseUrl}${localePrefix}/products/` },
    { name: (t("Hero.Title") as string) || "AI Agents", item: `${baseUrl}${localePrefix}/products/ai-agents/` },
  ]);

  return (
    <div>
      <StructuredData
        nonce={nonce}
        data={[
          breadcrumbJsonLd,
          buildProductSchema({
            name: (t("Hero.Title") as string) || "Swiss-Hosted AI Agents",
            description:
              (t("Hero.Description") as string) ||
              "Specialised AI agents hosted on Azure in Switzerland",
            url: `${baseUrl}${localePrefix}/products/ai-agents/`,
            brand: "houle.ai",
          }),
          buildOrganizationSchema(),
        ]}
      />

      {/* Hero */}
      <div className="abstract-background">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <PageHero
            eyebrow={t("Hero.Badge") as string}
            title={(t("Hero.Title") as string) || "Swiss-Hosted AI Agents"}
            description={(t("Hero.Description") as string) || ""}
          >
            <div className="flex justify-start">
              <Link href={`${localePrefix}/contact/`} prefetch={false}>
                <Button size="lg" className="btn-main-cta rounded-full bg-foreground px-8 text-base text-background">
                  <span>
                    {params.locale === "fr" ? "Demander une démo"
                    : params.locale === "de" ? "Demo anfordern"
                    : params.locale === "es" ? "Solicitar demo"
                    : params.locale === "pt" ? "Solicitar demonstração"
                    : "Request Demo"}
                  </span>
                </Button>
              </Link>
            </div>
          </PageHero>
        </div>
      </div>

      {/* Answer-first paragraph */}
      <section className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8">
        <Reveal>
          <p className="max-w-[70ch] text-lg leading-8 text-foreground/80">
            {t("Answer") as string}
          </p>
        </Reveal>
      </section>

      {/* How AI agents work */}
      <section className="bg-surface-tint/40 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <SectionHeading
              eyebrow="AI Agents"
              title={(t("How.Title") as string) || "How AI agents work"}
              description={(t("How.Description") as string) || ""}
              align="center"
              className="mb-12"
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {["Perceive", "Reason", "Act", "Review"].map((key, index) => (
                <div key={key} className="rounded-2xl border bg-background p-6 shadow-sm">
                  <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-hover dark:text-brand">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-foreground">
                    {t(`How.${key}.Title`) as string}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {t(`How.${key}.Description`) as string}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Capabilities / Features */}
      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
        <Reveal>
          <SectionHeading
            title={(t("Features.Title") as string) || "What our AI agents can do"}
            align="center"
            className="mb-12"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {["Tools", "Grounding", "Governance", "Integration"].map((key) => (
              <div key={key} className="rounded-2xl border bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground">
                  {t(`Features.${key}.Title`) as string}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {t(`Features.${key}.Description`) as string}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Use-case grid */}
      <section className="bg-surface-tint/40 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <SectionHeading
              eyebrow={t("UseCases.Eyebrow") as string}
              title={(t("UseCases.Title") as string) || "AI agent use cases"}
              description={(t("UseCases.Description") as string) || ""}
              align="center"
              className="mb-12"
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {agentSolutions.map(([slug, s]) => (
                <Link
                  key={slug}
                  href={`${localePrefix}/solutions/${slug}/`}
                  prefetch={false}
                  className="group rounded-2xl border bg-background p-6 shadow-sm transition-colors hover:border-brand/40"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-brand-hover dark:group-hover:text-brand">
                    {s.hero.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {s.hero.description}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href={`${localePrefix}/solutions/`}
                prefetch={false}
                className="text-sm font-medium text-brand-hover underline-offset-4 hover:underline dark:text-brand"
              >
                {t("UseCases.AllLink") as string}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1200px] px-5 pb-20 pt-16 sm:px-8">
        <Reveal>
          <div className="rounded-2xl border border-brand/15 bg-brand-soft px-8 py-12 text-center sm:px-12">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {(t("CTA.Title") as string) || "Put an AI agent to work"}
            </h2>
            <p className="mx-auto mt-4 max-w-[48ch] text-base text-foreground/70">
              {(t("CTA.Description") as string) || ""}
            </p>
            <div className="mt-8 flex justify-center">
              <Link href={`${localePrefix}/contact/`} prefetch={false}>
                <Button size="lg" className="btn-main-cta rounded-full bg-foreground px-8 text-base text-background">
                  <span>{ctaBtn}</span>
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default AIAgentsPage;
