export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ScanBarcode, ChevronRight, Filter, AlertTriangle } from 'lucide-react'

function trackingBadge(type: string) {
  const map: Record<string, string> = {
    lot: 'bg-blue-500/10 text-blue-400',
    serial: 'bg-purple-500/10 text-purple-400',
  }
  return map[type?.toLowerCase()] ?? 'bg-zinc-700 text-zinc-400'
}

function isExpiringSoon(dateStr: string | null) {
  if (!dateStr) return false
  const exp = new Date(dateStr)
  const soon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  return exp <= soon && exp >= new Date()
}

function isExpired(dateStr: string | null) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

export default async function ItemTrackingPage({
  searchParams,
}: {
  searchParams: Promise<{
    itemId?: string
    serialNo?: string
    lotNo?: string
    locationCode?: string
  }>
}) {
  const sp = await searchParams

  const today = new Date()
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [entries, products] = await Promise.all([
    prisma.itemTrackingEntry.findMany({
      where: {
        ...(sp.itemId ? { itemId: sp.itemId } : {}),
        ...(sp.serialNo ? { serialNo: { contains: sp.serialNo } } : {}),
        ...(sp.lotNo ? { lotNo: { contains: sp.lotNo } } : {}),
        ...(sp.locationCode ? { locationCode: sp.locationCode } : {}),
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
    prisma.product.findMany({ select: { id: true, sku: true, name: true } }).catch(() => []),
  ])

  const productMap = new Map(products.map(p => [p.id, p]))
  const expiringCount = entries.filter(e => isExpiringSoon((e as { expirationDate?: string | null }).expirationDate ?? null)).length
  const expiredCount = entries.filter(e => isExpired((e as { expirationDate?: string | null }).expirationDate ?? null)).length

  return (
    <>
      <TopBar title="Item Tracking Entries" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        <div className="bg-[#16213e] border-b border-zinc-800/50 px-4 py-2 flex items-center gap-1 text-[11px] text-zinc-500">
          <Link href="/inventory" className="hover:text-zinc-300 transition-colors">Inventory</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">Item Tracking</span>
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
              <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wide">Serial No.</label>
              <input name="serialNo" defaultValue={sp.serialNo} placeholder="Serial #"
                className="bg-zinc-900 border border-zinc-700/60 rounded px-2.5 py-1.5 text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 w-36" />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wide">Lot No.</label>
              <input name="lotNo" defaultValue={sp.lotNo} placeholder="Lot #"
                className="bg-zinc-900 border border-zinc-700/60 rounded px-2.5 py-1.5 text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 w-36" />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wide">Location</label>
              <input name="locationCode" defaultValue={sp.locationCode} placeholder="Location"
                className="bg-zinc-900 border border-zinc-700/60 rounded px-2.5 py-1.5 text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 w-28" />
            </div>
            <button type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors">
              Apply
            </button>
            {Object.values(sp).some(Boolean) && (
              <Link href="/inventory/item-tracking"
                className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-[12px] rounded transition-colors">
                Clear
              </Link>
            )}
          </div>
        </form>

        {/* Alert banners */}
        {expiringCount > 0 && (
          <div className="mx-4 mt-3 flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-amber-400 text-[12px]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span><strong>{expiringCount}</strong> lot(s) / serial(s) expiring within 30 days</span>
          </div>
        )}
        {expiredCount > 0 && (
          <div className="mx-4 mt-2 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-[12px]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span><strong>{expiredCount}</strong> lot(s) / serial(s) expired</span>
          </div>
        )}

        {/* Stats */}
        <div className="px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ScanBarcode className="w-4 h-4 text-purple-400" />
            <span className="text-[13px] text-zinc-300 font-medium">{entries.length} tracking entries</span>
          </div>
        </div>

        <div className="px-4 pb-8">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Item No.</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Description</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Type</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Serial No.</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Lot No.</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Location</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Qty on Hand</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Expiration Date</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Certificate No.</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-12 text-center text-zinc-600 text-[12px]">
                        No item tracking entries. Use Lot Tracking or Serial Numbers pages to create tracking assignments.
                      </td>
                    </tr>
                  ) : (
                    entries.map(e => {
                      const prod = productMap.get(e.itemId)
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const entry = e as any
                      const expDate = entry.expirationDate ?? null
                      const expired = isExpired(expDate)
                      const expiring = isExpiringSoon(expDate)
                      return (
                        <tr key={e.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                          <td className="px-3 py-2.5 text-blue-400 font-medium">{prod?.sku ?? e.itemId}</td>
                          <td className="px-3 py-2.5 text-zinc-300">{prod?.name ?? '—'}</td>
                          <td className="px-3 py-2.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${trackingBadge(e.entryType)}`}>
                              {e.entryType}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-zinc-300 font-mono">{entry.serialNo ?? '—'}</td>
                          <td className="px-3 py-2.5 text-zinc-300 font-mono">{entry.lotNo ?? e.lotNumber ?? '—'}</td>
                          <td className="px-3 py-2.5 text-zinc-400">{entry.locationCode ?? '—'}</td>
                          <td className="px-3 py-2.5 text-right text-zinc-300">{entry.quantity ?? entry.qtyOnHand ?? '—'}</td>
                          <td className="px-3 py-2.5">
                            {expDate ? (
                              <span className={expired ? 'text-red-400' : expiring ? 'text-amber-400' : 'text-zinc-300'}>
                                {expDate}
                                {expired && ' (Expired)'}
                                {!expired && expiring && ' (Soon)'}
                              </span>
                            ) : <span className="text-zinc-600">—</span>}
                          </td>
                          <td className="px-3 py-2.5 text-zinc-400 font-mono">{entry.certificateNo ?? '—'}</td>
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
