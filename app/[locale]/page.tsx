import Link from "next/link";
import FAQ from "@/src/components/FAQ";
import { getTranslations, type Locale } from "@/src/lib/i18n";
import { getPageMetadata } from "@/src/lib/metadata";
import { Metadata } from "next";
import { getCspNonce } from "@/src/lib/csp";
import { Button } from "@/src/components/ui/button";
import SectionHeading from "@/src/components/site/section-heading";
import Reveal from "@/src/components/motion/reveal";

export async function generateMetadata(
  props: { params: Promise<{ locale: "en" | "fr" | "de" | "es" | "pt" }> }
): Promise<Metadata> {
  const { locale } = await props.params;
  return await getPageMetadata((locale || "en") as Locale, "/");
}

export default async function HomePage(
  props: { params: Promise<{ locale: "en" | "fr" | "de" | "es" | "pt" }> }
) {
  const { locale: rawLocale } = await props.params;
  const locale = rawLocale || "en";
  const localePrefix = `/${locale}`;
  const nonce = await getCspNonce();

  const faqT = await getTranslations(locale as Locale, "faq");
  const faqItems = Array.from({ length: 25 })
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
  const faqLastUpdatedDate = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date());

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
      eyebrow:
        "AI consulting & integration",
      headline:
        "The right AI model for each case.",
      subtext:
        "An independent AI consulting and integration firm in Geneva. We pick the model that fits each case: Microsoft or OpenAI where it makes sense, Anthropic or Mistral, or open-source models hosted in Switzerland when confidentiality, cost or independence matter.",
      ctaPrimary:
        "Get in touch",
      ctaSecondary:
        "See our AI consulting",
      learnMore:
        "Learn more",
      facts: [
        { label: "Models", value: "Vendor-neutral", sub: "Microsoft, OpenAI, Anthropic, Mistral or open source (Llama, Mistral, Qwen, Gemma): the choice follows the case, not a vendor contract." },
        { label: "Hosting", value: "In Switzerland", sub: "When your data requires it, the model runs on your own infrastructure or in a Swiss cloud. Data and inference stay in the country." },
        { label: "Method", value: "Human control", sub: "Your teams set the rules and validate what matters. Every decision leaves a trace." },
      ],
      trustEyebrow:
        "Built for Swiss teams",
      trust: [
        { title: "No imposed model", description: "The recommendation starts from your data, your constraints and your budget." },
        { title: "Swiss hosting when needed", description: "Open-source models on your infrastructure or in a Swiss cloud, when professional or medical secrecy calls for it." },
        { title: "Geneva & Lausanne", description: "A local consulting team guiding you from concept to production." },
      ],
      productsEyebrow:
        "Products",
      productsTitle:
        "Ready-to-use products",
      productsDesc:
        "Add-ins for Outlook and Word, AI agents and a private GPT platform, for teams that already work in Microsoft 365.",
      card1Label:
        "AI for Outlook",
      card1Title:
        "Smarter email, instantly",
      card1Body:
        "Summarize threads, draft replies, and flag action items — directly inside Outlook, with your data staying private.",
      card2Label:
        "AI for Word",
      card2Title:
        "Write faster, say more",
      card2Body:
        "Generate, improve, and review documents with AI built directly into Word. No copy-paste, no context switching.",
      card3Label:
        "Swiss GPT",
      card3Title:
        "Your private knowledge layer",
      card3Body:
        "A GPT platform hosted in Switzerland, connected to your data, controlled by your team. Build internal assistants your way.",
      servicesEyebrow:
        "Consulting",
      servicesTitle:
        "Expert guidance from strategy to production",
      servicesDesc:
        "From the discovery workshop to production: choosing the use cases, choosing the model, pilot, integration and governance.",
      s1Label:
        "AI consulting",
      s1Title:
        "Independent AI consulting",
      s1Body:
        "Discovery workshop, use-case selection, model choice (proprietary or open source), measured pilot, production and governance.",
      s2Label:
        "Microsoft consulting",
      s2Title:
        "Full Microsoft 365 expertise",
      s2Body:
        "Azure, Power Automate, SharePoint, Power BI, SPFx — deep implementation experience across the Microsoft stack.",
      whyEyebrow:
        "Models and hosting",
      whyTitle:
        "Vendor-neutral, hosted in Switzerland when it matters",
      whyP1:
        "We start from your case, not from a product. For a writing assistant inside Microsoft 365, an OpenAI model on Azure often does the job very well. For sorting files covered by medical or professional secrecy, an open-source model (Llama, Mistral, Qwen, Gemma) hosted in Switzerland is often a better fit. We explain the choice and its limits before we build.",
      whyP2:
        "Hosted in Switzerland has a precise meaning for us. For each project we put four things in writing: where the model runs, where the data is stored, who has access, and what is logged. With a self-hosted open-source model, the texts you process are not sent to the model's publisher.",
      whyP3:
        "In every case your teams set the rules and keep the decision: thresholds, excluded cases, human validation, audit trail. We start with a pilot on one precise case, measured with your own figures, before rolling anything out.",
      ctaTitle:
        "A use case in mind?",
      ctaBody:
        "Let's talk about your data, your constraints and the model that fits.",
    },
    fr: {
      eyebrow:
        "Conseil et intégration IA",
      headline:
        "Le bon modèle d'IA pour chaque cas.",
      subtext:
        "Cabinet indépendant de conseil et d'intégration IA à Genève. Nous choisissons le modèle adapté à chaque cas : Microsoft ou OpenAI quand c'est pertinent, Anthropic ou Mistral, ou des modèles open source hébergés en Suisse quand la confidentialité, le coût ou l'indépendance comptent.",
      ctaPrimary:
        "Nous contacter",
      ctaSecondary:
        "Découvrir le conseil IA",
      learnMore:
        "En savoir plus",
      facts: [
        { label: "Modèles", value: "Indépendant", sub: "Microsoft, OpenAI, Anthropic, Mistral ou open source (Llama, Mistral, Qwen, Gemma) : le choix suit le cas, pas un contrat éditeur." },
        { label: "Hébergement", value: "En Suisse", sub: "Quand vos données l'exigent, le modèle tourne sur votre infrastructure ou dans un cloud suisse. Données et inférence restent dans le pays." },
        { label: "Méthode", value: "Contrôle humain", sub: "Vos équipes fixent les règles et valident ce qui compte. Chaque décision laisse une trace." },
      ],
      trustEyebrow:
        "Pensé pour les équipes suisses",
      trust: [
        { title: "Aucun modèle imposé", description: "La recommandation part de vos données, de vos contraintes et de votre budget." },
        { title: "Hébergement suisse si nécessaire", description: "Des modèles open source sur votre infrastructure ou dans un cloud suisse, quand le secret professionnel ou médical l'impose." },
        { title: "Genève & Lausanne", description: "Une équipe de conseil locale, du concept jusqu'à la production." },
      ],
      productsEyebrow:
        "Produits",
      productsTitle:
        "Des produits prêts à l'emploi",
      productsDesc:
        "Add-ins pour Outlook et Word, agents IA et plateforme GPT privée, pour les équipes qui travaillent déjà dans Microsoft 365.",
      card1Label:
        "IA pour Outlook",
      card1Title:
        "Des emails plus intelligents",
      card1Body:
        "Résumez les fils de discussion, rédigez des réponses et identifiez les actions — directement dans Outlook, vos données restent privées.",
      card2Label:
        "IA pour Word",
      card2Title:
        "Rédigez plus vite, dites plus",
      card2Body:
        "Générez, améliorez et relisez des documents avec une IA intégrée directement dans Word. Sans copier-coller, sans changer d'outil.",
      card3Label:
        "Swiss GPT",
      card3Title:
        "Votre couche de connaissance privée",
      card3Body:
        "Une plateforme GPT hébergée en Suisse, connectée à vos données, contrôlée par votre équipe. Créez vos assistants internes à votre façon.",
      servicesEyebrow:
        "Conseil",
      servicesTitle:
        "Un accompagnement expert de la stratégie à la production",
      servicesDesc:
        "De l'atelier de découverte à la mise en production : choix des cas d'usage, choix du modèle, pilote, intégration et gouvernance.",
      s1Label:
        "Conseil IA",
      s1Title:
        "Conseil IA indépendant",
      s1Body:
        "Atelier de découverte, sélection des cas d'usage, choix du modèle (propriétaire ou open source), pilote mesuré, mise en production et gouvernance.",
      s2Label:
        "Conseil Microsoft",
      s2Title:
        "Expertise Microsoft 365",
      s2Body:
        "Azure, Power Automate, SharePoint, Power BI, SPFx — une expérience approfondie sur toute la stack Microsoft.",
      whyEyebrow:
        "Modèles et hébergement",
      whyTitle:
        "Indépendants des éditeurs, hébergés en Suisse quand il le faut",
      whyP1:
        "Nous partons de votre cas, pas d'un produit. Pour un assistant de rédaction dans Microsoft 365, un modèle OpenAI sur Azure fait souvent très bien l'affaire. Pour trier des dossiers couverts par le secret médical ou professionnel, un modèle open source (Llama, Mistral, Qwen, Gemma) hébergé en Suisse est souvent plus adapté. Nous expliquons ce choix et ses limites avant de construire.",
      whyP2:
        "Hébergé en Suisse a pour nous un sens précis. Pour chaque projet, nous fixons quatre points par écrit : où tourne le modèle, où sont stockées les données, qui y a accès et ce qui est journalisé. Avec un modèle open source auto-hébergé, les textes traités ne sont pas transmis à l'éditeur du modèle.",
      whyP3:
        "Dans tous les cas, vos équipes fixent les règles et gardent la décision : seuils, cas exclus, validation humaine, piste d'audit. Nous commençons par un pilote sur un cas précis, mesuré avec vos propres chiffres, avant toute généralisation.",
      ctaTitle:
        "Un cas d'usage en tête ?",
      ctaBody:
        "Parlons de vos données, de vos contraintes et du modèle qui convient.",
    },
    de: {
      eyebrow:
        "KI-Beratung & Integration",
      headline:
        "Das richtige KI-Modell für jeden Fall.",
      subtext:
        "Unabhängige KI-Beratung und Integration in Genf. Wir wählen das Modell, das zum Fall passt: Microsoft oder OpenAI, wo es sinnvoll ist, Anthropic oder Mistral, oder in der Schweiz gehostete Open-Source-Modelle, wenn Vertraulichkeit, Kosten oder Unabhängigkeit zählen.",
      ctaPrimary:
        "Kontakt aufnehmen",
      ctaSecondary:
        "Zur KI-Beratung",
      learnMore:
        "Mehr erfahren",
      facts: [
        { label: "Modelle", value: "Herstellerneutral", sub: "Microsoft, OpenAI, Anthropic, Mistral oder Open Source (Llama, Mistral, Qwen, Gemma): Die Wahl folgt dem Fall, nicht einem Herstellervertrag." },
        { label: "Hosting", value: "In der Schweiz", sub: "Wenn Ihre Daten es verlangen, läuft das Modell auf Ihrer Infrastruktur oder in einer Schweizer Cloud. Daten und Inferenz bleiben im Land." },
        { label: "Methode", value: "Menschliche Kontrolle", sub: "Ihre Teams legen die Regeln fest und prüfen, was zählt. Jede Entscheidung hinterlässt eine Spur." },
      ],
      trustEyebrow:
        "Für Schweizer Teams gebaut",
      trust: [
        { title: "Kein vorgegebenes Modell", description: "Die Empfehlung geht von Ihren Daten, Ihren Vorgaben und Ihrem Budget aus." },
        { title: "Schweizer Hosting bei Bedarf", description: "Open-Source-Modelle auf Ihrer Infrastruktur oder in einer Schweizer Cloud, wenn Berufs- oder Arztgeheimnis es verlangen." },
        { title: "Genf & Lausanne", description: "Ein lokales Beratungsteam vom Konzept bis zur Produktion." },
      ],
      productsEyebrow:
        "Produkte",
      productsTitle:
        "Einsatzbereite Produkte",
      productsDesc:
        "Add-ins für Outlook und Word, KI-Agenten und eine private GPT-Plattform für Teams, die bereits in Microsoft 365 arbeiten.",
      card1Label:
        "KI für Outlook",
      card1Title:
        "Intelligentere E-Mails sofort",
      card1Body:
        "Fassen Sie Threads zusammen, verfassen Sie Antworten und markieren Sie Aktionspunkte — direkt in Outlook, Ihre Daten bleiben privat.",
      card2Label:
        "KI für Word",
      card2Title:
        "Schneller schreiben, mehr sagen",
      card2Body:
        "Generieren, verbessern und überprüfen Sie Dokumente mit KI direkt in Word. Kein Kopieren, kein Kontextwechsel.",
      card3Label:
        "Swiss GPT",
      card3Title:
        "Ihre private Wissensebene",
      card3Body:
        "Eine in der Schweiz gehostete GPT-Plattform, mit Ihren Daten verbunden, von Ihrem Team kontrolliert.",
      servicesEyebrow:
        "Beratung",
      servicesTitle:
        "Expertenbegleitung von der Strategie bis zur Produktion",
      servicesDesc:
        "Vom Discovery-Workshop bis zum produktiven Betrieb: Auswahl der Anwendungsfälle, Modellwahl, Pilot, Integration und Governance.",
      s1Label:
        "KI-Beratung",
      s1Title:
        "Unabhängige KI-Beratung",
      s1Body:
        "Discovery-Workshop, Auswahl der Anwendungsfälle, Modellwahl (proprietär oder Open Source), gemessener Pilot, Produktion und Governance.",
      s2Label:
        "Microsoft-Beratung",
      s2Title:
        "Vollständige Microsoft 365-Expertise",
      s2Body:
        "Azure, Power Automate, SharePoint, Power BI, SPFx — tiefgehende Implementierungserfahrung im gesamten Microsoft-Stack.",
      whyEyebrow:
        "Modelle und Hosting",
      whyTitle:
        "Herstellerneutral, in der Schweiz gehostet, wenn es darauf ankommt",
      whyP1:
        "Wir gehen von Ihrem Fall aus, nicht von einem Produkt. Für einen Schreibassistenten in Microsoft 365 reicht ein OpenAI-Modell auf Azure oft völlig aus. Für die Triage von Dossiers, die dem Arzt- oder Berufsgeheimnis unterliegen, passt ein in der Schweiz gehostetes Open-Source-Modell (Llama, Mistral, Qwen, Gemma) oft besser. Wir erklären die Wahl und ihre Grenzen, bevor wir bauen.",
      whyP2:
        "In der Schweiz gehostet hat für uns eine genaue Bedeutung. Für jedes Projekt halten wir vier Punkte schriftlich fest: wo das Modell läuft, wo die Daten gespeichert sind, wer Zugriff hat und was protokolliert wird. Bei einem selbst gehosteten Open-Source-Modell werden die verarbeiteten Texte nicht an den Herausgeber des Modells übermittelt.",
      whyP3:
        "In jedem Fall legen Ihre Teams die Regeln fest und behalten die Entscheidung: Schwellenwerte, ausgeschlossene Fälle, menschliche Prüfung, Audit-Trail. Wir beginnen mit einem Pilot an einem konkreten Fall, gemessen an Ihren eigenen Zahlen, bevor etwas ausgerollt wird.",
      ctaTitle:
        "Einen Anwendungsfall im Kopf?",
      ctaBody:
        "Sprechen wir über Ihre Daten, Ihre Vorgaben und das passende Modell.",
    },
    es: {
      eyebrow:
        "Consultoría e integración de IA",
      headline:
        "El modelo de IA adecuado para cada caso.",
      subtext:
        "Consultora independiente de IA e integración en Ginebra. Elegimos el modelo que encaja con cada caso: Microsoft u OpenAI cuando tiene sentido, Anthropic o Mistral, o modelos de código abierto alojados en Suiza cuando importan la confidencialidad, el coste o la independencia.",
      ctaPrimary:
        "Contactarnos",
      ctaSecondary:
        "Ver la consultoría de IA",
      learnMore:
        "Saber más",
      facts: [
        { label: "Modelos", value: "Independiente", sub: "Microsoft, OpenAI, Anthropic, Mistral o código abierto (Llama, Mistral, Qwen, Gemma): la elección sigue al caso, no a un contrato con un proveedor." },
        { label: "Alojamiento", value: "En Suiza", sub: "Cuando tus datos lo exigen, el modelo funciona en tu infraestructura o en una nube suiza. Los datos y la inferencia se quedan en el país." },
        { label: "Método", value: "Control humano", sub: "Tus equipos fijan las reglas y validan lo que importa. Cada decisión deja rastro." },
      ],
      trustEyebrow:
        "Diseñado para equipos suizos",
      trust: [
        { title: "Ningún modelo impuesto", description: "La recomendación parte de tus datos, tus restricciones y tu presupuesto." },
        { title: "Alojamiento suizo si hace falta", description: "Modelos de código abierto en tu infraestructura o en una nube suiza, cuando el secreto profesional o médico lo exige." },
        { title: "Ginebra y Lausana", description: "Un equipo de consultoría local, del concepto a la producción." },
      ],
      productsEyebrow:
        "Productos",
      productsTitle:
        "Productos listos para usar",
      productsDesc:
        "Complementos para Outlook y Word, agentes de IA y una plataforma GPT privada, para equipos que ya trabajan en Microsoft 365.",
      card1Label:
        "IA para Outlook",
      card1Title:
        "Emails más inteligentes",
      card1Body:
        "Resume hilos, redacta respuestas e identifica acciones — directamente en Outlook, con tus datos privados.",
      card2Label:
        "IA para Word",
      card2Title:
        "Escribe más rápido",
      card2Body:
        "Genera, mejora y revisa documentos con IA dentro de Word. Sin copiar y pegar, sin cambiar de herramienta.",
      card3Label:
        "Swiss GPT",
      card3Title:
        "Tu capa de conocimiento privado",
      card3Body:
        "Una plataforma GPT alojada en Suiza, conectada a tus datos, controlada por tu equipo.",
      servicesEyebrow:
        "Consultoría",
      servicesTitle:
        "Acompañamiento experto de la estrategia a la producción",
      servicesDesc:
        "Del taller de descubrimiento a la producción: elección de los casos de uso, elección del modelo, piloto, integración y gobernanza.",
      s1Label:
        "Consultoría IA",
      s1Title:
        "Consultoría de IA independiente",
      s1Body:
        "Taller de descubrimiento, selección de casos de uso, elección del modelo (propietario o de código abierto), piloto medido, producción y gobernanza.",
      s2Label:
        "Consultoría Microsoft",
      s2Title:
        "Experiencia Microsoft 365",
      s2Body:
        "Azure, Power Automate, SharePoint, Power BI, SPFx — experiencia profunda en todo el stack de Microsoft.",
      whyEyebrow:
        "Modelos y alojamiento",
      whyTitle:
        "Independientes de los proveedores, alojados en Suiza cuando hace falta",
      whyP1:
        "Partimos de tu caso, no de un producto. Para un asistente de redacción en Microsoft 365, un modelo de OpenAI en Azure suele bastar. Para clasificar expedientes cubiertos por el secreto médico o profesional, un modelo de código abierto (Llama, Mistral, Qwen, Gemma) alojado en Suiza suele encajar mejor. Explicamos la elección y sus límites antes de construir.",
      whyP2:
        "Alojado en Suiza tiene para nosotros un sentido preciso. En cada proyecto dejamos cuatro puntos por escrito: dónde funciona el modelo, dónde se guardan los datos, quién tiene acceso y qué se registra. Con un modelo de código abierto autoalojado, los textos tratados no se envían al editor del modelo.",
      whyP3:
        "En todos los casos tus equipos fijan las reglas y conservan la decisión: umbrales, casos excluidos, validación humana, pista de auditoría. Empezamos con un piloto sobre un caso concreto, medido con tus propias cifras, antes de generalizar.",
      ctaTitle:
        "¿Tienes un caso de uso en mente?",
      ctaBody:
        "Hablemos de tus datos, tus restricciones y el modelo que conviene.",
    },
    pt: {
      eyebrow:
        "Consultoria e integração de IA",
      headline:
        "O modelo de IA certo para cada caso.",
      subtext:
        "Consultoria independente de IA e integração em Genebra. Escolhemos o modelo adequado a cada caso: Microsoft ou OpenAI quando faz sentido, Anthropic ou Mistral, ou modelos de código aberto hospedados na Suíça quando a confidencialidade, o custo ou a independência contam.",
      ctaPrimary:
        "Entre em contato",
      ctaSecondary:
        "Ver a consultoria de IA",
      learnMore:
        "Saiba mais",
      facts: [
        { label: "Modelos", value: "Independente", sub: "Microsoft, OpenAI, Anthropic, Mistral ou código aberto (Llama, Mistral, Qwen, Gemma): a escolha segue o caso, não um contrato com um fornecedor." },
        { label: "Hospedagem", value: "Na Suíça", sub: "Quando os seus dados exigem, o modelo roda na sua infraestrutura ou numa nuvem suíça. Dados e inferência ficam no país." },
        { label: "Método", value: "Controle humano", sub: "As suas equipes definem as regras e validam o que importa. Cada decisão deixa um registro." },
      ],
      trustEyebrow:
        "Feito para equipes suíças",
      trust: [
        { title: "Nenhum modelo imposto", description: "A recomendação parte dos seus dados, das suas restrições e do seu orçamento." },
        { title: "Hospedagem suíça quando necessário", description: "Modelos de código aberto na sua infraestrutura ou numa nuvem suíça, quando o sigilo profissional ou médico o exige." },
        { title: "Genebra e Lausanne", description: "Uma equipe de consultoria local, do conceito à produção." },
      ],
      productsEyebrow:
        "Produtos",
      productsTitle:
        "Produtos prontos para usar",
      productsDesc:
        "Suplementos para Outlook e Word, agentes de IA e uma plataforma GPT privada, para equipes que já trabalham no Microsoft 365.",
      card1Label:
        "IA para Outlook",
      card1Title:
        "Emails mais inteligentes",
      card1Body:
        "Resuma threads, redija respostas e identifique ações — diretamente no Outlook, com seus dados privados.",
      card2Label:
        "IA para Word",
      card2Title:
        "Escreva mais rápido",
      card2Body:
        "Gere, melhore e revise documentos com IA dentro do Word. Sem copiar e colar, sem trocar de ferramenta.",
      card3Label:
        "Swiss GPT",
      card3Title:
        "Sua camada de conhecimento privado",
      card3Body:
        "Uma plataforma GPT hospedada na Suíça, conectada aos seus dados, controlada pela sua equipe.",
      servicesEyebrow:
        "Consultoria",
      servicesTitle:
        "Acompanhamento especializado da estratégia à produção",
      servicesDesc:
        "Do workshop de descoberta à produção: escolha dos casos de uso, escolha do modelo, piloto, integração e governança.",
      s1Label:
        "Consultoria IA",
      s1Title:
        "Consultoria de IA independente",
      s1Body:
        "Workshop de descoberta, seleção de casos de uso, escolha do modelo (proprietário ou de código aberto), piloto medido, produção e governança.",
      s2Label:
        "Consultoria Microsoft",
      s2Title:
        "Especialização Microsoft 365",
      s2Body:
        "Azure, Power Automate, SharePoint, Power BI, SPFx — experiência profunda em todo o stack Microsoft.",
      whyEyebrow:
        "Modelos e hospedagem",
      whyTitle:
        "Independentes dos fornecedores, hospedados na Suíça quando é preciso",
      whyP1:
        "Partimos do seu caso, não de um produto. Para um assistente de redação no Microsoft 365, um modelo da OpenAI no Azure costuma resolver muito bem. Para triar processos cobertos pelo sigilo médico ou profissional, um modelo de código aberto (Llama, Mistral, Qwen, Gemma) hospedado na Suíça costuma ser mais adequado. Explicamos a escolha e os seus limites antes de construir.",
      whyP2:
        "Hospedado na Suíça tem para nós um sentido preciso. Em cada projeto, deixamos quatro pontos por escrito: onde o modelo roda, onde os dados ficam guardados, quem tem acesso e o que é registrado. Com um modelo de código aberto auto-hospedado, os textos tratados não são enviados ao editor do modelo.",
      whyP3:
        "Em todos os casos, as suas equipes definem as regras e mantêm a decisão: limites, casos excluídos, validação humana, trilha de auditoria. Começamos com um piloto num caso preciso, medido com os seus próprios números, antes de generalizar.",
      ctaTitle:
        "Tem um caso de uso em mente?",
      ctaBody:
        "Vamos falar dos seus dados, das suas restrições e do modelo que convém.",
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
            <p className="site-hero-description mt-8 max-w-[52ch] text-lg leading-8 text-muted-foreground sm:text-xl">
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
              <Link href={`${localePrefix}/services/ai-consulting/`} className="w-full sm:w-auto" prefetch={false}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="btn-secondary-cta w-full rounded-full px-6 text-base sm:w-auto"
                >
                  <span>{t.ctaSecondary}</span>
                </Button>
              </Link>
            </div>

            {/* Facts band */}
            <div className="mt-16 grid grid-cols-1 gap-8 border-t border-border/50 pt-10 sm:grid-cols-3 sm:gap-10">
              {t.facts.map((fact) => (
                <div key={fact.label} className="flex flex-col gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60">
                    {fact.label}
                  </p>
                  <p className="text-[28px] font-semibold leading-none tracking-[-0.025em] text-foreground sm:text-[32px]">
                    {fact.value}
                  </p>
                  <p className="text-[13.5px] leading-[1.55] text-muted-foreground">
                    {fact.sub}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Trust band ───────────────────────────────────────────────── */}
      <section
        id="trust"
        className="mx-auto w-full max-w-[1200px] border-y border-border/50 px-5 py-8 sm:px-8 sm:py-10"
        aria-labelledby="trust-title"
      >
        <div className="grid items-start gap-8 sm:grid-cols-[auto_repeat(3,1fr)] sm:items-center sm:gap-10">
          <p
            id="trust-title"
            className="font-mono text-[10px] uppercase leading-5 tracking-[0.14em] text-muted-foreground/70 sm:max-w-[100px]"
          >
            {t.trustEyebrow}
          </p>
          <ul className="col-span-3 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
            {t.trust.map((item) => (
              <li key={item.title} className="flex flex-col gap-1.5">
                <p className="text-[17px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
                  {item.title}
                </p>
                <p className="text-[13px] leading-[1.55] text-muted-foreground">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
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
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-[gap] duration-200 group-hover:gap-2.5">
                    {t.learnMore}
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
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-[gap] duration-200 group-hover:gap-2.5">
                    {t.learnMore}
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
                {t.ctaTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-[48ch] text-base text-foreground/70">
                {t.ctaBody}
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
              lastUpdatedDate={faqLastUpdatedDate}
              items={faqItems}
            />
          </div>
        </section>
      )}
    </div>
  );
}
