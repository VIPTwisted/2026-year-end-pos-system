import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Context {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, { params }: Context) {
  try {
    const { id } = await params
    const period = await prisma.payrollPeriod.findUnique({
      where: { id },
      include: {
        entries: {
          include: {
            employee: { include: { user: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!period) {
      return NextResponse.json({ error: 'Payroll period not found' }, { status: 404 })
    }

    return NextResponse.json(period)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch period' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status, action } = body

    // action: 'approveAll' — approve all draft entries in this period
    if (action === 'approveAll') {
      await prisma.payrollEntry.updateMany({
        where: { periodId: id, status: 'draft' },
        data: { status: 'approved' },
      })

      // also flip period to processing
      const updated = await prisma.payrollPeriod.update({
        where: { id },
        data: { status: 'processing' },
        include: { entries: { include: { employee: { include: { user: true } } } } },
      })
      return NextResponse.json(updated)
    }

    // plain status update
    if (!status) {
      return NextResponse.json({ error: 'status or action required' }, { status: 400 })
    }

    const period = await prisma.payrollPeriod.update({
      where: { id },
      data: { status },
    })
    return NextResponse.json(period)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update period' }, { status: 500 })
  }
}
