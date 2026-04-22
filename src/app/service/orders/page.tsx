export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Plus, Edit2, Trash2, ChevronRight, SendHorizonal, CheckCircle,
  Receipt, MapPin, Users2, RefreshCw,
} from 'lucide-react'

const STATUS_VARIANT: Record<string, 'warning' | 'default' | 'success' | 'secondary' | 'destructive'> = {
  Pending:    'warning',
  'In Process': 'default',
  Finished:   'success',
  'On Hold':  'secondary',
}
const PRIORITY_VARIANT: Record<string, 'destructive' | 'warning' | 'default' | 'secondary'> = {
  Urgent: 'destructive',
  High:   'warning',
  Normal: 'default',
  Low:    'secondary',
}

function fmtDate(d: string | Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function ServiceOrdersListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const search     = (sp.search ?? '').toLowerCase()
  const cust       = sp.customer ?? ''
  const status     = sp.status ?? ''
  const priority   = sp.priority ?? ''
  const dateFrom   = sp.dateFrom ?? ''
  const dateTo     = sp.dateTo ?? ''

  const orders = await prisma.serviceOrder.findMany({
    where: {
      ...(status   ? { status }   : {}),
      ...(priority ? { priority } : {}),
      ...(cust     ? { customerId: cust } : {}),
      ...(dateFrom ? { createdAt: { gte: new Date(dateFrom) } } : {}),
      ...(dateTo   ? { createdAt: { ...(dateFrom ? { gte: new Date(dateFrom) } : {}), lte: new Date(dateTo) } } : {}),
    },
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
  })

  const filtered = search
    ? orders.filter(o =>
        o.orderNumber.toLowerCase().includes(search) ||
        o.description.toLowerCase().includes(search) ||
        `${o.customer?.firstName ?? ''} ${o.customer?.lastName ?? ''}`.toLowerCase().includes(search)
      )
    : orders

  const customers = await prisma.customer.findMany({
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: 'asc' },
    take: 200,
  })

  const buildUrl = (overrides: Record<string, string>) => {
    const p = new URLSearchParams()
    const merged = { search, customer: cust, status, priority, dateFrom, dateTo, ...overrides }
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v) })
    const qs = p.toString()
    return `/service/orders${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      <TopBar title="Service Orders" />
      <main className="flex-1 overflow-auto">

        {/* Ribbon */}
        <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-2 flex items-center gap-1 flex-wrap">
          <div className="flex items-center gap-1 pr-3 border-r border-zinc-800">
            <Button asChild size="sm" className="h-7 px-2.5 text-xs gap-1">
              <Link href="/service/orders/new"><Plus className="w-3.5 h-3.5" />New</Link>
            </Button>
            <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1" disabled>
              <Edit2 className="w-3.5 h-3.5" />Edit
            </Button>
            <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1 text-red-400 border-red-900 hover:bg-red-950" disabled>
              <Trash2 className="w-3.5 h-3.5" />Delete
            </Button>
          </div>
          <div className="flex items-center gap-1 px-3 border-r border-zinc-800">
            <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1" disabled>
              <RefreshCw className="w-3.5 h-3.5" />Release
            </Button>
            <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1" disabled>
              <CheckCircle className="w-3.5 h-3.5" />Finish
            </Button>
            <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1" disabled>
              <Receipt className="w-3.5 h-3.5" />Create Invoice
            </Button>
          </div>
          <div className="flex items-center gap-1 px-3">
            <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1" disabled>
              <SendHorizonal className="w-3.5 h-3.5" />Dispatch
            </Button>
            <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1" disabled>
              <MapPin className="w-3.5 h-3.5" />Allocations
            </Button>
            <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1" disabled>
              <Users2 className="w-3.5 h-3.5" />Assign
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Filter Pane */}
          <form method="GET" action="/service/orders"
            className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-950 p-4 space-y-4 sticky top-0 overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 112px)' }}>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Filters</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Search</label>
              <input
                name="search"
                defaultValue={search}
                placeholder="No. / Description…"
                className="w-full h-7 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Customer</label>
              <select name="customer" defaultValue={cust}
                className="w-full h-7 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100">
                <option value="">All Customers</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Status</label>
              <select name="status" defaultValue={status}
                className="w-full h-7 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100">
                <option value="">All</option>
                {['Pending','In Process','Finished','On Hold'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Priority</label>
              <select name="priority" defaultValue={priority}
                className="w-full h-7 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100">
                <option value="">All</option>
                {['Low','Normal','High','Urgent'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Date From</label>
              <input type="date" name="dateFrom" defaultValue={dateFrom}
                className="w-full h-7 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Date To</label>
              <input type="date" name="dateTo" defaultValue={dateTo}
                className="w-full h-7 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100" />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button type="submit"
                className="w-full h-7 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors">
                Apply
              </button>
              <Link href="/service/orders"
                className="w-full h-7 rounded border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-medium transition-colors flex items-center justify-center">
                Clear
              </Link>
            </div>
          </form>

          {/* Table */}
          <div className="flex-1 p-5 overflow-x-auto">
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-sm font-semibold text-zinc-100">Service Orders</h2>
              <span className="text-xs text-zinc-500">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
                <p className="text-sm">No service orders match the current filters.</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/service/orders/new"><Plus className="w-4 h-4 mr-1" />New Service Order</Link>
                </Button>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wide">
                    <th className="text-left pb-2.5 font-medium pr-4">No.</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Customer Name</th>
                    <th className="text-left pb-2.5 font-medium pr-4 max-w-[160px]">Description</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Status</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Priority</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Response Date</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Repair Status</th>
                    <th className="text-right pb-2.5 font-medium pr-4">Allocated Hrs</th>
                    <th className="pb-2.5 w-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filtered.map(o => (
                    <tr key={o.id} className="hover:bg-zinc-900/40 transition-colors group">
                      <td className="py-2.5 pr-4">
                        <Link href={`/service/orders/${o.id}`}
                          className="font-mono text-indigo-400 hover:text-indigo-300 font-medium">
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-300">
                        {o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-400 max-w-[160px] truncate">{o.description}</td>
                      <td className="py-2.5 pr-4">
                        <Badge variant={STATUS_VARIANT[o.status] ?? 'secondary'} className="text-[10px]">{o.status}</Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        <Badge variant={PRIORITY_VARIANT[o.priority] ?? 'secondary'} className="capitalize text-[10px]">{o.priority}</Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-400">{fmtDate(o.dueDate)}</td>
                      <td className="py-2.5 pr-4 text-zinc-500">{(o as { repairStatus?: string | null }).repairStatus ?? '—'}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums text-zinc-300">
                        {o.estimatedHours?.toFixed(1) ?? '0.0'}
                      </td>
                      <td className="py-2.5">
                        <Link href={`/service/orders/${o.id}`}>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
