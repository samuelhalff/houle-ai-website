# AI Agents product, use-case landing pages, and articles — design

Date: 2026-07-24. Repo: houle-ai-website (Next.js 15, 5 locales en/fr/de/es/pt).

## Goal
Add a new flagship product ("AI Agents", Swiss-hosted via Azure AI Foundry), SEO/GEO landing
pages for its use cases AND for the existing products, an explainer of how agents work, and a
set of impact + educational articles.

Scope decisions (approved by owner):
- Full: a dedicated landing page per use case.
- Case studies: Ark Fiduciaire named + illustrative others (no fabricated clients).
- Also add use-case landing pages for existing products (Word Add-in, Outlook Add-in, Swiss GPT).
- Expand article scope, including agent-focused articles.

## Architecture (keep it maintainable)
Do NOT hand-write ~80 page components. Use a **dynamic use-case route** driven by per-locale JSON,
mirroring the existing article system:

- `app/[locale]/products/ai-agents/page.tsx` — product overview + "how agents work" + use-case grid.
- `app/[locale]/solutions/[useCase]/page.tsx` — ONE dynamic component rendering any use-case landing
  page. `generateStaticParams()` enumerates all use-case slugs. Content pulled from
  `src/translations/<locale>/solutions.json` keyed by slug.
- Rationale for `/solutions/<slug>/` (not nested under each product): a use case ("payroll
  automation") is a search-intent landing page that can reference one or more products; a flat
  `/solutions/` namespace is cleaner for SEO and lets existing products share the same system.
  Each solution entry declares which product(s) it belongs to for cross-linking + nav grouping.

`solutions.json` shape (per locale), keyed by slug:
```
{ "<slug>": {
    "product": "ai-agents" | "word-addin" | "outlook-addin" | "swiss-gpt",
    "hero": { "badge", "title", "description" },
    "answer": "2-3 sentence answer-first paragraph (GEO)",
    "how": [ { "title", "description" } ],       // how it works, 3-5 steps
    "features": [ { "title", "description" } ],   // 4-6
    "benefits": [ { "title", "description" } ],   // 3-4
    "faq": [ { "q", "a" } ],                        // 3-5 (FAQPage schema)
    "cta": { "title", "description" }
} }
```
Page renders: PageHero, answer-first paragraph, "How it works", Features grid, Benefits, FAQ
(with buildFAQPage JSON-LD), CTA. Plus buildBreadcrumbList + buildProductSchema/ServiceSchema +
buildOrganizationSchema. Metadata via a dynamic template in metadata.json ("solutions").

## Use-case landing pages (agents unless noted)
Service-company + cross-industry:
1. accounting-automation
2. mailroom-automation (inbound document intake)
3. payroll-automation
4. invoice-processing (accounts-payable)
5. customer-email-triage
6. research-agent
7. contract-review
8. compliance-kyc-monitoring
9. hr-onboarding
10. quote-proposal-generation
11. meeting-notes-agent
12. it-helpdesk-agent
13. lead-qualification
14. document-data-extraction

Existing-product use-case pages:
15. word-contract-drafting (word-addin)
16. word-report-generation (word-addin)
17. outlook-email-drafting (outlook-addin)
18. outlook-inbox-triage (outlook-addin)
19. swiss-gpt-knowledge-assistant (swiss-gpt)
20. swiss-gpt-secure-chat (swiss-gpt)

(≈20 solution pages, one dynamic component, 5 locales via one solutions.json per locale.)

## Articles (src/translations/*/ressources.json)
Case studies (category `case-studies`), Ark Fiduciaire named + illustrative:
- A. Ark Fiduciaire: instant-quote agent + accounting automation (REAL, named).
- B. Mailroom automation for a services firm (illustrative/representative — clearly framed).
- C. Payroll automation in a Swiss SME (illustrative/representative).
Agent educational / thought-leadership:
- D. What are AI agents and how do they work (explainer; category workflow-automation).
- E. AI agents vs. RPA and traditional automation (workflow-automation).
- F. Deploying AI agents securely in Switzerland — data residency + human-in-the-loop
  (security-compliance).
- G. AI agent use cases for service companies (ai-strategy-adoption).
Each ≥700 words FR canonical, genuine translations in en/de/es/pt.

## Registration checklist (per page)
- solutions.json entry (5 locales), metadata `solutions` dynamic template.
- Dynamic route generateStaticParams includes slug.
- Sitemap: enumerate solution slugs (like articles).
- Nav: add "AI Agents" product to nav products array (5 locales); a "Solutions" mega-menu or link.
- JSON-LD per page.

## Claims integrity
- Swiss hosting framed consistently with existing Swiss GPT positioning (Azure in Switzerland).
- Verify Azure AI Foundry / Agent Service Switzerland-region availability before publishing hard
  data-residency wording; otherwise use the same "hosted on Azure in Switzerland" language already
  used for Swiss GPT.
- Only Ark Fiduciaire named as a client; other case studies clearly framed as representative.

## Build order (walking skeleton first)
1. Foundation: solutions.json (FR+EN with 1 seed use case), dynamic route, AI Agents product page,
   metadata template, sitemap + nav registration. Validate + build green.
2. Scale agent use-case content (batches, subagents), 5 locales.
3. Existing-product use-case content.
4. Articles (FR canonical then translations).
5. Full validation (validate:translations, lint:links, lint:metadata, typecheck, build), push.
