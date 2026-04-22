export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { List, ChevronRight, Filter } from 'lucide-react'

const ENTRY_TYPES = ['Purchase', 'Sale', 'Positive Adj.', 'Negative Adj.', 'Transfer', 'Output', 'Consumption']

function entryTypeBadge(type: string) {
  const map: Record<string, string> = {
    Purchase: 'bg-purple-500/10 text-purple-400',
    Sale: 'bg-amber-500/10 text-amber-400',
    'Positive Adj.': 'bg-emerald-500/10 text-emerald-400',
    'Positive Adjmt.': 'bg-emerald-500/10 text-emerald-400',
    'Negative Adj.': 'bg-red-500/10 text-red-400',
    'Negative Adjmt.': 'bg-red-500/10 text-red-400',
    Transfer: 'bg-blue-500/10 text-blue-400',
    Output: 'bg-cyan-500/10 text-cyan-400',
    Consumption: 'bg-orange-500/10 text-orange-400',
  }
  return map[type] ?? 'bg-zinc-700 text-zinc-400'
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

export default async function ItemLedgerPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    itemId?: string
    locationCode?: string
    dateFrom?: string
    dateTo?: string
    entryType?: string
  }>
}) {
  const sp = await searchParams

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}
  if (sp.itemId) where.itemId = sp.itemId
  if (sp.locationCode) where.locationCode = sp.locationCode
  if (sp.entryType) where.entryType = sp.entryType
  if (sp.dateFrom || sp.dateTo) {
    where.postingDate = {}
    if (sp.dateFrom) where.postingDate.gte = new Date(sp.dateFrom)
    if (sp.dateTo) where.postingDate.lte = new Date(sp.dateTo)
  }
  if (sp.search) {
    where.OR = [
      { documentNo: { contains: sp.search } },
      { itemNo: { contains: sp.search } },
      { description: { contains: sp.search } },
    ]
  }

  const [entries, products] = await Promise.all([
    prisma.itemLedgerEntry.findMany({
      where,
      orderBy: { entryNo: 'desc' },
      take: 500,
    }).catch(() => []),
    prisma.product.findMany({ select: { id: true, sku: true, name: true } }).catch(() => []),
  ])

  const productMap = new Map(products.map(p => [p.id, p]))

  return (
    <>
      <TopBar title="Item Ledger Entries" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Breadcrumb */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-4 py-2 flex items-center gap-1 text-[11px] text-zinc-500">
          <Link href="/inventory" className="hover:text-zinc-300 transition-colors">Inventory</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">Item Ledger Entries</span>
        </div>

        {/* Filter Pane */}
        <form method="GET" className="bg-[#16213e]/60 border-b border-zinc-800/40 px-4 py-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span className="font-medium uppercase tracking-wide">Filters</span>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wide">Search</label>
              <input name="search" defaultValue={sp.search} placeholder="Doc No / Item…"
                className="bg-zinc-900 border border-zinc-700/60 rounded px-2.5 py-1.5 text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 w-44" />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wide">Item</label>
              <select name="itemId" defaultValue={sp.itemId ?? ''}
                className="bg-zinc-900 border border-zinc-700/60 rounded px-2.5 py-1.5 text-[12px] text-zinc-200 focus:outline-none focus:border-zinc-500 w-40">
                <option value="">All Items</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wide">Entry Type</label>
              <select name="entryType" defaultValue={sp.entryType ?? ''}
                className="bg-zinc-900 border border-zinc-700/60 rounded px-2.5 py-1.5 text-[12px] text-zinc-200 focus:outline-none focus:border-zinc-500 w-40">
                <option value="">All Types</option>
                {ENTRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wide">Location</label>
              <input name="locationCode" defaultValue={sp.locationCode} placeholder="Location Code"
                className="bg-zinc-900 border border-zinc-700/60 rounded px-2.5 py-1.5 text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 w-32" />
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
              <Link href="/inventory/item-ledger"
                className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-[12px] rounded transition-colors">
                Clear
              </Link>
            )}
          </div>
        </form>

        {/* Header stats */}
        <div className="px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <List className="w-4 h-4 text-blue-400" />
            <span className="text-[13px] text-zinc-300 font-medium">{entries.length} entries</span>
          </div>
        </div>

        {/* Table */}
        <div className="px-4 pb-8">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Entry No.</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Posting Date</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Entry Type</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Document No.</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Item No.</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Description</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Location</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Quantity</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Remaining Qty</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Cost Amt. (Actual)</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Sales Amt. (Actual)</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-3 py-12 text-center text-zinc-600 text-[12px]">
                        No item ledger entries found. Entries are created automatically when inventory transactions are posted.
                      </td>
                    </tr>
                  ) : (
                    entries.map(e => {
                      const prod = e.itemId ? productMap.get(e.itemId) : null
                      const displayItemNo = e.itemNo ?? prod?.sku ?? e.itemId ?? '—'
                      const displayDesc = e.description ?? prod?.name ?? '—'
                      const postingDateStr = e.postingDate instanceof Date
                        ? e.postingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : String(e.postingDate)
                      return (
                        <tr key={e.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                          <td className="px-3 py-2.5 text-zinc-400 font-mono">{e.entryNo}</td>
                          <td className="px-3 py-2.5 text-zinc-300">{postingDateStr}</td>
                          <td className="px-3 py-2.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${entryTypeBadge(e.entryType)}`}>
                              {e.entryType}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-zinc-300 font-mono">{e.documentNo ?? '—'}</td>
                          <td className="px-3 py-2.5 text-blue-400 font-medium">{displayItemNo}</td>
                          <td className="px-3 py-2.5 text-zinc-300">{displayDesc}</td>
                          <td className="px-3 py-2.5 text-zinc-400">{e.locationCode ?? '—'}</td>
                          <td className={`px-3 py-2.5 text-right font-medium ${e.qty >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {e.qty >= 0 ? '+' : ''}{fmt(e.qty)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-zinc-300">{fmt(e.remainingQty)}</td>
                          <td className="px-3 py-2.5 text-right text-zinc-300">${fmt(e.costAmount)}</td>
                          <td className="px-3 py-2.5 text-right text-zinc-300">${fmt(e.salesAmount)}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
