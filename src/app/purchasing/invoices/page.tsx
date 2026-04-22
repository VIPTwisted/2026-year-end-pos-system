import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  draft:     'bg-zinc-700 text-zinc-200',
  posted:    'bg-emerald-900 text-emerald-300',
  matched:   'bg-blue-900 text-blue-200',
  paid:      'bg-purple-900 text-purple-300',
  partial:   'bg-amber-900 text-amber-300',
  cancelled: 'bg-red-900 text-red-300',
}

export default async function PurchaseInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; vendor?: string }>
}) {
  const sp = await searchParams

  const invoices = await prisma.vendorInvoice.findMany({
    where: {
      ...(sp.status ? { status: sp.status } : {}),
      ...(sp.vendor ? { vendorId: sp.vendor } : {}),
    },
    include: { vendor: { select: { id: true, vendorCode: true, name: true } } },
    orderBy: { invoiceDate: 'desc' },
    take: 500,
  })

  const vendors = await prisma.vendor.findMany({
    select: { id: true, vendorCode: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar
        title="Purchase Invoices"
        breadcrumb={[
          { label: 'NovaPOS', href: '/' },
          { label: 'Purchasing', href: '/purchasing' },
        ]}
      />

      <div className="border-b border-zinc-800 bg-[#16213e] px-4 py-2 flex items-center gap-2">
        <Link href="/purchasing/invoices/new">
          <button className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium">+ New</button>
        </Link>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Post</button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Apply Entries</button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Print</button>
        <div className="ml-auto text-xs text-zinc-400">{invoices.length} records</div>
      </div>

      <div className="flex">
        <details open className="w-56 shrink-0 border-r border-zinc-800 bg-[#16213e] min-h-screen">
          <summary className="px-4 py-3 text-xs font-semibold text-zinc-300 uppercase tracking-wide cursor-pointer select-none">Filters</summary>
          <form method="GET" className="px-4 pb-4 space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Status</label>
              <select name="status" defaultValue={sp.status ?? ''} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200">
                <option value="">All</option>
                <option value="draft">Draft</option>
                <option value="posted">Posted</option>
                <option value="matched">Matched</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Vendor</label>
              <select name="vendor" defaultValue={sp.vendor ?? ''} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200">
                <option value="">All Vendors</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full px-3 py-1.5 text-xs bg-blue-700 hover:bg-blue-600 text-white rounded font-medium">Apply</button>
            <Link href="/purchasing/invoices" className="block text-center text-xs text-zinc-500 hover:text-zinc-300">Clear</Link>
          </form>
        </details>

        <main className="flex-1 p-6 overflow-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-400 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 pr-4 font-medium">No.</th>
                  <th className="text-left pb-3 pr-4 font-medium">Vendor</th>
                  <th className="text-left pb-3 pr-4 font-medium">Posting Date</th>
                  <th className="text-left pb-3 pr-4 font-medium">Vendor Invoice No.</th>
                  <th className="text-left pb-3 pr-4 font-medium">Status</th>
                  <th className="text-right pb-3 pr-4 font-medium">Amount</th>
                  <th className="text-right pb-3 font-medium">Remaining Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {invoices.length === 0 && (
                  <tr><td colSpan={7} className="py-16 text-center text-zinc-500 text-xs">No invoices found. <Link href="/purchasing/invoices/new" className="text-blue-400 hover:underline">Create one</Link></td></tr>
                )}
                {invoices.map(inv => {
                  const remaining = inv.totalAmount - inv.paidAmount
                  return (
                    <tr key={inv.id} className="hover:bg-zinc-800/40 cursor-pointer">
                      <td className="py-2.5 pr-4 font-mono text-xs">
                        <Link href={`/purchasing/invoices/${inv.id}`} className="text-blue-400 hover:underline">{inv.invoiceNumber}</Link>
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-200">{inv.vendor?.name ?? '—'}</td>
                      <td className="py-2.5 pr-4 text-zinc-400 text-xs whitespace-nowrap">{new Date(inv.postingDate).toLocaleDateString()}</td>
                      <td className="py-2.5 pr-4 text-zinc-400 font-mono text-xs">{inv.invoiceNumber}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[inv.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-right font-semibold text-emerald-400 tabular-nums">{formatCurrency(inv.totalAmount)}</td>
                      <td className="py-2.5 text-right tabular-nums">
                        <span className={remaining > 0 ? 'text-amber-400 font-semibold' : 'text-zinc-500'}>
                          {formatCurrency(remaining)}
                        </span>
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
