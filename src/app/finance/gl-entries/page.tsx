export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Filter, RotateCcw, Navigation } from 'lucide-react'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
}

const DOCTYPE_BADGE: Record<string, string> = {
  Invoice:       'bg-blue-500/10 text-blue-400',
  Payment:       'bg-emerald-500/10 text-emerald-400',
  'Credit Memo': 'bg-amber-500/10 text-amber-400',
  Refund:        'bg-purple-500/10 text-purple-400',
  General:       'bg-zinc-700 text-zinc-400',
}

export default async function GlEntriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    accountNo?: string
    docType?: string
    dateFrom?: string
    dateTo?: string
    search?: string
  }>
}) {
  const sp = await searchParams

  const where: Record<string, unknown> = {}
  if (sp.accountNo) where.accountNo = { contains: sp.accountNo }
  if (sp.docType)   where.documentType = sp.docType
  if (sp.dateFrom || sp.dateTo) {
    where.postingDate = {
      ...(sp.dateFrom ? { gte: new Date(sp.dateFrom) } : {}),
      ...(sp.dateTo   ? { lte: new Date(sp.dateTo)   } : {}),
    }
  }
  if (sp.search) {
    where.OR = [
      { documentNo:  { contains: sp.search } },
      { description: { contains: sp.search } },
      { accountNo:   { contains: sp.search } },
    ]
  }

  const entries = await prisma.glEntry.findMany({
    where,
    orderBy: [{ postingDate: 'desc' }, { entryNo: 'desc' }],
    take: 200,
  })

  const totalDebit  = entries.reduce((s, e) => s + e.debitAmount,  0)
  const totalCredit = entries.reduce((s, e) => s + e.creditAmount, 0)

  const actions = (
    <div className="flex items-center gap-1.5">
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        <Navigation className="w-3.5 h-3.5" /> Navigate
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        <RotateCcw className="w-3.5 h-3.5" /> Reverse Transaction
      </button>
    </div>
  )

  return (
    <>
      <TopBar
        title="G/L Entries"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={actions}
      />

      <div className="flex min-h-[100dvh] bg-[#0f0f1a]">
        {/* Filter Pane */}
        <aside className="w-60 shrink-0 border-r border-zinc-800/50 bg-[#0f0f1a] p-4 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Filters</span>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Search</label>
              <input
                name="search"
                defaultValue={sp.search ?? ''}
                placeholder="Doc No., Description…"
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[12px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">G/L Account No.</label>
              <input
                name="accountNo"
                defaultValue={sp.accountNo ?? ''}
                placeholder="e.g. 6100"
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[12px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Document Type</label>
              <select
                name="docType"
                defaultValue={sp.docType ?? ''}
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[12px] text-zinc-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="Invoice">Invoice</option>
                <option value="Payment">Payment</option>
                <option value="Credit Memo">Credit Memo</option>
                <option value="Refund">Refund</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Date From</label>
              <input
                type="date"
                name="dateFrom"
                defaultValue={sp.dateFrom ?? ''}
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[12px] text-zinc-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Date To</label>
              <input
                type="date"
                name="dateTo"
                defaultValue={sp.dateTo ?? ''}
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[12px] text-zinc-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
            >
              Apply Filters
            </button>
            <a
              href="/finance/gl-entries"
              className="block w-full py-2 text-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors"
            >
              Clear
            </a>
          </form>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Totals */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Entries (max 200)</div>
              <div className="text-2xl font-bold text-zinc-100">{entries.length}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Debit Amount</div>
              <div className="text-xl font-bold text-blue-400 tabular-nums">{formatCurrency(totalDebit)}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Credit Amount</div>
              <div className="text-xl font-bold text-emerald-400 tabular-nums">{formatCurrency(totalCredit)}</div>
            </div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Entry No.</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Posting Date</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Document Type</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Document No.</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">G/L Account No.</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Debit Amount</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Credit Amount</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-zinc-500">
                      No G/L entries found. Adjust your filters.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry, idx) => (
                    <tr
                      key={entry.id}
                      className={`hover:bg-[rgba(99,102,241,0.05)] transition-colors ${
                        idx !== entries.length - 1 ? 'border-b border-zinc-800/40' : ''
                      }`}
                    >
                      <td className="px-4 py-2 font-mono text-zinc-500">{entry.entryNo || '—'}</td>
                      <td className="px-4 py-2 text-zinc-400">{formatDate(entry.postingDate)}</td>
                      <td className="px-4 py-2">
                        {entry.documentType ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                            DOCTYPE_BADGE[entry.documentType] ?? 'bg-zinc-700 text-zinc-400'
                          }`}>
                            {entry.documentType}
                          </span>
                        ) : <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="px-4 py-2 font-mono text-zinc-400 text-[11px]">{entry.documentNo ?? '—'}</td>
                      <td className="px-4 py-2">
                        {entry.accountNo ? (
                          <Link
                            href={`/finance/chart-of-accounts?search=${entry.accountNo}`}
                            className="font-mono text-blue-400 hover:text-blue-300 text-[11px]"
                          >
                            {entry.accountNo}
                          </Link>
                        ) : <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="px-4 py-2 text-zinc-300 max-w-[180px] truncate">{entry.description ?? '—'}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-zinc-300">
                        {entry.debitAmount > 0 ? formatCurrency(entry.debitAmount) : ''}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums text-zinc-300">
                        {entry.creditAmount > 0 ? formatCurrency(entry.creditAmount) : ''}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums font-semibold">
                        <span className={entry.amount >= 0 ? 'text-zinc-200' : 'text-red-400'}>
                          {formatCurrency(entry.amount)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {entries.length > 0 && (
                <tfoot>
                  <tr className="border-t border-zinc-700/80 bg-zinc-900/40">
                    <td colSpan={6} className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Totals ({entries.length} entries)
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-blue-400 tabular-nums">{formatCurrency(totalDebit)}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-emerald-400 tabular-nums">{formatCurrency(totalCredit)}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-zinc-200 tabular-nums">{formatCurrency(totalDebit - totalCredit)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </main>
      </div>
    </>
  )
}
