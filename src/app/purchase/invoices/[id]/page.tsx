export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import {
  Edit, Trash2, Send, RotateCcw, Building2, FileText, Package, CreditCard,
} from 'lucide-react'

export default async function PurchaseInvoiceCardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const invoice = await prisma.vendorInvoice.findUnique({
    where: { id },
    include: {
      vendor:      true,
      lines:       true,
      settlements: { include: { payment: true }, orderBy: { settledAt: 'desc' } },
    },
  })

  if (!invoice) notFound()

  function statusColor(s: string) {
    switch (s) {
      case 'received':     return 'text-zinc-300 bg-zinc-700/40'
      case 'under-review': return 'text-blue-400 bg-blue-500/10'
      case 'approved':     return 'text-emerald-400 bg-emerald-500/10'
      case 'disputed':     return 'text-red-400 bg-red-500/10'
      case 'paid':         return 'text-emerald-300 bg-emerald-600/20'
      case 'partial-paid': return 'text-amber-400 bg-amber-500/10'
      case 'cancelled':    return 'text-red-400 bg-red-500/10'
      default:             return 'text-zinc-400 bg-zinc-800/40'
    }
  }

  const balance = invoice.totalAmount - invoice.paidAmount

  return (
    <>
      <TopBar
        title={invoice.invoiceNumber}
        breadcrumb={[
          { label: 'Purchase', href: '/purchase/orders' },
          { label: 'Purchase Invoices', href: '/purchase/invoices' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Action Ribbon */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-2 flex items-center gap-2">
          <Link href={`/purchase/invoices/${id}/edit`}>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
              <Edit className="w-3 h-3" /> Edit
            </button>
          </Link>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
          <div className="w-px h-5 bg-zinc-700 mx-1" />
          {['received', 'under-review'].includes(invoice.status) && (
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-700 hover:bg-indigo-600 border border-indigo-600 rounded transition-colors">
              <Send className="w-3 h-3" /> Release
            </button>
          )}
          {invoice.status === 'approved' && (
            <>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
                <RotateCcw className="w-3 h-3" /> Reopen
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 rounded transition-colors">
                Post
              </button>
            </>
          )}
        </div>

        <div className="flex gap-0 h-[calc(100dvh-88px)]">

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">

            <div className="flex items-center gap-3">
              <span className={`text-xs px-2.5 py-1 rounded font-semibold ${statusColor(invoice.status)}`}>
                {invoice.status.replace(/-/g, ' ')}
              </span>
              <span className="text-xs text-zinc-500">
                {new Date(invoice.invoiceDate).toLocaleDateString()}
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
                    <Link href={`/vendors/${invoice.vendor.id}`} className="text-sm text-indigo-400 hover:underline font-mono">
                      {invoice.vendor.vendorCode}
                    </Link>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Buy-from Vendor Name</p>
                    <p className="text-sm text-zinc-100 font-medium">{invoice.vendor.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Posting Date</p>
                    <p className="text-sm text-zinc-300">{new Date(invoice.postingDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Invoice Date</p>
                    <p className="text-sm text-zinc-200">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Due Date</p>
                    <p className="text-sm text-zinc-200">
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Matching Status</p>
                    <p className="text-sm text-zinc-300 capitalize">{invoice.matchingStatus?.replace(/_/g, ' ') ?? 'None'}</p>
                  </div>
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
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Total Amount (LCY)</p>
                    <p className="text-base font-bold text-indigo-300 tabular-nums">{formatCurrency(invoice.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Paid Amount</p>
                    <p className="text-base font-bold text-emerald-400 tabular-nums">{formatCurrency(invoice.paidAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Balance</p>
                    <p className={`text-base font-bold tabular-nums ${balance > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                      {formatCurrency(balance)}
                    </p>
                  </div>
                  {invoice.notes && (
                    <div className="col-span-2">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Notes</p>
                      <p className="text-xs text-zinc-400">{invoice.notes}</p>
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
                <span className="ml-auto text-[11px] text-zinc-500">{invoice.lines.length} line{invoice.lines.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="bg-[#0d1117] overflow-x-auto">
                {invoice.lines.length === 0 ? (
                  <div className="py-8 text-center text-zinc-600 text-sm">No lines.</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800/60">
                        {['Type', 'No.', 'Description', 'Quantity', 'Direct Unit Cost', 'Disc%', 'Amount'].map((h, i) => (
                          <th key={i} className={`px-3 py-2 text-[10px] uppercase tracking-widest text-zinc-500 font-medium ${
                            ['Quantity', 'Direct Unit Cost', 'Disc%', 'Amount'].includes(h) ? 'text-right' : 'text-left'
                          }`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lines.map(line => (
                        <tr key={line.id} className="border-b border-zinc-800/30 hover:bg-[rgba(99,102,241,0.05)]">
                          <td className="px-3 py-2 text-xs text-zinc-400">G/L Account</td>
                          <td className="px-3 py-2 font-mono text-[11px] text-zinc-400">{line.accountCode ?? '—'}</td>
                          <td className="px-3 py-2 text-sm text-zinc-200">{line.description}</td>
                          <td className="px-3 py-2 text-right text-sm text-zinc-200 tabular-nums">{line.quantity}</td>
                          <td className="px-3 py-2 text-right text-sm text-zinc-200 tabular-nums">{formatCurrency(line.unitPrice)}</td>
                          <td className="px-3 py-2 text-right text-xs text-zinc-500">0%</td>
                          <td className="px-3 py-2 text-right text-sm font-medium text-zinc-100 tabular-nums">{formatCurrency(line.lineAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-zinc-700/50">
                        <td colSpan={6} className="px-3 py-2 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wide">Total</td>
                        <td className="px-3 py-2 text-right text-sm font-bold text-indigo-300 tabular-nums">
                          {formatCurrency(invoice.totalAmount)}
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

            <div className="border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="bg-zinc-900/60 px-3 py-2 border-b border-zinc-800/50">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Vendor Details</p>
              </div>
              <div className="px-3 py-3 space-y-2">
                <div>
                  <p className="text-[10px] text-zinc-600">Name</p>
                  <p className="text-xs text-zinc-300 font-medium">{invoice.vendor.name}</p>
                </div>
                {invoice.vendor.email && (
                  <div>
                    <p className="text-[10px] text-zinc-600">Email</p>
                    <p className="text-xs text-zinc-400">{invoice.vendor.email}</p>
                  </div>
                )}
                {invoice.vendor.paymentTerms && (
                  <div>
                    <p className="text-[10px] text-zinc-600">Payment Terms</p>
                    <p className="text-xs text-zinc-400">{invoice.vendor.paymentTerms}</p>
                  </div>
                )}
                <Link href={`/vendors/${invoice.vendor.id}`} className="block text-[11px] text-indigo-400 hover:underline mt-1">
                  View vendor card →
                </Link>
              </div>
            </div>

            <div className="border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="bg-zinc-900/60 px-3 py-2 border-b border-zinc-800/50">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Invoice Statistics</p>
              </div>
              <div className="px-3 py-3 space-y-2">
                <div className="flex justify-between">
                  <p className="text-[10px] text-zinc-500">Total Amount</p>
                  <p className="text-xs font-bold text-indigo-300 tabular-nums">{formatCurrency(invoice.totalAmount)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-[10px] text-zinc-500">Paid</p>
                  <p className="text-xs font-bold text-emerald-400 tabular-nums">{formatCurrency(invoice.paidAmount)}</p>
                </div>
                <div className="flex justify-between border-t border-zinc-800/50 pt-2">
                  <p className="text-[10px] text-zinc-500">Balance</p>
                  <p className={`text-xs font-bold tabular-nums ${balance > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                    {formatCurrency(balance)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="bg-zinc-900/60 px-3 py-2 border-b border-zinc-800/50">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                  Payments ({invoice.settlements.length})
                </p>
              </div>
              <div className="px-3 py-3 space-y-2">
                {invoice.settlements.length === 0 ? (
                  <p className="text-[11px] text-zinc-600">No payments applied.</p>
                ) : (
                  invoice.settlements.map(s => (
                    <div key={s.id} className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] text-zinc-300">{s.payment.paymentMethod ?? 'Payment'}</p>
                        <p className="text-[10px] text-zinc-600">
                          {new Date(s.settledAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-400 tabular-nums">
                        {formatCurrency(s.settledAmount)}
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
