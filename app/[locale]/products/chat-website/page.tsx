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
import ChatSiteDemo, { type ChatSiteDemoLabels } from "@/src/components/ChatSiteDemo";
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
const FAQ_KEYS = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"] as const;
const ARK_URL = "https://ark-fid.ch";

// Published prices, CHF excl. VAT. Keep in sync with the Pricing copy in chat-website.json.
const TIERS = [
  { key: "Essential", setup: 990, monthly: 29, recommended: false },
  { key: "Pro", setup: 1900, monthly: 49, recommended: true },
  { key: "Premium", setup: 3900, monthly: 149, recommended: false },
] as const;

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
    offers: TIERS.map((tier) => ({
      "@type": "Offer",
      name: `${name}: ${s(`Pricing.${tier.key}.Name`)}`,
      description: s(`Pricing.${tier.key}.Includes`),
      url: pageUrl,
      priceCurrency: "CHF",
      priceSpecification: [
        {
          "@type": "PriceSpecification",
          name: s(`Pricing.${tier.key}.Setup`),
          price: tier.setup,
          priceCurrency: "CHF",
          valueAddedTaxIncluded: false,
        },
        {
          "@type": "UnitPriceSpecification",
          name: s(`Pricing.${tier.key}.Monthly`),
          price: tier.monthly,
          priceCurrency: "CHF",
          unitCode: "MON",
          valueAddedTaxIncluded: false,
        },
      ],
    })),
  };

  const demoLabels = Object.fromEntries(
    [
      "Label", "Fiction", "Tagline", "HoursTitle", "Mon", "TueFri", "SatSun", "HMon", "HTueFri", "HSatSun",
      "Closed", "User1", "Assistant1", "User2", "Assistant2",
    ].map((k) => [k, s(`Demo.${k}`)]),
  ) as ChatSiteDemoLabels;

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
          <div className="pb-16">
            <ChatSiteDemo labels={demoLabels} />
          </div>
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
          <div className="grid gap-5 md:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.key}
                className={`relative flex flex-col rounded-2xl border bg-card p-8 shadow-sm ${
                  tier.recommended ? "border-brand/40 ring-1 ring-brand/30" : ""
                }`}
              >
                {tier.recommended && (
                  <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-hover dark:text-brand">
                    {s("Pricing.Recommended")}
                  </p>
                )}
                <h3 className="text-lg font-semibold text-foreground">{s(`Pricing.${tier.key}.Name`)}</h3>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-brand-hover dark:text-brand">
                  {s(`Pricing.${tier.key}.Setup`)}
                </p>
                <p className="mt-1 text-base font-medium text-foreground/80">{s(`Pricing.${tier.key}.Monthly`)}</p>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{s(`Pricing.${tier.key}.Includes`)}</p>
                {tier.key === "Essential" && (
                  <p className="mt-3 text-sm leading-7 text-foreground/80">{s("Pricing.Essential.Alt")}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mx-auto mt-8 max-w-[760px] rounded-2xl border border-brand/15 bg-brand-soft px-6 py-5 text-center">
            <p className="text-sm font-medium leading-7 text-foreground">
              {s("Pricing.Ark.Before")}
              <a
                href={ARK_URL}
                className="font-semibold text-brand-hover underline underline-offset-4 dark:text-brand"
              >
                {s("Pricing.Ark.Link")}
              </a>
              {s("Pricing.Ark.After")}
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-[760px] space-y-3 text-center text-sm leading-7 text-muted-foreground">
            <p>{s("Pricing.MonthlyIncludes")}</p>
            <p className="font-medium text-foreground/80">{s("Pricing.Preview")}</p>
            <p>
              <span className="font-medium text-foreground/80">{s("Pricing.Options.Title")}. </span>
              {s("Pricing.Options.Text")}
            </p>
            <p>{s("Pricing.Subscription")}</p>
          </div>
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
