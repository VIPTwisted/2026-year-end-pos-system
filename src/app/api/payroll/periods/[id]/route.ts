import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const period = await prisma.payrollPeriod.findUnique({
      where: { id },
      include: {
        entries: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                position: true,
                department: true,
                hourlyRate: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!period) {
      return NextResponse.json({ error: 'Period not found' }, { status: 404 })
    }

    return NextResponse.json(period)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status, notes } = body

    const validStatuses = ['open', 'processing', 'paid', 'void']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const period = await prisma.payrollPeriod.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    })

    return NextResponse.json(period)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
