'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, CheckCircle2, Truck, Package, XCircle, RotateCcw } from 'lucide-react'

interface Orchestration {
  id: string
  state: string
  allocations: Array<{ id: string; isSelected: boolean; provider: { id: string; name: string } }>
}

export default function OrchestrationActions({ orchestration }: { orchestration: Orchestration }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const advance = async (toState: string, reason?: string) => {
    setLoading(toState)
    try {
      await fetch(`/api/iom/orchestrations/${orchestration.id}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toState, reason }),
      })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  const runOptimization = async () => {
    setLoading('optimize')
    try {
      await fetch(`/api/iom/orchestrations/${orchestration.id}/optimize`, { method: 'POST' })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  const selectProvider = async (providerId: string) => {
    setLoading(`alloc-${providerId}`)
    try {
      await fetch(`/api/iom/orchestrations/${orchestration.id}/allocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId }),
      })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  const { state } = orchestration

  return (
    <div className="flex flex-wrap gap-2">
      {state === 'received' && (
        <button
          onClick={() => advance('validated', 'Manual validation')}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs rounded-lg transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {loading === 'validated' ? 'Validating...' : 'Validate Order'}
        </button>
      )}

      {(state === 'validated' || state === 'received') && (
        <button
          onClick={runOptimization}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white text-xs rounded-lg transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          {loading === 'optimize' ? 'Running...' : 'Run Optimization'}
        </button>
      )}

      {state === 'optimizing' && orchestration.allocations.length > 0 && (
        <div className="flex gap-1">
          {orchestration.allocations.filter((a) => !a.isSelected).slice(0, 2).map((a) => (
            <button
              key={a.id}
              onClick={() => selectProvider(a.provider.id)}
              disabled={!!loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs rounded-lg transition-colors"
            >
              <Package className="w-3.5 h-3.5" />
              {loading === `alloc-${a.provider.id}` ? 'Selecting...' : `Select ${a.provider.name}`}
            </button>
          ))}
        </div>
      )}

      {state === 'allocated_to_provider' && (
        <button
          onClick={() => advance('in_fulfillment', 'Sent to fulfillment')}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs rounded-lg transition-colors"
        >
          <Package className="w-3.5 h-3.5" />
          {loading === 'in_fulfillment' ? 'Advancing...' : 'Advance to Fulfillment'}
        </button>
      )}

      {state === 'in_fulfillment' && (
        <button
          onClick={() => advance('shipped', 'Marked as shipped')}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white text-xs rounded-lg transition-colors"
        >
          <Truck className="w-3.5 h-3.5" />
          {loading === 'shipped' ? 'Marking...' : 'Mark Shipped'}
        </button>
      )}

      {state === 'shipped' && (
        <button
          onClick={() => advance('delivered', 'Delivery confirmed')}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs rounded-lg transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {loading === 'delivered' ? 'Marking...' : 'Mark Delivered'}
        </button>
      )}

      {state === 'delivered' && (
        <button
          onClick={() => window.location.href = `/iom/returns/new?orchestrationId=${orchestration.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-700 hover:bg-orange-600 text-white text-xs rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Initiate Return
        </button>
      )}

      {!['delivered', 'cancelled'].includes(state) && (
        <button
          onClick={() => advance('cancelled', 'Manually cancelled')}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-red-900/60 disabled:opacity-50 text-zinc-400 hover:text-red-400 text-xs rounded-lg transition-colors"
        >
          <XCircle className="w-3.5 h-3.5" />
          Cancel
        </button>
      )}
    </div>
  )
}
