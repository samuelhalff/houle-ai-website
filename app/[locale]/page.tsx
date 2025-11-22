export default function HomePage({
  params,
}: {
  params: { locale: "en" | "fr" | "de" | "es" | "pt" };
}) {
  const locale = params?.locale || "en";

  const copy = {
    en: {
      badge: "Swiss-built AI for Microsoft 365",
      tagline: "houle — Private AI, right inside Microsoft 365",
      headline: "AI that lives in your Microsoft tools and stays private.",
      subtext:
        "We are creating Office add-ins with AI for Microsoft 365 that feel native to Outlook and Word, plus a Swiss-hosted GPT you control. Based in the Lake Geneva region, we serve clients across Geneva, Lausanne, Bern, Zurich, and Valais. It works with your data, follows your rules, and keeps every conversation private.",
      highlights: [
        "Office add-ins with AI for Microsoft 365",
        "Swiss-hosted GPT built for privacy",
        "Keeps your company data in your control",
      ],
      productsTitle: "Made for Microsoft 365",
      productsBody:
        "Office add-ins with AI that blend into the tools your teams already open—Outlook and Word first. Pair them with a Swiss-hosted GPT that connects to your data, keeps it in your control, and keeps everyday work simple.",
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
      productsTitle: "Conçu pour Microsoft 365",
      productsBody:
        "Des add-ins Office avec IA qui s’intègrent aux outils que vos équipes ouvrent déjà—Outlook et Word d’abord. À associer à un GPT hébergé en Suisse qui se connecte à vos données, les garde sous contrôle et simplifie le quotidien.",
      securityTitle: "Fiable par conception",
      securityBody:
        "Conçu avec la confidentialité en premier. Vos contenus restent à leur place, les échanges sont protégés et les administrateurs gardent la main sur ce qui est partagé ou non.",
    },
    de: {
      badge: "Schweizer KI für Microsoft 365",
      tagline: "houle — Private KI, direkt in Microsoft 365",
      headline: "KI, die in Ihren Microsoft-Tools lebt und privat bleibt.",
      subtext:
        "Wir entwickeln Office-Add-Ins mit KI für Microsoft 365, die sich nativ in Outlook und Word anfühlen, plus einen in der Schweiz gehosteten GPT, den Sie kontrollieren. Es funktioniert mit Ihren Daten, folgt Ihren Regeln und hält jede Konversation privat.",
      highlights: [
        "Office-Add-Ins mit KI für Microsoft 365",
        "In der Schweiz gehosteter GPT für Datenschutz",
        "Ihre Unternehmensdaten bleiben unter Ihrer Kontrolle",
      ],
      productsTitle: "Für Microsoft 365 entwickelt",
      productsBody:
        "Office-Add-Ins mit KI, die sich in die Tools integrieren, die Ihre Teams bereits nutzen—Outlook und Word zuerst. Kombinieren Sie sie mit einem in der Schweiz gehosteten GPT, der sich mit Ihren Daten verbindet, sie unter Kontrolle hält und die tägliche Arbeit vereinfacht.",
      securityTitle: "Vertrauenswürdig nach Design",
      securityBody:
        "Entwickelt mit Datenschutz an erster Stelle. Ihre Inhalte bleiben, wo sie hingehören, Gespräche sind geschützt und Administratoren behalten die Kontrolle darüber, was geteilt wird und was nicht.",
    },
    es: {
      badge: "IA suiza para Microsoft 365",
      tagline: "houle — IA privada, directamente en Microsoft 365",
      headline: "IA que vive en tus herramientas Microsoft y se mantiene privada.",
      subtext:
        "Estamos creando complementos de Office con IA para Microsoft 365 que se sienten nativos en Outlook y Word, además de un GPT alojado en Suiza que tú controlas. Funciona con tus datos, sigue tus reglas y mantiene cada conversación privada.",
      highlights: [
        "Complementos de Office con IA para Microsoft 365",
        "GPT alojado en Suiza diseñado para privacidad",
        "Mantén los datos de tu empresa bajo tu control",
      ],
      productsTitle: "Hecho para Microsoft 365",
      productsBody:
        "Complementos de Office con IA que se integran en las herramientas que tus equipos ya usan—Outlook y Word primero. Combínalos con un GPT alojado en Suiza que se conecta a tus datos, los mantiene bajo tu control y simplifica el trabajo diario.",
      securityTitle: "Confiable por diseño",
      securityBody:
        "Desarrollado con la privacidad de datos primero. Tu contenido permanece donde debe estar, las conversaciones están protegidas y los administradores mantienen el control sobre qué se comparte y qué no.",
    },
    pt: {
      badge: "IA suíça para Microsoft 365",
      tagline: "houle — IA privada, direto no Microsoft 365",
      headline: "IA que vive nas suas ferramentas Microsoft e permanece privada.",
      subtext:
        "Estamos criando suplementos do Office com IA para Microsoft 365 que parecem nativos no Outlook e Word, além de um GPT hospedado na Suíça que você controla. Funciona com seus dados, segue suas regras e mantém cada conversa privada.",
      highlights: [
        "Suplementos do Office com IA para Microsoft 365",
        "GPT hospedado na Suíça focado em privacidade",
        "Mantenha os dados da sua empresa sob seu controle",
      ],
      productsTitle: "Feito para Microsoft 365",
      productsBody:
        "Suplementos do Office com IA que se integram às ferramentas que suas equipes já usam—Outlook e Word primeiro. Combine-os com um GPT hospedado na Suíça que se conecta aos seus dados, os mantém sob seu controle e simplifica o trabalho diário.",
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
          <div className="flex flex-wrap gap-3">
            {t.highlights.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/90 to-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm ring-1 ring-primary/30 dark:ring-primary/50"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-primary-foreground" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="group rounded-2xl border bg-gradient-to-br from-primary/[0.06] via-primary/[0.03] to-card p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/30">
          <p className="text-sm font-semibold text-primary uppercase tracking-[0.14em]">
            Products
          </p>
          <h2 className="mt-2 text-xl font-bold">{t.productsTitle}</h2>
          <p className="mt-3 text-muted-foreground">
            {t.productsBody}
          </p>
        </div>
        <div className="group rounded-2xl border bg-gradient-to-br from-accent/[0.08] via-accent/[0.04] to-card p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-accent/30">
          <p className="text-sm font-semibold text-primary uppercase tracking-[0.14em]">
            Security & Privacy
          </p>
          <h2 className="mt-2 text-xl font-bold">{t.securityTitle}</h2>
          <p className="mt-3 text-muted-foreground">
            {t.securityBody}
          </p>
        </div>
      </section>
    </div>
  );
}
