import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [allSubs, churnEvents, billing] = await Promise.all([
    prisma.subscription.findMany({ select: { status: true, billingAmount: true, totalBilled: true, startDate: true, cancelledAt: true } }),
    prisma.subscriptionChurnEvent.findMany({ select: { eventType: true, createdAt: true } }),
    prisma.subscriptionBilling.findMany({ select: { amount: true, status: true, billingDate: true } }),
  ])

  const active = allSubs.filter(s => s.status === 'active')
  const trial = allSubs.filter(s => s.status === 'trial')
  const pastDue = allSubs.filter(s => s.status === 'past-due')
  const cancelled = allSubs.filter(s => s.status === 'cancelled')

  const mrr = active.reduce((sum, s) => sum + s.billingAmount, 0)
  const arr = mrr * 12
  const totalAll = allSubs.length

  const cancellationsThisMonth = churnEvents.filter(e => {
    const d = new Date(e.createdAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && e.eventType === 'cancelled'
  }).length

  const churnRate = totalAll > 0 ? Math.round((cancellationsThisMonth / totalAll) * 100 * 10) / 10 : 0
  const avgLifetimeValue = cancelled.length > 0
    ? cancelled.reduce((sum, s) => sum + s.totalBilled, 0) / cancelled.length
    : 0

  const now = new Date()
  const revenueByMonth: { month: string; amount: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleString('default', { month: 'short', year: '2-digit' })
    const amt = billing
      .filter(b => {
        const bd = new Date(b.billingDate)
        return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear() && b.status === 'paid'
      })
      .reduce((sum, b) => sum + b.amount, 0)
    revenueByMonth.push({ month: label, amount: amt })
  }

  return NextResponse.json({
    totalActive: active.length,
    totalTrial: trial.length,
    totalPastDue: pastDue.length,
    mrr,
    arr,
    churnRate,
    avgLifetimeValue,
    revenueByMonth,
  })
}
