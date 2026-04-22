'use client'

import { use, useEffect, useState } from 'react'
import { TrendingUp, Plus, Save, ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ForecastLine {
  id: string
  forecastId: string
  productId: string | null
  productName: string | null
  sku: string | null
  categoryId: string | null
  forecastedQty: number
  actualQty: number | null
  variance: number | null
  confidencePct: number | null
  storeId: string | null
  storeName: string | null
}

interface Forecast {
  id: string
  forecastName: string
  period: string
  periodType: string
  status: string
  notes: string | null
  lines: ForecastLine[]
}

const statusBadge: Record<string, string> = {
  draft: 'text-zinc-300 bg-zinc-800 border-zinc-700',
  active: 'text-emerald-300 bg-emerald-950/50 border-emerald-700',
  archived: 'text-zinc-500 bg-zinc-900 border-zinc-800',
}

export default function ForecastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [loading, setLoading] = useState(true)
  const [actualInputs, setActualInputs] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [newLine, setNewLine] = useState({
    sku: '', productName: '', storeId: '', forecastedQty: '', confidencePct: '',
  })
  const [addingLine, setAddingLine] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/forecasting/forecasts/${id}`)
      const data = await res.json()
      setForecast(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function saveActuals() {
    if (!forecast) return
    setSaving(true)
    try {
      await Promise.all(
        Object.entries(actualInputs)
          .filter(([, v]) => v !== '')
          .map(([lineId, actualQty]) =>
            fetch(`/api/forecasting/forecasts/${id}/actuals`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lineId, actualQty: Number(actualQty) }),
            })
          )
      )
      setActualInputs({})
      load()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function addLine() {
    if (!newLine.forecastedQty) return
    setAddingLine(true)
    try {
      await fetch(`/api/forecasting/forecasts/${id}/lines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: newLine.sku || undefined,
          productName: newLine.productName || undefined,
          storeId: newLine.storeId || undefined,
          forecastedQty: Number(newLine.forecastedQty),
          confidencePct: newLine.confidencePct ? Number(newLine.confidencePct) : undefined,
        }),
      })
      setNewLine({ sku: '', productName: '', storeId: '', forecastedQty: '', confidencePct: '' })
      load()
    } catch (e) {
      console.error(e)
    } finally {
      setAddingLine(false)
    }
  }

  async function deleteLine(lineId: string) {
    await fetch(`/api/forecasting/forecasts/${id}/lines?lineId=${lineId}`, { method: 'DELETE' })
    load()
  }

  // Accuracy summary
  const linesWithActuals = forecast?.lines.filter((l) => l.actualQty !== null && l.forecastedQty > 0) ?? []
  const within10 = linesWithActuals.filter((l) => Math.abs((l.variance ?? 0) / l.forecastedQty) <= 0.1).length
  const within20 = linesWithActuals.filter((l) => {
    const p = Math.abs((l.variance ?? 0) / l.forecastedQty)
    return p > 0.1 && p <= 0.2
  }).length
  const over20 = linesWithActuals.filter((l) => Math.abs((l.variance ?? 0) / l.forecastedQty) > 0.2).length
  const total = linesWithActuals.length

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 p-6">
        <div className="space-y-4">
          <div className="h-8 w-64 bg-zinc-800 rounded animate-pulse" />
          <div className="h-64 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse" />
        </div>
      </div>
    )
  }

  if (!forecast) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 p-6 flex items-center justify-center text-zinc-500">
        Forecast not found.
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link
            href="/forecasting/forecasts"
            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forecasts
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            {forecast.forecastName}
          </h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-zinc-400 font-mono">{forecast.period}</span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full border', statusBadge[forecast.status] ?? statusBadge.draft)}>
              {forecast.status}
            </span>
            <span className="text-xs text-zinc-500 capitalize">{forecast.periodType}</span>
          </div>
          {forecast.notes && (
            <p className="text-zinc-400 text-sm">{forecast.notes}</p>
          )}
        </div>
        <button
          onClick={saveActuals}
          disabled={saving || Object.keys(actualInputs).length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Actuals'}
        </button>
      </div>

      {/* Accuracy Summary */}
      {total > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300">Accuracy Summary ({total} lines with actuals)</h2>
          <div className="space-y-2">
            {[
              { label: '± 10% (excellent)', count: within10, color: 'bg-emerald-500' },
              { label: '± 20% (acceptable)', count: within20, color: 'bg-amber-500' },
              { label: '> 20% (off)', count: over20, color: 'bg-red-500' },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 w-36 shrink-0">{row.label}</span>
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', row.color)}
                    style={{ width: total > 0 ? `${(row.count / total) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-xs text-zinc-400 w-8 text-right">{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lines Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-200">Forecast Lines</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">SKU</th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Store</th>
                <th className="text-right px-4 py-3">Forecast Qty</th>
                <th className="text-right px-4 py-3">Actual Qty</th>
                <th className="text-right px-4 py-3">Variance</th>
                <th className="text-right px-4 py-3">Confidence</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {forecast.lines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-zinc-500 py-8 text-sm">
                    No lines yet. Add a line below.
                  </td>
                </tr>
              ) : (
                forecast.lines.map((line) => {
                  const currentActual = actualInputs[line.id] ?? ''
                  const displayActual = currentActual !== '' ? currentActual : (line.actualQty?.toString() ?? '')
                  const variance = line.variance
                  return (
                    <tr key={line.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">{line.sku ?? '—'}</td>
                      <td className="px-4 py-3 text-zinc-200">{line.productName ?? '—'}</td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">{line.storeName ?? 'All'}</td>
                      <td className="px-4 py-3 text-right text-zinc-200 font-mono">
                        {line.forecastedQty.toFixed(0)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          value={displayActual}
                          onChange={(e) => setActualInputs({ ...actualInputs, [line.id]: e.target.value })}
                          placeholder="—"
                          className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-right text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm">
                        {variance !== null ? (
                          <span className={cn(variance >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                            {variance >= 0 ? '+' : ''}{variance.toFixed(0)}
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-400 text-xs">
                        {line.confidencePct !== null ? `${line.confidencePct}%` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteLine(line.id)}
                          className="text-zinc-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Line Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-400" />
          Add Forecast Line
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <input
            type="text"
            value={newLine.sku}
            onChange={(e) => setNewLine({ ...newLine, sku: e.target.value })}
            placeholder="SKU"
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            value={newLine.productName}
            onChange={(e) => setNewLine({ ...newLine, productName: e.target.value })}
            placeholder="Product Name"
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            value={newLine.storeId}
            onChange={(e) => setNewLine({ ...newLine, storeId: e.target.value })}
            placeholder="Store ID (optional)"
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
          />
          <input
            type="number"
            value={newLine.forecastedQty}
            onChange={(e) => setNewLine({ ...newLine, forecastedQty: e.target.value })}
            placeholder="Forecast Qty *"
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
          />
          <input
            type="number"
            value={newLine.confidencePct}
            onChange={(e) => setNewLine({ ...newLine, confidencePct: e.target.value })}
            placeholder="Confidence % (0-100)"
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={addLine}
          disabled={addingLine || !newLine.forecastedQty}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          {addingLine ? 'Adding…' : 'Add Line'}
        </button>
      </div>
    </div>
  )
}
