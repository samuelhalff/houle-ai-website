import { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { getTranslations, type Locale } from "@/src/lib/i18n";
import { generateMetadataForPage } from "@/src/lib/metadata";
import StructuredData from "@/src/components/seo/StructuredData";
import {
  buildBreadcrumbList,
  buildServiceSchema,
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
    "/services/ai-consulting"
  );
}

const AIConsultingPage = async ({ params }: { params: { locale: string } }) => {
  const nonce = headers().get("x-nonce") || undefined;
  const baseUrl = "https://houle.ai";
  const localePrefix = `/${params.locale}`;
  const tNav = await getTranslations(params.locale as Locale, "navbar");
  const tService = await getTranslations(
    params.locale as Locale,
    "ai-consulting"
  );

  const breadcrumbJsonLd = buildBreadcrumbList([
    {
      name:
        params.locale === "fr"
          ? "Services"
          : params.locale === "de"
          ? "Dienstleistungen"
          : params.locale === "es"
          ? "Servicios"
          : params.locale === "pt"
          ? "Serviços"
          : "Services",
      item: `${baseUrl}${localePrefix}/services/`,
    },
    {
      name: (tService("Hero.Title") as string) || "AI consulting",
      item: `${baseUrl}/${params.locale}${localizePath(
        "/services/ai-consulting",
        params.locale as Locale
      )}/`,
    },
  ]);

  const serviceJsonLd = buildServiceSchema({
    name: (tService("Hero.Title") as string) || "AI consulting",
    description:
      (tService("Hero.Description") as string) ||
      "Transform your business with AI solutions tailored to your needs.",
    serviceType: "Consulting",
    url: `${baseUrl}/${params.locale}${localizePath(
      "/services/ai-consulting",
      params.locale as Locale
    )}/`,
    areaServed: ["Geneva", "Lausanne", "Zürich", "Switzerland"],
    provider: {
      name: "houle.ai",
      url: baseUrl,
      logo: `${baseUrl}/assets/logo.svg`,
    },
  });

  return (
    <div className="min-h-screen">
      <StructuredData nonce={nonce} data={[breadcrumbJsonLd, serviceJsonLd]} />

      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-br from-primary/5 via-background to-background pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-[800px]">
            <h1 className="text-4xl xs:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {(tService("Hero.Title") as string) || "AI consulting"}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {(tService("Hero.Description") as string) ||
                "Transform your business with AI solutions tailored to your needs."}
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
            <Link
              href={`${localePrefix}/services/`}
              className="hover:underline"
            >
              {params.locale === "fr"
                ? "Services"
                : params.locale === "de"
                ? "Dienstleistungen"
                : params.locale === "es"
                ? "Servicios"
                : params.locale === "pt"
                ? "Serviços"
                : "Services"}
            </Link>
          </li>
          <li className="flex items-center gap-1">
            <span className="text-muted-foreground/60">/</span>
            <span aria-current="page" className="font-medium text-foreground">
              {(tService("Hero.Title") as string) || "AI consulting"}
            </span>
          </li>
        </ol>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-6 pb-20">
        <div className="max-w-[800px]">
          {/* Introduction */}
          <section className="mb-16">
            <p className="text-lg leading-relaxed text-muted-foreground">
              {tService("Presentation.Intro") as string}
            </p>
          </section>

          {/* Why Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">
              {tService("Presentation.Why.Title") as string}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {tService("Presentation.Why.Text") as string}
            </p>
          </section>

          {/* Services */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">
              {tService("Presentation.Services.Title") as string}
            </h2>
            <div className="space-y-10">
              {["Automation", "Analytics", "Chatbots", "Custom"].map((key) => (
                <div key={key}>
                  <h3 className="text-xl font-semibold mb-3">
                    {tService(`Presentation.Services.${key}.Title`) as string}
                  </h3>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {tService(`Presentation.Services.${key}.Text`) as string}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Approach */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">
              {tService("Presentation.Approach.Title") as string}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {tService("Presentation.Approach.Text") as string}
            </p>
          </section>

          {/* Technologies */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">
              {tService("Presentation.Technologies.Title") as string}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {tService("Presentation.Technologies.Text") as string}
            </p>
          </section>

          {/* Benefits */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">
              {tService("Presentation.Benefits.Title") as string}
            </h2>
            <div className="space-y-6">
              {(() => {
                const items = tService("Presentation.Benefits.Items");
                if (Array.isArray(items)) {
                  return items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-6 rounded-lg bg-primary/5"
                    >
                      <svg
                        className="w-6 h-6 text-primary mt-1 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-lg mb-2">
                          {item.Title}
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.Desc}
                        </p>
                      </div>
                    </div>
                  ));
                }
                return null;
              })()}
            </div>
          </section>

          {/* Contact CTA */}
          <section className="mt-16 p-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <h2 className="text-2xl font-bold mb-4">
              {params.locale === "fr"
                ? "Discutons de votre projet"
                : params.locale === "de"
                ? "Lassen Sie uns über Ihr Projekt sprechen"
                : params.locale === "es"
                ? "Hablemos de su proyecto"
                : params.locale === "pt"
                ? "Vamos falar sobre seu projeto"
                : "Let's discuss your project"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {params.locale === "fr"
                ? "Contactez-nous pour découvrir comment l'IA peut transformer votre entreprise."
                : params.locale === "de"
                ? "Kontaktieren Sie uns, um zu erfahren, wie KI Ihr Unternehmen transformieren kann."
                : params.locale === "es"
                ? "Contáctenos para descubrir cómo la IA puede transformar su empresa."
                : params.locale === "pt"
                ? "Entre em contato para descobrir como a IA pode transformar sua empresa."
                : "Contact us to discover how AI can transform your business."}
            </p>
            <Link
              href={`${localePrefix}/contact`}
              className="inline-flex items-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:shadow-lg hover:scale-105 transition-all"
            >
              {(tNav("Contact") as string) || "Contact"}
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AIConsultingPage;
