export default function Footer({ locale }: { locale?: string }) {
  const localePrefix = locale ? `/${locale}` : "/en";

  const labels = {
    en: {
      products: "Products",
      outlookAddin: "AI for Outlook",
      wordAddin: "AI for Word",
      swissGpt: "Swiss GPT",
      services: "Services",
      aiConsulting: "AI Consulting",
      microsoftConsulting: "Microsoft Consulting",
      resources: "Resources",
      company: "Company",
      home: "Home",
      contact: "Contact",
      legal: "Legal",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      cookiesPolicy: "Cookies Policy",
      tagline: "Private AI built into the Microsoft tools you already use.",
    },
    fr: {
      products: "Produits",
      outlookAddin: "IA pour Outlook",
      wordAddin: "IA pour Word",
      swissGpt: "Swiss GPT",
      services: "Services",
      aiConsulting: "Conseil IA",
      microsoftConsulting: "Conseil Microsoft",
      resources: "Ressources",
      company: "Entreprise",
      home: "Accueil",
      contact: "Contact",
      legal: "Mentions légales",
      privacyPolicy: "Politique de confidentialité",
      termsOfService: "Conditions d'utilisation",
      cookiesPolicy: "Politique des cookies",
      tagline:
        "IA privée intégrée aux outils Microsoft que vous utilisez déjà.",
    },
    de: {
      products: "Produkte",
      outlookAddin: "KI für Outlook",
      wordAddin: "KI für Word",
      swissGpt: "Swiss GPT",
      services: "Dienstleistungen",
      aiConsulting: "KI-Beratung",
      microsoftConsulting: "Microsoft-Beratung",
      resources: "Ressourcen",
      company: "Unternehmen",
      home: "Startseite",
      contact: "Kontakt",
      legal: "Rechtliches",
      privacyPolicy: "Datenschutzrichtlinie",
      termsOfService: "Nutzungsbedingungen",
      cookiesPolicy: "Cookie-Richtlinie",
      tagline:
        "Private KI integriert in die Microsoft-Tools, die Sie bereits nutzen.",
    },
    es: {
      products: "Productos",
      outlookAddin: "IA para Outlook",
      wordAddin: "IA para Word",
      swissGpt: "Swiss GPT",
      services: "Servicios",
      aiConsulting: "Consultoría IA",
      microsoftConsulting: "Consultoría Microsoft",
      resources: "Recursos",
      company: "Empresa",
      home: "Inicio",
      contact: "Contacto",
      legal: "Legal",
      privacyPolicy: "Política de privacidad",
      termsOfService: "Términos de servicio",
      cookiesPolicy: "Política de cookies",
      tagline:
        "IA privada integrada en las herramientas de Microsoft que ya usas.",
    },
    pt: {
      products: "Produtos",
      outlookAddin: "IA para Outlook",
      wordAddin: "IA para Word",
      swissGpt: "Swiss GPT",
      services: "Serviços",
      aiConsulting: "Consultoria IA",
      microsoftConsulting: "Consultoria Microsoft",
      resources: "Recursos",
      company: "Empresa",
      home: "Início",
      contact: "Contato",
      legal: "Legal",
      privacyPolicy: "Política de privacidade",
      termsOfService: "Termos de serviço",
      cookiesPolicy: "Política de cookies",
      tagline:
        "IA privada integrada nas ferramentas Microsoft que você já usa.",
    },
  };

  const t = labels[locale as keyof typeof labels] || labels.en;

  return (
    <footer className="mt-16 border-t bg-background text-foreground">
      <div className="mx-auto max-w-[var(--breakpoint-xl)] px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {/* Company Info */}
          <div className="space-y-3 lg:col-span-2">
            <p className="text-lg font-semibold">houle.ai</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t.tagline}
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:contact@houle.ai"
                className="inline-block text-sm text-primary hover:underline"
                aria-label="Email contact@houle.ai"
              >
                contact@houle.ai
              </a>
              <a
                href="https://www.linkedin.com/company/houle-ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                aria-label="Follow houle on LinkedIn"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">{t.products}</p>
            <nav className="flex flex-col gap-2">
              <a
                href={`${localePrefix}/products/outlook-addin/`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Navigate to ${t.outlookAddin} product page`}
              >
                {t.outlookAddin}
              </a>
              <a
                href={`${localePrefix}/products/word-addin/`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Navigate to ${t.wordAddin} product page`}
              >
                {t.wordAddin}
              </a>
              <a
                href={`${localePrefix}/products/swiss-gpt/`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Navigate to ${t.swissGpt} product page`}
              >
                {t.swissGpt}
              </a>
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">{t.services}</p>
            <nav className="flex flex-col gap-2">
              <a
                href={`${localePrefix}/services/ai-consulting/`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Navigate to ${t.aiConsulting} service page`}
              >
                {t.aiConsulting}
              </a>
              <a
                href={`${localePrefix}/services/microsoft-consulting/`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Navigate to ${t.microsoftConsulting} service page`}
              >
                {t.microsoftConsulting}
              </a>
            </nav>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">{t.company}</p>
            <nav className="flex flex-col gap-2">
              <a
                href={`${localePrefix}/`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Navigate to ${t.home}`}
              >
                {t.home}
              </a>
              <a
                href={`${localePrefix}/ressources/`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Navigate to ${t.resources}`}
              >
                {t.resources}
              </a>
              <a
                href={`${localePrefix}/contact/`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Navigate to ${t.contact} page`}
              >
                {t.contact}
              </a>
            </nav>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">{t.legal}</p>
            <nav className="flex flex-col gap-2">
              <a
                href={`${localePrefix}/legal/privacy/`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Read our ${t.privacyPolicy}`}
              >
                {t.privacyPolicy}
              </a>
              <a
                href={`${localePrefix}/legal/terms/`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Read our ${t.termsOfService}`}
              >
                {t.termsOfService}
              </a>
              <a
                href={`${localePrefix}/legal/cookies/`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Read our ${t.cookiesPolicy}`}
              >
                {t.cookiesPolicy}
              </a>
            </nav>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--breakpoint-xl)] border-t px-6 py-6">
        <p className="text-xs text-muted-foreground">
          houle.ai is a brand of West-Bay SA, 19 Pré-Roset, 1294 Genthod,
          Switzerland.
        </p>
      </div>
    </footer>
  );
}
