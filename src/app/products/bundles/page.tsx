export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Plus, Layers } from 'lucide-react'

export default async function BundlesPage() {
  const bundles = await prisma.productBundle.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { id: true, name: true, sku: true, salePrice: true, isActive: true } },
      _count: { select: { components: true } },
    },
  })

  const totalBundles = bundles.length
  const activeCount = bundles.filter(b => b.isActive).length
  const avgComponents =
    totalBundles > 0
      ? (bundles.reduce((s, b) => s + b._count.components, 0) / totalBundles).toFixed(1)
      : '0'
  const kitCount = bundles.filter(b => b.bundleType === 'kit').length

  return (
    <>
      <TopBar title="Product Bundles" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-100">Product Bundles</h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                Kit assembly &amp; bundle configuration
              </p>
            </div>
            <Link href="/products/bundles/new">
              <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Create Bundle
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                Total Bundles
              </div>
              <div className="text-2xl font-bold text-zinc-100">{totalBundles}</div>
              <div className="text-xs text-zinc-500 mt-1">configured</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                Active Bundles
              </div>
              <div className="text-2xl font-bold text-emerald-400">{activeCount}</div>
              <div className="text-xs text-zinc-500 mt-1">available</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                Kit Products
              </div>
              <div className="text-2xl font-bold text-blue-400">{kitCount}</div>
              <div className="text-xs text-zinc-500 mt-1">kit type</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                Avg Components
              </div>
              <div className="text-2xl font-bold text-zinc-100">{avgComponents}</div>
              <div className="text-xs text-zinc-500 mt-1">per bundle</div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/40">
                  {['Bundle Product', 'Type', 'Components', 'Price', 'Status', ''].map(h => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 ${h === 'Components' || h === 'Price' ? 'text-right' : h === '' ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bundles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-zinc-600">
                      <Layers className="w-8 h-8 mx-auto mb-3 opacity-30" />
                      No bundles defined — create one to get started
                    </td>
                  </tr>
                )}
                {bundles.map(b => (
                  <tr
                    key={b.id}
                    className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/products/bundles/${b.id}`}
                        className="font-medium text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {b.product.name}
                      </Link>
                      <div className="text-xs text-zinc-600 font-mono mt-0.5">{b.product.sku}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize
                          ${b.bundleType === 'kit'
                            ? 'bg-blue-500/10 text-blue-400'
                            : b.bundleType === 'bundle'
                              ? 'bg-purple-500/10 text-purple-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                      >
                        {b.bundleType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-zinc-200 font-medium">{b._count.components}</span>
                      <span className="text-xs text-zinc-600 ml-1">items</span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums font-semibold text-zinc-200">
                      {formatCurrency(b.product.salePrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium
                          ${b.isActive
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-zinc-700 text-zinc-400'
                          }`}
                      >
                        {b.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/products/bundles/${b.id}`}
                        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </>
  )
}
