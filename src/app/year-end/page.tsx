import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { YearEndWizard } from './YearEndWizard'

export default async function YearEndPage() {
  // Load open fiscal years with their periods
  const openFiscalYears = await prisma.fiscalYear.findMany({
    where: { status: { in: ['open', 'closing'] } },
    include: {
      periods: { orderBy: { periodNumber: 'asc' } },
      yearEndClose: true,
    },
    orderBy: { startDate: 'desc' },
  })

  // All equity accounts for retained earnings selector
  const equityAccounts = await prisma.account.findMany({
    where: { type: 'equity', isActive: true },
    orderBy: { code: 'asc' },
  })

  // Revenue accounts with non-zero balances
  const revenueAccounts = await prisma.account.findMany({
    where: { type: 'revenue', isActive: true },
    orderBy: { code: 'asc' },
  })

  // Expense accounts with non-zero balances
  const expenseAccounts = await prisma.account.findMany({
    where: { type: 'expense', isActive: true },
    orderBy: { code: 'asc' },
  })

  // GL balance check: sum all journal line debits vs credits
  const debitAgg = await prisma.journalLine.aggregate({ _sum: { debit: true } })
  const creditAgg = await prisma.journalLine.aggregate({ _sum: { credit: true } })

  const totalDebits = debitAgg._sum.debit ?? 0
  const totalCredits = creditAgg._sum.credit ?? 0

  return (
    <>
      <TopBar title="Year-End Close" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-100">Year-End Close Wizard</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Close your fiscal year, zero revenue and expense accounts, and post retained earnings.
          </p>
        </div>
        <YearEndWizard
          openFiscalYears={openFiscalYears.map(fy => ({
            ...fy,
            startDate: fy.startDate.toISOString(),
            endDate: fy.endDate.toISOString(),
            periods: fy.periods.map(p => ({
              ...p,
              startDate: p.startDate.toISOString(),
              endDate: p.endDate.toISOString(),
              closedAt: p.closedAt?.toISOString() ?? null,
            })),
            yearEndClose: fy.yearEndClose
              ? {
                  ...fy.yearEndClose,
                  completedAt: fy.yearEndClose.completedAt?.toISOString() ?? null,
                }
              : null,
          }))}
          equityAccounts={equityAccounts}
          revenueAccounts={revenueAccounts}
          expenseAccounts={expenseAccounts}
          totalDebits={totalDebits}
          totalCredits={totalCredits}
        />
      </main>
    </>
  )
}
