import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, HeadphonesIcon } from 'lucide-react'

export default async function ServiceItemDetailPage({
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
      serviceCases: {
        include: { partsUsed: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!item) notFound()

  const now = new Date()
  const warrantyStatus = item.warrantyEnd
    ? item.warrantyEnd < now ? 'expired' : 'active'
    : 'none'

  return (
    <>
      <TopBar title={item.description} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/service/items"><ArrowLeft className="w-4 h-4 mr-1" />Back</Link>
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="col-span-2">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-100">{item.description}</h2>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    {item.customer?.firstName} {item.customer?.lastName}
                  </p>
                </div>
                <Badge variant={item.status === 'active' ? 'success' : 'secondary'} className="capitalize">
                  {item.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {item.serialNumber && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Serial Number</p>
                    <p className="font-mono text-zinc-300">{item.serialNumber}</p>
                  </div>
                )}
                {item.product && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Product</p>
                    <p className="text-zinc-300">{item.product.name}</p>
                  </div>
                )}
                {item.contract && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Contract</p>
                    <Link href={`/service/contracts/${item.contract.id}`} className="text-blue-400 hover:underline font-mono text-sm">
                      {item.contract.contractNo}
                    </Link>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Warranty</p>
                  <Badge variant={warrantyStatus === 'expired' ? 'destructive' : warrantyStatus === 'active' ? 'success' : 'secondary'} className="text-xs capitalize">
                    {warrantyStatus}
                  </Badge>
                </div>
                {item.warrantyStart && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Warranty Start</p>
                    <p className="text-zinc-300">{formatDate(item.warrantyStart)}</p>
                  </div>
                )}
                {item.warrantyEnd && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Warranty End</p>
                    <p className={item.warrantyEnd < now ? 'text-red-400' : 'text-zinc-300'}>{formatDate(item.warrantyEnd)}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {item.lastServiceDate && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Last Service</p>
                    <p className="text-zinc-300">{formatDate(item.lastServiceDate)}</p>
                  </div>
                )}
                {item.nextServiceDate && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Next Service</p>
                    <p className={item.nextServiceDate < now ? 'text-amber-400' : 'text-zinc-300'}>{formatDate(item.nextServiceDate)}</p>
                  </div>
                )}
              </div>

              {item.notes && (
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Notes</p>
                  <p className="text-sm text-zinc-400 whitespace-pre-wrap">{item.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Cases</p>
                <p className="text-3xl font-bold text-zinc-100">{item.serviceCases.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Open Cases</p>
                <p className={`text-3xl font-bold ${item.serviceCases.filter(c => c.status === 'open').length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {item.serviceCases.filter(c => c.status === 'open').length}
                </p>
              </CardContent>
            </Card>
            <Button asChild className="w-full" size="sm">
              <Link href={`/service/cases/new?serviceItemId=${item.id}&customerId=${item.customerId}`}>
                New Case for this Item
              </Link>
            </Button>
          </div>
        </div>

        {/* Cases */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <HeadphonesIcon className="w-4 h-4 text-zinc-500" />
            <h2 className="text-base font-semibold text-zinc-100">Service Cases</h2>
          </div>
          {item.serviceCases.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-zinc-600 text-sm">No cases for this item yet.</CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Case #</th>
                    <th className="text-left pb-3 font-medium">Title</th>
                    <th className="text-center pb-3 font-medium">Priority</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                    <th className="text-right pb-3 font-medium">Labor</th>
                    <th className="text-left pb-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {item.serviceCases.map(c => (
                    <tr key={c.id} className="hover:bg-zinc-900/50">
                      <td className="py-2.5 pr-4 font-mono text-xs">
                        <Link href={`/service/cases/${c.id}`} className="text-blue-400 hover:underline">{c.caseNumber}</Link>
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-300 max-w-[200px] truncate">{c.title}</td>
                      <td className="py-2.5 pr-4 text-center">
                        <Badge variant={({ critical: 'destructive', high: 'warning', normal: 'default', low: 'secondary' } as Record<string, 'destructive' | 'warning' | 'default' | 'secondary'>)[c.priority] ?? 'secondary'} className="text-xs capitalize">{c.priority}</Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-center">
                        <Badge variant={({ open: 'warning', in_progress: 'default', resolved: 'success', closed: 'secondary' } as Record<string, 'warning' | 'default' | 'success' | 'secondary'>)[c.status] ?? 'secondary'} className="text-xs capitalize">{c.status.replace('_', ' ')}</Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-right text-zinc-400 text-xs">{c.laborHours > 0 ? `${c.laborHours}h` : '—'}</td>
                      <td className="py-2.5 text-zinc-500 text-xs">{formatDate(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
