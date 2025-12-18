#!/usr/bin/env node
// Normalize SPFx occurrences across translation JSON files to 'SPFx'
// Operates on src/translations/**/*.json

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TRANSLATIONS = path.join(ROOT, 'src', 'translations');

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkDir(p);
    else if (/\.json$/.test(e.name)) normalizeFile(p);
  }
}

function normalizeFile(file) {
  let changed = false;
  const raw = fs.readFileSync(file, 'utf8');
  // We'll perform replacements in keys and values but be conservative: only replace common variants
  let out = raw
    // SPFX / SPFx / spfx -> SPFx
    .replace(/\bSPFX\b/gi, 'SPFx')
    .replace(/\bSPF\b/g, 'SPFx') // common broken split where X dropped
    .replace(/\bspfx\b/gi, 'SPFx')
    ;
  if (out !== raw) {
    fs.writeFileSync(file, out, 'utf8');
    changed = true;
  }
  if (changed) console.log('[normalize-spfx] updated', file);
}

walkDir(TRANSLATIONS);
console.log('Normalization complete.');
