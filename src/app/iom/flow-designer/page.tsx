import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { GitBranch, Plus, CheckCircle, Clock, Activity, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TopBar } from '@/components/layout/TopBar'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  active:   'bg-emerald-900/60 text-emerald-300',
  draft:    'bg-zinc-700 text-zinc-300',
  inactive: 'bg-red-900/60 text-red-300',
}

const TRIGGER_LABELS: Record<string, string> = {
  order_created:   'Order Created',
  order_updated:   'Order Updated',
  inventory_low:   'Inventory Low',
  manual:          'Manual',
}

export default async function FlowDesignerPage() {
  const flows = await prisma.orchestrationFlow.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { runs: true } },
      runs: {
        orderBy: { startedAt: 'desc' },
        take: 1,
        select: { startedAt: true, status: true },
      },
    },
  })

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)

  const allRuns = await prisma.orchestrationFlowRun.findMany({
    where: { startedAt: { gte: todayStart } },
    select: { status: true, startedAt: true, endedAt: true },
  })

  const activeFlows = flows.filter(f => f.status === 'active').length
  const runsToday = allRuns.length
  const completedToday = allRuns.filter(r => r.status === 'completed').length
  const successRate = runsToday > 0 ? Math.round((completedToday / runsToday) * 100) : 0
  const durations = allRuns
    .filter(r => r.endedAt)
    .map(r => (new Date(r.endedAt!).getTime() - new Date(r.startedAt).getTime()) / 1000)
  const avgRunTime = durations.length > 0 ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1) : '—'

  const kpis = [
    { label: 'Active Flows', value: activeFlows, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Runs Today', value: runsToday, icon: Activity, color: 'text-blue-400' },
    { label: 'Success Rate', value: `${successRate}%`, icon: Zap, color: 'text-amber-400' },
    { label: 'Avg Run Time', value: avgRunTime === '—' ? '—' : `${avgRunTime}s`, icon: Clock, color: 'text-purple-400' },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Flow Designer"
        breadcrumb={[{ label: 'IOM', href: '/iom' }]}
        actions={
          <Link
            href="/iom/flow-designer/new"
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> New Flow
          </Link>
        }
      />

      <div className="p-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 flex items-center gap-3">
              <Icon className={cn('w-8 h-8', color)} />
              <div>
                <div className="text-2xl font-bold text-zinc-100">{value}</div>
                <div className="text-xs text-zinc-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-zinc-800">
              <tr>
                {['Name', 'Status', 'Trigger', 'Version', 'Last Run', 'Runs Today'].map((h) => (
                  <th key={h} className="py-3 px-4 text-left text-[11px] text-zinc-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {flows.map((flow) => {
                const lastRun = flow.runs[0]
                const flowRunsToday = allRuns.length // simplified; in prod would filter per flowId
                return (
                  <tr key={flow.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                    <td className="py-2.5 px-4">
                      <Link href={`/iom/flow-designer/${flow.id}`} className="text-[13px] text-blue-400 hover:text-blue-300 flex items-center gap-2">
                        <GitBranch className="w-3.5 h-3.5" /> {flow.name}
                      </Link>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={cn('px-2 py-0.5 rounded text-[11px] capitalize font-medium', STATUS_COLORS[flow.status] ?? 'bg-zinc-700 text-zinc-400')}>
                        {flow.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[13px] text-zinc-300">{TRIGGER_LABELS[flow.triggerType] ?? flow.triggerType}</td>
                    <td className="py-2.5 px-4 text-[13px] text-zinc-400 tabular-nums">v{flow.version}</td>
                    <td className="py-2.5 px-4 text-[13px] text-zinc-500">
                      {lastRun ? new Date(lastRun.startedAt).toLocaleDateString() : <span className="text-zinc-700">Never</span>}
                    </td>
                    <td className="py-2.5 px-4 text-[13px] text-zinc-400 tabular-nums">{flow._count.runs}</td>
                  </tr>
                )
              })}
              {flows.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-[13px] text-zinc-600">No flows yet — create one to get started</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
