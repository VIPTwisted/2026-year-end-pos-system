import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Receipt, ArrowRight } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  open:               'success',
  partially_applied:  'default',
  applied:            'secondary',
  voided:             'destructive',
}

const TABS = ['all', 'open', 'partially_applied', 'applied', 'voided'] as const
type Tab = typeof TABS[number]

const TAB_LABELS: Record<Tab, string> = {
  all:                'All',
  open:               'Open',
  partially_applied:  'Partially Applied',
  applied:            'Fully Applied',
  voided:             'Voided',
}

export default async function CreditMemosPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab = 'all' } = await searchParams
  const activeTab = TABS.includes(tab as Tab) ? (tab as Tab) : 'all'

  const where = activeTab === 'all' ? {} : { status: activeTab }

  const memos = await prisma.creditMemo.findMany({
    where,
    include: {
      customer:    { select: { id: true, firstName: true, lastName: true } },
      salesReturn: { select: { id: true, returnNumber: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // KPI aggregates
  const allMemos = await prisma.creditMemo.findMany({
    select: { status: true, amount: true, remaining: true },
  })
  const now = new Date()

  const totalOpen  = allMemos.filter(m => m.status === 'open').reduce((s, m) => s + m.remaining, 0)
  const totalApplied = allMemos.filter(m => m.status === 'applied').reduce((s, m) => s + m.amount, 0)
  const voidedCount = allMemos.filter(m => m.status === 'voided').length

  return (
    <>
      <TopBar title="Credit Memos" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Sales</p>
              <h2 className="text-[18px] font-semibold text-zinc-100 leading-tight">Credit Memos</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">Track store credits and applied balances</p>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Open Balance',    value: formatCurrency(totalOpen),    color: 'text-emerald-400' },
              { label: 'Total Applied',   value: formatCurrency(totalApplied), color: 'text-blue-400' },
              { label: 'Voided',          value: voidedCount.toString(),       color: 'text-zinc-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3.5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                <p className={`text-[22px] font-bold tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 border-b border-zinc-800/60">
            {TABS.map(t => (
              <Link
                key={t}
                href={`/sales/credit-memos?tab=${t}`}
                className={[
                  'px-4 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors',
                  activeTab === t
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300',
                ].join(' ')}
              >
                {TAB_LABELS[t]}
              </Link>
            ))}
          </div>

          {/* Section divider */}
          <div className="flex items-center gap-3">
            <Receipt className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">Credit Memos</span>
            <span className="text-[10px] text-zinc-600">({memos.length} shown)</span>
            <div className="flex-1 h-px bg-zinc-800/60" />
          </div>

          {/* Memos table */}
          {memos.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16 text-zinc-600">
              <Receipt className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-[13px]">No credit memos found</p>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Memo #', 'Customer', 'Source Return', 'Amount', 'Remaining', 'Status', 'Expires', 'Created', ''].map(h => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${
                            h === 'Memo #' || h === 'Customer' ? 'text-left' : h === '' ? 'text-right' : 'text-right'
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {memos.map(m => {
                      const expiredSoon = m.expiresAt && new Date(m.expiresAt) < new Date(now.getTime() + 7 * 86400000) && m.status === 'open'
                      return (
                        <tr key={m.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-4 py-3 font-mono text-[11px] text-zinc-300">{m.memoNumber}</td>
                          <td className="px-4 py-3 text-[13px] text-zinc-100">{m.customer.firstName} {m.customer.lastName}</td>
                          <td className="px-4 py-3 text-right">
                            {m.salesReturn ? (
                              <Link href={`/sales/returns/${m.salesReturn.id}`} className="text-[11px] text-blue-400 hover:underline font-mono">
                                {m.salesReturn.returnNumber}
                              </Link>
                            ) : <span className="text-zinc-600 text-[11px]">Manual</span>}
                          </td>
                          <td className="px-4 py-3 text-right text-[13px] text-zinc-300 tabular-nums">{formatCurrency(m.amount)}</td>
                          <td className="px-4 py-3 text-right text-[13px] font-semibold text-emerald-400 tabular-nums">{formatCurrency(m.remaining)}</td>
                          <td className="px-4 py-3 text-right">
                            <Badge variant={STATUS_VARIANT[m.status] ?? 'secondary'} className="text-[11px] capitalize">
                              {m.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className={`px-4 py-3 text-right text-[11px] ${expiredSoon ? 'text-amber-400' : 'text-zinc-500'}`}>
                            {m.expiresAt ? formatDate(m.expiresAt) : '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-[11px] text-zinc-500 whitespace-nowrap">{formatDate(m.createdAt)}</td>
                          <td className="px-4 py-3 text-right">
                            <Link href={`/sales/credit-memos/${m.id}`} className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                              View <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
