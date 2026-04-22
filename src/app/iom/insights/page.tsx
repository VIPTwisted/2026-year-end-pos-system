export const dynamic = 'force-dynamic'
import { BarChart2, TrendingUp, Package, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InsightsData {
  totalOrchestrated: { allTime: number; thisMonth: number }
  deliveredToday: number
  activeProviders: number
  unresolvedErrors: number
  avgFulfillmentDays: number
  onTimeRate: number
  stateDistribution: Array<{ state: string; count: number }>
  providerPerformance: Array<{ providerId: string; name: string; type: string; orders: number; avgCost: number; avgDays: number }>
  errorRate: number
  returnRate: number
}

async function fetchInsights(): Promise<InsightsData> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${base}/api/iom/insights`, { cache: 'no-store' })
  return res.json()
}

const STATE_ORDER = ['received', 'validated', 'optimizing', 'allocated_to_provider', 'in_fulfillment', 'shipped', 'delivered']

export default async function IOMInsightsPage() {
  let data: InsightsData
  try {
    data = await fetchInsights()
  } catch {
    data = {
      totalOrchestrated: { allTime: 0, thisMonth: 0 },
      deliveredToday: 0,
      activeProviders: 0,
      unresolvedErrors: 0,
      avgFulfillmentDays: 0,
      onTimeRate: 0,
      stateDistribution: [],
      providerPerformance: [],
      errorRate: 0,
      returnRate: 0,
    }
  }

  const stateMap: Record<string, number> = {}
  for (const s of data.stateDistribution) stateMap[s.state] = s.count

  const totalInFunnel = stateMap['received'] ?? 0
  const deliveredCount = stateMap['delivered'] ?? 0
  const conversionRate = totalInFunnel > 0 ? ((deliveredCount / data.totalOrchestrated.allTime) * 100).toFixed(1) : '0.0'

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-emerald-400" /> IOM Insights
      </h1>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'All-Time Orders', value: data.totalOrchestrated.allTime, icon: Package, color: 'text-blue-400' },
          { label: 'This Month', value: data.totalOrchestrated.thisMonth, icon: TrendingUp, color: 'text-purple-400' },
          { label: 'Avg Fulfill Days', value: `${data.avgFulfillmentDays}d`, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'On-Time Rate', value: `${data.onTimeRate}%`, icon: CheckCircle2, color: data.onTimeRate >= 90 ? 'text-emerald-400' : 'text-amber-400' },
          { label: 'Error Rate', value: `${data.errorRate}%`, icon: AlertTriangle, color: data.errorRate > 5 ? 'text-red-400' : 'text-zinc-400' },
          { label: 'Return Rate', value: `${data.returnRate}%`, icon: RotateCcw, color: 'text-orange-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Icon className={cn('w-3.5 h-3.5', color)} />
              <span className="text-xs text-zinc-500">{label}</span>
            </div>
            <div className="text-xl font-bold text-zinc-100">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State Funnel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Order State Funnel</h2>
          <div className="space-y-2">
            {STATE_ORDER.map((state, i) => {
              const count = stateMap[state] ?? 0
              const maxCount = Math.max(...STATE_ORDER.map((s) => stateMap[s] ?? 0), 1)
              const pct = (count / maxCount) * 100
              const prevState = i > 0 ? STATE_ORDER[i - 1] : null
              const prevCount = prevState ? (stateMap[prevState] ?? 0) : data.totalOrchestrated.allTime
              const dropOff = prevCount > 0 ? prevCount - count : 0

              return (
                <div key={state}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs capitalize text-zinc-400">{state.replace(/_/g, ' ')}</span>
                    <div className="flex items-center gap-3">
                      {dropOff > 0 && i > 0 && (
                        <span className="text-xs text-red-500">-{dropOff}</span>
                      )}
                      <span className="text-xs font-medium text-zinc-300">{count}</span>
                    </div>
                  </div>
                  <div className="h-5 bg-zinc-800 rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all bg-blue-600/70"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between text-xs text-zinc-500">
            <span>Received → Delivered conversion</span>
            <span className="font-medium text-zinc-300">{conversionRate}%</span>
          </div>
        </div>

        {/* Provider Performance */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Provider Performance</h2>
          {data.providerPerformance.length === 0 ? (
            <p className="text-sm text-zinc-500">No allocation data yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left pb-2 text-zinc-500 font-medium text-xs">Provider</th>
                  <th className="text-center pb-2 text-zinc-500 font-medium text-xs">Orders</th>
                  <th className="text-right pb-2 text-zinc-500 font-medium text-xs">Avg Cost</th>
                  <th className="text-right pb-2 text-zinc-500 font-medium text-xs">Avg Days</th>
                </tr>
              </thead>
              <tbody>
                {data.providerPerformance.sort((a, b) => b.orders - a.orders).map((p) => (
                  <tr key={p.providerId} className="border-b border-zinc-800/50">
                    <td className="py-2">
                      <div className="text-zinc-200 text-xs">{p.name}</div>
                      <div className="text-[10px] text-zinc-500">{p.type}</div>
                    </td>
                    <td className="py-2 text-center text-zinc-400 text-xs">{p.orders}</td>
                    <td className="py-2 text-right text-zinc-300 text-xs">${p.avgCost.toFixed(2)}</td>
                    <td className="py-2 text-right text-zinc-400 text-xs">{p.avgDays.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* State Distribution Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Current State Distribution</h2>
        <div className="flex items-end gap-3 h-32">
          {data.stateDistribution.map((s) => {
            const maxVal = Math.max(...data.stateDistribution.map((x) => x.count), 1)
            const heightPct = (s.count / maxVal) * 100
            const stateColors: Record<string, string> = {
              received: 'bg-zinc-600',
              validated: 'bg-blue-600',
              optimizing: 'bg-purple-600',
              allocated_to_provider: 'bg-indigo-600',
              in_fulfillment: 'bg-amber-600',
              shipped: 'bg-cyan-600',
              delivered: 'bg-emerald-600',
              cancelled: 'bg-red-600',
            }
            return (
              <div key={s.state} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs text-zinc-400">{s.count}</span>
                <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                  <div
                    className={cn('w-full rounded-t', stateColors[s.state] ?? 'bg-zinc-600')}
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                  />
                </div>
                <span className="text-[9px] text-zinc-500 text-center leading-tight capitalize">{s.state.replace(/_/g, ' ')}</span>
              </div>
            )
          })}
          {data.stateDistribution.length === 0 && (
            <div className="w-full text-center text-zinc-600 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">Fulfillment Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">On-Time Delivery</span>
              <span className={cn('font-medium', data.onTimeRate >= 90 ? 'text-emerald-400' : data.onTimeRate >= 70 ? 'text-amber-400' : 'text-red-400')}>
                {data.onTimeRate}%
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full', data.onTimeRate >= 90 ? 'bg-emerald-500' : 'bg-amber-500')} style={{ width: `${data.onTimeRate}%` }} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Avg Cycle Time</span>
              <span className="font-medium text-zinc-300">{data.avgFulfillmentDays} days</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">Error & Return Analysis</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Error Rate</span>
              <span className={cn('font-medium', data.errorRate > 5 ? 'text-red-400' : 'text-zinc-300')}>{data.errorRate}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Return Rate</span>
              <span className={cn('font-medium', data.returnRate > 10 ? 'text-orange-400' : 'text-zinc-300')}>{data.returnRate}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Unresolved Errors</span>
              <span className={cn('font-medium', data.unresolvedErrors > 0 ? 'text-red-400' : 'text-emerald-400')}>{data.unresolvedErrors}</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">Volume</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">All-Time Orders</span>
              <span className="font-medium text-zinc-300">{data.totalOrchestrated.allTime}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">This Month</span>
              <span className="font-medium text-zinc-300">{data.totalOrchestrated.thisMonth}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Active Providers</span>
              <span className="font-medium text-zinc-300">{data.activeProviders}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
