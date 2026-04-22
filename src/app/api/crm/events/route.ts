import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const events = await prisma.marketingEvent.findMany({
    include: { registrations: { select: { id: true, status: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const event = await prisma.marketingEvent.create({
    data: {
      name: body.name,
      eventType: body.eventType ?? 'webinar',
      venue: body.venue ?? null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      capacity: body.capacity ?? 50,
      status: body.status ?? 'planned',
      description: body.description ?? null,
    },
  })
  return NextResponse.json(event, { status: 201 })
}
