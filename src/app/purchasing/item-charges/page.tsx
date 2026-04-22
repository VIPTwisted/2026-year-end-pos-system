export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus } from 'lucide-react'

const ALLOC_LABEL: Record<string, string> = {
  quantity: 'By Qty',
  amount:   'By Amount',
  weight:   'By Weight',
}

export default async function ItemChargesPage() {
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

  const totalCharges = charges.reduce((s, c) => s + Number(c.amount), 0)

  const freightTotal = charges
    .filter(c => c.chargeType.code === 'FREIGHT')
    .reduce((s, c) => s + Number(c.amount), 0)

  const customsTotal = charges
    .filter(c => c.chargeType.code === 'CUSTOMS')
    .reduce((s, c) => s + Number(c.amount), 0)

  const uniquePOs = new Set(charges.map(c => c.purchaseOrderId).filter(Boolean)).size
  const avgPerPO = uniquePOs > 0 ? totalCharges / uniquePOs : 0

  const stats = [
    {
      label: 'Total Charges',
      value: formatCurrency(totalCharges),
      sub: `${charges.length} records`,
      accent: 'bg-blue-500',
      color: 'text-zinc-100',
    },
    {
      label: 'Freight',
      value: formatCurrency(freightTotal),
      sub: 'FREIGHT type',
      accent: 'bg-amber-500',
      color: 'text-amber-400',
    },
    {
      label: 'Customs / Duty',
      value: formatCurrency(customsTotal),
      sub: 'CUSTOMS type',
      accent: 'bg-violet-500',
      color: 'text-violet-400',
    },
    {
      label: 'Avg per PO',
      value: formatCurrency(avgPerPO),
      sub: `${uniquePOs} POs`,
      accent: 'bg-emerald-500',
      color: 'text-emerald-400',
    },
  ]

  return (
    <>
      <TopBar
        title="Item Charges"
        breadcrumb={[{ label: 'Purchasing', href: '/purchasing' }]}
        actions={
          <Link
            href="/purchasing/item-charges/new"
            className="inline-flex items-center gap-1.5 h-8 px-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Charge
          </Link>
        }
      />

      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Item Charges / Landed Costs</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              Freight, customs, insurance assigned to purchase receipts
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div
              key={s.label}
              className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden"
            >
              <div className={`h-[3px] w-full ${s.accent}`} />
              <div className="px-4 pt-3 pb-4">
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">{s.label}</p>
                <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-zinc-600 mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        {charges.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-20 text-zinc-500">
            <p className="text-[13px] mb-4">No item charges yet</p>
            <Link
              href="/purchasing/item-charges/new"
              className="inline-flex items-center gap-1.5 h-8 px-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Charge
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
                        {c.invoiceRef && (
                          <p className="text-[11px] text-zinc-500 font-mono">{c.invoiceRef}</p>
                        )}
                      </td>
                      <td className="py-2.5 pr-6">
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[11px] font-medium">
                          {c.chargeType.code}
                        </span>
                      </td>
                      <td className="py-2.5 pr-6">
                        {c.purchaseOrder ? (
                          <Link
                            href={`/purchasing/${c.purchaseOrder.id}`}
                            className="text-blue-400 hover:text-blue-300 font-mono text-[11px] hover:underline"
                          >
                            {c.purchaseOrder.poNumber}
                          </Link>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                        {c.purchaseOrder?.supplier && (
                          <p className="text-[11px] text-zinc-500">{c.purchaseOrder.supplier.name}</p>
                        )}
                      </td>
                      <td className="py-2.5 pr-6 text-zinc-400 text-[12px]">
                        {c.vendorId || <span className="text-zinc-700">—</span>}
                      </td>
                      <td className="py-2.5 pr-6 text-right font-semibold text-emerald-400 tabular-nums">
                        {formatCurrency(Number(c.amount))}
                        <span className="text-zinc-600 text-[10px] ml-1">{c.currency}</span>
                      </td>
                      <td className="py-2.5 pr-6 text-center">
                        <span className="bg-zinc-700/60 text-zinc-400 px-2 py-0.5 rounded text-[11px] border border-zinc-600/40">
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
      </main>
    </>
  )
}
