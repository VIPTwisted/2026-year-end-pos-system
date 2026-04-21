import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, ShieldAlert, Plus, AlertTriangle } from 'lucide-react'

const SEVERITY_VARIANT: Record<string, 'destructive' | 'warning' | 'default' | 'secondary'> = {
  critical: 'destructive',
  high: 'warning',
  medium: 'default',
  low: 'secondary',
}

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'secondary' | 'default'> = {
  open: 'warning',
  confirmed: 'destructive' as unknown as 'warning',
  reviewed: 'default',
  dismissed: 'secondary',
}

export default async function FraudPage() {
  const [rules, alerts] = await Promise.all([
    prisma.fraudRule.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { alerts: true } } },
    }),
    prisma.fraudAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { rule: true },
    }),
  ])

  const activeRules = rules.filter(r => r.isActive).length
  const openAlerts = alerts.filter(a => a.status === 'open').length
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length

  return (
    <>
      <TopBar title="Fraud Protection" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-zinc-500" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Rules</p>
              </div>
              <p className="text-2xl font-bold text-zinc-100">{rules.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-zinc-500" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Active Rules</p>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{activeRules}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-zinc-500" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Open Alerts</p>
              </div>
              <p className="text-2xl font-bold text-amber-400">{openAlerts}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="w-4 h-4 text-zinc-500" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Critical Alerts</p>
              </div>
              <p className="text-2xl font-bold text-red-400">{criticalAlerts}</p>
            </CardContent>
          </Card>
        </div>

        {/* Rules Table */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Fraud Rules</h2>
              <p className="text-sm text-zinc-500">{rules.length} rules configured</p>
            </div>
            <Link href="/settings/fraud/new">
              <Button>
                <Plus className="w-4 h-4 mr-1" />Add Rule
              </Button>
            </Link>
          </div>

          {rules.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <Shield className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-base font-medium text-zinc-300 mb-2">No fraud rules</p>
                <p className="text-sm mb-4">Add rules to start detecting suspicious activity</p>
                <Link href="/settings/fraud/new">
                  <Button><Plus className="w-4 h-4 mr-1" />Add Rule</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Name</th>
                    <th className="text-left pb-3 font-medium">Rule Type</th>
                    <th className="text-right pb-3 font-medium">Threshold</th>
                    <th className="text-left pb-3 font-medium">Action</th>
                    <th className="text-center pb-3 font-medium">Alerts</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {rules.map(rule => (
                    <tr key={rule.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-medium text-zinc-100">{rule.name}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="text-xs font-mono">{rule.ruleType}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-right text-zinc-400 tabular-nums">
                        {rule.threshold != null ? rule.threshold.toLocaleString() : <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={rule.action === 'block' ? 'destructive' : rule.action === 'review' ? 'warning' : 'default'}
                          className="capitalize"
                        >
                          {rule.action}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <Badge variant="outline" className="text-xs font-mono">
                          {rule._count.alerts}
                        </Badge>
                      </td>
                      <td className="py-3 text-center">
                        {rule.isActive ? (
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
        </section>

        {/* Recent Alerts */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Recent Alerts</h2>
            <p className="text-sm text-zinc-500">Last 50 fraud alerts across all rules</p>
          </div>

          {alerts.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-10 text-center text-zinc-500 text-sm">
                No fraud alerts — system is clean
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-center pb-3 font-medium">Severity</th>
                    <th className="text-left pb-3 font-medium">Entity Type</th>
                    <th className="text-left pb-3 font-medium">Reason</th>
                    <th className="text-left pb-3 font-medium">Rule</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                    <th className="text-left pb-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {alerts.map(alert => (
                    <tr key={alert.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 text-center">
                        <Badge variant={SEVERITY_VARIANT[alert.severity] ?? 'secondary'} className="capitalize">
                          {alert.severity}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="text-xs font-mono">{alert.entityType}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-zinc-300 max-w-[250px] truncate" title={alert.reason}>
                        {alert.reason}
                      </td>
                      <td className="py-3 pr-4 text-zinc-500 text-xs">
                        {alert.rule?.name ?? <span className="text-zinc-700">—</span>}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <Badge
                          variant={STATUS_VARIANT[alert.status] ?? 'secondary'}
                          className="capitalize"
                        >
                          {alert.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-zinc-400 text-xs whitespace-nowrap">
                        {formatDate(alert.createdAt)}
                      </td>
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
