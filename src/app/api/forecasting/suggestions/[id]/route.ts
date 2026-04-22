import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const suggestion = await prisma.replenishmentSuggestion.update({
      where: { id },
      data: {
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.urgency !== undefined ? { urgency: body.urgency } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        ...(body.suggestedQty !== undefined ? { suggestedQty: Number(body.suggestedQty) } : {}),
        ...(body.approvedBy !== undefined ? { approvedBy: body.approvedBy } : {}),
        ...(body.purchaseOrderId !== undefined ? { purchaseOrderId: body.purchaseOrderId } : {}),
      },
    })

    return NextResponse.json(suggestion)
  } catch (error) {
    console.error('PATCH /api/forecasting/suggestions/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update suggestion' }, { status: 500 })
  }
}
