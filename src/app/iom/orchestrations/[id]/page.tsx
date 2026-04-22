export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { GitBranch, Clock, AlertTriangle, Package, CheckCircle2 } from 'lucide-react'
import OrchestrationActions from './OrchestrationActions'

const STATE_COLORS: Record<string, string> = {
  received: 'bg-zinc-700 text-zinc-200',
  validated: 'bg-blue-900/60 text-blue-300',
  optimizing: 'bg-purple-900/60 text-purple-300',
  allocated_to_provider: 'bg-indigo-900/60 text-indigo-300',
  in_fulfillment: 'bg-amber-900/60 text-amber-300',
  shipped: 'bg-cyan-900/60 text-cyan-300',
  delivered: 'bg-emerald-900/60 text-emerald-300',
  cancelled: 'bg-red-900/60 text-red-300',
}

const LINE_STATE_COLORS: Record<string, string> = {
  pending: 'text-zinc-400',
  allocated: 'text-blue-400',
  picking: 'text-amber-400',
  packed: 'text-purple-400',
  shipped: 'text-cyan-400',
  delivered: 'text-emerald-400',
  cancelled: 'text-red-400',
}

export default async function OrchestrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const orch = await prisma.orderOrchestration.findUnique({
    where: { id },
    include: {
      customer: true,
      lines: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
          allocatedProvider: { select: { id: true, name: true, type: true } },
        },
      },
      stateHistory: { orderBy: { createdAt: 'desc' } },
      allocations: {
        include: { provider: { select: { id: true, name: true, type: true, avgProcessingDays: true, costPerOrder: true } } },
        orderBy: { allocationScore: 'desc' },
      },
      errors: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!orch) notFound()

  const address = orch.shippingAddress as Record<string, string> | null

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <GitBranch className="w-5 h-5 text-blue-400" />
            <span className="font-mono text-lg font-bold text-zinc-100">{orch.orchestrationNo}</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400">{orch.sourceType}</span>
            <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold capitalize', orch.priority === 'rush' ? 'bg-red-900/60 text-red-300' : orch.priority === 'expedited' ? 'bg-amber-900/60 text-amber-300' : 'bg-zinc-700 text-zinc-400')}>
              {orch.priority}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn('px-3 py-1.5 rounded-full text-sm font-semibold capitalize', STATE_COLORS[orch.state] ?? 'bg-zinc-700 text-zinc-400')}>
              {orch.state.replace(/_/g, ' ')}
            </span>
            {orch.customer && (
              <span className="text-sm text-zinc-400">
                {orch.customer.firstName} {orch.customer.lastName}
              </span>
            )}
            <span className="text-sm text-zinc-500">${orch.orderValue.toFixed(2)}</span>
          </div>
        </div>
        <OrchestrationActions orchestration={orch} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lines */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-400" /> Order Lines
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left pb-2 text-zinc-500 font-medium">Product</th>
                  <th className="text-center pb-2 text-zinc-500 font-medium">Qty</th>
                  <th className="text-right pb-2 text-zinc-500 font-medium">Price</th>
                  <th className="text-right pb-2 text-zinc-500 font-medium">Total</th>
                  <th className="text-left pb-2 text-zinc-500 font-medium">State</th>
                  <th className="text-left pb-2 text-zinc-500 font-medium">Provider</th>
                </tr>
              </thead>
              <tbody>
                {orch.lines.map((line) => (
                  <tr key={line.id} className="border-b border-zinc-800/50">
                    <td className="py-2">
                      <div className="text-zinc-200 font-medium">{line.product.name}</div>
                      <div className="text-xs text-zinc-500">{line.product.sku}</div>
                    </td>
                    <td className="py-2 text-center text-zinc-400">{line.quantity}</td>
                    <td className="py-2 text-right text-zinc-400">${line.unitPrice.toFixed(2)}</td>
                    <td className="py-2 text-right text-zinc-300">${line.lineTotal.toFixed(2)}</td>
                    <td className="py-2">
                      <span className={cn('text-xs capitalize', LINE_STATE_COLORS[line.state] ?? 'text-zinc-400')}>
                        {line.state}
                      </span>
                    </td>
                    <td className="py-2 text-xs text-zinc-400">
                      {line.allocatedProvider ? (
                        <div>
                          <div className="text-zinc-300">{line.allocatedProvider.name}</div>
                          <div className="text-zinc-600">{line.allocatedProvider.type}</div>
                        </div>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Optimization / Allocations */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4">Fulfillment Optimization</h2>
            {orch.allocations.length === 0 ? (
              <p className="text-sm text-zinc-500">No optimization run yet. Use &quot;Run Optimization&quot; to score providers.</p>
            ) : (
              <div className="space-y-3">
                {orch.allocations.map((a) => (
                  <div
                    key={a.id}
                    className={cn(
                      'border rounded-lg p-4 transition-colors',
                      a.isSelected ? 'border-blue-600 bg-blue-950/20' : 'border-zinc-800 bg-zinc-800/30'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {a.isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                        <span className="font-medium text-zinc-200">{a.provider.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-400">{a.provider.type}</span>
                      </div>
                      <span className="text-sm font-bold text-zinc-100">{a.allocationScore.toFixed(0)}/100</span>
                    </div>
                    <div className="h-2 bg-zinc-700 rounded-full mb-2">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${a.allocationScore}%` }}
                      />
                    </div>
                    <div className="flex gap-4 text-xs text-zinc-400">
                      <span>Cost: ${a.costEstimate.toFixed(2)}</span>
                      <span>Days: {a.daysEstimate}</span>
                    </div>
                    {Array.isArray(a.reasons) && (a.reasons as string[]).length > 0 && (
                      <div className="mt-2 text-xs text-zinc-500">
                        {(a.reasons as string[]).map((r, i) => <div key={i}>{r}</div>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Errors */}
          {orch.errors.length > 0 && (
            <div className="bg-zinc-900 border border-red-900/50 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Errors ({orch.errors.filter((e) => !e.isResolved).length} unresolved)
              </h2>
              <div className="space-y-3">
                {orch.errors.map((err) => (
                  <div key={err.id} className={cn('border rounded-lg p-3', err.isResolved ? 'border-zinc-800 opacity-50' : 'border-red-900/50 bg-red-950/10')}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs text-red-400">{err.errorCode}</span>
                      <span className="text-xs text-zinc-500">Retry {err.retryCount}/{err.maxRetries}</span>
                    </div>
                    <p className="text-sm text-zinc-300">{err.errorMessage}</p>
                    {err.step && <p className="text-xs text-zinc-500 mt-1">Step: {err.step}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column - Timeline + Meta */}
        <div className="space-y-6">
          {/* Meta */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Details</h2>
            {address && (
              <div>
                <div className="text-xs text-zinc-500 mb-1">Ship To</div>
                <div className="text-sm text-zinc-300">
                  {address.street && <div>{address.street}</div>}
                  {(address.city || address.state || address.zip) && (
                    <div>{[address.city, address.state, address.zip].filter(Boolean).join(', ')}</div>
                  )}
                  {address.country && <div>{address.country}</div>}
                </div>
              </div>
            )}
            {orch.promisedDate && (
              <div>
                <div className="text-xs text-zinc-500 mb-1">Promised Date</div>
                <div className="text-sm text-zinc-300">{new Date(orch.promisedDate).toLocaleDateString()}</div>
              </div>
            )}
            {orch.notes && (
              <div>
                <div className="text-xs text-zinc-500 mb-1">Notes</div>
                <div className="text-sm text-zinc-300">{orch.notes}</div>
              </div>
            )}
            <div>
              <div className="text-xs text-zinc-500 mb-1">Created</div>
              <div className="text-sm text-zinc-300">{new Date(orch.createdAt).toLocaleString()}</div>
            </div>
          </div>

          {/* State Timeline */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Timeline
            </h2>
            <div className="space-y-4">
              {orch.stateHistory.map((h, i) => (
                <div key={h.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn('w-2.5 h-2.5 rounded-full mt-0.5', i === 0 ? 'bg-blue-500' : 'bg-zinc-600')} />
                    {i < orch.stateHistory.length - 1 && <div className="w-px flex-1 bg-zinc-700 mt-1" />}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2 mb-0.5">
                      {h.fromState && (
                        <span className="text-xs text-zinc-500">{h.fromState.replace(/_/g, ' ')} →</span>
                      )}
                      <span className={cn('text-xs font-medium capitalize', STATE_COLORS[h.toState] ? STATE_COLORS[h.toState].split(' ')[1] : 'text-zinc-300')}>
                        {h.toState.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {h.reason && <p className="text-xs text-zinc-500">{h.reason}</p>}
                    {h.triggeredBy && <p className="text-xs text-zinc-600">{h.triggeredBy}</p>}
                    <p className="text-xs text-zinc-600">{new Date(h.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
