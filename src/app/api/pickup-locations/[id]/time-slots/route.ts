import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const slots = await prisma.pickupTimeSlot.findMany({ where: { locationId: id }, orderBy: { dayOfWeek: 'asc' } })
  return NextResponse.json(slots)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const slot = await prisma.pickupTimeSlot.create({
    data: {
      locationId: id,
      dayOfWeek: body.dayOfWeek,
      openTime: body.openTime,
      closeTime: body.closeTime,
      slotDurationMin: body.slotDurationMin ?? 60,
      maxOrders: body.maxOrders ?? 10,
    },
  })
  return NextResponse.json(slot, { status: 201 })
}
