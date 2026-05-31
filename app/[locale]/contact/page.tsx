import { Metadata } from "next";
import { generateMetadataForPage } from "@/src/lib/metadata";
import { Button } from "@/src/components/ui/button";
import { EnvelopeIcon } from "@/src/components/icons/EnvelopeIcon";
import { PhoneIcon } from "@/src/components/icons/PhoneIcon";
import { WhatsAppIcon } from "@/src/components/icons/WhatsAppIcon";
import { getWhatsAppContent, getWhatsAppLink } from "@/src/lib/whatsapp";
import { ContactForm } from "@/src/components/ui/contact-form-client";

const BOOKING_URL = "https://outlook.office.com/bookwithme/user/409097336fec47ef9ad61beeef96c884@houle.ai/meetingtype/L5kPsZfevE6i7S7hiOL8Cg2?anonymous&amp;ismsaljsauthenabled&amp;ep=mlink";

export async function generateMetadata(
  props: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await props.params;
  return await generateMetadataForPage(
    locale as "en" | "fr" | "de" | "es" | "pt",
    "/contact"
  );
}

const copy = {
  en: {
    title: "Get in touch",
    subtitle:
      "We are onboarding a small number of teams for early pilots on Microsoft 365.",
    callLabel: "Call",
    callTitle: "Book a short call",
    callDescription:
      "The fastest way to discuss your Microsoft 365 setup, priorities, and next steps.",
    bookingButton: "Book a call",
    writeLabel: "Or write to us",
    emailLabel: "Email",
    emailDescription: "Best if you already know what you need.",
    whatsappDescription: "Quick questions, short updates, and easy follow-up.",
    formIntro: "Or send a message",
    labels: {
      name: "Name",
      companyName: "Company (optional)",
      phone: "Phone (optional)",
      email: "Email",
      message: "How can we help?",
      consent: "I consent to being contacted by houle",
      submit: "Send",
      sending: "Sending...",
    },
    placeholders: {
      name: "Your name",
      companyName: "Your company",
      phone: "Phone number",
      email: "you@company.com",
      message: "Tell us about your Microsoft 365 setup",
    },
    errors: {
      required: "This field is required",
      invalidEmail: "Invalid email address",
      maxLength: "Message is too long",
      consent: "Please confirm consent",
    },
    toasts: {
      success: "Thanks! We'll reply soon.",
      error: "Something went wrong.",
    },
  },
  fr: {
    title: "Contactez-nous",
    subtitle:
      "Nous accueillons quelques équipes pour des pilotes sur Microsoft 365.",
    callLabel: "Appel",
    callTitle: "Réservez un court appel",
    callDescription:
      "Le moyen le plus simple pour parler de votre environnement Microsoft 365 et des prochaines étapes.",
    bookingButton: "Réserver un appel",
    writeLabel: "Ou écrivez-nous",
    emailLabel: "E-mail",
    emailDescription: "Idéal si vous savez déjà ce dont vous avez besoin.",
    whatsappDescription:
      "Pour des questions rapides, un suivi simple ou un premier échange.",
    formIntro: "Ou envoyez-nous un message",
    labels: {
      name: "Nom",
      companyName: "Entreprise (optionnel)",
      phone: "Téléphone (optionnel)",
      email: "E-mail",
      message: "Comment pouvons-nous aider ?",
      consent: "J’accepte d’être contacté par houle",
      submit: "Envoyer",
      sending: "Envoi...",
    },
    placeholders: {
      name: "Votre nom",
      companyName: "Votre entreprise",
      phone: "Numéro de téléphone",
      email: "vous@entreprise.com",
      message: "Parlez-nous de votre organisation Microsoft 365",
    },
    errors: {
      required: "Ce champ est requis",
      invalidEmail: "Adresse e-mail invalide",
      maxLength: "Le message est trop long",
      consent: "Veuillez confirmer votre consentement",
    },
    toasts: {
      success: "Merci ! Nous vous répondrons bientôt.",
      error: "Une erreur s'est produite.",
    },
  },
  de: {
    title: "Kontakt aufnehmen",
    subtitle:
      "Wir nehmen eine kleine Anzahl von Teams für frühe Pilotprojekte auf Microsoft 365 auf.",
    callLabel: "Anruf",
    callTitle: "Kurzen Anruf buchen",
    callDescription:
      "Der schnellste Weg, um Ihre Microsoft-365-Situation, Prioritäten und nächsten Schritte zu besprechen.",
    bookingButton: "Anruf buchen",
    writeLabel: "Oder schreiben Sie uns",
    emailLabel: "E-Mail",
    emailDescription:
      "Ideal, wenn Sie bereits wissen, wobei wir Ihnen helfen sollen.",
    whatsappDescription:
      "Für kurze Fragen, schnelle Rückfragen und einfache Updates.",
    formIntro: "Oder senden Sie uns eine Nachricht",
    labels: {
      name: "Name",
      companyName: "Firma (optional)",
      phone: "Telefon (optional)",
      email: "E-Mail",
      message: "Wie können wir helfen?",
      consent: "Ich stimme zu, von houle kontaktiert zu werden",
      submit: "Senden",
      sending: "Wird gesendet...",
    },
    placeholders: {
      name: "Ihr Name",
      companyName: "Ihr Unternehmen",
      phone: "Telefonnummer",
      email: "sie@firma.com",
      message: "Erzählen Sie uns von Ihrer Microsoft 365-Einrichtung",
    },
    errors: {
      required: "Dieses Feld ist erforderlich",
      invalidEmail: "Ungültige E-Mail-Adresse",
      maxLength: "Nachricht ist zu lang",
      consent: "Bitte bestätigen Sie die Zustimmung",
    },
    toasts: {
      success: "Danke! Wir werden bald antworten.",
      error: "Etwas ist schief gelaufen.",
    },
  },
  es: {
    title: "Contactar",
    subtitle:
      "Estamos incorporando un pequeño número de equipos para pilotos iniciales en Microsoft 365.",
    callLabel: "Llamada",
    callTitle: "Reserva una llamada breve",
    callDescription:
      "La forma más rápida de hablar sobre tu entorno Microsoft 365, prioridades y próximos pasos.",
    bookingButton: "Reservar una llamada",
    writeLabel: "O escríbenos",
    emailLabel: "Correo",
    emailDescription:
      "Ideal si ya sabes qué necesitas y quieres compartir algo de contexto.",
    whatsappDescription:
      "Para preguntas rápidas, seguimiento simple y una primera conversación.",
    formIntro: "O envíanos un mensaje",
    labels: {
      name: "Nombre",
      companyName: "Empresa (opcional)",
      phone: "Teléfono (opcional)",
      email: "Correo electrónico",
      message: "¿Cómo podemos ayudar?",
      consent: "Acepto ser contactado por houle",
      submit: "Enviar",
      sending: "Enviando...",
    },
    placeholders: {
      name: "Tu nombre",
      companyName: "Tu empresa",
      phone: "Número de teléfono",
      email: "tu@empresa.com",
      message: "Cuéntanos sobre tu configuración de Microsoft 365",
    },
    errors: {
      required: "Este campo es obligatorio",
      invalidEmail: "Dirección de correo electrónico inválida",
      maxLength: "El mensaje es demasiado largo",
      consent: "Por favor confirma el consentimiento",
    },
    toasts: {
      success: "¡Gracias! Responderemos pronto.",
      error: "Algo salió mal.",
    },
  },
  pt: {
    title: "Entre em contato",
    subtitle:
      "Estamos integrando um pequeno número de equipes para pilotos iniciais no Microsoft 365.",
    callLabel: "Ligação",
    callTitle: "Agende uma ligação curta",
    callDescription:
      "A forma mais rápida de conversar sobre o seu ambiente Microsoft 365, prioridades e próximos passos.",
    bookingButton: "Agendar uma ligação",
    writeLabel: "Ou fale conosco por escrito",
    emailLabel: "E-mail",
    emailDescription:
      "Ideal se você já sabe do que precisa e quer enviar mais contexto.",
    whatsappDescription:
      "Para perguntas rápidas, acompanhamento simples e um primeiro contato.",
    formIntro: "Ou envie uma mensagem",
    labels: {
      name: "Nome",
      companyName: "Empresa (opcional)",
      phone: "Telefone (opcional)",
      email: "E-mail",
      message: "Como podemos ajudar?",
      consent: "Concordo em ser contatado pela houle",
      submit: "Enviar",
      sending: "Enviando...",
    },
    placeholders: {
      name: "Seu nome",
      companyName: "Sua empresa",
      phone: "Número de telefone",
      email: "voce@empresa.com",
      message: "Conte-nos sobre sua configuração do Microsoft 365",
    },
    errors: {
      required: "Este campo é obrigatório",
      invalidEmail: "Endereço de e-mail inválido",
      maxLength: "Mensagem muito longa",
      consent: "Por favor confirme o consentimento",
    },
    toasts: {
      success: "Obrigado! Responderemos em breve.",
      error: "Algo deu errado.",
    },
  },
} as const;

