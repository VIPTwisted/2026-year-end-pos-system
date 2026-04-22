import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { reason } = await req.json()

  const existing = await prisma.subscription.findUnique({ where: { id }, select: { status: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const sub = await prisma.subscription.update({
    where: { id },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelReason: reason ?? null,
    },
  })

  await prisma.subscriptionChurnEvent.create({
    data: {
      subscriptionId: id,
      eventType: 'cancelled',
      previousStatus: existing.status,
      reason: reason ?? null,
    },
  })

  return NextResponse.json(sub)
}
