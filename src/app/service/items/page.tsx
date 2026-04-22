export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, ChevronRight, AlertTriangle } from 'lucide-react'

function fmtDate(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function ServiceItemsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const search   = (sp.search ?? '').toLowerCase()
  const custId   = sp.customer ?? ''
  const itemNo   = sp.item ?? ''
  const status   = sp.status ?? ''

  const items = await prisma.serviceItem.findMany({
    where: {
      ...(custId ? { customerId: custId } : {}),
      ...(status ? { status }             : {}),
    },
    include: { customer: true, product: true },
    orderBy: { createdAt: 'desc' },
  })

  const filtered = items.filter(i => {
    if (search && !i.description.toLowerCase().includes(search) &&
        !`${i.customer?.firstName ?? ''} ${i.customer?.lastName ?? ''}`.toLowerCase().includes(search)) return false
    if (itemNo && !(i.product?.name ?? '').toLowerCase().includes(itemNo.toLowerCase())) return false
    return true
  })

  const customers = await prisma.customer.findMany({
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: 'asc' }, take: 200,
  })

  const now = new Date()

  return (
    <>
      <TopBar title="Service Items" />
      <main className="flex-1 overflow-auto">

        {/* Ribbon */}
        <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-2 flex items-center gap-1">
          <Button asChild size="sm" className="h-7 px-2.5 text-xs gap-1">
            <Link href="/service/items/new"><Plus className="w-3.5 h-3.5" />New</Link>
          </Button>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Filter Pane */}
          <form method="GET" action="/service/items"
            className="w-52 shrink-0 border-r border-zinc-800 bg-zinc-950 p-4 space-y-4 sticky top-0 overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 112px)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Filters</p>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Search</label>
              <input name="search" defaultValue={search}
                placeholder="Description / Customer…"
                className="w-full h-7 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Customer</label>
              <select name="customer" defaultValue={custId}
                className="w-full h-7 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100">
                <option value="">All</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Item (Product)</label>
              <input name="item" defaultValue={itemNo} placeholder="Product name…"
                className="w-full h-7 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Status</label>
              <select name="status" defaultValue={status}
                className="w-full h-7 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100">
                <option value="">All</option>
                {['active','inactive','retired'].map(s => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button type="submit"
                className="w-full h-7 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors">
                Apply
              </button>
              <Link href="/service/items"
                className="w-full h-7 rounded border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-medium flex items-center justify-center transition-colors">
                Clear
              </Link>
            </div>
          </form>

          {/* Table */}
          <div className="flex-1 p-5 overflow-x-auto">
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-sm font-semibold text-zinc-100">Service Items</h2>
              <span className="text-xs text-zinc-500">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
                <p className="text-sm">No service items found.</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/service/items/new"><Plus className="w-4 h-4 mr-1" />New Service Item</Link>
                </Button>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wide">
                    <th className="text-left pb-2.5 font-medium pr-4">No.</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Description</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Customer No.</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Customer Name</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Item No.</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Serial No.</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Warranty Expiry</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Last Service Date</th>
                    <th className="pb-2.5 w-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filtered.map(item => {
                    const warnDays = item.warrantyEnd
                      ? Math.ceil((item.warrantyEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                      : null
                    const warrantyClass = warnDays !== null && warnDays <= 0
                      ? 'text-red-400' : warnDays !== null && warnDays <= 30
                      ? 'text-amber-400' : 'text-zinc-400'
                    return (
                      <tr key={item.id} className="hover:bg-zinc-900/40 transition-colors group">
                        <td className="py-2.5 pr-4">
                          <Link href={`/service/items/${item.id}`}
                            className="font-mono text-indigo-400 hover:text-indigo-300 font-medium">
                            {item.id.slice(0, 8).toUpperCase()}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-4 text-zinc-300 max-w-[150px] truncate">
                          <Link href={`/service/items/${item.id}`} className="hover:text-indigo-300">
                            {item.description}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-zinc-500">
                          {item.customer?.id.slice(0, 8).toUpperCase() ?? '—'}
                        </td>
                        <td className="py-2.5 pr-4 text-zinc-300">
                          {item.customer ? `${item.customer.firstName} ${item.customer.lastName}` : <span className="text-zinc-600">—</span>}
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-zinc-500">{item.product?.id.slice(0, 8).toUpperCase() ?? '—'}</td>
                        <td className="py-2.5 pr-4 font-mono text-zinc-500">{item.serialNumber ?? '—'}</td>
                        <td className={`py-2.5 pr-4 ${warrantyClass}`}>
                          <span className="flex items-center gap-1">
                            {warnDays !== null && warnDays <= 30 && <AlertTriangle className="w-3 h-3" />}
                            {fmtDate(item.warrantyEnd)}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-zinc-400">{fmtDate(item.lastServiceDate)}</td>
                        <td className="py-2.5">
                          <Link href={`/service/items/${item.id}`}>
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
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
