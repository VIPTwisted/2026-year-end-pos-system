export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, ChevronRight } from 'lucide-react'

function fmtDate(d: Date | string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

const STATUS_VARIANT: Record<string, 'warning' | 'default' | 'success' | 'secondary' | 'destructive'> = {
  Draft:     'warning',
  Signed:    'success',
  Cancelled: 'destructive',
  Expired:   'secondary',
  active:    'success',
  draft:     'warning',
  cancelled: 'destructive',
  expired:   'secondary',
}

export default async function ServiceContractsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const custId   = sp.customer ?? ''
  const status   = sp.status ?? ''
  const dateFrom = sp.dateFrom ?? ''
  const dateTo   = sp.dateTo ?? ''

  const contracts = await prisma.serviceContract.findMany({
    where: {
      ...(custId   ? { customerId: custId }                      : {}),
      ...(status   ? { status }                                   : {}),
      ...(dateFrom ? { startDate: { gte: new Date(dateFrom) } }   : {}),
      ...(dateTo   ? { startDate: { lte: new Date(dateTo) } }     : {}),
    },
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
  })

  const customers = await prisma.customer.findMany({
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: 'asc' }, take: 200,
  })

  return (
    <>
      <TopBar title="Service Contracts" />
      <main className="flex-1 overflow-auto">

        {/* Ribbon */}
        <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-2 flex items-center gap-1">
          <Button asChild size="sm" className="h-7 px-2.5 text-xs gap-1">
            <Link href="/service/contracts/new"><Plus className="w-3.5 h-3.5" />New</Link>
          </Button>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Filter Pane */}
          <form method="GET" action="/service/contracts"
            className="w-52 shrink-0 border-r border-zinc-800 bg-zinc-950 p-4 space-y-4 sticky top-0 overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 112px)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Filters</p>
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
              <label className="text-xs text-zinc-400">Status</label>
              <select name="status" defaultValue={status}
                className="w-full h-7 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100">
                <option value="">All</option>
                {['Draft','Signed','Cancelled','Expired'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Start Date From</label>
              <input type="date" name="dateFrom" defaultValue={dateFrom}
                className="w-full h-7 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Start Date To</label>
              <input type="date" name="dateTo" defaultValue={dateTo}
                className="w-full h-7 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100" />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button type="submit"
                className="w-full h-7 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors">
                Apply
              </button>
              <Link href="/service/contracts"
                className="w-full h-7 rounded border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-medium flex items-center justify-center transition-colors">
                Clear
              </Link>
            </div>
          </form>

          {/* Table */}
          <div className="flex-1 p-5 overflow-x-auto">
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-sm font-semibold text-zinc-100">Service Contracts</h2>
              <span className="text-xs text-zinc-500">{contracts.length} record{contracts.length !== 1 ? 's' : ''}</span>
            </div>

            {contracts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
                <p className="text-sm">No service contracts found.</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/service/contracts/new"><Plus className="w-4 h-4 mr-1" />New Contract</Link>
                </Button>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wide">
                    <th className="text-left pb-2.5 font-medium pr-4">Contract No.</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Customer No.</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Customer Name</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Contract Type</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Starting Date</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Expiration Date</th>
                    <th className="text-right pb-2.5 font-medium pr-4">Annual Amount</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Status</th>
                    <th className="pb-2.5 w-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {contracts.map(c => (
                    <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors group">
                      <td className="py-2.5 pr-4">
                        <Link href={`/service/contracts/${c.id}`}
                          className="font-mono text-indigo-400 hover:text-indigo-300 font-medium">
                          {c.contractNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-zinc-500">
                        {c.customer?.id.slice(0, 8).toUpperCase() ?? '—'}
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-300">
                        {c.customer ? `${c.customer.firstName} ${c.customer.lastName}` : <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-400 capitalize">{c.coverageType ?? c.billingCycle ?? 'Contract'}</td>
                      <td className="py-2.5 pr-4 text-zinc-400">{fmtDate(c.startDate)}</td>
                      <td className="py-2.5 pr-4 text-zinc-400">{fmtDate(c.endDate)}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums text-zinc-200">{fmtCurrency(c.value)}</td>
                      <td className="py-2.5 pr-4">
                        <Badge variant={STATUS_VARIANT[c.status] ?? 'secondary'} className="capitalize text-[10px]">{c.status}</Badge>
                      </td>
                      <td className="py-2.5">
                        <Link href={`/service/contracts/${c.id}`}>
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
