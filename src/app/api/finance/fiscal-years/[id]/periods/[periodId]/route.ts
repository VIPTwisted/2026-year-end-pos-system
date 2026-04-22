import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; periodId: string }> }
) {
  try {
    const { id, periodId } = await params
    const body = await req.json() as { status: string }

    if (!body.status || !['open', 'closed'].includes(body.status)) {
      return NextResponse.json({ error: 'status must be "open" or "closed"' }, { status: 400 })
    }

    // Verify period belongs to fiscal year
    const period = await prisma.fiscalPeriod.findFirst({
      where: { id: periodId, fiscalYearId: id },
    })
    if (!period) {
      return NextResponse.json({ error: 'Period not found' }, { status: 404 })
    }

    // Reopening: check fiscal year is still open
    if (body.status === 'open') {
      const fiscalYear = await prisma.fiscalYear.findUnique({ where: { id } })
      if (!fiscalYear) {
        return NextResponse.json({ error: 'Fiscal year not found' }, { status: 404 })
      }
      if (fiscalYear.status === 'closed') {
        return NextResponse.json(
          { error: 'Cannot reopen a period in a closed fiscal year' },
          { status: 400 }
        )
      }
    }

    const updateData: { status: string; closedAt: Date | null } = {
      status: body.status,
      closedAt: body.status === 'closed' ? new Date() : null,
    }

    const updated = await prisma.fiscalPeriod.update({
      where: { id: periodId },
      data: updateData,
    })

    return NextResponse.json({ period: updated })
  } catch (err) {
    console.error('[PATCH /api/finance/fiscal-years/[id]/periods/[periodId]]', err)
    return NextResponse.json({ error: 'Failed to update period' }, { status: 500 })
  }
}
