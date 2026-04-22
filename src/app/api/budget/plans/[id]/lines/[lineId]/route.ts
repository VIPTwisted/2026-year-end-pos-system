import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/budget/plans/[id]/lines/[lineId]
// Body: { amount }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; lineId: string }> }
) {
  try {
    const { id, lineId } = await params
    const body = await req.json() as { amount?: number }

    if (body.amount === undefined || body.amount === null) {
      return NextResponse.json({ error: 'amount is required' }, { status: 400 })
    }

    if (typeof body.amount !== 'number' || body.amount < 0) {
      return NextResponse.json({ error: 'amount must be a non-negative number' }, { status: 400 })
    }

    const entry = await prisma.budgetEntry.findFirst({
      where: { id: lineId, budgetPlanId: id },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Budget entry not found' }, { status: 404 })
    }

    const updated = await prisma.budgetEntry.update({
      where: { id: lineId },
      data: { budgetAmount: body.amount },
      include: {
        account: { select: { id: true, code: true, name: true, type: true, balance: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error('[PATCH /api/budget/plans/[id]/lines/[lineId]]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/budget/plans/[id]/lines/[lineId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; lineId: string }> }
) {
  try {
    const { id, lineId } = await params

    const entry = await prisma.budgetEntry.findFirst({
      where: { id: lineId, budgetPlanId: id },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Budget entry not found' }, { status: 404 })
    }

    await prisma.budgetEntry.delete({ where: { id: lineId } })

    return new NextResponse(null, { status: 204 })
  } catch (e) {
    console.error('[DELETE /api/budget/plans/[id]/lines/[lineId]]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
