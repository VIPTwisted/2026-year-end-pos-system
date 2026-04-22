'use client'

// TODO: Add CDXJob model to Prisma schema when ready.
// Static mock data used until schema is defined.

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronRight, RefreshCw, Play, Clock, CheckCircle, XCircle,
  AlertCircle, Download, Upload, ArrowUpDown, X, Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

type JobType = 'P-job' | 'N-job'
type JobStatus = 'idle' | 'running' | 'success' | 'failed' | 'scheduled'
type JobDirection = 'download' | 'upload'

interface CDXJob {
  id: string
  name: string
  jobNumber: string      // P-1001, N-1001, etc.
  type: JobType
  direction: JobDirection
  description: string
  channels: string[]
  lastSync: string | null
  nextSync: string | null
  schedule: string       // cron-style human label
  status: JobStatus
  recordCount: number | null
  duration: number | null  // seconds
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_JOBS: CDXJob[] = [
  // P-jobs (Pull/Download — HQ → Channel)
  {
    id: 'j001',
    name: 'Download Product Catalog',
    jobNumber: 'P-1001',
    type: 'P-job',
    direction: 'download',
    description: 'Sync master product catalog from HQ to all connected channels',
    channels: ['Online Store', 'POS Registers', 'Kiosk'],
    lastSync: '2026-04-22T08:15:00Z',
    nextSync: '2026-04-22T20:15:00Z',
    schedule: 'Every 12h',
    status: 'success',
    recordCount: 4812,
    duration: 34,
  },
  {
    id: 'j002',
    name: 'Download Price Lists',
    jobNumber: 'P-1002',
    type: 'P-job',
    direction: 'download',
    description: 'Push price book updates and active price rules to channels',
    channels: ['Online Store', 'POS Registers'],
    lastSync: '2026-04-22T06:00:00Z',
    nextSync: '2026-04-23T06:00:00Z',
    schedule: 'Daily 6 AM',
    status: 'success',
    recordCount: 620,
    duration: 8,
  },
  {
    id: 'j003',
    name: 'Download Discounts & Promotions',
    jobNumber: 'P-1003',
    type: 'P-job',
    direction: 'download',
    description: 'Distribute active discount rules and promotional codes',
    channels: ['Online Store', 'POS Registers', 'Mobile App'],
    lastSync: '2026-04-22T09:00:00Z',
    nextSync: '2026-04-22T21:00:00Z',
    schedule: 'Every 12h',
    status: 'success',
    recordCount: 87,
    duration: 5,
  },
  {
    id: 'j004',
    name: 'Download Customer Data',
    jobNumber: 'P-1004',
    type: 'P-job',
    direction: 'download',
    description: 'Sync customer accounts, loyalty balances and tier changes',
    channels: ['POS Registers', 'Mobile App'],
    lastSync: '2026-04-22T07:30:00Z',
    nextSync: '2026-04-22T19:30:00Z',
    schedule: 'Every 12h',
    status: 'failed',
    recordCount: null,
    duration: null,
  },
  {
    id: 'j005',
    name: 'Download Store Configurations',
    jobNumber: 'P-1005',
    type: 'P-job',
    direction: 'download',
    description: 'Push register configs, receipt profiles, and functionality profiles',
    channels: ['POS Registers'],
    lastSync: '2026-04-21T00:00:00Z',
    nextSync: '2026-04-22T23:59:00Z',
    schedule: 'Daily midnight',
    status: 'idle',
    recordCount: 12,
    duration: 2,
  },
  // N-jobs (Push/Upload — Channel → HQ)
  {
    id: 'j006',
    name: 'Upload Transactions (P-job)',
    jobNumber: 'N-1001',
    type: 'N-job',
    direction: 'upload',
    description: 'Upload POS transactions from all stores to HQ for reconciliation',
    channels: ['POS Registers', 'Mobile App'],
    lastSync: '2026-04-22T10:45:00Z',
    nextSync: '2026-04-22T11:45:00Z',
    schedule: 'Every 1h',
    status: 'running',
    recordCount: null,
    duration: null,
  },
  {
    id: 'j007',
    name: 'Upload Inventory Adjustments',
    jobNumber: 'N-1002',
    type: 'N-job',
    direction: 'upload',
    description: 'Send inventory count sheets and stock adjustment records to HQ',
    channels: ['POS Registers', 'Warehouse'],
    lastSync: '2026-04-22T08:00:00Z',
    nextSync: '2026-04-22T20:00:00Z',
    schedule: 'Every 12h',
    status: 'success',
    recordCount: 234,
    duration: 11,
  },
  {
    id: 'j008',
    name: 'Upload Customer Activity',
    jobNumber: 'N-1003',
    type: 'N-job',
    direction: 'upload',
    description: 'Push loyalty transactions, new enrollments, and point redemptions',
    channels: ['POS Registers', 'Online Store', 'Mobile App'],
    lastSync: '2026-04-22T09:15:00Z',
    nextSync: '2026-04-22T10:15:00Z',
    schedule: 'Every 1h',
    status: 'scheduled',
    recordCount: 1024,
    duration: 7,
  },
  {
    id: 'j009',
    name: 'Upload Sales Reports',
    jobNumber: 'N-1004',
    type: 'N-job',
    direction: 'upload',
    description: 'Aggregate daily sales data per store and send to HQ reporting',
    channels: ['All Channels'],
    lastSync: '2026-04-22T00:05:00Z',
    nextSync: '2026-04-23T00:05:00Z',
    schedule: 'Daily 12:05 AM',
    status: 'success',
    recordCount: 42,
    duration: 3,
  },
]

const CHANNELS = ['All Channels', 'Online Store', 'POS Registers', 'Mobile App', 'Kiosk', 'Warehouse']

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_ICON: Record<JobStatus, React.FC<{ className?: string }>> = {
  idle:      Clock,
  running:   RefreshCw,
  success:   CheckCircle,
  failed:    XCircle,
  scheduled: AlertCircle,
}

const STATUS_COLOR: Record<JobStatus, string> = {
  idle:      'text-zinc-500',
  running:   'text-blue-400 animate-spin',
  success:   'text-emerald-400',
  failed:    'text-red-400',
  scheduled: 'text-amber-400',
}

const STATUS_BADGE: Record<JobStatus, string> = {
  idle:      'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
  running:   'bg-blue-500/20 text-blue-300 border-blue-500/30',
  success:   'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  failed:    'bg-red-500/20 text-red-300 border-red-500/30',
  scheduled: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

function fmtTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function CDXPage() {
  const [jobs, setJobs] = useState<CDXJob[]>(MOCK_JOBS)
  const [filterType, setFilterType] = useState<'all' | 'P-job' | 'N-job'>('all')
  const [runModal, setRunModal] = useState(false)
  const [runForm, setRunForm] = useState({ jobId: '', channel: 'All Channels', mode: 'immediate' as 'immediate' | 'scheduled', scheduledAt: '' })
  const [running, setRunning] = useState(false)

  const filtered = jobs.filter(j => filterType === 'all' || j.type === filterType)

  const pJobs = jobs.filter(j => j.type === 'P-job')
  const nJobs = jobs.filter(j => j.type === 'N-job')
  const failing = jobs.filter(j => j.status === 'failed')
  const activeRuns = jobs.filter(j => j.status === 'running')

  function openRunModal(jobId = '') {
    setRunForm({ jobId, channel: 'All Channels', mode: 'immediate', scheduledAt: '' })
    setRunModal(true)
  }

  async function handleRunJob() {
    setRunning(true)
    // Stub: would POST to /api/channels/cdx with runForm
    await new Promise(r => setTimeout(r, 800))
    // Optimistically mark selected job as running
    if (runForm.jobId) {
      setJobs(prev => prev.map(j =>
        j.id === runForm.jobId ? { ...j, status: runForm.mode === 'immediate' ? 'running' : 'scheduled' } : j
      ))
    }
    setRunning(false)
    setRunModal(false)
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/channels" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Channels</Link>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Commerce Data Exchange (CDX)</h1>
            <p className="text-zinc-500 text-xs mt-0.5">Data distribution jobs between HQ and channel endpoints</p>
          </div>
        </div>
        <button
          onClick={() => openRunModal()}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Play className="w-4 h-4" /> Run Job
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Download className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-500">P-Jobs (Download)</span>
          </div>
          <div className="text-xl font-bold text-zinc-100">{pJobs.length}</div>
        </div>
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-zinc-500">N-Jobs (Upload)</span>
          </div>
          <div className="text-xl font-bold text-zinc-100">{nJobs.length}</div>
        </div>
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-500">Currently Running</span>
          </div>
          <div className="text-xl font-bold text-zinc-100">{activeRuns.length}</div>
        </div>
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-zinc-500">Failed Jobs</span>
          </div>
          <div className={cn('text-xl font-bold', failing.length > 0 ? 'text-red-400' : 'text-zinc-100')}>{failing.length}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
        {(['all', 'P-job', 'N-job'] as const).map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              filterType === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            {t === 'all' ? 'All Jobs' : t === 'P-job' ? 'P-Jobs (Download)' : 'N-Jobs (Upload)'}
          </button>
        ))}
      </div>

      {/* Job Schedule Table */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-zinc-800">
          <ArrowUpDown className="w-4 h-4 text-violet-400" />
          <span className="font-semibold text-zinc-100">Job Schedule</span>
          <span className="text-zinc-500 text-sm">({filtered.length} jobs)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Job</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Direction</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Channels</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Schedule</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Last Sync</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Next Sync</th>
                <th className="text-right px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Records</th>
                <th className="text-center px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.map(job => {
                const StatusIcon = STATUS_ICON[job.status]
                return (
                  <tr key={job.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">{job.jobNumber}</span>
                        <div>
                          <div className="font-medium text-zinc-200 text-sm">{job.name}</div>
                          <div className="text-xs text-zinc-600 mt-0.5 max-w-xs truncate">{job.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {job.direction === 'download'
                          ? <Download className="w-3.5 h-3.5 text-blue-400" />
                          : <Upload className="w-3.5 h-3.5 text-emerald-400" />}
                        <span className={cn('text-xs capitalize', job.direction === 'download' ? 'text-blue-400' : 'text-emerald-400')}>
                          {job.direction}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {job.channels.slice(0, 2).map(ch => (
                          <span key={ch} className="text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">{ch}</span>
                        ))}
                        {job.channels.length > 2 && (
                          <span className="text-xs text-zinc-600">+{job.channels.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{job.schedule}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{fmtTime(job.lastSync)}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{fmtTime(job.nextSync)}</td>
                    <td className="px-4 py-3 text-right">
                      {job.recordCount != null
                        ? <span className="text-xs font-mono text-zinc-400">{job.recordCount.toLocaleString()}</span>
                        : <span className="text-xs text-zinc-700">—</span>}
                      {job.duration != null && (
                        <div className="text-[10px] text-zinc-700 text-right">{job.duration}s</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border capitalize flex items-center gap-1 w-fit mx-auto', STATUS_BADGE[job.status])}>
                        <StatusIcon className={cn('w-3 h-3', STATUS_COLOR[job.status])} />
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openRunModal(job.id)}
                        className="text-zinc-600 hover:text-violet-400 transition-colors"
                        title="Run this job"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-zinc-800">
            <Download className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-zinc-100">P-Job Distribution</span>
            <span className="text-zinc-500 text-xs ml-1">(HQ → Channels)</span>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {pJobs.map(j => {
              const StatusIcon = STATUS_ICON[j.status]
              return (
                <div key={j.id} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={cn('w-4 h-4 shrink-0', STATUS_COLOR[j.status])} />
                    <div>
                      <div className="text-sm text-zinc-200 font-medium">{j.name}</div>
                      <div className="text-xs text-zinc-600">{j.jobNumber} · {j.schedule}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => openRunModal(j.id)}
                    className="text-zinc-600 hover:text-blue-400 transition-colors shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-zinc-800">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-zinc-100">N-Job Distribution</span>
            <span className="text-zinc-500 text-xs ml-1">(Channels → HQ)</span>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {nJobs.map(j => {
              const StatusIcon = STATUS_ICON[j.status]
              return (
                <div key={j.id} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={cn('w-4 h-4 shrink-0', STATUS_COLOR[j.status])} />
                    <div>
                      <div className="text-sm text-zinc-200 font-medium">{j.name}</div>
                      <div className="text-xs text-zinc-600">{j.jobNumber} · {j.schedule}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => openRunModal(j.id)}
                    className="text-zinc-600 hover:text-emerald-400 transition-colors shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Run Job Modal */}
      {runModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <div>
                <h2 className="text-base font-semibold text-zinc-100">Run CDX Job</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Configure and dispatch a data exchange job</p>
              </div>
              <button onClick={() => setRunModal(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Job</label>
                <select
                  value={runForm.jobId}
                  onChange={e => setRunForm(f => ({ ...f, jobId: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500"
                >
                  <option value="">Select job...</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.jobNumber} — {j.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Target Channel</label>
                <select
                  value={runForm.channel}
                  onChange={e => setRunForm(f => ({ ...f, channel: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500"
                >
                  {CHANNELS.map(ch => (
                    <option key={ch} value={ch}>{ch}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Run Mode</label>
                <div className="flex gap-2">
                  {(['immediate', 'scheduled'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setRunForm(f => ({ ...f, mode }))}
                      className={cn(
                        'flex-1 py-2 rounded-lg text-sm border font-medium transition-colors capitalize',
                        runForm.mode === mode
                          ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {runForm.mode === 'scheduled' && (
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Schedule Date/Time</label>
                  <input
                    type="datetime-local"
                    value={runForm.scheduledAt}
                    onChange={e => setRunForm(f => ({ ...f, scheduledAt: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setRunModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-2.5 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRunJob}
                  disabled={running || !runForm.jobId}
                  className={cn(
                    'flex-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2',
                    (running || !runForm.jobId) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {running ? 'Dispatching...' : `Run ${runForm.mode === 'immediate' ? 'Now' : 'Scheduled'}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
