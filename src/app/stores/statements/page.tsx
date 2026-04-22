export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { Plus, ClipboardCheck, AlertCircle, Store, CheckCircle2 } from 'lucide-react'

const STATUS_BADGE = {
  open:       <Badge variant="default">Open</Badge>,
  calculated: <Badge variant="warning">Calculated</Badge>,
  posted:     <Badge variant="success">Posted</Badge>,
}

export default async function StatementsPage({
  searchParams,
}: {
  searchParams: Promise<{ storeId?: string; status?: string }>
}) {
  const { storeId, status } = await searchParams

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [statements, stores] = await Promise.all([
    prisma.retailStatement.findMany({
      where: {
        ...(storeId ? { storeId } : {}),
        ...(status  ? { status }  : {}),
      },
      include: {
        store:  { select: { id: true, name: true } },
        _count: { select: { tenderLines: true } },
      },
      orderBy: { businessDate: 'desc' },
    }),
    prisma.store.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  const openCount        = await prisma.retailStatement.count({ where: { status: 'open' } })
  const calculatedCount  = await prisma.retailStatement.count({ where: { status: 'calculated' } })
  const postedThisMonth  = await prisma.retailStatement.count({
    where: { status: 'posted', businessDate: { gte: monthStart } },
  })

  const largestDiff = statements.reduce((max, s) => Math.max(max, Math.abs(s.difference)), 0)

  return (
    <>
      <TopBar title="Retail Statements" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Stores</p>
              <h2 className="text-[18px] font-semibold text-zinc-100 leading-tight">Retail Statements</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">Daily balance sheets per store</p>
            </div>
            <Link href="/stores/statements/new">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                New Statement
              </Button>
            </Link>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Open',               value: openCount.toString(),           icon: ClipboardCheck, color: 'text-blue-400' },
              { label: 'Calculated',         value: calculatedCount.toString(),     icon: Store,          color: 'text-amber-400' },
              { label: 'Posted This Month',  value: postedThisMonth.toString(),     icon: CheckCircle2,   color: 'text-emerald-400' },
              {
                label: 'Largest Difference',
                value: formatCurrency(largestDiff),
                icon: AlertCircle,
                color: largestDiff > 10 ? 'text-red-400' : 'text-zinc-400',
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
                </div>
                <p className={`text-[22px] font-bold tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              className="bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-1.5 text-[12px] text-zinc-300 outline-none focus:border-blue-500"
              defaultValue={storeId ?? ''}
            >
              <option value="">All Stores</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {['', 'open', 'calculated', 'posted'].map(s => (
              <Link
                key={s}
                href={s ? `/stores/statements?status=${s}` : '/stores/statements'}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors border ${
                  (status ?? '') === s
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:bg-zinc-700/60'
                }`}
              >
                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </Link>
            ))}
          </div>

          {/* Section divider */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">Statements</span>
            <span className="text-[10px] text-zinc-600">({statements.length} shown)</span>
            <div className="flex-1 h-px bg-zinc-800/60" />
          </div>

          {/* Statements table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-800/60">
                  <tr>
                    {['Statement #', 'Store', 'Business Date', 'Net Sales', 'Total Payments', 'Declared', 'Difference', 'Status'].map(h => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${
                          h === 'Statement #' || h === 'Store' || h === 'Business Date' ? 'text-left' :
                          h === 'Status' ? 'text-center' : 'text-right'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {statements.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-[13px] text-zinc-600">
                        No statements found
                      </td>
                    </tr>
                  )}
                  {statements.map(stmt => {
                    const absDiff = Math.abs(stmt.difference)
                    return (
                      <tr key={stmt.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/stores/statements/${stmt.id}`} className="text-[11px] text-blue-400 hover:text-blue-300 font-mono">
                            {stmt.statementNo}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-zinc-300">{stmt.store.name}</td>
                        <td className="px-4 py-3 text-[12px] text-zinc-400">
                          {new Date(stmt.businessDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right text-[13px] text-zinc-300 tabular-nums">{formatCurrency(stmt.netSales)}</td>
                        <td className="px-4 py-3 text-right text-[13px] text-zinc-300 tabular-nums">{formatCurrency(stmt.totalPayments)}</td>
                        <td className="px-4 py-3 text-right text-[13px] text-zinc-300 tabular-nums">{formatCurrency(stmt.tenderDeclared)}</td>
                        <td className={`px-4 py-3 text-right text-[13px] font-medium tabular-nums ${absDiff > 1 ? 'text-red-400' : 'text-zinc-500'}`}>
                          {absDiff > 0.01 ? formatCurrency(stmt.difference) : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {STATUS_BADGE[stmt.status as keyof typeof STATUS_BADGE] ?? (
                            <Badge variant="outline">{stmt.status}</Badge>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
