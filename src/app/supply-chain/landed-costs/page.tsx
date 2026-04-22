export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DollarSign, Plus } from 'lucide-react'

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    posted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  }
  const cls = map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${cls}`}>
      {status}
    </span>
  )
}

const TYPE_LABELS: Record<string, string> = {
  freight: 'Freight',
  customs: 'Customs',
  insurance: 'Insurance',
  other: 'Other',
}

const ALLOC_LABELS: Record<string, string> = {
  by_value: 'By Value',
  by_quantity: 'By Quantity',
  by_weight: 'By Weight',
}

export default async function LandedCostsPage() {
  const costs = await prisma.landedCost.findMany({
    include: {
      purchaseOrder: { select: { poNumber: true } },
      lines: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Landed Costs" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* Page header: title + count + New button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Landed Costs</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {costs.length}
            </span>
          </div>
          <Link href="/supply-chain/landed-costs/new">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
              <Plus className="w-3.5 h-3.5" /> New Landed Cost
            </button>
          </Link>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {costs.length === 0 ? (
            <p className="px-5 py-5 text-[13px] text-zinc-600">No landed costs yet.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['Cost #', 'PO #', 'Vendor', 'Type', 'Amount', 'Allocation', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {costs.map(c => (
                  <tr key={c.id} className="py-2 border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2">
                      <Link href={`/supply-chain/landed-costs/${c.id}`} className="font-mono text-[13px] text-blue-400 hover:text-blue-300 hover:underline">
                        {c.costNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-2 font-mono text-zinc-500">
                      {c.purchaseOrder?.poNumber ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-zinc-300">{c.vendor ?? '—'}</td>
                    <td className="px-4 py-2 text-zinc-400">{TYPE_LABELS[c.costType] ?? c.costType}</td>
                    <td className="px-4 py-2 text-emerald-400 font-semibold">
                      {formatCurrency(Number(c.amount))} {c.currency !== 'USD' ? c.currency : ''}
                    </td>
                    <td className="px-4 py-2 text-zinc-500">{ALLOC_LABELS[c.allocationMethod] ?? c.allocationMethod}</td>
                    <td className="px-4 py-2">
                      <StatusChip status={c.status} />
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
