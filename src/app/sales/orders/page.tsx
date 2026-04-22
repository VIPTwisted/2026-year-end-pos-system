export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  Plus, Edit2, Trash2, CheckCircle2, RotateCw, FileText,
  Printer, Send, Truck, ChevronRight, ChevronUp, ChevronDown,
  Package, ArrowUpDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

type SearchParams = {
  status?: string
  customer?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  sort?: string
  dir?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(n)
}

function fmtDate(d: Date | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function shortNo(s: string) {
  return s.length > 12 ? s.slice(-12) : s
}

const STATUS_COLORS: Record<string, string> = {
  Open: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  Released: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  'Pending Approval': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  'Pending Prepayment': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
}

const STATUS_CHIP_COLORS: Record<string, string> = {
  Open: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  Released: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
}

function SortIcon({ col, sort, dir }: { col: string; sort: string; dir: string }) {
  if (sort !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />
  return dir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-blue-400" />
    : <ChevronDown className="w-3 h-3 text-blue-400" />
}

function sortHref(
  col: string,
  currentSort: string,
  currentDir: string,
  sp: SearchParams,
) {
  const nextDir = currentSort === col && currentDir === 'asc' ? 'desc' : 'asc'
  const params = new URLSearchParams()
  if (sp.status)   params.set('status',   sp.status)
  if (sp.customer) params.set('customer', sp.customer)
  if (sp.dateFrom) params.set('dateFrom', sp.dateFrom)
  if (sp.dateTo)   params.set('dateTo',   sp.dateTo)
  if (sp.search)   params.set('search',   sp.search)
  params.set('sort', col)
  params.set('dir', nextDir)
  return `/sales/orders?${params.toString()}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SalesOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const {
    status = '',
    customer = '',
    dateFrom = '',
    dateTo = '',
    search = '',
    sort = 'orderDate',
    dir = 'desc',
  } = sp

  // ── Build Prisma where ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}
  if (status && status !== 'All') where.status = status
  if (customer) {
    where.OR = [
      { sellToCustomerName: { contains: customer, mode: 'insensitive' } },
      { accountName: { contains: customer, mode: 'insensitive' } },
    ]
  }
  if (dateFrom || dateTo) {
    where.orderDate = {}
    if (dateFrom) where.orderDate.gte = new Date(dateFrom)
    if (dateTo)   where.orderDate.lte = new Date(dateTo)
  }
  if (search) {
    const searchWhere = {
      OR: [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { sellToCustomerName: { contains: search, mode: 'insensitive' } },
        { accountName: { contains: search, mode: 'insensitive' } },
      ],
    }
    // Merge with existing where
    if (where.OR) {
      where.AND = [{ OR: where.OR }, searchWhere]
      delete where.OR
    } else {
      Object.assign(where, searchWhere)
    }
  }

  // ── Sort ──
  const SORT_MAP: Record<string, string> = {
    orderNumber: 'orderNumber',
    sellToCustomerName: 'sellToCustomerName',
    orderDate: 'orderDate',
    dueDate: 'dueDate',
    status: 'status',
    totalAmount: 'totalAmount',
  }
  const sortField = SORT_MAP[sort] ?? 'orderDate'
  const sortDir = dir === 'asc' ? 'asc' : 'desc'

  const orders = await prisma.salesOrder.findMany({
    where,
    orderBy: { [sortField]: sortDir },
    select: {
      id: true,
      orderNumber: true,
      sellToCustomerName: true,
      accountName: true,
      orderDate: true,
      dueDate: true,
      status: true,
      totalAmount: true,
      subtotal: true,
      discountAmount: true,
      taxAmount: true,
    },
  })

  // ── Summary counts ──
  const allOrders = await prisma.salesOrder.groupBy({
    by: ['status'],
    _count: { id: true },
  })
  const countMap: Record<string, number> = {}
  for (const r of allOrders) countMap[r.status] = r._count.id
  const totalCount  = Object.values(countMap).reduce((a, b) => a + b, 0)
  const openCount   = countMap['Open'] ?? 0
  const releasedCount = countMap['Released'] ?? 0

  const STATUSES = ['All', 'Open', 'Released', 'Pending Approval', 'Pending Prepayment']

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100 flex flex-col">

      {/* ── TopBar ── */}
      <TopBar
        title="Sales Orders"
        breadcrumb={[
          { label: 'Sales', href: '/sales' },
        ]}
      />

      {/* ── Action Ribbon ── */}
      <div className="border-b border-zinc-800 bg-[#16213e] px-6 py-2.5 flex items-center gap-1 flex-wrap shrink-0">
        <Link
          href="/sales/orders/new"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New
        </Link>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
          <Edit2 className="w-3.5 h-3.5" /> Edit
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-300 transition-colors hover:text-red-400">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
          <CheckCircle2 className="w-3.5 h-3.5" /> Release
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
          <RotateCw className="w-3.5 h-3.5" /> Reopen
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
          <FileText className="w-3.5 h-3.5" /> Post
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
          <Printer className="w-3.5 h-3.5" /> Print Confirmation
        </button>
        <div className="h-4 w-px bg-zinc-700 mx-0.5" />
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
          <Send className="w-3.5 h-3.5" /> Send
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
          <Truck className="w-3.5 h-3.5" /> Create Warehouse Shipment
        </button>
      </div>

      {/* ── Body: Filter Pane + Table ── */}
      <div className="flex flex-1 min-h-0">

        {/* ── Left Filter Pane ── */}
        <aside className="w-56 shrink-0 border-r border-zinc-800 bg-[#16213e] sticky top-[89px] self-start">
          <form method="GET" action="/sales/orders" className="p-4 space-y-4">
            {/* Search */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Search
              </label>
              <input
                name="search"
                defaultValue={search}
                placeholder="Order no., customer…"
                className="w-full bg-[#0f0f1a] border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                name="status"
                defaultValue={status || 'All'}
                className="w-full bg-[#0f0f1a] border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Customer */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Customer
              </label>
              <input
                name="customer"
                defaultValue={customer}
                placeholder="Customer name"
                className="w-full bg-[#0f0f1a] border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Order Date From */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Order Date From
              </label>
              <input
                type="date"
                name="dateFrom"
                defaultValue={dateFrom}
                className="w-full bg-[#0f0f1a] border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Order Date To */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Order Date To
              </label>
              <input
                type="date"
                name="dateTo"
                defaultValue={dateTo}
                className="w-full bg-[#0f0f1a] border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Preserve sort params */}
            {sort && <input type="hidden" name="sort" value={sort} />}
            {dir  && <input type="hidden" name="dir"  value={dir}  />}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded py-1.5 transition-colors"
            >
              Apply Filters
            </button>
            <Link
              href="/sales/orders"
              className="block text-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Clear
            </Link>
          </form>
        </aside>

        {/* ── Main Table Area ── */}
        <main className="flex-1 p-6 min-w-0">

          {/* Page header: title + count + status chips */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <h2 className="text-base font-semibold text-zinc-100">Sales Orders</h2>
            <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded-full text-xs text-zinc-400 font-medium">
              {orders.length}
            </span>
            <div className="flex items-center gap-2 ml-2">
              <span className={cn('px-2 py-0.5 rounded text-xs font-medium', STATUS_CHIP_COLORS['Open'])}>
                Open: {openCount}
              </span>
              <span className={cn('px-2 py-0.5 rounded text-xs font-medium', STATUS_CHIP_COLORS['Released'])}>
                Released: {releasedCount}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 border border-zinc-700 text-zinc-400">
                Total: {totalCount}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#16213e] border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#0f1829]">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    <Link
                      href={sortHref('orderNumber', sort, dir, sp)}
                      className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
                    >
                      No. <SortIcon col="orderNumber" sort={sort} dir={dir} />
                    </Link>
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    <Link
                      href={sortHref('sellToCustomerName', sort, dir, sp)}
                      className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
                    >
                      Sell-to Customer Name <SortIcon col="sellToCustomerName" sort={sort} dir={dir} />
                    </Link>
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    <Link
                      href={sortHref('orderDate', sort, dir, sp)}
                      className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
                    >
                      Order Date <SortIcon col="orderDate" sort={sort} dir={dir} />
                    </Link>
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    <Link
                      href={sortHref('dueDate', sort, dir, sp)}
                      className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
                    >
                      Req. Delivery Date <SortIcon col="dueDate" sort={sort} dir={dir} />
                    </Link>
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    <Link
                      href={sortHref('status', sort, dir, sp)}
                      className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
                    >
                      Status <SortIcon col="status" sort={sort} dir={dir} />
                    </Link>
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    <Link
                      href={sortHref('totalAmount', sort, dir, sp)}
                      className="flex items-center gap-1 justify-end hover:text-zinc-200 transition-colors"
                    >
                      Amount (LCY) <SortIcon col="totalAmount" sort={sort} dir={dir} />
                    </Link>
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    Remaining Amt.
                  </th>
                  <th className="w-8 px-2 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-zinc-600">
                        <Package className="w-10 h-10 opacity-30" />
                        <p className="text-sm font-medium">No sales orders</p>
                        <Link
                          href="/sales/orders/new"
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          + New Order
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
                {orders.map(o => {
                  const remaining = o.totalAmount - (o.subtotal - o.discountAmount)
                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-[rgba(99,102,241,0.05)] transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/sales/orders/${o.id}`}
                          className="text-blue-400 hover:text-blue-300 font-mono text-xs font-medium"
                        >
                          {shortNo(o.orderNumber)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-zinc-200 text-sm">
                        {o.sellToCustomerName ?? o.accountName ?? (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">
                        {fmtDate(o.orderDate)}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">
                        {fmtDate(o.dueDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-xs font-medium',
                            STATUS_COLORS[o.status] ?? 'bg-zinc-700/50 text-zinc-400',
                          )}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-zinc-200">
                        {fmtCurrency(o.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-zinc-400">
                        {fmtCurrency(remaining > 0 ? remaining : 0)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/sales/orders/${o.id}`}
                          className="text-zinc-600 group-hover:text-zinc-400 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}
