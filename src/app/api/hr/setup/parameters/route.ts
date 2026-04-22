import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const TABLE = 'HrSetupParameters'
const ROW_ID = 'singleton'

async function ensureTable() {
  try {
    await (prisma as any).$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${TABLE}" (
        id TEXT PRIMARY KEY DEFAULT 'singleton',
        data TEXT NOT NULL,
        "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
  } catch { /* already exists */ }
}

export async function GET() {
  try {
    await ensureTable()
    const rows = await (prisma as any).$queryRawUnsafe(
      `SELECT data FROM "${TABLE}" WHERE id = ?`, ROW_ID
    ) as Array<{ data: string }>
    if (rows.length === 0) {
      return NextResponse.json(null)
    }
    return NextResponse.json(JSON.parse(rows[0].data))
  } catch (err) {
    console.error('[GET /api/hr/setup/parameters]', err)
    return NextResponse.json({ error: 'Failed to fetch parameters', detail: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureTable()
    const body = await req.json()
    const dataStr = JSON.stringify(body)
    const now = new Date().toISOString()

    // Upsert
    const existing = await (prisma as any).$queryRawUnsafe(
      `SELECT id FROM "${TABLE}" WHERE id = ?`, ROW_ID
    ) as Array<{ id: string }>

    if (existing.length > 0) {
      await (prisma as any).$executeRawUnsafe(
        `UPDATE "${TABLE}" SET data = ?, "updatedAt" = ? WHERE id = ?`,
        dataStr, now, ROW_ID
      )
    } else {
      await (prisma as any).$executeRawUnsafe(
        `INSERT INTO "${TABLE}" (id, data, "updatedAt") VALUES (?, ?, ?)`,
        ROW_ID, dataStr, now
      )
    }

    return NextResponse.json({ ok: true, updatedAt: now })
  } catch (err) {
    console.error('[PATCH /api/hr/setup/parameters]', err)
    return NextResponse.json({ error: 'Failed to save parameters', detail: String(err) }, { status: 500 })
  }
}
