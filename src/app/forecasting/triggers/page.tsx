'use client'

import { useEffect, useState } from 'react'
import { Activity, RefreshCw, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReorderTrigger {
  id: string
  productId: string | null
  productName: string | null
  sku: string | null
  storeId: string | null
  triggerType: string
  stockAtTrigger: number
  reorderPoint: number
  triggeredAt: string
  resolved: boolean
  resolvedAt: string | null
}

const triggerTypeBadge: Record<string, string> = {
  safety_stock: 'text-orange-300 bg-orange-950/40 border-orange-700',
  forecast_demand: 'text-blue-300 bg-blue-950/40 border-blue-700',
  manual: 'text-zinc-300 bg-zinc-800 border-zinc-700',
}

type FilterTab = 'All' | 'Unresolved' | 'Resolved'
const filterTabs: FilterTab[] = ['All', 'Unresolved', 'Resolved']

export default function TriggersPage() {
  const [filter, setFilter] = useState<FilterTab>('All')
  const [triggers, setTriggers] = useState<ReorderTrigger[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter === 'Unresolved') params.set('resolved', 'false')
      if (filter === 'Resolved') params.set('resolved', 'true')
      const res = await fetch(`/api/forecasting/triggers?${params}`)
      const data = await res.json()
      setTriggers(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [filter])

  async function resolve(id: string) {
    await fetch(`/api/forecasting/triggers/${id}/resolve`, { method: 'POST' })
    load()
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-yellow-400" />
            Reorder Triggers
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Live feed — auto-refreshes every 30 seconds</p>
        </div>
        <button
          onClick={load}
          className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg w-fit border border-zinc-800">
        {filterTabs.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              filter === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">SKU</th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Store</th>
                <th className="text-left px-4 py-3">Trigger Type</th>
                <th className="text-center px-4 py-3">Stock at Trigger</th>
                <th className="text-center px-4 py-3">Reorder Point</th>
                <th className="text-left px-4 py-3">Triggered At</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-zinc-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : triggers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-zinc-500 py-12">
                    No triggers found.
                  </td>
                </tr>
              ) : (
                triggers.map((t) => (
                  <tr
                    key={t.id}
                    className={cn(
                      'border-l-2 transition-colors hover:bg-zinc-800/30',
                      !t.resolved
                        ? 'border-l-yellow-500/60 animate-[pulse_3s_ease-in-out_infinite]'
                        : 'border-l-transparent opacity-60'
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{t.sku ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-200">{t.productName ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{t.storeId ?? 'All'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full border',
                          triggerTypeBadge[t.triggerType] ?? 'text-zinc-300 bg-zinc-800 border-zinc-700'
                        )}
                      >
                        {t.triggerType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-red-400 font-mono text-sm font-semibold">{t.stockAtTrigger}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-400 font-mono text-sm">{t.reorderPoint}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {new Date(t.triggeredAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {t.resolved ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle className="w-3 h-3" />
                          Resolved
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-yellow-400">
                          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!t.resolved && (
                        <button
                          onClick={() => resolve(t.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-emerald-950/50 border border-emerald-800 rounded text-emerald-300 text-xs hover:bg-emerald-900/50 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
