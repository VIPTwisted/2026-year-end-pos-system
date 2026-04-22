import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Package, Plus, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <TopBar title="Products" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Product Catalog</h2>
            <p className="text-sm text-zinc-500">{products.length} products</p>
          </div>
          <Link
            href="/products/new"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16 text-zinc-500">
            <Package className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm mb-2">No products yet</p>
            <Link href="/products/new" className="text-xs text-blue-400 hover:text-blue-300">
              + Add your first product
            </Link>
          </div>
        ) : (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Product</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">SKU</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Category</th>
                  <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Cost</th>
                  <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Price</th>
                  <th className="text-center px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-zinc-900/50 transition-colors group">
                    <td className="px-4 py-3">
                      <Link href={`/products/${p.id}`} className="block">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center flex-shrink-0">
                              <Package className="w-4 h-4 text-zinc-600" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-zinc-100 group-hover:text-blue-300 transition-colors">{p.name}</div>
                            {p.description && <div className="text-xs text-zinc-500 truncate max-w-xs">{p.description}</div>}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 font-mono text-xs">
                      <Link href={`/products/${p.id}`}>{p.sku}</Link>
                    </td>
                    <td className="px-4 py-3">
                      {p.category ? (
                        <Badge variant="outline" className="text-xs">{p.category.name}</Badge>
                      ) : (
                        <span className="text-zinc-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-400 tabular-nums">{formatCurrency(p.costPrice)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-400 tabular-nums">{formatCurrency(p.salePrice)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${p.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700/30 text-zinc-500'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/products/${p.id}`} className="text-zinc-600 group-hover:text-zinc-400 transition-colors">
                        <ChevronRight className="w-4 h-4 inline" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
