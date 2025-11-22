import { NextResponse } from "next/server";

import { locales, type Locale } from "@/src/lib/i18n-locales";

const localeSet = new Set<Locale>(locales as readonly Locale[]);

export async function GET(
  _request: Request,
  { params }: { params: { lng: string; ns: string } }
) {
  const { lng, ns } = params;

  if (!localeSet.has(lng as Locale)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Translations are intentionally stripped for the teaser site.
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    }
  );
}
