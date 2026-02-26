#!/usr/bin/env node
'use strict';
/**
 * Repair article references in ressources.json across all locales.
 *
 * Strategy (in order of preference):
 *  1. URL moved (301/308 redirect) → update stored URL to the redirect target.
 *  2. URL truly broken (404/410/network error) → remove reference.
 *  3. After removal, if article falls below MIN_REFS → fill in verified official
 *     fallback references based on the article's detected topic.
 *
 * This is better than pure removal: it preserves content behind redirects and
 * replaces dead links with relevant, verified official sources.
 *
 * Usage:
 *   node scripts/repair-article-refs.js [--all-locales] [--locale fr] [--dry-run] [--min-refs 3]
 */
const fs = require('fs');
const path = require('path');
const { validateUrl, deduplicateByDomain, getFallbackReferences } = require('./lib/referenceValidator');
const { listLocales } = require('./lib/ressources');

const ROOT = process.cwd();
const TRANSLATIONS_DIR = path.join(ROOT, 'src', 'translations');
const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const value = (f, d) => { const i = args.indexOf(f); return i !== -1 && i + 1 < args.length ? args[i + 1] : d; };

const allLocales = flag('--all-locales');
const oneLocale = value('--locale', 'fr');
const dryRun = flag('--dry-run');
const MIN_REFS = parseInt(value('--min-refs', '3'), 10);
const TIMEOUT_MS = parseInt(value('--timeout-ms', process.env.LINK_CHECK_TIMEOUT_MS || '10000'), 10);
const MIN_BYTES = parseInt(value('--min-bytes', process.env.LINK_CHECK_MIN_BYTES || '600'), 10);

// Transient errors should not cause removal (network blip, server overload).
const TRANSIENT_REASONS = new Set(['server-error', 'timeout', 'network-error', 'http-error']);

// Lightweight topic detection based on article slug/title/description.
const TOPIC_PATTERNS = [
  { topic: 'ai',           patterns: [/\bai\b/i, /intelligence artificielle/i, /machine learning/i, /deep learning/i, /llm/i, /chatgpt/i, /gpt/i, /neural/i] },
  { topic: 'automation',   patterns: [/automati/i, /workflow/i, /robotics/i, /rpa/i] },
  { topic: 'marketing',    patterns: [/marketing/i, /seo/i, /content/i, /branding/i, /social media/i] },
  { topic: 'productivity', patterns: [/productivit/i, /efficiency/i, /tools/i, /software/i] },
  { topic: 'business',     patterns: [/business/i, /entreprise/i, /startup/i, /strategy/i] },
  { topic: 'technology',   patterns: [/technolog/i, /innovation/i, /digital/i, /data/i] },
];

function detectTopic(article) {
  if (!article) return 'general';
  const base = `${article.slug || ''} ${article.title || ''} ${article.description || ''}`.toLowerCase();
  for (const { topic, patterns } of TOPIC_PATTERNS) {
    if (patterns.some((rx) => rx.test(base))) return topic;
  }
  return 'general';
}

