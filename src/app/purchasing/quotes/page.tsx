import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  draft:    'bg-zinc-700 text-zinc-200',
  open:     'bg-blue-900 text-blue-200',
  sent:     'bg-indigo-900 text-indigo-300',
  accepted: 'bg-emerald-900 text-emerald-300',
  rejected: 'bg-red-900 text-red-300',
  expired:  'bg-zinc-700 text-zinc-500',
}

export default async function PurchaseQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; vendor?: string }>
}) {
  const sp = await searchParams

  // Quotes use VendorPO with status 'quote' or we pull all and filter
  const quotes = await prisma.vendorPO.findMany({
    where: {
      status: sp.status && sp.status !== '' ? sp.status : { in: ['draft', 'open', 'sent', 'accepted', 'rejected', 'expired', 'quote'] },
      ...(sp.vendor ? { vendorId: sp.vendor } : {}),
    },
    include: { vendor: { select: { id: true, vendorCode: true, name: true } }, lines: true },
    orderBy: { createdAt: 'desc' },
    take: 300,
  })

  const vendors = await prisma.vendor.findMany({
    select: { id: true, vendorCode: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar
        title="Purchase Quotes"
        breadcrumb={[
          { label: 'NovaPOS', href: '/' },
          { label: 'Purchasing', href: '/purchasing' },
        ]}
      />

      {/* Action Ribbon */}
      <div className="border-b border-zinc-800 bg-[#16213e] px-4 py-2 flex items-center gap-2">
        <Link href="/purchasing/quotes/new">
          <button className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium">
            + New
          </button>
        </Link>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Make Order</button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Send</button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Print</button>
        <div className="ml-auto text-xs text-zinc-400">{quotes.length} records</div>
      </div>

      <div className="flex">
        {/* Filter Pane */}
        <details open className="w-56 shrink-0 border-r border-zinc-800 bg-[#16213e] min-h-screen">
          <summary className="px-4 py-3 text-xs font-semibold text-zinc-300 uppercase tracking-wide cursor-pointer select-none">Filters</summary>
          <form method="GET" className="px-4 pb-4 space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Status</label>
              <select name="status" defaultValue={sp.status ?? ''} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200">
                <option value="">All</option>
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
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
            <Link href="/purchasing/quotes" className="block text-center text-xs text-zinc-500 hover:text-zinc-300">Clear</Link>
          </form>
        </details>

        <main className="flex-1 p-6 overflow-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-400 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 pr-4 font-medium">No.</th>
                  <th className="text-left pb-3 pr-4 font-medium">Vendor</th>
                  <th className="text-left pb-3 pr-4 font-medium">Date</th>
                  <th className="text-left pb-3 pr-4 font-medium">Status</th>
                  <th className="text-right pb-3 pr-4 font-medium">Lines</th>
                  <th className="text-right pb-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {quotes.length === 0 && (
                  <tr><td colSpan={6} className="py-16 text-center text-zinc-500 text-xs">No quotes found. <Link href="/purchasing/quotes/new" className="text-blue-400 hover:underline">Create one</Link></td></tr>
                )}
                {quotes.map(q => (
                  <tr key={q.id} className="hover:bg-zinc-800/40 cursor-pointer">
                    <td className="py-2.5 pr-4 font-mono text-xs">
                      <Link href={`/purchasing/quotes/${q.id}`} className="text-blue-400 hover:underline">{q.poNumber}</Link>
                    </td>
                    <td className="py-2.5 pr-4 text-zinc-200">{q.vendor?.name ?? '—'}</td>
                    <td className="py-2.5 pr-4 text-zinc-400 text-xs whitespace-nowrap">{new Date(q.orderDate).toLocaleDateString()}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[q.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right text-zinc-400 text-xs">{q.lines.length}</td>
                    <td className="py-2.5 text-right font-semibold text-emerald-400 tabular-nums">{formatCurrency(q.totalAmt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}
