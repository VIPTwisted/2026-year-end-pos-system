import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const parent = searchParams.get('parent')

  try {
    let where = `WHERE 1=1`
    if (parent) where += ` AND bom.parentItemNo LIKE '%${parent.replace(/'/g, "''")}%'`

    const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(`
      SELECT * FROM BcAssemblyBOM bom ${where}
      ORDER BY bom.parentItemNo, bom.componentNo
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
      INSERT INTO BcAssemblyBOM (id, parentItemNo, description, unitOfMeasure, qty, type, componentNo, componentDescription, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      id,
      body.parentItemNo ?? null,
      body.description ?? null,
      body.unitOfMeasure ?? 'PCS',
      Number(body.qty ?? 1),
      body.type ?? 'Item',
      body.componentNo ?? null,
      body.componentDescription ?? null,
      now
    )

    const created = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM BcAssemblyBOM WHERE id = ?`, id
    )
    return NextResponse.json(created[0], { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
