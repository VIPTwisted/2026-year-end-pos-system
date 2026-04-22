export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, ShieldAlert, Plus, AlertTriangle } from 'lucide-react'

const SEVERITY_VARIANT: Record<string, 'destructive' | 'warning' | 'default' | 'secondary'> = {
  critical: 'destructive',
  high:     'warning',
  medium:   'default',
  low:      'secondary',
}

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'secondary' | 'default' | 'destructive'> = {
  open:      'warning',
  confirmed: 'destructive',
  reviewed:  'default',
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

  const activeRules   = rules.filter(r => r.isActive).length
  const openAlerts    = alerts.filter(a => a.status === 'open').length
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length

  return (
    <>
      <TopBar title="Fraud Protection" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Settings</p>
              <h2 className="text-[18px] font-semibold text-zinc-100 leading-tight">Fraud Protection</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">Detection rules and alert management</p>
            </div>
            <Link href="/settings/fraud/new">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add Rule
              </Button>
            </Link>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Rules',     value: rules.length.toString(),      icon: Shield,      color: 'text-zinc-100' },
              { label: 'Active Rules',    value: activeRules.toString(),        icon: Shield,      color: 'text-emerald-400' },
              { label: 'Open Alerts',     value: openAlerts.toString(),         icon: AlertTriangle, color: 'text-amber-400' },
              { label: 'Critical Alerts', value: criticalAlerts.toString(),     icon: ShieldAlert, color: 'text-red-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
                </div>
                <p className={`text-[22px] font-bold tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Section divider — Fraud Rules */}
          <div className="flex items-center gap-3">
            <Shield className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">Fraud Rules</span>
            <span className="text-[10px] text-zinc-600">({rules.length} configured)</span>
            <div className="flex-1 h-px bg-zinc-800/60" />
          </div>

          {/* Rules table */}
          {rules.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16 text-zinc-600">
              <Shield className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-[14px] font-medium text-zinc-400 mb-2">No fraud rules</p>
              <p className="text-[12px] mb-4">Add rules to start detecting suspicious activity</p>
              <Link href="/settings/fraud/new">
                <Button size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" />Add Rule</Button>
              </Link>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Name', 'Rule Type', 'Threshold', 'Action', 'Alerts', 'Status'].map(h => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium ${
                            ['Threshold', 'Alerts'].includes(h) ? 'text-right' : h === 'Status' || h === 'Action' ? 'text-center' : 'text-left'
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {rules.map(rule => (
                      <tr key={rule.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 text-[13px] font-medium text-zinc-100">{rule.name}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[11px] font-mono">{rule.ruleType}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-[13px] text-zinc-400 tabular-nums">
                          {rule.threshold != null ? rule.threshold.toLocaleString() : <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            variant={rule.action === 'block' ? 'destructive' : rule.action === 'review' ? 'warning' : 'default'}
                            className="capitalize text-[11px]"
                          >
                            {rule.action}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Badge variant="outline" className="text-[11px] font-mono">{rule._count.alerts}</Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
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
            </div>
          )}

          {/* Section divider — Alerts */}
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">Recent Alerts</span>
            <span className="text-[10px] text-zinc-600">(last 50)</span>
            <div className="flex-1 h-px bg-zinc-800/60" />
          </div>

          {/* Alerts table */}
          {alerts.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex items-center justify-center py-10">
              <p className="text-[12px] text-zinc-600">No fraud alerts — system is clean</p>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Severity', 'Entity Type', 'Reason', 'Rule', 'Status', 'Created'].map(h => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium ${
                            h === 'Severity' || h === 'Status' ? 'text-center' : 'text-left'
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {alerts.map(alert => (
                      <tr key={alert.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 text-center">
                          <Badge variant={SEVERITY_VARIANT[alert.severity] ?? 'secondary'} className="capitalize text-[11px]">
                            {alert.severity}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[11px] font-mono">{alert.entityType}</Badge>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-zinc-300 max-w-[250px] truncate" title={alert.reason}>
                          {alert.reason}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-zinc-500">
                          {alert.rule?.name ?? <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={STATUS_VARIANT[alert.status] ?? 'secondary'} className="capitalize text-[11px]">
                            {alert.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-zinc-500 whitespace-nowrap">
                          {formatDate(alert.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
