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
  return await generateMetadataForPage(
    locale as Locale,
    "/products/outlook-addin"
  );
}

const OutlookAddinPage = async ({ params }: { params: { locale: string } }) => {
  const nonce = headers().get("x-nonce") || undefined;
  const baseUrl = "https://houle.ai";
  const localePrefix = `/${params.locale}`;
  const tNav = await getTranslations(params.locale as Locale, "navbar");
  const t = await getTranslations(params.locale as Locale, "outlook-addin");

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
      name: (t("Hero.Title") as string) || "AI Assistant for Outlook",
      item: `${baseUrl}/${params.locale}${localizePath(
        "/products/outlook-addin",
        params.locale as Locale
      )}/`,
    },
  ]);

  const productJsonLd = buildProductSchema({
    name: (t("Hero.Title") as string) || "AI Assistant for Outlook",
    description:
      (t("Hero.Description") as string) ||
      "AI-powered add-in for Microsoft Outlook",
    url: `${baseUrl}/${params.locale}${localizePath(
      "/products/outlook-addin",
      params.locale as Locale
    )}/`,
  });

  const organizationJsonLd = buildOrganizationSchema();

  return (
    <div className="min-h-screen">
      <StructuredData
        nonce={nonce}
        data={[breadcrumbJsonLd, productJsonLd, organizationJsonLd]}
      />

      {/* Hero Section */}
      <section className="relative w-full pt-24 pb-16 md:pt-32 md:pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="relative max-w-[1200px] mx-auto px-6">
          <div className="max-w-[800px]">
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {t("Hero.Badge") as string}
            </div>
            <h1 className="text-4xl xs:text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
              {t("Hero.Title") as string}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {t("Hero.Description") as string}
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="w-full max-w-[1200px] mx-auto mt-4 mb-6 px-6"
      >
        <ol className="flex items-center gap-1 text-sm text-muted-foreground">
          <li>
            <Link href={`${localePrefix}/`} className="hover:underline">
              {(tNav("Home") as string) || "Home"}
            </Link>
          </li>
          <li className="flex items-center gap-1">
            <span className="text-muted-foreground/60">/</span>
            <span className="text-foreground font-medium">
              {t("Hero.Title") as string}
            </span>
          </li>
        </ol>
      </nav>

      {/* Features Section */}
      <section className="w-full max-w-[1200px] mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("Features.Title") as string}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("Features.Description") as string}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 border rounded-2xl bg-card hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-3">
              {t("Features.Chat.Title") as string}
            </h3>
            <p className="text-muted-foreground">
              {t("Features.Chat.Description") as string}
            </p>
          </div>
          <div className="p-6 border rounded-2xl bg-card hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-3">
              {t("Features.Templates.Title") as string}
            </h3>
            <p className="text-muted-foreground">
              {t("Features.Templates.Description") as string}
            </p>
          </div>
          <div className="p-6 border rounded-2xl bg-card hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-3">
              {t("Features.Summaries.Title") as string}
            </h3>
            <p className="text-muted-foreground">
              {t("Features.Summaries.Description") as string}
            </p>
          </div>
          <div className="p-6 border rounded-2xl bg-card hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-3">
              {t("Features.Actions.Title") as string}
            </h3>
            <p className="text-muted-foreground">
              {t("Features.Actions.Description") as string}
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full max-w-[1200px] mx-auto px-6 py-16 bg-muted/30 rounded-3xl my-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("Benefits.Title") as string}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-3">
              {t("Benefits.Privacy.Title") as string}
            </h3>
            <p className="text-muted-foreground">
              {t("Benefits.Privacy.Description") as string}
            </p>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-3">
              {t("Benefits.Integration.Title") as string}
            </h3>
            <p className="text-muted-foreground">
              {t("Benefits.Integration.Description") as string}
            </p>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-3">
              {t("Benefits.Customization.Title") as string}
            </h3>
            <p className="text-muted-foreground">
              {t("Benefits.Customization.Description") as string}
            </p>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-3">
              {t("Benefits.Compliance.Title") as string}
            </h3>
            <p className="text-muted-foreground">
              {t("Benefits.Compliance.Description") as string}
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="w-full max-w-[1200px] mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("UseCases.Title") as string}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("UseCases.Description") as string}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-2xl bg-card">
            <h3 className="text-xl font-bold mb-3">
              {t("UseCases.Sales.Title") as string}
            </h3>
            <p className="text-muted-foreground">
              {t("UseCases.Sales.Description") as string}
            </p>
          </div>
          <div className="p-6 border rounded-2xl bg-card">
            <h3 className="text-xl font-bold mb-3">
              {t("UseCases.Support.Title") as string}
            </h3>
            <p className="text-muted-foreground">
              {t("UseCases.Support.Description") as string}
            </p>
          </div>
          <div className="p-6 border rounded-2xl bg-card">
            <h3 className="text-xl font-bold mb-3">
              {t("UseCases.Management.Title") as string}
            </h3>
            <p className="text-muted-foreground">
              {t("UseCases.Management.Description") as string}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-[1200px] mx-auto px-6 py-16 mb-16">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12 rounded-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("CTA.Title") as string}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("CTA.Description") as string}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href={`${localePrefix}/contact/`}
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              {t("CTA.Demo") as string}
            </Link>
            <Link
              href={`${localePrefix}/contact/`}
              className="inline-flex items-center justify-center px-8 py-3 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary/10 transition-colors"
            >
              {t("CTA.Contact") as string}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OutlookAddinPage;
