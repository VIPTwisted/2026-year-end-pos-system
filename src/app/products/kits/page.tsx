export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, Plus } from 'lucide-react'

export default async function KitsPage() {
  const kits = await prisma.productKit.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { id: true, name: true, sku: true, salePrice: true } },
      _count: { select: { components: true } },
    },
  })

  const activeCount = kits.filter(k => k.isActive).length
  const fixedCount = kits.filter(k => k.kitType === 'fixed').length
  const configCount = kits.filter(k => k.kitType === 'configurable').length

  return (
    <>
      <TopBar title="Kits & Bundles" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">Kits & Bundles</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {activeCount} active · {fixedCount} fixed · {configCount} configurable
            </p>
          </div>
          <Link href="/products/kits/new">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Create Kit
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Product</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">SKU</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Kit Type</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Components</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {kits.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-zinc-600">
                        No kits defined yet — create one to get started
                      </td>
                    </tr>
                  )}
                  {kits.map(k => (
                    <tr key={k.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/products/kits/${k.productId}`}
                          className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {k.product.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{k.product.sku}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={k.kitType === 'fixed' ? 'default' : 'secondary'}
                          className="text-xs capitalize"
                        >
                          {k.kitType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-zinc-300 font-medium">{k._count.components}</span>
                        <span className="text-zinc-600 text-xs ml-1">items</span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs max-w-xs truncate">{k.description ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={k.isActive ? 'success' : 'secondary'} className="text-xs">
                          {k.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
