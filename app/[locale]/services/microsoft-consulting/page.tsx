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

export const runtime = "nodejs";
export const revalidate = false;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return await generateMetadataForPage(
    locale as Locale,
    "/services/microsoft-consulting"
  );
}

const MicrosoftConsultingPage = async ({
  params,
}: {
  params: { locale: string };
}) => {
  const nonce = headers().get("x-nonce") || undefined;
  const baseUrl = "https://houle.ai";
  const localePrefix = `/${params.locale}`;
  const tNav = await getTranslations(params.locale as Locale, "navbar");
  const tService = await getTranslations(
    params.locale as Locale,
    "microsoft-consulting"
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
      name: (tService("Hero.Title") as string) || "Microsoft consulting",
      item: `${baseUrl}/${params.locale}${localizePath(
        "/services/microsoft-consulting",
        params.locale as Locale
      )}/`,
    },
  ]);

  const serviceJsonLd = buildServiceSchema({
    name: (tService("Hero.Title") as string) || "Microsoft consulting",
    description:
      (tService("Hero.Description") as string) ||
      "Optimize your productivity with the Microsoft ecosystem.",
    serviceType: "Consulting",
    url: `${baseUrl}/${params.locale}${localizePath(
      "/services/microsoft-consulting",
      params.locale as Locale
    )}/`,
    areaServed: ["Geneva", "Lausanne", "Zürich", "Switzerland"],
    provider: {
      name: "houle.ai",
      url: baseUrl,
      logo: `${baseUrl}/assets/logo.svg`,
    },
  });

  const organizationJsonLd = buildOrganizationSchema();

  const professionalServiceJsonLd = buildProfessionalServiceSchema(
    `${baseUrl}/${params.locale}${localizePath(
      "/services/microsoft-consulting",
      params.locale as Locale
    )}/`,
    (tService("Hero.Title") as string) || "Microsoft consulting",
    (tService("Hero.Description") as string) ||
      "Optimize your productivity with the Microsoft ecosystem."
  );

  return (
    <div className="min-h-screen">
      <StructuredData
        nonce={nonce}
        data={[
          breadcrumbJsonLd,
          serviceJsonLd,
          organizationJsonLd,
          professionalServiceJsonLd,
        ]}
      />
      <StructuredData nonce={nonce} data={[breadcrumbJsonLd, serviceJsonLd]} />

      {/* Hero Section */}
      <section className="relative w-full pt-24 pb-16 md:pt-32 md:pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="relative max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="max-w-[600px]">
              <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {params.locale === "fr"
                  ? "Services"
                  : params.locale === "de"
                  ? "Dienstleistungen"
                  : params.locale === "es"
                  ? "Servicios"
                  : params.locale === "pt"
                  ? "Serviços"
                  : "Services"}
              </div>
              <h1 className="text-4xl xs:text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
                {(tService("Hero.Title") as string) || "Microsoft consulting"}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {(tService("Hero.Description") as string) ||
                  "Optimize your productivity with the Microsoft ecosystem."}
              </p>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <ResponsiveImage
                mobileSrc="/assets/hero/services/microsoft-consulting-hero-mobile.avif"
                desktopSrc="/assets/hero/services/microsoft-consulting-hero.avif"
                alt={
                  params.locale === "fr"
                    ? "Professionnel utilisant Microsoft 365 pour la productivité"
                    : params.locale === "de"
                    ? "Fachmann nutzt Microsoft 365 für Produktivität"
                    : params.locale === "es"
                    ? "Profesional usando Microsoft 365 para productividad"
                    : params.locale === "pt"
                    ? "Profissional usando Microsoft 365 para produtividade"
                    : "Professional using Microsoft 365 for productivity"
                }
                width={1600}
                height={1200}
                priority
                className="object-cover w-full h-full"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
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
              {(tService("Hero.Title") as string) || "Microsoft consulting"}
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
              {["PowerAutomate", "SharePoint", "PowerBI", "SPFx"].map((key) => (
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

          {/* Integration */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">
              {tService("Presentation.Integration.Title") as string}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {tService("Presentation.Integration.Text") as string}
            </p>
          </section>

          {/* Training */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">
              {tService("Presentation.Training.Title") as string}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {tService("Presentation.Training.Text") as string}
            </p>
          </section>

          {/* Use Cases */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">
              {tService("Presentation.UseCases.Title") as string}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {tService("Presentation.UseCases.Text") as string}
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

          {/* Integration Flows Section */}
          {tService("Presentation.IntegrationFlows.Title") && (
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-6">
                {tService("Presentation.IntegrationFlows.Title") as string}
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground mb-8">
                {tService("Presentation.IntegrationFlows.Intro") as string}
              </p>
              <div className="space-y-8">
                {[
                  "SharePointPowerBI",
                  "PowerAutomateSPFx",
                  "TeamsSharePoint",
                  "SPFxAzureFunctions",
                  "PowerBIEmbedded",
                ].map((key) => (
                  <div key={key} className="pl-6 border-l-2 border-primary/30">
                    <h3 className="text-xl font-semibold mb-3">
                      {
                        tService(
                          `Presentation.IntegrationFlows.${key}.Title`
                        ) as string
                      }
                    </h3>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {
                        tService(
                          `Presentation.IntegrationFlows.${key}.Text`
                        ) as string
                      }
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Real Cases Section */}
          {tService("Presentation.RealCases.Title") && (
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-6">
                {tService("Presentation.RealCases.Title") as string}
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground mb-8">
                {tService("Presentation.RealCases.Intro") as string}
              </p>
              <div className="grid gap-6">
                {(() => {
                  const cases = tService("Presentation.RealCases.Cases");
                  if (Array.isArray(cases)) {
                    return cases.map((item: any, index: number) => (
                      <Link
                        key={index}
                        href={`${localePrefix}/ressources/${item.Slug}`}
                        className="block p-6 rounded-lg bg-primary/5 border border-primary/10 hover:border-primary/30 hover:shadow-lg transition-all group"
                      >
                        <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                          {item.Title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.Summary}
                        </p>
                        <span className="inline-flex items-center mt-4 text-primary text-sm font-medium">
                          {params.locale === "fr"
                            ? "Lire l'article"
                            : params.locale === "de"
                            ? "Artikel lesen"
                            : params.locale === "es"
                            ? "Leer el artículo"
                            : params.locale === "pt"
                            ? "Ler o artigo"
                            : "Read article"}
                          <svg
                            className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
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
                        </span>
                      </Link>
                    ));
                  }
                  return null;
                })()}
              </div>
            </section>
          )}

          {/* Contact CTA */}
          <section className="mt-16 p-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <h2 className="text-2xl font-bold mb-4">
              {params.locale === "fr"
                ? "Discutons de vos besoins Microsoft"
                : params.locale === "de"
                ? "Lassen Sie uns über Ihre Microsoft-Anforderungen sprechen"
                : params.locale === "es"
                ? "Hablemos de sus necesidades Microsoft"
                : params.locale === "pt"
                ? "Vamos falar sobre suas necessidades Microsoft"
                : "Let's discuss your Microsoft needs"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {params.locale === "fr"
                ? "Contactez-nous pour optimiser votre environnement Microsoft 365."
                : params.locale === "de"
                ? "Kontaktieren Sie uns, um Ihre Microsoft 365-Umgebung zu optimieren."
                : params.locale === "es"
                ? "Contáctenos para optimizar su entorno Microsoft 365."
                : params.locale === "pt"
                ? "Entre em contato para otimizar seu ambiente Microsoft 365."
                : "Contact us to optimize your Microsoft 365 environment."}
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

export default MicrosoftConsultingPage;
