import type { Locale } from "@/src/lib/i18n-locales";

const WHATSAPP_PHONE = "41225125050";

const whatsappCopy = {
  en: {
    floatingLabel: "Chat on WhatsApp",
    floatingAriaLabel: "Open WhatsApp chat with houle",
    contactBadge: "WhatsApp business",
    message: "Hello houle, I would like to learn more about your AI services.",
  },
  fr: {
    floatingLabel: "Discuter sur WhatsApp",
    floatingAriaLabel: "Ouvrir WhatsApp pour écrire à houle",
    contactBadge: "WhatsApp business",
    message:
      "Bonjour houle, j’aimerais en savoir plus sur vos services d’IA.",
  },
  de: {
    floatingLabel: "Auf WhatsApp schreiben",
    floatingAriaLabel: "WhatsApp-Chat mit houle öffnen",
    contactBadge: "WhatsApp business",
    message:
      "Hallo houle, ich möchte mehr über Ihre KI-Dienstleistungen erfahren.",
  },
  es: {
    floatingLabel: "Hablar por WhatsApp",
    floatingAriaLabel: "Abrir chat de WhatsApp con houle",
    contactBadge: "WhatsApp business",
    message:
      "Hola houle, me gustaría saber más sobre sus servicios de IA.",
  },
  pt: {
    floatingLabel: "Falar no WhatsApp",
    floatingAriaLabel: "Abrir conversa no WhatsApp com a houle",
    contactBadge: "WhatsApp business",
    message:
      "Olá houle, gostaria de saber mais sobre os seus serviços de IA.",
  },
} as const satisfies Record<
  Locale,
  {
    floatingLabel: string;
    floatingAriaLabel: string;
    contactBadge: string;
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
