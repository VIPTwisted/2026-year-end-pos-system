import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const vendor = searchParams.get('vendor')

  try {
    let where = `WHERE 1=1`
    if (status && status !== 'All') where += ` AND pl.status = '${status.replace(/'/g, "''")}'`
    if (vendor) where += ` AND (pl.assignTo LIKE '%${vendor.replace(/'/g, "''")}%')`

    const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(`
      SELECT pl.*, COUNT(ll.id) AS lineCount
      FROM PurchasePriceList pl
      LEFT JOIN PurchasePriceListLine ll ON ll.priceListId = pl.id
      ${where}
      GROUP BY pl.id
      ORDER BY pl.createdAt DESC
    `)
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { lines, ...h } = body
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await prisma.$executeRawUnsafe(`
      INSERT INTO PurchasePriceList (id, code, description, assignToType, assignTo, currency, startingDate, endingDate, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      id,
      h.code ?? `PPL-${Date.now()}`,
      h.description ?? null,
      h.assignToType ?? 'All Vendors',
      h.assignTo ?? null,
      h.currency ?? 'USD',
      h.startingDate ?? null,
      h.endingDate ?? null,
      h.status ?? 'Draft',
      now
    )

    if (Array.isArray(lines)) {
      for (const l of lines) {
        const lid = crypto.randomUUID()
        await prisma.$executeRawUnsafe(`
          INSERT INTO PurchasePriceListLine (id, priceListId, productType, productNo, description, unitOfMeasure, minQty, directUnitCost, allowLineDisc)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          lid, id,
          l.productType ?? 'Item',
          l.productNo ?? null,
          l.description ?? null,
          l.unitOfMeasure ?? 'each',
          Number(l.minQty ?? 0),
          Number(l.directUnitCost ?? 0),
          l.allowLineDisc !== false ? 1 : 0
        )
      }
    }

    const created = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM PurchasePriceList WHERE id = ?`, id
    )
    return NextResponse.json(created[0], { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
