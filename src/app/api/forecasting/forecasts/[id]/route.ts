import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const forecast = await prisma.demandForecast.findUnique({
      where: { id },
      include: { lines: true },
    })
    if (!forecast) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(forecast)
  } catch (error) {
    console.error('GET /api/forecasting/forecasts/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch forecast' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { forecastName, period, periodType, status, notes } = body

    const forecast = await prisma.demandForecast.update({
      where: { id },
      data: {
        ...(forecastName !== undefined ? { forecastName } : {}),
        ...(period !== undefined ? { period } : {}),
        ...(periodType !== undefined ? { periodType } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
      include: { lines: true },
    })

    return NextResponse.json(forecast)
  } catch (error) {
    console.error('PATCH /api/forecasting/forecasts/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update forecast' }, { status: 500 })
  }
}
