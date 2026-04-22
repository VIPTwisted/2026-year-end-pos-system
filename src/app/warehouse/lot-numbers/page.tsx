export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export default async function LotNumbersPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>
}) {
  const { productId } = await searchParams

  const lots = await prisma.lotNumber.findMany({
    where: productId ? { productId } : undefined,
    include: { product: { select: { name: true, sku: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Lot Numbers" />
      <main className="flex-1 p-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-zinc-200">{lots.length} Lot Numbers</h2>
          {productId && <p className="text-xs text-zinc-500 mt-0.5">Filtered by product</p>}
        </div>
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          {lots.length === 0 ? (
            <div className="p-12 text-center text-zinc-600 text-sm">No lot numbers found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Lot #</th>
                  <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Product</th>
                  <th className="text-right px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Qty</th>
                  <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Expiration</th>
                  <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Description</th>
                  <th className="text-right px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {lots.map(lot => {
                  const expired = lot.expiresAt && lot.expiresAt < new Date()
                  return (
                    <tr key={lot.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-sm font-semibold text-zinc-200">{lot.lotNo}</td>
                      <td className="px-4 py-3">
                        <p className="text-zinc-300 text-xs">{lot.product.name}</p>
                        <p className="text-zinc-600 text-xs font-mono">{lot.product.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-bold text-zinc-100">{lot.quantity}</td>
                      <td className="px-4 py-3 text-xs">
                        {lot.expiresAt ? (
                          <span className={expired ? 'text-red-400 font-semibold' : 'text-zinc-400'}>
                            {formatDate(lot.expiresAt)} {expired && '⚠ EXPIRED'}
                          </span>
                        ) : <span className="text-zinc-700">—</span>}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">{lot.notes ?? '—'}</td>
                      <td className="px-4 py-3 text-right text-zinc-600 text-xs">{formatDate(lot.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
