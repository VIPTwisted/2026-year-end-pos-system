export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import {
  Plus, Edit, Trash2, ChevronUp, ChevronDown, ChevronRight,
  FileText, Send, RotateCcw,
} from 'lucide-react'

export default async function PurchaseInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    status?: string
    vendorId?: string
    dateFrom?: string
    dateTo?: string
    page?: string
  }>
}) {
  const sp       = await searchParams
  const search   = sp.search   ?? ''
  const status   = sp.status   ?? ''
  const vendorId = sp.vendorId ?? ''
  const dateFrom = sp.dateFrom ?? ''
  const dateTo   = sp.dateTo   ?? ''
  const page     = Math.max(1, parseInt(sp.page ?? '1'))
  const pageSize = 25

  type WhereClause = {
    OR?: { invoiceNumber?: { contains: string }; notes?: { contains: string } }[]
    status?: string
    vendorId?: string
    invoiceDate?: { gte?: Date; lte?: Date }
  }

  const where: WhereClause = {}
  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search } },
      { notes:         { contains: search } },
    ]
  }
  if (status)   where.status   = status
  if (vendorId) where.vendorId = vendorId
  if (dateFrom || dateTo) {
    where.invoiceDate = {}
    if (dateFrom) where.invoiceDate.gte = new Date(dateFrom)
    if (dateTo)   where.invoiceDate.lte = new Date(dateTo)
  }

  const [invoices, total, vendors] = await Promise.all([
    prisma.vendorInvoice.findMany({
      where,
      include: {
        vendor: { select: { id: true, vendorCode: true, name: true } },
        lines:  { select: { id: true } },
      },
      orderBy: { invoiceDate: 'desc' },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
    }),
    prisma.vendorInvoice.count({ where }),
    prisma.vendor.findMany({
      where:   { isActive: true },
      select:  { id: true, name: true, vendorCode: true },
      orderBy: { name: 'asc' },
      take:    200,
    }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  function buildHref(overrides: Record<string, string>) {
    const base: Record<string, string> = {}
    if (search)   base.search   = search
    if (status)   base.status   = status
    if (vendorId) base.vendorId = vendorId
    if (dateFrom) base.dateFrom = dateFrom
    if (dateTo)   base.dateTo   = dateTo
    const merged = { ...base, ...overrides }
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== ''))
    ).toString()
    return `/purchase/invoices${qs ? '?' + qs : ''}`
  }

  const STATUS_OPTIONS = [
    { value: '',             label: 'All' },
    { value: 'received',     label: 'Received' },
    { value: 'under-review', label: 'Under Review' },
    { value: 'approved',     label: 'Approved' },
    { value: 'disputed',     label: 'Disputed' },
    { value: 'paid',         label: 'Paid' },
    { value: 'partial-paid', label: 'Partial Paid' },
    { value: 'cancelled',    label: 'Cancelled' },
  ]

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

  const hasFilters = !!(search || status || vendorId || dateFrom || dateTo)

  return (
    <>
      <TopBar
        title="Purchase Invoices"
        breadcrumb={[{ label: 'Purchase', href: '/purchase/orders' }]}
      />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Action Ribbon */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-2 flex items-center gap-2">
          <Link href="/purchase/invoices/new">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-700 hover:bg-indigo-600 border border-indigo-600 rounded transition-colors">
              <Plus className="w-3 h-3" /> New
            </button>
          </Link>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
            <Edit className="w-3 h-3" /> Edit
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
          <div className="w-px h-5 bg-zinc-700 mx-1" />
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
            <Send className="w-3 h-3" /> Release
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
            <RotateCcw className="w-3 h-3" /> Reopen
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 rounded transition-colors">
            Post
          </button>
        </div>

        <div className="flex">

          {/* Filter Pane */}
          <div className="w-56 shrink-0 bg-[#16213e] border-r border-zinc-800/50 min-h-[calc(100dvh-88px)] p-4 space-y-5">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Filter</p>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 block">Search</label>
              <form method="GET" action="/purchase/invoices">
                <input
                  name="search"
                  defaultValue={search}
                  placeholder="Invoice number…"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600"
                />
                {status   && <input type="hidden" name="status"   value={status} />}
                {vendorId && <input type="hidden" name="vendorId" value={vendorId} />}
                {dateFrom && <input type="hidden" name="dateFrom" value={dateFrom} />}
                {dateTo   && <input type="hidden" name="dateTo"   value={dateTo} />}
                <button type="submit" className="mt-2 w-full px-2.5 py-1.5 text-xs font-medium text-white bg-indigo-700 hover:bg-indigo-600 rounded transition-colors">
                  Apply
                </button>
              </form>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Status</label>
              <div className="space-y-0.5">
                {STATUS_OPTIONS.map(opt => (
                  <Link
                    key={opt.value}
                    href={buildHref({ status: opt.value, page: '1' })}
                    className={`block text-xs px-2 py-1 rounded transition-colors ${
                      status === opt.value
                        ? 'bg-indigo-700/30 text-indigo-300 border border-indigo-700/50'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Vendor</label>
              <div className="space-y-0.5 max-h-40 overflow-y-auto">
                <Link
                  href={buildHref({ vendorId: '', page: '1' })}
                  className={`block text-xs px-2 py-1 rounded transition-colors ${
                    !vendorId
                      ? 'bg-indigo-700/30 text-indigo-300 border border-indigo-700/50'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  All Vendors
                </Link>
                {vendors.map(v => (
                  <Link
                    key={v.id}
                    href={buildHref({ vendorId: vendorId === v.id ? '' : v.id, page: '1' })}
                    className={`block text-xs px-2 py-1 rounded transition-colors truncate ${
                      vendorId === v.id
                        ? 'bg-indigo-700/30 text-indigo-300 border border-indigo-700/50'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    }`}
                    title={v.name}
                  >
                    {v.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Invoice Date</label>
              <form method="GET" action="/purchase/invoices" className="space-y-2">
                {search   && <input type="hidden" name="search"   value={search} />}
                {status   && <input type="hidden" name="status"   value={status} />}
                {vendorId && <input type="hidden" name="vendorId" value={vendorId} />}
                <div>
                  <p className="text-[10px] text-zinc-600 mb-1">From</p>
                  <input type="date" name="dateFrom" defaultValue={dateFrom}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-600 mb-1">To</p>
                  <input type="date" name="dateTo" defaultValue={dateTo}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-600" />
                </div>
                <button type="submit" className="w-full px-2.5 py-1.5 text-xs font-medium text-white bg-indigo-700 hover:bg-indigo-600 rounded transition-colors">
                  Apply
                </button>
              </form>
            </div>

            {hasFilters && (
              <Link href="/purchase/invoices" className="block text-xs text-zinc-500 hover:text-zinc-300 underline mt-2">
                Clear filters
              </Link>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            <div className="px-6 py-3 flex items-center justify-between border-b border-zinc-800/50">
              <p className="text-xs text-zinc-500">
                {total} invoice{total !== 1 ? 's' : ''}{search ? ` matching "${search}"` : ''}
              </p>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>Page {page} of {totalPages || 1}</span>
                {page > 1 && (
                  <Link href={buildHref({ page: String(page - 1) })} className="text-indigo-400 hover:underline">← Prev</Link>
                )}
                {page < totalPages && (
                  <Link href={buildHref({ page: String(page + 1) })} className="text-indigo-400 hover:underline">Next →</Link>
                )}
              </div>
            </div>

            {invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
                <FileText className="w-10 h-10 mb-4 opacity-20" />
                <p className="text-sm">No purchase invoices found.</p>
                <Link href="/purchase/invoices/new" className="text-xs text-indigo-400 hover:underline mt-2">
                  Create a new invoice
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/60 bg-zinc-900/30">
                    {[
                      { label: 'No.' },
                      { label: 'Buy-from Vendor' },
                      { label: 'Invoice Date' },
                      { label: 'Due Date' },
                      { label: 'Status' },
                      { label: 'Lines', right: true },
                      { label: 'Amount (LCY)', right: true },
                      { label: 'Balance', right: true },
                      { label: '' },
                    ].map((col, i) => (
                      <th
                        key={i}
                        className={`px-3 py-2 text-[10px] uppercase tracking-widest text-zinc-500 font-medium ${col.right ? 'text-right' : 'text-left'}`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {col.label}
                          {col.label && (
                            <span className="flex flex-col">
                              <ChevronUp className="w-2.5 h-2.5 text-zinc-700" />
                              <ChevronDown className="w-2.5 h-2.5 text-zinc-700 -mt-1" />
                            </span>
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => {
                    const balance = inv.totalAmount - inv.paidAmount
                    return (
                      <tr key={inv.id} className="border-b border-zinc-800/30 hover:bg-[rgba(99,102,241,0.05)] transition-colors group">
                        <td className="px-3 py-2 font-mono text-[11px] text-zinc-400">
                          <Link href={`/purchase/invoices/${inv.id}`} className="hover:text-indigo-400 transition-colors">
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm font-medium text-zinc-100 group-hover:text-indigo-300 transition-colors">
                            {inv.vendor.name}
                          </div>
                          <div className="text-[11px] text-zinc-500">{inv.vendor.vendorCode}</div>
                        </td>
                        <td className="px-3 py-2 text-xs text-zinc-400">
                          {new Date(inv.invoiceDate).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 text-xs text-zinc-400">
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`text-[11px] px-2 py-0.5 rounded font-medium capitalize ${statusColor(inv.status)}`}>
                            {inv.status.replace(/-/g, ' ')}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right text-xs text-zinc-400 tabular-nums">
                          {inv.lines.length}
                        </td>
                        <td className="px-3 py-2 text-right text-sm font-semibold text-zinc-100 tabular-nums">
                          {formatCurrency(inv.totalAmount)}
                        </td>
                        <td className={`px-3 py-2 text-right text-sm font-semibold tabular-nums ${balance > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                          {formatCurrency(balance)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Link href={`/purchase/invoices/${inv.id}`}>
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
