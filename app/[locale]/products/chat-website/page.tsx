import { Metadata } from "next";
import Link from "next/link";
import { getTranslations, type Locale } from "@/src/lib/i18n";
import { getCspNonce } from "@/src/lib/csp";
import { generateMetadataForPage } from "@/src/lib/metadata";
import StructuredData from "@/src/components/seo/StructuredData";
import {
  buildBreadcrumbList,
  buildFAQPage,
  buildOrganizationSchema,
  buildServiceSchema,
} from "@/src/lib/structuredData";
import PageHero from "@/src/components/site/page-hero";
import SectionHeading from "@/src/components/site/section-heading";
import Reveal from "@/src/components/motion/reveal";
import { Button } from "@/src/components/ui/button";

export const runtime = "nodejs";
export const revalidate = false;

const baseUrl = "https://houle.ai";
const PAGE_PATH = "/products/chat-website";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  return await generateMetadataForPage(locale as Locale, PAGE_PATH);
}

const HOW_STEPS = ["Ask", "Clarify", "Check", "Publish"] as const;
const ASSISTANT_RULES = ["Design", "Readability", "Seo", "Limits"] as const;
const INCLUDED = ["Fast", "Swiss", "Languages", "Seo", "Ownership"] as const;
const FAQ_KEYS = ["Q1", "Q2", "Q3", "Q4", "Q5"] as const;

