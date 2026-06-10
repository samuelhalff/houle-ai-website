# CODEX report

Date: 2026-06-10

## Task status

| ID | Status | Notes |
| --- | --- | --- |
| SEC1 | DONE | Removed sensitive auth/header debug logging from kill and restart endpoints. |
| SEC2 | DONE | Removed the blanket production `https:` token from `script-src`. Kept Google Maps hosts because the site preconnects to Maps assets. |
| SEC3 | DONE | Replaced repeated referrer policy value with `strict-origin-when-cross-origin`. |
| S1 | DONE | Sitemap article loading now happens in `GET()` through cached article helpers. Static pages use `STATIC_LASTMOD`; articles use `updated ?? date`. |
| S2 | DONE | Added server-rendered all-article navigation on the resources page and rendered article breadcrumbs directly. |
| S3 | DONE | Article JSON-LD now uses absolute images with OG fallback, category-derived section/about, keywords, and `dateModified` when present. FAQ JSON-LD uses the shared builder. |
| S4 | DONE | Added taxonomy library, deterministic backfill script, generated `category` and `tags` for all locales, AI generation wiring, and thin-content report. |
| S5 | DONE | Verified metadata uses `https://houle.ai` without localhost fallback. |
| S6 | DONE | Added `Vary: Accept-Language` to the no-locale redirect response. |
| S7 | DONE | Added localized RSS feed route and metadata feed alternates. |
| S8 | DONE | Verified AI workflow already pings sitemaps after publishing. |
| S9 | DONE | Added internal trailing-slash/locale literal href linter. |
| S10 | DONE | Verified metadata lint enforces title and description thresholds as warnings for existing content. |
| PERF1 | DONE | Added shared cached article/resource helpers and replaced duplicate translation checks in sitemap and article page. |
| PERF2 | SKIPPED | Article page has `generateStaticParams` and no page-level `force-dynamic`; left static params in place. |
| PERF3 | SKIPPED | No `nextDynamic()` factories found in `app/[locale]/layout.tsx`. |
| PERF4 | SKIPPED | No `<head nonce>` attribute found in `app/layout.tsx`. |
| PERF5 | DONE | Replaced `src/lib/utils.js` with typed `src/lib/utils.ts`; `*.tsbuildinfo` is already gitignored and no tracked tsbuildinfo file was found. |
| Q1 | DONE | Consolidated repeated middleware security-header logic into `applySecurityHeaders`. |
| Q2 | SKIPPED | No runtime markdown label normalization function matching the sibling-repo issue was found. |
| Q3 | DONE | Category badge styling now keys off deterministic category ids instead of grid position. |

## Out of scope recommendations

- Consider translated per-locale article slugs; current article slugs remain French across locales.
- Consider splitting the large `ressources.json` files into per-article files to reduce review noise and read costs.
- Review old, non-AI fiduciary/tax/payroll articles for brand fit and consolidate or redirect where appropriate.
