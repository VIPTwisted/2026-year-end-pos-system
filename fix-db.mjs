// fix-db.mjs — apply schema changes directly via SQLite
// Run: node fix-db.mjs

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const path = require('path');

// Use Prisma's bundled SQLite driver
const dbPath = path.resolve('prisma/dev.db');

// We'll use the @prisma/adapter-libsql or just use the built-in sqlite driver
// Since better-sqlite3 is not available, use Node's sqlite (Node 22+) or Database
let db;
try {
  const sqlite = require('node:sqlite');
  db = new sqlite.DatabaseSync(dbPath);
  console.log('Using node:sqlite');
} catch {
  console.log('node:sqlite not available, trying Database from @prisma/...');
  process.exit(1);
}

// Helper: check if column exists
function hasColumn(table, col) {
  const rows = db.prepare(`PRAGMA table_info("${table}")`).all();
  return rows.some(r => r.name === col);
}

// Helper: check if table exists
function hasTable(table) {
  const row = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table);
  return !!row;
}

// 1. Add missing columns to BankAccount
const bankCols = [
  ['name', 'TEXT'],
  ['routingNumber', 'TEXT'],
  ['contactName', 'TEXT'],
  ['phone', 'TEXT'],
  ['email', 'TEXT'],
  ['address', 'TEXT'],
  ['city', 'TEXT'],
  ['state', 'TEXT'],
  ['zip', 'TEXT'],
  ['country', 'TEXT'],
  ['swiftCode', 'TEXT'],
  ['ibanNumber', 'TEXT'],
  ['lastStatementNo', 'TEXT'],
  ['lastStatementDate', 'DATETIME'],
  ['notes', 'TEXT'],
];

for (const [col, type] of bankCols) {
  if (!hasColumn('BankAccount', col)) {
    db.prepare(`ALTER TABLE "BankAccount" ADD COLUMN "${col}" ${type}`).run();
    console.log(`Added BankAccount.${col}`);
  } else {
    console.log(`BankAccount.${col} already exists`);
  }
}

// 2. Enrich BankReconciliation (stub → full model)
if (hasTable('BankReconciliation')) {
  const reconCols = [
    ['bankAccountId', 'TEXT NOT NULL DEFAULT ""'],
    ['statementDate', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP'],
    ['statementNo', 'TEXT'],
    ['openingBalance', 'REAL NOT NULL DEFAULT 0'],
    ['closingBalance', 'REAL NOT NULL DEFAULT 0'],
    ['status', "TEXT NOT NULL DEFAULT 'open'"],
    ['reconciledAt', 'DATETIME'],
    ['notes', 'TEXT'],
    ['updatedAt', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP'],
  ];
  for (const [col, type] of reconCols) {
    if (!hasColumn('BankReconciliation', col)) {
      db.prepare(`ALTER TABLE "BankReconciliation" ADD COLUMN "${col}" ${type}`).run();
      console.log(`Added BankReconciliation.${col}`);
    }
  }
}

// 3. Enrich BankTransaction (stub → full model)
if (hasTable('BankTransaction')) {
  const txCols = [
    ['bankAccountId', 'TEXT NOT NULL DEFAULT ""'],
    ['date', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP'],
    ['description', "TEXT NOT NULL DEFAULT ''"],
    ['amount', 'REAL NOT NULL DEFAULT 0'],
    ['runningBalance', 'REAL NOT NULL DEFAULT 0'],
    ['reference', 'TEXT'],
    ['category', 'TEXT'],
    ['isReconciled', 'BOOLEAN NOT NULL DEFAULT 0'],
    ['reconciledAt', 'DATETIME'],
    ['updatedAt', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP'],
  ];
  for (const [col, type] of txCols) {
    if (!hasColumn('BankTransaction', col)) {
      db.prepare(`ALTER TABLE "BankTransaction" ADD COLUMN "${col}" ${type}`).run();
      console.log(`Added BankTransaction.${col}`);
    }
  }
}

// 4. Create AccountingPeriod if not exists
if (!hasTable('AccountingPeriod')) {
  db.prepare(`CREATE TABLE "AccountingPeriod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startingDate" DATETIME NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "newFiscalYear" BOOLEAN NOT NULL DEFAULT 0,
    "closed" BOOLEAN NOT NULL DEFAULT 0,
    "dateLocked" BOOLEAN NOT NULL DEFAULT 0,
    "inventoryClosed" BOOLEAN NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  console.log('Created AccountingPeriod table');
} else {
  console.log('AccountingPeriod already exists');
}

// 5. Create CostType if not exists
if (!hasTable('CostType')) {
  db.prepare(`CREATE TABLE "CostType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "no" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'cost_type',
    "glAccountRange" TEXT,
    "costCenterId" TEXT,
    "blocked" BOOLEAN NOT NULL DEFAULT 0,
    "indentation" INTEGER NOT NULL DEFAULT 0,
    "totalingRange" TEXT,
    "netChange" REAL NOT NULL DEFAULT 0,
    "balance" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  console.log('Created CostType table');
} else {
  console.log('CostType already exists');
}

// GlEntry should already exist from prior push — confirm
if (hasTable('GlEntry')) {
  console.log('GlEntry already exists - OK');
} else {
  db.prepare(`CREATE TABLE "GlEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryNo" INTEGER NOT NULL DEFAULT 0,
    "postingDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documentType" TEXT,
    "documentNo" TEXT,
    "accountId" TEXT,
    "accountNo" TEXT,
    "accountName" TEXT,
    "description" TEXT,
    "debitAmount" REAL NOT NULL DEFAULT 0,
    "creditAmount" REAL NOT NULL DEFAULT 0,
    "amount" REAL NOT NULL DEFAULT 0,
    "vatAmount" REAL NOT NULL DEFAULT 0,
    "sourceCode" TEXT,
    "reasonCode" TEXT,
    "userId" TEXT,
    "journalId" TEXT,
    "fiscalYear" TEXT,
    "periodNo" INTEGER,
    "open" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  console.log('Created GlEntry table');
}

console.log('\nDone! All schema changes applied.');
db.close();
