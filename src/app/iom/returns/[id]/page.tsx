export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { RotateCcw, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReturnActions from './ReturnActions'

const STATE_COLORS: Record<string, string> = {
  initiated: 'bg-zinc-700 text-zinc-300',
  label_created: 'bg-blue-900/50 text-blue-300',
  in_transit: 'bg-amber-900/50 text-amber-300',
  received: 'bg-purple-900/50 text-purple-300',
  inspected: 'bg-indigo-900/50 text-indigo-300',
  refund_issued: 'bg-emerald-900/50 text-emerald-300',
  closed: 'bg-zinc-800 text-zinc-500',
}

export default async function ReturnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const ret = await prisma.returnOrchestration.findUnique({
    where: { id },
    include: {
      customer: true,
      orchestration: { select: { id: true, orchestrationNo: true } },
      returnProvider: true,
      lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
      stateHistory: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!ret) notFound()

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <RotateCcw className="w-5 h-5 text-orange-400" />
            <span className="font-mono text-lg font-bold text-zinc-100">{ret.returnNo}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn('px-3 py-1.5 rounded-full text-sm font-semibold capitalize', STATE_COLORS[ret.state] ?? 'bg-zinc-700 text-zinc-400')}>
              {ret.state.replace(/_/g, ' ')}
            </span>
            {ret.customer && <span className="text-sm text-zinc-400">{ret.customer.firstName} {ret.customer.lastName}</span>}
          </div>
        </div>
        <ReturnActions returnId={ret.id} currentState={ret.state} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-300">Return Details</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs text-zinc-500 mb-1">Reason</div><div className="text-zinc-300">{ret.reason ?? '—'}</div></div>
              <div><div className="text-xs text-zinc-500 mb-1">Refund Method</div><div className="text-zinc-300">{ret.refundMethod}</div></div>
              {ret.orchestration && (
                <div><div className="text-xs text-zinc-500 mb-1">Original Order</div>
                  <div className="text-blue-400 font-mono">{ret.orchestration.orchestrationNo}</div>
                </div>
              )}
              {ret.returnProvider && (
                <div><div className="text-xs text-zinc-500 mb-1">Return Provider</div><div className="text-zinc-300">{ret.returnProvider.name}</div></div>
              )}
              {ret.trackingNumber && (
                <div><div className="text-xs text-zinc-500 mb-1">Tracking #</div><div className="text-zinc-300 font-mono">{ret.trackingNumber}</div></div>
              )}
              {ret.labelUrl && (
                <div><div className="text-xs text-zinc-500 mb-1">Label</div>
                  <a href={ret.labelUrl} target="_blank" rel="noreferrer" className="text-blue-400 text-xs underline">Download Label</a>
                </div>
              )}
            </div>
          </div>

          {/* Lines */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4">Return Lines</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left pb-2 text-zinc-500 font-medium">Product</th>
                  <th className="text-center pb-2 text-zinc-500 font-medium">Qty</th>
                  <th className="text-left pb-2 text-zinc-500 font-medium">Condition</th>
                  <th className="text-left pb-2 text-zinc-500 font-medium">Disposition</th>
                </tr>
              </thead>
              <tbody>
                {ret.lines.map((line) => (
                  <tr key={line.id} className="border-b border-zinc-800/50">
                    <td className="py-2">
                      <div className="text-zinc-200">{line.product.name}</div>
                      <div className="text-xs text-zinc-500">{line.product.sku}</div>
                    </td>
                    <td className="py-2 text-center text-zinc-400">{line.quantity}</td>
                    <td className="py-2 text-zinc-400 capitalize">{line.condition}</td>
                    <td className="py-2 text-zinc-400 capitalize">{line.disposition.replace(/_/g, ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" /> Timeline
          </h2>
          <div className="space-y-4">
            {ret.stateHistory.map((h, i) => (
              <div key={h.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn('w-2.5 h-2.5 rounded-full mt-0.5', i === 0 ? 'bg-orange-500' : 'bg-zinc-600')} />
                  {i < ret.stateHistory.length - 1 && <div className="w-px flex-1 bg-zinc-700 mt-1" />}
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    {h.fromState && <span className="text-xs text-zinc-500">{h.fromState.replace(/_/g, ' ')} →</span>}
                    <span className="text-xs font-medium capitalize text-zinc-300">{h.toState.replace(/_/g, ' ')}</span>
                  </div>
                  {h.reason && <p className="text-xs text-zinc-500">{h.reason}</p>}
                  <p className="text-xs text-zinc-600">{new Date(h.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
