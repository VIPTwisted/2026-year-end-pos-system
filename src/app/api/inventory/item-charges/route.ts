import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')

  try {
    let where = `WHERE 1=1`
    if (search) {
      const s = search.replace(/'/g, "''")
      where += ` AND (ic.chargeNo LIKE '%${s}%' OR ic.description LIKE '%${s}%')`
    }

    const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(`
      SELECT * FROM ItemCharge ic ${where} ORDER BY ic.createdAt DESC
    `)
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await prisma.$executeRawUnsafe(`
      INSERT INTO ItemCharge (id, chargeNo, description, genProdPostingGroup, vatProdPostingGroup, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      id,
      body.chargeNo ?? `IC-${Date.now()}`,
      body.description ?? null,
      body.genProdPostingGroup ?? null,
      body.vatProdPostingGroup ?? null,
      now
    )

    const created = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM ItemCharge WHERE id = ?`, id
    )
    return NextResponse.json(created[0], { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
