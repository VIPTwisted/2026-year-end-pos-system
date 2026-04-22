export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react'

export default async function VendorsListPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; balance?: string; status?: string; paymentTerms?: string; currency?: string; page?: string }>
}) {
  const sp = await searchParams
  const search = sp.search ?? ''
  const balanceFilter = sp.balance ?? 'any'
  const statusFilter = sp.status ?? ''
  const payTermsFilter = sp.paymentTerms ?? ''
  const currencyFilter = sp.currency ?? ''
  const page = Math.max(1, parseInt(sp.page ?? '1'))
  const pageSize = 25

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { vendorCode: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ]
  }
  if (statusFilter === 'active') where.isActive = true
  if (statusFilter === 'inactive') where.isActive = false
  if (payTermsFilter) where.paymentTerms = payTermsFilter
  if (currencyFilter) where.currency = currencyFilter

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      include: {
        vendorGroup: true,
        invoices: { where: { status: { notIn: ['paid', 'cancelled'] } } },
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.vendor.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  const filtered = vendors.filter(v => {
    const bal = v.invoices.reduce((s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)), 0)
    if (balanceFilter === 'gt0') return bal > 0
    if (balanceFilter === 'lt0') return bal < 0
    return true
  })

  function buildHref(overrides: Record<string, string>) {
    const base: Record<string, string> = {}
    if (search) base.search = search
    if (balanceFilter !== 'any') base.balance = balanceFilter
    if (statusFilter) base.status = statusFilter
    if (payTermsFilter) base.paymentTerms = payTermsFilter
    if (currencyFilter) base.currency = currencyFilter
    const merged = { ...base, ...overrides }
    const qs = new URLSearchParams(merged).toString()
    return `/vendors${qs ? '?' + qs : ''}`
  }

  return (
    <>
      <TopBar title="Vendors" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Action Ribbon */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-2 flex items-center gap-2">
          <Link href="/vendors/new">
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
          <Link href="/vendors/apply-entries">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
              Apply Entries
            </button>
          </Link>
        </div>

        <div className="flex">

          {/* Filter Pane */}
          <div className="w-56 shrink-0 bg-[#16213e] border-r border-zinc-800/50 min-h-[calc(100dvh-88px)] p-4 space-y-5">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold">Filter</p>
            </div>

            {/* Search */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 block">Search</label>
              <form method="GET">
                <input
                  name="search"
                  defaultValue={search}
                  placeholder="Name, code, email…"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
                {balanceFilter !== 'any' && <input type="hidden" name="balance" value={balanceFilter} />}
                {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
                {payTermsFilter && <input type="hidden" name="paymentTerms" value={payTermsFilter} />}
                {currencyFilter && <input type="hidden" name="currency" value={currencyFilter} />}
              </form>
            </div>

            {/* Balance Filter */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Balance (LCY)</label>
              <div className="space-y-1">
                {[
                  { value: 'any', label: 'Any' },
                  { value: 'gt0', label: '> 0 (Owed)' },
                  { value: 'lt0', label: '< 0 (Credit)' },
                ].map(opt => (
                  <Link
                    key={opt.value}
                    href={buildHref({ balance: opt.value })}
                    className={`block text-xs px-2 py-1 rounded transition-colors ${balanceFilter === opt.value ? 'bg-blue-700/30 text-blue-300 border border-blue-700/50' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Status</label>
              <div className="space-y-1">
                {[
                  { value: '', label: 'All' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'On Hold' },
                ].map(opt => (
                  <Link
                    key={opt.value}
                    href={buildHref({ status: opt.value })}
                    className={`block text-xs px-2 py-1 rounded transition-colors ${statusFilter === opt.value ? 'bg-blue-700/30 text-blue-300 border border-blue-700/50' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Payment Terms Filter */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Payment Terms</label>
              <div className="space-y-1">
                {['NET30', 'NET60', 'NET15', 'COD'].map(term => (
                  <Link
                    key={term}
                    href={buildHref({ paymentTerms: payTermsFilter === term ? '' : term })}
                    className={`block text-xs px-2 py-1 rounded transition-colors ${payTermsFilter === term ? 'bg-blue-700/30 text-blue-300 border border-blue-700/50' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>

            {/* Currency Filter */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Currency</label>
              <div className="space-y-1">
                {['USD', 'EUR', 'GBP', 'CAD'].map(cur => (
                  <Link
                    key={cur}
                    href={buildHref({ currency: currencyFilter === cur ? '' : cur })}
                    className={`block text-xs px-2 py-1 rounded transition-colors ${currencyFilter === cur ? 'bg-blue-700/30 text-blue-300 border border-blue-700/50' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
                  >
                    {cur}
                  </Link>
                ))}
              </div>
            </div>

            {(search || balanceFilter !== 'any' || statusFilter || payTermsFilter || currencyFilter) && (
              <Link href="/vendors" className="block text-xs text-zinc-500 hover:text-zinc-300 underline mt-2">
                Clear filters
              </Link>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            <div className="px-6 py-3 flex items-center justify-between border-b border-zinc-800/50">
              <p className="text-xs text-zinc-500">{total} vendor{total !== 1 ? 's' : ''}{search ? ` matching "${search}"` : ''}</p>
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

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
                <p className="text-sm">No vendors found.</p>
                <Link href="/vendors/new" className="text-xs text-blue-400 hover:underline mt-2">Create a new vendor</Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/60 bg-zinc-900/30">
                    {[
                      { key: 'code', label: 'No.' },
                      { key: 'name', label: 'Name' },
                      { key: 'group', label: 'Vendor Group' },
                      { key: 'terms', label: 'Payment Terms' },
                      { key: 'currency', label: 'Currency' },
                      { key: 'phone', label: 'Phone' },
                      { key: 'balance', label: 'Balance (LCY)', right: true },
                      { key: 'openInv', label: 'Open Inv.', right: true },
                      { key: 'status', label: 'Status' },
                    ].map(col => (
                      <th key={col.key} className={`px-3 py-2 text-[10px] uppercase tracking-widest text-zinc-500 font-medium ${col.right ? 'text-right' : 'text-left'}`}>
                        <span className="inline-flex items-center gap-1">
                          {col.label}
                          <span className="flex flex-col">
                            <ChevronUp className="w-2.5 h-2.5 text-zinc-700" />
                            <ChevronDown className="w-2.5 h-2.5 text-zinc-700 -mt-1" />
                          </span>
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(v => {
                    const bal = v.invoices.reduce((s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)), 0)
                    return (
                      <tr key={v.id} className="border-b border-zinc-800/30 hover:bg-[#16213e]/60 transition-colors group">
                        <td className="px-3 py-2 font-mono text-[11px] text-zinc-500">{v.vendorCode}</td>
                        <td className="px-3 py-2">
                          <Link href={`/vendors/${v.id}`} className="text-sm font-medium text-zinc-100 group-hover:text-blue-300 transition-colors">
                            {v.name}
                          </Link>
                          {v.city && <div className="text-[11px] text-zinc-500">{v.city}{v.state ? `, ${v.state}` : ''}</div>}
                        </td>
                        <td className="px-3 py-2 text-sm text-zinc-400">{v.vendorGroup?.name || '—'}</td>
                        <td className="px-3 py-2 text-sm text-zinc-400">{v.paymentTerms || '—'}</td>
                        <td className="px-3 py-2 text-sm text-zinc-400">{v.currency || 'USD'}</td>
                        <td className="px-3 py-2 text-sm text-zinc-400">{v.phone || '—'}</td>
                        <td className="px-3 py-2 text-right text-sm font-semibold tabular-nums">
                          <span className={bal > 0 ? 'text-amber-400' : 'text-zinc-500'}>{formatCurrency(bal)}</span>
                        </td>
                        <td className="px-3 py-2 text-right text-sm text-zinc-300 tabular-nums">{v.invoices.length}</td>
                        <td className="px-3 py-2">
                          <Badge variant={v.isActive ? 'success' : 'destructive'} className="text-[10px]">
                            {v.isActive ? 'Active' : 'On Hold'}
                          </Badge>
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
