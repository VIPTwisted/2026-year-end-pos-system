export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Filter, ChevronRight } from 'lucide-react'

const ENTRY_TYPES = ['Direct Cost', 'Indirect Cost', 'Rounding', 'Revaluation', 'Sales']

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

export default async function ValueEntriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    itemId?: string
    dateFrom?: string
    dateTo?: string
    entryType?: string
    itemLedgerEntryType?: string
  }>
}) {
  const sp = await searchParams

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}
  if (sp.itemId) where.itemId = sp.itemId
  if (sp.entryType) where.entryType = sp.entryType
  if (sp.itemLedgerEntryType) where.itemLedgerEntryType = sp.itemLedgerEntryType
  if (sp.dateFrom || sp.dateTo) {
    where.postingDate = {}
    if (sp.dateFrom) where.postingDate.gte = new Date(sp.dateFrom)
    if (sp.dateTo) where.postingDate.lte = new Date(sp.dateTo)
  }

  const [entries, products] = await Promise.all([
    prisma.valueEntry.findMany({
      where,
      orderBy: { entryNo: 'desc' },
      take: 500,
    }).catch(() => []),
    prisma.product.findMany({ select: { id: true, sku: true, name: true } }).catch(() => []),
  ])

  const productMap = new Map(products.map(p => [p.id, p]))
  const totalActual = entries.reduce((s, e) => s + e.costAmountActual, 0)
  const totalExpected = entries.reduce((s, e) => s + e.costAmountExpected, 0)

  return (
    <>
      <TopBar title="Value Entries" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        <div className="bg-[#16213e] border-b border-zinc-800/50 px-4 py-2 flex items-center gap-1 text-[11px] text-zinc-500">
          <Link href="/inventory" className="hover:text-zinc-300 transition-colors">Inventory</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">Value Entries</span>
        </div>

        {/* Filters */}
        <form method="GET" className="bg-[#16213e]/60 border-b border-zinc-800/40 px-4 py-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span className="font-medium uppercase tracking-wide">Filters</span>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wide">Item</label>
              <select name="itemId" defaultValue={sp.itemId ?? ''}
                className="bg-zinc-900 border border-zinc-700/60 rounded px-2.5 py-1.5 text-[12px] text-zinc-200 focus:outline-none focus:border-zinc-500 w-44">
                <option value="">All Items</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wide">Entry Type</label>
              <select name="entryType" defaultValue={sp.entryType ?? ''}
                className="bg-zinc-900 border border-zinc-700/60 rounded px-2.5 py-1.5 text-[12px] text-zinc-200 focus:outline-none focus:border-zinc-500 w-36">
                <option value="">All Types</option>
                {ENTRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wide">ILE Type</label>
              <select name="itemLedgerEntryType" defaultValue={sp.itemLedgerEntryType ?? ''}
                className="bg-zinc-900 border border-zinc-700/60 rounded px-2.5 py-1.5 text-[12px] text-zinc-200 focus:outline-none focus:border-zinc-500 w-36">
                <option value="">All</option>
                {['Purchase', 'Sale', 'Positive Adj.', 'Negative Adj.', 'Transfer', 'Output', 'Consumption'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wide">Date From</label>
              <input type="date" name="dateFrom" defaultValue={sp.dateFrom}
                className="bg-zinc-900 border border-zinc-700/60 rounded px-2.5 py-1.5 text-[12px] text-zinc-200 focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wide">Date To</label>
              <input type="date" name="dateTo" defaultValue={sp.dateTo}
                className="bg-zinc-900 border border-zinc-700/60 rounded px-2.5 py-1.5 text-[12px] text-zinc-200 focus:outline-none focus:border-zinc-500" />
            </div>
            <button type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors">
              Apply
            </button>
            {Object.values(sp).some(Boolean) && (
              <Link href="/inventory/value-entries"
                className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-[12px] rounded transition-colors">
                Clear
              </Link>
            )}
          </div>
        </form>

        {/* Stats bar */}
        <div className="px-4 py-3 grid grid-cols-3 gap-4 max-w-xl">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-3 py-2.5">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Entries</div>
            <div className="text-[18px] font-semibold text-zinc-100 mt-0.5">{entries.length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-3 py-2.5">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Cost (Actual)</div>
            <div className="text-[18px] font-semibold text-emerald-400 mt-0.5">${fmt(totalActual)}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-3 py-2.5">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Cost (Expected)</div>
            <div className="text-[18px] font-semibold text-amber-400 mt-0.5">${fmt(totalExpected)}</div>
          </div>
        </div>

        <div className="px-4 pb-8">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Entry No.</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Posting Date</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Item No.</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Description</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Entry Type</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Valued Qty</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Cost Amt. (Actual)</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Cost Amt. (Expected)</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Invoice No.</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-12 text-center text-zinc-600 text-[12px]">
                        No value entries found. Entries are created automatically when inventory is posted.
                      </td>
                    </tr>
                  ) : (
                    entries.map(e => {
                      const prod = e.itemId ? productMap.get(e.itemId) : null
                      const displayItemNo = e.itemNo ?? prod?.sku ?? '—'
                      const displayDesc = prod?.name ?? '—'
                      const postingDateStr = e.postingDate instanceof Date
                        ? e.postingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : String(e.postingDate)
                      return (
                        <tr key={e.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                          <td className="px-3 py-2.5 text-zinc-400 font-mono">{e.entryNo}</td>
                          <td className="px-3 py-2.5 text-zinc-300">{postingDateStr}</td>
                          <td className="px-3 py-2.5 text-blue-400 font-medium">{displayItemNo}</td>
                          <td className="px-3 py-2.5 text-zinc-300">{displayDesc}</td>
                          <td className="px-3 py-2.5 text-zinc-400">{e.entryType}</td>
                          <td className="px-3 py-2.5 text-right text-zinc-300">{fmt(e.valuedQty)}</td>
                          <td className="px-3 py-2.5 text-right text-emerald-400">${fmt(e.costAmountActual)}</td>
                          <td className="px-3 py-2.5 text-right text-amber-400">${fmt(e.costAmountExpected)}</td>
                          <td className="px-3 py-2.5 text-zinc-400 font-mono">{e.invoiceNo ?? '—'}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
                {entries.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-zinc-700/60 bg-zinc-800/20">
                      <td colSpan={5} className="px-3 py-2.5 text-[11px] text-zinc-500 font-medium">Totals ({entries.length} rows)</td>
                      <td className="px-3 py-2.5 text-right text-[12px] font-semibold text-zinc-200">
                        {fmt(entries.reduce((s, e) => s + e.valuedQty, 0))}
                      </td>
                      <td className="px-3 py-2.5 text-right text-[12px] font-semibold text-emerald-400">${fmt(totalActual)}</td>
                      <td className="px-3 py-2.5 text-right text-[12px] font-semibold text-amber-400">${fmt(totalExpected)}</td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
