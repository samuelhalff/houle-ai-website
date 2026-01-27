import Link from "next/link";
import FAQ from "@/src/components/FAQ";
import { getTranslations, type Locale } from "@/src/lib/i18n";
import { getPageMetadata } from "@/src/lib/metadata";
import { Metadata } from "next";
import { headers } from "next/headers";

export async function generateMetadata({
  params,
}: {
  params: { locale: "en" | "fr" | "de" | "es" | "pt" };
}): Promise<Metadata> {
  const locale = params?.locale || "en";

  const titles: Record<string, string> = {
    en: "houle | Private AI for Microsoft 365",
    fr: "houle | IA Privée pour Microsoft 365",
    de: "houle | Private KI für Microsoft 365",
    es: "houle | IA Privada para Microsoft 365",
    pt: "houle | IA Privada para Microsoft 365",
  };

  const descriptions: Record<string, string> = {
    en: "houle brings private AI into Microsoft 365 with add-ins and GPT hosted in Switzerland.",
    fr: "houle apporte l'IA privée dans Microsoft 365 avec des add-ins et un GPT hébergé en Suisse.",
    de: "houle bringt private KI in Microsoft 365 mit Add-Ins und GPT gehostet in der Schweiz.",
    es: "houle trae IA privada a Microsoft 365 con complementos y GPT alojado en Suiza.",
    pt: "houle traz IA privada para o Microsoft 365 com complementos e GPT hospedado na Suíça.",
  };

  const baseMetadata = await getPageMetadata(locale as Locale, "/");

  return {
    ...baseMetadata,
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
  };
}

