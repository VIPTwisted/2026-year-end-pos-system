import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function advanceDate(from: Date, cycle: string): Date {
  const d = new Date(from)
  switch (cycle) {
    case 'weekly':    d.setDate(d.getDate() + 7); break
    case 'quarterly': d.setMonth(d.getMonth() + 3); break
    case 'annually':  d.setFullYear(d.getFullYear() + 1); break
    default:          d.setMonth(d.getMonth() + 1); break
  }
  return d
}

export async function POST() {
  const now = new Date()

  const due = await prisma.subscription.findMany({
    where: {
      status: 'active',
      nextBillingDate: { lte: now },
    },
    include: {
      plan: { select: { billingCycle: true } },
      _count: { select: { billingCycles: true } },
    },
  })

  let processed = 0

  for (const sub of due) {
    const cycleNumber = sub._count.billingCycles + 1
    const nextBillingDate = advanceDate(sub.nextBillingDate ?? now, sub.plan.billingCycle)

    await prisma.subscriptionBilling.create({
      data: {
        subscriptionId: sub.id,
        cycleNumber,
        billingDate: now,
        amount: sub.billingAmount,
        status: 'paid',
        paymentMethod: 'auto',
        paymentRef: `AUTO-${Date.now()}-${sub.id.slice(-4)}`,
      },
    })

    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        totalBilled: { increment: sub.billingAmount },
        nextBillingDate,
      },
    })

    processed++
  }

  return NextResponse.json({ processed, total: due.length })
}
