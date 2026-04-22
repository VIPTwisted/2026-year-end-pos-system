// mirror-to-novapos.mjs — sync all new finance files to NovaPOS
// Run: node mirror-to-novapos.mjs

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');
const path = require('path');

const SRC = 'C:/Users/DeMar/Desktop/2026-year-end-pos';
const DST = 'C:/Users/DeMar/Desktop/NovaPOS';

const FILES = [
  // Finance pages
  'src/app/finance/chart-of-accounts/[id]/page.tsx',
  'src/app/finance/chart-of-accounts/new/page.tsx',
  'src/app/finance/gl-entries/page.tsx',
  'src/app/finance/bank-accounts/page.tsx',
  'src/app/finance/bank-accounts/[id]/page.tsx',
  'src/app/finance/bank-accounts/new/page.tsx',
  'src/app/finance/fixed-assets/page.tsx',
  'src/app/finance/fixed-assets/[id]/page.tsx',
  'src/app/finance/accounting-periods/page.tsx',
  'src/app/finance/budgets/page.tsx',
  'src/app/finance/cost-types/page.tsx',
  // API routes
  'src/app/api/finance/chart-of-accounts/route.ts',
  'src/app/api/finance/chart-of-accounts/[id]/route.ts',
  'src/app/api/finance/gl-entries/route.ts',
  'src/app/api/finance/bank-accounts/route.ts',
  'src/app/api/finance/bank-accounts/[id]/route.ts',
  'src/app/api/finance/accounting-periods/route.ts',
  // Sidebar
  'src/components/layout/Sidebar.tsx',
];

let ok = 0, fail = 0;

for (const rel of FILES) {
  const srcPath = path.join(SRC, rel);
  const dstPath = path.join(DST, rel);

  try {
    if (!fs.existsSync(srcPath)) {
      console.warn(`SKIP (src not found): ${rel}`);
      continue;
    }

    const dir = path.dirname(dstPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(srcPath, dstPath);
    console.log(`OK: ${rel}`);
    ok++;
  } catch (e) {
    console.error(`FAIL: ${rel} — ${e.message}`);
    fail++;
  }
}

console.log(`\nDone: ${ok} copied, ${fail} failed`);
