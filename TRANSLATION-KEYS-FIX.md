# Translation Keys Index

This document tracks translation keys added or modified in the repository.

## Namespace: resources (ressources.json)

### Banner Section

Keys for the bottom banner on article pages in the Resources section.

| Key | Description |
|-----|-------------|
| `banner.questions_about_article` | Title for the article page banner asking if user has questions about the current article |
| `banner.banner_body` | Body text explaining that experts can help understand details and implications |
| `banner.contact_button` | CTA button text to contact the team |

#### Translations

**English (en):**
```json
{
  "banner": {
    "questions_about_article": "Questions about this article?",
    "banner_body": "Our experts are here to help you understand the details and implications for your business. Get personalized advice tailored to your situation.",
    "contact_button": "Contact our team"
  }
}
```

**French (fr):**
```json
{
  "banner": {
    "questions_about_article": "Des questions sur cet article ?",
    "banner_body": "Nos experts peuvent vous aider à comprendre les détails et les conséquences pour votre activité. Obtenez des conseils personnalisés adaptés à votre situation.",
    "contact_button": "Contacter notre équipe"
  }
}
```

**German (de):**
```json
{
  "banner": {
    "questions_about_article": "Fragen zu diesem Artikel?",
    "banner_body": "Unsere Experten helfen Ihnen, die Details und Auswirkungen auf Ihr Unternehmen zu verstehen. Erhalten Sie persönliche Beratung, die auf Ihre Situation zugeschnitten ist.",
    "contact_button": "Kontaktieren Sie unser Team"
  }
}
```

**Spanish (es):**
```json
{
  "banner": {
    "questions_about_article": "¿Preguntas sobre este artículo?",
    "banner_body": "Nuestros expertos le ayudarán a entender los detalles y las implicaciones para su empresa. Reciba asesoramiento personalizado adaptado a su situación.",
    "contact_button": "Contacte con nuestro equipo"
  }
}
```

**Portuguese (pt):**
```json
{
  "banner": {
    "questions_about_article": "Dúvidas sobre este artigo?",
    "banner_body": "Os nossos especialistas podem ajudá‑lo a compreender os detalhes e as implicações para o seu negócio. Receba aconselhamento personalizado adaptado à sua situação.",
    "contact_button": "Contacte a nossa equipa"
  }
}
```

### Usage

These keys are used in the article page component (`app/[locale]/ressources/articles/[slug]/page.tsx`) to display a localized contact banner at the bottom of each article.

---

## Namespace: contact (contact.json)

Keys for the contact page and contact form.

| Key | Description |
|-----|-------------|
| `Title` | Page heading |
| `Contact.CompanyName` | Company name |
| `Contact.Email` | Contact email address |
| `Contact.Phone` | Contact phone number |
| `Contact.Address` | Company address |
| `Form.Name` | Name field label |
| `Form.Email` | Email field label |
| `Form.Message` | Message field label |

---

## Namespace: cookie (cookie.json)

Keys for the cookie consent banner.

| Key | Description |
|-----|-------------|
| `Title` | Banner title |
| `Text` | Banner body text |
| `LearnMore` | Link text for cookie settings page |
| `Accept` | Accept button label |
| `Decline` | Decline button label |
| `Manage` | Manage cookies button label |

---

## Namespace: navbar (navbar.json)

Keys for the navigation bar.

| Key | Description |
|-----|-------------|
| `Home` | Home link label |
| `Services` | Services link label |
| `About` | About link label |
| `Contact` | Contact link label |

---

## Namespace: footer (footer.json)

Keys for the site footer.

| Key | Description |
|-----|-------------|
| `Copyright` | Copyright notice text |

---

## Namespace: home (home.json)

Keys for the home page.

| Key | Description |
|-----|-------------|
| `Hero.Title` | Hero section headline |
| `Hero.Description` | Hero section description |
| `Services.Title` | Services section heading |

---

## Namespace: ai-consulting (ai-consulting.json)

Keys added or changed for the vendor-neutral positioning (2026-10). `Presentation.AzureAI.*` was removed and replaced by `Presentation.ModelsHosting.*`.

| Key | Description |
|-----|-------------|
| `Presentation.Approach.Steps[]` | Six method steps (`Title`, `Text`): discovery workshop, use-case selection, model and hosting choice, pilot, production, governance |
| `Presentation.ModelsHosting.Title` | Heading of the "models and hosting" section |
| `Presentation.ModelsHosting.Intro` | Intro paragraph of the section |
| `Presentation.ModelsHosting.Choice.Title` / `.Text` | When to choose which kind of model |
| `Presentation.ModelsHosting.OpenSource.Title` / `.Text` | Open-source models hosted in Switzerland |
| `Presentation.ModelsHosting.Swiss.Title` / `.Text` | What "hosted in Switzerland" means concretely |
| `Presentation.ModelsHosting.Proprietary.Title` / `.Text` | When Microsoft, OpenAI, Anthropic or Mistral are the right choice |
| `Presentation.ModelsHosting.Limits.Title` / `.Text` | What we do not promise |

---

## Namespace: faq (faq.json)

| Key | Description |
|-----|-------------|
| `Question23` / `Answer23` | Which AI models we work with |
| `Question24` / `Answer24` | What "hosted in Switzerland" means concretely |
| `Question25` / `Answer25` | When an open-source model hosted in Switzerland beats a US AI subscription |

The home page reads `Question1`–`Question25` (see `app/[locale]/page.tsx`).

---

## Namespace: resources, mid-article CTA (ressources.json)

