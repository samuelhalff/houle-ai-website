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
  return await generateMetadataForPage(locale as Locale, "/products/word-addin");
}

const WordAddinPage = async ({ params }: { params: { locale: string } }) => {
  const nonce = headers().get("x-nonce") || undefined;
  const baseUrl = "https://houle.ai";
  const localePrefix = `/${params.locale}`;
  const tNav = await getTranslations(params.locale as Locale, "navbar");
  const t = await getTranslations(params.locale as Locale, "word-addin");

  const productsLabel =
    params.locale === "fr" ? "Produits"
    : params.locale === "de" ? "Produkte"
    : params.locale === "es" ? "Productos"
    : params.locale === "pt" ? "Produtos"
    : "Products";

  const breadcrumbJsonLd = buildBreadcrumbList([
    { name: productsLabel, item: `${baseUrl}${localePrefix}/products/` },
    {
      name: (t("Hero.Title") as string) || "AI Assistant for Word",
      item: `${baseUrl}/${params.locale}${localizePath("/products/word-addin", params.locale as Locale)}/`,
    },
  ]);

  return (
    <div>
      <StructuredData
        nonce={nonce}
        data={[breadcrumbJsonLd,
          buildProductSchema({
            name: (t("Hero.Title") as string) || "AI Assistant for Word",
            description: (t("Hero.Description") as string) || "AI-powered add-in for Microsoft Word",
            url: `${baseUrl}/${params.locale}${localizePath("/products/word-addin", params.locale as Locale)}/`,
          }),
          buildOrganizationSchema(),
        ]}
      />

      {/* Hero */}
      <div className="abstract-background">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <PageHero
            eyebrow={productsLabel}
            title={(t("Hero.Title") as string) || "AI Assistant for Word"}
            description={(t("Hero.Description") as string) || ""}
          />
        </div>
      </div>

      {/* Features */}
      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Word"
            title={(t("Features.Title") as string) || "Features"}
            description={(t("Features.Description") as string) || ""}
            align="center"
            className="mb-12"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {["Chat", "Templates", "Suggestions", "Actions"].map((key) => (
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
              title={(t("Benefits.Title") as string) || "Benefits"}
              align="center"
              className="mb-12"
            />
            <div className="grid gap-5 sm:grid-cols-2">
              {["Privacy", "Integration", "Customization", "Compliance"].map((key) => (
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

      {/* Use Cases */}
      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
        <Reveal>
          <SectionHeading
            title={(t("UseCases.Title") as string) || "Use Cases"}
            description={(t("UseCases.Description") as string) || ""}
            align="center"
            className="mb-12"
          />
          <div className="grid gap-5 sm:grid-cols-3">
            {["Legal", "Consulting", "Finance"].map((key) => (
              <div key={key} className="rounded-2xl border bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground">
                  {t(`UseCases.${key}.Title`) as string}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {t(`UseCases.${key}.Description`) as string}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1200px] px-5 pb-20 sm:px-8">
        <Reveal>
          <div className="rounded-2xl border border-brand/15 bg-brand-soft px-8 py-12 text-center sm:px-12">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {(t("CTA.Title") as string) || "Get started"}
            </h2>
            <p className="mx-auto mt-4 max-w-[48ch] text-base text-foreground/70">
              {(t("CTA.Description") as string) || ""}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={`${localePrefix}/contact/`} prefetch={false}>
                <Button size="lg" className="btn-main-cta rounded-full bg-foreground px-8 text-base text-background">
                  <span>{(t("CTA.Demo") as string) || "Book a demo"}</span>
                </Button>
              </Link>
              <Link href={`${localePrefix}/contact/`} prefetch={false}>
                <Button size="lg" variant="secondary" className="btn-secondary-cta rounded-full px-8 text-base">
                  <span>{(t("CTA.Contact") as string) || "Contact us"}</span>
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default WordAddinPage;
