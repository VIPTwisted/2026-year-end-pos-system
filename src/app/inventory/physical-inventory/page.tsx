export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, CheckSquare, RefreshCw, ClipboardList } from 'lucide-react'

export default async function PhysicalInventoryPage() {
  const [entries, products] = await Promise.all([
    prisma.physicalInventoryJournal.findMany({
      orderBy: { postingDate: 'desc' },
    }),
    prisma.product.findMany({ select: { id: true, sku: true, name: true } }),
  ])

  const productMap = new Map(products.map(p => [p.id, p]))
  const openCount = entries.filter(e => e.status === 'open').length
  const postedCount = entries.filter(e => e.status === 'posted').length

  return (
    <>
      <TopBar title="Phys. Inventory Journal" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Action Ribbon */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-4 py-2 flex items-center gap-1 flex-wrap">
          <Link href="/inventory/physical-inventory/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Entry
          </Link>
          <div className="w-px h-4 bg-zinc-700 mx-1" />
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-zinc-300 hover:bg-zinc-800 rounded transition-colors">
            <CheckSquare className="w-3.5 h-3.5" /> Post
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-zinc-300 hover:bg-zinc-800 rounded transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Calculate Inventory
          </button>
          <div className="ml-auto text-[12px] text-zinc-500">{entries.length} line{entries.length !== 1 ? 's' : ''}</div>
        </div>

        <div className="px-6 py-4 space-y-4">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#16213e] rounded-lg border border-zinc-800/50 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Journal Batch</div>
              <div className="text-[14px] font-bold text-zinc-100">PHYS-INV</div>
              <div className="text-[12px] text-zinc-500 mt-1">Current batch</div>
            </div>
            <div className="bg-[#16213e] rounded-lg border border-zinc-800/50 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Open Lines</div>
              <div className="text-[24px] font-bold text-amber-400">{openCount}</div>
              <div className="text-[12px] text-zinc-500 mt-1">Pending post</div>
            </div>
            <div className="bg-[#16213e] rounded-lg border border-zinc-800/50 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Posted</div>
              <div className="text-[24px] font-bold text-emerald-400">{postedCount}</div>
              <div className="text-[12px] text-zinc-500 mt-1">Completed</div>
            </div>
          </div>

          {/* Journal Table */}
          <div className="bg-[#16213e] rounded-lg border border-zinc-800/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/40">
              <ClipboardList className="w-4 h-4 text-zinc-500" />
              <span className="text-[13px] font-medium text-zinc-300">Physical Inventory Journal</span>
            </div>

            {entries.length === 0 ? (
              <div className="py-16 text-center">
                <ClipboardList className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-[13px] text-zinc-500 mb-1">No physical inventory entries</p>
                <p className="text-[12px] text-zinc-600 mb-4">Use &ldquo;Calculate Inventory&rdquo; to generate count lines automatically</p>
                <Link href="/inventory/physical-inventory/new"
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium transition-colors">
                  <Plus className="w-3.5 h-3.5" /> New Entry
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/40">
                      {['Posting Date', 'Document No.', 'Item No.', 'Description', 'Location', 'Qty (Calculated)', 'Qty (Physical)', 'Unit Cost', 'Status'].map(h => (
                        <th key={h} className={`text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium ${['Qty (Calculated)', 'Qty (Physical)', 'Unit Cost'].includes(h) ? 'text-right' : 'text-left'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(entry => {
                      const prod = entry.productId ? productMap.get(entry.productId) : null
                      const diff = entry.qtyPhysInventory - entry.qtyCalculated
                      return (
                        <tr key={entry.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                          <td className="py-2.5 px-3 text-[12px] text-zinc-400">
                            {new Date(entry.postingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-2.5 px-3 text-[12px] font-mono text-zinc-400">{entry.documentNo ?? '—'}</td>
                          <td className="py-2.5 px-3 text-[12px] font-mono text-blue-400">{prod?.sku ?? '—'}</td>
                          <td className="py-2.5 px-3 text-[13px] text-zinc-200">{entry.description ?? prod?.name ?? '—'}</td>
                          <td className="py-2.5 px-3 text-[12px] text-zinc-400">{entry.locationCode ?? '—'}</td>
                          <td className="py-2.5 px-3 text-right text-[13px] tabular-nums text-zinc-400">{entry.qtyCalculated}</td>
                          <td className="py-2.5 px-3 text-right text-[13px] tabular-nums font-semibold text-zinc-100">{entry.qtyPhysInventory}</td>
                          <td className="py-2.5 px-3 text-right text-[12px] tabular-nums text-zinc-400">{entry.unitCost.toFixed(2)}</td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${entry.status === 'posted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                              {entry.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
