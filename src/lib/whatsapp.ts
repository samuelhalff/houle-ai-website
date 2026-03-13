import type { Locale } from "@/src/lib/i18n-locales";

const WHATSAPP_PHONE = "41225125050";

const whatsappCopy = {
  en: {
    floatingLabel: "WhatsApp",
    floatingAriaLabel: "Open WhatsApp chat with houle",
    contactLabel: "WhatsApp",
    footerLabel: "WhatsApp",
    message: "Hello houle, I would like to learn more about your AI services.",
  },
  fr: {
    floatingLabel: "WhatsApp",
    floatingAriaLabel: "Ouvrir le chat WhatsApp avec houle",
    contactLabel: "WhatsApp",
    footerLabel: "WhatsApp",
    message:
      "Bonjour houle, j’aimerais en savoir plus sur vos services d’IA.",
  },
  de: {
    floatingLabel: "WhatsApp",
    floatingAriaLabel: "WhatsApp-Chat mit houle öffnen",
    contactLabel: "WhatsApp",
    footerLabel: "WhatsApp",
    message:
      "Hallo houle, ich möchte mehr über Ihre KI-Dienstleistungen erfahren.",
  },
  es: {
    floatingLabel: "WhatsApp",
    floatingAriaLabel: "Abrir chat de WhatsApp con houle",
    contactLabel: "WhatsApp",
    footerLabel: "WhatsApp",
    message:
      "Hola houle, me gustaría saber más sobre sus servicios de IA.",
  },
  pt: {
    floatingLabel: "WhatsApp",
    floatingAriaLabel: "Abrir conversa no WhatsApp com a houle",
    contactLabel: "WhatsApp",
    footerLabel: "WhatsApp",
    message:
      "Olá houle, gostaria de saber mais sobre os seus serviços de IA.",
  },
} as const satisfies Record<
  Locale,
  {
    floatingLabel: string;
    floatingAriaLabel: string;
    contactLabel: string;
    footerLabel: string;
    message: string;
  }
>;

export function getWhatsAppContent(locale: Locale) {
  return whatsappCopy[locale] ?? whatsappCopy.en;
}

export function getWhatsAppLink(locale: Locale) {
  const { message } = getWhatsAppContent(locale);
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
