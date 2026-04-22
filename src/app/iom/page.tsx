import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  Zap, GitBranch, Server, Filter, RotateCcw, Layers,
  FlaskConical, BarChart2, AlertTriangle, CheckCircle2,
  TrendingUp, Package, ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STATE_COLORS: Record<string, string> = {
  received: 'bg-zinc-700 text-zinc-200',
  validated: 'bg-blue-900/60 text-blue-300',
  optimizing: 'bg-purple-900/60 text-purple-300',
  allocated_to_provider: 'bg-indigo-900/60 text-indigo-300',
  in_fulfillment: 'bg-amber-900/60 text-amber-300',
  shipped: 'bg-cyan-900/60 text-cyan-300',
  delivered: 'bg-emerald-900/60 text-emerald-300',
  cancelled: 'bg-red-900/60 text-red-300',
  returned: 'bg-orange-900/60 text-orange-300',
}

const SOURCE_COLORS: Record<string, string> = {
  pos: 'bg-blue-900/50 text-blue-300',
  ecommerce: 'bg-purple-900/50 text-purple-300',
  call_center: 'bg-amber-900/50 text-amber-300',
  manual: 'bg-zinc-700 text-zinc-300',
  api: 'bg-emerald-900/50 text-emerald-300',
}

const PRIORITY_COLORS: Record<string, string> = {
  rush: 'bg-red-900/60 text-red-300',
  expedited: 'bg-amber-900/60 text-amber-300',
  standard: 'bg-zinc-700 text-zinc-400',
}

