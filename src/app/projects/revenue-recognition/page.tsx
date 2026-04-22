'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, TrendingUp, Clock, AlertCircle, Play } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type KPIs = {
  totalContractValue: number
  totalRecognized: number
  totalDeferred: number
  totalUnbilled: number
}

type ScheduleLine = {
  projectId: string
  projectNo: string
  description: string
  status: string
  contractValue: number
  contractAmount: number
  pctComplete: number
  earnedValue: number
  recognizedToDate: number
  totalInvoiced: number
  deferred: number
  unbilled: number
  overage: number
  totalActualCost: number
  wipMethod: string
}

type RecognitionResult = {
  projectId: string
  method: string
  periodEndDate: string
  contractAmount: number
  recognizedPct: number
  recognizedAmount: number
  totalInvoiced: number
  deferred: number
  unbilled: number
}

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  open: 'success', planning: 'default', completed: 'secondary', cancelled: 'destructive',
}

const METHOD_LABELS: Record<string, string> = {
  percentage_of_completion: '% of Completion',
  completed_contract: 'Completed Contract',
  milestone_based: 'Milestone-Based',
}

export default function RevenueRecognitionPage() {
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [schedule, setSchedule] = useState<ScheduleLine[]>([])
  const [loading, setLoading] = useState(true)

  // Run recognition modal state
  const [showModal, setShowModal] = useState(false)
  const [runForm, setRunForm] = useState({
    projectId: '',
    method: 'percentage_of_completion',
    periodEndDate: new Date().toISOString().slice(0, 10),
  })
  const [runResult, setRunResult] = useState<RecognitionResult | null>(null)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/projects/revenue-recognition')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setKpis(data.kpis)
          setSchedule(data.schedule)
          if (data.schedule.length > 0 && !runForm.projectId) {
            setRunForm(p => ({ ...p, projectId: data.schedule[0].projectId }))
          }
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const runRecognition = async () => {
    setRunError('')
    setRunResult(null)
    setRunning(true)
    try {
      const res = await fetch('/api/projects/revenue-recognition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(runForm),
      })
      if (!res.ok) {
        const err: { error?: string } = await res.json()
        setRunError(err.error ?? 'Recognition run failed')
        return
      }
      const result: RecognitionResult = await res.json()
      setRunResult(result)
    } catch {
      setRunError('Network error')
    } finally {
      setRunning(false)
    }
  }

  const kpiCards = kpis ? [
    { label: 'Total Contract Value', value: formatCurrency(kpis.totalContractValue), icon: DollarSign, color: 'text-zinc-200' },
    { label: 'Recognized Revenue', value: formatCurrency(kpis.totalRecognized), icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Deferred Revenue', value: formatCurrency(kpis.totalDeferred), icon: Clock, color: 'text-amber-400' },
    { label: 'Unbilled Amount', value: formatCurrency(kpis.totalUnbilled), icon: AlertCircle, color: 'text-blue-400' },
  ] : []

  return (
    <>
      <TopBar title="Revenue Recognition" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-100">Revenue Recognition Hub</h2>
          <Button
            size="sm"
            onClick={() => { setShowModal(true); setRunResult(null); setRunError('') }}
            className="text-xs gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            Run Recognition
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-5 pb-5">
                  <div className="h-10 bg-zinc-800/50 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))
          ) : (
            kpiCards.map(({ label, value, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">{label}</p>
                    <Icon className="w-4 h-4 text-zinc-600 shrink-0" />
                  </div>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Revenue Schedule Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Revenue Schedule by Project</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-xs text-zinc-600">Loading…</div>
            ) : schedule.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-zinc-600">No projects found.</div>
            ) : (
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Project', 'Method', '% Complete', 'Contract Value', 'Earned Value', 'Recognized', 'Invoiced', 'Deferred', 'Unbilled', 'Status'].map(h => (
                      <th
                        key={h}
                        className={`px-4 pb-2 pt-3 text-xs font-medium text-zinc-500 uppercase tracking-wide ${['Project', 'Method'].includes(h) ? 'text-left' : 'text-right'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedule.map(line => (
                    <tr key={line.projectId} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                      <td className="px-4 py-2.5">
                        <p className="text-xs font-mono text-zinc-300">{line.projectNo}</p>
                        <p className="text-xs text-zinc-500 truncate max-w-[140px]">{line.description}</p>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-zinc-400">
                        {METHOD_LABELS[line.wipMethod] ?? line.wipMethod}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-14 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${line.pctComplete >= 100 ? 'bg-emerald-500' : line.pctComplete >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                              style={{ width: `${line.pctComplete}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-400 w-9 text-right">{line.pctComplete}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs text-zinc-300">{formatCurrency(line.contractValue)}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-zinc-300">{formatCurrency(line.earnedValue)}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-emerald-400 font-semibold">{formatCurrency(line.recognizedToDate)}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-zinc-400">{formatCurrency(line.totalInvoiced)}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-amber-400">{line.deferred > 0 ? formatCurrency(line.deferred) : <span className="text-zinc-700">—</span>}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-blue-400">{line.unbilled > 0 ? formatCurrency(line.unbilled) : <span className="text-zinc-700">—</span>}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Badge variant={STATUS_VARIANT[line.status] ?? 'secondary'} className="text-xs capitalize">
                          {line.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Run Recognition Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Play className="w-4 h-4 text-zinc-400" />
                  Run Revenue Recognition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Project</label>
                  <select
                    value={runForm.projectId}
                    onChange={e => setRunForm(p => ({ ...p, projectId: e.target.value }))}
                    className="w-full h-9 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 px-2 focus:outline-none focus:border-blue-500"
                  >
                    {schedule.map(s => (
                      <option key={s.projectId} value={s.projectId}>{s.projectNo} — {s.description}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Recognition Method</label>
                  <select
                    value={runForm.method}
                    onChange={e => setRunForm(p => ({ ...p, method: e.target.value }))}
                    className="w-full h-9 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 px-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="percentage_of_completion">Percentage of Completion</option>
                    <option value="completed_contract">Completed Contract</option>
                    <option value="milestone_based">Milestone-Based</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Period End Date</label>
                  <Input
                    type="date"
                    value={runForm.periodEndDate}
                    onChange={e => setRunForm(p => ({ ...p, periodEndDate: e.target.value }))}
                    className="h-9 text-xs"
                  />
                </div>

                {runError && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">{runError}</p>
                )}

                {runResult && (
                  <div className="bg-zinc-900 border border-zinc-700 rounded p-4 space-y-2 text-xs">
                    <p className="text-zinc-400 font-semibold uppercase tracking-wide mb-2">Recognition Result</p>
                    {[
                      ['Method', METHOD_LABELS[runResult.method] ?? runResult.method],
                      ['% Recognized', `${runResult.recognizedPct}%`],
                      ['Recognized Amount', formatCurrency(runResult.recognizedAmount)],
                      ['Total Invoiced', formatCurrency(runResult.totalInvoiced)],
                      ['Deferred', formatCurrency(runResult.deferred)],
                      ['Unbilled', formatCurrency(runResult.unbilled)],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-zinc-500">{k}</span>
                        <span className="text-zinc-200 font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={runRecognition}
                    disabled={running}
                    className="text-xs"
                  >
                    {running ? 'Running…' : 'Run'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setShowModal(false); setRunResult(null) }}
                    className="text-xs"
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </>
  )
}
