import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const periodType = searchParams.get('periodType')
    const status = searchParams.get('status')

    const forecasts = await prisma.demandForecast.findMany({
      where: {
        ...(periodType ? { periodType } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        lines: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(forecasts)
  } catch (error) {
    console.error('GET /api/forecasting/forecasts error:', error)
    return NextResponse.json({ error: 'Failed to fetch forecasts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { forecastName, periodType, period, notes, createdBy } = body

    if (!forecastName || !period) {
      return NextResponse.json({ error: 'forecastName and period are required' }, { status: 400 })
    }

    const forecast = await prisma.demandForecast.create({
      data: {
        forecastName,
        period,
        periodType: periodType ?? 'monthly',
        notes,
        createdBy,
        status: 'draft',
      },
      include: { lines: true },
    })

    return NextResponse.json(forecast, { status: 201 })
  } catch (error) {
    console.error('POST /api/forecasting/forecasts error:', error)
    return NextResponse.json({ error: 'Failed to create forecast' }, { status: 500 })
  }
}
