import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Box, HeadphonesIcon } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'destructive' | 'warning'> = {
  active: 'success',
  expired: 'secondary',
  cancelled: 'destructive',
  draft: 'warning',
}

const BILLING_LABEL: Record<string, string> = {
  monthly: 'Monthly', quarterly: 'Quarterly', annually: 'Annual', one_time: 'One-time',
}

export default async function ServiceContractDetailPage({
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
      serviceCases: {
        include: { partsUsed: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!contract) notFound()

  const openCases = contract.serviceCases.filter(c => c.status === 'open' || c.status === 'in_progress')

  return (
    <>
      <TopBar title={`Contract ${contract.contractNumber}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/service/contracts"><ArrowLeft className="w-4 h-4 mr-1" />Back</Link>
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Contract info */}
          <Card className="col-span-2">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-100">{contract.contractNumber}</h2>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    {contract.customer ? `${contract.customer.firstName} ${contract.customer.lastName}` : '—'}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[contract.status] ?? 'secondary'} className="capitalize">
                  {contract.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Billing Cycle</p>
                  <p className="text-zinc-300">{BILLING_LABEL[contract.billingCycle] ?? contract.billingCycle}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Start Date</p>
                  <p className="text-zinc-300">{formatDate(contract.startDate ?? new Date())}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">End Date</p>
                  <p className="text-zinc-300">{contract.endDate ? formatDate(contract.endDate ?? new Date()) : 'No end'}</p>
                </div>
              </div>

              {contract.description && (
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Description</p>
                  <p className="text-sm text-zinc-300">{contract.description}</p>
                </div>
              )}
              {contract.terms && (
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Terms</p>
                  <p className="text-sm text-zinc-400 whitespace-pre-wrap">{contract.terms}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Value & stats */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Contract Value</p>
                <p className="text-3xl font-bold text-zinc-100">{formatCurrency(contract.value)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Open Cases</p>
                <p className={`text-3xl font-bold ${openCases.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{openCases.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Service Items</p>
                <p className="text-3xl font-bold text-zinc-100">{contract.serviceItems.length}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Service Items */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Box className="w-4 h-4 text-zinc-500" />
            <h2 className="text-base font-semibold text-zinc-100">Service Items</h2>
          </div>
          {contract.serviceItems.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-zinc-600 text-sm">No service items linked to this contract.</CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Description</th>
                    <th className="text-left pb-3 font-medium">Serial #</th>
                    <th className="text-left pb-3 font-medium">Product</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                    <th className="text-left pb-3 font-medium">Warranty End</th>
                    <th className="text-right pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {contract.serviceItems.map(item => (
                    <tr key={item.id} className="hover:bg-zinc-900/50">
                      <td className="py-2.5 pr-4 text-zinc-300">{item.description}</td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-zinc-500">{item.serialNumber ?? '—'}</td>
                      <td className="py-2.5 pr-4 text-zinc-400 text-xs">{item.product?.name ?? '—'}</td>
                      <td className="py-2.5 pr-4 text-center">
                        <Badge variant={item.status === 'active' ? 'success' : 'secondary'} className="capitalize text-xs">
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-500 text-xs">
                        {item.warrantyEnd ? formatDate(item.warrantyEnd) : '—'}
                      </td>
                      <td className="py-2.5 text-right">
                        <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                          <Link href={`/service/items/${item.id}`}>View</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Cases */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <HeadphonesIcon className="w-4 h-4 text-zinc-500" />
            <h2 className="text-base font-semibold text-zinc-100">Service Cases</h2>
          </div>
          {contract.serviceCases.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-zinc-600 text-sm">No cases for this contract.</CardContent>
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
                  {contract.serviceCases.map(c => (
                    <tr key={c.id} className="hover:bg-zinc-900/50">
                      <td className="py-2.5 pr-4 font-mono text-xs">
                        <Link href={`/service/cases/${c.id}`} className="text-blue-400 hover:underline">
                          {c.caseNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-300 max-w-[200px] truncate">{c.title}</td>
                      <td className="py-2.5 pr-4 text-center">
                        <Badge variant={({ critical: 'destructive', high: 'warning', normal: 'default', low: 'secondary' } as Record<string, 'destructive' | 'warning' | 'default' | 'secondary'>)[c.priority] ?? 'secondary'} className="text-xs capitalize">{c.priority}</Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-center">
                        <Badge variant={({ open: 'warning', in_progress: 'default', resolved: 'success', closed: 'secondary' } as Record<string, 'warning' | 'default' | 'success' | 'secondary'>)[c.status] ?? 'secondary'} className="text-xs capitalize">{c.status.replace('_', ' ')}</Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-right text-zinc-400 text-xs">{c.laborHours > 0 ? `${c.laborHours}h` : '—'}</td>
                      <td className="py-2.5 text-zinc-500 text-xs whitespace-nowrap">{formatDate(c.createdAt)}</td>
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
