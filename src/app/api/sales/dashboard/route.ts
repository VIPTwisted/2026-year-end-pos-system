import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [totalLeads, opportunities, wonDeals] = await Promise.all([
      prisma.salesLead.count(),
      prisma.salesOpportunity.findMany({
        where: { isWon: false, isLost: false },
        select: { amount: true },
      }),
      prisma.salesOpportunity.findMany({
        where: { isWon: true },
        select: { amount: true },
      }),
    ])

    const openOpportunities = opportunities.length
    const totalPipelineValue = opportunities.reduce((sum, o) => sum + o.amount, 0)
    const wonDealsCount = wonDeals.length
    const totalClosed = wonDealsCount + (await prisma.salesOpportunity.count({ where: { isLost: true } }))
    const conversionRate = totalClosed > 0 ? Math.round((wonDealsCount / totalClosed) * 100) : 0
    const avgDealSize = wonDealsCount > 0
      ? wonDeals.reduce((sum, o) => sum + o.amount, 0) / wonDealsCount
      : 0

    return NextResponse.json({
      totalLeads,
      openOpportunities,
      totalPipelineValue,
      wonDeals: wonDealsCount,
      conversionRate,
      avgDealSize,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
