export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, CheckSquare } from 'lucide-react'

export default async function VendorApplyEntriesPage({
  searchParams,
}: {
  searchParams: Promise<{ vendorId?: string }>
}) {
  const sp = await searchParams
  const vendorId = sp.vendorId

  const vendors = await prisma.vendor.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, vendorCode: true },
  })

  let invoices: Awaited<ReturnType<typeof prisma.vendorInvoice.findMany>> = []
  let vendor: (typeof vendors)[0] | null = null

  if (vendorId) {
    vendor = vendors.find(v => v.id === vendorId) ?? null
    invoices = await prisma.vendorInvoice.findMany({
      where: { vendorId, status: { notIn: ['paid', 'cancelled'] } },
      orderBy: { dueDate: 'asc' },
    })
  }

  const totalRemaining = invoices.reduce((s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)), 0)

  return (
    <>
      <TopBar title="Apply Vendor Entries" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Breadcrumb */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-2 text-xs text-zinc-500 flex items-center gap-1.5">
          <Link href="/vendors" className="hover:text-zinc-300 transition-colors">Vendors</Link>
          <span>/</span>
          <span className="text-zinc-300">Apply Entries</span>
        </div>

        {/* Action Ribbon */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-2 flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-600 border border-blue-600 rounded transition-colors">
            <CheckSquare className="w-3 h-3" /> Apply
          </button>
          <Link href="/vendors">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
              Cancel
            </button>
          </Link>
        </div>

        {/* Page Title */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-3 flex items-center gap-3">
          <Link href="/vendors" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-lg font-bold text-zinc-100">Apply Vendor Entries</h1>
        </div>

        <div className="px-6 py-4 space-y-4">

          {/* Vendor Selector */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Vendor No.</label>
            <form method="GET" className="flex items-center gap-3">
              <select
                name="vendorId"
                defaultValue={vendorId ?? ''}
                className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 min-w-[280px]"
              >
                <option value="">— Select vendor —</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.vendorCode} — {v.name}
                  </option>
                ))}
              </select>
              <button type="submit" className="px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-600 rounded transition-colors">
                Load Entries
              </button>
            </form>
          </div>

          {/* Entries Table */}
          {vendorId && vendor && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-zinc-900/40 border-b border-zinc-800/50 flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-200">
                  Open Entries — {vendor.vendorCode} {vendor.name}
                </span>
                <span className="text-xs text-zinc-500">{invoices.length} open entries</span>
              </div>

              {invoices.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-zinc-600">
                  <p className="text-sm">No open entries for this vendor.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-zinc-800/60 bg-zinc-900/20">
                          <th className="px-3 py-2 text-left w-8">
                            <input type="checkbox" className="rounded border-zinc-600 bg-zinc-800" />
                          </th>
                          {[
                            { label: 'Document Type' },
                            { label: 'Document No.' },
                            { label: 'Posting Date' },
                            { label: 'Due Date' },
                            { label: 'Amount (LCY)', right: true },
                            { label: 'Remaining Amount', right: true },
                            { label: 'Status' },
                            { label: 'Applies-to' },
                          ].map(col => (
                            <th key={col.label} className={`px-3 py-2 text-[10px] uppercase tracking-widest text-zinc-500 font-medium ${col.right ? 'text-right' : 'text-left'}`}>
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map(inv => {
                          const remaining = Number(inv.totalAmount) - Number(inv.paidAmount)
                          const overdue = new Date(inv.dueDate) < new Date()
                          return (
                            <tr key={inv.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                              <td className="px-3 py-2">
                                <input type="checkbox" className="rounded border-zinc-600 bg-zinc-800" />
                              </td>
                              <td className="px-3 py-2 text-sm text-zinc-300">Invoice</td>
                              <td className="px-3 py-2 font-mono text-sm text-zinc-300">{inv.invoiceNumber}</td>
                              <td className="px-3 py-2 text-sm text-zinc-400">
                                {new Date(inv.postingDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                              </td>
                              <td className={`px-3 py-2 text-sm ${overdue ? 'text-red-400 font-medium' : 'text-zinc-400'}`}>
                                {new Date(inv.dueDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                              </td>
                              <td className="px-3 py-2 text-right text-sm text-zinc-300 tabular-nums font-medium">
                                {formatCurrency(Number(inv.totalAmount))}
                              </td>
                              <td className="px-3 py-2 text-right text-sm font-semibold tabular-nums">
                                <span className={remaining > 0 ? (overdue ? 'text-red-400' : 'text-amber-400') : 'text-zinc-500'}>
                                  {formatCurrency(remaining)}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <span className={`text-xs font-medium capitalize ${inv.status === 'partial' ? 'text-amber-400' : inv.status === 'posted' ? 'text-blue-400' : 'text-zinc-400'}`}>
                                  {inv.status}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  placeholder="Doc. No."
                                  className="w-28 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                                />
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Balance Row */}
                  <div className="px-4 py-3 border-t border-zinc-800/60 bg-zinc-900/30 flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-300">Total Remaining Balance</span>
                    <span className={`text-base font-bold tabular-nums ${totalRemaining > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
                      {formatCurrency(totalRemaining)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </main>
    </>
  )
}
