import { getArticles } from "@/src/lib/articles";
import { getTranslations, type Locale } from "@/src/lib/i18n";
import { servicePillarArticle } from "@/src/lib/serviceArticles";
import TrackedLink from "@/src/components/ui/tracked-link";

/**
 * Highlighted card pointing to the reference article of a service. Title and
 * description come from the locale's article data. Returns null when the
 * service has no pillar or the article is missing in the active locale.
 * The label is read from `Presentation.UseCases.PillarLabel` of the service
 * namespace and guarded against the raw-key fallback.
 */
const ServicePillarCard = async ({
  locale,
  servicePath,
  ns,
}: {
  locale: string;
  servicePath: string;
  ns: string;
}) => {
  const activeLocale = (locale as Locale) || ("fr" as Locale);
  const slug = servicePillarArticle[servicePath];
  if (!slug) return null;
  const articles = await getArticles(activeLocale);
  const pillar = articles.find((a) => a.slug === slug);
  if (!pillar || !pillar.title) return null;

  const t = await getTranslations(activeLocale, ns);
  const labelKey = "Presentation.UseCases.PillarLabel";
  const raw = t(labelKey) as unknown;
  const label = typeof raw === "string" && raw && raw !== labelKey ? raw : "";

  return (
    <div className="mb-8 max-w-3xl space-y-2 rounded-2xl border border-brand/15 bg-brand-soft px-6 py-5">
      {label ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      ) : null}
      <TrackedLink
        href={`/${activeLocale}/ressources/articles/${pillar.slug}/`}
        cta="service_pillar_article"
        prefetch={false}
        className="block font-semibold text-foreground underline-offset-4 hover:text-brand hover:underline"
      >
        {pillar.title}
      </TrackedLink>
      {pillar.description ? (
        <p className="text-sm leading-6 text-muted-foreground">
          {pillar.description}
        </p>
      ) : null}
    </div>
  );
};

export default ServicePillarCard;