export default async function IOMDashboard() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [
    ordersToday,
    inFulfillment,
    deliveredToday,
    unresolvedErrors,
    activeProviders,
    recentOrchestrations,
    stateDist,
    allProviders,
    returnCount,
  ] = await Promise.all([
    prisma.orderOrchestration.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.orderOrchestration.count({ where: { state: 'in_fulfillment' } }),
    prisma.orderOrchestration.count({ where: { state: 'delivered', updatedAt: { gte: startOfDay } } }),
    prisma.orchestrationError.count({ where: { isResolved: false } }),
    prisma.fulfillmentProvider.count({ where: { isActive: true } }),
    prisma.orderOrchestration.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        customer: { select: { firstName: true, lastName: true } },
        _count: { select: { lines: true } },
      },
    }),
    prisma.orderOrchestration.groupBy({ by: ['state'], _count: { _all: true } }),
    prisma.fulfillmentProvider.findMany({
      where: { isActive: true },
      include: { instances: { orderBy: { createdAt: 'desc' }, take: 1 } },
    }),
    prisma.returnOrchestration.count(),
  ])

  const totalOrders = await prisma.orderOrchestration.count()
  const returnRate = totalOrders > 0 ? ((returnCount / totalOrders) * 100).toFixed(1) : '0.0'

  const PIPELINE = [
    'received', 'validated', 'optimizing', 'allocated_to_provider',
    'in_fulfillment', 'shipped', 'delivered',
  ]

  const stateMap: Record<string, number> = {}
  for (const s of stateDist) stateMap[s.state] = s._count._all

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" /> Intelligent Order Management
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">Order orchestration · fulfillment optimization · returns</p>
        </div>
        <Link
          href="/iom/orchestrations/new"
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <GitBranch className="w-3.5 h-3.5" /> New Order
        </Link>
      </div>

      {/* Error Alert */}
      {unresolvedErrors > 0 && (
        <div className="flex items-center gap-3 p-3 bg-red-950/60 border border-red-800/60 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-red-300 text-sm font-medium">
            {unresolvedErrors} unresolved error{unresolvedErrors !== 1 ? 's' : ''} in queue
          </span>
          <Link href="/iom/orchestrations?hasErrors=true" className="ml-auto text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
            View Errors <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* KPI Tiles — 4-col D365 flat style */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Orders Today', value: ordersToday, icon: Package, color: 'text-blue-400' },
          { label: 'In Fulfillment', value: inFulfillment, icon: TrendingUp, color: 'text-amber-400' },
          { label: 'Delivered Today', value: deliveredToday, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Error Queue', value: unresolvedErrors, icon: AlertTriangle, color: unresolvedErrors > 0 ? 'text-red-400' : 'text-zinc-500' },
          { label: 'Active Providers', value: activeProviders, icon: Server, color: 'text-purple-400' },
          { label: 'Return Rate', value: `${returnRate}%`, icon: RotateCcw, color: 'text-orange-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <p className="text-[11px] text-zinc-500 mb-1.5">{label}</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-zinc-100 tabular-nums">{value}</span>
              <Icon className={cn('w-3.5 h-3.5 mb-1', color)} />
            </div>
          </div>
        ))}
      </div>

      {/* State Pipeline — horizontal steps */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">Order State Pipeline</h2>
        <div className="flex items-center overflow-x-auto pb-1">
          {PIPELINE.map((state, i) => {
            const count = stateMap[state] ?? 0
            const isActive = count > 0
            return (
              <div key={state} className="flex items-center shrink-0">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
                      isActive
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-zinc-800/40 border-zinc-700 text-zinc-600'
                    )}
                  >
                    {count}
                  </div>
                  <span className="text-[9px] text-zinc-500 capitalize text-center leading-tight w-16">
                    {state.replace(/_/g, ' ')}
                  </span>
                </div>
                {i < PIPELINE.length - 1 && (
                  <div className="w-6 h-px bg-zinc-700 mx-1 mb-4 shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Provider Health */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-purple-400" /> Provider Health
            </h2>
            <Link href="/iom/providers" className="text-xs text-blue-400 hover:text-blue-300">View all</Link>
          </div>
          <div className="space-y-3">
            {allProviders.length === 0 && (
              <p className="text-xs text-zinc-500">No active providers. <Link href="/iom/providers/new" className="text-blue-400">Add one</Link></p>
            )}
            {allProviders.map((p) => {
              const inst = p.instances[0]
              const loadPct = p.maxCapacity ? Math.min((p.currentLoad / p.maxCapacity) * 100, 100) : 0
              const dotColor =
                inst?.status === 'active' ? 'bg-emerald-500' :
                inst?.status === 'error' ? 'bg-red-500' : 'bg-zinc-600'
              const barColor = loadPct > 80 ? 'bg-red-500' : loadPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
              return (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', dotColor)} />
                      <span className="text-[13px] font-medium text-zinc-300">{p.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{p.type}</span>
                    </div>
                    <span className="text-[11px] text-zinc-500 tabular-nums">{p.currentLoad}/{p.maxCapacity ?? '∞'}</span>
                  </div>
                  {p.maxCapacity && (
                    <div className="bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${loadPct}%` }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Orchestrations */}
        <div className="lg:col-span-2 bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5 text-blue-400" /> Recent Orchestrations
            </h2>
            <Link href="/iom/orchestrations" className="text-xs text-blue-400 hover:text-blue-300">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 text-[11px] text-zinc-500 font-medium">IOM #</th>
                  <th className="text-left py-2 text-[11px] text-zinc-500 font-medium">Source</th>
                  <th className="text-left py-2 text-[11px] text-zinc-500 font-medium">Customer</th>
                  <th className="text-right py-2 text-[11px] text-zinc-500 font-medium">Value</th>
                  <th className="text-left py-2 text-[11px] text-zinc-500 font-medium">Priority</th>
                  <th className="text-left py-2 text-[11px] text-zinc-500 font-medium">State</th>
                </tr>
              </thead>
              <tbody>
                {recentOrchestrations.map((o) => (
                  <tr key={o.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                    <td className="py-2">
                      <Link href={`/iom/orchestrations/${o.id}`} className="text-[13px] text-blue-400 hover:text-blue-300 font-mono">
                        {o.orchestrationNo}
                      </Link>
                    </td>
                    <td className="py-2">
                      <span className={cn('px-1.5 py-0.5 rounded text-[11px] font-medium', SOURCE_COLORS[o.sourceType] ?? 'bg-zinc-700 text-zinc-400')}>
                        {o.sourceType}
                      </span>
                    </td>
                    <td className="py-2 text-[13px] text-zinc-300">
                      {o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : '—'}
                    </td>
                    <td className="py-2 text-right text-[13px] text-zinc-300 tabular-nums">${o.orderValue.toFixed(2)}</td>
                    <td className="py-2">
                      <span className={cn('px-1.5 py-0.5 rounded text-[11px]', PRIORITY_COLORS[o.priority] ?? '')}>
                        {o.priority}
                      </span>
                    </td>
                    <td className="py-2">
                      <span className={cn('px-1.5 py-0.5 rounded text-[11px] capitalize', STATE_COLORS[o.state] ?? 'bg-zinc-700 text-zinc-400')}>
                        {o.state.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrchestrations.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-[13px] text-zinc-600">No orchestrations yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/iom/providers', icon: Server, label: 'Provider Network', color: 'text-purple-400' },
          { href: '/iom/policies', icon: Filter, label: 'Fulfillment Policies', color: 'text-amber-400' },
          { href: '/iom/simulations', icon: FlaskConical, label: 'AI Simulations', color: 'text-pink-400' },
          { href: '/iom/insights', icon: BarChart2, label: 'IOM Insights', color: 'text-emerald-400' },
        ].map(({ href, icon: Icon, label, color }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 p-4 bg-[#16213e] border border-zinc-800/50 rounded-lg hover:bg-zinc-800/40 transition-colors"
          >
            <Icon className={cn('w-4 h-4', color)} />
            <span className="text-[13px] text-zinc-300">{label}</span>
            <ArrowRight className="w-3 h-3 text-zinc-600 ml-auto" />
          </Link>
        ))}
      </div>
    </div>
  )
}
