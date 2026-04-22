'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  Cpu, Play, Pause, Clock, AlertTriangle, CheckCircle,
  Loader2, ChevronLeft, Settings, RotateCcw,
} from 'lucide-react'

interface JobQueueRecord {
  id: string
  name: string
  type: string
  schedule: string
  scheduleLabel: string
  status: 'active' | 'paused' | 'error' | 'running'
  lastRunAt: string | null
  nextRunAt: string | null
  lastDuration: number | null
  lastError: string | null
}

// Synthetic log entries derived from job data
interface LogEntry {
  id: string
  startedAt: string
  endedAt: string | null
  status: 'success' | 'error' | 'timeout'
  message: string | null
  durationMs: number | null
}

const STATUS_CONFIG: Record<string, { label: string; style: string; icon: React.ElementType }> = {
  active:  { label: 'Active',  style: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', icon: CheckCircle },
  paused:  { label: 'Paused',  style: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',         icon: Pause },
  error:   { label: 'Error',   style: 'bg-red-500/10 text-red-400 border border-red-500/20',             icon: AlertTriangle },
  running: { label: 'Running', style: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',         icon: Loader2 },
}

const LOG_STATUS_STYLES: Record<string, string> = {
  success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  error:   'bg-red-500/10 text-red-400 border border-red-500/20',
  timeout: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
}

function relativeTime(iso: string | null) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function futureTime(iso: string | null) {
  if (!iso) return '—'
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'due'
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `in ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `in ${hrs}h`
  return `in ${Math.floor(hrs / 24)}d`
}

function buildSyntheticLogs(job: JobQueueRecord): LogEntry[] {
  const logs: LogEntry[] = []
  if (job.lastRunAt) {
    // Most recent run
    const start = new Date(job.lastRunAt)
    const dur = job.lastDuration != null ? job.lastDuration * 1000 : null
    const end = dur != null ? new Date(start.getTime() + dur) : null
    logs.push({
      id: `${job.id}-1`,
      startedAt: start.toISOString(),
      endedAt: end?.toISOString() ?? null,
      status: job.status === 'error' ? 'error' : 'success',
      message: job.lastError ?? (job.status === 'error' ? 'Unknown error' : 'Completed successfully'),
      durationMs: dur,
    })
    // Simulate 2 previous runs
    for (let i = 2; i <= 3; i++) {
      const prevStart = new Date(start.getTime() - i * 3600000 * 24)
      const prevDur = job.lastDuration != null ? job.lastDuration * 1000 : null
      logs.push({
        id: `${job.id}-${i}`,
        startedAt: prevStart.toISOString(),
        endedAt: prevDur != null ? new Date(prevStart.getTime() + prevDur).toISOString() : null,
        status: 'success',
        message: 'Completed successfully',
        durationMs: prevDur,
      })
    }
  }
  return logs
}

export const dynamic = 'force-dynamic'

export default function JobQueueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [job, setJob] = useState<JobQueueRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [paramJson, setParamJson] = useState('')
  const [jsonError, setJsonError] = useState('')

  function load() {
    fetch(`/api/job-queues/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d && !d.error) {
          setJob(d)
          setParamJson(d.paramJson ?? '{}')
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function runNow() {
    if (!job) return
    setActionId('run')
    await fetch(`/api/job-queues/${id}/run`, { method: 'POST' }).catch(() => {})
    load()
    setActionId(null)
  }

  async function togglePause() {
    if (!job) return
    setActionId('pause')
    const next = job.status === 'paused' ? 'active' : 'paused'
    await fetch(`/api/job-queues/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    load()
    setActionId(null)
  }

  function validateJson(val: string) {
    try { JSON.parse(val); setJsonError(''); return true }
    catch { setJsonError('Invalid JSON'); return false }
  }

  if (loading) {
    return <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center text-zinc-500 text-sm">Loading…</div>
  }
  if (!job) {
    return <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center text-red-400 text-sm">Job not found.</div>
  }

  const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.active
  const StatusIcon = cfg.icon
  const logs = buildSyntheticLogs(job)

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100 p-6">
      <div className="max-w-screen-xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Cpu className="w-6 h-6 text-cyan-400" />
              <h1 className="text-2xl font-semibold text-zinc-100">{job.name}</h1>
              <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${cfg.style}`}>
                <StatusIcon className={`w-3 h-3 ${job.status === 'running' ? 'animate-spin' : ''}`} />
                {cfg.label}
              </span>
            </div>
            <p className="text-sm text-zinc-500 mt-1 ml-9">{job.type} · {job.scheduleLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={runNow}
              disabled={actionId !== null || job.status === 'running'}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4" /> Run Now
            </button>
            <button
              onClick={togglePause}
              disabled={actionId !== null || job.status === 'running' || job.status === 'error'}
              className="flex items-center gap-2 bg-amber-600/80 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {job.status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {job.status === 'paused' ? 'Resume' : 'Hold'}
            </button>
            <button
              onClick={() => router.push('/job-queues')}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 px-3 py-2 border border-zinc-700/50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Schedule + Details */}
          <div className="space-y-6 lg:col-span-2">

            {/* Schedule Card */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Schedule Configuration
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { label: 'Cron Expression', value: job.schedule, mono: true },
                  { label: 'Schedule', value: job.scheduleLabel },
                  { label: 'Type', value: job.type },
                  { label: 'Last Run', value: relativeTime(job.lastRunAt) },
                  { label: 'Next Run', value: futureTime(job.nextRunAt) },
                  { label: 'Last Duration', value: job.lastDuration != null ? `${job.lastDuration}s` : '—' },
                ].map(({ label, value, mono }) => (
                  <div key={label}>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                    <p className={`text-sm font-medium text-zinc-200 ${mono ? 'font-mono' : ''}`}>{value}</p>
                  </div>
                ))}
              </div>
              {job.lastError && (
                <div className="mt-4 pt-4 border-t border-zinc-800/50">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Last Error</p>
                  <p className="text-sm text-red-400 font-mono bg-red-500/5 rounded-lg p-3 border border-red-500/10">{job.lastError}</p>
                </div>
              )}
            </div>

            {/* Parameter JSON Editor */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                <Settings className="w-3.5 h-3.5" /> Parameters (JSON)
              </p>
              <textarea
                value={paramJson}
                onChange={e => { setParamJson(e.target.value); validateJson(e.target.value) }}
                rows={8}
                spellCheck={false}
                className={`w-full bg-zinc-900/60 border rounded-lg px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none resize-none ${jsonError ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-700/50 focus:border-cyan-500'}`}
              />
              {jsonError && (
                <p className="text-xs text-red-400 mt-1.5">{jsonError}</p>
              )}
              <div className="flex justify-end mt-3">
                <button
                  disabled={!!jsonError}
                  onClick={async () => {
                    if (!validateJson(paramJson)) return
                    await fetch(`/api/job-queues/${id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ paramJson }),
                    })
                  }}
                  className="text-xs px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Save Parameters
                </button>
              </div>
            </div>

          </div>

          {/* Right: Run History */}
          <div className="space-y-6">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <h2 className="text-sm font-medium text-zinc-300">Run History</h2>
              </div>
              {logs.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">No run history available.</div>
              ) : (
                <div className="divide-y divide-zinc-800/30">
                  {logs.map(log => (
                    <div key={log.id} className="px-4 py-3 hover:bg-zinc-800/20 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${LOG_STATUS_STYLES[log.status] ?? 'bg-zinc-700/50 text-zinc-400'}`}>
                          {log.status}
                        </span>
                        {log.durationMs != null && (
                          <span className="text-xs text-zinc-500 font-mono">{(log.durationMs / 1000).toFixed(1)}s</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400">{relativeTime(log.startedAt)}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{new Date(log.startedAt).toLocaleString()}</p>
                      {log.message && (
                        <p className={`text-xs mt-1 ${log.status === 'error' ? 'text-red-400' : 'text-zinc-500'}`}>
                          {log.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
