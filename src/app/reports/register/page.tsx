'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import {
  Download,
  Printer,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ShiftRow {
  id: string
  storeName: string
  cashierName: string
  registerId: string
  openFloat: number
  closeFloat: number | null
  cashSales: number
  voidAmount: number
  totalSales: number
  totalCash: number
  expectedCash: number | null
  variance: number | null
  varianceAlerted: boolean
  openTime: string
  closeTime: string | null
  status: string
  openDenominations: string | null
  closeDenominations: string | null
  notes: string | null
}

interface Summary {
  totalShifts: number
  totalSales: number
  totalCash: number
  totalVariance: number
  shiftsWithVariance: number
  avgShiftSales: number
}

interface ReportData {
  shifts: ShiftRow[]
  summary: Summary
}

interface Store {
  id: string
  name: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DENOM_LABELS: Record<string, string> = {
  '100': '$100',
  '50': '$50',
  '20': '$20',
  '10': '$10',
  '5': '$5',
  '2': '$2',
  '1': '$1',
  '0.25': '25¢',
  '0.10': '10¢',
  '0.05': '5¢',
  '0.01': '1¢',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function firstOfMonthStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function formatDT(iso: string): string {
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${mm}/${dd}/${yyyy} ${hh}:${min}`
}

function parseDenominations(raw: string | null): Record<string, number> {
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Record<string, number>
  } catch {
    return {}
  }
}

function denomTotal(denoms: Record<string, number>): number {
  return Object.entries(denoms).reduce((acc, [k, v]) => acc + parseFloat(k) * v, 0)
}

function exportCSV(shifts: ShiftRow[]): void {
  const headers = [
    'Date/Time',
    'Store',
    'Cashier',
    'Register',
    'Status',
    'Open Float',
    'Sales',
    'Cash Collected',
    'Expected Cash',
    'Variance',
    'Void Amount',
  ]
  const rows = shifts.map(s => [
    s.openTime ? formatDT(s.openTime) : '',
    s.storeName,
    s.cashierName,
    s.registerId,
    s.status,
    s.openFloat.toFixed(2),
    s.totalSales.toFixed(2),
    s.totalCash.toFixed(2),
    s.expectedCash != null ? s.expectedCash.toFixed(2) : '',
    s.variance != null ? s.variance.toFixed(2) : '',
    s.voidAmount.toFixed(2),
  ])
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `register-report-${todayStr()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SummaryCard({
  label,
  value,
  sub,
  valueClass,
}: {
  label: string
  value: string
  sub?: string
  valueClass?: string
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${valueClass ?? 'text-zinc-100'}`}>{value}</p>
      {sub && <p className="text-[11px] text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function DenomTable({ denoms }: { denoms: Record<string, number> }) {
  const keys = Object.keys(DENOM_LABELS).filter(k => denoms[k] != null && denoms[k] > 0)
  if (keys.length === 0) return <span className="text-zinc-500 text-xs">No data</span>
  return (
    <table className="text-xs w-full">
      <thead>
        <tr className="text-zinc-500">
          <th className="text-left pb-1 font-medium">Denom</th>
          <th className="text-right pb-1 font-medium">Count</th>
          <th className="text-right pb-1 font-medium">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        {keys.map(k => {
          const count = denoms[k] ?? 0
          const subtotal = parseFloat(k) * count
          return (
            <tr key={k} className="border-t border-zinc-800/60">
              <td className="py-0.5 text-zinc-300">{DENOM_LABELS[k]}</td>
              <td className="py-0.5 text-right text-zinc-400">{count}</td>
              <td className="py-0.5 text-right text-zinc-300">{formatCurrency(subtotal)}</td>
            </tr>
          )
        })}
        <tr className="border-t border-zinc-700">
          <td colSpan={2} className="pt-1 text-zinc-400 font-semibold">Total</td>
          <td className="pt-1 text-right text-zinc-100 font-semibold">{formatCurrency(denomTotal(denoms))}</td>
        </tr>
      </tbody>
    </table>
  )
}

function ExpandedRow({ shift }: { shift: ShiftRow }) {
  const openD = parseDenominations(shift.openDenominations)
  const closeD = parseDenominations(shift.closeDenominations)
  const openTotal = denomTotal(openD)
  const closeTotal = denomTotal(closeD)
  const varDisplay = shift.variance ?? 0

  return (
    <tr>
      <td colSpan={10} className="bg-zinc-950/80 px-6 py-5 border-b border-zinc-800">
        <div className="grid grid-cols-3 gap-6">
          {/* Opening float */}
          <div>
            <h4 className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold mb-2">Opening Count</h4>
            <DenomTable denoms={openD} />
            {Object.keys(openD).length === 0 && (
              <p className="text-xs text-zinc-600 mt-1">Float: {formatCurrency(shift.openFloat)}</p>
            )}
          </div>

          {/* Closing float */}
          <div>
            <h4 className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold mb-2">Closing Count</h4>
            {shift.status === 'open' ? (
              <span className="text-xs text-zinc-500">Shift still open</span>
            ) : (
              <DenomTable denoms={closeD} />
            )}
          </div>

          {/* Variance summary */}
          <div>
            <h4 className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold mb-2">Variance Summary</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Open Float</span>
                <span className="text-zinc-300">{formatCurrency(shift.openFloat)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Cash Sales</span>
                <span className="text-zinc-300">{formatCurrency(shift.cashSales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Expected Cash</span>
                <span className="text-zinc-300">
                  {shift.expectedCash != null ? formatCurrency(shift.expectedCash) : '—'}
                </span>
              </div>
              {shift.status !== 'open' && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Actual (Denom Count)</span>
                  <span className="text-zinc-300">{formatCurrency(closeTotal > 0 ? closeTotal : (shift.closeFloat ?? 0))}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-zinc-800 pt-1.5 mt-1.5">
                <span className="font-semibold text-zinc-400">Variance</span>
                <span
                  className={
                    varDisplay < -0.01
                      ? 'text-red-400 font-semibold'
                      : varDisplay > 0.01
                      ? 'text-amber-400 font-semibold'
                      : 'text-zinc-500'
                  }
                >
                  {Math.abs(varDisplay) < 0.01
                    ? '—'
                    : varDisplay < 0
                    ? `-${formatCurrency(Math.abs(varDisplay))}`
                    : `+${formatCurrency(varDisplay)}`}
                </span>
              </div>
              {shift.notes && (
                <div className="mt-2 pt-2 border-t border-zinc-800">
                  <p className="text-zinc-500">Notes</p>
                  <p className="text-zinc-300 mt-0.5">{shift.notes}</p>
                </div>
              )}
            </div>
            {/* Denom reconcile helper */}
            {openTotal > 0 && closeTotal > 0 && (
              <div className="mt-3 pt-2 border-t border-zinc-800 text-xs text-zinc-500">
                Open denom total: {formatCurrency(openTotal)} · Close denom total: {formatCurrency(closeTotal)}
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  )
}

function ShiftTableRow({ shift }: { shift: ShiftRow }) {
  const [expanded, setExpanded] = useState(false)
  const varDisplay = shift.variance ?? 0
  const hasVariance = Math.abs(varDisplay) > 0.01

  return (
    <>
      <tr className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors">
        {/* Date/Time */}
        <td className="px-4 py-3 text-xs text-zinc-300 whitespace-nowrap">
          <div>{formatDT(shift.openTime)}</div>
          {shift.closeTime && (
            <div className="text-zinc-600 mt-0.5">→ {formatDT(shift.closeTime)}</div>
          )}
        </td>

        {/* Cashier */}
        <td className="px-4 py-3">
          <div className="text-sm text-zinc-200">{shift.cashierName}</div>
          <div className="text-xs text-zinc-500">{shift.storeName}</div>
        </td>

        {/* Register */}
        <td className="px-4 py-3 text-xs text-zinc-400 font-mono">{shift.registerId}</td>

        {/* Status */}
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
              shift.status === 'open'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}
          >
            {shift.status === 'open' ? 'Open' : 'Closed'}
          </span>
        </td>

        {/* Open Float */}
        <td className="px-4 py-3 text-sm text-zinc-300 text-right">{formatCurrency(shift.openFloat)}</td>

        {/* Sales */}
        <td className="px-4 py-3 text-sm text-zinc-100 text-right font-medium">{formatCurrency(shift.totalSales)}</td>

        {/* Cash Collected */}
        <td className="px-4 py-3 text-sm text-zinc-300 text-right">{formatCurrency(shift.totalCash)}</td>

        {/* Expected */}
        <td className="px-4 py-3 text-sm text-zinc-400 text-right">
          {shift.expectedCash != null ? formatCurrency(shift.expectedCash) : '—'}
        </td>

        {/* Variance */}
        <td className="px-4 py-3 text-sm text-right">
          {!hasVariance ? (
            <span className="text-zinc-600">—</span>
          ) : varDisplay < 0 ? (
            <span className="text-red-400 flex items-center justify-end gap-1">
              <AlertTriangle className="w-3 h-3" />
              -{formatCurrency(Math.abs(varDisplay))}
            </span>
          ) : (
            <span className="text-amber-400">+{formatCurrency(varDisplay)}</span>
          )}
        </td>

        {/* Actions */}
        <td className="px-4 py-3 text-right">
          <button
            onClick={() => setExpanded(v => !v)}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            View
          </button>
        </td>
      </tr>

      {expanded && <ExpandedRow shift={shift} />}
    </>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function RegisterReportPage() {
  const [from, setFrom] = useState(firstOfMonthStr())
  const [to, setTo] = useState(todayStr())
  const [storeId, setStoreId] = useState('')
  const [registerId, setRegisterId] = useState('')
  const [status, setStatus] = useState('all')
  const [varianceOnly, setVarianceOnly] = useState(false)

  const [stores, setStores] = useState<Store[]>([])
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load stores for dropdown
  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then((s: Store[]) => setStores(s))
      .catch(() => {/* non-critical */})
  }, [])

  const runReport = useCallback(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (from) params.set('startDate', from)
    if (to) params.set('endDate', to)
    if (storeId) params.set('storeId', storeId)
    if (registerId) params.set('registerId', registerId)
    if (status !== 'all') params.set('status', status)
    if (varianceOnly) params.set('varianceOnly', 'true')

    fetch(`/api/reports/register?${params.toString()}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed')
        return r.json() as Promise<ReportData>
      })
      .then(d => setData(d))
      .catch(() => setError('Failed to load register report. Please try again.'))
      .finally(() => setLoading(false))
  }, [from, to, storeId, registerId, status, varianceOnly])

  // Auto-run on mount
  useEffect(() => { runReport() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function resetFilters() {
    setFrom(firstOfMonthStr())
    setTo(todayStr())
    setStoreId('')
    setRegisterId('')
    setStatus('all')
    setVarianceOnly(false)
  }

  const shifts = data?.shifts ?? []
  const summary = data?.summary

  const totalVarianceClass =
    !summary
      ? 'text-zinc-100'
      : summary.totalVariance < -0.01
      ? 'text-red-400'
      : summary.totalVariance > 0.01
      ? 'text-amber-400'
      : 'text-zinc-100'

  return (
    <>
      <TopBar
        title="Register Report"
        breadcrumb={[{ label: 'Reports', href: '/reports' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCSV(shifts)}
              disabled={shifts.length === 0}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
          </div>
        }
      />

      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        {/* Page header */}
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Register / Shift Report</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">
            Cash drawer balancing, variance tracking, and denomination breakdown by shift
          </p>
        </div>

        {/* ── Filter bar ─────────────────────────────────────────────────── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-end gap-3">
            {/* Date from */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-zinc-500 uppercase tracking-wider">From</label>
              <input
                type="date"
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Date to */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-zinc-500 uppercase tracking-wider">To</label>
              <input
                type="date"
                value={to}
                onChange={e => setTo(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Store */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-zinc-500 uppercase tracking-wider">Store</label>
              <select
                value={storeId}
                onChange={e => setStoreId(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 min-w-[140px]"
              >
                <option value="">All Stores</option>
                {stores.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Register ID */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-zinc-500 uppercase tracking-wider">Register ID</label>
              <input
                type="text"
                value={registerId}
                onChange={e => setRegisterId(e.target.value)}
                placeholder="e.g. REG-01"
                className="bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 w-32"
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-zinc-500 uppercase tracking-wider">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Variance Only toggle */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-zinc-500 uppercase tracking-wider">Filter</label>
              <button
                onClick={() => setVarianceOnly(v => !v)}
                className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                  varianceOnly
                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                Variance Only
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 rounded text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={runReport}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-60"
              >
                {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* ── Summary cards ───────────────────────────────────────────────── */}
        {summary && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <SummaryCard
              label="Total Shifts"
              value={summary.totalShifts.toString()}
              sub={`${summary.shiftsWithVariance} with variance`}
            />
            <SummaryCard
              label="Total Sales"
              value={formatCurrency(summary.totalSales)}
              sub={`Avg ${formatCurrency(summary.avgShiftSales)} / shift`}
            />
            <SummaryCard
              label="Total Cash Collected"
              value={formatCurrency(summary.totalCash)}
            />
            <SummaryCard
              label="Total Variance"
              value={
                Math.abs(summary.totalVariance) < 0.01
                  ? '$0.00'
                  : summary.totalVariance < 0
                  ? `-${formatCurrency(Math.abs(summary.totalVariance))}`
                  : `+${formatCurrency(summary.totalVariance)}`
              }
              sub={`${summary.shiftsWithVariance} shifts affected`}
              valueClass={totalVarianceClass}
            />
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* ── Loading skeleton ─────────────────────────────────────────────── */}
        {loading && !data && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500 text-sm">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-600" />
            Loading report…
          </div>
        )}

        {/* ── Table ───────────────────────────────────────────────────────── */}
        {!loading && data && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {shifts.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 text-sm">
                No shifts found for the selected filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="bg-zinc-800/50 border-b border-zinc-800">
                      <th className="px-4 py-3 text-left text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
                        Date / Time
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
                        Cashier
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
                        Register
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
                        Open Float
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
                        Sales
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
                        Cash Collected
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
                        Expected
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
                        Variance
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map(shift => (
                      <ShiftTableRow key={shift.id} shift={shift} />
                    ))}
                  </tbody>
                  {/* Totals footer */}
                  {summary && shifts.length > 1 && (
                    <tfoot>
                      <tr className="bg-zinc-800/30 border-t-2 border-zinc-700">
                        <td colSpan={5} className="px-4 py-3 text-xs text-zinc-500 font-medium">
                          {shifts.length} shifts
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-zinc-100">
                          {formatCurrency(summary.totalSales)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-zinc-100">
                          {formatCurrency(summary.totalCash)}
                        </td>
                        <td className="px-4 py-3" />
                        <td className="px-4 py-3 text-sm text-right font-semibold">
                          {Math.abs(summary.totalVariance) < 0.01 ? (
                            <span className="text-zinc-600">—</span>
                          ) : summary.totalVariance < 0 ? (
                            <span className="text-red-400">-{formatCurrency(Math.abs(summary.totalVariance))}</span>
                          ) : (
                            <span className="text-amber-400">+{formatCurrency(summary.totalVariance)}</span>
                          )}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  )
}
