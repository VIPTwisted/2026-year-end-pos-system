'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { RefreshCw, Play, Clock, History, RotateCcw, Database } from 'lucide-react'

interface CdxJob {
  id: string
  jobId: string
  name: string
  direction: string
  lastRun: string | null
  status: string
  recordCount: number
  createdAt: string
}

const STATUS_STYLES: Record<string, string> = {
  Success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Running: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Failed: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Pending: 'bg-zinc-700/30 text-zinc-500 border-zinc-700/40',
  Scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

function formatDate(dt: string | null) {
  if (!dt) return '—'
  const d = new Date(dt)
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function CdxPage() {
  const [jobs, setJobs] = useState<CdxJob[]>([])
  const [loading, setLoading] = useState(true)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/commerce/cdx')
      const data = await res.json()
      setJobs(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function triggerAction(jobId: string, action: 'run' | 'reset' | 'schedule') {
    setActionInProgress(jobId + action)
    try {
      await fetch('/api/commerce/cdx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, action }),
      })
      await load()
    } finally {
      setActionInProgress(null)
    }
  }

  async function runAll() {
    for (const job of jobs) {
      await triggerAction(job.jobId, 'run')
    }
  }

  const toggleSelect = (jobId: string) => {
    setSelected(prev => {
      const s = new Set(prev)
      if (s.has(jobId)) s.delete(jobId)
      else s.add(jobId)
      return s
    })
  }

  const successCount = jobs.filter(j => j.status === 'Success').length
  const failedCount = jobs.filter(j => j.status === 'Failed').length
  const runningCount = jobs.filter(j => j.status === 'Running').length

  return (
    <>
      <TopBar title="CDX Distribution" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Commerce Data Exchange</h1>
            <p className="text-sm text-zinc-500">{jobs.length} distribution jobs configured</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} disabled={loading}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={runAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
              <Play className="w-4 h-4" /> Run All
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Jobs', value: jobs.length, color: 'text-zinc-200' },
            { label: 'Succeeded', value: successCount, color: 'text-emerald-400' },
            { label: 'Failed', value: failedCount, color: failedCount > 0 ? 'text-rose-400' : 'text-zinc-600' },
            { label: 'Running', value: runningCount, color: runningCount > 0 ? 'text-amber-400' : 'text-zinc-600' },
          ].map(kpi => (
            <Card key={kpi.label}>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{kpi.label}</p>
                <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Jobs table */}
        <Card>
          <CardContent className="px-0 py-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-zinc-600">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading jobs…
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3 w-10">
                        <input type="checkbox" className="rounded border-zinc-700 bg-zinc-900"
                          onChange={e => setSelected(e.target.checked ? new Set(jobs.map(j => j.jobId)) : new Set())}
                          checked={selected.size === jobs.length && jobs.length > 0} />
                      </th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Job ID</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Name</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Direction</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Last Run</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Status</th>
                      <th className="text-right text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Records</th>
                      <th className="text-center text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(job => {
                      const style = STATUS_STYLES[job.status] ?? STATUS_STYLES.Pending
                      const isRunning = actionInProgress?.startsWith(job.jobId)
                      return (
                        <tr key={job.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                          <td className="px-4 py-3">
                            <input type="checkbox" className="rounded border-zinc-700 bg-zinc-900"
                              checked={selected.has(job.jobId)}
                              onChange={() => toggleSelect(job.jobId)} />
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">{job.jobId}</span>
                          </td>
                          <td className="px-4 py-3 font-medium text-zinc-200">{job.name}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded border ${
                              job.direction === 'Upload'
                                ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {job.direction}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-zinc-500 text-xs">{formatDate(job.lastRun)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${style}`}>
                              {job.status === 'Running' && <RefreshCw className="w-3 h-3 inline mr-1 animate-spin" />}
                              {job.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-zinc-400 text-xs">
                            {job.recordCount > 0 ? job.recordCount.toLocaleString() : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => triggerAction(job.jobId, 'run')} disabled={isRunning ?? false}
                                title="Run Now"
                                className="p-1.5 rounded hover:bg-emerald-500/10 text-emerald-500 hover:text-emerald-400 transition-colors disabled:opacity-40">
                                <Play className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => triggerAction(job.jobId, 'schedule')} disabled={isRunning ?? false}
                                title="Schedule"
                                className="p-1.5 rounded hover:bg-blue-500/10 text-blue-500 hover:text-blue-400 transition-colors disabled:opacity-40">
                                <Clock className="w-3.5 h-3.5" />
                              </button>
                              <button title="History"
                                className="p-1.5 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-400 transition-colors">
                                <History className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => triggerAction(job.jobId, 'reset')} disabled={isRunning ?? false}
                                title="Reset"
                                className="p-1.5 rounded hover:bg-amber-500/10 text-amber-500 hover:text-amber-400 transition-colors disabled:opacity-40">
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {jobs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
                    <Database className="w-12 h-12 mb-4 opacity-30" />
                    <p className="text-sm">No CDX jobs configured.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-zinc-700">CDX jobs synchronize data between Commerce HQ and channel databases. Run Now executes immediately; Schedule sets a recurring trigger.</p>
      </main>
    </>
  )
}
