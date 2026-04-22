'use client'
import { useEffect, useState } from 'react'
import { FileBarChart, Plus, Play, Calendar, Download, Eye, Import, Clock } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { cn } from '@/lib/utils'

interface ERConfig {
  id: string
  name: string
  format: string
  version: string
  provider: string
  status: string
  lastRun: string | null
  nextScheduled: string | null
  outputSize: string | null
  runCount: number
}

interface RunHistory {
  id: string
  config: string
  status: string
  started: string
  completed: string | null
  outputSize: string | null
  configId: string
}

export const dynamic = 'force-dynamic'

const FORMAT_STYLES: Record<string, string> = {
  'XBRL':    'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'X12 EDI': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'XML':     'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'JSON':    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'EDIFACT': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'PDF':     'bg-red-500/10 text-red-400 border-red-500/20',
  'Excel':   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

const CONFIG_STATUS_STYLES: Record<string, string> = {
  'Active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Draft':  'bg-zinc-700/50 text-zinc-400 border-zinc-700',
}

const RUN_STATUS_STYLES: Record<string, string> = {
  'Success':   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Failed':    'bg-red-500/10 text-red-400 border-red-500/20',
  'Running':   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Scheduled': 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
}

export default function ElectronicReportingPage() {
  const [configs, setConfigs] = useState<ERConfig[]>([])
  const [runHistory, setRunHistory] = useState<RunHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/electronic-reporting')
      .then(r => r.json())
      .then(d => { setConfigs(d.configs); setRunHistory(d.runHistory); setLoading(false) })
  }, [])

  const active = configs.filter(c => c.status === 'Active').length
  const totalRuns = configs.reduce((s, c) => s + c.runCount, 0)
  const failed = runHistory.filter(r => r.status === 'Failed').length
  const formats = new Set(configs.map(c => c.format)).size

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
      <TopBar
        title="Electronic Reporting"
        breadcrumb={[{ label: 'Admin', href: '/admin/users' }]}
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
              <Plus className="w-3 h-3" /> New Config
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
              <Play className="w-3 h-3" /> Run Now
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
              <Calendar className="w-3 h-3" /> Schedule
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
              <Download className="w-3 h-3" /> Download Output
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
              <Eye className="w-3 h-3" /> View Log
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
              <Import className="w-3 h-3" /> Import Format
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Active Configs', value: active, icon: FileBarChart, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Total Runs', value: totalRuns, icon: Play, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Failed (Recent)', value: failed, icon: Clock, color: 'text-red-400', bg: 'bg-red-500/10', highlight: failed > 0 },
            { label: 'Format Types', value: formats, icon: FileBarChart, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          ].map(k => (
            <div key={k.label}
              className={cn('bg-[#16213e] border rounded-xl p-4', (k as any).highlight ? 'border-red-500/30' : 'border-zinc-800/50')}>
              <div className="flex items-center gap-2 mb-2">
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', k.bg)}>
                  <k.icon className={cn('w-4 h-4', k.color)} />
                </div>
                <span className="text-xs text-zinc-500">{k.label}</span>
              </div>
              <div className={cn('text-3xl font-bold', (k as any).highlight ? 'text-red-400' : 'text-zinc-100')}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Report Configurations */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">Report Configurations</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Config Name</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Format</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Version</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Provider</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Status</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Last Run</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Next Scheduled</th>
                  <th className="text-right px-4 py-3 font-medium uppercase tracking-widest">Runs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading ? (
                  <tr><td colSpan={8} className="py-16 text-center text-zinc-600">Loading...</td></tr>
                ) : configs.map(c => (
                  <tr key={c.id} className="hover:bg-zinc-900/30 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-medium text-zinc-200">{c.name}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border uppercase', FORMAT_STYLES[c.format] ?? 'bg-zinc-700/50 text-zinc-400 border-zinc-700')}>
                        {c.format}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-500">{c.version}</td>
                    <td className="px-4 py-3 text-zinc-400">{c.provider}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border', CONFIG_STATUS_STYLES[c.status] ?? '')}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {c.lastRun ? new Date(c.lastRun).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {c.nextScheduled ? new Date(c.nextScheduled).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-500 font-mono">{c.runCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Run History */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">Run History</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Run #</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Configuration</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Status</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Started</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Completed</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Output Size</th>
                  <th className="text-right px-4 py-3 font-medium uppercase tracking-widest">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading ? (
                  <tr><td colSpan={7} className="py-8 text-center text-zinc-600">Loading...</td></tr>
                ) : runHistory.map(r => (
                  <tr key={r.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-zinc-500">{r.id}</td>
                    <td className="px-4 py-3 text-zinc-300">{r.config}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-medium border',
                        RUN_STATUS_STYLES[r.status] ?? 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
                        r.status === 'Running' && 'animate-pulse'
                      )}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(r.started).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {r.completed ? new Date(r.completed).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{r.outputSize ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      {r.outputSize ? (
                        <button className="flex items-center gap-1 px-2.5 py-1 text-[10px] bg-zinc-700/30 hover:bg-zinc-700/60 text-zinc-400 border border-zinc-700 rounded transition-colors ml-auto">
                          <Download className="w-3 h-3" /> Download
                        </button>
                      ) : (
                        <span className="text-zinc-700">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
