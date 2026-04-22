import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function PurchaseCreditMemosPage() {
  // Credit memos use VendorInvoice with status 'cancelled' or negative totalAmount
  const memos = await prisma.vendorInvoice.findMany({
    where: { totalAmount: { lt: 0 } },
    include: { vendor: { select: { id: true, name: true, vendorCode: true } } },
    orderBy: { invoiceDate: 'desc' },
    take: 300,
  })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar
        title="Purchase Credit Memos"
        breadcrumb={[
          { label: 'NovaPOS', href: '/' },
          { label: 'Purchasing', href: '/purchasing' },
        ]}
      />

      <div className="border-b border-zinc-800 bg-[#16213e] px-4 py-2 flex items-center gap-2">
        <Link href="/purchasing/credit-memos/new">
          <button className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium">+ New</button>
        </Link>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Post</button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Print</button>
        <div className="ml-auto text-xs text-zinc-400">{memos.length} records</div>
      </div>

      <main className="p-6 overflow-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 text-zinc-400 text-xs uppercase tracking-wide">
                <th className="text-left pb-3 pr-4 font-medium">No.</th>
                <th className="text-left pb-3 pr-4 font-medium">Vendor</th>
                <th className="text-left pb-3 pr-4 font-medium">Posting Date</th>
                <th className="text-left pb-3 pr-4 font-medium">Status</th>
                <th className="text-right pb-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {memos.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-zinc-500 text-xs">
                    No credit memos.{' '}
                    <Link href="/purchasing/credit-memos/new" className="text-blue-400 hover:underline">Create one</Link>
                  </td>
                </tr>
              )}
              {memos.map(m => (
                <tr key={m.id} className="hover:bg-zinc-800/40 cursor-pointer">
                  <td className="py-2.5 pr-4 font-mono text-xs">
                    <Link href={`/purchasing/invoices/${m.id}`} className="text-blue-400 hover:underline">{m.invoiceNumber}</Link>
                  </td>
                  <td className="py-2.5 pr-4 text-zinc-200">{m.vendor?.name ?? '—'}</td>
                  <td className="py-2.5 pr-4 text-zinc-400 text-xs">{new Date(m.postingDate).toLocaleDateString()}</td>
                  <td className="py-2.5 pr-4">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-zinc-700 text-zinc-200 capitalize">{m.status}</span>
                  </td>
                  <td className="py-2.5 text-right font-semibold text-red-400 tabular-nums">{formatCurrency(m.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
