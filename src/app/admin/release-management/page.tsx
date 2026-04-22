'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Zap, Plus, Filter } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { cn } from '@/lib/utils'

interface FeatureFlag {
  id: string
  featureKey: string
  featureName: string
  module: string | null
  waveRelease: string | null
  status: string
  enabledAt: string | null
}

export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  enabled: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  disabled: 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
  preview: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

export default function ReleaseManagementPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [moduleFilter, setModuleFilter] = useState('')
  const [waveFilter, setWaveFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetch('/api/admin/release-management')
      .then(r => r.json())
      .then(d => { setFlags(d); setLoading(false) })
  }, [])

  async function toggle(id: string, currentStatus: string) {
    const nextStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled'
    const res = await fetch(`/api/admin/release-management/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })
    if (res.ok) {
      const updated = await res.json()
      setFlags(prev => prev.map(f => f.id === id ? { ...f, ...updated } : f))
    }
  }

  async function enableAllPreview() {
    const previewFlags = flags.filter(f => f.status === 'preview')
    await Promise.all(previewFlags.map(f =>
      fetch(`/api/admin/release-management/${f.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'enabled' }),
      }).then(r => r.json())
    ))
    const res = await fetch('/api/admin/release-management')
    setFlags(await res.json())
  }

  const filtered = flags.filter(f => {
    if (moduleFilter && f.module !== moduleFilter) return false
    if (waveFilter && f.waveRelease !== waveFilter) return false
    if (statusFilter && f.status !== statusFilter) return false
    return true
  })

  const total = flags.length
  const enabled = flags.filter(f => f.status === 'enabled').length
  const preview = flags.filter(f => f.status === 'preview').length
  const wave1 = flags.filter(f => f.waveRelease?.includes('Wave 1')).length

  const modules = [...new Set(flags.map(f => f.module).filter(Boolean))] as string[]
  const waves = [...new Set(flags.map(f => f.waveRelease).filter(Boolean))] as string[]

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-screen">
      <TopBar
        title="Release Management"
        breadcrumb={[{ label: 'Admin', href: '/admin/users' }]}
        actions={
          <div className="flex gap-2">
            {preview > 0 && (
              <button onClick={enableAllPreview}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-600/30 rounded transition-colors">
                <Zap className="w-3 h-3" /> Enable All Preview ({preview})
              </button>
            )}
            <Link href="/admin/release-management/new"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
              <Plus className="w-3 h-3" /> New Feature
            </Link>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Features', value: total, color: 'text-blue-400' },
            { label: 'Enabled', value: enabled, color: 'text-emerald-400' },
            { label: 'Preview', value: preview, color: 'text-amber-400' },
            { label: 'Wave 1 Features', value: wave1, color: 'text-violet-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className={`w-4 h-4 ${k.color}`} />
                <span className="text-xs text-zinc-500">{k.label}</span>
              </div>
              <div className="text-2xl font-bold text-zinc-100">{k.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#16213e] border border-zinc-800/50 rounded-lg text-zinc-300 focus:outline-none focus:border-blue-600">
            <option value="">All Modules</option>
            {modules.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={waveFilter} onChange={e => setWaveFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#16213e] border border-zinc-800/50 rounded-lg text-zinc-300 focus:outline-none focus:border-blue-600">
            <option value="">All Waves</option>
            {waves.map(w => <option key={w}>{w}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#16213e] border border-zinc-800/50 rounded-lg text-zinc-300 focus:outline-none focus:border-blue-600">
            <option value="">All Statuses</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
            <option value="preview">Preview</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Feature</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Module</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Wave</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Status</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Enabled Date</th>
                  <th className="text-right px-4 py-3 font-medium uppercase tracking-widest">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading ? (
                  <tr><td colSpan={6} className="py-16 text-center text-zinc-600">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center text-zinc-600">No features found</td></tr>
                ) : filtered.map(f => (
                  <tr key={f.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/release-management/${f.id}`} className="font-medium text-zinc-200 hover:text-blue-400 transition-colors">
                        {f.featureName}
                      </Link>
                      <div className="text-zinc-600 font-mono mt-0.5">{f.featureKey}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{f.module ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-500">{f.waveRelease ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border capitalize', STATUS_STYLES[f.status] ?? STATUS_STYLES.disabled)}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {f.enabledAt ? new Date(f.enabledAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => toggle(f.id, f.status)}
                        className={cn('px-3 py-1 text-[10px] rounded border transition-colors',
                          f.status === 'enabled'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        )}>
                        {f.status === 'enabled' ? 'Disable' : 'Enable'}
                      </button>
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
