export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Plus, Edit, Trash2, Navigation, Ban, ChevronRight,
  BookOpen, BarChart2, ChevronUp, ChevronDown,
} from 'lucide-react'

export default async function CustomersListPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    balance?: string
    postingGroup?: string
    paymentTerms?: string
    page?: string
  }>
}) {
  const sp           = await searchParams
  const search        = sp.search       ?? ''
  const balanceFilter = sp.balance      ?? 'all'
  const postingGroup  = sp.postingGroup ?? ''
  const payTerms      = sp.paymentTerms ?? ''
  const page          = Math.max(1, parseInt(sp.page ?? '1'))
  const pageSize      = 25

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName:  { contains: search, mode: 'insensitive' } },
      { email:     { contains: search, mode: 'insensitive' } },
    ]
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: {
        arInvoices: {
          where: { status: { notIn: ['paid', 'cancelled'] } },
          select: { totalAmount: true, paidAmount: true, dueDate: true, status: true },
        },
      },
      orderBy: { lastName: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customer.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  const filtered = customers.filter(c => {
    const bal = c.arInvoices.reduce(
      (s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)), 0
    )
    const balDue = c.arInvoices
      .filter(i => new Date(i.dueDate) < new Date())
      .reduce((s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)), 0)
    if (balanceFilter === 'with-balance') return bal > 0
    if (balanceFilter === 'overdue')      return balDue > 0
    return true
  })

  function blockedValue(c: { isActive: boolean; creditStatus: string }) {
    if (!c.isActive)               return 'All'
    if (c.creditStatus === 'hold') return 'Invoice'
    return ''
  }

  function qs(extra: Record<string, string>) {
    const base: Record<string, string> = {}
    if (search)                   base.search       = search
    if (balanceFilter !== 'all')  base.balance       = balanceFilter
    if (postingGroup)             base.postingGroup  = postingGroup
    if (payTerms)                 base.paymentTerms  = payTerms
    const merged = { ...base, ...extra }
    const q = new URLSearchParams(merged).toString()
    return q ? `?${q}` : ''
  }

  const hasFilters = !!(search || balanceFilter !== 'all' || postingGroup || payTerms)

  return (
    <>
      <TopBar title="Customers" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Action Ribbon */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-2 flex items-center gap-1.5 flex-wrap">
          <Link href="/customers/new">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-600 border border-blue-600 rounded transition-colors">
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
          <Link href="/customers/apply-entries">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
              <Navigation className="w-3 h-3" /> Apply Entries
            </button>
          </Link>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
            <BookOpen className="w-3 h-3" /> Ledger Entries
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
            <BarChart2 className="w-3 h-3" /> Statistics
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
            <Navigation className="w-3 h-3" /> Navigate
          </button>
          <div className="w-px h-5 bg-zinc-700 mx-1" />
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
            <Ban className="w-3 h-3" /> Block
          </button>
        </div>

        <div className="flex">

          {/* Left Filter Pane */}
          <aside className="w-56 shrink-0 bg-[#16213e] border-r border-zinc-800/50 min-h-[calc(100dvh-88px)] p-4 space-y-5">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Filter</p>

            <form method="GET" className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 block">Search</label>
                <input
                  name="search"
                  defaultValue={search}
                  placeholder="No. or Name..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 block">Customer Posting Group</label>
                <select
                  name="postingGroup"
                  defaultValue={postingGroup}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="">All</option>
                  <option value="DOMESTIC">DOMESTIC</option>
                  <option value="FOREIGN">FOREIGN</option>
                  <option value="INTERCOMPANY">INTERCOMPANY</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 block">Payment Terms Code</label>
                <select
                  name="paymentTerms"
                  defaultValue={payTerms}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="">All</option>
                  <option value="NET15">NET15</option>
                  <option value="NET30">NET30</option>
                  <option value="NET60">NET60</option>
                  <option value="COD">COD</option>
                  <option value="IMMEDIATE">Immediate</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 block">Balance Filter</label>
                <select
                  name="balance"
                  defaultValue={balanceFilter}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="with-balance">With Balance</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 px-2.5 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-600 border border-blue-600 rounded transition-colors"
                >
                  Apply
                </button>
                {hasFilters && (
                  <Link
                    href="/customers"
                    className="flex-1 text-center px-2.5 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors"
                  >
                    Clear
                  </Link>
                )}
              </div>
            </form>
          </aside>

          {/* Main Table */}
          <div className="flex-1 overflow-x-auto">
            <div className="px-6 py-2.5 flex items-center justify-between border-b border-zinc-800/50 bg-zinc-900/20">
              <p className="text-xs text-zinc-500">
                {total} customer{total !== 1 ? 's' : ''}
                {search ? ` matching "${search}"` : ''}
              </p>
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span>Page {page} of {totalPages || 1}</span>
                {page > 1 && (
                  <Link href={`/customers${qs({ page: String(page - 1) })}`} className="text-blue-400 hover:underline">
                    &larr; Prev
                  </Link>
                )}
                {page < totalPages && (
                  <Link href={`/customers${qs({ page: String(page + 1) })}`} className="text-blue-400 hover:underline">
                    Next &rarr;
                  </Link>
                )}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
                <p className="text-sm">No customers found.</p>
                <Link href="/customers/new" className="mt-2 text-xs text-blue-400 hover:underline">
                  Create a new customer
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/60 bg-zinc-900/30">
                    {[
                      { label: 'No.',                right: false },
                      { label: 'Name',               right: false },
                      { label: 'Phone No.',          right: false },
                      { label: 'Contact',            right: false },
                      { label: 'Balance (LCY)',      right: true  },
                      { label: 'Balance Due (LCY)',  right: true  },
                      { label: 'Credit Limit (LCY)', right: true  },
                      { label: 'Blocked',            right: false },
                      { label: '',                   right: false },
                    ].map((col, i) => (
                      <th
                        key={i}
                        className={`px-3 py-2 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${col.right ? 'text-right' : 'text-left'}`}
                      >
                        {col.label ? (
                          <span className="inline-flex items-center gap-0.5">
                            {col.label}
                            <span className="flex flex-col ml-0.5">
                              <ChevronUp   className="w-2.5 h-2.5 text-zinc-700" />
                              <ChevronDown className="w-2.5 h-2.5 text-zinc-700 -mt-1" />
                            </span>
                          </span>
                        ) : null}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const bal = c.arInvoices.reduce(
                      (s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)), 0
                    )
                    const balDue = c.arInvoices
                      .filter(i => new Date(i.dueDate) < new Date())
                      .reduce((s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)), 0)
                    const blocked = blockedValue(c)

                    return (
                      <tr key={c.id} className="border-b border-zinc-800/30 hover:bg-[#16213e]/60 transition-colors group">
                        <td className="px-3 py-2">
                          <Link href={`/customers/${c.id}`} className="font-mono text-[11px] text-blue-400 hover:underline">
                            {c.id.slice(-8).toUpperCase()}
                          </Link>
                        </td>
                        <td className="px-3 py-2">
                          <Link href={`/customers/${c.id}`} className="text-sm font-medium text-zinc-100 group-hover:text-blue-300 transition-colors">
                            {c.firstName} {c.lastName}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-sm text-zinc-400 whitespace-nowrap">{c.phone || '—'}</td>
                        <td className="px-3 py-2 text-sm text-zinc-400">{c.firstName} {c.lastName}</td>
                        <td className="px-3 py-2 text-right text-sm font-semibold tabular-nums">
                          <span className={bal < 0 ? 'text-red-400' : bal > 0 ? 'text-amber-400' : 'text-zinc-500'}>
                            {formatCurrency(bal)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right text-sm font-semibold tabular-nums">
                          <span className={balDue > 0 ? 'text-red-400' : 'text-zinc-500'}>
                            {formatCurrency(balDue)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right text-sm tabular-nums text-zinc-300">
                          {formatCurrency(Number(c.creditLimit))}
                        </td>
                        <td className="px-3 py-2">
                          {blocked ? (
                            <Badge variant="destructive" className="text-[10px]">{blocked}</Badge>
                          ) : (
                            <span className="text-zinc-600 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-right">
                          <Link href={`/customers/${c.id}`}>
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
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
