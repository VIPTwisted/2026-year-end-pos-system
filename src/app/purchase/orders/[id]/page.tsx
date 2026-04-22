export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import {
  Edit, Trash2, Send, PackageCheck, ChevronRight, RotateCcw,
  Building2, MapPin, FileText, Package, Hash,
} from 'lucide-react'

export default async function PurchaseOrderCardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const order = await prisma.vendorPO.findUnique({
    where: { id },
    include: {
      vendor:   true,
      lines:    true,
      receipts: { include: { lines: true }, orderBy: { receivedAt: 'desc' } },
    },
  })

  if (!order) notFound()

  function statusColor(s: string) {
    switch (s) {
      case 'draft':     return 'text-zinc-400 bg-zinc-800/40'
      case 'open':      return 'text-blue-400 bg-blue-500/10'
      case 'released':  return 'text-indigo-400 bg-indigo-500/10'
      case 'received':  return 'text-emerald-400 bg-emerald-500/10'
      case 'invoiced':  return 'text-purple-400 bg-purple-500/10'
      case 'cancelled': return 'text-red-400 bg-red-500/10'
      default:          return 'text-zinc-400 bg-zinc-800/40'
    }
  }

  const totalReceived = order.receipts.reduce(
    (s, r) => s + r.lines.reduce((ls, l) => ls + l.qtyReceived, 0),
    0
  )
  const totalOrdered = order.lines.reduce((s, l) => s + l.qtyOrdered, 0)

  return (
    <>
      <TopBar
        title={order.poNumber}
        breadcrumb={[
          { label: 'Purchase', href: '/purchase/orders' },
          { label: 'Purchase Orders', href: '/purchase/orders' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Action Ribbon */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-2 flex items-center gap-2">
          <Link href={`/purchase/orders/${id}/edit`}>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
              <Edit className="w-3 h-3" /> Edit
            </button>
          </Link>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
          <div className="w-px h-5 bg-zinc-700 mx-1" />
          {['open', 'draft'].includes(order.status) && (
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-700 hover:bg-indigo-600 border border-indigo-600 rounded transition-colors">
              <Send className="w-3 h-3" /> Release
            </button>
          )}
          {order.status === 'released' && (
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
              <RotateCcw className="w-3 h-3" /> Reopen
            </button>
          )}
          {['released', 'open'].includes(order.status) && (
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 rounded transition-colors">
              <PackageCheck className="w-3 h-3" /> Receive
            </button>
          )}
        </div>

        <div className="flex gap-0 h-[calc(100dvh-88px)]">

          {/* Main Content (FastTabs) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">

            {/* Status badge header */}
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2.5 py-1 rounded font-semibold capitalize ${statusColor(order.status)}`}>
                {order.status}
              </span>
              <span className="text-xs text-zinc-500">
                Created {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* FastTab: General */}
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="bg-[#16213e] border-b border-zinc-800/50 px-4 py-2.5 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wide">General</span>
              </div>
              <div className="bg-[#0d1117] px-4 py-4">
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Buy-from Vendor No.</p>
                    <Link href={`/vendors/${order.vendor.id}`} className="text-sm text-indigo-400 hover:underline font-mono">
                      {order.vendor.vendorCode}
                    </Link>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Buy-from Vendor Name</p>
                    <p className="text-sm text-zinc-100 font-medium">{order.vendor.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Order Date</p>
                    <p className="text-sm text-zinc-200">{new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Expected Receipt Date</p>
                    <p className="text-sm text-zinc-200">
                      {order.expectedDate ? new Date(order.expectedDate).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Document Date</p>
                    <p className="text-sm text-zinc-200">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Status</p>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${statusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* FastTab: Shipping & Payment */}
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="bg-[#16213e] border-b border-zinc-800/50 px-4 py-2.5 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wide">Shipping &amp; Payment</span>
              </div>
              <div className="bg-[#0d1117] px-4 py-4">
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Ship-to Address</p>
                    <p className="text-sm text-zinc-300">{order.shippingAddress ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Payment Terms</p>
                    <p className="text-sm text-zinc-300">{order.vendor.paymentTerms ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Payment Method</p>
                    <p className="text-sm text-zinc-300">{order.vendor.paymentMethod ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Currency</p>
                    <p className="text-sm text-zinc-300">{order.vendor.currency ?? 'USD'}</p>
                  </div>
                  {order.receivedDate && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Received Date</p>
                      <p className="text-sm text-zinc-200">{new Date(order.receivedDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FastTab: Invoice Details */}
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="bg-[#16213e] border-b border-zinc-800/50 px-4 py-2.5 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wide">Invoice Details</span>
              </div>
              <div className="bg-[#0d1117] px-4 py-4">
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Subtotal</p>
                    <p className="text-sm text-zinc-200 tabular-nums">{formatCurrency(order.subtotal)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Tax Amount</p>
                    <p className="text-sm text-zinc-200 tabular-nums">{formatCurrency(order.taxAmt)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Shipping Amt</p>
                    <p className="text-sm text-zinc-200 tabular-nums">{formatCurrency(order.shippingAmt)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Total Amount (LCY)</p>
                    <p className="text-base font-bold text-indigo-300 tabular-nums">{formatCurrency(order.totalAmt)}</p>
                  </div>
                  {order.notes && (
                    <div className="col-span-2">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Notes</p>
                      <p className="text-xs text-zinc-400">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FastTab: Lines */}
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="bg-[#16213e] border-b border-zinc-800/50 px-4 py-2.5 flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wide">Lines</span>
                <span className="ml-auto text-[11px] text-zinc-500">{order.lines.length} line{order.lines.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="bg-[#0d1117] overflow-x-auto">
                {order.lines.length === 0 ? (
                  <div className="py-8 text-center text-zinc-600 text-sm">No lines added.</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800/60">
                        {['Type', 'No.', 'Description', 'Quantity', 'Direct Unit Cost', 'Disc%', 'Amount'].map((h, i) => (
                          <th
                            key={i}
                            className={`px-3 py-2 text-[10px] uppercase tracking-widest text-zinc-500 font-medium ${
                              ['Quantity', 'Direct Unit Cost', 'Disc%', 'Amount'].includes(h) ? 'text-right' : 'text-left'
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {order.lines.map(line => (
                        <tr key={line.id} className="border-b border-zinc-800/30 hover:bg-[rgba(99,102,241,0.05)]">
                          <td className="px-3 py-2 text-xs text-zinc-400">Item</td>
                          <td className="px-3 py-2 font-mono text-[11px] text-zinc-400">{line.sku ?? '—'}</td>
                          <td className="px-3 py-2 text-sm text-zinc-200">{line.productName ?? '—'}</td>
                          <td className="px-3 py-2 text-right text-sm text-zinc-200 tabular-nums">{line.qtyOrdered}</td>
                          <td className="px-3 py-2 text-right text-sm text-zinc-200 tabular-nums">{formatCurrency(line.unitCost)}</td>
                          <td className="px-3 py-2 text-right text-xs text-zinc-500">0%</td>
                          <td className="px-3 py-2 text-right text-sm font-medium text-zinc-100 tabular-nums">{formatCurrency(line.lineTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-zinc-700/50">
                        <td colSpan={6} className="px-3 py-2 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wide">Total</td>
                        <td className="px-3 py-2 text-right text-sm font-bold text-indigo-300 tabular-nums">
                          {formatCurrency(order.totalAmt)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* FactBox Sidebar */}
          <div className="w-64 shrink-0 border-l border-zinc-800/50 bg-[#16213e] overflow-y-auto p-4 space-y-4">

            {/* Vendor Info FactBox */}
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="bg-zinc-900/60 px-3 py-2 border-b border-zinc-800/50">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Vendor Details</p>
              </div>
              <div className="px-3 py-3 space-y-2">
                <div>
                  <p className="text-[10px] text-zinc-600">Name</p>
                  <p className="text-xs text-zinc-300 font-medium">{order.vendor.name}</p>
                </div>
                {order.vendor.email && (
                  <div>
                    <p className="text-[10px] text-zinc-600">Email</p>
                    <p className="text-xs text-zinc-400">{order.vendor.email}</p>
                  </div>
                )}
                {order.vendor.phone && (
                  <div>
                    <p className="text-[10px] text-zinc-600">Phone</p>
                    <p className="text-xs text-zinc-400">{order.vendor.phone}</p>
                  </div>
                )}
                {(order.vendor.city || order.vendor.state) && (
                  <div>
                    <p className="text-[10px] text-zinc-600">Location</p>
                    <p className="text-xs text-zinc-400">
                      {[order.vendor.city, order.vendor.state].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
                <Link href={`/vendors/${order.vendor.id}`} className="block text-[11px] text-indigo-400 hover:underline mt-1">
                  View vendor card →
                </Link>
              </div>
            </div>

            {/* Order Statistics FactBox */}
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="bg-zinc-900/60 px-3 py-2 border-b border-zinc-800/50">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Order Statistics</p>
              </div>
              <div className="px-3 py-3 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-zinc-500">Qty Ordered</p>
                  <p className="text-xs font-semibold text-zinc-200 tabular-nums">{totalOrdered}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-zinc-500">Qty Received</p>
                  <p className="text-xs font-semibold text-emerald-400 tabular-nums">{totalReceived}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-zinc-500">Lines</p>
                  <p className="text-xs font-semibold text-zinc-300">{order.lines.length}</p>
                </div>
                <div className="border-t border-zinc-800/50 pt-2 flex justify-between items-center">
                  <p className="text-[10px] text-zinc-500">Total Amount</p>
                  <p className="text-xs font-bold text-indigo-300 tabular-nums">{formatCurrency(order.totalAmt)}</p>
                </div>
              </div>
            </div>

            {/* Receipts FactBox */}
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="bg-zinc-900/60 px-3 py-2 border-b border-zinc-800/50">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                  Posted Receipts ({order.receipts.length})
                </p>
              </div>
              <div className="px-3 py-3 space-y-2">
                {order.receipts.length === 0 ? (
                  <p className="text-[11px] text-zinc-600">No receipts posted yet.</p>
                ) : (
                  order.receipts.map(r => (
                    <div key={r.id} className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-mono text-zinc-300">{r.receiptNumber}</p>
                        <p className="text-[10px] text-zinc-600">
                          {new Date(r.receivedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {r.lines.reduce((s, l) => s + l.qtyReceived, 0)} units
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
