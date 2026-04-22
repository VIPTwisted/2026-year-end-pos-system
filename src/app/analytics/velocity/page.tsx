'use client'

import { useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Clock, TrendingUp, TrendingDown, Calendar, Activity, Loader2, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { VelocityChart } from './HeatMap'

/* ── Types ──────────────────────────────────────────────────────── */

interface HourBucket {
  hour: number
  label: string
  orders: number
  revenue: number
  avgOrder: number
}

interface DayBucket {
  day: number
  label: string
  orders: number
  revenue: number
  avgOrder: number
}

interface WeekBucket {
  week: number
  label: string
  orders: number
  revenue: number
  avgOrder: number
}

interface VelocityData {
  byHour: HourBucket[]
  byDayOfWeek: DayBucket[]
  byWeekOfMonth: WeekBucket[]
  peakHour: string
  peakDay: string
  slowestHour: string
  slowestDay: string
  totalOrders: number
  periodFrom: string
  periodTo: string
}

/* ── Helpers ────────────────────────────────────────────────────── */

function formatDateInput(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function defaultFrom(): string {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return formatDateInput(d)
}

function defaultTo(): string {
  return formatDateInput(new Date())
}

// Rearrange days Mon–Sun for display
function reorderDays(days: DayBucket[]): DayBucket[] {
  const order = [1, 2, 3, 4, 5, 6, 0] // Mon..Sat..Sun
  return order.map(i => days.find(d => d.day === i)!).filter(Boolean)
}

/* ── Insight Card ───────────────────────────────────────────────── */

interface InsightCardProps {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  accent: string
}

function InsightCard({ icon, label, value, sub, accent }: InsightCardProps) {
  return (
    <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 rounded-lg ${accent} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{label}</span>
      </div>
      <div className="text-xl font-bold text-zinc-100">{value}</div>
      {sub && <div className="text-xs text-zinc-500 mt-1">{sub}</div>}
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────── */

export default function SalesVelocityPage() {
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<VelocityData | null>(null)

  const analyze = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/analytics/velocity?from=${from}&to=${to}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Request failed')
      }
      const json = (await res.json()) as VelocityData
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load velocity data')
    } finally {
      setLoading(false)
    }
  }, [from, to])

  // Derive insight text
  const peakHourRevenue = data
    ? data.byHour.find(h => h.label === data.peakHour)?.revenue ?? 0
    : 0

  const orderedDays = data ? reorderDays(data.byDayOfWeek) : []
  const orderedHours = data ? data.byHour : []

  return (
    <>
      <TopBar title="Sales Velocity" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-zinc-100">Sales Velocity</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">
            Patterns by hour of day, day of week, and week of month
          </p>
        </div>

        {/* Date range + Analyze */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 mb-6">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                From
              </label>
              <input
                type="date"
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                To
              </label>
              <input
                type="date"
                value={to}
                onChange={e => setTo(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={analyze}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              Analyze
            </button>
            {data && !loading && (
              <span className="text-[11px] text-zinc-500 ml-auto self-end pb-2">
                {data.totalOrders} completed orders analyzed
              </span>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        {/* Empty state */}
        {!data && !loading && !error && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-12 flex flex-col items-center justify-center text-center">
            <Activity className="w-10 h-10 text-zinc-700 mb-3" />
            <p className="text-[15px] font-semibold text-zinc-400">No analysis yet</p>
            <p className="text-[13px] text-zinc-600 mt-1">Set a date range above and click Analyze</p>
          </div>
        )}

        {/* Results */}
        {data && (
          <>
            {/* Insight cards */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">Key Insights</span>
              <div className="flex-1 h-px bg-zinc-800/60" />
            </div>

            <div className="grid grid-cols-4 gap-4 mb-8">
              <InsightCard
                icon={<TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
                label="Peak Hour"
                value={data.peakHour}
                sub={`${formatCurrency(peakHourRevenue)} in revenue`}
                accent="bg-emerald-500/10"
              />
              <InsightCard
                icon={<Calendar className="w-3.5 h-3.5 text-blue-400" />}
                label="Peak Day"
                value={data.peakDay}
                sub="Highest volume day"
                accent="bg-blue-500/10"
              />
              <InsightCard
                icon={<TrendingDown className="w-3.5 h-3.5 text-amber-400" />}
                label="Slowest Hour"
                value={data.slowestHour}
                sub="Consider reduced staffing"
                accent="bg-amber-500/10"
              />
              <InsightCard
                icon={<Clock className="w-3.5 h-3.5 text-zinc-400" />}
                label="Slowest Day"
                value={data.slowestDay}
                sub="Promotion opportunity"
                accent="bg-zinc-700/50"
              />
            </div>

            {/* Insight text */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 mb-8">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                Actionable Insights
              </div>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">&#x25CF;</span>
                  <span>
                    Your busiest hour is <strong className="text-emerald-400">{data.peakHour}</strong>
                    {peakHourRevenue > 0 && ` with ${formatCurrency(peakHourRevenue)} avg revenue`} — ensure full staffing.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">&#x25CF;</span>
                  <span>
                    Consider staffing up on <strong className="text-blue-400">{data.peakDay}</strong> — it&apos;s your highest volume day.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">&#x25CF;</span>
                  <span>
                    <strong className="text-amber-400">{data.slowestDay}</strong> is the slowest — consider targeted promotions or adjusted hours.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-zinc-500 mt-0.5">&#x25CF;</span>
                  <span>
                    <strong className="text-zinc-400">{data.slowestHour}</strong> is your quietest hour — a good window for restocking or staff training.
                  </span>
                </li>
              </ul>
            </div>

            {/* Sales by Hour */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">Sales by Hour</span>
              <div className="flex-1 h-px bg-zinc-800/60" />
            </div>

            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 mb-8">
              <VelocityChart
                data={orderedHours.map(h => ({
                  label: h.label,
                  revenue: h.revenue,
                  orders: h.orders,
                }))}
              />
            </div>

            {/* Sales by Day of Week */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">Sales by Day of Week</span>
              <div className="flex-1 h-px bg-zinc-800/60" />
            </div>

            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 mb-8">
              <VelocityChart
                data={orderedDays.map(d => ({
                  label: d.label,
                  revenue: d.revenue,
                  orders: d.orders,
                }))}
              />
            </div>

            {/* Sales by Week of Month */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">Sales by Week of Month</span>
              <div className="flex-1 h-px bg-zinc-800/60" />
              <span className="text-[11px] text-zinc-600">Seasonality within month</span>
            </div>

            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 mb-8">
              <VelocityChart
                data={data.byWeekOfMonth.map(w => ({
                  label: w.label,
                  revenue: w.revenue,
                  orders: w.orders,
                }))}
              />
            </div>
          </>
        )}

      </main>
    </>
  )
}
