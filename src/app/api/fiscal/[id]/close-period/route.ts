import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fiscalYearId } = await params
    const body = await request.json()
    const { periodId } = body

    if (!periodId) {
      return NextResponse.json({ error: 'periodId is required' }, { status: 400 })
    }

    // Verify period belongs to this fiscal year
    const period = await prisma.fiscalPeriod.findFirst({
      where: { id: periodId, fiscalYearId },
    })

    if (!period) {
      return NextResponse.json(
        { error: 'Period not found in this fiscal year' },
        { status: 404 }
      )
    }

    if (period.status === 'closed') {
      return NextResponse.json({ error: 'Period is already closed' }, { status: 400 })
    }

    if (period.status === 'on_hold') {
      return NextResponse.json(
        { error: 'Period is on hold — remove hold before closing' },
        { status: 400 }
      )
    }

    const updatedPeriod = await prisma.fiscalPeriod.update({
      where: { id: periodId },
      data: {
        status: 'closed',
        closedAt: new Date(),
      },
    })

    // Check if all periods in the fiscal year are now closed — if so, set FY to 'closing'
    const openPeriods = await prisma.fiscalPeriod.count({
      where: { fiscalYearId, status: { not: 'closed' } },
    })

    if (openPeriods === 0) {
      await prisma.fiscalYear.update({
        where: { id: fiscalYearId },
        data: { status: 'closing' },
      })
    }

    return NextResponse.json(updatedPeriod)
  } catch (error) {
    console.error('[POST /api/fiscal/[id]/close-period]', error)
    return NextResponse.json({ error: 'Failed to close period' }, { status: 500 })
  }
}
