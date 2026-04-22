'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, CheckCircle, XCircle, Loader2, Cpu } from 'lucide-react'

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

interface RunLogEntry {
  id: string
  runAt: string
  status: 'success' | 'error' | 'running'
  duration: number | null // seconds
  message: string
}

// Generate deterministic mock run history from a job id
function generateRunHistory(jobId: string, lastError: string | null): RunLogEntry[] {
  const now = Date.now()
  const entries: RunLogEntry[] = []
  const seed = jobId.charCodeAt(jobId.length - 1)
  for (let i = 0; i < 50; i++) {
    const offset = i * 1000 * 60 * 60 * (2 + (seed % 4))
    const runAt = new Date(now - offset).toISOString()
    const isError = lastError && i === 0 ? true : (seed + i) % 9 === 0
    entries.push({
      id: `${jobId}_run_${50 - i}`,
      runAt,
      status: i === 0 && isError ? 'error' : 'success',
      duration: isError ? null : 1 + ((seed * (i + 1)) % 60),
      message: isError
        ? (lastError ?? 'Unknown error')
        : `Completed successfully. ${Math.floor(5 + (seed * i) % 200)} records processed.`,
    })
  }
  return entries
}

const RUN_STATUS_CONFIG = {
  success: { icon: CheckCircle, style: 'text-emerald-400', label: 'Success' },
  error:   { icon: XCircle,    style: 'text-red-400',     label: 'Error'   },
  running: { icon: Loader2,    style: 'text-blue-400',    label: 'Running' },
} as const

export default function JobLogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [job, setJob] = useState<JobQueueRecord | null>(null)
  const [log, setLog] = useState<RunLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/job-queues/${id}`)
      .then(r => r.json())
      .then((j: JobQueueRecord) => {
        setJob(j)
        setLog(generateRunHistory(id, j.lastError))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center text-zinc-500 text-sm">Loading…</div>
  }
  if (!job) {
    return <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center text-red-400 text-sm">Job not found.</div>
  }

  const successCount = log.filter(l => l.status === 'success').length
  const errorCount = log.filter(l => l.status === 'error').length
  const avgDuration = log.filter(l => l.duration !== null).reduce((s, l) => s + (l.duration ?? 0), 0) / (log.filter(l => l.duration !== null).length || 1)

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100 p-6">
      <div className="max-w-screen-xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Cpu className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl font-semibold text-zinc-100">{job.name}</h1>
            </div>
            <p className="text-sm text-zinc-500 mt-1 ml-9">
              {job.scheduleLabel} · <span className="font-mono text-xs">{job.schedule}</span>
            </p>
          </div>
          <button
            onClick={() => router.push('/job-queues')}
            className="text-sm text-zinc-400 hover:text-zinc-200 px-3 py-2 border border-zinc-700/50 rounded-lg transition-colors"
          >
            Back
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Successful Runs', value: successCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Errors',          value: errorCount,   color: 'text-red-400',     bg: 'bg-red-500/10' },
            { label: 'Avg Duration',    value: `${avgDuration.toFixed(1)}s`, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4 flex items-center gap-4">
              <div className={`${bg} rounded-lg p-2.5`}>
                <Clock className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-zinc-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Log Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-300">Run History (last {log.length})</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/50 text-zinc-500 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">Run #</th>
                <th className="text-left px-4 py-3">Timestamp</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3 hidden md:table-cell">Duration</th>
                <th className="text-left px-4 py-3">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {log.map((entry, idx) => {
                const cfg = RUN_STATUS_CONFIG[entry.status]
                const Icon = cfg.icon
                return (
                  <tr key={entry.id} className="hover:bg-zinc-800/20">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">#{50 - idx}</td>
                    <td className="px-4 py-3 text-zinc-300 text-xs">
                      {new Date(entry.runAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 text-xs w-fit ${cfg.style}`}>
                        <Icon className={`w-3.5 h-3.5 ${entry.status === 'running' ? 'animate-spin' : ''}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-400 font-mono text-xs hidden md:table-cell">
                      {entry.duration !== null ? `${entry.duration}s` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400 max-w-xs truncate">{entry.message}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
