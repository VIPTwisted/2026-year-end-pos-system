export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import {
  ChevronUp, ChevronDown, ChevronRight, PackageCheck,
} from 'lucide-react'

export default async function PurchaseReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    vendorId?: string
    dateFrom?: string
    dateTo?: string
    page?: string
  }>
}) {
  const sp       = await searchParams
  const search   = sp.search   ?? ''
  const vendorId = sp.vendorId ?? ''
  const dateFrom = sp.dateFrom ?? ''
  const dateTo   = sp.dateTo   ?? ''
  const page     = Math.max(1, parseInt(sp.page ?? '1'))
  const pageSize = 25

  type WhereClause = {
    OR?: { receiptNumber?: { contains: string } }[]
    po?: { vendorId?: string }
    receivedAt?: { gte?: Date; lte?: Date }
  }

  const where: WhereClause = {}
  if (search)   where.OR         = [{ receiptNumber: { contains: search } }]
  if (vendorId) where.po         = { vendorId }
  if (dateFrom || dateTo) {
    where.receivedAt = {}
    if (dateFrom) where.receivedAt.gte = new Date(dateFrom)
    if (dateTo)   where.receivedAt.lte = new Date(dateTo)
  }

  const [receipts, total, vendors] = await Promise.all([
    prisma.vendorReceipt.findMany({
      where,
      include: {
        po: {
          select: {
            id:       true,
            poNumber: true,
            vendor:   { select: { id: true, vendorCode: true, name: true } },
          },
        },
        lines: true,
      },
      orderBy: { receivedAt: 'desc' },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
    }),
    prisma.vendorReceipt.count({ where }),
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
    if (vendorId) base.vendorId = vendorId
    if (dateFrom) base.dateFrom = dateFrom
    if (dateTo)   base.dateTo   = dateTo
    const merged = { ...base, ...overrides }
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== ''))
    ).toString()
    return `/purchase/receipts${qs ? '?' + qs : ''}`
  }

  const hasFilters = !!(search || vendorId || dateFrom || dateTo)

  return (
    <>
      <TopBar
        title="Posted Purchase Receipts"
        breadcrumb={[{ label: 'Purchase', href: '/purchase/orders' }]}
      />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Action Ribbon */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-2 flex items-center gap-2 text-xs text-zinc-500">
          <PackageCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Posted Purchase Receipts — read only</span>
        </div>

        <div className="flex">

          {/* Filter Pane */}
          <div className="w-56 shrink-0 bg-[#16213e] border-r border-zinc-800/50 min-h-[calc(100dvh-88px)] p-4 space-y-5">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Filter</p>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 block">Search</label>
              <form method="GET" action="/purchase/receipts">
                <input
                  name="search"
                  defaultValue={search}
                  placeholder="Receipt number…"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600"
                />
                {vendorId && <input type="hidden" name="vendorId" value={vendorId} />}
                {dateFrom && <input type="hidden" name="dateFrom" value={dateFrom} />}
                {dateTo   && <input type="hidden" name="dateTo"   value={dateTo} />}
                <button type="submit" className="mt-2 w-full px-2.5 py-1.5 text-xs font-medium text-white bg-indigo-700 hover:bg-indigo-600 rounded transition-colors">
                  Apply
                </button>
              </form>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Vendor</label>
              <div className="space-y-0.5 max-h-48 overflow-y-auto">
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
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Received Date</label>
              <form method="GET" action="/purchase/receipts" className="space-y-2">
                {search   && <input type="hidden" name="search"   value={search} />}
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
              <Link href="/purchase/receipts" className="block text-xs text-zinc-500 hover:text-zinc-300 underline mt-2">
                Clear filters
              </Link>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            <div className="px-6 py-3 flex items-center justify-between border-b border-zinc-800/50">
              <p className="text-xs text-zinc-500">
                {total} receipt{total !== 1 ? 's' : ''}
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

            {receipts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
                <PackageCheck className="w-10 h-10 mb-4 opacity-20" />
                <p className="text-sm">No posted receipts found.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/60 bg-zinc-900/30">
                    {[
                      { label: 'No.' },
                      { label: 'Buy-from Vendor' },
                      { label: 'Order No.' },
                      { label: 'Received Date' },
                      { label: 'Received By' },
                      { label: 'Lines', right: true },
                      { label: 'Total Qty', right: true },
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
                  {receipts.map(receipt => {
                    const totalQty = receipt.lines.reduce((s, l) => s + l.qtyReceived, 0)
                    return (
                      <tr key={receipt.id} className="border-b border-zinc-800/30 hover:bg-[rgba(99,102,241,0.05)] transition-colors group">
                        <td className="px-3 py-2 font-mono text-[11px] text-zinc-400">
                          {receipt.receiptNumber}
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm font-medium text-zinc-100 group-hover:text-indigo-300 transition-colors">
                            {receipt.po.vendor.name}
                          </div>
                          <div className="text-[11px] text-zinc-500">{receipt.po.vendor.vendorCode}</div>
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px] text-zinc-400">
                          <Link href={`/purchase/orders/${receipt.po.id}`} className="hover:text-indigo-400 transition-colors">
                            {receipt.po.poNumber}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-xs text-zinc-400">
                          {new Date(receipt.receivedAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 text-xs text-zinc-400">
                          {receipt.receivedBy ?? '—'}
                        </td>
                        <td className="px-3 py-2 text-right text-xs text-zinc-400 tabular-nums">
                          {receipt.lines.length}
                        </td>
                        <td className="px-3 py-2 text-right text-sm font-semibold text-emerald-400 tabular-nums">
                          {totalQty}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
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
