import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, 'dev.db')
const sqlPath = join(__dirname, 'add_price_lists_charges_assembly_reminders.sql')

const db = new Database(dbPath)
const sql = readFileSync(sqlPath, 'utf8')

const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))

for (const stmt of statements) {
  try {
    db.exec(stmt + ';')
    const tableName = stmt.match(/CREATE TABLE IF NOT EXISTS "(\w+)"/)?.[1]
    if (tableName) console.log(`  created: ${tableName}`)
  } catch (e) {
    console.error(`  ERROR: ${e.message}`)
    console.error(`  SQL: ${stmt.slice(0, 80)}...`)
  }
}

db.close()
console.log('Done.')
