import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const event = await prisma.marketingEvent.findUnique({ where: { id } })
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const registration = await prisma.marketingRegistration.create({
    data: { eventId: id, customerName: body.customerName, email: body.email ?? null, phone: body.phone ?? null, status: 'registered' },
  })
  await prisma.marketingEvent.update({ where: { id }, data: { registered: { increment: 1 } } })
  return NextResponse.json(registration, { status: 201 })
}
