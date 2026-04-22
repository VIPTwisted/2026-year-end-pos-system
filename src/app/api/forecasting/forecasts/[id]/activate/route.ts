import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const forecast = await prisma.demandForecast.update({
      where: { id },
      data: { status: 'active' },
      include: { lines: true },
    })
    return NextResponse.json(forecast)
  } catch (error) {
    console.error('POST /api/forecasting/forecasts/[id]/activate error:', error)
    return NextResponse.json({ error: 'Failed to activate forecast' }, { status: 500 })
  }
}
