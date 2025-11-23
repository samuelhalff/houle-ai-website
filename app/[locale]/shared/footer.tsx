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
      home: "Home",
      contact: "Contact",
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
      home: "Accueil",
      contact: "Contact",
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
      home: "Startseite",
      contact: "Kontakt",
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
      home: "Inicio",
      contact: "Contacto",
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
      home: "Início",
      contact: "Contato",
      tagline: "IA privada integrada nas ferramentas Microsoft que você já usa."
    }
  };
  
  const t = labels[locale as keyof typeof labels] || labels.en;
  
  return (
    <footer className="mt-16 border-t bg-background text-foreground">
      <div className="mx-auto max-w-[var(--breakpoint-xl)] px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
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
              >
                {t.outlookAddin}
              </a>
              <a
                href={`${localePrefix}/products/word-addin`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t.wordAddin}
              </a>
              <a
                href={`${localePrefix}/products/swiss-gpt`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
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
              >
                {t.aiConsulting}
              </a>
              <a
                href={`${localePrefix}/services/microsoft-consulting`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t.microsoftConsulting}
              </a>
            </nav>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">{t.home}</p>
            <nav className="flex flex-col gap-2">
              <a
                href={`${localePrefix}/`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t.home}
              </a>
              <a
                href={`${localePrefix}/ressources`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t.resources}
              </a>
              <a
                href={`${localePrefix}/contact`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t.contact}
              </a>
            </nav>
          </div>
        </div>
      </div>
      
      <div className="mx-auto max-w-[var(--breakpoint-xl)] border-t px-6 py-6">
        <p className="text-xs text-muted-foreground/60">
          houle.ai is a brand of West-Bay SA group, 19 Pré-Roset, 1294 Genthod, Switzerland.
        </p>
      </div>
    </footer>
  );
}
