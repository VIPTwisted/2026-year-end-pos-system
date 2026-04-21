import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, Plus } from 'lucide-react'

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
          <Button><Plus className="w-4 h-4 mr-1" />Add Product</Button>
        </div>
        {products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Package className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm mb-2">No products yet</p>
              <p className="text-xs text-zinc-600">Run <code className="bg-zinc-800 px-1 rounded">npm run db:seed</code> to add demo data</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Product</th>
                  <th className="text-left pb-3 font-medium">SKU</th>
                  <th className="text-left pb-3 font-medium">Category</th>
                  <th className="text-right pb-3 font-medium">Cost</th>
                  <th className="text-right pb-3 font-medium">Price</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-zinc-900/50 group">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-zinc-100">{p.name}</div>
                      {p.description && <div className="text-xs text-zinc-500 truncate max-w-xs">{p.description}</div>}
                    </td>
                    <td className="py-3 pr-4 text-zinc-400 font-mono text-xs">{p.sku}</td>
                    <td className="py-3 pr-4">
                      {p.category ? <Badge variant="secondary">{p.category.name}</Badge> : <span className="text-zinc-600">-</span>}
                    </td>
                    <td className="py-3 pr-4 text-right text-zinc-400">{formatCurrency(p.costPrice)}</td>
                    <td className="py-3 pr-4 text-right font-semibold text-emerald-400">{formatCurrency(p.salePrice)}</td>
                    <td className="py-3 text-center">
                      <Badge variant={p.isActive ? 'success' : 'secondary'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
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
