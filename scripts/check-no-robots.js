#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const p = path.join(process.cwd(), 'public', 'robots.txt');
if (fs.existsSync(p)) {
  console.error('ERROR: public/robots.txt exists. We prefer metadata-based robots control and do not keep robots.txt in repo.');
  process.exit(1);
}
console.log('OK: public/robots.txt not present');
process.exit(0);
