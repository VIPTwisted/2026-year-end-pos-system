export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreditCard, Plus } from 'lucide-react'

const TYPE_TABS = ['all', 'customer', 'vendor']
const STATUS_TABS = ['all', 'open', 'invoiced', 'applied', 'closed']

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  open: 'default',
  invoiced: 'outline',
  applied: 'success',
  closed: 'secondary',
}

export default async function PrepaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>
}) {
  const sp = await searchParams
  const activeType = sp.type ?? 'all'
  const activeStatus = sp.status ?? 'all'

  const preps = await prisma.payment.findMany({
    where: {
      ...(activeType !== 'all' ? { type: activeType } : {}),
      ...(activeStatus !== 'all' ? { status: activeStatus } : {}),
    },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true } },
      vendor: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  const now = new Date()
  const openCount = preps.filter(p => p.status === 'open').length
  const totalOpen = preps.filter(p => p.status === 'open').reduce((s, p) => s + p.amount, 0)
  const totalApplied = preps.reduce((s, p) => s + p.appliedAmount, 0)
  const overdueCount = preps.filter(p => p.dueDate && new Date(p.dueDate) < now && p.status === 'open').length

  const buildLink = (type: string, status: string) => {
    const p = new URLSearchParams()
    if (type !== 'all') p.set('type', type)
    if (status !== 'all') p.set('status', status)
    const q = p.toString()
    return `/purchasing/prepayments${q ? `?${q}` : ''}`
  }

  return (
    <>
      <TopBar title="Prepayments" />
      <main className="flex-1 p-6 overflow-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Open Prepayments', value: openCount, color: 'text-blue-400' },
            { label: 'Total Open Amount', value: formatCurrency(totalOpen), color: 'text-emerald-400' },
            { label: 'Total Applied', value: formatCurrency(totalApplied), color: 'text-amber-400' },
            { label: 'Overdue', value: overdueCount, color: overdueCount > 0 ? 'text-red-400' : 'text-zinc-500' },
          ].map(k => (
            <Card key={k.label} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{k.label}</p>
                <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex gap-1">
            <span className="text-xs text-zinc-500 self-center mr-1">Type:</span>
            {TYPE_TABS.map(tab => (
              <Link key={tab} href={buildLink(tab, activeStatus)}
                className={`px-2 py-1 rounded text-xs font-medium capitalize transition-colors ${activeType === tab ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>
                {tab}
              </Link>
            ))}
          </div>
          <div className="flex gap-1">
            <span className="text-xs text-zinc-500 self-center mr-1">Status:</span>
            {STATUS_TABS.map(tab => (
              <Link key={tab} href={buildLink(activeType, tab)}
                className={`px-2 py-1 rounded text-xs font-medium capitalize transition-colors ${activeStatus === tab ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>
                {tab}
              </Link>
            ))}
          </div>
          <div className="ml-auto">
            <Link href="/purchasing/prepayments/new">
              <Button size="sm"><Plus className="w-4 h-4 mr-1" />New Prepayment</Button>
            </Link>
          </div>
        </div>

        {preps.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <CreditCard className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-base font-medium text-zinc-300 mb-2">No prepayments found</p>
              <Link href="/purchasing/prepayments/new">
                <Button size="sm"><Plus className="w-4 h-4 mr-1" />Create Prepayment</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Prep #</th>
                  <th className="text-center pb-3 font-medium">Type</th>
                  <th className="text-left pb-3 font-medium">Customer / Vendor</th>
                  <th className="text-right pb-3 font-medium">Amount</th>
                  <th className="text-right pb-3 font-medium">Applied</th>
                  <th className="text-right pb-3 font-medium">Remaining</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {preps.map(prep => {
                  const remaining = prep.amount - prep.appliedAmount
                  const isOverdue = prep.dueDate && new Date(prep.dueDate) < now && prep.status === 'open'
                  const partyName = prep.type === 'customer'
                    ? prep.customer ? `${prep.customer.firstName} ${prep.customer.lastName}` : '—'
                    : prep.vendor?.name ?? '—'
                  return (
                    <tr key={prep.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-mono text-xs">
                        <Link href={`/purchasing/prepayments/${prep.id}`} className="text-blue-400 hover:text-blue-300 hover:underline">
                          {prep.prepaymentNo}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <Badge variant={prep.type === 'customer' ? 'default' : 'outline'} className="capitalize text-xs">
                          {prep.type}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-zinc-300">{partyName}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-emerald-400">{formatCurrency(prep.amount)}</td>
                      <td className="py-3 pr-4 text-right text-amber-400">{formatCurrency(prep.appliedAmount)}</td>
                      <td className="py-3 pr-4 text-right">
                        <span className={remaining === 0 ? 'text-zinc-500' : 'text-blue-400'}>{formatCurrency(remaining)}</span>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <Badge variant={STATUS_VARIANT[prep.status] ?? 'secondary'} className="capitalize text-xs">
                          {prep.status}
                        </Badge>
                      </td>
                      <td className={`py-3 text-xs ${isOverdue ? 'text-red-400' : 'text-zinc-400'}`}>
                        {prep.dueDate ? formatDate(prep.dueDate) : '—'}
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
