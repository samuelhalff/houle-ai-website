import Link from "next/link";
import FAQ from "@/src/components/FAQ";
import { getTranslations, type Locale } from "@/src/lib/i18n";
import { getPageMetadata } from "@/src/lib/metadata";
import { Metadata } from "next";
import { headers } from "next/headers";
import { Button } from "@/src/components/ui/button";
import SectionHeading from "@/src/components/site/section-heading";
import Reveal from "@/src/components/motion/reveal";

export async function generateMetadata({
  params,
}: {
  params: { locale: "en" | "fr" | "de" | "es" | "pt" };
}): Promise<Metadata> {
  const locale = params?.locale || "en";
  return await getPageMetadata(locale as Locale, "/");
}

export default async function HomePage({
  params,
}: {
  params: { locale: "en" | "fr" | "de" | "es" | "pt" };
}) {
  const locale = params?.locale || "en";
  const localePrefix = `/${locale}`;
  const nonce = headers().get("x-nonce") || undefined;

  const faqT = await getTranslations(locale as Locale, "faq");
  const faqItems = Array.from({ length: 22 })
    .map((_, i) => i + 1)
    .filter((i) => {
      const q = faqT(`Question${i}`) as string;
      const a = faqT(`Answer${i}`) as string;
      return q && a && q !== `Question${i}` && a !== `Answer${i}`;
    })
    .map((i) => ({
      question: faqT(`Question${i}`) as string,
      answer: faqT(`Answer${i}`) as string,
    }));

  const faqJsonLd =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  const copy = {
    en: {
      eyebrow: "AI Products & Consulting",
      headline: "Private AI built into Microsoft 365.",
      subtext:
        "Swiss-made Office add-ins with AI for Outlook and Word — plus a private GPT that stays in your control. From Geneva to Zurich, we help teams use AI without compromising their data.",
      ctaPrimary: "Get in touch",
      ctaSecondary: "See our products",
      productsEyebrow: "Products",
      productsTitle: "AI that lives inside Microsoft 365",
      productsDesc:
        "Add-ins for the tools your team already has. No new apps, no data leaving Switzerland.",
      card1Label: "AI for Outlook",
      card1Title: "Smarter email, instantly",
      card1Body:
        "Summarize threads, draft replies, and flag action items — directly inside Outlook, with your data staying private.",
      card2Label: "AI for Word",
      card2Title: "Write faster, say more",
      card2Body:
        "Generate, improve, and review documents with AI built directly into Word. No copy-paste, no context switching.",
      card3Label: "Swiss GPT",
      card3Title: "Your private knowledge layer",
      card3Body:
        "A GPT platform hosted in Switzerland, connected to your data, controlled by your team. Build internal assistants your way.",
      servicesEyebrow: "Consulting",
      servicesTitle: "Expert guidance from strategy to production",
      servicesDesc:
        "We help you navigate AI adoption, integrate systems, and deploy solutions that actually work in your Microsoft environment.",
      s1Label: "AI Consulting",
      s1Title: "Custom AI solutions",
      s1Body:
        "From proof-of-concept to full deployment: we design, build, and maintain AI workflows tailored to your operations.",
      s2Label: "Microsoft Consulting",
      s2Title: "Full Microsoft 365 expertise",
      s2Body:
        "Azure, Power Automate, SharePoint, Power BI, SPFx — deep implementation experience across the Microsoft stack.",
      whyEyebrow: "Why houle",
      whyTitle: "Swiss-hosted AI technology",
      whyP1:
        "Our enterprise AI platform runs on Microsoft Azure Switzerland, giving you access to state-of-the-art large language models while meeting strict data residency requirements. Every document processed, every email analyzed, and every workflow automated stays within Swiss borders under your control.",
      whyP2:
        "We build AI solutions with a human-in-the-loop approach — your teams validate AI suggestions before they become final, ensuring accuracy and accountability. Our Office add-ins for Word and Outlook bring intelligent assistance directly into your daily tools without forcing a change in how you work.",
      whyP3:
        "By combining Azure AI services with Power Platform automation, we help organizations stay compliant with nLPD (Swiss Data Protection Act) and GDPR while improving operational efficiency. Our consulting team guides you from initial concept through production deployment.",
    },
    fr: {
      eyebrow: "Produits IA & Conseil",
      headline: "Une IA privée, directement dans Microsoft 365.",
      subtext:
        "Des add-ins Office avec IA pour Outlook et Word — et un GPT privé hébergé en Suisse que vous contrôlez. Nous aidons les équipes à utiliser l'IA sans compromettre leurs données.",
      ctaPrimary: "Nous contacter",
      ctaSecondary: "Voir nos produits",
      productsEyebrow: "Produits",
      productsTitle: "Une IA intégrée à Microsoft 365",
      productsDesc:
        "Des add-ins pour les outils que vos équipes utilisent déjà. Pas de nouvelles apps, pas de données qui quittent la Suisse.",
      card1Label: "IA pour Outlook",
      card1Title: "Des emails plus intelligents",
      card1Body:
        "Résumez les fils de discussion, rédigez des réponses et identifiez les actions — directement dans Outlook, vos données restent privées.",
      card2Label: "IA pour Word",
      card2Title: "Rédigez plus vite, dites plus",
      card2Body:
        "Générez, améliorez et relisez des documents avec une IA intégrée directement dans Word. Sans copier-coller, sans changer d'outil.",
      card3Label: "Swiss GPT",
      card3Title: "Votre couche de connaissance privée",
      card3Body:
        "Une plateforme GPT hébergée en Suisse, connectée à vos données, contrôlée par votre équipe. Créez vos assistants internes à votre façon.",
      servicesEyebrow: "Conseil",
      servicesTitle: "Un accompagnement expert de la stratégie à la production",
      servicesDesc:
        "Nous vous aidons à adopter l'IA, intégrer vos systèmes et déployer des solutions qui fonctionnent vraiment dans votre environnement Microsoft.",
      s1Label: "Conseil IA",
      s1Title: "Solutions IA sur mesure",
      s1Body:
        "Du proof-of-concept au déploiement complet : nous concevons, construisons et maintenons des workflows IA adaptés à vos opérations.",
      s2Label: "Conseil Microsoft",
      s2Title: "Expertise Microsoft 365",
      s2Body:
        "Azure, Power Automate, SharePoint, Power BI, SPFx — une expérience approfondie sur toute la stack Microsoft.",
      whyEyebrow: "Pourquoi houle",
      whyTitle: "Technologie IA hébergée en Suisse",
      whyP1:
        "Notre plateforme IA d'entreprise fonctionne sur Microsoft Azure Suisse, vous donnant accès aux modèles de langage les plus avancés tout en respectant les exigences strictes de résidence des données. Chaque document traité, chaque e-mail analysé et chaque workflow automatisé reste sur le territoire suisse, sous votre contrôle.",
      whyP2:
        "Nous construisons des solutions IA avec une approche human-in-the-loop. Vos équipes valident les suggestions de l'IA avant qu'elles ne deviennent définitives, garantissant précision et responsabilité. Nos add-ins Office pour Word et Outlook apportent une assistance intelligente directement dans vos outils quotidiens, sans bouleverser votre façon de travailler.",
      whyP3:
        "En combinant les services Azure AI avec l'automatisation Power Platform, nous aidons les organisations à rester conformes à la nLPD et au RGPD tout en améliorant leur efficacité opérationnelle. Notre équipe de conseil vous accompagne du concept initial jusqu'au déploiement en production.",
    },
    de: {
      eyebrow: "KI-Produkte & Beratung",
      headline: "Private KI direkt in Microsoft 365.",
      subtext:
        "Schweizer Office-Add-ins mit KI für Outlook und Word — sowie ein privates GPT, das unter Ihrer Kontrolle bleibt. Wir helfen Teams, KI zu nutzen, ohne ihre Daten zu gefährden.",
      ctaPrimary: "Kontakt aufnehmen",
      ctaSecondary: "Unsere Produkte",
      productsEyebrow: "Produkte",
      productsTitle: "KI direkt in Microsoft 365",
      productsDesc:
        "Add-ins für die Tools, die Ihre Teams bereits nutzen. Keine neuen Apps, keine Daten außerhalb der Schweiz.",
      card1Label: "KI für Outlook",
      card1Title: "Intelligentere E-Mails sofort",
      card1Body:
        "Fassen Sie Threads zusammen, verfassen Sie Antworten und markieren Sie Aktionspunkte — direkt in Outlook, Ihre Daten bleiben privat.",
      card2Label: "KI für Word",
      card2Title: "Schneller schreiben, mehr sagen",
      card2Body:
        "Generieren, verbessern und überprüfen Sie Dokumente mit KI direkt in Word. Kein Kopieren, kein Kontextwechsel.",
      card3Label: "Swiss GPT",
      card3Title: "Ihre private Wissensebene",
      card3Body:
        "Eine in der Schweiz gehostete GPT-Plattform, mit Ihren Daten verbunden, von Ihrem Team kontrolliert.",
      servicesEyebrow: "Beratung",
      servicesTitle: "Expertenbegleitung von der Strategie bis zur Produktion",
      servicesDesc:
        "Wir helfen Ihnen bei der KI-Einführung, Systemintegration und dem Einsatz von Lösungen in Ihrer Microsoft-Umgebung.",
      s1Label: "KI-Beratung",
      s1Title: "Maßgeschneiderte KI-Lösungen",
      s1Body:
        "Vom Proof-of-Concept bis zur vollständigen Bereitstellung: Wir entwickeln KI-Workflows für Ihre Prozesse.",
      s2Label: "Microsoft-Beratung",
      s2Title: "Vollständige Microsoft 365-Expertise",
      s2Body:
        "Azure, Power Automate, SharePoint, Power BI, SPFx — tiefgehende Implementierungserfahrung im gesamten Microsoft-Stack.",
      whyEyebrow: "Warum houle",
      whyTitle: "In der Schweiz gehostete KI-Technologie",
      whyP1:
        "Unsere KI-Plattform läuft auf Microsoft Azure Schweiz und bietet Zugang zu modernsten Sprachmodellen bei gleichzeitiger Erfüllung strenger Anforderungen an die Datenresidenz. Jedes Dokument, jede E-Mail und jeder Workflow bleibt innerhalb der Schweizer Grenzen.",
      whyP2:
        "Wir entwickeln KI-Lösungen mit Human-in-the-Loop: Ihre Teams validieren KI-Vorschläge vor der Finalisierung. Unsere Add-ins bringen intelligente Unterstützung direkt in Ihre täglichen Tools.",
      whyP3:
        "Durch Azure AI und Power Platform helfen wir Ihnen, DSG und DSGVO einzuhalten und gleichzeitig die Effizienz zu steigern. Unser Beratungsteam begleitet Sie vom Konzept bis zum Produktionseinsatz.",
    },
    es: {
      eyebrow: "Productos IA & Consultoría",
      headline: "IA privada integrada en Microsoft 365.",
      subtext:
        "Complementos de Office con IA para Outlook y Word — más un GPT privado alojado en Suiza bajo tu control. Ayudamos a los equipos a usar IA sin comprometer sus datos.",
      ctaPrimary: "Contactarnos",
      ctaSecondary: "Ver productos",
      productsEyebrow: "Productos",
      productsTitle: "IA que vive dentro de Microsoft 365",
      productsDesc:
        "Complementos para las herramientas que tu equipo ya usa. Sin nuevas apps, sin datos saliendo de Suiza.",
      card1Label: "IA para Outlook",
      card1Title: "Emails más inteligentes",
      card1Body:
        "Resume hilos, redacta respuestas e identifica acciones — directamente en Outlook, con tus datos privados.",
      card2Label: "IA para Word",
      card2Title: "Escribe más rápido",
      card2Body:
        "Genera, mejora y revisa documentos con IA dentro de Word. Sin copiar y pegar, sin cambiar de herramienta.",
      card3Label: "Swiss GPT",
      card3Title: "Tu capa de conocimiento privado",
      card3Body:
        "Una plataforma GPT alojada en Suiza, conectada a tus datos, controlada por tu equipo.",
      servicesEyebrow: "Consultoría",
      servicesTitle: "Acompañamiento experto de la estrategia a la producción",
      servicesDesc:
        "Te ayudamos a adoptar IA, integrar sistemas y desplegar soluciones en tu entorno Microsoft.",
      s1Label: "Consultoría IA",
      s1Title: "Soluciones IA personalizadas",
      s1Body:
        "De la prueba de concepto al despliegue completo: diseñamos, construimos y mantenemos workflows de IA.",
      s2Label: "Consultoría Microsoft",
      s2Title: "Experiencia Microsoft 365",
      s2Body:
        "Azure, Power Automate, SharePoint, Power BI, SPFx — experiencia profunda en todo el stack de Microsoft.",
      whyEyebrow: "Por qué houle",
      whyTitle: "Tecnología IA alojada en Suiza",
      whyP1:
        "Nuestra plataforma de IA empresarial funciona en Microsoft Azure Suiza, dándote acceso a LLMs de última generación cumpliendo con los requisitos de residencia de datos. Todo permanece dentro de las fronteras suizas bajo tu control.",
      whyP2:
        "Construimos soluciones IA con human-in-the-loop — tus equipos validan sugerencias antes de que sean definitivas. Nuestros add-ins para Word y Outlook llevan asistencia inteligente a tus herramientas diarias.",
      whyP3:
        "Combinando Azure AI con Power Platform, ayudamos a cumplir con nLPD y RGPD mientras mejoramos la eficiencia. Nuestro equipo te guía del concepto al despliegue en producción.",
    },
    pt: {
      eyebrow: "Produtos IA & Consultoria",
      headline: "IA privada integrada no Microsoft 365.",
      subtext:
        "Suplementos do Office com IA para Outlook e Word — mais um GPT privado hospedado na Suíça sob seu controle. Ajudamos equipes a usar IA sem comprometer seus dados.",
      ctaPrimary: "Entre em contato",
      ctaSecondary: "Ver produtos",
      productsEyebrow: "Produtos",
      productsTitle: "IA que vive dentro do Microsoft 365",
      productsDesc:
        "Suplementos para as ferramentas que sua equipe já usa. Sem novos apps, sem dados saindo da Suíça.",
      card1Label: "IA para Outlook",
      card1Title: "Emails mais inteligentes",
      card1Body:
        "Resuma threads, redija respostas e identifique ações — diretamente no Outlook, com seus dados privados.",
      card2Label: "IA para Word",
      card2Title: "Escreva mais rápido",
      card2Body:
        "Gere, melhore e revise documentos com IA dentro do Word. Sem copiar e colar, sem trocar de ferramenta.",
      card3Label: "Swiss GPT",
      card3Title: "Sua camada de conhecimento privado",
      card3Body:
        "Uma plataforma GPT hospedada na Suíça, conectada aos seus dados, controlada pela sua equipe.",
      servicesEyebrow: "Consultoria",
      servicesTitle: "Acompanhamento especializado da estratégia à produção",
      servicesDesc:
        "Ajudamos você a adotar IA, integrar sistemas e implantar soluções no seu ambiente Microsoft.",
      s1Label: "Consultoria IA",
      s1Title: "Soluções IA personalizadas",
      s1Body:
        "Da prova de conceito à implantação completa: projetamos, construímos e mantemos workflows de IA.",
      s2Label: "Consultoria Microsoft",
      s2Title: "Especialização Microsoft 365",
      s2Body:
        "Azure, Power Automate, SharePoint, Power BI, SPFx — experiência profunda em todo o stack Microsoft.",
      whyEyebrow: "Por que houle",
      whyTitle: "Tecnologia IA hospedada na Suíça",
      whyP1:
        "Nossa plataforma de IA empresarial funciona no Microsoft Azure Suíça, com acesso a LLMs de última geração e requisitos rígidos de residência de dados. Tudo permanece dentro das fronteiras suíças sob seu controle.",
      whyP2:
        "Construímos soluções de IA com human-in-the-loop — suas equipes validam sugestões antes de serem definitivas. Nossos suplementos para Word e Outlook trazem assistência inteligente para suas ferramentas diárias.",
      whyP3:
        "Combinando Azure AI com Power Platform, ajudamos a cumprir nLPD e LGPD enquanto melhoramos a eficiência operacional. Nossa equipe o guia do conceito ao deployment.",
    },
  } as const;

  const t = copy[locale] || copy.en;

  return (
    <div className="w-full">
      {faqJsonLd && (
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="abstract-background relative w-full bg-background px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-18 lg:pt-24">
        <div className="mx-auto w-full max-w-[1200px]">
          <Reveal from="bottom">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-brand-hover dark:text-brand">
              {t.eyebrow}
            </p>
            <h1 className="mt-4 max-w-[16ch] text-balance text-5xl font-semibold leading-[0.98] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
              {t.headline}
            </h1>
            <p className="mt-8 max-w-[52ch] text-lg leading-8 text-muted-foreground sm:text-xl">
              {t.subtext}
            </p>
            <div className="mt-10 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link href={`${localePrefix}/contact/`} className="w-full sm:w-auto" prefetch={false}>
                <Button
                  size="lg"
                  className="btn-main-cta w-full rounded-full bg-foreground px-6 text-base text-background sm:w-auto"
                >
                  <span>{t.ctaPrimary}</span>
                </Button>
              </Link>
              <Link href={`${localePrefix}/products/`} className="w-full sm:w-auto" prefetch={false}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="btn-secondary-cta w-full rounded-full px-6 text-base sm:w-auto"
                >
                  <span>{t.ctaSecondary}</span>
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Products ─────────────────────────────────────────────────── */}
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-[1200px] space-y-12">
          <Reveal>
            <SectionHeading
              eyebrow={t.productsEyebrow}
              title={t.productsTitle}
              description={t.productsDesc}
              align="center"
              titleClassName="max-w-[26ch]"
            />
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                label: t.card1Label,
                title: t.card1Title,
                body: t.card1Body,
                href: `${localePrefix}/products/outlook-addin/`,
              },
              {
                label: t.card2Label,
                title: t.card2Title,
                body: t.card2Body,
                href: `${localePrefix}/products/word-addin/`,
              },
              {
                label: t.card3Label,
                title: t.card3Title,
                body: t.card3Body,
                href: `${localePrefix}/products/swiss-gpt/`,
              },
            ].map((card, i) => (
              <Reveal key={card.href} delay={i * 0.08}>
                <Link
                  href={card.href}
                  prefetch={false}
                  className="group flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:border-brand/30 hover:shadow-md"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-hover dark:text-brand">
                    {card.label}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                    {card.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                    {card.body}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-gap group-hover:gap-2.5">
                    Learn more
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────── */}
      <section className="bg-surface-tint/40 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-[1200px] space-y-12">
          <Reveal>
            <SectionHeading
              eyebrow={t.servicesEyebrow}
              title={t.servicesTitle}
              description={t.servicesDesc}
              align="center"
              titleClassName="max-w-[30ch]"
            />
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                label: t.s1Label,
                title: t.s1Title,
                body: t.s1Body,
                href: `${localePrefix}/services/ai-consulting/`,
              },
              {
                label: t.s2Label,
                title: t.s2Title,
                body: t.s2Body,
                href: `${localePrefix}/services/microsoft-consulting/`,
              },
            ].map((card, i) => (
              <Reveal key={card.href} delay={i * 0.1}>
                <Link
                  href={card.href}
                  prefetch={false}
                  className="group flex h-full flex-col rounded-2xl border bg-background p-6 shadow-sm transition-all duration-300 hover:border-brand/30 hover:shadow-md"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-hover dark:text-brand">
                    {card.label}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                    {card.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                    {card.body}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-gap group-hover:gap-2.5">
                    Learn more
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why houle / SEO depth ─────────────────────────────────────── */}
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-[1200px]">
          <Reveal>
            <div className="grid gap-x-14 gap-y-8 lg:grid-cols-[1fr_1.6fr]">
              <div>
                <SectionHeading
                  eyebrow={t.whyEyebrow}
                  title={t.whyTitle}
                  align="left"
                  titleClassName="text-3xl sm:text-4xl"
                />
              </div>
              <div className="space-y-5 rounded-[24px] bg-surface-tint/45 p-6 shadow-sm">
                <p className="text-sm leading-7 text-foreground/80">{t.whyP1}</p>
                <p className="text-sm leading-7 text-foreground/80">{t.whyP2}</p>
                <p className="text-sm leading-7 text-foreground/80">{t.whyP3}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────────── */}
      <section className="px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto w-full max-w-[1200px]">
          <Reveal>
            <div className="rounded-2xl border border-brand/15 bg-brand-soft px-8 py-12 text-center sm:px-12">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {locale === "fr"
                  ? "Prêt à intégrer l'IA dans vos outils Microsoft ?"
                  : locale === "de"
                    ? "Bereit, KI in Ihre Microsoft-Tools zu integrieren?"
                    : locale === "es"
                      ? "¿Listo para integrar IA en tus herramientas Microsoft?"
                      : locale === "pt"
                        ? "Pronto para integrar IA nas suas ferramentas Microsoft?"
                        : "Ready to integrate AI into your Microsoft tools?"}
              </h2>
              <p className="mx-auto mt-4 max-w-[48ch] text-base text-foreground/70">
                {locale === "fr"
                  ? "Discutons de votre situation et voyons comment nos solutions peuvent vous aider."
                  : locale === "de"
                    ? "Lassen Sie uns über Ihre Situation sprechen und wie unsere Lösungen helfen können."
                    : locale === "es"
                      ? "Hablemos de tu situación y cómo nuestras soluciones pueden ayudarte."
                      : locale === "pt"
                        ? "Vamos conversar sobre sua situação e como nossas soluções podem ajudar."
                        : "Let's discuss your setup and how our solutions can help."}
              </p>
              <div className="mt-8 flex justify-center">
                <Link href={`${localePrefix}/contact/`} prefetch={false}>
                  <Button
                    size="lg"
                    className="btn-main-cta rounded-full bg-foreground px-8 text-base text-background"
                  >
                    <span>{t.ctaPrimary}</span>
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      {faqItems.length > 0 && (
        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto w-full max-w-[1200px]">
            <FAQ
              title={faqT("Title") as string}
              subtitle={faqT("Subtitle") as string}
              lastUpdated={faqT("LastUpdated") as string}
              items={faqItems}
            />
          </div>
        </section>
      )}
    </div>
  );
}
