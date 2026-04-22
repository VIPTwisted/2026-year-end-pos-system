import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: forecastId } = await params
    const body = await req.json()
    const { lineId, actualQty } = body

    if (!lineId || actualQty === undefined) {
      return NextResponse.json({ error: 'lineId and actualQty are required' }, { status: 400 })
    }

    const existing = await prisma.forecastLine.findFirst({
      where: { id: lineId, forecastId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Line not found' }, { status: 404 })
    }

    const variance = Number(actualQty) - existing.forecastedQty

    const line = await prisma.forecastLine.update({
      where: { id: lineId },
      data: {
        actualQty: Number(actualQty),
        variance,
      },
    })

    return NextResponse.json(line)
  } catch (error) {
    console.error('POST /api/forecasting/forecasts/[id]/actuals error:', error)
    return NextResponse.json({ error: 'Failed to update actuals' }, { status: 500 })
  }
}
