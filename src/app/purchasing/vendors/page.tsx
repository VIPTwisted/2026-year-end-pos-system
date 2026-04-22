import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function VendorsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; blocked?: string }>
}) {
  const sp = await searchParams
  const q = sp.q ?? ''

  const vendors = await prisma.vendor.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { vendorCode: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
    },
    include: {
      invoices:      { select: { totalAmount: true, paidAmount: true, status: true } },
      purchaseOrders: { select: { totalAmt: true, status: true } },
    },
    orderBy: { name: 'asc' },
    take: 500,
  })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar
        title="Vendors"
        breadcrumb={[
          { label: 'NovaPOS', href: '/' },
          { label: 'Purchasing', href: '/purchasing' },
        ]}
      />

      {/* Action Ribbon */}
      <div className="border-b border-zinc-800 bg-[#16213e] px-4 py-2 flex items-center gap-2">
        <Link href="/purchasing/vendors/new">
          <button className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium">+ New</button>
        </Link>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Edit</button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Delete</button>
        <div className="w-px h-4 bg-zinc-700 mx-1" />
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Make Payment</button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Apply Entries</button>
        <div className="ml-auto text-xs text-zinc-400">{vendors.length} vendors</div>
      </div>

      <div className="flex">
        {/* Filter Pane */}
        <details open className="w-56 shrink-0 border-r border-zinc-800 bg-[#16213e] min-h-screen">
          <summary className="px-4 py-3 text-xs font-semibold text-zinc-300 uppercase tracking-wide cursor-pointer select-none">Filters</summary>
          <form method="GET" className="px-4 pb-4 space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Search</label>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Name, code, email…"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200"
              />
            </div>
            <button type="submit" className="w-full px-3 py-1.5 text-xs bg-blue-700 hover:bg-blue-600 text-white rounded font-medium">Apply</button>
            <Link href="/purchasing/vendors" className="block text-center text-xs text-zinc-500 hover:text-zinc-300">Clear</Link>
          </form>
        </details>

        <main className="flex-1 p-6 overflow-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-400 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 pr-4 font-medium">No.</th>
                  <th className="text-left pb-3 pr-4 font-medium">Name</th>
                  <th className="text-left pb-3 pr-4 font-medium">Phone</th>
                  <th className="text-left pb-3 pr-4 font-medium">Contact</th>
                  <th className="text-right pb-3 pr-4 font-medium">Balance (LCY)</th>
                  <th className="text-right pb-3 pr-4 font-medium">Balance Due (LCY)</th>
                  <th className="text-center pb-3 font-medium">Blocked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {vendors.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-zinc-500 text-xs">
                      No vendors found.{' '}
                      <Link href="/purchasing/vendors/new" className="text-blue-400 hover:underline">Create one</Link>
                    </td>
                  </tr>
                )}
                {vendors.map(v => {
                  const balance = v.invoices.reduce((s, i) => s + i.totalAmount - i.paidAmount, 0)
                  const balanceDue = v.invoices
                    .filter(i => i.status === 'posted' || i.status === 'partial')
                    .reduce((s, i) => s + i.totalAmount - i.paidAmount, 0)
                  const isBlocked = !v.isActive

                  return (
                    <tr key={v.id} className="hover:bg-zinc-800/40 cursor-pointer">
                      <td className="py-2.5 pr-4 font-mono text-xs">
                        <Link href={`/purchasing/vendors/${v.id}`} className="text-blue-400 hover:underline">
                          {v.vendorCode}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-200 font-medium">{v.name}</td>
                      <td className="py-2.5 pr-4 text-zinc-400 text-xs">{v.phone ?? '—'}</td>
                      <td className="py-2.5 pr-4 text-zinc-400 text-xs">{v.email ?? '—'}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">
                        <span className={balance > 0 ? 'text-amber-400 font-semibold' : 'text-zinc-400'}>
                          {formatCurrency(balance)}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">
                        <span className={balanceDue > 0 ? 'text-red-400 font-semibold' : 'text-zinc-400'}>
                          {formatCurrency(balanceDue)}
                        </span>
                      </td>
                      <td className="py-2.5 text-center">
                        {isBlocked ? (
                          <span className="inline-block px-1.5 py-0.5 text-xs rounded bg-red-900 text-red-300">All</span>
                        ) : (
                          <span className="text-zinc-600 text-xs">—</span>
                        )}
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
