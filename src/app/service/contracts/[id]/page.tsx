export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

function fmtDate(d: Date | string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'destructive' | 'secondary' | 'default'> = {
  Draft: 'warning', Signed: 'success', Cancelled: 'destructive', Expired: 'secondary',
  draft: 'warning', active: 'success', cancelled: 'destructive', expired: 'secondary',
}

export default async function ServiceContractCardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const contract = await prisma.serviceContract.findUnique({
    where: { id },
    include: {
      customer: true,
      serviceItems: { include: { product: true } },
      serviceOrders: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { customer: true },
      },
      serviceCases: { orderBy: { createdAt: 'desc' }, take: 3 },
    },
  })
  if (!contract) notFound()

  const now = new Date()
  const daysUntilExpiry = contract.endDate
    ? Math.ceil((contract.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <>
      <TopBar title={`Service Contract — ${contract.contractNumber}`} />
      <main className="flex-1 overflow-auto">

        {/* Ribbon */}
        <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-2 flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
            <Link href="/service/contracts"><ArrowLeft className="w-3.5 h-3.5" />Back</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="h-7 px-2.5 text-xs" disabled>
            Sign Contract
          </Button>
          <Button asChild size="sm" variant="outline" className="h-7 px-2.5 text-xs" disabled>
            Create Invoice
          </Button>
        </div>

        <div className="p-5 space-y-5 max-w-6xl">
          {/* Header */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-sm font-semibold text-zinc-100">{contract.contractNumber}</span>
            <Badge variant={STATUS_VARIANT[contract.status] ?? 'secondary'} className="capitalize text-xs">{contract.status}</Badge>
            {daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 30 && (
              <Badge variant="warning" className="text-xs">Expiring in {daysUntilExpiry}d</Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2 space-y-4">

              {/* General FastTab */}
              <Card>
                <CardContent className="pt-5 space-y-4">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold border-b border-zinc-800 pb-2">General</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Customer No.</p>
                      <p className="font-mono text-zinc-500 text-xs">{contract.customer?.id.slice(0, 8).toUpperCase() ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Customer Name</p>
                      {contract.customer ? (
                        <Link href={`/customers/${contract.customer.id}`} className="text-indigo-400 hover:underline">
                          {contract.customer.firstName} {contract.customer.lastName}
                        </Link>
                      ) : <span className="text-zinc-600">—</span>}
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Contract Type</p>
                      <p className="text-zinc-300 capitalize">{contract.coverageType ?? 'Contract'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Status</p>
                      <Badge variant={STATUS_VARIANT[contract.status] ?? 'secondary'} className="capitalize text-xs">{contract.status}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Starting Date</p>
                      <p className="text-zinc-300">{fmtDate(contract.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Expiration Date</p>
                      <p className={`font-medium ${daysUntilExpiry !== null && daysUntilExpiry <= 30 ? 'text-amber-400' : 'text-zinc-300'}`}>
                        {fmtDate(contract.endDate)}
                      </p>
                    </div>
                    {contract.description && (
                      <div className="col-span-2">
                        <p className="text-xs text-zinc-500 mb-0.5">Description</p>
                        <p className="text-zinc-400">{contract.description}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Invoice Details FastTab */}
              <Card>
                <CardContent className="pt-5 space-y-3">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold border-b border-zinc-800 pb-2">Invoice Details</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Annual Amount</p>
                      <p className="text-zinc-100 font-semibold text-base">{fmtCurrency(contract.value)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Billing Cycle</p>
                      <p className="text-zinc-300 capitalize">{contract.billingCycle}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Contract Lines */}
              {contract.serviceItems.length > 0 && (
                <Card>
                  <CardContent className="pt-5">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold border-b border-zinc-800 pb-2 mb-3">
                      Service Items on Contract
                    </p>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wide">
                          <th className="text-left pb-2 font-medium pr-4">Service Item</th>
                          <th className="text-left pb-2 font-medium pr-4">Serial No.</th>
                          <th className="text-left pb-2 font-medium pr-4">Product</th>
                          <th className="text-left pb-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {contract.serviceItems.map(si => (
                          <tr key={si.id} className="hover:bg-zinc-900/30">
                            <td className="py-2 pr-4">
                              <Link href={`/service/items/${si.id}`} className="text-indigo-400 hover:underline">{si.description}</Link>
                            </td>
                            <td className="py-2 pr-4 font-mono text-zinc-500">{si.serialNumber ?? '—'}</td>
                            <td className="py-2 pr-4 text-zinc-400">{si.product?.name ?? '—'}</td>
                            <td className="py-2 text-zinc-500 capitalize">{si.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}

              {/* Recent Service Orders */}
              {contract.serviceOrders.length > 0 && (
                <Card>
                  <CardContent className="pt-5">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold border-b border-zinc-800 pb-2 mb-3">
                      Recent Service Orders
                    </p>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wide">
                          <th className="text-left pb-2 font-medium pr-4">No.</th>
                          <th className="text-left pb-2 font-medium pr-4">Description</th>
                          <th className="text-left pb-2 font-medium pr-4">Status</th>
                          <th className="text-left pb-2 font-medium">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {contract.serviceOrders.map(o => (
                          <tr key={o.id} className="hover:bg-zinc-900/30">
                            <td className="py-2 pr-4">
                              <Link href={`/service/orders/${o.id}`} className="text-indigo-400 hover:underline font-mono">{o.orderNumber}</Link>
                            </td>
                            <td className="py-2 pr-4 text-zinc-400 max-w-[150px] truncate">{o.description}</td>
                            <td className="py-2 pr-4 text-zinc-500 capitalize">{o.status}</td>
                            <td className="py-2 text-zinc-500">{fmtDate(o.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* FactBox */}
            <div className="space-y-3">
              <Card>
                <CardContent className="pt-4 pb-4 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Contract Statistics</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Service Items</span>
                    <span className="text-zinc-200 font-medium">{contract.serviceItems.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Service Orders</span>
                    <span className="text-zinc-200 font-medium">{contract.serviceOrders.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Annual Value</span>
                    <span className="text-zinc-100 font-semibold">{fmtCurrency(contract.value)}</span>
                  </div>
                  {daysUntilExpiry !== null && (
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Days Remaining</span>
                      <span className={`font-medium ${daysUntilExpiry <= 30 ? 'text-amber-400' : 'text-zinc-300'}`}>
                        {daysUntilExpiry >= 0 ? daysUntilExpiry : 'Expired'}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
