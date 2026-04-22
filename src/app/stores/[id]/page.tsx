export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Building2, ShoppingCart, Users, Package, DollarSign } from 'lucide-react'
import { StoreEditForm } from './StoreEditForm'

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          orders: true,
          employees: true,
          inventory: true,
        },
      },
      orders: {
        select: { totalAmount: true },
      },
    },
  })

  if (!store) notFound()

  const totalRevenue = store.orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const activeProductCount = await prisma.inventory.count({
    where: { storeId: id, quantity: { gt: 0 } },
  })

  return (
    <>
      <TopBar title={store.name} />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Back link */}
        <div>
          <Link
            href="/stores"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Stores
          </Link>
        </div>

        {/* Store header */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={store.isActive ? 'success' : 'destructive'}>
                    {store.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-xs">{store.currency}</Badge>
                </div>
                <h1 className="text-2xl font-bold text-zinc-100">{store.name}</h1>
                {(store.city || store.state) && (
                  <p className="text-sm text-zinc-500 mt-0.5">
                    {[store.city, store.state].filter(Boolean).join(', ')}
                    {store.zip ? ` ${store.zip}` : ''}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Orders</p>
              </div>
              <p className="text-2xl font-bold text-zinc-100">{store._count.orders}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Revenue</p>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-violet-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Employees</p>
              </div>
              <p className="text-2xl font-bold text-zinc-100">{store._count.employees}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Products in Stock</p>
              </div>
              <p className="text-2xl font-bold text-zinc-100">{activeProductCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Edit form */}
        <StoreEditForm
          store={{
            id: store.id,
            name: store.name,
            address: store.address,
            city: store.city,
            state: store.state,
            zip: store.zip,
            phone: store.phone,
            email: store.email,
            taxRate: store.taxRate,
            currency: store.currency,
            isActive: store.isActive,
          }}
        />

      </main>
    </>
  )
}
