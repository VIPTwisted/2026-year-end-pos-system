import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const fiscalYears = await prisma.fiscalYear.findMany({
      include: {
        periods: { orderBy: { periodNumber: 'asc' } },
        yearEndClose: true,
      },
      orderBy: { startDate: 'desc' },
    })

    return NextResponse.json(fiscalYears)
  } catch (error) {
    console.error('[GET /api/fiscal]', error)
    return NextResponse.json({ error: 'Failed to fetch fiscal years' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, startDate, endDate } = body

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'name, startDate, and endDate are required' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    if (start >= end) {
      return NextResponse.json({ error: 'startDate must be before endDate' }, { status: 400 })
    }

    // Auto-generate 12 monthly periods
    const periods: {
      periodNumber: number
      name: string
      startDate: Date
      endDate: Date
      status: string
    }[] = []

    let current = new Date(start)
    for (let i = 1; i <= 12; i++) {
      const periodStart = new Date(current)
      // End of month
      const periodEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59)

      // Don't go beyond fiscal year end
      const clampedEnd = periodEnd > end ? end : periodEnd

      periods.push({
        periodNumber: i,
        name: periodStart.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        startDate: periodStart,
        endDate: clampedEnd,
        status: 'open',
      })

      // Move to first of next month
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1)
      if (current > end) break
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
        periods: { orderBy: { periodNumber: 'asc' } },
        yearEndClose: true,
      },
    })

    return NextResponse.json(fiscalYear, { status: 201 })
  } catch (error: unknown) {
    console.error('[POST /api/fiscal]', error)
    if (
      error instanceof Error &&
      error.message.includes('Unique constraint failed')
    ) {
      return NextResponse.json({ error: 'Fiscal year name already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create fiscal year' }, { status: 500 })
  }
}
