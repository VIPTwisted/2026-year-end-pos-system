import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/manufacturing/db-init
 * Ensures all manufacturing raw SQL tables exist (idempotent).
 * Safe to call multiple times — uses CREATE TABLE IF NOT EXISTS.
 */
export async function POST() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS "ProductionOrder" (
      id TEXT PRIMARY KEY,
      orderNo TEXT UNIQUE,
      status TEXT DEFAULT 'Planned',
      itemNo TEXT,
      description TEXT,
      quantity REAL DEFAULT 1,
      dueDate TEXT,
      locationCode TEXT,
      costAmount REAL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "ProductionBom" (
      id TEXT PRIMARY KEY,
      bomNo TEXT UNIQUE,
      description TEXT,
      unitOfMeasure TEXT DEFAULT 'each',
      status TEXT DEFAULT 'New',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "ProductionBomLine" (
      id TEXT PRIMARY KEY,
      bomId TEXT,
      lineType TEXT DEFAULT 'Item',
      componentNo TEXT,
      description TEXT,
      quantity REAL DEFAULT 1,
      unitOfMeasure TEXT DEFAULT 'each',
      scrapPercent REAL DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS "Routing" (
      id TEXT PRIMARY KEY,
      routingNo TEXT UNIQUE,
      description TEXT,
      status TEXT DEFAULT 'New',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "RoutingLine" (
      id TEXT PRIMARY KEY,
      routingId TEXT,
      operationNo TEXT,
      workCenterNo TEXT,
      machineCenterNo TEXT,
      setupTime REAL DEFAULT 0,
      runTime REAL DEFAULT 1,
      waitTime REAL DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS "WorkCenter" (
      id TEXT PRIMARY KEY,
      centerNo TEXT UNIQUE,
      name TEXT,
      workCenterGroup TEXT,
      capacity REAL DEFAULT 1,
      efficiency REAL DEFAULT 100,
      blocked BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "MachineCenter" (
      id TEXT PRIMARY KEY,
      centerNo TEXT UNIQUE,
      name TEXT,
      workCenterId TEXT,
      capacity REAL DEFAULT 1,
      efficiency REAL DEFAULT 100,
      blocked BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  ]

  const results: string[] = []
  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql)
    const tableName = sql.match(/"(\w+)"/)?.[1] ?? 'unknown'
    results.push(`✓ ${tableName}`)
  }

  return NextResponse.json({
    ok: true,
    message: 'Manufacturing tables initialized',
    tables: results,
  })
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to initialize tables' })
}
