import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Building2, Mail, Phone, MapPin, CreditCard, FileText, Edit } from 'lucide-react'

export const dynamic = 'force-dynamic'

const PO_STATUS_STYLE: Record<string, string> = {
  draft:        'bg-zinc-700/60 text-zinc-400 border border-zinc-600/40',
  sent:         'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  acknowledged: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  partial:      'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  received:     'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  cancelled:    'bg-rose-500/15 text-rose-400 border border-rose-500/30',
}

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      purchaseOrders: {
        include: {
          items: true,
          store: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!supplier) notFound()

  // Compute stats
  const totalOrders = supplier.purchaseOrders.length
  const totalSpent = supplier.purchaseOrders.reduce((sum, po) => sum + (po.totalAmount ?? 0), 0)
  const avgPOValue = totalOrders > 0 ? totalSpent / totalOrders : 0
  const receivedPOs = supplier.purchaseOrders.filter(po => po.status === 'received').length
  const onTimePct = totalOrders > 0 ? (receivedPOs / totalOrders) * 100 : 0

  // PO table rows with received %
  const poRows = supplier.purchaseOrders.map(po => {
    const totalOrdered = po.items.reduce((s, i) => s + i.orderedQty, 0)
    const totalReceived = po.items.reduce((s, i) => s + i.receivedQty, 0)
    const receivedPct = totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0
    return {
      id: po.id,
      poNumber: po.poNumber,
      createdAt: po.createdAt,
      status: po.status,
      itemCount: po.items.length,
      totalAmount: po.totalAmount,
      receivedPct,
    }
  })

  const addressParts = [supplier.address, supplier.city, supplier.state, supplier.zip].filter(Boolean)
  const addressLine = addressParts.join(', ')

  return (
    <>
      <TopBar title={supplier.name} />
      <main className="flex-1 p-6 overflow-auto min-h-[100dvh] bg-[#0f0f1a] space-y-6">

        {/* Back link */}
        <Link
          href="/purchasing/suppliers"
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Suppliers
        </Link>

        {/* Header card */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-zinc-100">{supplier.name}</h1>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                    supplier.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'
                  }`}>
                    {supplier.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {supplier.contactName && (
                  <p className="text-[13px] text-zinc-500">Contact: {supplier.contactName}</p>
                )}
              </div>
            </div>
            <Link
              href={`/purchasing/suppliers/${supplier.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:border-zinc-500 text-[13px] transition-colors shrink-0"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Supplier
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: totalOrders, color: 'text-zinc-100' },
            { label: 'Total Spent', value: formatCurrency(totalSpent), color: 'text-emerald-400' },
            { label: 'Avg PO Value', value: formatCurrency(avgPOValue), color: 'text-zinc-100' },
            { label: 'On-Time Delivery', value: totalOrders > 0 ? `${onTimePct.toFixed(0)}%` : '—', color: onTimePct >= 80 ? 'text-emerald-400' : onTimePct >= 50 ? 'text-amber-400' : 'text-red-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-2xl font-bold tabular-nums ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Contact info */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Contact Information</p>
            {supplier.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-zinc-600 shrink-0" />
                <a href={`mailto:${supplier.email}`} className="text-[13px] text-zinc-300 hover:text-blue-400 transition-colors">
                  {supplier.email}
                </a>
              </div>
            )}
            {supplier.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-zinc-600 shrink-0" />
                <a href={`tel:${supplier.phone}`} className="text-[13px] text-zinc-300 hover:text-blue-400 transition-colors">
                  {supplier.phone}
                </a>
              </div>
            )}
            {supplier.paymentTerms && (
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-zinc-600 shrink-0" />
                <span className="text-[13px] text-zinc-300">{supplier.paymentTerms}</span>
              </div>
            )}
            {!supplier.email && !supplier.phone && !supplier.paymentTerms && (
              <p className="text-[13px] text-zinc-600">No contact details on record</p>
            )}
          </div>

          {/* Address & Notes */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Address &amp; Notes</p>
            {addressLine ? (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                <span className="text-[13px] text-zinc-300">{addressLine}</span>
              </div>
            ) : (
              <p className="text-[13px] text-zinc-600">No address on record</p>
            )}
            {supplier.notes && (
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                <span className="text-[13px] text-zinc-400">{supplier.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* PO history */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-zinc-100">Purchase Order History</h2>
            <span className="text-[13px] text-zinc-500">{totalOrders} orders</span>
          </div>

          {poRows.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-zinc-500">
              <p className="text-[13px]">No purchase orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">PO #</th>
                    <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Date</th>
                    <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                    <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Items</th>
                    <th className="text-right px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Total</th>
                    <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Received %</th>
                  </tr>
                </thead>
                <tbody>
                  {poRows.map((po, idx) => (
                    <tr
                      key={po.id}
                      className={`hover:bg-zinc-800/20 transition-colors ${idx !== poRows.length - 1 ? 'border-b border-zinc-800/30' : ''}`}
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/purchasing/${po.id}`}
                          className="font-mono text-[11px] text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                        >
                          {po.poNumber}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-zinc-400 text-[12px] whitespace-nowrap">
                        {new Date(po.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${PO_STATUS_STYLE[po.status] ?? 'bg-zinc-700/60 text-zinc-400 border border-zinc-600/40'}`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-[11px] font-mono tabular-nums">
                          {po.itemCount}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-emerald-400 tabular-nums">
                        {formatCurrency(po.totalAmount ?? 0)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={`font-semibold tabular-nums text-[12px] ${
                          po.receivedPct >= 100 ? 'text-emerald-400'
                          : po.receivedPct > 0 ? 'text-amber-400'
                          : 'text-zinc-500'
                        }`}>
                          {po.receivedPct.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </>
  )
}
