"use client";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { trackEvent } from "@/src/lib/analytics";

/**
 * Contextual call-to-action injected mid-article. Primary action goes to the
 * contact page; when the article category maps to a service, a secondary link
 * points to that service page. Clicks are reported to GA4 as
 * cta_click { cta: "article_contextual", destination }.
 */
const ArticleContextualCTA = ({
  title,
  description,
  primaryText,
  primaryHref,
  secondaryText,
  secondaryHref,
}: {
  title: string;
  description: string;
  primaryText: string;
  primaryHref: string;
  secondaryText?: string;
  secondaryHref?: string;
}) => {
  const track = (destination: string) =>
    trackEvent("cta_click", { cta: "article_contextual", destination });

  return (
    <aside className="not-prose my-12 rounded-2xl border border-border bg-muted/40 px-6 py-8 text-center sm:px-10 sm:py-10">
      <p className="text-xs font-medium uppercase tracking-wide text-foreground/60">
        houle.ai
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-foreground/70">
        {description}
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button
          asChild
          size="lg"
          className="rounded-full bg-foreground px-8 text-background"
        >
          <Link
            href={primaryHref}
            prefetch={false}
            onClick={() => track(primaryHref)}
          >
            {primaryText}
          </Link>
        </Button>
        {secondaryText && secondaryHref ? (
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full px-8"
          >
            <Link
              href={secondaryHref}
              prefetch={false}
              onClick={() => track(secondaryHref)}
            >
              {secondaryText}
            </Link>
          </Button>
        ) : null}
      </div>
    </aside>
  );
};

export default ArticleContextualCTA;
