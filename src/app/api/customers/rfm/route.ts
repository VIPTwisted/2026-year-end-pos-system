import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function scoreQuintile(value: number, sorted: number[], invert = false): number {
  if (sorted.length === 0) return 3
  const rank = sorted.filter(v => v <= value).length
  const pct = rank / sorted.length
  if (invert) {
    if (pct <= 0.2) return 5
    if (pct <= 0.4) return 4
    if (pct <= 0.6) return 3
    if (pct <= 0.8) return 2
    return 1
  }
  if (pct <= 0.2) return 1
  if (pct <= 0.4) return 2
  if (pct <= 0.6) return 3
  if (pct <= 0.8) return 4
  return 5
}

function getSegment(r: number, f: number, m: number): string {
  if (r >= 4 && f >= 4 && m >= 4) return 'Champions'
  if (r === 1 && f >= 2) return 'Lost'
  if (r <= 2 && f >= 3) return 'At Risk'
  if (f >= 4) return 'Loyal'
  if (r === 5 && f === 1) return 'New'
  if (r >= 3 && f <= 2) return 'Potential Loyalists'
  if (r <= 2 && f <= 2) return 'Hibernating'
  return 'Others'
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format')

  const now = new Date()

  // Get all customers with their orders
  const customers = await prisma.customer.findMany({
    where: { isActive: true },
    include: {
      orders: {
        where: { status: { notIn: ['voided', 'cancelled'] } },
        select: { id: true, totalAmount: true, createdAt: true },
      },
    },
  })

  // Only include customers that have at least 1 order
  const withOrders = customers.filter(c => c.orders.length > 0)

  // Compute raw R, F, M
  const rawData = withOrders.map(c => {
    const lastOrder = c.orders.reduce((a, b) => (a.createdAt > b.createdAt ? a : b))
    const recencyDays = Math.floor((now.getTime() - lastOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    const frequency = c.orders.length
    const monetary = c.orders.reduce((sum, o) => sum + o.totalAmount, 0)
    return { customer: c, recencyDays, frequency, monetary, lastOrderDate: lastOrder.createdAt }
  })

  // Build sorted arrays for quintile scoring
  const sortedRecency = [...rawData.map(d => d.recencyDays)].sort((a, b) => a - b)
  const sortedFrequency = [...rawData.map(d => d.frequency)].sort((a, b) => a - b)
  const sortedMonetary = [...rawData.map(d => d.monetary)].sort((a, b) => a - b)

  const rfmData = rawData.map(d => {
    // R: lower days = higher score (invert)
    const rScore = scoreQuintile(d.recencyDays, sortedRecency, true)
    const fScore = scoreQuintile(d.frequency, sortedFrequency, false)
    const mScore = scoreQuintile(d.monetary, sortedMonetary, false)
    const segment = getSegment(rScore, fScore, mScore)

    return {
      customerId: d.customer.id,
      customerName: `${d.customer.firstName} ${d.customer.lastName}`,
      email: d.customer.email,
      recencyDays: d.recencyDays,
      frequency: d.frequency,
      monetary: d.monetary,
      rScore,
      fScore,
      mScore,
      rfmScore: `${rScore}${fScore}${mScore}`,
      segment,
      lastOrderDate: d.lastOrderDate,
    }
  })

  if (format === 'csv') {
    const header = 'Customer,Email,Recency Days,Frequency,Monetary,R,F,M,Segment,Last Order\n'
    const rows = rfmData.map(r =>
      `"${r.customerName}","${r.email ?? ''}",${r.recencyDays},${r.frequency},${r.monetary.toFixed(2)},${r.rScore},${r.fScore},${r.mScore},"${r.segment}","${r.lastOrderDate.toISOString()}"`
    ).join('\n')
    return new Response(header + rows, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="rfm-analysis.csv"',
      },
    })
  }

  // Segment counts
  const segmentCounts: Record<string, number> = {}
  for (const row of rfmData) {
    segmentCounts[row.segment] = (segmentCounts[row.segment] ?? 0) + 1
  }

  const avgRecency = rfmData.length > 0
    ? rfmData.reduce((sum, r) => sum + r.recencyDays, 0) / rfmData.length
    : 0
  const avgSpend = rfmData.length > 0
    ? rfmData.reduce((sum, r) => sum + r.monetary, 0) / rfmData.length
    : 0

  return NextResponse.json({
    customers: rfmData,
    segmentCounts,
    kpis: {
      total: rfmData.length,
      champions: segmentCounts['Champions'] ?? 0,
      atRisk: segmentCounts['At Risk'] ?? 0,
      lost: segmentCounts['Lost'] ?? 0,
      avgRecencyDays: Math.round(avgRecency),
      avgSpend,
    },
  })
}
