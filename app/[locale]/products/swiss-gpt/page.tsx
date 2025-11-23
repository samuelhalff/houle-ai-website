import { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { getTranslations, type Locale } from "@/src/lib/i18n";
import { generateMetadataForPage } from "@/src/lib/metadata";
import StructuredData from "@/src/components/seo/StructuredData";
import {
  buildBreadcrumbList,
  buildProductSchema,
  buildOrganizationSchema,
} from "@/src/lib/structuredData";
import { localizePath } from "@/src/lib/paths";

export const runtime = "nodejs";
export const revalidate = false;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return await generateMetadataForPage(locale as Locale, "/products/swiss-gpt");
}

const SwissGPTPage = async ({ params }: { params: { locale: string } }) => {
  const nonce = headers().get("x-nonce") || undefined;
  const baseUrl = "https://houle.ai";
  const localePrefix = `/${params.locale}`;
  const tNav = await getTranslations(params.locale as Locale, "navbar");
  const t = await getTranslations(params.locale as Locale, "swiss-gpt");

  const breadcrumbJsonLd = buildBreadcrumbList([
    {
      name:
        params.locale === "fr"
          ? "Produits"
          : params.locale === "de"
          ? "Produkte"
          : params.locale === "es"
          ? "Productos"
          : params.locale === "pt"
          ? "Produtos"
          : "Products",
      item: `${baseUrl}${localePrefix}/products/`,
    },
    {
      name: (t("Hero.Title") as string) || "Swiss GPT",
      item: `${baseUrl}${localePrefix}/products/swiss-gpt/`,
    },
  ]);

  const productJsonLd = buildProductSchema({
    name: (t("Hero.Title") as string) || "Enterprise GPT for Switzerland",
    description:
      (t("Hero.Description") as string) ||
      "Swiss-hosted AI platform with complete data sovereignty",
    url: `${baseUrl}${localePrefix}/products/swiss-gpt/`,
    brand: "houle.ai",
  });

  const organizationJsonLd = buildOrganizationSchema();

  return (
    <>
      <StructuredData
        nonce={nonce}
        data={[breadcrumbJsonLd, productJsonLd, organizationJsonLd]}
      />

      {/* Hero Section */}
      <section className="relative w-full pt-24 pb-16 md:pt-32 md:pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="relative max-w-[1200px] mx-auto px-6">
          <div className="max-w-[800px] mx-auto text-center">
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {(t("Hero.Badge") as string) || "Swiss-Hosted AI Platform"}
            </div>
            <h1 className="text-4xl xs:text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
              {(t("Hero.Title") as string) || "Enterprise GPT for Switzerland"}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              {(t("Hero.Description") as string) ||
                "Access the latest AI models with complete data sovereignty"}
            </p>
            <Link
              href={`${localePrefix}/contact`}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              {params.locale === "fr"
                ? "Demander une démo"
                : params.locale === "de"
                ? "Demo anfordern"
                : params.locale === "es"
                ? "Solicitar demo"
                : params.locale === "pt"
                ? "Solicitar demonstração"
                : "Request Demo"}
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-6 pb-20">
        {/* Features */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {(t("Features.Title") as string) || "Enterprise AI Features"}
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-[700px] mx-auto">
            {(t("Features.Description") as string) ||
              "Advanced AI with Swiss privacy"}
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {["Models", "Privacy", "Search", "Enterprise"].map((key) => (
              <div
                key={key}
                className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-3">
                  {t(`Features.${key}.Title`) as string}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t(`Features.${key}.Description`) as string}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits / Use Cases */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {(t("Benefits.Title") as string) ||
              "Built for Regulated Industries"}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {["Legal", "Finance", "Healthcare", "Professional"].map((key) => (
              <div
                key={key}
                className="p-6 rounded-xl border bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <h3 className="text-xl font-semibold mb-3">
                  {t(`Benefits.${key}.Title`) as string}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t(`Benefits.${key}.Description`) as string}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Infrastructure */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {(t("Technical.Title") as string) || "Technical Infrastructure"}
          </h2>
          <div className="space-y-6">
            {["Location", "Security", "Integration", "Support"].map((key) => (
              <div key={key} className="pl-6 border-l-2 border-primary/30">
                <h3 className="text-xl font-semibold mb-3">
                  {t(`Technical.${key}.Title`) as string}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t(`Technical.${key}.Description`) as string}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison */}
        {t("Comparison.Title") && (
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-8 text-center">
              {t("Comparison.Title") as string}
            </h2>
            <div className="max-w-[800px] mx-auto">
              <div className="grid gap-4">
                {(() => {
                  const items = t("Comparison.Items");
                  if (Array.isArray(items)) {
                    return items.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="grid md:grid-cols-2 gap-4 p-4 rounded-lg border"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-red-500 font-bold">✗</span>
                          <span className="text-muted-foreground">
                            {item.Issue}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-500 font-bold">✓</span>
                          <span className="font-medium">{item.Solution}</span>
                        </div>
                      </div>
                    ));
                  }
                  return null;
                })()}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="text-center py-12 px-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border">
          <h2 className="text-3xl font-bold mb-4">
            {(t("CTA.Title") as string) || "Experience AI with Swiss Privacy"}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-[600px] mx-auto">
            {(t("CTA.Description") as string) ||
              "Schedule a demo to see how enterprise AI works"}
          </p>
          <Link
            href={`${localePrefix}/contact`}
            className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
          >
            {params.locale === "fr"
              ? "Discuter de vos besoins"
              : params.locale === "de"
              ? "Ihre Anforderungen besprechen"
              : params.locale === "es"
              ? "Hablar de sus necesidades"
              : params.locale === "pt"
              ? "Discutir suas necessidades"
              : "Discuss Your Requirements"}
          </Link>
        </section>
      </div>
    </>
  );
};

export default SwissGPTPage;
