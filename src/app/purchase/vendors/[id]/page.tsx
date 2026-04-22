export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Edit2, Trash2, Plus, Ban, BookOpen, BarChart2, CreditCard, ArrowLeft, Building2 } from 'lucide-react'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
}

const FIELD = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">{label}</div>
    <div className="text-[13px] text-zinc-100">{value ?? '—'}</div>
  </div>
)

export default async function PurchaseVendorCardPage({
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
        take: 10,
      },
      purchaseOrders: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!vendor) notFound()

  const balance = vendor.invoices.reduce(
    (s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)),
    0
  )
  const balanceDue = vendor.invoices
    .filter(i => new Date(i.dueDate) < new Date())
    .reduce((s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)), 0)
  const outstandingPOs = vendor.purchaseOrders.filter(
    po => !['received', 'cancelled', 'closed'].includes(po.status)
  ).length
  const totalInvoiced = vendor.invoices.reduce((s, i) => s + Number(i.totalAmount), 0)
  const totalPaid = vendor.invoices.reduce((s, i) => s + Number(i.paidAmount), 0)

  const actions = (
    <div className="flex items-center gap-1.5">
      <Link
        href={`/purchase/vendors/${id}/edit`}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors"
      >
        <Edit2 className="w-3.5 h-3.5" /> Edit
      </Link>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
      <Link
        href="/purchase/vendors/new"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> New
      </Link>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        <Ban className="w-3.5 h-3.5" /> Block
      </button>
      <div className="w-px h-5 bg-zinc-700 mx-0.5" />
      <Link
        href="/finance/vendor-ledger"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors"
      >
        <BookOpen className="w-3.5 h-3.5" /> Ledger Entries
      </Link>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        <BarChart2 className="w-3.5 h-3.5" /> Statistics
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        <CreditCard className="w-3.5 h-3.5" /> Bank Accounts
      </button>
    </div>
  )

  return (
    <>
      <TopBar
        title={vendor.name}
        breadcrumb={[
          { label: 'Purchase', href: '/purchase' },
          { label: 'Vendors', href: '/purchase/vendors' },
        ]}
        actions={actions}
      />

      <div className="min-h-[100dvh] bg-[#0f0f1a]">
        {/* Page Header */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-3 flex items-center gap-3">
          <Link href="/purchase/vendors" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Building2 className="w-5 h-5 text-zinc-400" />
          <h1 className="text-base font-bold text-zinc-100">{vendor.name}</h1>
          <span className="font-mono text-[11px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
            {vendor.vendorCode}
          </span>
          {!vendor.isActive && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-red-500/10 text-red-400 border border-red-500/20">
              Blocked
            </span>
          )}
        </div>

        <div className="px-6 py-4 flex gap-4">
          {/* Left: FastTabs */}
          <div className="flex-1 space-y-2">

            {/* General */}
            <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className="px-4 py-3 text-[13px] font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 select-none list-none flex items-center gap-2">
                <span className="text-zinc-600 text-[10px]">▶</span> General
              </summary>
              <div className="px-4 pb-4 pt-2 grid grid-cols-3 gap-x-6 gap-y-3">
                <FIELD label="No." value={<span className="font-mono">{vendor.vendorCode}</span>} />
                <FIELD label="Name" value={vendor.name} />
                <FIELD label="Balance (LCY)" value={<span className={balance > 0 ? 'text-amber-400 font-semibold' : 'text-zinc-400'}>{formatCurrency(balance)}</span>} />
                <FIELD label="Balance Due (LCY)" value={<span className={balanceDue > 0 ? 'text-red-400 font-semibold' : 'text-zinc-400'}>{formatCurrency(balanceDue)}</span>} />
                <FIELD label="Blocked" value={vendor.isActive ? 'None' : 'All'} />
                <FIELD label="Vendor Posting Group" value={vendor.vendorGroup?.code || 'DOMESTIC'} />
              </div>
            </details>

            {/* Address & Contact */}
            <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className="px-4 py-3 text-[13px] font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 select-none list-none flex items-center gap-2">
                <span className="text-zinc-600 text-[10px]">▶</span> Communication
              </summary>
              <div className="px-4 pb-4 pt-2 grid grid-cols-3 gap-x-6 gap-y-3">
                <FIELD label="Address" value={vendor.address} />
                <FIELD label="City" value={vendor.city} />
                <FIELD label="State" value={vendor.state} />
                <FIELD label="ZIP / Post Code" value={vendor.zip} />
                <FIELD label="Phone No." value={vendor.phone} />
                <FIELD label="Email" value={vendor.email ? <a href={`mailto:${vendor.email}`} className="text-blue-400 hover:underline">{vendor.email}</a> : '—'} />
                <FIELD label="Country / Region Code" value="US" />
              </div>
            </details>

            {/* Invoicing */}
            <details className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className="px-4 py-3 text-[13px] font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 select-none list-none flex items-center gap-2">
                <span className="text-zinc-600 text-[10px]">▶</span> Invoicing
              </summary>
              <div className="px-4 pb-4 pt-2 grid grid-cols-3 gap-x-6 gap-y-3">
                <FIELD label="VAT Registration No." value={vendor.taxId} />
                <FIELD label="Currency Code" value={vendor.currency || 'USD'} />
                <FIELD label="Payment Terms Code" value={vendor.paymentTerms} />
                <FIELD label="Payment Method Code" value={vendor.paymentMethod} />
                <FIELD label="Gen. Bus. Posting Group" value="DOMESTIC" />
                <FIELD label="Vendor Posting Group" value={vendor.vendorGroup?.code || 'DOMESTIC'} />
              </div>
            </details>

            {/* Payments */}
            <details className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className="px-4 py-3 text-[13px] font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 select-none list-none flex items-center gap-2">
                <span className="text-zinc-600 text-[10px]">▶</span> Payments
              </summary>
              <div className="px-4 pb-4 pt-2 grid grid-cols-3 gap-x-6 gap-y-3">
                <FIELD label="Application Method" value="Manual" />
                <FIELD label="Payment Terms Code" value={vendor.paymentTerms} />
                <FIELD label="Preferred Bank Account" value="—" />
                <FIELD label="Partner Type" value="Company" />
              </div>
            </details>

            {/* Receiving */}
            <details className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className="px-4 py-3 text-[13px] font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 select-none list-none flex items-center gap-2">
                <span className="text-zinc-600 text-[10px]">▶</span> Receiving
              </summary>
              <div className="px-4 pb-4 pt-2 grid grid-cols-3 gap-x-6 gap-y-3">
                <FIELD label="Location Code" value="—" />
                <FIELD label="Shipment Method Code" value="—" />
                <FIELD label="Lead Time Calculation" value="—" />
              </div>
            </details>

            {/* Foreign Trade */}
            <details className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className="px-4 py-3 text-[13px] font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 select-none list-none flex items-center gap-2">
                <span className="text-zinc-600 text-[10px]">▶</span> Foreign Trade
              </summary>
              <div className="px-4 pb-4 pt-2 grid grid-cols-3 gap-x-6 gap-y-3">
                <FIELD label="Currency Code" value={vendor.currency || 'USD'} />
                <FIELD label="Transaction Type Code" value="—" />
                <FIELD label="Transaction Specification" value="—" />
              </div>
            </details>

          </div>

          {/* Right: FactBox */}
          <div className="w-72 shrink-0 space-y-3">

            {/* Vendor Statistics */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-zinc-900/40 border-b border-zinc-800/50">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Vendor Statistics</span>
              </div>
              <div className="px-3 py-3 space-y-2.5">
                {[
                  { label: 'Balance (LCY)', value: formatCurrency(balance), color: balance > 0 ? 'text-amber-400' : 'text-zinc-400' },
                  { label: 'Balance Due (LCY)', value: formatCurrency(balanceDue), color: balanceDue > 0 ? 'text-red-400' : 'text-zinc-400' },
                  { label: 'Outstanding POs', value: String(outstandingPOs), color: 'text-zinc-200' },
                  { label: 'Total Invoiced (LCY)', value: formatCurrency(totalInvoiced), color: 'text-zinc-200' },
                  { label: 'Total Paid (LCY)', value: formatCurrency(totalPaid), color: 'text-emerald-400' },
                  { label: 'Total Invoices', value: String(vendor.invoices.length), color: 'text-zinc-200' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-[11px] text-zinc-500">{row.label}</span>
                    <span className={`text-[12px] font-semibold tabular-nums ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vendor Ledger Entries */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-zinc-900/40 border-b border-zinc-800/50">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Vendor Ledger Entries</span>
              </div>
              {vendor.invoices.length === 0 ? (
                <p className="px-3 py-3 text-[11px] text-zinc-600">No entries.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/50">
                      <th className="px-3 py-1.5 text-left text-[9px] uppercase tracking-widest text-zinc-600">Date</th>
                      <th className="px-3 py-1.5 text-left text-[9px] uppercase tracking-widest text-zinc-600">No.</th>
                      <th className="px-3 py-1.5 text-right text-[9px] uppercase tracking-widest text-zinc-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendor.invoices.slice(0, 6).map(inv => (
                      <tr key={inv.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20">
                        <td className="px-3 py-1.5 text-[10px] text-zinc-500">
                          {formatDate(inv.invoiceDate)}
                        </td>
                        <td className="px-3 py-1.5 font-mono text-[10px] text-zinc-300">
                          {inv.invoiceNumber.slice(-8)}
                        </td>
                        <td className="px-3 py-1.5 text-right text-[10px] font-semibold tabular-nums text-zinc-200">
                          {formatCurrency(Number(inv.totalAmount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="px-3 py-2 border-t border-zinc-800/50">
                <Link href="/finance/vendor-ledger" className="text-[11px] text-blue-400 hover:underline">
                  View all entries →
                </Link>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-zinc-900/40 border-b border-zinc-800/50">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Comments</span>
              </div>
              <div className="px-3 py-2">
                {vendor.notes ? (
                  <p className="text-[12px] text-zinc-400">{vendor.notes}</p>
                ) : (
                  <p className="text-[11px] text-zinc-600">No comments.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
