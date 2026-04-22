import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { pausedUntil } = await req.json()

  const existing = await prisma.subscription.findUnique({ where: { id }, select: { status: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const sub = await prisma.subscription.update({
    where: { id },
    data: {
      status: 'paused',
      pausedUntil: pausedUntil ? new Date(pausedUntil) : null,
    },
  })

  await prisma.subscriptionChurnEvent.create({
    data: {
      subscriptionId: id,
      eventType: 'paused',
      previousStatus: existing.status,
    },
  })

  return NextResponse.json(sub)
}
