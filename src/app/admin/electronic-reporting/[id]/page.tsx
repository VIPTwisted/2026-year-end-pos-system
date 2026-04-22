'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Play, Save } from 'lucide-react'

interface ERConfig {
  id: string
  name: string
  formatType: string
  category: string
  version: string
  status: string
  schemaJson: string | null
  templateUrl: string | null
  lastRunAt: string | null
  runCount: number
  createdAt: string
  updatedAt: string
}

interface SchemaField { name: string; type: string; path: string; required: boolean }

export const dynamic = 'force-dynamic'

export default function ERConfigDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [config, setConfig] = useState<ERConfig | null>(null)
  const [form, setForm] = useState<Partial<ERConfig>>({})
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/electronic-reporting/${id}`)
      .then(r => r.json())
      .then(d => { setConfig(d); setForm(d) })
  }, [id])

  async function save() {
    setSaving(true)
    const res = await fetch(`/api/admin/electronic-reporting/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    if (res.ok) { const d = await res.json(); setConfig(d); setForm(d) }
    setSaving(false)
  }

  async function runNow() {
    setRunning(true)
    const res = await fetch(`/api/admin/electronic-reporting/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'run' }),
    })
    if (res.ok) { const d = await res.json(); setConfig(d); setForm(d) }
    setRunning(false)
  }

  if (!config) return <main className="flex-1 bg-[#0f0f1a] p-6 text-zinc-500 text-xs">Loading...</main>

  let parsedFields: SchemaField[] = []
  try { if (config.schemaJson) parsedFields = JSON.parse(config.schemaJson) } catch { /* ignore */ }

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-screen">
      <TopBar
        title={config.name}
        breadcrumb={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Electronic Reporting', href: '/admin/electronic-reporting' },
        ]}
        actions={
          <div className="flex gap-2">
            <button onClick={runNow} disabled={running}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-600/30 rounded transition-colors">
              <Play className="w-3 h-3" /> {running ? 'Running...' : 'Run Now'}
            </button>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded transition-colors">
              <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      />

      <div className="p-6 max-w-2xl space-y-6">
        {/* Config Info */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200">Configuration Details</h3>
          {(['name', 'version', 'templateUrl'] as const).map(k => (
            <div key={k}>
              <label className="block text-xs text-zinc-500 mb-1 capitalize">{k === 'templateUrl' ? 'Template URL' : k}</label>
              <input value={(form[k] as string) ?? ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600" />
            </div>
          ))}
          <div className="grid grid-cols-3 gap-4">
            {['formatType', 'category', 'status'].map(k => (
              <div key={k}>
                <label className="block text-xs text-zinc-500 mb-1 capitalize">{k}</label>
                <input value={(form[k as keyof ERConfig] as string) ?? ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600" />
              </div>
            ))}
          </div>
        </div>

        {/* Run History */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4">Run History</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-zinc-900/50 rounded-lg p-3">
              <div className="text-zinc-500 mb-1">Total Runs</div>
              <div className="text-2xl font-bold text-zinc-100">{config.runCount}</div>
            </div>
            <div className="bg-zinc-900/50 rounded-lg p-3">
              <div className="text-zinc-500 mb-1">Last Run</div>
              <div className="text-zinc-300 font-medium">{config.lastRunAt ? new Date(config.lastRunAt).toLocaleString() : 'Never'}</div>
            </div>
          </div>
        </div>

        {/* Schema Fields */}
        {parsedFields.length > 0 && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4">Schema Fields</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="text-left pb-2">Name</th>
                  <th className="text-left pb-2">Type</th>
                  <th className="text-left pb-2">Path</th>
                  <th className="text-left pb-2">Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {parsedFields.map((f, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-4 text-zinc-300 font-medium">{f.name}</td>
                    <td className="py-2 pr-4 text-zinc-500 font-mono">{f.type}</td>
                    <td className="py-2 pr-4 text-zinc-500">{f.path || '—'}</td>
                    <td className="py-2">{f.required ? <span className="text-emerald-400">Yes</span> : <span className="text-zinc-600">No</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-[10px] text-zinc-700">
          Created {new Date(config.createdAt).toLocaleString()} &middot; Updated {new Date(config.updatedAt).toLocaleString()}
        </div>
      </div>
    </main>
  )
}
