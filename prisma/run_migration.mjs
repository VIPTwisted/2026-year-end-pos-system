/**
 * Migration runner — no better-sqlite3 required.
 * Uses @prisma/client $executeRawUnsafe to apply each CREATE TABLE statement.
 * Usage: node prisma/run_migration.mjs   (from repo root)
 */
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sqlPath = join(__dirname, 'add_price_lists_charges_assembly_reminders.sql')
const adapter = new PrismaLibSql({ url: 'file:prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

const sql = readFileSync(sqlPath, 'utf8')
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))

for (const stmt of statements) {
  try {
    await prisma.$executeRawUnsafe(stmt)
    const tableName = stmt.match(/CREATE TABLE IF NOT EXISTS "(\w+)"/)?.[1]
    if (tableName) console.log(`  created: ${tableName}`)
  } catch (e) {
    console.error(`  ERROR: ${e.message}`)
    console.error(`  SQL: ${stmt.slice(0, 80)}...`)
  }
}

await prisma.$disconnect()
console.log('Done.')