| Key | Description |
|-----|-------------|
| `ContextualCTA.Title` / `Description` / `PrimaryCTA` | Generic mid-article CTA (links to contact) |
| `ContextualCTA.Services.ai-consulting.{Title,Description,ServiceCTA}` | CTA for AI strategy, governance, security articles |
| `ContextualCTA.Services.microsoft-consulting.{Title,Description,ServiceCTA}` | CTA for automation, Power Platform, data articles |

Category to service mapping lives in `src/lib/articleCta.ts`; categories without a service (business-operations) use the generic copy.

## Article end WhatsApp, service pillar and typical situations (Oct 2026)

Added in all locales (`fr`, `en`, `de`, `es`, `pt`):

| Key | Usage |
| --- | --- |
| `ressources:banner.whatsapp_button` | WhatsApp button in the end-of-article block (`contact_channel_click`, placement `article_end`) |
| `ai-consulting:Presentation.UseCases.PillarLabel`, `microsoft-consulting:Presentation.UseCases.PillarLabel` | Label of the reference guide card (`src/lib/serviceArticles.ts`, `service-pillar-card.tsx`) |
| `<service>:Presentation.TypicalSituations.{Title,Disclaimer,SituationLabel,WhatWeDoLabel,Cases[].Situation,Cases[].WhatWeDo}` | Fictional typical situations block (`service-typical-situations.tsx`) on both service pages |

Reworded: `Presentation.UseCases` / `Presentation.RealCases` titles, intros and summaries (typical scenarios, no client names or figures). Removed: `contact:Contact.Phone` (unused placeholder). Renamed (fr): `microsoft-consulting:IntegrationFlows.TeamsSharePointApprovals` → `TeamsSharePoint`.

## Cookie banner translated, Consent Mode regional defaults (Oct 2026)

The cookie banner now reads the `cookie` namespace (`app/layout.tsx`) instead of hard-coded English. Changed values in all locales (`fr`, `en`, `de`, `es`, `pt`): `cookie:Title`, `cookie:Text`, `cookie:Accept`, `cookie:Decline` (now "Refuse": it denies analytics and ad signals), `cookie:LearnMore` (links to the cookies policy). The contact form attribution notice (`attributionNotice`) is hard-coded per locale in `app/[locale]/contact/page.tsx`, like the other form labels.

## Namespace: legal (legal.json) — privacy and cookies policies translated (Oct 2026)

New namespace in all locales (`fr`, `en`, `de`, `es`, `pt`), rendered by `app/[locale]/legal/LegalDocument.tsx` for `/legal/privacy` and `/legal/cookies` (previously hard-coded English).

| Key | Description |
|-----|-------------|
| `LastUpdated` | "Last updated: {date}" label; the date comes from `PRIVACY_LAST_UPDATED` in `app/[locale]/legal/constants.ts` |
| `Privacy.{MetaTitle,MetaDescription,Title,Subtitle}` | Privacy policy metadata and header |
| `Privacy.Sections[].{Title,Blocks[]}` | Privacy policy sections |
| `Cookies.{MetaTitle,MetaDescription,Title,Subtitle}` | Cookies policy metadata and header |
| `Cookies.Sections[].{Title,Blocks[]}` | Cookies policy sections |

Block types: `p` (`text`), `h3` (`text`), `ul` (`items[]`), `box` (`heading?`, `lines?[]`, `items?[]`, `note?`), `rights` (`items[].{label,text}`), `links` (`heading`, `items[].{label,href}`). `scripts/validate-translations.js` fails the build when a locale's `legal.json` structure (sections, block types, list lengths, `href`s) differs from `en`. The privacy policy states that the Google Analytics identifier is added to a message unless the visitor refused analytics.

## Namespace: chat-website (chat-website.json) — chat-managed website product (Oct 2026)

New namespace in all locales (`fr`, `en`, `de`, `es`, `pt`), rendered by `app/[locale]/products/chat-website/page.tsx` (`/products/chat-website/`, English slug shared by all locales).

| Key | Description |
|-----|-------------|
| `Name` | Product name (breadcrumb, Service JSON-LD) |
| `Breadcrumb` | "Products" breadcrumb label |
| `Hero.{Badge,Title,Description}` | Hero eyebrow, H1 and intro |
| `Answer` | Answer-first paragraph |
| `How.{Eyebrow,Title,Description}` | "How it works" section header |
| `How.{Ask,Clarify,Check,Publish}.{Title,Description}` | The four steps from request to publication |
| `Assistant.{Title,Description}` | Assistant rules section header |
| `Assistant.{Design,Readability,Seo,Limits}.{Title,Description}` | What the configured assistant protects and when it escalates |
| `Included.{Title,Description}` | "What your site comes with" header |
| `Included.{Fast,Swiss,Languages,Seo,Ownership}.{Title,Description}` | Site characteristics |
| `Audience.{Title,Description}` | Target audience card |
| `Pricing.{Title,Description,Subscription}` | Pricing header, VAT note, AI subscription note |
| `Pricing.Setup.{Name,Price,Includes,Extra}` | Setup price (from CHF 1'900) and additional language (CHF 400) |
| `Pricing.Hosting.{Name,Price,Includes}` | Hosting and support (CHF 49 per month) |
| `Faq.Title`, `Faq.Q1`–`Faq.Q5`.`{Question,Answer}` | Visible FAQ, also emitted as FAQPage JSON-LD |
| `CTA.{Title,Description,Button}` | Closing call to action (links to `/contact/`) |

Also added: `metadata:pages./products/chat-website.{title,description,keywords}` in all locales. Navbar/mobile menu entries (`app/[locale]/layout.tsx`), the footer label `chatWebsite` (`app/[locale]/shared/footer.tsx`) and the products index card (`app/[locale]/products/page.tsx`) are hard-coded per locale like the other products.
