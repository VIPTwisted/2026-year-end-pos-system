import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { GitBranch, CheckCircle2, XCircle, SkipForward, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import FlowDetailActions from './FlowDetailActions'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  active:   'bg-emerald-900/60 text-emerald-300',
  draft:    'bg-zinc-700 text-zinc-300',
  inactive: 'bg-red-900/60 text-red-300',
}

const RUN_COLORS: Record<string, string> = {
  running:   'bg-blue-900/60 text-blue-300',
  completed: 'bg-emerald-900/60 text-emerald-300',
  failed:    'bg-red-900/60 text-red-300',
  skipped:   'bg-zinc-700 text-zinc-400',
}

const RUN_ICONS: Record<string, React.ElementType> = {
  running: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
  skipped: SkipForward,
}

const STEP_TYPE_LABELS: Record<string, string> = {
  route_to_warehouse: 'Route to Warehouse',
  check_inventory: 'Check Inventory',
  reserve_inventory: 'Reserve Inventory',
  assign_carrier: 'Assign Carrier',
  send_notification: 'Send Notification',
  split_order: 'Split Order',
  wait: 'Wait',
  custom: 'Custom',
}

export default async function FlowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const flow = await prisma.orchestrationFlow.findUnique({
    where: { id },
    include: {
      runs: {
        orderBy: { startedAt: 'desc' },
        take: 20,
      },
    },
  })
  if (!flow) notFound()

  let steps: Array<{ id: string; type: string; label: string }> = []
  try { steps = flow.stepsJson ? JSON.parse(flow.stepsJson) : [] } catch {}

  let conditions: Array<{ field: string; operator: string; value: string }> = []
  try { conditions = flow.conditionsJson ? JSON.parse(flow.conditionsJson) : [] } catch {}

  const TRIGGER_LABELS: Record<string, string> = {
    order_created: 'Order Created',
    order_updated: 'Order Updated',
    inventory_low: 'Inventory Low',
    manual: 'Manual',
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title={flow.name}
        breadcrumb={[
          { label: 'IOM', href: '/iom' },
          { label: 'Flow Designer', href: '/iom/flow-designer' },
        ]}
        actions={<FlowDetailActions flowId={flow.id} status={flow.status} />}
      />

      <div className="p-6 grid grid-cols-3 gap-5">
        {/* Left: Flow info + steps */}
        <div className="col-span-2 space-y-5">
          {/* Header card */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-3">
              <GitBranch className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-semibold text-zinc-100">{flow.name}</h2>
              <span className={cn('px-2 py-0.5 rounded text-[11px] capitalize font-medium ml-auto', STATUS_COLORS[flow.status] ?? '')}>
                {flow.status}
              </span>
            </div>
            {flow.description && <p className="text-sm text-zinc-400">{flow.description}</p>}
            <div className="flex gap-6 text-xs text-zinc-500">
              <span>Trigger: <span className="text-zinc-300">{TRIGGER_LABELS[flow.triggerType] ?? flow.triggerType}</span></span>
              <span>Version: <span className="text-zinc-300">v{flow.version}</span></span>
              <span>Created: <span className="text-zinc-300">{new Date(flow.createdAt).toLocaleDateString()}</span></span>
              <span>Total Runs: <span className="text-zinc-300">{flow.runs.length}</span></span>
            </div>
          </div>

          {/* Visual step timeline */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">Flow Steps</h3>
            {steps.length === 0 ? (
              <p className="text-sm text-zinc-600">No steps defined</p>
            ) : (
              <div className="space-y-0">
                {steps.map((step, idx) => (
                  <div key={step.id ?? idx} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-600/40 flex items-center justify-center text-blue-400 text-[11px] font-bold shrink-0">
                        {idx + 1}
                      </div>
                      {idx < steps.length - 1 && <div className="w-px h-8 bg-zinc-700/60 mt-1" />}
                    </div>
                    <div className={cn('flex-1 bg-zinc-900/60 border border-zinc-700/50 rounded-lg p-3 mb-2', idx < steps.length - 1 ? 'mb-0 mt-0' : '')}>
                      <div className="text-sm font-medium text-zinc-200">{step.label}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">{STEP_TYPE_LABELS[step.type] ?? step.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conditions */}
          {conditions.length > 0 && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">Conditions</h3>
              <div className="space-y-2">
                {conditions.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className={cn('text-[11px] font-semibold uppercase w-8', i === 0 ? 'text-zinc-500' : 'text-amber-500')}>
                      {i === 0 ? 'IF' : 'AND'}
                    </span>
                    <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300 text-[12px]">{c.field.replace(/_/g, ' ')}</span>
                    <span className="text-zinc-500 text-[12px]">{c.operator.replace(/_/g, ' ')}</span>
                    <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300 text-[12px]">{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Recent runs */}
        <div className="space-y-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">Recent Runs</h3>
            {flow.runs.length === 0 ? (
              <p className="text-sm text-zinc-600">No runs yet</p>
            ) : (
              <div className="space-y-2">
                {flow.runs.map((run) => {
                  const Icon = RUN_ICONS[run.status] ?? Loader2
                  const duration = run.endedAt
                    ? `${((new Date(run.endedAt).getTime() - new Date(run.startedAt).getTime()) / 1000).toFixed(1)}s`
                    : 'Running…'
                  return (
                    <div key={run.id} className="flex items-start gap-2 py-2 border-b border-zinc-800/40 last:border-0">
                      <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', run.status === 'completed' ? 'text-emerald-400' : run.status === 'failed' ? 'text-red-400' : 'text-blue-400')} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', RUN_COLORS[run.status] ?? 'bg-zinc-700 text-zinc-400')}>
                            {run.status}
                          </span>
                          <span className="text-[11px] text-zinc-600">{duration}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">{new Date(run.startedAt).toLocaleString()}</div>
                        {run.orderId && <div className="text-[11px] text-zinc-600 mt-0.5">Order: {run.orderId}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
