'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cpu, Play, Pause, Clock, AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react'

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

const STATUS_CONFIG: Record<string, { label: string; style: string; icon: React.ElementType }> = {
  active:  { label: 'Active',  style: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', icon: CheckCircle },
  paused:  { label: 'Paused',  style: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',         icon: Pause },
  error:   { label: 'Error',   style: 'bg-red-500/10 text-red-400 border border-red-500/20',             icon: AlertTriangle },
  running: { label: 'Running', style: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',         icon: Loader2 },
}

const TYPE_STYLES: Record<string, string> = {
  Finance:     'bg-indigo-500/10 text-indigo-400',
  Marketing:   'bg-pink-500/10 text-pink-400',
  Inventory:   'bg-amber-500/10 text-amber-400',
  Reporting:   'bg-purple-500/10 text-purple-400',
  Maintenance: 'bg-zinc-500/10 text-zinc-400',
  Integration: 'bg-cyan-500/10 text-cyan-400',
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

export default function JobQueuesPage() {
  const [jobs, setJobs] = useState<JobQueueRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  function load() {
    fetch('/api/job-queues')
      .then(r => r.json())
      .then(d => { setJobs(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function runNow(id: string) {
    setActionId(id)
    await fetch(`/api/job-queues/${id}/run`, { method: 'POST' })
    load()
    setActionId(null)
  }

  async function togglePause(job: JobQueueRecord) {
    setActionId(job.id)
    const next = job.status === 'paused' ? 'active' : 'paused'
    await fetch(`/api/job-queues/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    load()
    setActionId(null)
  }

  const counts = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    running: jobs.filter(j => j.status === 'running').length,
    error: jobs.filter(j => j.status === 'error').length,
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100 p-6">
      <div className="max-w-screen-xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-cyan-400" />
              Job Queues
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Background task scheduler and monitor</p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 px-3 py-2 border border-zinc-700/50 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Jobs',  value: counts.total,   color: 'text-cyan-400',    bg: 'bg-cyan-500/10' },
            { label: 'Active',      value: counts.active,  color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Running Now', value: counts.running, color: 'text-blue-400',    bg: 'bg-blue-500/10' },
            { label: 'Errors',      value: counts.error,   color: 'text-red-400',     bg: 'bg-red-500/10' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4 flex items-center gap-4">
              <div className={`${bg} rounded-lg p-2.5`}>
                <Cpu className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">{value}</p>
                <p className="text-xs text-zinc-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Jobs Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-zinc-500 text-sm">Loading jobs…</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Job Name</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Schedule</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Last Run</th>
                  <th className="text-left px-4 py-3 hidden xl:table-cell">Next Run</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {jobs.map(job => {
                  const cfg = STATUS_CONFIG[job.status]
                  const StatusIcon = cfg.icon
                  const isActing = actionId === job.id
                  return (
                    <tr key={job.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-zinc-200 font-medium">{job.name}</span>
                          {job.lastError && (
                            <p className="text-xs text-red-400 mt-0.5 truncate max-w-[240px]">{job.lastError}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_STYLES[job.type] ?? 'bg-zinc-700/50 text-zinc-400'}`}>
                          {job.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div>
                          <span className="font-mono text-xs text-zinc-400">{job.schedule}</span>
                          <p className="text-xs text-zinc-600 mt-0.5">{job.scheduleLabel}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                          <Clock className="w-3 h-3" />
                          {relativeTime(job.lastRunAt)}
                          {job.lastDuration !== null && (
                            <span className="text-zinc-600">· {job.lastDuration}s</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell text-xs text-zinc-500">
                        {futureTime(job.nextRunAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full w-fit ${cfg.style}`}>
                          <StatusIcon className={`w-3 h-3 ${job.status === 'running' ? 'animate-spin' : ''}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => runNow(job.id)}
                            disabled={isActing || job.status === 'running'}
                            title="Run Now"
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-40"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => togglePause(job)}
                            disabled={isActing || job.status === 'running' || job.status === 'error'}
                            title={job.status === 'paused' ? 'Resume' : 'Pause'}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-40"
                          >
                            {job.status === 'paused' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                          </button>
                          <Link
                            href={`/job-queues/${job.id}/log`}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                            title="View Log"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}
