#!/usr/bin/env node
// Merge Ark's ressources.json into this repo's ressources.json per-locale
// Rules: add missing articles; if slug exists and Ark date is newer, update; replace author 'Ark Fiduciaire' -> 'houle Team'; replace 'ark-fid.ch' with 'houle.ai' in content and references.

const fs = require('fs');
const path = require('path');

const ARK_DIR = '/home/sam/ark-fid.ch/src/translations';
const OUR_DIR = path.join(process.cwd(), 'src', 'translations');
const LOCALES = ['en', 'fr', 'de', 'es', 'pt'];

function loadJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveJSON(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function normalizeArticle(a) {
  const copy = { ...a };
  if (copy.author === 'Ark Fiduciaire') copy.author = 'houle Team';
  if (typeof copy.content === 'string') copy.content = copy.content.replace(/ark-fid\.ch/g, 'houle.ai');
  if (Array.isArray(copy.references)) {
    copy.references = copy.references.map((r) => ({
      ...r,
      url: typeof r.url === 'string' ? r.url.replace(/ark-fid\.ch/g, 'houle.ai') : r.url,
    }));
  }
  return copy;
}

let totalAdded = 0;
let totalUpdated = 0;
let perLocale = {};

for (const locale of LOCALES) {
  const arkPath = path.join(ARK_DIR, locale, 'ressources.json');
  const ourPath = path.join(OUR_DIR, locale, 'ressources.json');
  if (!fs.existsSync(arkPath)) continue;
  if (!fs.existsSync(ourPath)) {
    console.warn(`[WARN] Our locale missing ${locale} - copying Ark file as starting point`);
    const arkJson = loadJSON(arkPath);
    // adapt authors and urls
    arkJson.Articles = (arkJson.Articles || []).map(normalizeArticle);
    saveJSON(ourPath, arkJson);
    perLocale[locale] = { added: arkJson.Articles.length, updated: 0 };
    totalAdded += arkJson.Articles.length;
    continue;
  }

  const arkJson = loadJSON(arkPath);
  const ourJson = loadJSON(ourPath);
  const ourBySlug = new Map((ourJson.Articles || []).map((x) => [x.slug, x]));

  let added = 0;
  let updated = 0;

  for (const a of (arkJson.Articles || [])) {
    const n = normalizeArticle(a);
    const existing = ourBySlug.get(n.slug);
    if (!existing) {
      (ourJson.Articles = ourJson.Articles || []).push(n);
      added++;
    } else {
      // compare dates if available
      const existingDate = existing.date || '';
      const incomingDate = n.date || '';
      if (incomingDate && (!existingDate || incomingDate > existingDate)) {
        // update
        Object.assign(existing, n);
        updated++;
      }
    }
  }

  // Sort articles by date desc when available to keep consistent ordering
  ourJson.Articles = (ourJson.Articles || []).sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    return 0;
  });

  saveJSON(ourPath, ourJson);
  perLocale[locale] = { added, updated };
  totalAdded += added;
  totalUpdated += updated;
}

console.log('Merge complete');
console.log('Per-locale:', perLocale);
console.log('Totals: added=', totalAdded, 'updated=', totalUpdated);
process.exit(0);
