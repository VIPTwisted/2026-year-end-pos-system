import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period')
    const fiscalYear = searchParams.get('fiscalYear')
    const where: Record<string, string> = {}
    if (period) where.period = period
    if (fiscalYear) where.fiscalYear = fiscalYear
    const forecasts = await prisma.salesForecast.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(forecasts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch forecasts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const forecast = await prisma.salesForecast.create({ data: body })
    return NextResponse.json(forecast, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create forecast' }, { status: 500 })
  }
}
