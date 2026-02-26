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
