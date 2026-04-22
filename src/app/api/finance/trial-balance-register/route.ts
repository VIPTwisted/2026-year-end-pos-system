import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') ?? undefined

    const rows = await prisma.gLTrialBalance.findMany({
      where: period ? { period } : undefined,
      orderBy: [{ accountCode: 'asc' }],
    })

    const periods = await prisma.gLTrialBalance.findMany({
      select: { period: true },
      distinct: ['period'],
      orderBy: { period: 'desc' },
    })

    const grandTotals = rows.reduce(
      (acc, r) => ({
        openingDebit: acc.openingDebit + r.openingDebit,
        openingCredit: acc.openingCredit + r.openingCredit,
        periodDebit: acc.periodDebit + r.periodDebit,
        periodCredit: acc.periodCredit + r.periodCredit,
        closingDebit: acc.closingDebit + r.closingDebit,
        closingCredit: acc.closingCredit + r.closingCredit,
      }),
      { openingDebit: 0, openingCredit: 0, periodDebit: 0, periodCredit: 0, closingDebit: 0, closingCredit: 0 }
    )

    return NextResponse.json({
      period: period ?? 'all',
      rows,
      grandTotals,
      availablePeriods: periods.map((p) => p.period),
    })
  } catch (err) {
    console.error('[trial-balance-register GET]', err)
    return NextResponse.json({ error: 'Failed to load trial balance' }, { status: 500 })
  }
}
