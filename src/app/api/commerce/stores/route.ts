import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const stores = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT * FROM "CommerceStore" ORDER BY name ASC
    `
    return NextResponse.json(stores)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "CommerceStore" (
        id TEXT PRIMARY KEY,
        storeNo TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        channelId TEXT,
        channelType TEXT DEFAULT 'RetailStore',
        currency TEXT DEFAULT 'USD',
        taxGroup TEXT,
        taxRate REAL DEFAULT 0.0825,
        timeZone TEXT DEFAULT 'America/New_York',
        address TEXT,
        city TEXT,
        state TEXT,
        zip TEXT,
        phone TEXT,
        email TEXT,
        statementMethod TEXT DEFAULT 'EndOfDay',
        statementIntervalHours REAL DEFAULT 24,
        emailReceipt INTEGER DEFAULT 0,
        bgOperationsEnabled INTEGER DEFAULT 1,
        status TEXT DEFAULT 'Active',
        terminalCount INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `

    const body = await req.json()
    const {
      storeNo, name, channelId, channelType = 'RetailStore',
      currency = 'USD', taxGroup, taxRate = 0.0825, timeZone = 'America/New_York',
      address, city, state, zip, phone, email,
      statementMethod = 'EndOfDay', emailReceipt = false,
      bgOperationsEnabled = true, status = 'Active',
    } = body as Record<string, unknown>

    if (!storeNo || typeof storeNo !== 'string' || !storeNo.trim()) {
      return NextResponse.json({ error: 'storeNo is required' }, { status: 400 })
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const id = `cs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    await prisma.$executeRaw`
      INSERT INTO "CommerceStore" (
        id, storeNo, name, channelId, channelType, currency, taxGroup, taxRate, timeZone,
        address, city, state, zip, phone, email, statementMethod, emailReceipt,
        bgOperationsEnabled, status
      ) VALUES (
        ${id}, ${(storeNo as string).trim().toUpperCase()}, ${(name as string).trim()},
        ${channelId ?? null}, ${channelType}, ${currency}, ${taxGroup ?? null},
        ${taxRate}, ${timeZone}, ${address ?? null}, ${city ?? null},
        ${state ?? null}, ${zip ?? null}, ${phone ?? null}, ${email ?? null},
        ${statementMethod}, ${emailReceipt ? 1 : 0}, ${bgOperationsEnabled ? 1 : 0}, ${status}
      )
    `
    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT * FROM "CommerceStore" WHERE id = ${id}
    `
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err: unknown) {
    const e = err as { message?: string }
    if (e.message?.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Store number already exists' }, { status: 409 })
    }
    console.error('[commerce/stores POST]', err)
    return NextResponse.json({ error: 'Failed to create store' }, { status: 500 })
  }
}
