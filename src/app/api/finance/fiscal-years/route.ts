import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const years = await prisma.fiscalYear.findMany({
      include: {
        periods: {
          orderBy: { periodNumber: 'asc' },
        },
      },
      orderBy: { startDate: 'desc' },
    })
    return NextResponse.json({ fiscalYears: years })
  } catch (err) {
    console.error('[GET /api/finance/fiscal-years]', err)
    return NextResponse.json({ error: 'Failed to load fiscal years' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { name: string; startDate: string; endDate: string }
    const { name, startDate, endDate } = body

    if (!name || !startDate || !endDate) {
      return NextResponse.json({ error: 'name, startDate, and endDate are required' }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    if (end <= start) {
      return NextResponse.json({ error: 'endDate must be after startDate' }, { status: 400 })
    }

    // Build 12 monthly periods
    const periods: Array<{
      periodNumber: number
      name: string
      startDate: Date
      endDate: Date
      status: string
    }> = []

    for (let i = 0; i < 12; i++) {
      const periodStart = new Date(start.getFullYear(), start.getMonth() + i, 1)
      const periodEnd = new Date(start.getFullYear(), start.getMonth() + i + 1, 0)

      // Clamp to fiscal year boundaries
      const clampedStart = periodStart < start ? start : periodStart
      const clampedEnd = periodEnd > end ? end : periodEnd

      const monthName = clampedStart.toLocaleString('en-US', { month: 'long', year: 'numeric' })

      periods.push({
        periodNumber: i + 1,
        name: monthName,
        startDate: clampedStart,
        endDate: clampedEnd,
        status: 'open',
      })
    }

    const fiscalYear = await prisma.fiscalYear.create({
      data: {
        name,
        startDate: start,
        endDate: end,
        status: 'open',
        periods: {
          create: periods,
        },
      },
      include: {
        periods: {
          orderBy: { periodNumber: 'asc' },
        },
      },
    })

    return NextResponse.json({ fiscalYear }, { status: 201 })
  } catch (err: unknown) {
    console.error('[POST /api/finance/fiscal-years]', err)
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json({ error: 'A fiscal year with that name already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create fiscal year' }, { status: 500 })
  }
}
