import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fiscalYear = await prisma.fiscalYear.findUnique({
      where: { id },
      include: {
        periods: {
          orderBy: { periodNumber: 'asc' },
        },
      },
    })
    if (!fiscalYear) {
      return NextResponse.json({ error: 'Fiscal year not found' }, { status: 404 })
    }
    return NextResponse.json({ fiscalYear })
  } catch (err) {
    console.error('[GET /api/finance/fiscal-years/[id]]', err)
    return NextResponse.json({ error: 'Failed to load fiscal year' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json() as { name?: string; status?: string }

    const existing = await prisma.fiscalYear.findUnique({
      where: { id },
      include: { periods: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Fiscal year not found' }, { status: 404 })
    }

    // If closing the year, verify all periods are closed
    if (body.status === 'closed') {
      const hasOpenPeriods = existing.periods.some((p) => p.status !== 'closed')
      if (hasOpenPeriods) {
        return NextResponse.json(
          { error: 'All periods must be closed before closing the fiscal year' },
          { status: 400 }
        )
      }
    }

    const updateData: {
      name?: string
      status?: string
      closedAt?: Date | null
    } = {}

    if (body.name !== undefined) {
      updateData.name = body.name
    }
    if (body.status !== undefined) {
      updateData.status = body.status
      if (body.status === 'closed') {
        updateData.closedAt = new Date()
      }
    }

    const fiscalYear = await prisma.fiscalYear.update({
      where: { id },
      data: updateData,
      include: {
        periods: {
          orderBy: { periodNumber: 'asc' },
        },
      },
    })

    return NextResponse.json({ fiscalYear })
  } catch (err: unknown) {
    console.error('[PATCH /api/finance/fiscal-years/[id]]', err)
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json({ error: 'A fiscal year with that name already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update fiscal year' }, { status: 500 })
  }
}
