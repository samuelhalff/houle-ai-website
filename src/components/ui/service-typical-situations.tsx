import { getTranslations, type Locale } from "@/src/lib/i18n";
import Reveal from "@/src/components/motion/reveal";

type Case = { Situation?: string; WhatWeDo?: string };

const text = (value: unknown, key: string): string =>
  typeof value === "string" && value && value !== key ? value : "";

/**
 * Fictional, simplified "typical situations" for a service page.
 * Reads `Presentation.TypicalSituations` (Title, Disclaimer, labels, Cases)
 * from the service namespace. Returns null when the block is absent or
 * incomplete in the active locale, so a missing key never renders raw.
 */
const ServiceTypicalSituations = async ({
  locale,
  ns,
}: {
  locale: string;
  ns: string;
}) => {
  const activeLocale = (locale as Locale) || ("fr" as Locale);
  const t = await getTranslations(activeLocale, ns);
  const base = "Presentation.TypicalSituations";
  const rawCases = t(`${base}.Cases`) as unknown;
  const cases = (Array.isArray(rawCases) ? (rawCases as Case[]) : []).filter(
    (c) => c && c.Situation && c.WhatWeDo,
  );
  if (cases.length === 0) return null;

  const title = text(t(`${base}.Title`), `${base}.Title`);
  if (!title) return null;
  const disclaimer = text(t(`${base}.Disclaimer`), `${base}.Disclaimer`);
  const situationLabel = text(
    t(`${base}.SituationLabel`),
    `${base}.SituationLabel`,
  );
  const whatWeDoLabel = text(
    t(`${base}.WhatWeDoLabel`),
    `${base}.WhatWeDoLabel`,
  );
  const colon = activeLocale === "fr" ? " : " : ": ";

  return (
    <Reveal>
      <section className="mb-16">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {disclaimer ? (
          <p className="mb-8 max-w-3xl text-sm italic leading-7 text-foreground/75">
            {disclaimer}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          {cases.map((item, index) => (
            <div
              key={index}
              className="space-y-3 rounded-2xl border bg-card p-5 text-sm leading-6 shadow-sm"
            >
              <p>
                {situationLabel ? (
                  <span className="font-semibold text-foreground">
                    {situationLabel}
                    {colon}
                  </span>
                ) : null}
                <span className="text-muted-foreground">{item.Situation}</span>
              </p>
              <p>
                {whatWeDoLabel ? (
                  <span className="font-semibold text-foreground">
                    {whatWeDoLabel}
                    {colon}
                  </span>
                ) : null}
                <span className="text-muted-foreground">{item.WhatWeDo}</span>
              </p>
            </div>
          ))}
        </div>
      </section>
    </Reveal>
  );
};

export default ServiceTypicalSituations;
