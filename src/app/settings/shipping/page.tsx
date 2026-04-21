import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Truck, Plus } from 'lucide-react'

export default async function ShippingMethodsPage() {
  const methods = await prisma.shippingMethod.findMany({
    orderBy: { name: 'asc' },
  })

  const activeCount = methods.filter(m => m.isActive).length

  return (
    <>
      <TopBar title="Shipping Methods" />
      <main className="flex-1 p-6 overflow-auto">

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Methods</p>
              <p className="text-2xl font-bold text-zinc-100">{methods.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Active</p>
              <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Inactive</p>
              <p className="text-2xl font-bold text-zinc-500">{methods.length - activeCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Shipping Methods</h2>
            <p className="text-sm text-zinc-500">{methods.length} configured</p>
          </div>
          <Link href="/settings/shipping/new">
            <Button>
              <Plus className="w-4 h-4 mr-1" />Add Shipping Method
            </Button>
          </Link>
        </div>

        {methods.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Truck className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-base font-medium text-zinc-300 mb-2">No shipping methods</p>
              <p className="text-sm mb-4">Configure your first shipping method</p>
              <Link href="/settings/shipping/new">
                <Button><Plus className="w-4 h-4 mr-1" />Add Shipping Method</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Code</th>
                  <th className="text-left pb-3 font-medium">Name</th>
                  <th className="text-left pb-3 font-medium">Carrier</th>
                  <th className="text-left pb-3 font-medium">Service Type</th>
                  <th className="text-right pb-3 font-medium">Base Rate</th>
                  <th className="text-right pb-3 font-medium">Per Lb</th>
                  <th className="text-right pb-3 font-medium">Free Threshold</th>
                  <th className="text-center pb-3 font-medium">Est. Days</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {methods.map(m => (
                  <tr key={m.id} className="hover:bg-zinc-900/50">
                    <td className="py-3 pr-4 font-mono text-xs text-zinc-400">{m.code}</td>
                    <td className="py-3 pr-4 font-medium text-zinc-100">{m.name}</td>
                    <td className="py-3 pr-4 text-zinc-400">
                      {m.carrier ?? <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="py-3 pr-4 text-zinc-500 text-xs">
                      {m.serviceType ?? <span className="text-zinc-700">—</span>}
                    </td>
                    <td className="py-3 pr-4 text-right text-zinc-300 tabular-nums">
                      {formatCurrency(m.baseRate)}
                    </td>
                    <td className="py-3 pr-4 text-right text-zinc-400 tabular-nums">
                      {m.perLbRate > 0 ? formatCurrency(m.perLbRate) : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="py-3 pr-4 text-right text-zinc-400 tabular-nums">
                      {m.freeThreshold != null ? formatCurrency(m.freeThreshold) : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="py-3 pr-4 text-center text-zinc-400">
                      {m.estimatedDays != null ? `${m.estimatedDays}d` : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="py-3 text-center">
                      {m.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
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
