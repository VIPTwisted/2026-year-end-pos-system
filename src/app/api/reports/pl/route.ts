import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [revenueAccounts, expenseAccounts] = await Promise.all([
      prisma.account.findMany({
        where: { type: 'revenue', isActive: true },
        orderBy: { code: 'asc' },
      }),
      prisma.account.findMany({
        where: { type: 'expense', isActive: true },
        orderBy: { code: 'asc' },
      }),
    ])

    const totalRevenue = revenueAccounts.reduce((sum, a) => sum + (a.balance ?? 0), 0)
    const totalExpenses = expenseAccounts.reduce((sum, a) => sum + (a.balance ?? 0), 0)
    const netIncome = totalRevenue - totalExpenses
    const grossMarginPct = totalRevenue > 0
      ? ((totalRevenue - totalExpenses) / totalRevenue) * 100
      : 0

    return NextResponse.json({
      revenue: revenueAccounts,
      expenses: expenseAccounts,
      totalRevenue,
      totalExpenses,
      netIncome,
      grossMarginPct,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[GET /api/reports/pl]', error)
    return NextResponse.json({ error: 'Failed to generate P&L' }, { status: 500 })
  }
}
