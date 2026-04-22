export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Building2, Edit, Trash2, Plus, BookOpen } from 'lucide-react'

export default async function VendorCardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      vendorGroup: true,
      invoices: {
        orderBy: { invoiceDate: 'desc' },
        take: 5,
      },
      purchaseOrders: {
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
  })

  if (!vendor) notFound()

  const balance = vendor.invoices.reduce(
    (s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)),
    0
  )
  const outstandingPOs = vendor.purchaseOrders.filter(
    po => !['received', 'cancelled', 'closed'].includes(po.status)
  ).length
  const receivedNotInvoiced = vendor.purchaseOrders
    .filter(po => po.status === 'received')
    .reduce((s, po) => s + Number(po.totalAmt ?? 0), 0)

  return (
    <>
      <TopBar title={vendor.name} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Breadcrumb */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-2 text-xs text-zinc-500 flex items-center gap-1.5">
          <Link href="/vendors" className="hover:text-zinc-300 transition-colors">Vendors</Link>
          <span>/</span>
          <span className="text-zinc-300">{vendor.name}</span>
        </div>

        {/* Action Ribbon */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-2 flex items-center gap-2">
          <Link href={`/vendors/${id}/edit`}>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
              <Edit className="w-3 h-3" /> Edit
            </button>
          </Link>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
          <Link href="/vendors/new">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
              <Plus className="w-3 h-3" /> New
            </button>
          </Link>
          <div className="w-px h-5 bg-zinc-700 mx-1" />
          <Link href={`/vendors/${id}/ledger-entries`}>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
              <BookOpen className="w-3 h-3" /> Ledger Entries
            </button>
          </Link>
          <Link href="/vendors/apply-entries">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
              Apply Entries
            </button>
          </Link>
          <Link href={`/vendors/invoices/new?vendorId=${vendor.id}`}>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
              <Plus className="w-3 h-3" /> New Invoice
            </button>
          </Link>
        </div>

        {/* Page Title */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-3 flex items-center gap-3">
          <Link href="/vendors" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Building2 className="w-5 h-5 text-zinc-400" />
          <h1 className="text-lg font-bold text-zinc-100">{vendor.name}</h1>
          <span className="font-mono text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{vendor.vendorCode}</span>
          {!vendor.isActive && <Badge variant="destructive">Blocked</Badge>}
        </div>

        <div className="px-6 py-4 flex gap-4">

          {/* Left: FastTabs */}
          <div className="flex-1 space-y-2">

            {/* General */}
            <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className="px-4 py-3 text-sm font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 select-none list-none flex items-center gap-2">
                <span className="text-zinc-500 text-xs">▶</span> General
              </summary>
              <div className="px-4 pb-4 grid grid-cols-2 gap-x-6 gap-y-3 pt-2 md:grid-cols-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">No.</label>
                  <p className="text-sm text-zinc-100 font-mono">{vendor.vendorCode}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Name</label>
                  <p className="text-sm text-zinc-100">{vendor.name}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Balance (LCY)</label>
                  <p className={`text-sm font-semibold ${balance > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>{formatCurrency(balance)}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Balance Due (LCY)</label>
                  <p className="text-sm text-zinc-400">{formatCurrency(balance)}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Blocked</label>
                  <p className="text-sm text-zinc-100">{vendor.isActive ? 'None' : 'All'}</p>
                </div>
                {vendor.vendorGroup && (
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500">Vendor Posting Group</label>
                    <p className="text-sm text-zinc-100">{vendor.vendorGroup.name}</p>
                  </div>
                )}
              </div>
            </details>

            {/* Address & Contact */}
            <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className="px-4 py-3 text-sm font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 select-none list-none flex items-center gap-2">
                <span className="text-zinc-500 text-xs">▶</span> Address &amp; Contact
              </summary>
              <div className="px-4 pb-4 grid grid-cols-2 gap-x-6 gap-y-3 pt-2 md:grid-cols-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Address</label>
                  <p className="text-sm text-zinc-100">{vendor.address || '—'}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">City</label>
                  <p className="text-sm text-zinc-100">{vendor.city || '—'}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">State</label>
                  <p className="text-sm text-zinc-100">{vendor.state || '—'}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">ZIP / Post Code</label>
                  <p className="text-sm text-zinc-100">{vendor.zip || '—'}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Phone</label>
                  <p className="text-sm text-zinc-100">{vendor.phone || '—'}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Email</label>
                  <p className="text-sm text-zinc-100">{vendor.email || '—'}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Contact</label>
                  <p className="text-sm text-zinc-100">—</p>
                </div>
              </div>
            </details>

            {/* Invoicing */}
            <details className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className="px-4 py-3 text-sm font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 select-none list-none flex items-center gap-2">
                <span className="text-zinc-500 text-xs">▶</span> Invoicing
              </summary>
              <div className="px-4 pb-4 grid grid-cols-2 gap-x-6 gap-y-3 pt-2 md:grid-cols-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Vendor Invoice No.</label>
                  <p className="text-sm text-zinc-100 font-mono">{vendor.vendorCode}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Currency Code</label>
                  <p className="text-sm text-zinc-100">{vendor.currency || 'USD'}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Payment Terms Code</label>
                  <p className="text-sm text-zinc-100">{vendor.paymentTerms || '—'}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Payment Method Code</label>
                  <p className="text-sm text-zinc-100">{vendor.paymentMethod || '—'}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">VAT Registration No.</label>
                  <p className="text-sm text-zinc-100">{vendor.taxId || '—'}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Gen. Bus. Posting Group</label>
                  <p className="text-sm text-zinc-100">DOMESTIC</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Vendor Posting Group</label>
                  <p className="text-sm text-zinc-100">{vendor.vendorGroup?.code || 'DOMESTIC'}</p>
                </div>
              </div>
            </details>

            {/* Payments */}
            <details className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className="px-4 py-3 text-sm font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 select-none list-none flex items-center gap-2">
                <span className="text-zinc-500 text-xs">▶</span> Payments
              </summary>
              <div className="px-4 pb-4 grid grid-cols-2 gap-x-6 gap-y-3 pt-2 md:grid-cols-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Application Method</label>
                  <p className="text-sm text-zinc-100">Manual</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Payment Terms</label>
                  <p className="text-sm text-zinc-100">{vendor.paymentTerms || '—'}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Bank Account</label>
                  <p className="text-sm text-zinc-100">—</p>
                </div>
              </div>
            </details>

            {/* Receiving */}
            <details className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className="px-4 py-3 text-sm font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 select-none list-none flex items-center gap-2">
                <span className="text-zinc-500 text-xs">▶</span> Receiving
              </summary>
              <div className="px-4 pb-4 grid grid-cols-2 gap-x-6 gap-y-3 pt-2 md:grid-cols-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Location Code</label>
                  <p className="text-sm text-zinc-100">—</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Shipment Method Code</label>
                  <p className="text-sm text-zinc-100">—</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Lead Time Calculation</label>
                  <p className="text-sm text-zinc-100">—</p>
                </div>
              </div>
            </details>

            {/* Foreign Trade */}
            <details className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className="px-4 py-3 text-sm font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 select-none list-none flex items-center gap-2">
                <span className="text-zinc-500 text-xs">▶</span> Foreign Trade
              </summary>
              <div className="px-4 pb-4 grid grid-cols-2 gap-x-6 gap-y-3 pt-2 md:grid-cols-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Currency Code</label>
                  <p className="text-sm text-zinc-100">{vendor.currency || 'USD'}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Transaction Type Code</label>
                  <p className="text-sm text-zinc-100">—</p>
                </div>
              </div>
            </details>

          </div>

          {/* Right: FactBox Sidebar */}
          <div className="w-72 shrink-0 space-y-3">

            {/* Vendor Statistics FactBox */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-zinc-900/40 border-b border-zinc-800/50">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Vendor Statistics</span>
              </div>
              <div className="px-3 py-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-zinc-500">Balance (LCY)</span>
                  <span className={`text-[12px] font-semibold tabular-nums ${balance > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
                    {formatCurrency(balance)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-zinc-500">Outstanding POs</span>
                  <span className="text-[12px] font-semibold text-zinc-200 tabular-nums">{outstandingPOs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-zinc-500">Received Not Invoiced</span>
                  <span className="text-[12px] font-semibold text-zinc-400 tabular-nums">
                    {formatCurrency(receivedNotInvoiced)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-zinc-500">Total Invoices</span>
                  <span className="text-[12px] font-semibold text-zinc-200 tabular-nums">{vendor.invoices.length}</span>
                </div>
              </div>
            </div>

            {/* Recent Invoices FactBox */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-zinc-900/40 border-b border-zinc-800/50">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Recent Invoices</span>
              </div>
              {vendor.invoices.length === 0 ? (
                <p className="px-3 py-3 text-[11px] text-zinc-600">No invoices.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/50">
                      <th className="px-3 py-1.5 text-left text-[9px] uppercase tracking-widest text-zinc-600 font-medium">Date</th>
                      <th className="px-3 py-1.5 text-left text-[9px] uppercase tracking-widest text-zinc-600 font-medium">Invoice</th>
                      <th className="px-3 py-1.5 text-right text-[9px] uppercase tracking-widest text-zinc-600 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendor.invoices.slice(0, 5).map(inv => (
                      <tr key={inv.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20">
                        <td className="px-3 py-1.5 text-[10px] text-zinc-500">
                          {new Date(inv.invoiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                        </td>
                        <td className="px-3 py-1.5 font-mono text-[10px] text-zinc-300">{inv.invoiceNumber.slice(-8)}</td>
                        <td className="px-3 py-1.5 text-right text-[10px] font-semibold text-emerald-400 tabular-nums">
                          {formatCurrency(Number(inv.totalAmount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="px-3 py-2 border-t border-zinc-800/50">
                <Link href={`/vendors/${id}/ledger-entries`} className="text-[11px] text-blue-400 hover:underline">
                  View all ledger entries →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
