'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Shield } from 'lucide-react'

type Entitlement = {
  id: string; name: string; type: string; status: string
  totalTerms: number | null; remainingTerms: number | null
  startDate: string; endDate: string | null
  restrictToChannel: string | null
  customer: { id: string; firstName: string; lastName: string; email: string }
  sla: { id: string; name: string } | null
  cases: Array<{ id: string; case: { id: string; caseNumber: string; title: string; status: string; createdAt: string } }>
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'secondary' | 'destructive' | 'default'> = {
  active: 'success', draft: 'default', waiting: 'warning', cancelled: 'secondary', expired: 'secondary',
}

export default function EntitlementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<Entitlement | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch(`/api/service/entitlements/${id}`)
    setData(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function handleStatusChange(status: string) {
    setSaving(true)
    await fetch(`/api/service/entitlements/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await load()
    setSaving(false)
  }

  if (loading || !data) {
    return (<><TopBar title="Entitlement" /><main className="flex-1 p-6 text-zinc-500">Loading…</main></>)
  }

  const usedTerms = data.totalTerms !== null
    ? (data.totalTerms - (data.remainingTerms ?? 0))
    : data.cases.reduce((s, c) => s + 1, 0)
  const progressPct = data.totalTerms ? Math.min(100, Math.round((usedTerms / data.totalTerms) * 100)) : null

  return (
    <>
      <TopBar title={data.name} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Button asChild variant="ghost" size="sm">
          <Link href="/service/entitlements"><ArrowLeft className="w-4 h-4 mr-1" />Back</Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">{data.name}</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              <Link href={`/customers/${data.customer.id}`} className="hover:text-blue-400">{data.customer.firstName} {data.customer.lastName}</Link>
              <span className="mx-1.5 text-zinc-700">·</span>{data.customer.email}
            </p>
          </div>
          <Badge variant={STATUS_VARIANT[data.status] ?? 'secondary'} className="capitalize">{data.status}</Badge>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="col-span-2">
            <CardContent className="pt-5 pb-5 space-y-5">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Type</p>
                  <p className="text-zinc-200 capitalize">{data.type}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Start Date</p>
                  <p className="text-zinc-200">{formatDate(data.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">End Date</p>
                  <p className="text-zinc-200">{data.endDate ? formatDate(data.endDate) : <span className="text-zinc-700">No expiry</span>}</p>
                </div>
                {data.sla && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">SLA Policy</p>
                    <p className="text-zinc-200">{data.sla.name}</p>
                  </div>
                )}
                {data.restrictToChannel && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Restricted Channel</p>
                    <p className="text-zinc-200 capitalize">{data.restrictToChannel}</p>
                  </div>
                )}
              </div>

              {data.type !== 'unlimited' && data.totalTerms !== null && (
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-zinc-500">Terms Used</span>
                    <span className="text-zinc-300 font-semibold tabular-nums">{usedTerms} / {data.totalTerms}</span>
                  </div>
                  <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${(progressPct ?? 0) >= 100 ? 'bg-red-500' : (progressPct ?? 0) >= 75 ? 'bg-amber-500' : 'bg-blue-500'}`}
                      style={{ width: `${progressPct ?? 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">{progressPct}% used · {data.remainingTerms ?? 0} remaining</p>
                </div>
              )}

              {data.type === 'unlimited' && (
                <div className="flex items-center gap-2 text-emerald-400">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Unlimited entitlement — no term limits</span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-5 pb-5 space-y-2">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Actions</p>
                {data.status === 'draft' && (
                  <Button variant="outline" size="sm" className="w-full text-emerald-400 border-emerald-700" onClick={() => handleStatusChange('active')} disabled={saving}>Activate</Button>
                )}
                {data.status === 'waiting' && (
                  <Button variant="outline" size="sm" className="w-full text-blue-400 border-blue-700" onClick={() => handleStatusChange('active')} disabled={saving}>Activate</Button>
                )}
                {data.status === 'active' && (
                  <Button variant="outline" size="sm" className="w-full text-red-400 border-red-800" onClick={() => handleStatusChange('cancelled')} disabled={saving}>Cancel</Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <section>
          <h2 className="text-base font-semibold text-zinc-100 mb-4">Cases Under This Entitlement ({data.cases.length})</h2>
          {data.cases.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-zinc-600 text-sm">No cases linked yet.</CardContent></Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Case #</th>
                    <th className="text-left pb-3 font-medium">Title</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                    <th className="text-right pb-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {data.cases.map(ec => (
                    <tr key={ec.id} className="hover:bg-zinc-900/50">
                      <td className="py-2.5 pr-4 font-mono text-xs">
                        <Link href={`/service/cases/${ec.case.id}`} className="text-blue-400 hover:underline">{ec.case.caseNumber}</Link>
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-300 max-w-[300px] truncate">{ec.case.title}</td>
                      <td className="py-2.5 pr-4 text-center">
                        <Badge variant={ec.case.status === 'resolved' ? 'success' : ec.case.status === 'open' ? 'warning' : 'default'} className="text-[10px]">
                          {ec.case.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right text-zinc-500 text-xs whitespace-nowrap">{formatDate(ec.case.createdAt)}</td>
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
