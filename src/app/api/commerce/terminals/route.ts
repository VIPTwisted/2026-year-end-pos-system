import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "PosTerminal" (
        id TEXT PRIMARY KEY,
        terminalId TEXT UNIQUE NOT NULL,
        storeId TEXT,
        storeName TEXT,
        name TEXT NOT NULL,
        hardwareProfile TEXT,
        screenLayout TEXT,
        offlineEnabled INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
    const { searchParams } = new URL(req.url)
    const storeId = searchParams.get('storeId')
    if (storeId) {
      const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
        SELECT * FROM "PosTerminal" WHERE storeId = ${storeId} ORDER BY terminalId ASC
      `
      return NextResponse.json(rows)
    }
    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT * FROM "PosTerminal" ORDER BY terminalId ASC
    `
    return NextResponse.json(rows)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "PosTerminal" (
        id TEXT PRIMARY KEY,
        terminalId TEXT UNIQUE NOT NULL,
        storeId TEXT,
        storeName TEXT,
        name TEXT NOT NULL,
        hardwareProfile TEXT,
        screenLayout TEXT,
        offlineEnabled INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `

    const body = await req.json()
    const {
      terminalId, storeId, storeName, name,
      hardwareProfile, screenLayout, offlineEnabled = false, status = 'Active',
    } = body as Record<string, unknown>

    if (!terminalId || typeof terminalId !== 'string' || !terminalId.trim()) {
      return NextResponse.json({ error: 'terminalId is required' }, { status: 400 })
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const id = `pt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    await prisma.$executeRaw`
      INSERT INTO "PosTerminal" (id, terminalId, storeId, storeName, name, hardwareProfile, screenLayout, offlineEnabled, status)
      VALUES (
        ${id}, ${(terminalId as string).trim().toUpperCase()},
        ${storeId ?? null}, ${storeName ?? null}, ${(name as string).trim()},
        ${hardwareProfile ?? null}, ${screenLayout ?? null},
        ${offlineEnabled ? 1 : 0}, ${status}
      )
    `
    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT * FROM "PosTerminal" WHERE id = ${id}
    `
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err: unknown) {
    const e = err as { message?: string }
    if (e.message?.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Terminal ID already exists' }, { status: 409 })
    }
    console.error('[commerce/terminals POST]', err)
    return NextResponse.json({ error: 'Failed to create terminal' }, { status: 500 })
  }
}
