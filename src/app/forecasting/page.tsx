'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  BarChart2,
  Package,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  RefreshCw,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Metrics {
  activeForecastCount: number
  avgForecastAccuracy: number
  pendingSuggestions: number
  criticalSuggestions: number
  unresolvedTriggers: number
  safetyRulesActive: number
}

interface Suggestion {
  id: string
  productName: string | null
  sku: string | null
  storeName: string | null
  suggestedQty: number
  urgency: string
  status: string
  createdAt: string
}

interface Trigger {
  id: string
  productName: string | null
  sku: string | null
  triggerType: string
  stockAtTrigger: number
  reorderPoint: number
  triggeredAt: string
  resolved: boolean
}

const urgencyColor: Record<string, string> = {
  critical: 'text-red-400 bg-red-950/40 border-red-800',
  high: 'text-orange-400 bg-orange-950/40 border-orange-800',
  normal: 'text-blue-400 bg-blue-950/40 border-blue-800',
  low: 'text-zinc-400 bg-zinc-800/40 border-zinc-700',
}

const triggerTypeBadge: Record<string, string> = {
  safety_stock: 'text-orange-400 bg-orange-950/40',
  forecast_demand: 'text-blue-400 bg-blue-950/40',
  manual: 'text-zinc-300 bg-zinc-800/40',
}

export default function ForecastingHubPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [triggers, setTriggers] = useState<Trigger[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const [mRes, sRes, tRes] = await Promise.all([
        fetch('/api/forecasting/metrics'),
        fetch('/api/forecasting/suggestions?status=pending'),
        fetch('/api/forecasting/triggers?resolved=false'),
      ])
      const [m, s, t] = await Promise.all([mRes.json(), sRes.json(), tRes.json()])
      setMetrics(m)
      setSuggestions(Array.isArray(s) ? s.slice(0, 8) : [])
      setTriggers(Array.isArray(t) ? t.slice(0, 8) : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const kpis = metrics
    ? [
        {
          label: 'Active Forecasts',
          value: metrics.activeForecastCount,
          icon: TrendingUp,
          color: 'text-blue-400',
          bg: 'bg-blue-950/30',
        },
        {
          label: 'Avg Accuracy',
          value: `${metrics.avgForecastAccuracy}%`,
          icon: BarChart2,
          color: 'text-emerald-400',
          bg: 'bg-emerald-950/30',
        },
        {
          label: 'Pending Replenishment',
          value: metrics.pendingSuggestions,
          icon: Package,
          color: 'text-amber-400',
          bg: 'bg-amber-950/30',
        },
        {
          label: 'Critical Alerts',
          value: metrics.criticalSuggestions,
          icon: AlertTriangle,
          color: metrics.criticalSuggestions > 0 ? 'text-red-400' : 'text-zinc-400',
          bg: metrics.criticalSuggestions > 0 ? 'bg-red-950/30' : 'bg-zinc-800/30',
        },
        {
          label: 'Safety Rules Active',
          value: metrics.safetyRulesActive,
          icon: CheckCircle,
          color: 'text-purple-400',
          bg: 'bg-purple-950/30',
        },
      ]
    : []

  const quickLinks = [
    { href: '/forecasting/forecasts', label: 'Demand Forecasts', icon: TrendingUp, desc: 'Create & manage period forecasts' },
    { href: '/forecasting/safety-stock', label: 'Safety Stock Rules', icon: Zap, desc: 'Min/max & reorder rules' },
    { href: '/forecasting/suggestions', label: 'Replenishment', icon: Package, desc: 'Review & approve suggestions' },
    { href: '/forecasting/triggers', label: 'Reorder Triggers', icon: Activity, desc: 'Live trigger feed' },
  ]

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            Demand Forecasting & Replenishment
          </h1>
          <p className="text-zinc-400 text-sm mt-1">D365-class inventory intelligence</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:text-zinc-100 hover:border-zinc-600 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-zinc-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className={cn('rounded-xl border border-zinc-800 p-4', k.bg)}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-400">{k.label}</span>
                <k.icon className={cn('w-4 h-4', k.color)} />
              </div>
              <div className={cn('text-2xl font-bold', k.color)}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-600 hover:bg-zinc-800/50 transition-all group"
          >
            <l.icon className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100">{l.label}</div>
              <div className="text-xs text-zinc-500 truncate">{l.desc}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 ml-auto shrink-0" />
          </Link>
        ))}
      </div>

      {/* Two column: suggestions + triggers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Suggestions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              Pending Replenishment
            </h2>
            <Link href="/forecasting/suggestions" className="text-xs text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </div>
          <div className="divide-y divide-zinc-800">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 mx-4 my-2 bg-zinc-800/50 rounded animate-pulse" />
              ))
            ) : suggestions.length === 0 ? (
              <div className="text-center text-zinc-500 text-sm py-8">No pending suggestions</div>
            ) : (
              suggestions.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 border-l-2',
                    s.urgency === 'critical'
                      ? 'border-l-red-500'
                      : s.urgency === 'high'
                      ? 'border-l-orange-500'
                      : 'border-l-transparent'
                  )}
                >
                  <div className="min-w-0">
                    <div className="text-sm text-zinc-200 truncate">{s.productName ?? s.sku ?? 'Unknown'}</div>
                    <div className="text-xs text-zinc-500">{s.storeName ?? 'All stores'} · Qty: {s.suggestedQty}</div>
                  </div>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full border',
                      urgencyColor[s.urgency] ?? urgencyColor.normal
                    )}
                  >
                    {s.urgency}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Unresolved Triggers */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-yellow-400" />
              Unresolved Triggers
            </h2>
            <Link href="/forecasting/triggers" className="text-xs text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </div>
          <div className="divide-y divide-zinc-800">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 mx-4 my-2 bg-zinc-800/50 rounded animate-pulse" />
              ))
            ) : triggers.length === 0 ? (
              <div className="text-center text-zinc-500 text-sm py-8">No unresolved triggers</div>
            ) : (
              triggers.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3 border-l-2 border-l-yellow-500/60">
                  <div className="min-w-0">
                    <div className="text-sm text-zinc-200 truncate">{t.productName ?? t.sku ?? 'Unknown'}</div>
                    <div className="text-xs text-zinc-500">
                      Stock: {t.stockAtTrigger} / Reorder: {t.reorderPoint}
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      triggerTypeBadge[t.triggerType] ?? 'text-zinc-300 bg-zinc-800'
                    )}
                  >
                    {t.triggerType.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
