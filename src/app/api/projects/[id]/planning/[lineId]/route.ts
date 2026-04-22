import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; lineId: string }> }) {
  const { lineId } = await params
  try {
    const body = await req.json()
    const { description, quantity, unitPrice, unitCost, plannedDate, isBillable, isTransferred } = body

    const qty = quantity !== undefined ? parseFloat(quantity) : undefined
    const price = unitPrice !== undefined ? parseFloat(unitPrice) : undefined
    const cost = unitCost !== undefined ? parseFloat(unitCost) : undefined

    const existing = qty === undefined || price === undefined
      ? await prisma.projectPlanningLine.findUnique({ where: { id: lineId } })
      : null

    const newQty = qty ?? Number(existing?.quantity ?? 1)
    const newPrice = price ?? Number(existing?.unitPrice ?? 0)

    const line = await prisma.projectPlanningLine.update({
      where: { id: lineId },
      data: {
        ...(description !== undefined && { description: description.trim() }),
        ...(qty !== undefined && { quantity: qty }),
        ...(price !== undefined && { unitPrice: price }),
        ...(cost !== undefined && { unitCost: cost }),
        lineAmount: newQty * newPrice,
        ...(plannedDate !== undefined && { plannedDate: plannedDate ? new Date(plannedDate) : null }),
        ...(isBillable !== undefined && { isBillable }),
        ...(isTransferred !== undefined && { isTransferred }),
      },
    })
    return NextResponse.json(line)
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; lineId: string }> }) {
  const { lineId } = await params
  try {
    await prisma.projectPlanningLine.delete({ where: { id: lineId } })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
