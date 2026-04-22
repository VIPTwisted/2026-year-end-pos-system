import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CheckCircle, ClipboardList, AlertTriangle, FileSearch, Beaker,
  XCircle, Clock, ChevronRight,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  open: 'secondary',
  'in-progress': 'default',
  passed: 'success',
  failed: 'destructive',
  cancelled: 'outline',
}

export default async function QualityPage() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [orders, allNCs, correctiveActions] = await Promise.all([
    prisma.qualityOrder.findMany({
      include: { results: true, nonConformances: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.nonConformance.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.correctiveAction.findMany({ where: { status: { not: 'completed' } } }),
  ])

  const openOrders = orders.filter(o => o.status === 'open' || o.status === 'in-progress').length
  const passedThisMonth = orders.filter(
    o => o.status === 'passed' && new Date(o.updatedAt) >= monthStart
  ).length
  const failedThisMonth = orders.filter(
    o => o.status === 'failed' && new Date(o.updatedAt) >= monthStart
  ).length
  const openNCs = allNCs.filter(nc => nc.status !== 'closed' && nc.status !== 'cancelled').length
  const overdueActions = correctiveActions.filter(
    a => a.dueDate && new Date(a.dueDate) < now && a.status !== 'completed'
  ).length

  const kpis = [
    { label: 'Open Quality Orders', value: openOrders, icon: ClipboardList, color: 'text-blue-400' },
    { label: 'Passed This Month', value: passedThisMonth, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Failed This Month', value: failedThisMonth, icon: XCircle, color: 'text-red-400' },
    { label: 'Open Non-Conformances', value: openNCs, icon: AlertTriangle, color: 'text-amber-400' },
    { label: 'Overdue Corrective Actions', value: overdueActions, icon: Clock, color: 'text-rose-400' },
  ]

  const quickLinks = [
    { label: 'Quality Orders', href: '/quality/orders', icon: ClipboardList, desc: 'Manage inspection orders' },
    { label: 'Non-Conformances', href: '/quality/nc', icon: AlertTriangle, desc: 'Track defects & deviations' },
    { label: 'Test Groups', href: '/quality/test-groups', icon: Beaker, desc: 'Define test specifications' },
    { label: 'Inspection Plans', href: '/quality/plans', icon: FileSearch, desc: 'Automate quality triggers' },
  ]

  return (
    <>
      <TopBar title="Quality Management" />
      <main className="flex-1 p-6 overflow-auto">

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {kpis.map((k) => (
            <Card key={k.label} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <k.icon className={`w-5 h-5 ${k.color}`} />
                  <div>
                    <p className="text-2xl font-bold text-zinc-100">{k.value}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{k.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-zinc-100">Recent Quality Orders</CardTitle>
                <Link href="/quality/orders" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">QO#</th>
                      <th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Product</th>
                      <th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Type</th>
                      <th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Inspector</th>
                      <th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Status</th>
                      <th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-zinc-600 text-sm">No quality orders yet</td>
                      </tr>
                    )}
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/quality/orders/${o.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs">
                            {o.orderNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-zinc-300 text-xs max-w-[140px] truncate">{o.productName}</td>
                        <td className="px-4 py-3 text-zinc-400 text-xs capitalize">{o.referenceType}</td>
                        <td className="px-4 py-3 text-zinc-400 text-xs">{o.inspectedBy ?? '—'}</td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_VARIANT[o.status] ?? 'secondary'} className="text-xs capitalize">
                            {o.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-zinc-500 text-xs">{formatDate(o.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">Quick Access</h3>
            {quickLinks.map((ql) => (
              <Link key={ql.href} href={ql.href}>
                <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/70 transition-all cursor-pointer">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <ql.icon className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-100">{ql.label}</p>
                        <p className="text-xs text-zinc-500">{ql.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
