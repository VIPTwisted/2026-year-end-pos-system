import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Ensure the CauseOfAbsence table exists (raw SQL fallback for builds where Prisma migration hasn't run)
async function ensureTable() {
  try {
    await (prisma as any).$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CauseOfAbsence" (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        "unitOfMeasure" TEXT NOT NULL DEFAULT 'Day',
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
  } catch { /* already exists */ }
}

export async function GET() {
  try {
    await ensureTable()
    const rows = await (prisma as any).$queryRawUnsafe(
      `SELECT * FROM "CauseOfAbsence" ORDER BY code ASC`
    ) as Array<{ id: string; code: string; description: string; unitOfMeasure: string; createdAt: string }>
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[GET /api/hr/setup/causes-of-absence]', err)
    return NextResponse.json({ error: 'Failed to fetch causes', detail: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable()
    const body = await req.json()
    const { code, description, unitOfMeasure } = body as { code: string; description: string; unitOfMeasure?: string }

    if (!code || !description) {
      return NextResponse.json({ error: 'code and description are required' }, { status: 400 })
    }

    const id = `coa_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const uom = unitOfMeasure ?? 'Day'

    await (prisma as any).$executeRawUnsafe(
      `INSERT INTO "CauseOfAbsence" (id, code, description, "unitOfMeasure") VALUES (?, ?, ?, ?)`,
      id, code.trim().toUpperCase(), description.trim(), uom
    )

    const rows = await (prisma as any).$queryRawUnsafe(
      `SELECT * FROM "CauseOfAbsence" WHERE id = ?`, id
    ) as Array<{ id: string; code: string; description: string; unitOfMeasure: string; createdAt: string }>

    return NextResponse.json(rows[0], { status: 201 })
  } catch (err: any) {
    if (String(err).includes('UNIQUE')) {
      return NextResponse.json({ error: 'A cause with that code already exists' }, { status: 409 })
    }
    console.error('[POST /api/hr/setup/causes-of-absence]', err)
    return NextResponse.json({ error: 'Failed to create cause', detail: String(err) }, { status: 500 })
  }
}
