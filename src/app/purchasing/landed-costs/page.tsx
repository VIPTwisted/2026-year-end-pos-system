/**
 * Landed Costs — List
 * Route: /purchasing/landed-costs/
 *
 * Displays landed cost entries: PO reference, vendor, allocation method, charges, status.
 * Data flows through the ItemCharge model (fully expanded in this repo).
 * TODO: Migrate to dedicated LandedCost model once expanded with:
 *   poNumber, vendor, allocationMethod, charges[], status (open/posted)
 */
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, DollarSign } from 'lucide-react'

const ALLOC_LABEL: Record<string, string> = {
  quantity: 'By Qty',
  amount:   'By Amount',
  weight:   'By Weight',
  manual:   'Manual',
}

const ALLOC_COLOR: Record<string, string> = {
  quantity: 'bg-blue-500/10 text-blue-400',
  amount:   'bg-purple-500/10 text-purple-400',
  weight:   'bg-amber-500/10 text-amber-400',
  manual:   'bg-zinc-700/60 text-zinc-400',
}

export default async function LandedCostsPage() {
  const charges = await prisma.itemCharge.findMany({
    include: {
      chargeType: true,
      purchaseOrder: {
        select: { id: true, poNumber: true, supplier: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  const totalCharges  = charges.reduce((s, c) => s + Number(c.amount), 0)
  const freightTotal  = charges.filter(c => c.chargeType.code === 'FREIGHT').reduce((s, c) => s + Number(c.amount), 0)
  const dutyTotal     = charges.filter(c => c.chargeType.code === 'CUSTOMS' || c.chargeType.code === 'DUTY').reduce((s, c) => s + Number(c.amount), 0)
  const uniquePOs     = new Set(charges.map(c => c.purchaseOrderId).filter(Boolean)).size

  return (
    <>
      <TopBar
        title="Landed Costs"
        breadcrumb={[{ label: 'Purchasing', href: '/purchasing' }]}
        actions={
          <Link
            href="/purchasing/landed-costs/new"
            className="inline-flex items-center gap-1.5 h-8 px-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Landed Cost
          </Link>
        }
      />

      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto space-y-6">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-100">Landed Costs</h1>
              <p className="text-[13px] text-zinc-500 mt-0.5">
                Freight, duty, insurance, and handling charges allocated to purchase receipts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Landed Costs', value: formatCurrency(totalCharges), sub: `${charges.length} entries`, accent: 'bg-blue-500', color: 'text-zinc-100' },
              { label: 'Freight',             value: formatCurrency(freightTotal), sub: 'FREIGHT type', accent: 'bg-amber-500', color: 'text-amber-400' },
              { label: 'Duty / Customs',      value: formatCurrency(dutyTotal),   sub: 'CUSTOMS / DUTY type', accent: 'bg-violet-500', color: 'text-violet-400' },
              { label: 'Purchase Orders',     value: uniquePOs,                   sub: 'POs with landed costs', accent: 'bg-emerald-500', color: 'text-emerald-400' },
            ].map(s => (
              <div key={s.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className={`h-[3px] w-full ${s.accent}`} />
                <div className="px-4 pt-3 pb-4">
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {charges.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
              <DollarSign className="w-10 h-10 text-zinc-700" />
              <p className="text-[13px]">No landed costs recorded yet</p>
              <Link href="/purchasing/landed-costs/new" className="inline-flex items-center gap-1.5 h-8 px-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium rounded transition-colors">
                <Plus className="w-3.5 h-3.5" />Add First Charge
              </Link>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-zinc-800/80 text-zinc-500 text-[11px] uppercase tracking-wide">
                      <th className="text-left px-4 py-2.5 font-medium">Description</th>
                      <th className="text-left py-2.5 font-medium">Type</th>
                      <th className="text-left py-2.5 font-medium">PO Reference</th>
                      <th className="text-left py-2.5 font-medium">Vendor</th>
                      <th className="text-right py-2.5 font-medium">Amount</th>
                      <th className="text-center py-2.5 font-medium">Allocation</th>
                      <th className="text-right px-4 py-2.5 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {charges.map((c, idx) => (
                      <tr
                        key={c.id}
                        className={`hover:bg-zinc-800/30 transition-colors ${idx !== charges.length - 1 ? 'border-b border-zinc-800/50' : ''}`}
                      >
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-zinc-100">{c.description}</p>
                          {c.invoiceRef && <p className="text-[11px] text-zinc-500 font-mono">{c.invoiceRef}</p>}
                        </td>
                        <td className="py-2.5 pr-6">
                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[11px] font-medium">
                            {c.chargeType.code}
                          </span>
                        </td>
                        <td className="py-2.5 pr-6">
                          {c.purchaseOrder ? (
                            <Link href={`/purchasing/${c.purchaseOrder.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-[11px] hover:underline">
                              {c.purchaseOrder.poNumber}
                            </Link>
                          ) : <span className="text-zinc-600">—</span>}
                          {c.purchaseOrder?.supplier && <p className="text-[11px] text-zinc-500">{c.purchaseOrder.supplier.name}</p>}
                        </td>
                        <td className="py-2.5 pr-6 text-zinc-400 text-[12px]">
                          {c.vendorId || <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="py-2.5 pr-6 text-right font-semibold text-emerald-400 tabular-nums">
                          {formatCurrency(Number(c.amount))}
                          <span className="text-zinc-600 text-[10px] ml-1">{c.currency}</span>
                        </td>
                        <td className="py-2.5 pr-6 text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] border border-zinc-600/40 ${ALLOC_COLOR[c.allocationType] ?? 'bg-zinc-700/60 text-zinc-400'}`}>
                            {ALLOC_LABEL[c.allocationType] ?? c.allocationType}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-zinc-500 text-[11px] whitespace-nowrap">
                          {formatDate(c.chargeDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
