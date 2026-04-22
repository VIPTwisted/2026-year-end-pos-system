import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Ship, ArrowLeft } from 'lucide-react'

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

const ALLOC_LABELS: Record<string, string> = {
  by_value: 'By Value',
  by_qty: 'By Qty',
  by_cbm: 'By CBM',
  equally: 'Equally',
}

interface Params { params: Promise<{ id: string }> }

export default async function VoyageCardPage({ params }: Params) {
  const { id } = await params
  const voyage = await prisma.voyage.findUnique({
    where: { id },
    include: { costLines: true },
  })
  if (!voyage) notFound()

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={`Voyage ${voyage.voyageNo}`} />
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-zinc-500">
          <Link href="/supply-chain/voyages" className="hover:text-zinc-300 flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Voyages
          </Link>
          <span>/</span>
          <span className="text-zinc-300 font-mono">{voyage.voyageNo}</span>
        </div>

        {/* Title row */}
        <div className="flex items-center gap-3">
          <Ship className="w-5 h-5 text-zinc-400" />
          <h1 className="text-base font-semibold text-zinc-100">{voyage.voyageNo}</h1>
          <StatusChip status={voyage.voyageStatus} />
        </div>

        {/* FastTab: General */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">General</h2>
          <dl className="grid grid-cols-3 gap-4 text-[13px]">
            {[
              ['Voyage No.', voyage.voyageNo],
              ['Description', voyage.description ?? '—'],
              ['Vendor No.', voyage.vendorNo ?? '—'],
              ['Status', <StatusChip key="s" status={voyage.voyageStatus} />],
              ['Currency', voyage.currency],
              ['Total Amount (LCY)', formatCurrency(voyage.totalAmountLCY)],
              ['Ship Date', voyage.shipDate ? new Date(voyage.shipDate).toLocaleDateString() : '—'],
              ['Estimated Arrival', voyage.estimatedArrival ? new Date(voyage.estimatedArrival).toLocaleDateString() : '—'],
            ].map(([label, val]) => (
              <div key={String(label)}>
                <dt className="text-[10px] uppercase tracking-wide text-zinc-500 mb-0.5">{label}</dt>
                <dd className="text-zinc-200">{val as React.ReactNode}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* FastTab: Cost Lines */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/30">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Cost Lines</h2>
          </div>
          {voyage.costLines.length === 0 ? (
            <p className="px-5 py-4 text-[13px] text-zinc-600">No cost lines.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/20">
                  {['Cost Type', 'Description', 'Amount', 'Allocation Method'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {voyage.costLines.map(l => (
                  <tr key={l.id} className="border-b border-zinc-800/20 hover:bg-zinc-800/10">
                    <td className="px-4 py-2.5 capitalize text-zinc-300">{l.costType}</td>
                    <td className="px-4 py-2.5 text-zinc-400">{l.description ?? '—'}</td>
                    <td className="px-4 py-2.5 text-zinc-200 font-mono text-[12px]">{formatCurrency(l.amount)}</td>
                    <td className="px-4 py-2.5 text-zinc-400">{ALLOC_LABELS[l.allocationMethod] ?? l.allocationMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* FastTab: Item Tracking */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Item Tracking</h2>
          <p className="text-[13px] text-zinc-600">No PO lines linked to this voyage yet.</p>
        </div>

      </main>
    </div>
  )
}
