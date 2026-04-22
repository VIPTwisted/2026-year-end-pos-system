export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, SlidersHorizontal, ChevronRight } from 'lucide-react'

const TYPE_COLORS: Record<string, string> = {
  Text: 'bg-blue-500/10 text-blue-400',
  Integer: 'bg-purple-500/10 text-purple-400',
  Decimal: 'bg-cyan-500/10 text-cyan-400',
  Option: 'bg-amber-500/10 text-amber-400',
}

export default async function ItemAttributesPage() {
  const rows = await prisma.itemAttribute.findMany({
    orderBy: { name: 'asc' },
  }).catch(() => [])

  const activeCount = rows.filter(r => !r.blocked).length
  const blockedCount = rows.filter(r => r.blocked).length

  return (
    <>
      <TopBar title="Item Attributes" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        <div className="bg-[#16213e] border-b border-zinc-800/50 px-4 py-2 flex items-center gap-1 text-[11px] text-zinc-500">
          <Link href="/inventory" className="hover:text-zinc-300 transition-colors">Inventory</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">Item Attributes</span>
        </div>

        {/* Ribbon */}
        <div className="bg-[#16213e] border-b border-zinc-800/40 px-4 py-2 flex items-center gap-2">
          <Link href="/inventory/item-attributes/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Attribute
          </Link>
        </div>

        {/* Stats */}
        <div className="px-4 py-3 grid grid-cols-3 gap-4 max-w-sm">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-3 py-2.5">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Total</div>
            <div className="text-[20px] font-semibold text-zinc-100 mt-0.5 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              {rows.length}
            </div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-3 py-2.5">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Active</div>
            <div className="text-[20px] font-semibold text-emerald-400 mt-0.5">{activeCount}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-3 py-2.5">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Blocked</div>
            <div className="text-[20px] font-semibold text-red-400 mt-0.5">{blockedCount}</div>
          </div>
        </div>

        <div className="px-4 pb-8">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">No.</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Type</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Unit of Measure</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Blocked</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-12 text-center text-zinc-600 text-[12px]">
                        No item attributes defined.{' '}
                        <Link href="/inventory/item-attributes/new" className="text-blue-400 hover:underline">
                          Create the first attribute.
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    rows.map((r, idx) => (
                      <tr key={r.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-3 py-2.5 text-zinc-500 font-mono">{idx + 1}</td>
                        <td className="px-3 py-2.5 text-zinc-100 font-medium">{r.name}</td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${TYPE_COLORS[r.attributeType] ?? 'bg-zinc-700 text-zinc-400'}`}>
                            {r.attributeType}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-zinc-400">{r.unitOfMeasure ?? '—'}</td>
                        <td className="px-3 py-2.5">
                          {r.blocked ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-medium">Yes</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-medium">No</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-zinc-500">
                          {r.createdAt instanceof Date
                            ? r.createdAt.toLocaleDateString()
                            : new Date(r.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
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
