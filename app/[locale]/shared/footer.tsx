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
      tagline: "Private AI built into the Microsoft tools you already use."
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
      tagline: "IA privée intégrée aux outils Microsoft que vous utilisez déjà."
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
      tagline: "Private KI integriert in die Microsoft-Tools, die Sie bereits nutzen."
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
      tagline: "IA privada integrada en las herramientas de Microsoft que ya usas."
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
      tagline: "IA privada integrada nas ferramentas Microsoft que você já usa."
    }
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
            <a
              href="mailto:contact@houle.ai"
              className="inline-block text-sm text-primary hover:underline"
              aria-label="Email contact@houle.ai"
            >
              contact@houle.ai
            </a>
          </div>

          {/* Products */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">{t.products}</p>
            <nav className="flex flex-col gap-2">
              <a
                href={`${localePrefix}/products/outlook-addin`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Navigate to ${t.outlookAddin} product page`}
              >
                {t.outlookAddin}
              </a>
              <a
                href={`${localePrefix}/products/word-addin`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Navigate to ${t.wordAddin} product page`}
              >
                {t.wordAddin}
              </a>
              <a
                href={`${localePrefix}/products/swiss-gpt`}
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
                href={`${localePrefix}/services/ai-consulting`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Navigate to ${t.aiConsulting} service page`}
              >
                {t.aiConsulting}
              </a>
              <a
                href={`${localePrefix}/services/microsoft-consulting`}
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
                href={`${localePrefix}/ressources`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Navigate to ${t.resources}`}
              >
                {t.resources}
              </a>
              <a
                href={`${localePrefix}/contact`}
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
                href={`${localePrefix}/legal/privacy`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Read our ${t.privacyPolicy}`}
              >
                {t.privacyPolicy}
              </a>
              <a
                href={`${localePrefix}/legal/terms`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Read our ${t.termsOfService}`}
              >
                {t.termsOfService}
              </a>
              <a
                href={`${localePrefix}/legal/cookies`}
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
          houle.ai is a brand of West-Bay SA, 19 Pré-Roset, 1294 Genthod, Switzerland.
        </p>
      </div>
    </footer>
  );
}
