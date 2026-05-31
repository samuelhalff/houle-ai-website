"use client";
import React, { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/src/lib/i18n";
import { locales } from "@/src/lib/i18n-locales";

const VALID_LOCALES = locales;

const isValidLocale = (value: string): value is Locale =>
  VALID_LOCALES.includes(value as Locale);

export default function LangSwitch(): React.ReactElement {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();

  // Determine active locale from the URL to avoid hydration flashes
  const activeLang = useMemo<Locale>(() => {
    const seg0 = pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
    return seg0 && isValidLocale(seg0) ? seg0 : "fr";
  }, [pathname]);
  const options = useMemo(
    () =>
      [
        { code: "en", label: "English" },
        { code: "fr", label: "Français" },
        { code: "de", label: "Deutsch" },
        { code: "es", label: "Español" },
        { code: "pt", label: "Português" },
      ].filter((opt) => opt.code !== activeLang),
    [activeLang]
  );

  function buildHref(targetLocale: string) {
    const segments = pathname.replace(/^\/+|\/+$/g, "").split("/");
    let newSegments: string[];
    const firstSegment = segments[0];
    if (firstSegment && isValidLocale(firstSegment)) {
      segments[0] = targetLocale;
      newSegments = segments;
    } else {
      newSegments = [targetLocale, ...segments.filter(Boolean)];
    }
    const qs = searchParams?.toString();
    return `/${newSegments.join("/")}${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="lang-switcher group relative md:ml-30">
      <button
        type="button"
        className="lang-switcher-trigger flex h-9 min-w-[56px] items-center justify-center gap-1 rounded-md bg-background px-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-haspopup="menu"
      >
        <GlobeIcon className="h-4 w-4 mx-1" />
        <span className="inline-block w-8 text-center">
          {activeLang.toUpperCase()}
        </span>
        <svg
          className="relative top-px ml-1 size-3 transition duration-300 group-hover:rotate-180 group-focus-within:rotate-180"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div
        className="invisible absolute right-0 top-full z-50 mt-1.5 min-w-40 overflow-hidden rounded-md border bg-popover p-2 text-popover-foreground opacity-0 shadow transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
        role="menu"
      >
        {options.map((opt) => {
          const href = buildHref(opt.code);
          return (
            <Link
              key={opt.code}
              href={href}
              hrefLang={opt.code}
              rel="alternate"
              prefetch={false}
              aria-label={`Switch language to ${opt.label}`}
              className="block w-full cursor-pointer rounded-sm px-4 py-3 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
              role="menuitem"
            >
              {opt.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}
