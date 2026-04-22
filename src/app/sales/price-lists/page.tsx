import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Plus, ChevronDown, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  Draft: 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/30',
  Inactive: 'bg-red-500/20 text-red-400 border border-red-500/30',
}

export default async function PriceListsPage() {
  let priceLists: {
    id: string
    code: string
    name: string
    description: string | null
    currency: string
    status: string
    startDate: Date | null
    endDate: Date | null
    isActive: boolean
    _count?: { lines: number }
  }[] = []

  try {
    priceLists = await prisma.priceList.findMany({
      include: {
        _count: { select: { lines: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    priceLists = []
  }

  function fmtDate(d: Date | null | undefined) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      {/* TopBar */}
      <div className="border-b border-zinc-800 bg-[#0f0f1a] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Link href="/sales" className="hover:text-zinc-200">Sales</Link>
          <span>/</span>
          <span className="text-zinc-200">Price Lists</span>
        </div>
        <span className="text-xs text-zinc-500">{priceLists.length} records</span>
      </div>

      {/* Action Ribbon */}
      <div className="border-b border-zinc-800 bg-[#16213e] px-6 py-3">
        <h1 className="text-base font-semibold text-zinc-100 mb-3">Price Lists</h1>
        <div className="flex items-center gap-1">
          <Link href="/sales/price-lists/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium text-white transition-colors">
            <Plus className="w-3.5 h-3.5" /> New
          </Link>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
            Copy
          </button>
        </div>
      </div>

      <div className="p-6">
        {priceLists.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16 text-zinc-600">
            <Tag className="w-8 h-8 mb-3 opacity-30" />
            <p className="text-sm">No price lists found</p>
            <Link href="/sales/price-lists/new" className="mt-3 text-xs text-blue-400 hover:text-blue-300">
              Create first price list
            </Link>
          </div>
        ) : (
          <div className="bg-[#16213e] border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#0f1829]">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    <span className="flex items-center gap-1 cursor-pointer hover:text-zinc-200">Code <ChevronDown className="w-3 h-3" /></span>
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Description</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Currency</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Start Date</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">End Date</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Lines</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {priceLists.map(pl => (
                  <tr key={pl.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-4 py-3">
                      <Link href={`/sales/price-lists/${pl.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs font-medium">
                        {pl.code.length > 12 ? pl.code.slice(-12) : pl.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-200">{pl.name}</td>
                    <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{pl.currency}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-xs font-medium', STATUS_COLORS[pl.status] ?? 'bg-zinc-700/50 text-zinc-400')}>
                        {pl.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{fmtDate(pl.startDate)}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{fmtDate(pl.endDate)}</td>
                    <td className="px-4 py-3 text-right text-zinc-400 text-xs">{pl._count?.lines ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/sales/price-lists/${pl.id}`} className="text-xs text-zinc-500 hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
