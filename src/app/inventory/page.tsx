import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Warehouse, AlertTriangle } from 'lucide-react'

export default async function InventoryPage() {
  const inventory = await prisma.inventory.findMany({
    include: { product: { include: { category: true } }, store: true },
    orderBy: { product: { name: 'asc' } },
  })

  return (
    <>
      <TopBar title="Inventory" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Stock Levels</h2>
            <p className="text-sm text-zinc-500">{inventory.length} product-location entries</p>
          </div>
          <Button variant="outline">Adjust Stock</Button>
        </div>
        {inventory.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Warehouse className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No inventory data — run seed script or receive a purchase order</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Product</th>
                  <th className="text-left pb-3 font-medium">Store</th>
                  <th className="text-right pb-3 font-medium">On Hand</th>
                  <th className="text-right pb-3 font-medium">Reserved</th>
                  <th className="text-right pb-3 font-medium">Available</th>
                  <th className="text-left pb-3 font-medium">Location</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {inventory.map(inv => {
                  const reorder = inv.product.reorderPoint ?? 5
                  const available = inv.quantity - inv.reserved
                  const low = available <= reorder
                  return (
                    <tr key={inv.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4">
                        <div className="font-medium text-zinc-100">{inv.product.name}</div>
                        <div className="text-xs text-zinc-500">{inv.product.sku}</div>
                      </td>
                      <td className="py-3 pr-4 text-zinc-400">{inv.store.name}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-zinc-100">{inv.quantity}</td>
                      <td className="py-3 pr-4 text-right text-zinc-500">{inv.reserved}</td>
                      <td className={`py-3 pr-4 text-right font-semibold ${low ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {available}
                      </td>
                      <td className="py-3 pr-4 text-zinc-500 text-xs">{inv.location || '-'}</td>
                      <td className="py-3 text-center">
                        {low ? (
                          <Badge variant="warning" className="gap-1">
                            <AlertTriangle className="w-3 h-3" />Low
                          </Badge>
                        ) : (
                          <Badge variant="success">OK</Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
