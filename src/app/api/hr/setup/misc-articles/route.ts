import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function ensureTable() {
  try {
    await (prisma as any).$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MiscArticle" (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        "articleType" TEXT NOT NULL DEFAULT 'Equipment',
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
  } catch { /* already exists */ }
}

export async function GET() {
  try {
    await ensureTable()
    const rows = await (prisma as any).$queryRawUnsafe(
      `SELECT * FROM "MiscArticle" ORDER BY code ASC`
    ) as Array<{ id: string; code: string; description: string; articleType: string; createdAt: string }>
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[GET /api/hr/setup/misc-articles]', err)
    return NextResponse.json({ error: 'Failed to fetch misc. articles', detail: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable()
    const body = await req.json()
    const { code, description, articleType } = body as { code: string; description: string; articleType?: string }

    if (!code || !description) {
      return NextResponse.json({ error: 'code and description are required' }, { status: 400 })
    }

    const id = `ma_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

    await (prisma as any).$executeRawUnsafe(
      `INSERT INTO "MiscArticle" (id, code, description, "articleType") VALUES (?, ?, ?, ?)`,
      id, code.trim().toUpperCase(), description.trim(), articleType ?? 'Equipment'
    )

    const rows = await (prisma as any).$queryRawUnsafe(
      `SELECT * FROM "MiscArticle" WHERE id = ?`, id
    ) as Array<{ id: string; code: string; description: string; articleType: string; createdAt: string }>

    return NextResponse.json(rows[0], { status: 201 })
  } catch (err: any) {
    if (String(err).includes('UNIQUE')) {
      return NextResponse.json({ error: 'A misc. article with that code already exists' }, { status: 409 })
    }
    console.error('[POST /api/hr/setup/misc-articles]', err)
    return NextResponse.json({ error: 'Failed to create misc. article', detail: String(err) }, { status: 500 })
  }
}
