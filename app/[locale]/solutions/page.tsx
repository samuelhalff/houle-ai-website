import { Metadata } from "next";
import Link from "next/link";
import { getTranslationsRecord, type Locale } from "@/src/lib/i18n";
import { getCspNonce } from "@/src/lib/csp";
import { generateMetadataForPage } from "@/src/lib/metadata";
import StructuredData from "@/src/components/seo/StructuredData";
import { buildBreadcrumbList, buildOrganizationSchema } from "@/src/lib/structuredData";
import PageHero from "@/src/components/site/page-hero";
import SectionHeading from "@/src/components/site/section-heading";
import Reveal from "@/src/components/motion/reveal";

export const runtime = "nodejs";
export const revalidate = false;

const baseUrl = "https://houle.ai";

type Product = "ai-agents" | "word-addin" | "outlook-addin" | "swiss-gpt";

type Solution = {
  product: Product;
  hero: { badge: string; title: string; description: string };
};

const PRODUCT_ORDER: Product[] = ["ai-agents", "word-addin", "outlook-addin", "swiss-gpt"];

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  return await generateMetadataForPage(locale as Locale, "/solutions");
}

const SolutionsIndexPage = async (props: { params: Promise<{ locale: string }> }) => {
  const { locale } = await props.params;
  const activeLocale = locale as Locale;
  const nonce = await getCspNonce();
  const localePrefix = `/${activeLocale}`;

  const solutions = getTranslationsRecord(activeLocale, "solutions") as Record<
    string,
    Solution
  >;
  const entries = Object.entries(solutions).filter(
    ([, s]) => s && typeof s === "object" && s.hero,
  );

  const labels = uiLabels(activeLocale);

  const breadcrumbJsonLd = buildBreadcrumbList([
    { name: labels.title, item: `${baseUrl}${localePrefix}/solutions/` },
  ]);

  return (
    <div>
      <StructuredData nonce={nonce} data={[breadcrumbJsonLd, buildOrganizationSchema()]} />

      <div className="abstract-background">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <PageHero eyebrow={labels.eyebrow} title={labels.title} description={labels.description} />
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
        {PRODUCT_ORDER.map((product) => {
          const group = entries.filter(([, s]) => s.product === product);
          if (group.length === 0) return null;
          return (
            <section key={product} className="mb-16 last:mb-0">
              <Reveal>
                <SectionHeading
                  title={labels.products[product]}
                  align="left"
                  className="mb-8"
                />
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map(([slug, s]) => (
                    <Link
                      key={slug}
                      href={`${localePrefix}/solutions/${slug}/`}
                      prefetch={false}
                      className="group rounded-2xl border bg-card p-6 shadow-sm transition-colors hover:border-brand/40"
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
              </Reveal>
            </section>
          );
        })}
      </div>
    </div>
  );
};

function uiLabels(locale: Locale) {
  switch (locale) {
    case "fr":
      return {
        eyebrow: "Solutions",
        title: "Solutions IA par cas d'usage",
        description:
          "Des agents IA hébergés en Suisse et des add-ins Microsoft 365 conçus pour des processus métier concrets. Explorez les solutions par produit.",
        products: {
          "ai-agents": "Agents IA",
          "word-addin": "Add-in Word",
          "outlook-addin": "Add-in Outlook",
          "swiss-gpt": "GPT Suisse",
        } as Record<Product, string>,
      };
    case "de":
      return {
        eyebrow: "Lösungen",
        title: "KI-Lösungen nach Anwendungsfall",
        description:
          "In der Schweiz gehostete KI-Agenten und Microsoft-365-Add-ins für konkrete Geschäftsprozesse. Entdecken Sie die Lösungen nach Produkt.",
        products: {
          "ai-agents": "KI-Agenten",
          "word-addin": "Word-Add-in",
          "outlook-addin": "Outlook-Add-in",
          "swiss-gpt": "Swiss GPT",
        } as Record<Product, string>,
      };
    case "es":
      return {
        eyebrow: "Soluciones",
        title: "Soluciones de IA por caso de uso",
        description:
          "Agentes de IA alojados en Suiza y add-ins de Microsoft 365 diseñados para procesos de negocio concretos. Explore las soluciones por producto.",
        products: {
          "ai-agents": "Agentes de IA",
          "word-addin": "Add-in para Word",
          "outlook-addin": "Add-in para Outlook",
          "swiss-gpt": "Swiss GPT",
        } as Record<Product, string>,
      };
    case "pt":
      return {
        eyebrow: "Soluções",
        title: "Soluções de IA por caso de uso",
        description:
          "Agentes de IA hospedados na Suíça e add-ins do Microsoft 365 projetados para processos de negócio concretos. Explore as soluções por produto.",
        products: {
          "ai-agents": "Agentes de IA",
          "word-addin": "Add-in para Word",
          "outlook-addin": "Add-in para Outlook",
          "swiss-gpt": "Swiss GPT",
        } as Record<Product, string>,
      };
    default:
      return {
        eyebrow: "Solutions",
        title: "AI Solutions by Use Case",
        description:
          "Swiss-hosted AI agents and Microsoft 365 add-ins built for concrete business processes. Explore solutions grouped by product.",
        products: {
          "ai-agents": "AI Agents",
          "word-addin": "Word Add-in",
          "outlook-addin": "Outlook Add-in",
          "swiss-gpt": "Swiss GPT",
        } as Record<Product, string>,
      };
  }
}

export default SolutionsIndexPage;
