export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, BookOpen } from 'lucide-react'

export default async function CustomerLedgerEntriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))
  const statusFilter = sp.status ?? ''
  const pageSize = 30

  const customer = await prisma.customer.findUnique({
    where: { id },
    select: { id: true, firstName: true, lastName: true },
  })
  if (!customer) notFound()

  const where: Record<string, unknown> = { customerId: id }
  if (statusFilter) where.status = statusFilter

  const [invoices, total] = await Promise.all([
    prisma.customerInvoice.findMany({
      where,
      orderBy: { postingDate: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customerInvoice.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  const runningBalance = invoices.reduce(
    (s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)),
    0
  )

  function buildHref(overrides: Record<string, string>) {
    const base: Record<string, string> = {}
    if (statusFilter) base.status = statusFilter
    const merged = { ...base, ...overrides }
    return `/customers/${id}/ledger-entries?${new URLSearchParams(merged).toString()}`
  }

  return (
    <>
      <TopBar title="Customer Ledger Entries" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Breadcrumb */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-2 text-xs text-zinc-500 flex items-center gap-1.5">
          <Link href="/customers" className="hover:text-zinc-300 transition-colors">Customers</Link>
          <span>/</span>
          <Link href={`/customers/${id}`} className="hover:text-zinc-300 transition-colors">
            {customer.firstName} {customer.lastName}
          </Link>
          <span>/</span>
          <span className="text-zinc-300">Ledger Entries</span>
        </div>

        {/* Action Ribbon */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-2 flex items-center gap-2">
          <Link href={`/customers/${id}/apply-entries`}>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
              Apply Entries
            </button>
          </Link>
          <Link href={`/customers/${id}`}>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
              Customer Card
            </button>
          </Link>
        </div>

        {/* Page Title */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-3 flex items-center gap-3">
          <Link href={`/customers/${id}`} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <BookOpen className="w-5 h-5 text-zinc-400" />
          <h1 className="text-lg font-bold text-zinc-100">
            Customer Ledger Entries — {customer.firstName} {customer.lastName}
          </h1>
        </div>

        <div className="flex">

          {/* Filter Pane */}
          <div className="w-48 shrink-0 bg-[#16213e] border-r border-zinc-800/50 min-h-[calc(100dvh-120px)] p-4 space-y-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Filter</p>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Status</label>
              <div className="space-y-1">
                {[
                  { value: '', label: 'All' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'posted', label: 'Posted' },
                  { value: 'partial', label: 'Partial' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'cancelled', label: 'Cancelled' },
                ].map(opt => (
                  <Link
                    key={opt.value}
                    href={buildHref({ status: opt.value, page: '1' })}
                    className={`block text-xs px-2 py-1 rounded transition-colors ${statusFilter === opt.value ? 'bg-blue-700/30 text-blue-300 border border-blue-700/50' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            <div className="px-6 py-3 flex items-center justify-between border-b border-zinc-800/50">
              <p className="text-xs text-zinc-500">{total} entr{total !== 1 ? 'ies' : 'y'}</p>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>Page {page} of {totalPages || 1}</span>
                {page > 1 && (
                  <Link href={buildHref({ page: String(page - 1) })} className="text-blue-400 hover:underline">← Prev</Link>
                )}
                {page < totalPages && (
                  <Link href={buildHref({ page: String(page + 1) })} className="text-blue-400 hover:underline">Next →</Link>
                )}
              </div>
            </div>

            {invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
                <p className="text-sm">No ledger entries found.</p>
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/60 bg-zinc-900/30">
                      {[
                        { label: 'Entry No.' },
                        { label: 'Document Type' },
                        { label: 'Document No.' },
                        { label: 'Posting Date' },
                        { label: 'Due Date' },
                        { label: 'Description' },
                        { label: 'Amount (LCY)', right: true },
                        { label: 'Remaining Amount', right: true },
                        { label: 'Status' },
                        { label: 'Open' },
                      ].map(col => (
                        <th key={col.label} className={`px-3 py-2 text-[10px] uppercase tracking-widest text-zinc-500 font-medium ${col.right ? 'text-right' : 'text-left'}`}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv, idx) => {
                      const remaining = Number(inv.totalAmount) - Number(inv.paidAmount)
                      const overdue = new Date(inv.dueDate) < new Date() && !['paid','cancelled'].includes(inv.status)
                      const isOpen = !['paid','cancelled'].includes(inv.status)
                      return (
                        <tr key={inv.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                          <td className="px-3 py-2 font-mono text-[11px] text-zinc-500">
                            {(page - 1) * pageSize + idx + 1}
                          </td>
                          <td className="px-3 py-2 text-sm text-zinc-300">Invoice</td>
                          <td className="px-3 py-2 font-mono text-sm text-zinc-300">{inv.invoiceNumber}</td>
                          <td className="px-3 py-2 text-sm text-zinc-400">
                            {new Date(inv.postingDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                          </td>
                          <td className={`px-3 py-2 text-sm ${overdue ? 'text-red-400 font-medium' : 'text-zinc-400'}`}>
                            {new Date(inv.dueDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                          </td>
                          <td className="px-3 py-2 text-sm text-zinc-400 max-w-[160px] truncate">
                            {inv.notes || 'Sales Invoice'}
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
                            <span className={`text-xs font-medium capitalize ${
                              inv.status === 'paid' ? 'text-emerald-400' :
                              inv.status === 'partial' ? 'text-amber-400' :
                              inv.status === 'posted' ? 'text-blue-400' :
                              inv.status === 'cancelled' ? 'text-red-400' :
                              'text-zinc-400'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`text-xs font-medium ${isOpen ? 'text-emerald-400' : 'text-zinc-600'}`}>
                              {isOpen ? 'Yes' : 'No'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* Running Balance */}
                <div className="px-4 py-3 border-t border-zinc-800/60 bg-zinc-900/30 flex items-center justify-end gap-8">
                  <span className="text-sm font-semibold text-zinc-400">Outstanding Balance</span>
                  <span className={`text-base font-bold tabular-nums ${runningBalance > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
                    {formatCurrency(runningBalance)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
