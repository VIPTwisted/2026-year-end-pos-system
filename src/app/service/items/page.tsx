import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Box, Plus, AlertTriangle } from 'lucide-react'

export default async function ServiceItemsPage() {
  const items = await prisma.serviceItem.findMany({
    include: { customer: true, product: true, contract: true },
    orderBy: { createdAt: 'desc' },
  })

  const active = items.filter(i => i.status === 'active')
  const now = new Date()
  const warrantyExpiring = active.filter(i => {
    if (!i.warrantyEnd) return false
    const days = Math.ceil((i.warrantyEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return days >= 0 && days <= 30
  })
  const warrantyExpired = items.filter(i => i.warrantyEnd && i.warrantyEnd < now)

  return (
    <>
      <TopBar title="Service Items" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="pt-5 pb-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Items</p>
            <p className="text-2xl font-bold text-zinc-100">{items.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 pb-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Active</p>
            <p className="text-2xl font-bold text-emerald-400">{active.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 pb-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Warranty Expiring</p>
            <p className={`text-2xl font-bold ${warrantyExpiring.length > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>{warrantyExpiring.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 pb-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Warranty Expired</p>
            <p className={`text-2xl font-bold ${warrantyExpired.length > 0 ? 'text-red-400' : 'text-zinc-400'}`}>{warrantyExpired.length}</p>
          </CardContent></Card>
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Service Items</h2>
              <p className="text-sm text-zinc-500">{items.length} items</p>
            </div>
            <Button asChild>
              <Link href="/service/items/new">
                <Plus className="w-4 h-4 mr-1" />
                New Item
              </Link>
            </Button>
          </div>

          {items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <Box className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-base font-medium text-zinc-300 mb-2">No service items</p>
                <Button asChild variant="outline"><Link href="/service/items/new">Add First Item</Link></Button>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Description</th>
                    <th className="text-left pb-3 font-medium">Customer</th>
                    <th className="text-left pb-3 font-medium">Serial #</th>
                    <th className="text-left pb-3 font-medium">Product</th>
                    <th className="text-left pb-3 font-medium">Contract</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                    <th className="text-left pb-3 font-medium">Warranty End</th>
                    <th className="text-left pb-3 font-medium">Next Service</th>
                    <th className="text-right pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {items.map(item => {
                    const warnWarranty = item.warrantyEnd
                      ? Math.ceil((item.warrantyEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                      : null
                    return (
                      <tr key={item.id} className="hover:bg-zinc-900/50">
                        <td className="py-3 pr-4 text-zinc-300 max-w-[180px] truncate">
                          <Link href={`/service/items/${item.id}`} className="hover:text-blue-400">
                            {item.description}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-zinc-400 text-xs">
                          {item.customer?.firstName} {item.customer?.lastName}
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs text-zinc-500">{item.serialNumber ?? '—'}</td>
                        <td className="py-3 pr-4 text-zinc-500 text-xs">{item.product?.name ?? '—'}</td>
                        <td className="py-3 pr-4 text-xs font-mono">
                          {item.contract
                            ? <Link href={`/service/contracts/${item.contract.id}`} className="text-blue-400 hover:underline">{item.contract.contractNo}</Link>
                            : <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <Badge variant={item.status === 'active' ? 'success' : 'secondary'} className="capitalize text-xs">
                            {item.status}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-xs">
                          {item.warrantyEnd ? (
                            <span className={warnWarranty !== null && warnWarranty <= 30 ? 'text-amber-400 flex items-center gap-1' : 'text-zinc-400'}>
                              {warnWarranty !== null && warnWarranty <= 0 && <AlertTriangle className="w-3 h-3 text-red-400" />}
                              {warnWarranty !== null && warnWarranty > 0 && warnWarranty <= 30 && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                              {formatDate(item.warrantyEnd)}
                            </span>
                          ) : <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="py-3 pr-4 text-zinc-500 text-xs">
                          {item.nextServiceDate ? formatDate(item.nextServiceDate) : <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="py-3 text-right">
                          <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                            <Link href={`/service/items/${item.id}`}>View</Link>
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
