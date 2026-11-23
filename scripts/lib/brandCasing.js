"use strict";

/**
 * Restores standard casing of product names, places and acronyms in article
 * titles and descriptions (an old prompt asked for "no superfluous capitals"
 * and the model lowercased "Microsoft", "IA", "Genève"…). Only all-lowercase
 * (or capitalised acronym) forms are replaced, on whole words, so text that
 * is already right never changes. Used by scripts/ai-ressources-update.js on
 * every generated article and run once on the existing ones.
 */

const COMMON = [
  ["microsoft 365", "Microsoft 365"],
  ["microsoft word", "Microsoft Word"],
  ["microsoft teams", "Microsoft Teams"],
  ["microsoft", "Microsoft"],
  ["office 365", "Office 365"],
  ["azure openai", "Azure OpenAI"],
  ["azure", "Azure"],
  ["sharepoint", "SharePoint"],
  ["power automate", "Power Automate"],
  ["power bi", "Power BI"],
  ["power platform", "Power Platform"],
  ["power apps", "Power Apps"],
  ["ai builder", "AI Builder"],
  ["AI builder", "AI Builder"],
  ["outlook", "Outlook"],
  ["openai", "OpenAI"],
  ["chatgpt", "ChatGPT"],
  ["copilot", "Copilot"],
  ["odoo", "Odoo"],
  ["erp", "ERP"],
  ["crm", "CRM"],
  ["nlpd", "nLPD"],
  ["lpd", "LPD"],
  ["rgpd", "RGPD"],
  ["gdpr", "GDPR"],
  ["lpp", "LPP"],
  ["Lpp", "LPP"],
  ["tva", "TVA"],
  ["Tva", "TVA"],
  ["beps", "BEPS"],
  ["Beps", "BEPS"],
  ["hni", "HNI"],
  ["teams, planner", "Teams, Planner"],
];

const BY_LOCALE = {
  fr: [
    ["ia", "IA"],
    ["Ia", "IA"],
    ["pme", "PME"],
    ["genève", "Genève"],
    ["suisse romande", "Suisse romande"],
    ["en suisse", "en Suisse"],
    ["la suisse", "la Suisse"],
    ["teams", "Teams"],
    ["forms et Teams", "Forms et Teams"],
    ["sa ou une sàrl", "SA ou une Sàrl"],
  ],
  en: [
    ["ai", "AI"],
    ["swiss", "Swiss"],
    ["smes", "SMEs"],
    ["sme", "SME"],
    ["french-speaking", "French-speaking"],
    ["vat", "VAT"],
    ["geneva", "Geneva"],
    ["switzerland", "Switzerland"],
  ],
  de: [
    ["ki", "KI"],
    ["kmu", "KMU"],
    ["romandie", "Romandie"],
    ["westschweiz", "Westschweiz"],
    ["schweizer", "Schweizer"],
    ["schweiz", "Schweiz"],
    ["genf", "Genf"],
    ["teams", "Teams"],
  ],
  es: [
    ["ia", "IA"],
    ["iva", "IVA"],
    ["ginebra", "Ginebra"],
    ["en suiza", "en Suiza"],
    ["teams", "Teams"],
  ],
  pt: [
    ["ia", "IA"],
    ["pmes", "PMEs"],
    ["pme", "PME"],
    ["iva", "IVA"],
    ["genebra", "Genebra"],
    ["na suíça", "na Suíça"],
    ["teams", "Teams"],
  ],
};

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function fixCasing(text, locale) {
  if (typeof text !== "string" || !text) return text;
  let out = text;
  for (const [from, to] of [...COMMON, ...(BY_LOCALE[locale] || [])]) {
    if (from === to) continue;
    const re = new RegExp(`(^|[^\\p{L}\\p{N}_-])${escape(from)}(?=$|[^\\p{L}\\p{N}_])`, "gu");
    out = out.replace(re, (_, pre) => pre + to);
  }
  return out;
}

module.exports = { fixCasing };