export default async function HomePage({
  params,
}: {
  params: { locale: "en" | "fr" | "de" | "es" | "pt" };
}) {
  const locale = params?.locale || "en";
  const localePrefix = `/${locale}`;
  const nonce = headers().get("x-nonce") || undefined;

  // Load FAQ data
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

  // Generate FAQ structured data for Google Search
  const faqJsonLd = faqItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  } : null;

  const copy = {
    en: {
      badge: "AI Products & Consulting for Microsoft 365",
      tagline: "houle — AI Solutions for Modern Business",
      headline:
        "Transform your business with AI products and expert consulting.",
      subtext:
        "Based in the Lake Geneva region, we offer Swiss-made Office add-ins with AI for Microsoft 365 and professional consulting services. From ready-to-use products to custom AI solutions, we help businesses across Geneva, Lausanne, Bern, Zurich, and Valais leverage AI while keeping data private and secure.",
      highlights: [
        "Office add-ins with AI for Microsoft 365",
        "AI & Microsoft 365 consulting services",
        "Swiss-hosted, privacy-first solutions",
      ],
      productsLabel: "Products",
      productsTitle: "AI Products for Microsoft 365",
      productsBody:
        "Office add-ins with AI that blend into Outlook and Word. Pair them with a Swiss-hosted GPT that connects to your data, keeps it in your control, and keeps everyday work simple. Ready to use, built for privacy.",
      consultingLabel: "Consulting",
      consultingTitle: "Expert AI & Microsoft Consulting",
      consultingBody:
        "Custom AI solutions, Microsoft 365 optimization, and strategic consulting. We help you implement AI, integrate systems, and transform workflows. From proof-of-concept to production deployment.",
      securityLabel: "Security & Privacy",
      securityTitle: "Trusted by design",
      securityBody:
        "Built with data privacy first. Your content stays where it belongs, conversations are protected, and admins keep the switches for what is shared and what is not.",
      ctaTitle: "Ready to transform your business with AI?",
      ctaText:
        "Let's discuss how our AI solutions can enhance your Microsoft 365 environment while keeping your data secure in Switzerland.",
      ctaButton: "Get in touch",
      techExpertiseTitle: "Swiss-hosted AI technology",
      techExpertiseP1:
        "Our enterprise AI platform runs on Microsoft Azure Switzerland, giving you access to state-of-the-art large language models while meeting strict data residency requirements. Every document processed, every email analyzed, and every workflow automated stays within Swiss borders under your control.",
      techExpertiseP2:
        "We build AI solutions with a human-in-the-loop approach. This means your teams validate AI suggestions before they become final, ensuring accuracy and accountability. Our Office add-ins for Word and Outlook bring intelligent assistance directly into your daily tools without forcing a change in how you work.",
      techExpertiseP3:
        "By combining Azure AI services with Power Platform automation, we help organizations improve operational efficiency while staying compliant with nLPD (Swiss Data Protection Act) and GDPR. Whether you need a private GPT for internal knowledge, document analysis, or custom workflows, our consulting team guides you from initial concept through production deployment.",
    },
    fr: {
      badge: "IA suisse pour Microsoft 365",
      tagline: "houle — Une IA privée, directement dans Microsoft 365",
      headline: "Une IA intégrée à vos outils Microsoft, qui reste privée.",
      subtext:
        "Nous créons des add-ins Office avec IA pour Microsoft 365, intégrés directement dans Outlook et Word, ainsi qu'un GPT hébergé en Suisse que vous contrôlez. Il fonctionne avec vos données, suit vos règles et protège chaque échange.",
      highlights: [
        "Add-ins Office avec IA pour les apps Microsoft 365 que vous utilisez déjà",
        "GPT hébergé en Suisse, pensé pour la confidentialité",
        "Vos données d’entreprise restent sous votre contrôle",
      ],
      productsLabel: "Produits",
      productsTitle: "Conçu pour Microsoft 365",
      productsBody:
        "Des add-ins Office avec IA qui s'intègrent aux outils que vos équipes ouvrent déjà—Outlook et Word d'abord. À associer à un GPT hébergé en Suisse qui se connecte à vos données, les garde sous contrôle et simplifie le quotidien.",
      consultingLabel: "Conseil",
      consultingTitle: "Conseil Expert en IA & Microsoft",
      consultingBody:
        "Solutions IA personnalisées, optimisation Microsoft 365 et conseil stratégique. Nous vous aidons à implémenter l'IA, intégrer les systèmes et transformer les flux de travail. Du proof-of-concept au déploiement en production.",
      securityLabel: "Sécurité & Confidentialité",
      securityTitle: "Fiable par conception",
      securityBody:
        "Conçu avec la confidentialité en premier. Vos contenus restent à leur place, les échanges sont protégés et les administrateurs gardent la main sur ce qui est partagé ou non.",
      ctaTitle: "Prêt à transformer votre entreprise avec l'IA ?",
      ctaText:
        "Discutons de la manière dont nos solutions IA peuvent améliorer votre environnement Microsoft 365 tout en gardant vos données sécurisées en Suisse.",
      ctaButton: "Nous contacter",
      techExpertiseTitle: "Une technologie IA hébergée en Suisse",
      techExpertiseP1:
        "Notre plateforme IA d'entreprise fonctionne sur Microsoft Azure Suisse, vous donnant accès aux modèles de langage les plus avancés tout en respectant les exigences strictes de résidence des données. Chaque document traité, chaque e-mail analysé et chaque workflow automatisé reste sur le territoire suisse, sous votre contrôle.",
      techExpertiseP2:
        "Nous construisons des solutions IA avec une approche « human-in-the-loop ». Vos équipes valident les suggestions de l'IA avant qu'elles ne deviennent définitives, garantissant précision et responsabilité. Nos add-ins Office pour Word et Outlook apportent une assistance intelligente directement dans vos outils quotidiens, sans bouleverser votre façon de travailler.",
      techExpertiseP3:
        "En combinant les services Azure AI avec l'automatisation Power Platform, nous aidons les organisations à améliorer leur efficacité opérationnelle tout en restant conformes à la nLPD (loi suisse sur la protection des données) et au RGPD. Que vous ayez besoin d'un GPT privé pour vos connaissances internes, d'analyse documentaire ou de workflows personnalisés, notre équipe de conseil vous accompagne du concept initial jusqu'au déploiement en production.",
    },
    de: {
      badge: "KI-Produkte & Beratung für Microsoft 365",
      tagline: "houle — KI-Lösungen für Moderne Unternehmen",
      headline:
        "Transformieren Sie Ihr Unternehmen mit KI-Produkten und Expertenberatung.",
      subtext:
        "Mit Sitz in der Genferseeregion bieten wir in der Schweiz entwickelte Office-Add-Ins mit KI für Microsoft 365 und professionelle Beratungsdienstleistungen. Von gebrauchsfertigen Produkten bis zu massgeschneiderten KI-Lösungen helfen wir Unternehmen in Genf, Lausanne, Bern, Zürich und Wallis, KI zu nutzen und dabei Daten privat und sicher zu halten.",
      highlights: [
        "Office-Add-Ins mit KI für Microsoft 365",
        "KI & Microsoft 365 Beratungsdienstleistungen",
        "Schweizer Lösungen, Datenschutz zuerst",
      ],
      productsLabel: "Produkte",
      productsTitle: "KI-Produkte für Microsoft 365",
      productsBody:
        "Office-Add-Ins mit KI, die sich in Outlook und Word integrieren. Kombinieren Sie sie mit einem in der Schweiz gehosteten GPT, der sich mit Ihren Daten verbindet, sie unter Kontrolle hält und die tägliche Arbeit vereinfacht. Sofort einsatzbereit, für Datenschutz entwickelt.",
      consultingLabel: "Beratung",
      consultingTitle: "Experten KI & Microsoft Beratung",
      consultingBody:
        "Massgeschneiderte KI-Lösungen, Microsoft 365-Optimierung und strategische Beratung. Wir helfen Ihnen bei der Implementierung von KI, der Integration von Systemen und der Transformation von Workflows. Vom Proof-of-Concept bis zur Produktionsbereitstellung.",
      securityLabel: "Sicherheit & Datenschutz",
      securityTitle: "Vertrauenswürdig nach Design",
      securityBody:
        "Entwickelt mit Datenschutz an erster Stelle. Ihre Inhalte bleiben, wo sie hingehören, Gespräche sind geschützt und Administratoren behalten die Kontrolle darüber, was geteilt wird und was nicht.",
      ctaTitle: "Bereit, Ihr Unternehmen mit KI zu transformieren?",
      ctaText:
        "Lassen Sie uns besprechen, wie unsere KI-Lösungen Ihre Microsoft 365-Umgebung verbessern können, während Ihre Daten sicher in der Schweiz bleiben.",
      ctaButton: "Kontakt aufnehmen",
      techExpertiseTitle: "In der Schweiz gehostete KI-Technologie",
      techExpertiseP1:
        "Unsere KI-Plattform für Unternehmen läuft auf Microsoft Azure Schweiz und bietet Ihnen Zugang zu modernsten Sprachmodellen bei gleichzeitiger Erfüllung strenger Anforderungen an die Datenresidenz. Jedes verarbeitete Dokument, jede analysierte E-Mail und jeder automatisierte Workflow bleibt innerhalb der Schweizer Grenzen unter Ihrer Kontrolle.",
      techExpertiseP2:
        "Wir entwickeln KI-Lösungen mit einem Human-in-the-Loop-Ansatz. Das bedeutet, dass Ihre Teams KI-Vorschläge validieren, bevor sie endgültig werden, was Genauigkeit und Verantwortlichkeit gewährleistet. Unsere Office-Add-Ins für Word und Outlook bringen intelligente Unterstützung direkt in Ihre täglichen Werkzeuge, ohne Ihre Arbeitsweise zu verändern.",
      techExpertiseP3:
        "Durch die Kombination von Azure AI-Diensten mit Power Platform-Automatisierung helfen wir Organisationen, ihre betriebliche Effizienz zu verbessern und gleichzeitig die Einhaltung von DSG (Schweizer Datenschutzgesetz) und DSGVO sicherzustellen. Ob Sie einen privaten GPT für internes Wissen, Dokumentenanalyse oder benutzerdefinierte Workflows benötigen – unser Beratungsteam begleitet Sie vom ersten Konzept bis zur Produktionsbereitstellung.",
    },
    es: {
      badge: "Productos IA & Consultoría para Microsoft 365",
      tagline: "houle — Soluciones IA para Empresas Modernas",
      headline: "Transforma tu empresa con productos IA y consultoría experta.",
      subtext:
        "Con sede en la región del Lago Lemán, ofrecemos complementos de Office con IA para Microsoft 365 fabricados en Suiza y servicios de consultoría profesional. Desde productos listos para usar hasta soluciones IA personalizadas, ayudamos a empresas en Ginebra, Lausana, Berna, Zúrich y Valais a aprovechar la IA manteniendo los datos privados y seguros.",
      highlights: [
        "Complementos de Office con IA para Microsoft 365",
        "Servicios de consultoría en IA & Microsoft 365",
        "Soluciones suizas, privacidad primero",
      ],
      productsLabel: "Productos",
      productsTitle: "Productos IA para Microsoft 365",
      productsBody:
        "Complementos de Office con IA que se integran en Outlook y Word. Combínalos con un GPT alojado en Suiza que se conecta a tus datos, los mantiene bajo tu control y simplifica el trabajo diario. Listos para usar, diseñados para privacidad.",
      consultingLabel: "Consultoría",
      consultingTitle: "Consultoría Experta en IA & Microsoft",
      consultingBody:
        "Soluciones IA personalizadas, optimización de Microsoft 365 y consultoría estratégica. Te ayudamos a implementar IA, integrar sistemas y transformar flujos de trabajo. Desde prueba de concepto hasta implementación en producción.",
      securityLabel: "Seguridad & Privacidad",
      securityTitle: "Confiable por diseño",
      securityBody:
        "Desarrollado con la privacidad de datos primero. Tu contenido permanece donde debe estar, las conversaciones están protegidas y los administradores mantienen el control sobre qué se comparte y qué no.",
      ctaTitle: "¿Listo para transformar tu empresa con IA?",
      ctaText:
        "Hablemos sobre cómo nuestras soluciones de IA pueden mejorar tu entorno Microsoft 365 manteniendo tus datos seguros en Suiza.",
      ctaButton: "Ponerse en contacto",
      techExpertiseTitle: "Tecnología IA alojada en Suiza",
      techExpertiseP1:
        "Nuestra plataforma de IA empresarial funciona en Microsoft Azure Suiza, dándote acceso a modelos de lenguaje de última generación mientras cumples con los estrictos requisitos de residencia de datos. Cada documento procesado, cada correo analizado y cada flujo de trabajo automatizado permanece dentro de las fronteras suizas bajo tu control.",
      techExpertiseP2:
        "Construimos soluciones de IA con un enfoque human-in-the-loop. Esto significa que tus equipos validan las sugerencias de la IA antes de que sean definitivas, garantizando precisión y responsabilidad. Nuestros complementos de Office para Word y Outlook llevan asistencia inteligente directamente a tus herramientas diarias sin cambiar tu forma de trabajar.",
      techExpertiseP3:
        "Al combinar los servicios de Azure AI con la automatización de Power Platform, ayudamos a las organizaciones a mejorar la eficiencia operativa mientras cumplen con la nLPD (Ley Suiza de Protección de Datos) y el RGPD. Ya sea que necesites un GPT privado para conocimiento interno, análisis de documentos o flujos de trabajo personalizados, nuestro equipo de consultoría te guía desde el concepto inicial hasta el despliegue en producción.",
    },
    pt: {
      badge: "Produtos IA & Consultoria para Microsoft 365",
      tagline: "houle — Soluções IA para Empresas Modernas",
      headline:
        "Transforme sua empresa com produtos IA e consultoria especializada.",
      subtext:
        "Sediados na região do Lago Lemano, oferecemos suplementos do Office com IA para Microsoft 365 fabricados na Suíça e serviços de consultoria profissional. De produtos prontos para uso a soluções IA personalizadas, ajudamos empresas em Genebra, Lausanne, Berna, Zurique e Valais a aproveitar IA mantendo os dados privados e seguros.",
      highlights: [
        "Suplementos do Office com IA para Microsoft 365",
        "Serviços de consultoria em IA & Microsoft 365",
        "Soluções suíças, privacidade primeiro",
      ],
      productsLabel: "Produtos",
      productsTitle: "Produtos IA para Microsoft 365",
      productsBody:
        "Suplementos do Office com IA que se integram ao Outlook e Word. Combine-os com um GPT hospedado na Suíça que se conecta aos seus dados, os mantém sob seu controle e simplifica o trabalho diário. Prontos para usar, projetados para privacidade.",
      consultingLabel: "Consultoria",
      consultingTitle: "Consultoria Especializada em IA & Microsoft",
      consultingBody:
        "Soluções IA personalizadas, otimização do Microsoft 365 e consultoria estratégica. Ajudamos você a implementar IA, integrar sistemas e transformar fluxos de trabalho. Da prova de conceito à implantação em produção.",
      securityLabel: "Segurança & Privacidade",
      securityTitle: "Confiável por design",
      securityBody:
        "Desenvolvido com privacidade de dados em primeiro lugar. Seu conteúdo permanece onde deve estar, conversas são protegidas e administradores mantêm o controle sobre o que é compartilhado e o que não é.",
      ctaTitle: "Pronto para transformar sua empresa com IA?",
      ctaText:
        "Vamos discutir como nossas soluções de IA podem aprimorar seu ambiente Microsoft 365 mantendo seus dados seguros na Suíça.",
      ctaButton: "Entre em contato",
      techExpertiseTitle: "Tecnologia IA hospedada na Suíça",
      techExpertiseP1:
        "Nossa plataforma de IA empresarial funciona no Microsoft Azure Suíça, dando acesso a modelos de linguagem de última geração enquanto atende aos rigorosos requisitos de residência de dados. Cada documento processado, cada e-mail analisado e cada fluxo de trabalho automatizado permanece dentro das fronteiras suíças sob seu controle.",
      techExpertiseP2:
        "Construímos soluções de IA com uma abordagem human-in-the-loop. Isso significa que suas equipes validam as sugestões da IA antes de se tornarem definitivas, garantindo precisão e responsabilidade. Nossos suplementos do Office para Word e Outlook trazem assistência inteligente diretamente para suas ferramentas diárias sem mudar sua forma de trabalhar.",
      techExpertiseP3:
        "Ao combinar os serviços de Azure AI com a automação da Power Platform, ajudamos organizações a melhorar a eficiência operacional enquanto permanecem em conformidade com a nLPD (Lei Suíça de Proteção de Dados) e o RGPD. Seja você precisando de um GPT privado para conhecimento interno, análise de documentos ou fluxos de trabalho personalizados, nossa equipe de consultoria o guia do conceito inicial até a implantação em produção.",
    },
  } as const;

  const t = copy[locale] || copy.en;

  return (
    <div className="max-w-[1080px] mx-auto w-full px-6 pb-12 pt-10 space-y-14">
      {/* FAQ Structured Data for Google Search */}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/[0.08] via-accent/[0.03] to-background p-8 sm:p-12 shadow-[0_20px_70px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.3)]">
        <div className="absolute -left-16 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl" />
        <div className="absolute -right-20 -bottom-28 h-72 w-72 rounded-full bg-gradient-to-tl from-accent/25 to-accent/5 blur-3xl" />
        <div className="relative space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 text-sm font-medium text-primary">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            {t.badge}
          </div>
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
              {t.tagline}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.7rem] font-bold leading-tight tracking-tight">
              {t.headline}
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              {t.subtext}
            </p>
          </div>
          <div className="grid gap-4 mt-2">
            {t.highlights.map((item, index) => (
              <div
                key={item}
                className="group relative flex items-start gap-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-4 transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {index === 0 && (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  )}
                  {index === 1 && (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  )}
                  {index === 2 && (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground leading-relaxed">
                    {item}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="group rounded-2xl border bg-gradient-to-br from-primary/[0.06] via-primary/[0.03] to-card p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/30">
          <p className="text-sm font-semibold text-primary uppercase tracking-[0.14em]">
            {t.productsLabel}
          </p>
          <h2 className="mt-2 text-xl font-bold">{t.productsTitle}</h2>
          <p className="mt-3 text-muted-foreground">{t.productsBody}</p>
        </div>
        <div className="group rounded-2xl border bg-gradient-to-br from-blue-500/[0.06] via-blue-500/[0.03] to-card p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-500/30">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-[0.14em]">
            {t.consultingLabel}
          </p>
          <h2 className="mt-2 text-xl font-bold">{t.consultingTitle}</h2>
          <p className="mt-3 text-muted-foreground">{t.consultingBody}</p>
        </div>
        <div className="group rounded-2xl border bg-gradient-to-br from-emerald-500/[0.06] via-emerald-500/[0.03] to-card p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-emerald-500/30 sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.14em]">
            {t.securityLabel}
          </p>
          <h2 className="mt-2 text-xl font-bold">{t.securityTitle}</h2>
          <p className="mt-3 text-muted-foreground">{t.securityBody}</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-16 text-center py-12 px-6 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/20">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">{t.ctaTitle}</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          {t.ctaText}
        </p>
        <Link
          href={`${localePrefix}/contact/`}
          className="inline-flex items-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:shadow-lg hover:scale-105 transition-all"
        >
          {t.ctaButton}
          <svg
            className="ml-2 w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </section>

      {/* Swiss Technology Expertise Section - SEO Content Density */}
      <section className="py-10 px-6 rounded-2xl border bg-card/50">
        <h2 className="text-xl font-semibold mb-4">{t.techExpertiseTitle}</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
          <p>{t.techExpertiseP1}</p>
          <p className="mt-3">{t.techExpertiseP2}</p>
          <p className="mt-3">{t.techExpertiseP3}</p>
        </div>
      </section>

      {/* FAQ Section */}
      {faqItems.length > 0 && (
        <FAQ
          title={faqT("Title") as string}
          subtitle={faqT("Subtitle") as string}
          lastUpdated={faqT("LastUpdated") as string}
          items={faqItems}
        />
      )}
    </div>
  );
}
