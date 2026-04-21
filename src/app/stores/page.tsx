import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2 } from 'lucide-react'

export default async function StoresPage() {
  const [stores, orderCounts, employeeCounts] = await Promise.all([
    prisma.store.findMany({ orderBy: { name: 'asc' } }),
    prisma.order.groupBy({ by: ['storeId'], _count: { id: true } }),
    prisma.employee.groupBy({ by: ['storeId'], _count: { id: true } }),
  ])

  const orderMap = new Map(orderCounts.map(r => [r.storeId, r._count.id]))
  const empMap = new Map(employeeCounts.map(r => [r.storeId, r._count.id]))

  const activeStores = stores.filter(s => s.isActive).length
  const totalEmployees = employeeCounts.reduce((sum, r) => sum + r._count.id, 0)
  const totalOrders = orderCounts.reduce((sum, r) => sum + r._count.id, 0)

  const firstStore = stores[0]

  return (
    <>
      <TopBar title="Stores & HQ" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Stores</p>
              <p className="text-2xl font-bold text-zinc-100">{stores.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Active Stores</p>
              <p className="text-2xl font-bold text-emerald-400">{activeStores}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Employees</p>
              <p className="text-2xl font-bold text-zinc-100">{totalEmployees}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-zinc-100">{totalOrders}</p>
            </CardContent>
          </Card>
        </div>

        {/* Store cards */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Locations</h2>
            <p className="text-sm text-zinc-500">{stores.length} stores configured</p>
          </div>

          {stores.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <Building2 className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm">No stores configured — add a location to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
              {stores.map(store => {
                const orders = orderMap.get(store.id) ?? 0
                const emps = empMap.get(store.id) ?? 0
                return (
                  <Card key={store.id} className="flex flex-col">
                    <CardContent className="pt-5 flex flex-col flex-1">
                      {/* Card header */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-zinc-100 leading-tight">{store.name}</h3>
                        <Badge variant={store.isActive ? 'success' : 'destructive'}>
                          {store.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      {/* Address */}
                      <div className="text-sm text-zinc-400 space-y-0.5 mb-4">
                        {store.address && <p>{store.address}</p>}
                        {(store.city || store.state || store.zip) && (
                          <p>
                            {[store.city, store.state].filter(Boolean).join(', ')}
                            {store.zip ? ` ${store.zip}` : ''}
                          </p>
                        )}
                        {store.phone && (
                          <p className="text-zinc-500">{store.phone}</p>
                        )}
                        {store.email && (
                          <p className="text-zinc-500">{store.email}</p>
                        )}
                      </div>

                      {/* Footer stats */}
                      <div className="mt-auto pt-3 border-t border-zinc-800 grid grid-cols-4 gap-2 text-center">
                        <div>
                          <p className="text-xs text-zinc-600 uppercase tracking-wide">Tax Rate</p>
                          <p className="text-sm font-semibold text-zinc-300">
                            {(store.taxRate * 100).toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-600 uppercase tracking-wide">Currency</p>
                          <p className="text-sm font-semibold text-zinc-300">{store.currency}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-600 uppercase tracking-wide">Orders</p>
                          <p className="text-sm font-semibold text-zinc-100">{orders}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-600 uppercase tracking-wide">Staff</p>
                          <p className="text-sm font-semibold text-zinc-100">{emps}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Platform configuration */}
        {firstStore && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-zinc-100">Platform Configuration</h2>
              <p className="text-sm text-zinc-500">Defaults from primary store</p>
            </div>
            <Card>
              <CardContent className="pt-5 pb-5 grid grid-cols-2 gap-6 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Default Tax Rate</p>
                  <p className="text-xl font-bold text-zinc-100">
                    {(firstStore.taxRate * 100).toFixed(4)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Default Currency</p>
                  <p className="text-xl font-bold text-zinc-100">{firstStore.currency}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Primary Store</p>
                  <p className="text-xl font-bold text-zinc-100">{firstStore.name}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Platform</p>
                  <p className="text-xl font-bold text-zinc-100">2026 POS/ERP</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </main>
    </>
  )
}
