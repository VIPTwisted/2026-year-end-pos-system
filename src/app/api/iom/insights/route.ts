import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalAll,
    totalMonth,
    deliveredToday,
    activeProviders,
    unresolvedErrors,
    stateDist,
    allOrchestrations,
    allReturns,
    allocations,
  ] = await Promise.all([
    prisma.orderOrchestration.count(),
    prisma.orderOrchestration.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.orderOrchestration.count({
      where: { state: 'delivered', updatedAt: { gte: startOfDay } },
    }),
    prisma.fulfillmentProvider.count({ where: { isActive: true } }),
    prisma.orchestrationError.count({ where: { isResolved: false } }),
    prisma.orderOrchestration.groupBy({
      by: ['state'],
      _count: { _all: true },
    }),
    prisma.orderOrchestration.findMany({
      where: { state: 'delivered' },
      select: { createdAt: true, updatedAt: true, promisedDate: true },
    }),
    prisma.returnOrchestration.count(),
    prisma.fulfillmentAllocation.findMany({
      where: { isSelected: true },
      include: {
        provider: { select: { id: true, name: true, type: true } },
      },
    }),
  ])

  // Avg fulfillment time
  const fulfillmentTimes = allOrchestrations.map((o) => {
    const ms = o.updatedAt.getTime() - o.createdAt.getTime()
    return ms / (1000 * 60 * 60 * 24) // days
  })
  const avgFulfillmentDays =
    fulfillmentTimes.length > 0
      ? fulfillmentTimes.reduce((a, b) => a + b, 0) / fulfillmentTimes.length
      : 0

  // On-time rate
  const onTime = allOrchestrations.filter(
    (o) => o.promisedDate && o.updatedAt <= o.promisedDate
  ).length
  const onTimeRate = allOrchestrations.length > 0 ? (onTime / allOrchestrations.length) * 100 : 0

  // Provider performance
  const providerStats: Record<
    string,
    { name: string; type: string; orders: number; totalCost: number; totalDays: number }
  > = {}
  for (const a of allocations) {
    if (!providerStats[a.providerId]) {
      providerStats[a.providerId] = {
        name: a.provider.name,
        type: a.provider.type,
        orders: 0,
        totalCost: 0,
        totalDays: 0,
      }
    }
    providerStats[a.providerId].orders++
    providerStats[a.providerId].totalCost += a.costEstimate
    providerStats[a.providerId].totalDays += a.daysEstimate
  }

  const providerPerformance = Object.entries(providerStats).map(([id, s]) => ({
    providerId: id,
    name: s.name,
    type: s.type,
    orders: s.orders,
    avgCost: s.orders > 0 ? s.totalCost / s.orders : 0,
    avgDays: s.orders > 0 ? s.totalDays / s.orders : 0,
  }))

  // Error rate
  const totalErrors = await prisma.orchestrationError.count()
  const ordersWithErrors = await prisma.orchestrationError.groupBy({
    by: ['orchestrationId'],
    _count: { _all: true },
  })
  const errorRate = totalAll > 0 ? (ordersWithErrors.length / totalAll) * 100 : 0

  const returnRate = totalAll > 0 ? (allReturns / totalAll) * 100 : 0

  return NextResponse.json({
    totalOrchestrated: { allTime: totalAll, thisMonth: totalMonth },
    deliveredToday,
    activeProviders,
    unresolvedErrors,
    avgFulfillmentDays: Number(avgFulfillmentDays.toFixed(2)),
    onTimeRate: Number(onTimeRate.toFixed(1)),
    stateDistribution: stateDist.map((s) => ({ state: s.state, count: s._count._all })),
    providerPerformance,
    errorRate: Number(errorRate.toFixed(1)),
    returnRate: Number(returnRate.toFixed(1)),
  })
}
