'use client'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Plus, Trash2, RefreshCw, DollarSign } from 'lucide-react'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const CATEGORY_COLORS: Record<string, string> = {
  ar: 'text-emerald-400 bg-emerald-900/20 border-emerald-800',
  ap: 'text-red-400 bg-red-900/20 border-red-800',
  payroll: 'text-amber-400 bg-amber-900/20 border-amber-800',
  tax: 'text-violet-400 bg-violet-900/20 border-violet-800',
  capex: 'text-blue-400 bg-blue-900/20 border-blue-800',
  other: 'text-zinc-400 bg-zinc-800 border-zinc-700',
}

type Bucket = {
  key: string
  label: string
  weekStart: string
  arInflows: number
  apOutflows: number
  salesOrderInflows: number
  poOutflows: number
  manualInflows: number
  manualOutflows: number
  totalInflows: number
  totalOutflows: number
  net: number
  runningBalance: number
}

type ManualLine = {
  id?: string
  description: string
  amount: number
  expectedDate: string
  category: string
  notes: string
}

type ForecastData = {
  forecastDate: string
  totalInflows: number
  totalOutflows: number
  projectedNet: number
  buckets: Bucket[]
}

export function CashFlowClient() {
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(true)
  const [openingBalance, setOpeningBalance] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cashflow_opening_balance')
      return stored ? Number(stored) : 0
    }
    return 0
  })
  const [openingInput, setOpeningInput] = useState('')
  const [manualLines, setManualLines] = useState<ManualLine[]>([])
  const [showAddLine, setShowAddLine] = useState(false)
  const [newLine, setNewLine] = useState<ManualLine>({
    description: '', amount: 0, expectedDate: '', category: 'other', notes: '',
  })

  const loadForecast = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/finance/cash-flow')
      const data = await res.json()
      setForecast(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadForecast() }, [loadForecast])

  const saveOpeningBalance = () => {
    const val = Number(openingInput) || 0
    setOpeningBalance(val)
    localStorage.setItem('cashflow_opening_balance', String(val))
    setOpeningInput('')
  }

  const addManualLine = () => {
    if (!newLine.description || !newLine.expectedDate) return
    setManualLines(prev => [...prev, { ...newLine, id: `local-${Date.now()}` }])
    setNewLine({ description: '', amount: 0, expectedDate: '', category: 'other', notes: '' })
    setShowAddLine(false)
  }

  const removeManualLine = (idx: number) => setManualLines(prev => prev.filter((_, i) => i !== idx))

  // Compute buckets with opening balance + manual lines overlay
  const enrichedBuckets = forecast?.buckets.map((b, i) => {
    // Apply manual lines to bucket
    let addInflows = 0
    let addOutflows = 0
    for (const ml of manualLines) {
      if (!ml.expectedDate) continue
      const bStart = new Date(b.weekStart)
      const bEnd = new Date(bStart)
      bEnd.setDate(bEnd.getDate() + 6)
      const mDate = new Date(ml.expectedDate)
      if (mDate >= bStart && mDate <= bEnd) {
        if (ml.amount >= 0) addInflows += ml.amount
        else addOutflows += Math.abs(ml.amount)
      }
    }
    const totalIn = b.totalInflows + addInflows
    const totalOut = b.totalOutflows + addOutflows
    const net = totalIn - totalOut
    // Running balance starts from openingBalance
    const prevNet = i === 0
      ? openingBalance
      : forecast.buckets.slice(0, i).reduce((s, bb) => s + bb.net, 0) + openingBalance
    const runBal = prevNet + net
    return { ...b, totalInflows: totalIn, totalOutflows: totalOut, net, runningBalance: runBal }
  }) ?? []

  const totalInflows = enrichedBuckets.reduce((s, b) => s + b.totalInflows, 0)
  const totalOutflows = enrichedBuckets.reduce((s, b) => s + b.totalOutflows, 0)
  const projectedClose = openingBalance + (totalInflows - totalOutflows)

  const maxBarValue = enrichedBuckets.reduce((m, b) => Math.max(m, b.totalInflows, b.totalOutflows), 0)
  const barScale = maxBarValue > 0 ? 100 / maxBarValue : 1

  if (loading) {
    return (
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-zinc-500 animate-spin" />
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-zinc-500">
            {forecast ? new Date(forecast.forecastDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''} · 13-week horizon
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadForecast}>
          <RefreshCw className="w-4 h-4 mr-1" />Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Opening Balance — editable */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Opening Balance</p>
            <p className="text-2xl font-bold text-zinc-100 mb-2">{fmt(openingBalance)}</p>
            <div className="flex gap-1">
              <input
                type="number"
                value={openingInput}
                onChange={e => setOpeningInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveOpeningBalance()}
                className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Set balance..."
              />
              <Button size="sm" className="h-6 px-2 text-xs" onClick={saveOpeningBalance}>Set</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Inflows (13 wks)</p>
            <p className="text-2xl font-bold text-emerald-400">{fmt(totalInflows)}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <p className="text-xs text-zinc-500">AR + Sales Orders + Manual</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Outflows (13 wks)</p>
            <p className="text-2xl font-bold text-red-400">{fmt(totalOutflows)}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3 text-red-400" />
              <p className="text-xs text-zinc-500">AP + Purchase Orders + Manual</p>
            </div>
          </CardContent>
        </Card>
        <Card className={`border-zinc-800 ${projectedClose >= 0 ? 'bg-emerald-900/10 border-emerald-800/50' : 'bg-red-900/10 border-red-800/50'}`}>
          <CardContent className="p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Projected Closing Balance</p>
            <p className={`text-2xl font-bold ${projectedClose >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(projectedClose)}</p>
            <div className="flex items-center gap-1 mt-1">
              <DollarSign className="w-3 h-3 text-zinc-400" />
              <p className="text-xs text-zinc-500">Opening + Net Cash Flow</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Waterfall Chart */}
      <Card className="bg-zinc-900 border-zinc-800 mb-8">
        <CardHeader>
          <CardTitle className="text-base text-zinc-100">13-Week Cash Flow Waterfall</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 items-end" style={{ height: '200px' }}>
            {enrichedBuckets.map((b, i) => (
              <div key={b.key} className="flex-1 flex flex-col items-center gap-0.5 relative group" style={{ minWidth: 0 }}>
                {/* Inflow bar (green, up from center) */}
                <div className="w-full flex flex-col justify-end" style={{ height: '90px' }}>
                  {b.totalInflows > 0 && (
                    <div
                      className="w-full bg-emerald-500/70 rounded-t-sm transition-all"
                      style={{ height: `${Math.min(b.totalInflows * barScale, 100) * 0.9}px` }}
                    />
                  )}
                </div>
                {/* Net indicator dot */}
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${b.net >= 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                {/* Outflow bar (red, down from center) */}
                <div className="w-full flex flex-col" style={{ height: '90px' }}>
                  {b.totalOutflows > 0 && (
                    <div
                      className="w-full bg-red-500/70 rounded-b-sm transition-all"
                      style={{ height: `${Math.min(b.totalOutflows * barScale, 100) * 0.9}px` }}
                    />
                  )}
                </div>
                {/* Week label */}
                <div className="text-[9px] text-zinc-600 text-center truncate w-full mt-1 leading-tight">
                  {b.label.split(' ').slice(0, 2).join(' ')}
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 rounded-md p-2 text-xs whitespace-nowrap hidden group-hover:block z-10 shadow-xl">
                  <p className="font-medium text-zinc-100 mb-1">{b.label}</p>
                  <p className="text-emerald-400">In: {fmt(b.totalInflows)}</p>
                  <p className="text-red-400">Out: {fmt(b.totalOutflows)}</p>
                  <p className={`font-bold border-t border-zinc-700 mt-1 pt-1 ${b.net >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                    Net: {fmt(b.net)}
                  </p>
                  <p className="text-blue-300">Balance: {fmt(b.runningBalance)}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-emerald-500/70" />Inflows</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-500/70" />Outflows</div>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /><div className="w-1.5 h-1.5 rounded-full bg-red-400" />Net (green=positive)</div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Table */}
      <Card className="bg-zinc-900 border-zinc-800 mb-8">
        <CardHeader>
          <CardTitle className="text-base text-zinc-100">Weekly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wide">
                  <th className="text-left pb-2 font-medium">Week</th>
                  <th className="text-right pb-2 font-medium text-emerald-400/70">AR Due</th>
                  <th className="text-right pb-2 font-medium text-red-400/70">AP Due</th>
                  <th className="text-right pb-2 font-medium text-emerald-400/70">Sales Ords</th>
                  <th className="text-right pb-2 font-medium text-red-400/70">Purch Ords</th>
                  <th className="text-right pb-2 font-medium text-zinc-400">Manual</th>
                  <th className="text-right pb-2 font-medium">Net</th>
                  <th className="text-right pb-2 font-medium text-blue-400/70">Running Bal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {enrichedBuckets.map(b => (
                  <tr key={b.key} className="hover:bg-zinc-800/30">
                    <td className="py-2 pr-2 text-zinc-400 whitespace-nowrap">{b.label}</td>
                    <td className="py-2 pr-2 text-right text-emerald-400">{b.arInflows > 0 ? fmt(b.arInflows) : '—'}</td>
                    <td className="py-2 pr-2 text-right text-red-400">{b.apOutflows > 0 ? fmt(b.apOutflows) : '—'}</td>
                    <td className="py-2 pr-2 text-right text-emerald-300">{b.salesOrderInflows > 0 ? fmt(b.salesOrderInflows) : '—'}</td>
                    <td className="py-2 pr-2 text-right text-red-300">{b.poOutflows > 0 ? fmt(b.poOutflows) : '—'}</td>
                    <td className="py-2 pr-2 text-right text-zinc-400">
                      {(b.manualInflows + b.manualOutflows) > 0
                        ? <span className={b.manualInflows > b.manualOutflows ? 'text-emerald-400' : 'text-red-400'}>{fmt(b.manualInflows - b.manualOutflows)}</span>
                        : '—'}
                    </td>
                    <td className={`py-2 pr-2 text-right font-bold ${b.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {fmt(b.net)}
                    </td>
                    <td className={`py-2 text-right font-mono ${b.runningBalance >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      {fmt(b.runningBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-zinc-700 font-bold">
                  <td className="pt-3 text-zinc-300 uppercase text-[10px] tracking-wide">Total</td>
                  <td className="pt-3 text-right text-emerald-400">{fmt(enrichedBuckets.reduce((s, b) => s + b.arInflows, 0))}</td>
                  <td className="pt-3 text-right text-red-400">{fmt(enrichedBuckets.reduce((s, b) => s + b.apOutflows, 0))}</td>
                  <td className="pt-3 text-right text-emerald-300">{fmt(enrichedBuckets.reduce((s, b) => s + b.salesOrderInflows, 0))}</td>
                  <td className="pt-3 text-right text-red-300">{fmt(enrichedBuckets.reduce((s, b) => s + b.poOutflows, 0))}</td>
                  <td className="pt-3 text-right text-zinc-400">{fmt(enrichedBuckets.reduce((s, b) => s + b.manualInflows - b.manualOutflows, 0))}</td>
                  <td className={`pt-3 text-right ${totalInflows - totalOutflows >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {fmt(totalInflows - totalOutflows)}
                  </td>
                  <td className={`pt-3 text-right font-mono ${projectedClose >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                    {fmt(projectedClose)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Manual Adjustments */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-zinc-100">Manual Adjustments</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowAddLine(true)}>
              <Plus className="w-4 h-4 mr-1" />Add Line
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddLine && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-12 gap-3 mb-3">
                <div className="col-span-4">
                  <label className="text-xs text-zinc-500 block mb-1">Description *</label>
                  <input type="text" value={newLine.description} onChange={e => setNewLine(p => ({ ...p, description: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Payroll run" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-zinc-500 block mb-1">Amount (+ in / - out) *</label>
                  <input type="number" step="0.01" value={newLine.amount} onChange={e => setNewLine(p => ({ ...p, amount: Number(e.target.value) }))}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-zinc-500 block mb-1">Expected Date *</label>
                  <input type="date" value={newLine.expectedDate} onChange={e => setNewLine(p => ({ ...p, expectedDate: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-zinc-500 block mb-1">Category</label>
                  <select value={newLine.category} onChange={e => setNewLine(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    {Object.keys(CATEGORY_COLORS).map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-zinc-500 block mb-1">Notes</label>
                  <input type="text" value={newLine.notes} onChange={e => setNewLine(p => ({ ...p, notes: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={addManualLine} disabled={!newLine.description || !newLine.expectedDate}>
                  <Plus className="w-4 h-4 mr-1" />Add
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddLine(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {manualLines.length === 0 ? (
            <div className="text-center py-8 text-zinc-600 text-sm">
              No manual adjustments. Click &quot;Add Line&quot; to add payroll, taxes, capital expenses, etc.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-2 font-medium">Description</th>
                  <th className="text-right pb-2 font-medium">Amount</th>
                  <th className="text-left pb-2 font-medium">Date</th>
                  <th className="text-left pb-2 font-medium">Category</th>
                  <th className="text-left pb-2 font-medium">Notes</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {manualLines.map((line, i) => (
                  <tr key={line.id ?? i}>
                    <td className="py-2 pr-4 text-zinc-300">{line.description}</td>
                    <td className={`py-2 pr-4 text-right font-mono font-semibold ${line.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {fmt(line.amount)}
                    </td>
                    <td className="py-2 pr-4 text-zinc-400 text-xs whitespace-nowrap">
                      {new Date(line.expectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[line.category] ?? CATEGORY_COLORS.other}`}>
                        {line.category.charAt(0).toUpperCase() + line.category.slice(1)}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-zinc-500 text-xs">{line.notes || '—'}</td>
                    <td className="py-2">
                      <Button variant="ghost" size="sm" onClick={() => removeManualLine(i)} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
