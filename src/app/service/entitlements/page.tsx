import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Plus, AlertTriangle } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'secondary' | 'destructive' | 'default'> = {
  active: 'success', draft: 'default', waiting: 'warning', cancelled: 'secondary', expired: 'secondary',
}

export default async function EntitlementsPage() {
  const entitlements = await prisma.entitlement.findMany({
    include: {
      customer: true,
      sla: true,
      cases: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const now = new Date()
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const active = entitlements.filter(e => e.status === 'active').length
  const expiringSoon = entitlements.filter(e => e.status === 'active' && e.endDate && new Date(e.endDate) <= in30Days).length
  const exhausted = entitlements.filter(e => e.remainingTerms !== null && e.remainingTerms <= 0).length
  const totalCases = entitlements.reduce((sum, e) => sum + e.cases.length, 0)

  return (
    <>
      <TopBar title="Entitlements" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* KPI */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Active', value: active, color: 'text-emerald-400' },
            { label: 'Expiring Soon', value: expiringSoon, color: expiringSoon > 0 ? 'text-amber-400' : 'text-zinc-500' },
            { label: 'Exhausted', value: exhausted, color: exhausted > 0 ? 'text-red-400' : 'text-zinc-500' },
            { label: 'Total Cases', value: totalCases, color: 'text-blue-400' },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-4 pb-4">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">{k.label}</p>
                <p className={`text-2xl font-bold tabular-nums ${k.color}`}>{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-100">Entitlements</h2>
            <Button asChild>
              <Link href="/service/entitlements/new"><Plus className="w-4 h-4 mr-1" />New Entitlement</Link>
            </Button>
          </div>

          {entitlements.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <Shield className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No entitlements yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Name</th>
                    <th className="text-left pb-3 font-medium">Customer</th>
                    <th className="text-center pb-3 font-medium">Type</th>
                    <th className="text-right pb-3 font-medium">Terms</th>
                    <th className="text-left pb-3 font-medium">Start</th>
                    <th className="text-left pb-3 font-medium">End</th>
                    <th className="text-center pb-3 font-medium">SLA</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                    <th className="text-right pb-3 font-medium">Cases</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {entitlements.map(e => {
                    const isExpiringSoon = e.status === 'active' && e.endDate && new Date(e.endDate) <= in30Days
                    const isExhausted = e.remainingTerms !== null && e.remainingTerms <= 0
                    const termsText = e.type === 'unlimited'
                      ? 'Unlimited'
                      : e.totalTerms !== null
                        ? `${e.remainingTerms ?? 0}/${e.totalTerms}`
                        : '—'
                    return (
                      <tr key={e.id} className="hover:bg-zinc-900/50">
                        <td className="py-3 pr-4">
                          <Link href={`/service/entitlements/${e.id}`} className="text-blue-400 hover:underline font-medium">
                            {e.name}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-zinc-400 text-xs">
                          {e.customer ? `${e.customer.firstName} ${e.customer.lastName}` : '—'}
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-medium ${e.type === 'unlimited' ? 'bg-emerald-900/40 text-emerald-400' : e.type === 'hours' ? 'bg-blue-900/40 text-blue-300' : 'bg-zinc-800 text-zinc-400'}`}>
                            {e.type}
                          </span>
                        </td>
                        <td className={`py-3 pr-4 text-right tabular-nums text-sm ${isExhausted ? 'text-red-400' : 'text-zinc-300'}`}>
                          {termsText}
                          {isExhausted && <AlertTriangle className="w-3 h-3 inline ml-1" />}
                        </td>
                        <td className="py-3 pr-4 text-zinc-500 text-xs whitespace-nowrap">{formatDate(e.startDate ?? new Date())}</td>
                        <td className={`py-3 pr-4 text-xs whitespace-nowrap ${isExpiringSoon ? 'text-amber-400 font-medium' : 'text-zinc-500'}`}>
                          {e.endDate ? formatDate(e.endDate) : <span className="text-zinc-700">—</span>}
                          {isExpiringSoon && <AlertTriangle className="w-3 h-3 inline ml-1" />}
                        </td>
                        <td className="py-3 pr-4 text-center text-zinc-500 text-xs">
                          {e.sla?.name ?? <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <Badge variant={STATUS_VARIANT[e.status] ?? 'secondary'} className="text-[10px]">{e.status}</Badge>
                        </td>
                        <td className="py-3 text-right tabular-nums text-zinc-400 text-xs">{e.cases.length}</td>
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
