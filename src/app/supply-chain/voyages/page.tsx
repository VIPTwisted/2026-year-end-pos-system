import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Ship, Plus, Send } from 'lucide-react'

export const dynamic = 'force-dynamic'

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    posted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
  }
  const cls = map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${cls}`}>
      {status}
    </span>
  )
}

export default async function VoyagesPage() {
  const voyages = await prisma.voyage.findMany({
    include: { costLines: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Landed Cost Voyages" />
      <main className="flex-1 p-6 overflow-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ship className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Voyages</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {voyages.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors">
              <Send className="w-3.5 h-3.5" /> Post
            </button>
            <Link href="/supply-chain/voyages/new">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {voyages.length === 0 ? (
            <p className="px-5 py-5 text-[13px] text-zinc-600">No voyages found.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['Voyage No.', 'Description', 'Vendor No.', 'Status', 'Ship Date', 'Est. Arrival', 'Total Amount (LCY)'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {voyages.map(v => (
                  <tr key={v.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2.5">
                      <Link href={`/supply-chain/voyages/${v.id}`} className="font-mono text-blue-400 hover:text-blue-300 hover:underline">
                        {v.voyageNo}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-300">{v.description ?? '—'}</td>
                    <td className="px-4 py-2.5 text-zinc-400 font-mono text-[12px]">{v.vendorNo ?? '—'}</td>
                    <td className="px-4 py-2.5"><StatusChip status={v.voyageStatus} /></td>
                    <td className="px-4 py-2.5 text-zinc-400 text-[12px]">
                      {v.shipDate ? new Date(v.shipDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-zinc-400 text-[12px]">
                      {v.estimatedArrival ? new Date(v.estimatedArrival).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-zinc-200 font-mono text-[12px]">
                      {formatCurrency(v.totalAmountLCY)}
                    </td>
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
