export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Ban, ChevronDown, ChevronRight } from 'lucide-react'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default async function PurchaseVendorsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    vendorType?: string
    blocked?: string
    currency?: string
  }>
}) {
  const sp = await searchParams
  const filterSearch = sp.search ?? ''
  const filterBlocked = sp.blocked ?? ''
  const filterCurrency = sp.currency ?? ''

  const where: Record<string, unknown> = {}
  if (filterSearch) {
    where.OR = [
      { name: { contains: filterSearch } },
      { vendorCode: { contains: filterSearch } },
      { email: { contains: filterSearch } },
      { phone: { contains: filterSearch } },
    ]
  }
  if (filterBlocked === 'yes') where.isActive = false
  if (filterBlocked === 'no') where.isActive = true
  if (filterCurrency) where.currency = filterCurrency

  const vendors = await prisma.vendor.findMany({
    where,
    include: {
      vendorGroup: true,
      invoices: { where: { status: { notIn: ['paid', 'cancelled'] } } },
    },
    orderBy: { vendorCode: 'asc' },
    take: 200,
  })

  const total = vendors.length

  const actions = (
    <div className="flex items-center gap-1.5">
      <Link
        href="/purchase/vendors/new"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> New
      </Link>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        <Edit2 className="w-3.5 h-3.5" /> Edit
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        <Ban className="w-3.5 h-3.5" /> Block
      </button>
      <div className="w-px h-5 bg-zinc-700 mx-0.5" />
      <div className="relative group">
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
          Navigate <ChevronDown className="w-3 h-3 ml-0.5" />
        </button>
        <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-zinc-700 rounded shadow-lg z-20 min-w-[170px] hidden group-hover:block">
          <Link href="/finance/vendor-ledger" className="block px-4 py-2 text-[12px] text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
            Ledger Entries
          </Link>
          <Link href="#" className="block px-4 py-2 text-[12px] text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
            Statistics
          </Link>
          <Link href="#" className="block px-4 py-2 text-[12px] text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
            Bank Accounts
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <TopBar
        title="Vendors"
        breadcrumb={[{ label: 'Purchase', href: '/purchase' }]}
        actions={actions}
      />

      <div className="flex min-h-[100dvh] bg-[#0f0f1a]">
        {/* Filter Pane */}
        <aside className="w-60 shrink-0 border-r border-zinc-800/50 bg-[#0f0f1a] p-4 space-y-5">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Search</div>
            <form>
              <input
                name="search"
                defaultValue={filterSearch}
                placeholder="No. or Name…"
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[12px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
              />
              <input type="hidden" name="blocked" value={filterBlocked} />
              <input type="hidden" name="currency" value={filterCurrency} />
              <button type="submit" className="sr-only">Search</button>
            </form>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Vendor Type</div>
            <div className="space-y-1">
              {[
                { value: '', label: 'All' },
                { value: 'Company', label: 'Company' },
                { value: 'Person', label: 'Person' },
              ].map(opt => (
                <Link
                  key={opt.value}
                  href={`/purchase/vendors?search=${filterSearch}&blocked=${filterBlocked}&currency=${filterCurrency}`}
                  className="block px-2 py-1.5 rounded text-[12px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Blocked</div>
            <div className="space-y-1">
              {[
                { value: '', label: 'All' },
                { value: 'no', label: 'Not Blocked' },
                { value: 'yes', label: 'Blocked' },
              ].map(opt => (
                <Link
                  key={opt.value}
                  href={`/purchase/vendors?search=${filterSearch}&blocked=${opt.value}&currency=${filterCurrency}`}
                  className={`block px-2 py-1.5 rounded text-[12px] transition-colors ${
                    filterBlocked === opt.value
                      ? 'bg-blue-600/20 text-blue-300'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Currency</div>
            <div className="space-y-1">
              {['', 'USD', 'EUR', 'GBP', 'CAD'].map(cur => (
                <Link
                  key={cur}
                  href={`/purchase/vendors?search=${filterSearch}&blocked=${filterBlocked}&currency=${cur}`}
                  className={`block px-2 py-1.5 rounded text-[12px] transition-colors ${
                    filterCurrency === cur
                      ? 'bg-blue-600/20 text-blue-300'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {cur === '' ? 'All' : cur}
                </Link>
              ))}
            </div>
          </div>

          {(filterSearch || filterBlocked || filterCurrency) && (
            <Link href="/purchase/vendors" className="block text-[11px] text-zinc-500 hover:text-zinc-300 underline">
              Clear filters
            </Link>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Vendors</div>
              <div className="text-2xl font-bold text-zinc-100">{total}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Active</div>
              <div className="text-2xl font-bold text-emerald-400">{vendors.filter(v => v.isActive).length}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Blocked</div>
              <div className="text-2xl font-bold text-red-400">{vendors.filter(v => !v.isActive).length}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Balance (LCY)</div>
              <div className="text-xl font-bold text-amber-400 tabular-nums">
                {formatCurrency(
                  vendors.reduce(
                    (s, v) =>
                      s +
                      v.invoices.reduce(
                        (is, i) => is + (Number(i.totalAmount) - Number(i.paidAmount)),
                        0
                      ),
                    0
                  )
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 cursor-pointer hover:text-zinc-300">No. ↕</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 cursor-pointer hover:text-zinc-300">Name ↕</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Balance (LCY)</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Balance Due (LCY)</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Contact</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Phone</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Country</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Currency</th>
                  <th className="px-4 py-2.5 w-6"></th>
                </tr>
              </thead>
              <tbody>
                {vendors.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-zinc-500">
                      No vendors found.{' '}
                      <Link href="/purchase/vendors/new" className="text-blue-400 hover:underline">
                        Create one
                      </Link>
                    </td>
                  </tr>
                ) : (
                  vendors.map((vendor, idx) => {
                    const bal = vendor.invoices.reduce(
                      (s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)),
                      0
                    )
                    return (
                      <tr
                        key={vendor.id}
                        className={`hover:bg-[rgba(99,102,241,0.05)] transition-colors ${
                          idx !== vendors.length - 1 ? 'border-b border-zinc-800/40' : ''
                        }`}
                      >
                        <td className="px-4 py-2">
                          <Link
                            href={`/purchase/vendors/${vendor.id}`}
                            className="font-mono text-[11px] text-blue-400 hover:text-blue-300"
                          >
                            {vendor.vendorCode}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-zinc-200">
                          <Link href={`/purchase/vendors/${vendor.id}`} className="hover:text-zinc-100">
                            {vendor.name}
                          </Link>
                          {!vendor.isActive && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">
                              Blocked
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums font-semibold">
                          <span className={bal > 0 ? 'text-amber-400' : 'text-zinc-400'}>
                            {formatCurrency(bal)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums text-zinc-400">
                          {formatCurrency(bal > 0 ? bal : 0)}
                        </td>
                        <td className="px-4 py-2 text-zinc-400">—</td>
                        <td className="px-4 py-2 text-zinc-400">{vendor.phone || '—'}</td>
                        <td className="px-4 py-2 text-zinc-400 font-mono text-[11px]">US</td>
                        <td className="px-4 py-2 text-zinc-400">{vendor.currency || 'USD'}</td>
                        <td className="px-4 py-2 text-zinc-600">
                          <Link href={`/purchase/vendors/${vendor.id}`}>
                            <ChevronRight className="w-3.5 h-3.5 hover:text-zinc-300 transition-colors" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-[12px] text-zinc-500">
            <span>{total} vendor{total !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-zinc-800 rounded hover:bg-zinc-700 disabled:opacity-40" disabled>← Prev</button>
              <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded">1</span>
              <button className="px-3 py-1 bg-zinc-800 rounded hover:bg-zinc-700 disabled:opacity-40" disabled>Next →</button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
