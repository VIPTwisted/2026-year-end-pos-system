import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { purchaseOrderId } = body

    const suggestion = await prisma.replenishmentSuggestion.update({
      where: { id },
      data: {
        status: 'ordered',
        purchaseOrderId: purchaseOrderId ?? null,
      },
    })

    return NextResponse.json(suggestion)
  } catch (error) {
    console.error('POST /api/forecasting/suggestions/[id]/order error:', error)
    return NextResponse.json({ error: 'Failed to mark suggestion as ordered' }, { status: 500 })
  }
}