export default async function ContactPage(
  props: { params: Promise<{ locale: "en" | "fr" | "de" | "es" | "pt" }> }
) {
  const { locale: rawLocale } = await props.params;
  const locale = rawLocale || "en";
  const strings = copy[locale] || copy.en;
  const whatsapp = getWhatsAppContent(locale);
  const whatsappLink = getWhatsAppLink(locale);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 space-y-12">
      {/* Page title */}
      <div className="abstract-background mx-auto max-w-3xl text-center space-y-4 py-8 sm:py-10 lg:py-14">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-brand-hover dark:text-brand">
          {locale === "fr" ? "Contact"
          : locale === "de" ? "Kontakt"
          : locale === "es" ? "Contacto"
          : locale === "pt" ? "Contato"
          : "Contact"}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {strings.title}
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg max-w-2xl mx-auto leading-8">
          {strings.subtitle}
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-5 rounded-2xl border bg-surface-tint/40 px-6 py-6 md:grid-cols-2 md:px-8 md:py-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand-hover dark:text-brand">
              <PhoneIcon className="size-3.5" />
              {strings.callLabel}
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                {strings.callTitle}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                {strings.callDescription}
              </p>
            </div>
            <Button asChild size="lg" className="btn-main-cta rounded-full bg-foreground px-6 text-background">
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                <span>{strings.bookingButton}</span>
              </a>
            </Button>
          </div>

          <div className="space-y-3 rounded-2xl border bg-background p-4 sm:p-5">
            <p className="text-sm font-medium text-foreground">
              {strings.writeLabel}
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={whatsapp.floatingAriaLabel}
              className="flex items-start gap-3 rounded-xl border border-border/70 px-4 py-3 transition-colors hover:bg-accent/40"
            >
              <span className="mt-0.5 inline-flex size-9 items-center justify-center rounded-full bg-[#25D366]/12 text-[#1e9e53]">
                <WhatsAppIcon className="size-5" />
              </span>
              <span className="space-y-0.5">
                <span className="block text-sm font-medium text-foreground">
                  {whatsapp.contactLabel}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {strings.whatsappDescription}
                </span>
              </span>
            </a>
            <a
              href="mailto:contact@houle.ai"
              className="flex items-start gap-3 rounded-xl border border-border/70 px-4 py-3 transition-colors hover:bg-accent/40"
              aria-label="Email contact@houle.ai"
            >
              <span className="mt-0.5 inline-flex size-9 items-center justify-center rounded-full bg-brand-soft text-brand">
                <EnvelopeIcon className="size-5" />
              </span>
              <span className="space-y-0.5">
                <span className="block text-sm font-medium text-foreground">
                  {strings.emailLabel}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {strings.emailDescription}
                </span>
                <span className="block text-sm text-brand">
                  contact@houle.ai
                </span>
              </span>
            </a>
          </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-4">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {strings.formIntro}
          </p>
        </div>
        <ContactForm
          showTitle={false}
          showSubtitle={false}
          strings={strings}
        />
      </div>
    </div>
  );
}
