import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { AlertTriangle, Plus, Printer, Pencil } from 'lucide-react'

export const dynamic = 'force-dynamic'

const HAZARD_CLASS_COLORS: Record<string, string> = {
  '1': 'bg-red-500/10 text-red-400 border-red-500/30',
  '2': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  '3': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  '4': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  '5': 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  '6': 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  '7': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  '8': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  '9': 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30',
}

function HazardChip({ cls }: { cls: string | null }) {
  if (!cls) return <span className="text-zinc-600">—</span>
  const base = cls.split('.')[0]
  const color = HAZARD_CLASS_COLORS[base] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border ${color}`}>
      Class {cls}
    </span>
  )
}

export default async function HazmatPage() {
  const items = await prisma.hazmatItem.findMany({
    orderBy: { itemNo: 'asc' },
  })

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Hazardous Materials" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Hazardous Materials</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {items.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors">
              <Printer className="w-3.5 h-3.5" /> Print Labels
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {items.length === 0 ? (
            <p className="px-5 py-5 text-[13px] text-zinc-600">No hazardous material records found.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['Item No.', 'Description', 'UN No.', 'Hazard Class', 'Packing Group', 'Flash Point', 'Proper Shipping Name', 'Regulatory'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-blue-400 text-[12px]">{item.itemNo}</td>
                    <td className="px-4 py-2.5 text-zinc-300">{item.description ?? '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-zinc-300 text-[12px]">{item.unNo ?? '—'}</td>
                    <td className="px-4 py-2.5"><HazardChip cls={item.hazardClass} /></td>
                    <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{item.packingGroup ?? '—'}</td>
                    <td className="px-4 py-2.5 text-zinc-400 text-[12px]">
                      {item.flashPoint !== null ? `${item.flashPoint}°C` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-zinc-300 max-w-[200px] truncate">{item.properShippingName ?? '—'}</td>
                    <td className="px-4 py-2.5 text-zinc-400 text-[11px] font-mono">{item.regulatoryBody ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
