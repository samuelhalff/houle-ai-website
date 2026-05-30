import Link from "next/link";
import { Separator } from "@/src/components/ui/separator";
import { WhatsAppIcon } from "@/src/components/icons/WhatsAppIcon";
import { getWhatsAppContent, getWhatsAppLink } from "@/src/lib/whatsapp";
import { isLocale, type Locale } from "@/src/lib/i18n-locales";
import CookieSettingsLink from "@/src/components/CookieSettingsLink";

export default function Footer({ locale }: { locale?: string }) {
  const localePrefix = locale ? `/${locale}` : "/en";
  const activeLocale: Locale = locale && isLocale(locale) ? locale : "en";
  const whatsapp = getWhatsAppContent(activeLocale);
  const whatsappLink = getWhatsAppLink(activeLocale);

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
      cookieSettings: "Cookie Settings",
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
      cookieSettings: "Paramètres cookies",
      tagline: "IA privée intégrée aux outils Microsoft que vous utilisez déjà.",
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
      cookieSettings: "Cookie-Einstellungen",
      tagline: "Private KI integriert in die Microsoft-Tools, die Sie bereits nutzen.",
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
      cookieSettings: "Ajustes de cookies",
      tagline: "IA privada integrada en las herramientas de Microsoft que ya usas.",
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
      cookieSettings: "Configurações de cookies",
      tagline: "IA privada integrada nas ferramentas Microsoft que você já usa.",
    },
  };

  const t = labels[locale as keyof typeof labels] || labels.en;

  const sectionHeadingClass =
    "text-sm font-semibold uppercase tracking-[0.18em] text-brand-hover dark:text-brand";
  const linkClass =
    "text-sm text-muted-foreground transition-colors hover:text-foreground";

  return (
    <footer className="mt-12 bg-surface-tint/40 text-foreground xs:mt-20" role="contentinfo">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-x-8 gap-y-10 px-5 py-12 sm:grid-cols-2 sm:px-8 md:grid-cols-3 lg:grid-cols-[200px_repeat(4,1fr)]">

        {/* Brand column */}
        <div className="space-y-4 lg:col-span-1">
          <p className="text-lg font-semibold tracking-tight">
            <span className="text-brand">houle</span>
            <span className="text-foreground">.ai</span>
          </p>
          <p className="max-w-[22ch] text-sm text-muted-foreground leading-relaxed">{t.tagline}</p>
          <div className="space-y-2">
            <a
              href="mailto:contact@houle.ai"
              className={linkClass + " block hover:text-brand"}
            >
              contact@houle.ai
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              aria-label={whatsapp.floatingAriaLabel}
            >
              <WhatsAppIcon className="size-4 text-[#25d366]" />
              {whatsapp.footerLabel}
            </a>
            <a
              href="https://www.linkedin.com/company/houle-ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Follow houle on LinkedIn"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          </div>
        </div>

        {/* Products */}
        <nav aria-label={t.products} className="min-w-0">
          <p className={sectionHeadingClass}>{t.products}</p>
          <ul className="mt-5 space-y-3">
            <li>
              <Link href={`${localePrefix}/products/outlook-addin/`} className={linkClass} prefetch={false} locale={locale}>
                {t.outlookAddin}
              </Link>
            </li>
            <li>
              <Link href={`${localePrefix}/products/word-addin/`} className={linkClass} prefetch={false} locale={locale}>
                {t.wordAddin}
              </Link>
            </li>
            <li>
              <Link href={`${localePrefix}/products/swiss-gpt/`} className={linkClass} prefetch={false} locale={locale}>
                {t.swissGpt}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Services */}
        <nav aria-label={t.services} className="min-w-0">
          <p className={sectionHeadingClass}>{t.services}</p>
          <ul className="mt-5 space-y-3">
            <li>
              <Link href={`${localePrefix}/services/ai-consulting/`} className={linkClass} prefetch={false} locale={locale}>
                {t.aiConsulting}
              </Link>
            </li>
            <li>
              <Link href={`${localePrefix}/services/microsoft-consulting/`} className={linkClass} prefetch={false} locale={locale}>
                {t.microsoftConsulting}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Company */}
        <nav aria-label={t.company} className="min-w-0">
          <p className={sectionHeadingClass}>{t.company}</p>
          <ul className="mt-5 space-y-3">
            <li>
              <Link href={`${localePrefix}/`} className={linkClass} prefetch={false} locale={locale}>
                {t.home}
              </Link>
            </li>
            <li>
              <Link href={`${localePrefix}/ressources/`} className={linkClass} prefetch={false} locale={locale}>
                {t.resources}
              </Link>
            </li>
            <li>
              <Link href={`${localePrefix}/contact/`} className={linkClass} prefetch={false} locale={locale}>
                {t.contact}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Legal */}
        <nav aria-label={t.legal} className="min-w-0">
          <p className={sectionHeadingClass}>{t.legal}</p>
          <ul className="mt-5 space-y-3">
            <li>
              <Link href={`${localePrefix}/legal/privacy/`} className={linkClass} prefetch={false} locale={locale}>
                {t.privacyPolicy}
              </Link>
            </li>
            <li>
              <Link href={`${localePrefix}/legal/terms/`} className={linkClass} prefetch={false} locale={locale}>
                {t.termsOfService}
              </Link>
            </li>
            <li>
              <Link href={`${localePrefix}/legal/cookies/`} className={linkClass} prefetch={false} locale={locale}>
                {t.cookiesPolicy}
              </Link>
            </li>
            <li>
              <CookieSettingsLink className={linkClass + " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"}>
                {t.cookieSettings}
              </CookieSettingsLink>
            </li>
          </ul>
        </nav>
      </div>

      <Separator />
      <div className="mx-auto flex max-w-[1200px] flex-col-reverse items-center justify-between gap-x-2 gap-y-5 px-5 py-8 sm:flex-row sm:px-8">
        <span className="w-full text-center text-sm text-muted-foreground xs:text-start">
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
          houle — A brand of West-Bay SA, Genthod (Genève)
        </span>
      </div>
    </footer>
  );
}
