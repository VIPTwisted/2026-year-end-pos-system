import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const resourceId = searchParams.get('resourceId')
  const projectId = searchParams.get('projectId')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const bookings = await prisma.resourceBooking.findMany({
    where: {
      ...(resourceId && { resourceId }),
      ...(projectId && { projectId }),
      ...(from && { startDate: { gte: new Date(from) } }),
      ...(to && { endDate: { lte: new Date(to) } }),
    },
    include: {
      resource: { select: { id: true, name: true, resourceNo: true } },
    },
    orderBy: { startDate: 'asc' },
  })
  return NextResponse.json(bookings)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { resourceId, projectId, startDate, endDate, hours, status, notes } = body as {
      resourceId: string
      projectId?: string
      startDate: string
      endDate: string
      hours: number
      status?: string
      notes?: string
    }

    const booking = await prisma.resourceBooking.create({
      data: {
        resourceId,
        projectId: projectId ?? null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        hours,
        status: status ?? 'soft',
        notes: notes ?? null,
      },
      include: {
        resource: { select: { id: true, name: true, resourceNo: true } },
      },
    })
    return NextResponse.json(booking, { status: 201 })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 })
  }
}
