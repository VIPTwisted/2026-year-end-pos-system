import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      where: { isActive: true },
      include: {
        arInvoices: {
          where: { status: { in: ['posted', 'partial'] } },
          select: { totalAmount: true, paidAmount: true },
        },
      },
      orderBy: { lastName: 'asc' },
    })

    const rows = customers.map((c) => {
      const balance = c.arInvoices.reduce(
        (s, inv) => s + Math.max(0, inv.totalAmount - inv.paidAmount),
        0
      )
      const available = c.creditLimit > 0 ? c.creditLimit - balance : 0
      const utilization =
        c.creditLimit > 0 ? Math.round((balance / c.creditLimit) * 100) : 0

      let riskClass: 'low' | 'medium' | 'high' = 'low'
      if (utilization >= 100 || c.creditStatus === 'blocked') riskClass = 'high'
      else if (utilization >= 70 || c.creditStatus === 'hold') riskClass = 'medium'

      return {
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        creditLimit: c.creditLimit,
        balance,
        available,
        utilization,
        riskClass,
        creditStatus: c.creditStatus,
      }
    })

    const kpis = {
      withLimits: rows.filter((r) => r.creditLimit > 0).length,
      blocked: rows.filter((r) => r.creditStatus === 'blocked').length,
      overLimit: rows.filter((r) => r.creditLimit > 0 && r.balance > r.creditLimit).length,
      avgUtilization:
        rows.filter((r) => r.creditLimit > 0).length > 0
          ? Math.round(
              rows
                .filter((r) => r.creditLimit > 0)
                .reduce((s, r) => s + r.utilization, 0) /
                rows.filter((r) => r.creditLimit > 0).length
            )
          : 0,
    }

    return NextResponse.json({ customers: rows, kpis })
  } catch (err) {
    console.error('[GET /api/finance/credit]', err)
    return NextResponse.json({ error: 'Failed to load credit data' }, { status: 500 })
  }
}