async function repairLocale(locale) {
  const filePath = path.join(TRANSLATIONS_DIR, locale, 'ressources.json');
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  No ressources.json for locale: ${locale}`);
    return { locale, skipped: true };
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`❌ Failed to parse ${locale}/ressources.json: ${e.message}`);
    return { locale, error: 'parse_error' };
  }

  const articles = Array.isArray(data.Articles) ? data.Articles : [];
  let totalUpdated = 0;
  let totalRemoved = 0;
  let totalAdded = 0;
  let totalDeduplicated = 0;

  console.log(`\n🔧 Repairing locale: ${locale}`);

  for (const article of articles) {
    if (!Array.isArray(article.references)) continue;

    // Deduplicate by domain first
    const beforeDedup = article.references.length;
    article.references = deduplicateByDomain(article.references);
    const deduped = beforeDedup - article.references.length;
    if (deduped > 0) {
      console.log(`  🔄 [${article.slug}] Removed ${deduped} duplicate domain reference(s)`);
      totalDeduplicated += deduped;
    }

    const repairedRefs = [];

    for (const ref of article.references) {
      if (!ref || typeof ref.url !== 'string' || !/^https?:\/\//.test(ref.url)) {
        console.log(`  ⚠️  [${article.slug}] Invalid URL format, removing: ${ref?.url || 'undefined'}`);
        totalRemoved++;
        continue;
      }

      const result = await validateUrl(ref.url, { timeout: TIMEOUT_MS, minBytes: MIN_BYTES, checkContent: true });

      if (result.valid) {
        // URL is reachable — check whether it redirected to a different URL
        if (result.finalUrl && result.finalUrl !== ref.url) {
          console.log(`  🔀 [${article.slug}] Updated redirect: ${ref.url}\n      → ${result.finalUrl}`);
          repairedRefs.push({ ...ref, url: result.finalUrl });
          totalUpdated++;
        } else {
          repairedRefs.push(ref);
        }
      } else if (TRANSIENT_REASONS.has(result.reason)) {
        // Transient failure — keep the reference, do not remove
        console.log(`  ⏭️  [${article.slug}] Keeping (transient error): ${ref.url} (${result.reason})`);
        repairedRefs.push(ref);
      } else {
        // Permanently broken — remove
        console.log(`  🗑️  [${article.slug}] Removing dead link: ${ref.url} (${result.reason})`);
        totalRemoved++;
      }
    }

    article.references = repairedRefs;

    // If article now has fewer refs than the minimum, fill with verified fallbacks
    if (article.references.length < MIN_REFS) {
      const topic = detectTopic(article);
      const fallbacks = getFallbackReferences(topic);
      const existingUrls = new Set(article.references.map((r) => r.url));

      for (const fb of fallbacks) {
        if (article.references.length >= MIN_REFS) break;
        if (existingUrls.has(fb.url)) continue;
        // Verify fallback is reachable before adding
        const check = await validateUrl(fb.url, { timeout: TIMEOUT_MS, minBytes: MIN_BYTES, checkContent: false });
        if (check.valid) {
          console.log(`  ➕ [${article.slug}] Added fallback (${topic}): ${fb.url}`);
          article.references.push({ labelKey: fb.labelKey, url: fb.url });
          existingUrls.add(fb.url);
          totalAdded++;
        }
      }
    }
  }

  const anyChange = totalUpdated + totalRemoved + totalAdded + totalDeduplicated > 0;
  if (anyChange) {
    if (dryRun) {
      console.log(`\n🔸 [DRY RUN] Would write ${locale}/ressources.json (updated: ${totalUpdated}, removed: ${totalRemoved}, added: ${totalAdded}, deduped: ${totalDeduplicated})`);
    } else {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
      console.log(`\n✅ ${locale}/ressources.json written (updated: ${totalUpdated}, removed: ${totalRemoved}, added: ${totalAdded}, deduped: ${totalDeduplicated})`);
    }
  } else {
    console.log(`\n✅ No changes needed for ${locale}`);
  }

  return { locale, updated: totalUpdated, removed: totalRemoved, added: totalAdded, deduplicated: totalDeduplicated };
}

async function main() {
  if (typeof fetch !== 'function') {
    console.error('❌ This script requires Node.js 20.x (global fetch)');
    process.exit(1);
  }

  const locales = allLocales
    ? listLocales(TRANSLATIONS_DIR, { requireRessources: true })
    : [oneLocale];

  console.log(`🔧 Repairing article references for locales: ${locales.join(', ')}`);
  if (dryRun) console.log('🔸 DRY RUN MODE — no files will be modified\n');

  const results = [];
  for (const locale of locales) {
    results.push(await repairLocale(locale));
  }

  const totalUpdated = results.reduce((s, r) => s + (r.updated || 0), 0);
  const totalRemoved = results.reduce((s, r) => s + (r.removed || 0), 0);
  const totalAdded = results.reduce((s, r) => s + (r.added || 0), 0);
  const totalDeduplicated = results.reduce((s, r) => s + (r.deduplicated || 0), 0);

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Summary: updated ${totalUpdated} redirects, removed ${totalRemoved} dead links, added ${totalAdded} fallbacks, deduped ${totalDeduplicated}`);
  console.log('='.repeat(60));

  if ((totalUpdated + totalRemoved + totalAdded + totalDeduplicated) > 0 && !dryRun) {
    console.log('✅ Files updated. Commit the changes to apply them.');
  }
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
