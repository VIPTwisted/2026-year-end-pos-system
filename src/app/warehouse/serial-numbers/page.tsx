export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export default async function SerialNumbersPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string; status?: string }>
}) {
  const { productId, status } = await searchParams

  const serials = await prisma.serialNumber.findMany({
    where: {
      ...(productId ? { productId } : {}),
      ...(status ? { status } : {}),
    },
    include: { product: { select: { name: true, sku: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const statusVariant = (s: string): 'default' | 'success' | 'secondary' | 'destructive' | 'warning' => {
    if (s === 'available') return 'success'
    if (s === 'sold') return 'secondary'
    if (s === 'in_service') return 'warning'
    if (s === 'scrapped') return 'destructive'
    return 'default'
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Serial Numbers" />
      <main className="flex-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200">{serials.length} Serial Numbers</h2>
          <div className="flex gap-2 text-xs">
            {['', 'available', 'sold', 'in_service', 'scrapped'].map(s => (
              <a
                key={s}
                href={`/warehouse/serial-numbers?${productId ? `productId=${productId}&` : ''}${s ? `status=${s}` : ''}`}
                className={`px-3 py-1 rounded-lg border transition-colors ${status === s || (!status && !s) ? 'bg-blue-600 border-blue-600 text-white' : 'border-zinc-700 text-zinc-400 hover:text-zinc-100'}`}
              >
                {s || 'All'}
              </a>
            ))}
          </div>
        </div>
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          {serials.length === 0 ? (
            <div className="p-12 text-center text-zinc-600 text-sm">No serial numbers found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Serial #</th>
                  <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Product</th>
                  <th className="text-center px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Purchase Date</th>
                  <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Sold Date</th>
                  <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Warranty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {serials.map(sn => (
                  <tr key={sn.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm font-semibold text-zinc-200">{sn.serialNo}</td>
                    <td className="px-4 py-3">
                      <p className="text-zinc-300 text-xs">{sn.product.name}</p>
                      <p className="text-zinc-600 text-xs font-mono">{sn.product.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={statusVariant(sn.status)} className="text-xs capitalize">
                        {sn.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{sn.purchaseDate ? formatDate(sn.purchaseDate) : '—'}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{sn.soldDate ? formatDate(sn.soldDate) : '—'}</td>
                    <td className="px-4 py-3 text-xs">
                      {sn.warrantyDate ? (
                        <span className={sn.warrantyDate < new Date() ? 'text-red-400' : 'text-zinc-400'}>
                          {formatDate(sn.warrantyDate)}
                        </span>
                      ) : <span className="text-zinc-700">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
