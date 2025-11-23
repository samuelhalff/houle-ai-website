import { Metadata } from "next";
import dynamic from "next/dynamic";
import { generateMetadataForPage } from "@/src/lib/metadata";

const ContactForm = dynamic(() => import("@/src/components/ui/contact-form"), {
  ssr: false,
  loading: () => null,
});

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return await generateMetadataForPage(
    params.locale as "en" | "fr" | "de" | "es" | "pt",
    "/contact"
  );
}

const copy = {
  en: {
    title: "Get in touch",
    subtitle:
      "We are onboarding a small number of teams for early pilots on Microsoft 365.",
    emailLabel: "Email us at",
    orContactUs: "Prefer email or a call?",
    bookingButton: "Schedule a call",
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
    emailLabel: "Écrivez-nous à",
    orContactUs: "Préférez un e-mail ou un appel ?",
    bookingButton: "Planifier un appel",
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
    emailLabel: "Schreiben Sie an",
    orContactUs: "Lieber E-Mail oder Anruf?",
    bookingButton: "Termin vereinbaren",
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
    emailLabel: "Escríbenos a",
    orContactUs: "¿Prefieres correo electrónico o llamada?",
    bookingButton: "Programar una llamada",
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
    emailLabel: "Envie um e-mail para",
    orContactUs: "Prefere e-mail ou ligação?",
    bookingButton: "Agendar uma ligação",
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

export default function ContactPage({
  params,
}: {
  params: { locale: "en" | "fr" | "de" | "es" | "pt" };
}) {
  const locale = params?.locale || "en";
  const strings = copy[locale] || copy.en;
  const localePrefix = `/${locale}`;

  return (
    <div className="mx-auto w-full max-w-[var(--breakpoint-xl)] px-6 py-12 space-y-10">
      <div className="text-center space-y-3">
        <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
          {locale === "fr"
            ? "Contact"
            : locale === "de"
            ? "Kontakt"
            : locale === "es"
            ? "Contacto"
            : locale === "pt"
            ? "Contato"
            : "Contact"}
        </p>
        <h1 className="text-3xl xs:text-4xl sm:text-5xl font-bold tracking-tight">
          {strings.title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {strings.subtitle}
        </p>
        <p className="text-base text-muted-foreground">
          {strings.emailLabel}{" "}
          <a className="text-primary underline" href="mailto:contact@houle.ai">
            contact@houle.ai
          </a>
        </p>
      </div>

      <ContactForm
        showTitle={false}
        showSubtitle={false}
        strings={strings}
        redirectPath={`${localePrefix}/`}
      />
    </div>
  );
}
