'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type Project = {
  id: string
  projectNo: string
  description: string
  contractAmount: number
  budgetAmount: number
  status: string
}

type EVMetrics = {
  bac: number
  ev: number
  pv: number
  actualCost: number
  cpi: number
  spi: number
  eac: number
  etc: number
  vac: number
  percentComplete: number
}

type CategoryLine = {
  type: string
  budget: number
  actual: number
  variance: number
  variancePct: number
  remaining: number
  eac: number
}

type ForecastData = {
  project: Project
  metrics: EVMetrics
  categories: CategoryLine[]
}

const TYPE_LABELS: Record<string, string> = {
  time: 'Time / Labor',
  expense: 'Expenses',
  material: 'Materials',
  cost: 'Cost',
  revenue: 'Revenue',
}

function MetricCard({
  label, value, sub, color, warn,
}: {
  label: string
  value: string
  sub?: string
  color?: string
  warn?: boolean
}) {
  return (
    <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-lg font-bold ${color ?? 'text-zinc-100'} flex items-center gap-1.5`}>
        {value}
        {warn && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
      </p>
      {sub && <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function ProjectForecastsPage() {
  const params = useParams<{ id: string }>()
  const projectId = params.id

  const [data, setData] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/projects/${projectId}/forecasts`)
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then((d: ForecastData) => setData(d))
      .catch(() => setError('Failed to load forecast data.'))
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) {
    return (
      <>
        <TopBar title="Project Forecasts" />
        <main className="flex-1 p-6"><p className="text-xs text-zinc-600">Loading forecasts…</p></main>
      </>
    )
  }
  if (error || !data) {
    return (
      <>
        <TopBar title="Project Forecasts" />
        <main className="flex-1 p-6">
          <p className="text-xs text-red-400">{error || 'No data'}</p>
          <Link href={`/projects/${projectId}`} className="text-xs text-blue-400 hover:underline mt-2 block">← Back to Project</Link>
        </main>
      </>
    )
  }

  const { project, metrics, categories } = data
  const cpiColor = metrics.cpi >= 1 ? 'text-emerald-400' : metrics.cpi >= 0.8 ? 'text-amber-400' : 'text-red-400'
  const spiColor = metrics.spi >= 1 ? 'text-emerald-400' : metrics.spi >= 0.8 ? 'text-amber-400' : 'text-red-400'
  const vacColor = metrics.vac >= 0 ? 'text-emerald-400' : 'text-red-400'

  return (
    <>
      <TopBar title={`Forecasts — ${project.projectNo}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="flex items-center justify-between">
          <Link href={`/projects/${projectId}`} className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Project
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-200">{project.description}</span>
            <Badge variant="secondary" className="text-xs capitalize">{project.status}</Badge>
          </div>
        </div>

        {/* Progress overview */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
              <span className="font-medium text-zinc-300">Overall Completion — {metrics.percentComplete}%</span>
              <span>{formatCurrency(metrics.actualCost)} actual / {formatCurrency(metrics.bac)} BAC</span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden relative">
              {/* Earned Value line */}
              <div
                className="absolute h-full bg-blue-600/60 rounded-full"
                style={{ width: `${Math.min(100, (metrics.ev / metrics.bac) * 100)}%` }}
              />
              {/* Actual Cost line */}
              <div
                className="absolute h-full bg-amber-500/40 rounded-full"
                style={{ width: `${Math.min(100, (metrics.actualCost / metrics.bac) * 100)}%` }}
              />
              {/* % complete */}
              <div
                className="absolute h-full bg-blue-600 rounded-full"
                style={{ width: `${metrics.percentComplete}%` }}
              />
            </div>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> Planned ({metrics.percentComplete}%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500/60 inline-block" /> Actual Cost</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600/60 inline-block" /> Earned Value</span>
            </div>
          </CardContent>
        </Card>

        {/* EV Metrics Grid */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Earned Value Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <MetricCard
              label="BAC (Budget)"
              value={formatCurrency(metrics.bac)}
              sub="Budget at Completion"
            />
            <MetricCard
              label="EV (Earned Value)"
              value={formatCurrency(metrics.ev)}
              sub={`${metrics.percentComplete}% complete`}
              color="text-blue-400"
            />
            <MetricCard
              label="AC (Actual Cost)"
              value={formatCurrency(metrics.actualCost)}
              sub="Spent to date"
              color={metrics.actualCost > metrics.ev ? 'text-amber-400' : 'text-zinc-100'}
            />
            <MetricCard
              label="EAC (Estimate at Comp.)"
              value={formatCurrency(metrics.eac)}
              sub="Projected final cost"
              warn={metrics.eac > metrics.bac}
              color={metrics.eac > metrics.bac ? 'text-red-400' : 'text-zinc-100'}
            />
            <MetricCard
              label="ETC (Remaining Cost)"
              value={formatCurrency(metrics.etc)}
              sub="To finish project"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
            <MetricCard
              label="CPI (Cost Performance)"
              value={metrics.cpi.toFixed(3)}
              sub={metrics.cpi >= 1 ? 'Under budget' : metrics.cpi >= 0.8 ? 'Slight overrun' : 'Over budget'}
              color={cpiColor}
              warn={metrics.cpi < 0.8}
            />
            <MetricCard
              label="SPI (Schedule Performance)"
              value={metrics.spi.toFixed(3)}
              sub={metrics.spi >= 1 ? 'On / ahead of schedule' : 'Behind schedule'}
              color={spiColor}
              warn={metrics.spi < 0.8}
            />
            <MetricCard
              label="VAC (Variance at Comp.)"
              value={formatCurrency(metrics.vac)}
              sub={metrics.vac >= 0 ? 'Surplus' : 'Projected overrun'}
              color={vacColor}
              warn={metrics.vac < 0}
            />
          </div>
        </div>

        {/* Forecast vs Actual by Category */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-zinc-400" />
              Budget vs Actual by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {categories.length === 0 ? (
              <p className="px-4 py-6 text-xs text-zinc-600">No budget lines or actuals found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Category', 'Budget', 'Actual', 'Variance', 'Var %', 'Remaining', 'EAC'].map(h => (
                      <th
                        key={h}
                        className={`px-4 pb-2 pt-3 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Category' ? 'text-left' : 'text-right'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => {
                    const isOver = cat.variance < 0
                    return (
                      <tr key={cat.type} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                        <td className="px-4 py-3">
                          <p className="text-sm text-zinc-200">{TYPE_LABELS[cat.type] ?? cat.type}</p>
                          {/* inline bar */}
                          <div className="mt-1 h-1 w-32 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-blue-600'}`}
                              style={{ width: `${Math.min(100, cat.budget > 0 ? (cat.actual / cat.budget) * 100 : 0)}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-zinc-400">{formatCurrency(cat.budget)}</td>
                        <td className="px-4 py-3 text-right text-xs text-zinc-300">{formatCurrency(cat.actual)}</td>
                        <td className={`px-4 py-3 text-right text-xs font-semibold ${isOver ? 'text-red-400' : 'text-emerald-400'}`}>
                          {isOver ? '' : '+'}{formatCurrency(cat.variance)}
                        </td>
                        <td className={`px-4 py-3 text-right text-xs ${isOver ? 'text-red-400' : 'text-zinc-400'}`}>
                          {isOver ? '' : '+'}{cat.variancePct.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-zinc-400">
                          {cat.remaining > 0 ? formatCurrency(cat.remaining) : <span className="text-zinc-700">—</span>}
                        </td>
                        <td className={`px-4 py-3 text-right text-xs font-semibold ${cat.eac > cat.budget ? 'text-red-400' : 'text-zinc-300'}`}>
                          {formatCurrency(cat.eac)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

      </main>
    </>
  )
}
