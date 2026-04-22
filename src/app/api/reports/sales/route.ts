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

function periodKey(date: Date, groupBy: string): string {
  const d = new Date(date)
  if (groupBy === 'month') {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  if (groupBy === 'week') {
    // ISO week: find Monday of this week
    const day = d.getDay() // 0=Sun
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
    return monday.toISOString().slice(0, 10)
  }
  // day
  return new Date(date).toISOString().slice(0, 10)
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const fromParam = sp.get('from')
    const toParam = sp.get('to')
    const groupBy = (sp.get('groupBy') ?? 'day') as 'day' | 'week' | 'month'

    const now = new Date()
    const fromDate = fromParam ? startOfDay(new Date(fromParam)) : startOfDay(new Date(now.getFullYear(), now.getMonth(), 1))
    const toDate = toParam ? endOfDay(new Date(toParam)) : endOfDay(now)

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: fromDate, lte: toDate },
        status: { not: 'voided' },
      },
      include: {
        items: true,
        payments: true,
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    // ── Summary ──────────────────────────────────────────────────────────
    let totalRevenue = 0
    let totalTax = 0
    let totalDiscount = 0
    let totalItems = 0

    for (const o of orders) {
      totalRevenue += o.totalAmount
      totalTax += o.taxAmount
      totalDiscount += o.discountAmount
      totalItems += o.items.reduce((s, i) => s + i.quantity, 0)
    }

    const totalOrders = orders.length
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const netRevenue = totalRevenue - totalTax

    // ── Period breakdown ──────────────────────────────────────────────────
    const periodMap = new Map<string, { revenue: number; orders: number }>()
    for (const o of orders) {
      const key = periodKey(o.createdAt, groupBy)
      const existing = periodMap.get(key) ?? { revenue: 0, orders: 0 }
      periodMap.set(key, {
        revenue: existing.revenue + o.totalAmount,
        orders: existing.orders + 1,
      })
    }

    const breakdown = Array.from(periodMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, { revenue, orders: cnt }]) => ({
        period,
        revenue,
        orders: cnt,
        avgOrder: cnt > 0 ? revenue / cnt : 0,
      }))

    // ── Top products ──────────────────────────────────────────────────────
    const productMap = new Map<string, { name: string; sku: string; units: number; revenue: number }>()
    for (const o of orders) {
      for (const item of o.items) {
        const existing = productMap.get(item.productId) ?? { name: item.productName, sku: item.sku, units: 0, revenue: 0 }
        productMap.set(item.productId, {
          name: item.productName,
          sku: item.sku,
          units: existing.units + item.quantity,
          revenue: existing.revenue + item.lineTotal,
        })
      }
    }

    const topProducts = Array.from(productMap.entries())
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // ── Top customers ──────────────────────────────────────────────────────
    const customerMap = new Map<string, { name: string; orders: number; spent: number }>()
    for (const o of orders) {
      if (!o.customer) continue
      const id = o.customer.id
      const name = `${o.customer.firstName} ${o.customer.lastName}`
      const existing = customerMap.get(id) ?? { name, orders: 0, spent: 0 }
      customerMap.set(id, {
        name,
        orders: existing.orders + 1,
        spent: existing.spent + o.totalAmount,
      })
    }

    const topCustomers = Array.from(customerMap.entries())
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 10)

    // ── Payment methods ───────────────────────────────────────────────────
    const paymentMap = new Map<string, { count: number; amount: number }>()
    for (const o of orders) {
      for (const p of o.payments) {
        const existing = paymentMap.get(p.method) ?? { count: 0, amount: 0 }
        paymentMap.set(p.method, {
          count: existing.count + 1,
          amount: existing.amount + p.amount,
        })
      }
    }

    const paymentMethods = Array.from(paymentMap.entries())
      .map(([method, { count, amount }]) => ({ method, count, amount }))
      .sort((a, b) => b.amount - a.amount)

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        totalItems,
        totalTax,
        totalDiscount,
        netRevenue,
      },
      breakdown,
      topProducts,
      topCustomers,
      paymentMethods,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
