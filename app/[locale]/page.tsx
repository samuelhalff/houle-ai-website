export default function HomePage({
  params,
}: {
  params: { locale: "en" | "fr" | "de" | "es" | "pt" };
}) {
  const locale = params?.locale || "en";

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
    },
    fr: {
      badge: "IA suisse pour Microsoft 365",
      tagline: "houle — Une IA privée, directement dans Microsoft 365",
      headline: "Une IA intégrée à vos outils Microsoft, qui reste privée.",
      subtext:
        "Nous créons des add-ins Office avec IA pour Microsoft 365 qui semblent natifs dans Outlook et Word, ainsi qu’un GPT hébergé en Suisse que vous contrôlez. Il fonctionne avec vos données, suit vos règles et garde chaque échange privé.",
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
    },
  } as const;

  const t = copy[locale] || copy.en;

  return (
    <div className="max-w-[1080px] mx-auto w-full px-6 pb-12 pt-10 space-y-14">
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
                <div className="h-5 w-5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
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
        <div className="group rounded-2xl border bg-gradient-to-br from-accent/[0.08] via-accent/[0.04] to-card p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-accent/30 sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-semibold text-primary uppercase tracking-[0.14em]">
            {t.securityLabel}
          </p>
          <h2 className="mt-2 text-xl font-bold">{t.securityTitle}</h2>
          <p className="mt-3 text-muted-foreground">{t.securityBody}</p>
        </div>
      </section>
    </div>
  );
}
