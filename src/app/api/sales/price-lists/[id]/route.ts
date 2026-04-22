import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM SalesPriceList WHERE id = ?`, id
    )
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const lines = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM SalesPriceListLine WHERE priceListId = ?`, id
    )
    return NextResponse.json({ ...rows[0], lines })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const sets: string[] = []
    const vals: unknown[] = []

    if (body.code !== undefined) { sets.push('code = ?'); vals.push(body.code) }
    if (body.description !== undefined) { sets.push('description = ?'); vals.push(body.description) }
    if (body.assignToType !== undefined) { sets.push('assignToType = ?'); vals.push(body.assignToType) }
    if (body.assignTo !== undefined) { sets.push('assignTo = ?'); vals.push(body.assignTo) }
    if (body.currency !== undefined) { sets.push('currency = ?'); vals.push(body.currency) }
    if (body.startingDate !== undefined) { sets.push('startingDate = ?'); vals.push(body.startingDate) }
    if (body.endingDate !== undefined) { sets.push('endingDate = ?'); vals.push(body.endingDate) }
    if (body.status !== undefined) { sets.push('status = ?'); vals.push(body.status) }

    if (sets.length) {
      await prisma.$executeRawUnsafe(
        `UPDATE SalesPriceList SET ${sets.join(', ')} WHERE id = ?`,
        ...vals, id
      )
    }

    const updated = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM SalesPriceList WHERE id = ?`, id
    )
    const lines = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM SalesPriceListLine WHERE priceListId = ?`, id
    )
    return NextResponse.json({ ...updated[0], lines })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
