import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface CustomerWithOrders {
  id: string
  firstName: string
  lastName: string
  email: string | null
  orders: {
    totalAmount: number
    createdAt: Date
    status: string
  }[]
}

interface RFMCustomer {
  id: string
  firstName: string
  lastName: string
  email: string | null
  recencyDays: number
  frequency: number
  monetary: number
  rScore: number
  fScore: number
  mScore: number
  rfmScore: number
  segment: string
}

function quintileScore(value: number, sorted: number[], higherIsBetter: boolean): number {
  const n = sorted.length
  if (n === 0) return 3
  if (n === 1) return 3

  const rank = sorted.findIndex(v => v >= value)
  const pct = rank === -1 ? 1 : rank / n

  // Split into 5 buckets: 0-20%, 20-40%, 40-60%, 60-80%, 80-100%
  let bucket: number
  if (pct < 0.2) bucket = 1
  else if (pct < 0.4) bucket = 2
  else if (pct < 0.6) bucket = 3
  else if (pct < 0.8) bucket = 4
  else bucket = 5

  return higherIsBetter ? bucket : 6 - bucket
}

function getSegment(score: number): string {
  if (score >= 13) return 'Champions'
  if (score >= 10) return 'Loyal Customers'
  if (score >= 7) return 'Potential Loyalists'
  if (score >= 4) return 'At Risk'
  return 'Lost'
}

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        orders: {
          select: {
            totalAmount: true,
            createdAt: true,
            status: true,
          },
        },
      },
    }) as CustomerWithOrders[]

    const now = new Date()

    // Filter to customers with at least 1 valid order
    const withOrders = customers
      .map(c => {
        const validOrders = c.orders.filter(
          o => o.status !== 'voided' && o.status !== 'returned'
        )
        return { customer: c, validOrders }
      })
      .filter(({ validOrders }) => validOrders.length > 0)

    // Compute raw R/F/M values
    const rawData = withOrders.map(({ customer, validOrders }) => {
      const lastOrder = validOrders.reduce((latest, o) =>
        o.createdAt > latest.createdAt ? o : latest
      )
      const recencyDays = Math.floor(
        (now.getTime() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      const frequency = validOrders.length
      const monetary = validOrders.reduce((sum, o) => sum + o.totalAmount, 0)

      return {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        recencyDays,
        frequency,
        monetary,
      }
    })

    // Build sorted arrays for quintile calculation
    const sortedRecency = [...rawData.map(d => d.recencyDays)].sort((a, b) => a - b)
    const sortedFrequency = [...rawData.map(d => d.frequency)].sort((a, b) => a - b)
    const sortedMonetary = [...rawData.map(d => d.monetary)].sort((a, b) => a - b)

    // Score each customer
    const rfmCustomers: RFMCustomer[] = rawData.map(d => {
      // Recency: lower days = better (higherIsBetter = false on raw value)
      // We want lowest recencyDays → score 5, so we flip: higher sort rank = lower score for recency
      const rScore = quintileScore(d.recencyDays, sortedRecency, false)
      const fScore = quintileScore(d.frequency, sortedFrequency, true)
      const mScore = quintileScore(d.monetary, sortedMonetary, true)
      const rfmScore = rScore + fScore + mScore
      const segment = getSegment(rfmScore)

      return {
        id: d.id,
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email,
        recencyDays: d.recencyDays,
        frequency: d.frequency,
        monetary: Math.round(d.monetary * 100) / 100,
        rScore,
        fScore,
        mScore,
        rfmScore,
        segment,
      }
    })

    // Sort by RFM score desc
    rfmCustomers.sort((a, b) => b.rfmScore - a.rfmScore)

    // Aggregate segment counts
    const segments: Record<string, number> = {
      Champions: 0,
      'Loyal Customers': 0,
      'Potential Loyalists': 0,
      'At Risk': 0,
      Lost: 0,
    }
    for (const c of rfmCustomers) {
      segments[c.segment] = (segments[c.segment] ?? 0) + 1
    }

    return NextResponse.json({ customers: rfmCustomers, segments })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
