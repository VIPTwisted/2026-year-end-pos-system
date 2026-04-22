export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Edit2, ChevronRight } from 'lucide-react'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1,
  }).format(n)
}

const STATUS_BADGE: Record<string, string> = {
  draft:  'bg-zinc-700 text-zinc-400',
  active: 'bg-emerald-500/10 text-emerald-400',
  closed: 'bg-red-500/10 text-red-400',
}

export default async function GlBudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ fiscalYear?: string; status?: string; search?: string }>
}) {
  const sp = await searchParams
  const filterFY     = sp.fiscalYear ?? ''
  const filterStatus = sp.status     ?? ''
  const filterSearch = sp.search     ?? ''

  const where: Record<string, unknown> = {}
  if (filterFY)     where.fiscalYear = filterFY
  if (filterStatus) where.status     = filterStatus
  if (filterSearch) {
    where.OR = [
      { name: { contains: filterSearch } },
      { code: { contains: filterSearch } },
    ]
  }

  const budgets = await prisma.budgetPlan.findMany({
    where,
    include: {
      entries: {
        include: { account: { select: { balance: true } } },
      },
      _count: { select: { entries: true } },
    },
    orderBy: [{ fiscalYear: 'desc' }, { name: 'asc' }],
  })

  // Collect unique fiscal years for filter
  const allBudgets = await prisma.budgetPlan.findMany({
    select: { fiscalYear: true },
    distinct: ['fiscalYear'],
    orderBy: { fiscalYear: 'desc' },
  })
  const fiscalYears = allBudgets.map(b => b.fiscalYear)

  const actions = (
    <div className="flex items-center gap-1.5">
      <Link
        href="/finance/budgets/new"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> New Budget
      </Link>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        <Edit2 className="w-3.5 h-3.5" /> Edit
      </button>
    </div>
  )

  return (
    <>
      <TopBar
        title="G/L Budgets"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={actions}
      />

      <div className="flex min-h-[100dvh] bg-[#0f0f1a]">
        {/* Filter Pane */}
        <aside className="w-60 shrink-0 border-r border-zinc-800/50 bg-[#0f0f1a] p-4 space-y-5">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Search</div>
            <form>
              <input
                name="search"
                defaultValue={filterSearch}
                placeholder="Code or Name…"
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[12px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
              />
              <input type="hidden" name="fiscalYear" value={filterFY} />
              <input type="hidden" name="status"     value={filterStatus} />
              <button type="submit" className="sr-only">Search</button>
            </form>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Fiscal Year</div>
            <div className="space-y-1">
              <Link
                href={`/finance/budgets?status=${filterStatus}&search=${filterSearch}`}
                className={`block px-2 py-1.5 rounded text-[12px] transition-colors ${
                  !filterFY ? 'bg-blue-600/20 text-blue-300' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                All Years
              </Link>
              {fiscalYears.map(fy => (
                <Link
                  key={fy}
                  href={`/finance/budgets?fiscalYear=${fy}&status=${filterStatus}&search=${filterSearch}`}
                  className={`block px-2 py-1.5 rounded text-[12px] transition-colors ${
                    filterFY === fy ? 'bg-blue-600/20 text-blue-300' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {fy}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Status</div>
            <div className="space-y-1">
              {[
                { value: '',       label: 'All' },
                { value: 'draft',  label: 'Draft' },
                { value: 'active', label: 'Active' },
                { value: 'closed', label: 'Closed' },
              ].map(opt => (
                <Link
                  key={opt.value}
                  href={`/finance/budgets?fiscalYear=${filterFY}&status=${opt.value}&search=${filterSearch}`}
                  className={`block px-2 py-1.5 rounded text-[12px] transition-colors ${
                    filterStatus === opt.value ? 'bg-blue-600/20 text-blue-300' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Budgets</div>
              <div className="text-2xl font-bold text-zinc-100">{budgets.length}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Active</div>
              <div className="text-2xl font-bold text-emerald-400">{budgets.filter(b => b.status === 'active').length}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Draft</div>
              <div className="text-2xl font-bold text-zinc-400">{budgets.filter(b => b.status === 'draft').length}</div>
            </div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Budget Name</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Code</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Fiscal Year</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Budget Amount</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Actual Amount</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Variance</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Entries</th>
                  <th className="px-4 py-2.5 w-6"></th>
                </tr>
              </thead>
              <tbody>
                {budgets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-zinc-500">
                      No budgets.{' '}
                      <Link href="/finance/budgets/new" className="text-blue-400 hover:underline">Create one</Link>
                    </td>
                  </tr>
                ) : (
                  budgets.map((budget, idx) => {
                    const budgetTotal = budget.entries.reduce((s, e) => s + e.budgetAmount, 0)
                    const actualTotal = budget.entries.reduce((s, e) => s + (e.account?.balance ?? 0), 0)
                    const variance    = budgetTotal - actualTotal
                    return (
                      <tr
                        key={budget.id}
                        className={`hover:bg-[rgba(99,102,241,0.05)] transition-colors ${
                          idx !== budgets.length - 1 ? 'border-b border-zinc-800/40' : ''
                        }`}
                      >
                        <td className="px-4 py-2.5 text-zinc-200">
                          <Link href={`/finance/budgets/${budget.id}`} className="hover:text-zinc-100">
                            {budget.name}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/finance/budgets/${budget.id}`}
                            className="font-mono text-[11px] text-blue-400 hover:text-blue-300"
                          >
                            {budget.code}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5 text-zinc-400">{budget.fiscalYear}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                            STATUS_BADGE[budget.status] ?? 'bg-zinc-700 text-zinc-400'
                          }`}>
                            {budget.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-zinc-200 font-semibold">
                          {formatCurrency(budgetTotal)}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-zinc-400">
                          {formatCurrency(actualTotal)}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                          <span className={variance >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {formatCurrency(variance)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-zinc-500">{budget._count.entries}</td>
                        <td className="px-4 py-2.5 text-zinc-600">
                          <Link href={`/finance/budgets/${budget.id}`}>
                            <ChevronRight className="w-3.5 h-3.5 hover:text-zinc-300 transition-colors" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-[12px] text-zinc-500">{budgets.length} budget{budgets.length !== 1 ? 's' : ''}</div>
        </main>
      </div>
    </>
  )
}
