import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function monthKey(date: Date): string {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const fromParam = sp.get('from')
    const toParam = sp.get('to')

    const now = new Date()
    const fromDate = fromParam
      ? startOfDay(new Date(fromParam))
      : startOfDay(new Date(now.getFullYear(), now.getMonth(), 1))
    const toDate = toParam ? endOfDay(new Date(toParam)) : endOfDay(now)

    // ── Completed orders in period ─────────────────────────────────────────
    const completedOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: fromDate, lte: toDate },
        status: 'completed',
      },
      include: {
        customer: { select: { firstName: true, lastName: true } },
        items: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // ── Returns in period ──────────────────────────────────────────────────
    const returns = await prisma.salesReturn.findMany({
      where: {
        createdAt: { gte: fromDate, lte: toDate },
        status: 'completed',
      },
    })

    // ── TaxTransaction records in period ──────────────────────────────────
    const taxTransactions = await prisma.taxTransaction.findMany({
      where: {
        taxDate: { gte: fromDate, lte: toDate },
        sourceType: 'order',
      },
      include: {
        taxCode: true,
      },
    })

    // ── Summary calculations ───────────────────────────────────────────────
    let totalSales = 0
    let totalTaxCollected = 0
    let taxableOrders = 0
    let exemptOrders = 0

    for (const o of completedOrders) {
      totalSales += o.subtotal
      totalTaxCollected += o.taxAmount
      if (o.taxAmount > 0) {
        taxableOrders++
      } else {
        exemptOrders++
      }
    }

    const totalRefunded = returns.reduce((s, r) => s + r.total, 0)
    const taxRefunded = returns.reduce((s, r) => s + r.taxRefund, 0)
    const netSales = totalSales - totalRefunded

    // ── By-tax-code breakdown ──────────────────────────────────────────────
    // If TaxTransaction records exist, group by tax code from them
    // Otherwise fall back to active TaxCodes and assign all order tax proportionally
    let byTaxCode: Array<{
      code: string
      name: string
      rate: number
      taxableAmount: number
      taxCollected: number
      orderCount: number
    }>

    if (taxTransactions.length > 0) {
      const codeMap = new Map<
        string,
        {
          code: string
          name: string
          rate: number
          taxableAmount: number
          taxCollected: number
          orderIds: Set<string>
        }
      >()

      for (const tx of taxTransactions) {
        const key = tx.taxCode.code
        const existing = codeMap.get(key) ?? {
          code: tx.taxCode.code,
          name: tx.taxCode.name,
          rate: tx.taxCode.rate,
          taxableAmount: 0,
          taxCollected: 0,
          orderIds: new Set<string>(),
        }
        existing.taxableAmount += tx.taxableAmount
        existing.taxCollected += tx.taxAmount
        existing.orderIds.add(tx.sourceId)
        codeMap.set(key, existing)
      }

      byTaxCode = Array.from(codeMap.values())
        .map(({ orderIds, ...rest }) => ({ ...rest, orderCount: orderIds.size }))
        .sort((a, b) => b.taxCollected - a.taxCollected)
    } else {
      // Fallback: use active TaxCodes, assign all collected tax to the first active code
      const activeCodes = await prisma.taxCode.findMany({
        where: { isActive: true, taxType: 'sales' },
        orderBy: { rate: 'desc' },
      })

      if (activeCodes.length > 0) {
        byTaxCode = activeCodes.map((tc, idx) => ({
          code: tc.code,
          name: tc.name,
          rate: tc.rate,
          // Assign all tax to the primary (highest-rate) code as fallback
          taxableAmount: idx === 0 ? totalSales : 0,
          taxCollected: idx === 0 ? totalTaxCollected : 0,
          orderCount: idx === 0 ? taxableOrders : 0,
        }))
      } else {
        byTaxCode = [
          {
            code: 'DEFAULT',
            name: 'Sales Tax',
            rate: totalSales > 0 && totalTaxCollected > 0 ? (totalTaxCollected / totalSales) * 100 : 0,
            taxableAmount: totalSales,
            taxCollected: totalTaxCollected,
            orderCount: taxableOrders,
          },
        ]
      }
    }

    // ── Monthly breakdown ──────────────────────────────────────────────────
    const monthMap = new Map<string, { sales: number; tax: number; orders: number }>()
    for (const o of completedOrders) {
      const key = monthKey(o.createdAt)
      const existing = monthMap.get(key) ?? { sales: 0, tax: 0, orders: 0 }
      monthMap.set(key, {
        sales: existing.sales + o.subtotal,
        tax: existing.tax + o.taxAmount,
        orders: existing.orders + 1,
      })
    }

    const byPeriod = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { sales, tax, orders }]) => ({ date, sales, tax, orders }))

    return NextResponse.json({
      period: {
        from: fromDate.toISOString().slice(0, 10),
        to: toDate.toISOString().slice(0, 10),
      },
      summary: {
        totalSales,
        totalTaxCollected,
        taxableOrders,
        exemptOrders,
        netSales,
      },
      byTaxCode,
      byPeriod,
      returns: {
        totalRefunded,
        taxRefunded,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
