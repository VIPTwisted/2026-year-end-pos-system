import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await prisma.marketingEvent.findUnique({
    where: { id },
    include: { registrations: { orderBy: { registeredAt: 'desc' } } },
  })
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(event)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updated = await prisma.marketingEvent.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.eventType !== undefined && { eventType: body.eventType }),
      ...(body.venue !== undefined && { venue: body.venue }),
      ...(body.startDate !== undefined && { startDate: body.startDate ? new Date(body.startDate) : null }),
      ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
      ...(body.capacity !== undefined && { capacity: body.capacity }),
      ...(body.registered !== undefined && { registered: body.registered }),
      ...(body.attended !== undefined && { attended: body.attended }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.description !== undefined && { description: body.description }),
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.marketingEvent.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
