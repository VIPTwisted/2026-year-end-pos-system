'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp, TrendingDown, Globe, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react'

const fmt = (n: number, digits = 2) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)

const fmtRate = (n: number) => n.toFixed(6)

type FxExposure = {
  currencyCode: string
  currencyName: string
  currentRate: number
  previousRate: number
  rateDate: string
  exposure: number
  exposureBase: number
  revaluedBase: number
  unrealizedGainLoss: number
  payableBalance: number
  receivableBalance: number
}

type RevaluationRun = {
  id: string
  runDate: string
  status: string
  totalGainLoss: number
  currenciesProcessed: number
  postedBy: string | null
  notes: string | null
}

type SummaryData = {
  exposures: FxExposure[]
  totalUnrealizedGain: number
  totalUnrealizedLoss: number
  netGainLoss: number
  lastRunDate: string | null
  recentRuns: RevaluationRun[]
}

function GainLossCell({ value }: { value: number }) {
  if (value === 0) return <span className="text-zinc-500 tabular-nums">—</span>
  const cls = value > 0 ? 'text-emerald-400' : 'text-red-400'
  const icon = value > 0 ? <TrendingUp className="w-3 h-3 inline mr-0.5" /> : <TrendingDown className="w-3 h-3 inline mr-0.5" />
  return <span className={`${cls} font-mono tabular-nums font-semibold`}>{icon}{fmt(Math.abs(value))}</span>
}

