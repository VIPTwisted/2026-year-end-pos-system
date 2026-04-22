export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

function fmtDate(d: Date | string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const TAB_DISPLAY = ['General', 'Service Item Components', 'Troubleshooting', 'Warranty'] as const

export default async function ServiceItemCardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = await prisma.serviceItem.findUnique({
    where: { id },
    include: {
      customer: true,
      product: true,
      contract: true,
      serviceOrders: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { customer: true },
      },
    },
  })
  if (!item) notFound()

  const now = new Date()
  const warnDays = item.warrantyEnd
    ? Math.ceil((item.warrantyEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null

  const totalOrders = item.serviceOrders.length
  const openOrders  = item.serviceOrders.filter(o => !['completed','Finished','cancelled'].includes(o.status)).length

  return (
    <>
      <TopBar title={`Service Item — ${item.description}`} />
      <main className="flex-1 overflow-auto">
        {/* Ribbon */}
        <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-2 flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
            <Link href="/service/items"><ArrowLeft className="w-3.5 h-3.5" />Back</Link>
          </Button>
          <Button asChild size="sm" className="h-7 px-2.5 text-xs gap-1">
            <Link href="/service/orders/new">New Service Order</Link>
          </Button>
        </div>

        <div className="p-5 space-y-5 max-w-6xl">
          {/* Header strip */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xs text-zinc-500">{item.id.slice(0, 8).toUpperCase()}</span>
            <Badge variant={item.status === 'active' ? 'success' : 'secondary'} className="capitalize text-xs">{item.status}</Badge>
            {warnDays !== null && warnDays <= 30 && (
              <Badge variant="warning" className="text-xs gap-1">
                <AlertTriangle className="w-3 h-3" />
                {warnDays <= 0 ? 'Warranty Expired' : `Warranty Expiring (${warnDays}d)`}
              </Badge>
            )}
          </div>

          {/* FastTab display (server-rendered — all tabs visible as sections) */}
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2 space-y-4">

              {/* General */}
              <Card>
                <CardContent className="pt-5 space-y-4">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold border-b border-zinc-800 pb-2">General</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Description</p>
                      <p className="text-zinc-100">{item.description}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Serial No.</p>
                      <p className="text-zinc-300 font-mono">{item.serialNumber ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Customer No.</p>
                      <p className="text-zinc-500 font-mono text-xs">{item.customer?.id.slice(0, 8).toUpperCase() ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Customer Name</p>
                      {item.customer ? (
                        <Link href={`/customers/${item.customer.id}`} className="text-indigo-400 hover:underline text-sm">
                          {item.customer.firstName} {item.customer.lastName}
                        </Link>
                      ) : <span className="text-zinc-600">—</span>}
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Item No. (Product)</p>
                      <p className="text-zinc-400 font-mono text-xs">{item.product?.id.slice(0, 8).toUpperCase() ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Product Name</p>
                      <p className="text-zinc-300">{item.product?.name ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Status</p>
                      <Badge variant={item.status === 'active' ? 'success' : 'secondary'} className="capitalize text-xs">{item.status}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Last Service Date</p>
                      <p className="text-zinc-300">{fmtDate(item.lastServiceDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Next Service Date</p>
                      <p className="text-zinc-300">{fmtDate(item.nextServiceDate)}</p>
                    </div>
                    {item.contract && (
                      <div>
                        <p className="text-xs text-zinc-500 mb-0.5">Service Contract</p>
                        <Link href={`/service/contracts/${item.contract.id}`} className="text-indigo-400 hover:underline font-mono text-xs">
                          {item.contract.contractNumber}
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Warranty */}
              <Card>
                <CardContent className="pt-5 space-y-3">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold border-b border-zinc-800 pb-2">Warranty</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Warranty Start</p>
                      <p className="text-zinc-300">{fmtDate(item.warrantyStart)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Warranty Expiry Date</p>
                      <p className={`font-medium ${warnDays !== null && warnDays <= 0 ? 'text-red-400' : warnDays !== null && warnDays <= 30 ? 'text-amber-400' : 'text-zinc-300'}`}>
                        {fmtDate(item.warrantyEnd)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {item.notes && (
                <Card>
                  <CardContent className="pt-5">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold border-b border-zinc-800 pb-2 mb-3">Notes / Troubleshooting</p>
                    <p className="text-sm text-zinc-400 whitespace-pre-wrap">{item.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Service Order Lines */}
              {item.serviceOrders.length > 0 && (
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
                        {item.serviceOrders.map(o => (
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
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Service Statistics</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Total Orders</span>
                    <span className="text-zinc-200 font-medium">{totalOrders}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Open Orders</span>
                    <span className={`font-medium ${openOrders > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>{openOrders}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Last Service</span>
                    <span className="text-zinc-300">{fmtDate(item.lastServiceDate)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Next Service</span>
                    <span className="text-zinc-300">{fmtDate(item.nextServiceDate)}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Service Order Lines</p>
                  {item.serviceOrders.slice(0, 3).map(o => (
                    <div key={o.id} className="text-xs flex items-center justify-between gap-2">
                      <Link href={`/service/orders/${o.id}`} className="text-indigo-400 hover:underline font-mono truncate">{o.orderNumber}</Link>
                      <span className="text-zinc-500 capitalize shrink-0">{o.status}</span>
                    </div>
                  ))}
                  {item.serviceOrders.length === 0 && <p className="text-xs text-zinc-600">No orders.</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
