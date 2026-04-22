import { createClient } from '@libsql/client';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'dev.db');
const client = createClient({ url: `file:${dbPath}` });

const statements = [
  `CREATE TABLE IF NOT EXISTS "Job" (
    id TEXT PRIMARY KEY,
    jobNo TEXT UNIQUE,
    description TEXT,
    customerId TEXT,
    responsible TEXT,
    status TEXT DEFAULT 'Planning',
    percentComplete REAL DEFAULT 0,
    totalContractPrice REAL DEFAULT 0,
    totalScheduleCost REAL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "JobTask" (
    id TEXT PRIMARY KEY,
    jobId TEXT,
    taskNo TEXT,
    description TEXT,
    taskType TEXT DEFAULT 'Posting',
    percentComplete REAL DEFAULT 0,
    scheduleTotalCost REAL DEFAULT 0,
    usageTotalCost REAL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS "JobPlanningLine" (
    id TEXT PRIMARY KEY,
    jobId TEXT,
    taskId TEXT,
    lineType TEXT DEFAULT 'Budget',
    entryType TEXT DEFAULT 'Resource',
    resourceNo TEXT,
    description TEXT,
    planningDate TEXT,
    quantity REAL DEFAULT 1,
    unitPrice REAL DEFAULT 0,
    totalPrice REAL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS "JobLedgerEntry" (
    id TEXT PRIMARY KEY,
    jobNo TEXT,
    taskNo TEXT,
    entryType TEXT DEFAULT 'Resource',
    postingDate TEXT,
    resourceNo TEXT,
    description TEXT,
    quantity REAL DEFAULT 1,
    totalCost REAL DEFAULT 0,
    totalPrice REAL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "BCResource" (
    id TEXT PRIMARY KEY,
    resourceNo TEXT UNIQUE,
    name TEXT,
    resourceType TEXT DEFAULT 'Person',
    baseUnit TEXT DEFAULT 'hour',
    unitPrice REAL DEFAULT 0,
    unitCost REAL DEFAULT 0,
    useTimeSheet INTEGER DEFAULT 1,
    blocked INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "ResourceGroup" (
    id TEXT PRIMARY KEY,
    groupNo TEXT UNIQUE,
    name TEXT,
    unitOfMeasure TEXT DEFAULT 'hour',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "BCTimeSheet" (
    id TEXT PRIMARY KEY,
    sheetNo TEXT UNIQUE,
    resourceId TEXT,
    startDate TEXT,
    endDate TEXT,
    ownerId TEXT,
    status TEXT DEFAULT 'Open',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
];

async function run() {
  let ok = 0, skipped = 0;
  for (const sql of statements) {
    try {
      await client.execute(sql);
      ok++;
    } catch (e) {
      if (e.message && (e.message.includes('already exists') || e.message.includes('duplicate column'))) {
        skipped++;
      } else {
        console.error('FAIL:', sql.substring(0, 80), '\n', e.message);
      }
    }
  }
  console.log(`Done: ${ok} created, ${skipped} skipped`);
  await client.close();
}
run();
