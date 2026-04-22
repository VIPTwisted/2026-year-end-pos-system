import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileCheck2, Plus } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'destructive' | 'warning'> = {
  active: 'success',
  expired: 'secondary',
  cancelled: 'destructive',
  draft: 'warning',
}

const BILLING_LABEL: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annual',
  one_time: 'One-time',
}

export default async function ServiceContractsPage() {
  const contracts = await prisma.serviceContract.findMany({
    include: {
      customer: true,
      serviceItems: true,
      serviceCases: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const active = contracts.filter(c => c.status === 'active')
  const totalValue = active.reduce((sum, c) => sum + c.value, 0)
  const expiringSoon = active.filter(c => {
    if (!c.endDate) return false
    const daysUntil = Math.ceil((c.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysUntil <= 30
  })

  return (
    <>
      <TopBar title="Service Contracts" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="pt-5 pb-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Contracts</p>
            <p className="text-2xl font-bold text-zinc-100">{contracts.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 pb-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Active</p>
            <p className="text-2xl font-bold text-emerald-400">{active.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 pb-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Expiring ≤30d</p>
            <p className={`text-2xl font-bold ${expiringSoon.length > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>{expiringSoon.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 pb-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Active Value</p>
            <p className="text-2xl font-bold text-zinc-100">{formatCurrency(totalValue)}</p>
          </CardContent></Card>
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Contracts</h2>
              <p className="text-sm text-zinc-500">{contracts.length} contracts</p>
            </div>
            <Button asChild>
              <Link href="/service/contracts/new">
                <Plus className="w-4 h-4 mr-1" />
                New Contract
              </Link>
            </Button>
          </div>

          {contracts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <FileCheck2 className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-base font-medium text-zinc-300 mb-2">No contracts yet</p>
                <Button asChild variant="outline"><Link href="/service/contracts/new">Create First Contract</Link></Button>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Contract #</th>
                    <th className="text-left pb-3 font-medium">Customer</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                    <th className="text-left pb-3 font-medium">Start</th>
                    <th className="text-left pb-3 font-medium">End</th>
                    <th className="text-left pb-3 font-medium">Billing</th>
                    <th className="text-right pb-3 font-medium">Value</th>
                    <th className="text-center pb-3 font-medium">Items</th>
                    <th className="text-center pb-3 font-medium">Cases</th>
                    <th className="text-right pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {contracts.map(c => {
                    const daysUntilExpiry = c.endDate
                      ? Math.ceil((c.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      : null
                    return (
                      <tr key={c.id} className="hover:bg-zinc-900/50">
                        <td className="py-3 pr-4 font-mono text-xs">
                          <Link href={`/service/contracts/${c.id}`} className="text-blue-400 hover:underline">
                            {c.contractNumber}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-zinc-300">
                          {c.customer ? `${c.customer.firstName} ${c.customer.lastName}` : '—'}
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <Badge variant={STATUS_VARIANT[c.status] ?? 'secondary'} className="capitalize">
                            {c.status}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-zinc-400 text-xs whitespace-nowrap">
                          {formatDate(c.startDate ?? new Date())}
                        </td>
                        <td className="py-3 pr-4 text-xs whitespace-nowrap">
                          {c.endDate ? (
                            <span className={daysUntilExpiry !== null && daysUntilExpiry <= 30 && c.status === 'active' ? 'text-amber-400' : 'text-zinc-400'}>
                              {formatDate(c.endDate)}
                              {daysUntilExpiry !== null && daysUntilExpiry <= 30 && c.status === 'active' && (
                                <span className="ml-1 text-amber-600">({daysUntilExpiry}d)</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-zinc-600">No end</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-zinc-500 text-xs">
                          {BILLING_LABEL[c.billingCycle] ?? c.billingCycle}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums text-zinc-300">
                          {formatCurrency(c.value)}
                        </td>
                        <td className="py-3 pr-4 text-center text-zinc-400">{c.serviceItems.length}</td>
                        <td className="py-3 pr-4 text-center text-zinc-400">{c.serviceCases.length}</td>
                        <td className="py-3 text-right">
                          <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                            <Link href={`/service/contracts/${c.id}`}>View</Link>
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
