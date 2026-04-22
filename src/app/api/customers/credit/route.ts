import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  try {
    const customers = await prisma.customer.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        creditLimit: true,
        creditStatus: true,
        arInvoices: {
          where: { status: { in: ['posted', 'partial'] } },
          select: { totalAmount: true, paidAmount: true },
        },
      },
      orderBy: { lastName: 'asc' },
    })

    const rows = customers.map((c) => {
      // Recalculate creditBalance from open invoices
      const openBalance = c.arInvoices.reduce(
        (sum, inv) => sum + (inv.totalAmount - inv.paidAmount),
        0
      )

      const available =
        c.creditLimit > 0 ? Math.max(0, c.creditLimit - openBalance) : null
      const utilization =
        c.creditLimit > 0
          ? Math.min(100, Math.round((openBalance / c.creditLimit) * 100))
          : null

      return {
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        creditLimit: c.creditLimit,
        creditBalance: openBalance,
        available,
        utilization,
        creditStatus: c.creditStatus,
      }
    })

    // Sort by risk: blocked first, then hold, then watch, then ok
    const riskOrder: Record<string, number> = {
      blocked: 0,
      hold: 1,
      watch: 2,
      ok: 3,
    }
    rows.sort(
      (a, b) =>
        (riskOrder[a.creditStatus] ?? 9) - (riskOrder[b.creditStatus] ?? 9)
    )

    return NextResponse.json({ customers: rows })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
