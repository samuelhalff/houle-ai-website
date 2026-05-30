import { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { getTranslations, type Locale } from "@/src/lib/i18n";
import { generateMetadataForPage } from "@/src/lib/metadata";
import StructuredData from "@/src/components/seo/StructuredData";
import { buildBreadcrumbList, buildProductSchema, buildOrganizationSchema } from "@/src/lib/structuredData";
import { localizePath } from "@/src/lib/paths";
import PageHero from "@/src/components/site/page-hero";
import SectionHeading from "@/src/components/site/section-heading";
import Reveal from "@/src/components/motion/reveal";
import { Button } from "@/src/components/ui/button";

export const runtime = "nodejs";
export const revalidate = false;

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return await generateMetadataForPage(locale as Locale, "/products/swiss-gpt");
}

const SwissGPTPage = async ({ params }: { params: { locale: string } }) => {
  const nonce = headers().get("x-nonce") || undefined;
  const baseUrl = "https://houle.ai";
  const localePrefix = `/${params.locale}`;
  const t = await getTranslations(params.locale as Locale, "swiss-gpt");

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

  const breadcrumbJsonLd = buildBreadcrumbList([
    { name: productsLabel, item: `${baseUrl}${localePrefix}/products/` },
    { name: (t("Hero.Title") as string) || "Swiss GPT", item: `${baseUrl}${localePrefix}/products/swiss-gpt/` },
  ]);

  return (
    <div>
      <StructuredData
        nonce={nonce}
        data={[breadcrumbJsonLd,
          buildProductSchema({
            name: (t("Hero.Title") as string) || "Enterprise GPT for Switzerland",
            description: (t("Hero.Description") as string) || "Swiss-hosted AI platform with complete data sovereignty",
            url: `${baseUrl}${localePrefix}/products/swiss-gpt/`,
            brand: "houle.ai",
          }),
          buildOrganizationSchema(),
        ]}
      />

      {/* Hero */}
      <div className="abstract-background">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <PageHero
            eyebrow={productsLabel}
            title={(t("Hero.Title") as string) || "Enterprise GPT for Switzerland"}
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

      {/* Features */}
      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Swiss GPT"
            title={(t("Features.Title") as string) || "Enterprise AI Features"}
            description={(t("Features.Description") as string) || ""}
            align="center"
            className="mb-12"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {["Models", "Privacy", "Search", "Enterprise"].map((key) => (
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

      {/* Benefits */}
      <section className="bg-surface-tint/40 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <SectionHeading
              title={(t("Benefits.Title") as string) || "Built for Regulated Industries"}
              align="center"
              className="mb-12"
            />
            <div className="grid gap-5 sm:grid-cols-2">
              {["Legal", "Finance", "Healthcare", "Professional"].map((key) => (
                <div key={key} className="rounded-2xl border bg-background p-6 shadow-sm">
                  <h3 className="font-semibold text-foreground">
                    {t(`Benefits.${key}.Title`) as string}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {t(`Benefits.${key}.Description`) as string}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Technical Infrastructure */}
      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
        <Reveal>
          <SectionHeading
            title={(t("Technical.Title") as string) || "Technical Infrastructure"}
            align="center"
            className="mb-12"
          />
          <div className="space-y-5">
            {["Location", "Security", "Integration", "Support"].map((key) => (
              <div key={key} className="border-l-2 border-brand/30 pl-5">
                <h3 className="font-semibold text-foreground">
                  {t(`Technical.${key}.Title`) as string}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {t(`Technical.${key}.Description`) as string}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Comparison */}
      {t("Comparison.Title") ? (
        <section className="bg-surface-tint/40 px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-[1200px]">
            <Reveal>
              <SectionHeading
                title={(t("Comparison.Title") as string) || ""}
                align="center"
                className="mb-12"
              />
              <div className="mx-auto max-w-3xl space-y-4">
                {(() => {
                  const items = t("Comparison.Items");
                  if (!Array.isArray(items)) return null;
                  return items.map((item: any, index: number) => (
                    <div key={index} className="grid gap-4 rounded-xl border bg-background p-5 shadow-sm sm:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 text-destructive" aria-hidden="true">✗</span>
                        <span className="text-sm text-muted-foreground">{item.Issue}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 text-green-500" aria-hidden="true">✓</span>
                        <span className="text-sm font-medium text-foreground">{item.Solution}</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="mx-auto max-w-[1200px] px-5 pb-20 sm:px-8">
        <Reveal>
          <div className="mt-16 rounded-2xl border border-brand/15 bg-brand-soft px-8 py-12 text-center sm:px-12">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {(t("CTA.Title") as string) || "Experience AI with Swiss Privacy"}
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

export default SwissGPTPage;
