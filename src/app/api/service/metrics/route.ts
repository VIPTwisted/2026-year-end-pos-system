import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [
    allCases,
    breachedCases,
    resolvedCases,
    satisfactionData,
    casesToday,
    queues,
  ] = await Promise.all([
    prisma.serviceCase2.findMany({
      select: { status: true, priority: true, channel: true, createdAt: true },
    }),
    prisma.serviceCase2.count({ where: { slaBreached: true } }),
    prisma.serviceCase2.findMany({
      where: { resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
    }),
    prisma.caseSatisfaction.findMany({ select: { rating: true } }),
    prisma.serviceCase2.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.caseQueue.findMany({
      include: {
        _count: {
          select: {
            cases: true,
          },
        },
      },
    }),
  ])

  // Open cases (not resolved/closed)
  const openCases = allCases.filter(
    (c) => !['resolved', 'closed'].includes(c.status)
  ).length

  // Avg resolution hours
  let avgResolutionHours = 0
  if (resolvedCases.length > 0) {
    const totalMs = resolvedCases.reduce((sum, c) => {
      if (!c.resolvedAt) return sum
      return sum + (c.resolvedAt.getTime() - c.createdAt.getTime())
    }, 0)
    avgResolutionHours = Math.round(totalMs / resolvedCases.length / 3600000)
  }

  // Avg CSAT
  let avgSatisfactionRating = 0
  if (satisfactionData.length > 0) {
    const total = satisfactionData.reduce((sum, s) => sum + s.rating, 0)
    avgSatisfactionRating = Math.round((total / satisfactionData.length) * 10) / 10
  }

  // Cases by status
  const statusMap: Record<string, number> = {}
  for (const c of allCases) {
    statusMap[c.status] = (statusMap[c.status] ?? 0) + 1
  }

  // Cases by priority
  const priorityMap: Record<string, number> = {}
  for (const c of allCases) {
    priorityMap[c.priority] = (priorityMap[c.priority] ?? 0) + 1
  }

  // Cases by channel
  const channelMap: Record<string, number> = {}
  for (const c of allCases) {
    const ch = c.channel ?? 'unknown'
    channelMap[ch] = (channelMap[ch] ?? 0) + 1
  }

  // Queue workload
  const queueWorkload = queues.map((q) => ({
    id:        q.id,
    name:      q.name,
    caseCount: q._count.cases,
    isActive:  q.isActive,
  }))

  return NextResponse.json({
    openCases,
    breachedSla:           breachedCases,
    avgResolutionHours,
    avgSatisfactionRating,
    casesToday,
    casesByStatus:         statusMap,
    casesByPriority:       priorityMap,
    casesByChannel:        channelMap,
    queueWorkload,
  })
}
