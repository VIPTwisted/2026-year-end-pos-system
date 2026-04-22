import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function PostedPurchaseReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{ vendor?: string }>
}) {
  const sp = await searchParams

  const receipts = await prisma.vendorReceipt.findMany({
    include: {
      po: {
        include: { vendor: { select: { id: true, name: true, vendorCode: true } } },
      },
      lines: true,
    },
    orderBy: { receivedAt: 'desc' },
    take: 500,
  })

  const filtered = sp.vendor
    ? receipts.filter(r => r.po.vendorId === sp.vendor)
    : receipts

  const vendors = await prisma.vendor.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar
        title="Posted Purchase Receipts"
        breadcrumb={[
          { label: 'NovaPOS', href: '/' },
          { label: 'Purchasing', href: '/purchasing' },
        ]}
      />

      <div className="border-b border-zinc-800 bg-[#16213e] px-4 py-2 flex items-center gap-2">
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Navigate</button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Print</button>
        <div className="ml-auto text-xs text-zinc-400">{filtered.length} records</div>
      </div>

      <div className="flex">
        <details open className="w-56 shrink-0 border-r border-zinc-800 bg-[#16213e] min-h-screen">
          <summary className="px-4 py-3 text-xs font-semibold text-zinc-300 uppercase tracking-wide cursor-pointer select-none">Filters</summary>
          <form method="GET" className="px-4 pb-4 space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Vendor</label>
              <select name="vendor" defaultValue={sp.vendor ?? ''} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200">
                <option value="">All Vendors</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full px-3 py-1.5 text-xs bg-blue-700 hover:bg-blue-600 text-white rounded font-medium">Apply</button>
            <Link href="/purchasing/receipts" className="block text-center text-xs text-zinc-500 hover:text-zinc-300">Clear</Link>
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
                  <th className="text-left pb-3 pr-4 font-medium">Vendor Document No.</th>
                  <th className="text-right pb-3 pr-4 font-medium">Lines</th>
                  <th className="text-left pb-3 font-medium">PO No.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-zinc-500 text-xs">
                      No posted receipts found.
                    </td>
                  </tr>
                )}
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-zinc-800/40 cursor-pointer">
                    <td className="py-2.5 pr-4 font-mono text-xs text-blue-400 hover:underline">
                      {r.receiptNumber.substring(0, 12)}…
                    </td>
                    <td className="py-2.5 pr-4 text-zinc-200">{r.po.vendor?.name ?? '—'}</td>
                    <td className="py-2.5 pr-4 text-zinc-400 text-xs whitespace-nowrap">{new Date(r.receivedAt).toLocaleDateString()}</td>
                    <td className="py-2.5 pr-4 text-zinc-400 font-mono text-xs">{r.notes ?? '—'}</td>
                    <td className="py-2.5 pr-4 text-right text-zinc-400 text-xs">{r.lines.length}</td>
                    <td className="py-2.5">
                      <Link href={`/purchasing/orders/${r.poId}`} className="text-blue-400 hover:underline font-mono text-xs">
                        {r.po.poNumber?.substring(0, 16)}
                      </Link>
                    </td>
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
