export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const STATUS_STYLE: Record<string, string> = {
  draft:      'bg-zinc-700/60 text-zinc-400 border border-zinc-600/40',
  approved:   'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  shipped:    'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  credited:   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  cancelled:  'bg-rose-500/15 text-rose-400 border border-rose-500/30',
}

const REASON_LABEL: Record<string, string> = {
  defective:   'Defective',
  overstock:   'Overstock',
  wrong_item:  'Wrong Item',
  damaged:     'Damaged',
}

function toNum(d: { toString(): string } | number | null | undefined): number {
  if (d == null) return 0
  if (typeof d === 'number') return d
  return parseFloat(d.toString()) || 0
}

export default async function VendorReturnsPage() {
  const returns = await prisma.vendorReturn.findMany({
    include: {
      supplier: { select: { id: true, name: true } },
      lines: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  const totalRTVs      = returns.length
  const pendingCount   = returns.filter(r => r.status === 'draft').length
  const shippedCount   = returns.filter(r => r.status === 'shipped').length
  const totalCredit    = returns.reduce((sum, r) => sum + toNum(r.creditAmount), 0)

  const kpis = [
    { label: 'Total RTVs',        value: totalRTVs,                 accent: 'bg-blue-500',    color: 'text-zinc-100' },
    { label: 'Pending Approval',  value: pendingCount,              accent: 'bg-amber-500',   color: 'text-amber-400' },
    { label: 'Shipped',           value: shippedCount,              accent: 'bg-violet-500',  color: 'text-violet-400' },
    { label: 'Total Credit',      value: formatCurrency(totalCredit), accent: 'bg-emerald-500', color: 'text-emerald-400' },
  ]

  return (
    <>
      <TopBar title="Vendor Returns (RTV)" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Vendor Returns (RTV)</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">{totalRTVs} return{totalRTVs !== 1 ? 's' : ''} on record</p>
          </div>
          <Link href="/purchasing/vendor-returns/new">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] h-8 px-3 rounded">
              <Plus className="w-3.5 h-3.5 mr-1.5" />New Return
            </Button>
          </Link>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map(k => (
            <div
              key={k.label}
              className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden"
            >
              <div className={`h-[3px] w-full ${k.accent}`} />
              <div className="px-4 pt-3 pb-4">
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">{k.label}</p>
                <p className={`text-2xl font-bold tabular-nums ${k.color}`}>{k.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        {returns.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-20 text-zinc-500">
            <p className="text-[13px] mb-4">No vendor returns yet</p>
            <Link href="/purchasing/vendor-returns/new">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] h-8 px-3 rounded">
                <Plus className="w-3.5 h-3.5 mr-1.5" />New Return
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-zinc-500 text-[11px] uppercase tracking-wide">
                    <th className="text-left px-4 py-2.5 font-medium">RTV #</th>
                    <th className="text-left py-2.5 font-medium">Supplier</th>
                    <th className="text-left py-2.5 font-medium">Reason</th>
                    <th className="text-center py-2.5 font-medium">Items</th>
                    <th className="text-right py-2.5 font-medium">Total Amount</th>
                    <th className="text-right py-2.5 font-medium">Credit Amount</th>
                    <th className="text-center py-2.5 font-medium">Status</th>
                    <th className="text-right px-4 py-2.5 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((r, idx) => (
                    <tr
                      key={r.id}
                      className={`hover:bg-zinc-800/30 transition-colors ${idx !== returns.length - 1 ? 'border-b border-zinc-800/50' : ''}`}
                    >
                      <td className="px-4 py-2">
                        <Link
                          href={`/purchasing/vendor-returns/${r.id}`}
                          className="font-mono text-[11px] text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          {r.rtvNumber}
                        </Link>
                      </td>
                      <td className="py-2 pr-6 text-zinc-300">{r.supplier?.name ?? '—'}</td>
                      <td className="py-2 pr-6 text-zinc-400">
                        {REASON_LABEL[r.reason] ?? r.reason}
                      </td>
                      <td className="py-2 pr-6 text-center">
                        <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-[11px] font-mono tabular-nums">
                          {r.lines.length}
                        </span>
                      </td>
                      <td className="py-2 pr-6 text-right font-semibold text-zinc-200 tabular-nums">
                        {formatCurrency(toNum(r.totalAmount))}
                      </td>
                      <td className="py-2 pr-6 text-right font-semibold text-emerald-400 tabular-nums">
                        {toNum(r.creditAmount) > 0 ? formatCurrency(toNum(r.creditAmount)) : <span className="text-zinc-700">—</span>}
                      </td>
                      <td className="py-2 pr-6 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${STATUS_STYLE[r.status] ?? 'bg-zinc-700/60 text-zinc-400'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right text-zinc-500 text-[11px] whitespace-nowrap">
                        {formatDate(r.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </>
  )
}
