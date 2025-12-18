#!/usr/bin/env node
// QA script for ressources.json
// - Find AI/Microsoft/Azure related articles and ensure they include a "## Practical tips" section
// - Add short, conservative tips tailored to Microsoft/Azure/Office Add-ins use cases
// - Flag tone issues (excessive caps) for manual review

const fs = require('fs');
const path = require('path');

const LOCALES = ['en','fr','de','es','pt'];
const TRANSLATIONS_DIR = path.join(process.cwd(),'src','translations');

const MATCH_RX = /\b(ai|azure|microsoft|gpt|outlook|word|add-?in|m365|office|copilot)\b/i;
const TIP_MAP = [
  'Keep examples concrete: show 1-2 configuration steps (Azure resource, ask prompt), and test with a small dataset first.',
  'Prefer RAG (retrieval-augmented generation) for grounding answers: index internal docs, add answer citations and logging.',
  'Deploy models in a Swiss region for data sovereignty and enable proper moderation + access controls (Azure AD, role-based).',
];

let changes = [];
let toneFlags = [];

for (const locale of LOCALES) {
  const file = path.join(TRANSLATIONS_DIR, locale, 'ressources.json');
  if (!fs.existsSync(file)) continue;
  const json = JSON.parse(fs.readFileSync(file,'utf8'));
  const articles = Array.isArray(json.Articles)?json.Articles:[];
  let updated = false;

  for (const a of articles) {
    const body = String(a.content || '');
    const title = String(a.title || '');

    // Tone check: detect many ALL-CAPS words in title/description
    const capsTokens = (title.match(/[A-Z]{2,}/g)||[]).filter(t => t.length>2 && t !== 'AI');
    if (capsTokens.length>0) {
      toneFlags.push({locale, slug:a.slug, title, capsTokens: capsTokens.slice(0,5)});
    }

    if (MATCH_RX.test(title) || MATCH_RX.test(body) || MATCH_RX.test(String(a.description||''))) {
      // Check for 'Practical tips' or '## Tips' presence
      if (!/##\s*(practical tips|tips|how to|how-to)/i.test(body)) {
        // Append a small Practical tips section at the end
        const tipsSection = '\n\n## Practical tips for Microsoft/Azure\n' + TIP_MAP.map(t => '- ' + t).join('\n') + '\n';
        a.content = body + tipsSection;
        updated = true;
        changes.push({locale, slug: a.slug, title: a.title});
      }
    }
  }

  if (updated) {
    fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n', 'utf8');
    console.log(`Updated locale ${locale}: added tips to ${changes.filter(c=>c.locale===locale).length} articles`);
  }
}

console.log('QA complete. Articles updated:', changes.length);
if (toneFlags.length>0) {
  console.log('Tone flags (suggest manual review):', toneFlags.slice(0,20));
}

process.exit(0);
