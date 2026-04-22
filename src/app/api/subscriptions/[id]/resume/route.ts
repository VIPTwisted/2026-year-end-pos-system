import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function computeNextBillingDate(from: Date, cycle: string): Date {
  const d = new Date(from)
  switch (cycle) {
    case 'weekly':    d.setDate(d.getDate() + 7); break
    case 'quarterly': d.setMonth(d.getMonth() + 3); break
    case 'annually':  d.setFullYear(d.getFullYear() + 1); break
    default:          d.setMonth(d.getMonth() + 1); break
  }
  return d
}

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = await prisma.subscription.findUnique({
    where: { id },
    include: { plan: true },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const nextBillingDate = computeNextBillingDate(new Date(), existing.plan.billingCycle)

  const sub = await prisma.subscription.update({
    where: { id },
    data: {
      status: 'active',
      pausedUntil: null,
      nextBillingDate,
    },
  })

  await prisma.subscriptionChurnEvent.create({
    data: {
      subscriptionId: id,
      eventType: 'reactivated',
      previousStatus: existing.status,
    },
  })

  return NextResponse.json(sub)
}