export default function CurrencyRevaluationPage() {
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [selectedCcy, setSelectedCcy] = useState<string | null>(null)
  const [postNotes, setPostNotes] = useState('')
  const [showPostModal, setShowPostModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/finance/currency-revaluation')
      setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const runRevaluation = async () => {
    setRunning(true)
    try {
      await fetch('/api/finance/currency-revaluation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'revalue', notes: postNotes }) })
      setShowPostModal(false)
      setPostNotes('')
      await load()
    } finally {
      setRunning(false)
    }
  }

  const filtered = selectedCcy ? data?.exposures.filter(e => e.currencyCode === selectedCcy) : data?.exposures

  if (loading) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
        <TopBar title="Currency Revaluation" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-zinc-500 animate-spin" />
        </main>
      </div>
    )
  }

  const exposures = data?.exposures ?? []
  const atRisk = exposures.filter(e => Math.abs(e.unrealizedGainLoss) > 0)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Currency Revaluation" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-zinc-100">FX Exposure &amp; Revaluation</h2>
            <p className="text-[13px] text-zinc-500">
              {exposures.length} currencies · {atRisk.length} with open exposure
              {data?.lastRunDate ? ` · Last run ${new Date(data.lastRunDate).toLocaleDateString()}` : ' · Never run'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh Rates
            </Button>
            <Button size="sm" onClick={() => setShowPostModal(true)} disabled={atRisk.length === 0}>
              <CheckCircle className="w-4 h-4 mr-1" /> Run Revaluation
            </Button>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Currencies Tracked</p>
              <p className="text-2xl font-bold text-zinc-100">{exposures.length}</p>
              <p className="text-xs text-zinc-600 mt-1">Active foreign currencies</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total AR Exposure</p>
              <p className="text-2xl font-bold text-emerald-400">
                {fmt(exposures.reduce((s, e) => s + e.receivableBalance, 0))}
              </p>
              <p className="text-xs text-zinc-600 mt-1">Open receivables in USD</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total AP Exposure</p>
              <p className="text-2xl font-bold text-red-400">
                {fmt(exposures.reduce((s, e) => s + e.payableBalance, 0))}
              </p>
              <p className="text-xs text-zinc-600 mt-1">Open payables in USD</p>
            </CardContent>
          </Card>
          <Card className={`border-zinc-800 ${(data?.netGainLoss ?? 0) >= 0 ? 'bg-emerald-900/10 border-emerald-800/30' : 'bg-red-900/10 border-red-800/30'}`}>
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Net Unrealized G/L</p>
              <p className={`text-2xl font-bold ${(data?.netGainLoss ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmt(data?.netGainLoss ?? 0)}
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                Gain: {fmt(data?.totalUnrealizedGain ?? 0)} | Loss: {fmt(data?.totalUnrealizedLoss ?? 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alert if net loss significant */}
        {(data?.netGainLoss ?? 0) < -1000 && (
          <div className="flex items-start gap-3 bg-red-900/10 border border-red-800/50 rounded-lg p-4">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-300">Significant Unrealized FX Loss</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Net unrealized loss of {fmt(Math.abs(data?.netGainLoss ?? 0))} detected. Consider running revaluation to post adjusting entries.
              </p>
            </div>
          </div>
        )}

        {/* FX Exposure Table */}
        <Card>
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
            <span className="text-sm font-semibold text-zinc-100">FX Exposure by Currency</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedCcy(null)} className={`text-xs px-2 py-1 rounded transition-colors ${!selectedCcy ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'}`}>
                All
              </button>
              {exposures.map(e => (
                <button key={e.currencyCode} onClick={() => setSelectedCcy(e.currencyCode === selectedCcy ? null : e.currencyCode)}
                  className={`text-xs px-2 py-1 rounded font-mono transition-colors ${selectedCcy === e.currencyCode ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'}`}>
                  {e.currencyCode}
                </button>
              ))}
            </div>
          </div>
          <CardContent className="p-0">
            {(filtered?.length ?? 0) === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-zinc-600">
                <Globe className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No foreign currency exposure found.</p>
                <p className="text-xs mt-1">Add currencies and exchange rates to track exposure.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Currency</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Current Rate</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Prior Rate</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Rate Change</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">AR Balance</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">AP Balance</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Net Exposure</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Unrealized G/L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {filtered!.map(e => {
                      const rateChange = e.currentRate - e.previousRate
                      const rateChangePct = e.previousRate > 0 ? (rateChange / e.previousRate) * 100 : 0
                      return (
                        <tr key={e.currencyCode} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-md flex items-center justify-center text-xs font-bold text-zinc-300 font-mono">
                                {e.currencyCode.slice(0, 2)}
                              </div>
                              <div>
                                <p className="font-mono font-semibold text-zinc-100">{e.currencyCode}</p>
                                <p className="text-xs text-zinc-500">{e.currencyName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right font-mono text-zinc-200">{fmtRate(e.currentRate)}</td>
                          <td className="px-5 py-3 text-right font-mono text-zinc-400">{e.previousRate > 0 ? fmtRate(e.previousRate) : '—'}</td>
                          <td className="px-5 py-3 text-right">
                            {rateChange !== 0 ? (
                              <span className={`font-mono text-xs ${rateChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {rateChange > 0 ? '+' : ''}{fmtRate(rateChange)} ({rateChangePct > 0 ? '+' : ''}{rateChangePct.toFixed(2)}%)
                              </span>
                            ) : <span className="text-zinc-600">—</span>}
                          </td>
                          <td className="px-5 py-3 text-right font-mono text-emerald-400/80">
                            {e.receivableBalance > 0 ? fmt(e.receivableBalance) : '—'}
                          </td>
                          <td className="px-5 py-3 text-right font-mono text-red-400/80">
                            {e.payableBalance > 0 ? fmt(e.payableBalance) : '—'}
                          </td>
                          <td className="px-5 py-3 text-right font-mono text-zinc-200">
                            {fmt(e.receivableBalance - e.payableBalance)}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <GainLossCell value={e.unrealizedGainLoss} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-zinc-700">
                      <td colSpan={4} className="px-5 pt-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Totals</td>
                      <td className="px-5 pt-3 text-right font-mono font-bold text-emerald-400">
                        {fmt(exposures.reduce((s, e) => s + e.receivableBalance, 0))}
                      </td>
                      <td className="px-5 pt-3 text-right font-mono font-bold text-red-400">
                        {fmt(exposures.reduce((s, e) => s + e.payableBalance, 0))}
                      </td>
                      <td className="px-5 pt-3 text-right font-mono font-bold text-zinc-100">
                        {fmt(exposures.reduce((s, e) => s + (e.receivableBalance - e.payableBalance), 0))}
                      </td>
                      <td className="px-5 pt-3 text-right">
                        <GainLossCell value={data?.netGainLoss ?? 0} />
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Revaluation Runs */}
        {(data?.recentRuns?.length ?? 0) > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-zinc-100">Recent Revaluation Runs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Run Date</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Currencies</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Net G/L Posted</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Posted By</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {data!.recentRuns.map(r => (
                    <tr key={r.id} className="hover:bg-zinc-800/30">
                      <td className="px-5 py-3 text-zinc-300">{new Date(r.runDate).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <Badge variant={r.status === 'posted' ? 'success' : r.status === 'failed' ? 'destructive' : 'warning'} className="capitalize text-xs">
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right text-zinc-400">{r.currenciesProcessed}</td>
                      <td className="px-5 py-3 text-right">
                        <GainLossCell value={r.totalGainLoss} />
                      </td>
                      <td className="px-5 py-3 text-zinc-400">{r.postedBy ?? '—'}</td>
                      <td className="px-5 py-3 text-zinc-500 text-xs">{r.notes ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Post Modal */}
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#16213e] border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-base font-semibold text-zinc-100 mb-1">Run Currency Revaluation</h3>
              <p className="text-xs text-zinc-500 mb-4">
                This will calculate unrealized FX gains/losses for all open AR/AP balances and post adjusting journal entries.
                Net impact: <span className={`font-semibold ${(data?.netGainLoss ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(data?.netGainLoss ?? 0)}</span>
              </p>
              <label className="block text-xs text-zinc-500 mb-1">Notes (optional)</label>
              <textarea
                value={postNotes}
                onChange={e => setPostNotes(e.target.value)}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Month-end FX revaluation Q2 2026..."
              />
              <div className="flex gap-2">
                <Button onClick={runRevaluation} disabled={running} className="flex-1">
                  {running ? <RefreshCw className="w-4 h-4 animate-spin mr-1" /> : <DollarSign className="w-4 h-4 mr-1" />}
                  {running ? 'Running...' : 'Post Revaluation'}
                </Button>
                <Button variant="outline" onClick={() => setShowPostModal(false)} disabled={running}>Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