const ChatWebsitePage = async (props: { params: Promise<{ locale: string }> }) => {
  const params = await props.params;
  const activeLocale = params.locale as Locale;
  const nonce = await getCspNonce();
  const localePrefix = `/${params.locale}`;
  const t = await getTranslations(activeLocale, "chat-website");
  const s = (key: string) => (t(key) as string) || "";

  const pageUrl = `${baseUrl}${localePrefix}${PAGE_PATH}/`;
  const name = s("Name") || "Chat-managed website";

  const faqEntries = FAQ_KEYS.map((key) => ({
    question: s(`Faq.${key}.Question`),
    answer: s(`Faq.${key}.Answer`),
  }));

  const breadcrumbJsonLd = buildBreadcrumbList([
    { name: s("Breadcrumb") || "Products", item: `${baseUrl}${localePrefix}/products/` },
    { name, item: pageUrl },
  ]);

  // Service markup with the published prices (CHF, excl. VAT). Product markup
  // is deliberately not used on product pages (see scripts/structured-data.test.js).
  const serviceJsonLd = {
    ...buildServiceSchema({
      name,
      description: s("Hero.Description"),
      serviceType: "Website design and hosting",
      url: pageUrl,
      areaServed: ["Geneva", "Lausanne", "Switzerland"],
      provider: { name: "houle.ai", url: baseUrl, logo: `${baseUrl}/assets/logo.svg` },
    }),
    offers: [
      {
        "@type": "Offer",
        name: s("Pricing.Setup.Name"),
        description: s("Pricing.Setup.Includes"),
        url: pageUrl,
        priceSpecification: {
          "@type": "PriceSpecification",
          minPrice: 1900,
          priceCurrency: "CHF",
          valueAddedTaxIncluded: false,
        },
      },
      {
        "@type": "Offer",
        name: s("Pricing.Hosting.Name"),
        description: s("Pricing.Hosting.Includes"),
        url: pageUrl,
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: 49,
          priceCurrency: "CHF",
          unitCode: "MON",
          valueAddedTaxIncluded: false,
        },
      },
    ],
  };

  const ctaButton = (label: string) => (
    <Link href={`${localePrefix}/contact/`} prefetch={false}>
      <Button size="lg" className="btn-main-cta rounded-full bg-foreground px-8 text-base text-background">
        <span>{label}</span>
      </Button>
    </Link>
  );

  return (
    <div>
      <StructuredData
        nonce={nonce}
        data={[breadcrumbJsonLd, serviceJsonLd, buildFAQPage(faqEntries), buildOrganizationSchema()]}
      />

      {/* Hero */}
      <div className="abstract-background">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <PageHero eyebrow={s("Hero.Badge")} title={s("Hero.Title")} description={s("Hero.Description")}>
            <div className="flex justify-start">{ctaButton(s("CTA.Button"))}</div>
          </PageHero>
        </div>
      </div>

      {/* Answer-first paragraph */}
      <section className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8">
        <Reveal>
          <p className="max-w-[70ch] text-lg leading-8 text-foreground/80">{s("Answer")}</p>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="bg-surface-tint/40 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <SectionHeading
              eyebrow={s("How.Eyebrow")}
              title={s("How.Title")}
              description={s("How.Description")}
              align="center"
              className="mb-12"
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_STEPS.map((key, index) => (
                <div key={key} className="rounded-2xl border bg-background p-6 shadow-sm">
                  <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-hover dark:text-brand">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-foreground">{s(`How.${key}.Title`)}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{s(`How.${key}.Description`)}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Assistant rules */}
      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
        <Reveal>
          <SectionHeading
            title={s("Assistant.Title")}
            description={s("Assistant.Description")}
            align="center"
            className="mb-12"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {ASSISTANT_RULES.map((key) => (
              <div key={key} className="rounded-2xl border bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground">{s(`Assistant.${key}.Title`)}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{s(`Assistant.${key}.Description`)}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* What is included + audience */}
      <section className="bg-surface-tint/40 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <SectionHeading
              title={s("Included.Title")}
              description={s("Included.Description")}
              align="center"
              className="mb-12"
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {INCLUDED.map((key) => (
                <div key={key} className="rounded-2xl border bg-background p-6 shadow-sm">
                  <h3 className="font-semibold text-foreground">{s(`Included.${key}.Title`)}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{s(`Included.${key}.Description`)}</p>
                </div>
              ))}
              <div className="rounded-2xl border border-brand/15 bg-brand-soft p-6">
                <h3 className="font-semibold text-foreground">{s("Audience.Title")}</h3>
                <p className="mt-2 text-sm leading-7 text-foreground/75">{s("Audience.Description")}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
        <Reveal>
          <SectionHeading
            title={s("Pricing.Title")}
            description={s("Pricing.Description")}
            align="center"
            className="mb-12"
          />
          <div className="mx-auto grid max-w-[960px] gap-5 md:grid-cols-2">
            {(["Setup", "Hosting"] as const).map((key) => (
              <div key={key} className="flex flex-col rounded-2xl border bg-card p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground">{s(`Pricing.${key}.Name`)}</h3>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-brand-hover dark:text-brand">
                  {s(`Pricing.${key}.Price`)}
                </p>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{s(`Pricing.${key}.Includes`)}</p>
                {key === "Setup" && (
                  <p className="mt-3 text-sm font-medium text-foreground/80">{s("Pricing.Setup.Extra")}</p>
                )}
              </div>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-[60ch] text-center text-sm leading-7 text-muted-foreground">
            {s("Pricing.Subscription")}
          </p>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="bg-surface-tint/40 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-[860px]">
          <Reveal>
            <SectionHeading title={s("Faq.Title")} align="center" className="mb-10" />
            <div className="space-y-4">
              {faqEntries.map((entry) => (
                <details key={entry.question} className="group rounded-2xl border bg-background p-6 shadow-sm">
                  <summary className="cursor-pointer list-none font-semibold text-foreground">
                    {entry.question}
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{entry.answer}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1200px] px-5 pb-20 pt-16 sm:px-8">
        <Reveal>
          <div className="rounded-2xl border border-brand/15 bg-brand-soft px-8 py-12 text-center sm:px-12">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">{s("CTA.Title")}</h2>
            <p className="mx-auto mt-4 max-w-[48ch] text-base text-foreground/70">{s("CTA.Description")}</p>
            <div className="mt-8 flex justify-center">{ctaButton(s("CTA.Button"))}</div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default ChatWebsitePage;
