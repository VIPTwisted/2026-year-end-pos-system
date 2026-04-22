'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Save, ToggleLeft, ToggleRight } from 'lucide-react'

interface DataLakeExport {
  id: string
  exportName: string
  entities: string
  destination: string | null
  scheduleType: string
  status: string
  lastExportAt: string | null
  rowsExported: number
  createdAt: string
  updatedAt: string
}

export const dynamic = 'force-dynamic'

export default function DataLakeExportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [exp, setExp] = useState<DataLakeExport | null>(null)
  const [form, setForm] = useState<Partial<DataLakeExport>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/data-lake/${id}`)
      .then(r => r.json())
      .then(d => { setExp(d); setForm(d) })
  }, [id])

  async function save() {
    setSaving(true)
    const res = await fetch(`/api/admin/data-lake/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    if (res.ok) { const d = await res.json(); setExp(d); setForm(d) }
    setSaving(false)
  }

  async function toggleStatus() {
    if (!exp) return
    const newStatus = exp.status === 'active' ? 'inactive' : 'active'
    const res = await fetch(`/api/admin/data-lake/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) { const d = await res.json(); setExp(d); setForm(d) }
  }

  if (!exp) return <main className="flex-1 bg-[#0f0f1a] p-6 text-zinc-500 text-xs">Loading...</main>

  const isActive = exp.status === 'active'

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-screen">
      <TopBar
        title={exp.exportName}
        breadcrumb={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Data Lake', href: '/admin/data-lake' },
        ]}
        actions={
          <div className="flex gap-2 items-center">
            <button onClick={toggleStatus}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded transition-colors ${
                isActive
                  ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              }`}>
              {isActive ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
              {isActive ? 'Disable' : 'Enable'}
            </button>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded transition-colors">
              <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      />

      <div className="p-6 max-w-2xl space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Status', value: exp.status, color: isActive ? 'text-emerald-400' : 'text-zinc-400' },
            { label: 'Rows Exported', value: exp.rowsExported.toLocaleString(), color: 'text-blue-400' },
            { label: 'Schedule', value: exp.scheduleType, color: 'text-violet-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
              <div className="text-xs text-zinc-500 mb-2">{k.label}</div>
              <div className={`text-sm font-bold capitalize ${k.color}`}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Edit Form */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200">Export Configuration</h3>
          {[
            { label: 'Export Name', k: 'exportName' as const },
            { label: 'Destination URL', k: 'destination' as const },
            { label: 'Entities (comma-separated)', k: 'entities' as const },
          ].map(f => (
            <div key={f.k}>
              <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
              <input value={(form[f.k] as string) ?? ''} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600" />
            </div>
          ))}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Schedule Type</label>
            <select value={form.scheduleType ?? 'continuous'} onChange={e => setForm(p => ({ ...p, scheduleType: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600">
              {['continuous', 'daily', 'weekly', 'manual'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Entities display */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">Tracked Entities</h3>
          <div className="flex flex-wrap gap-2">
            {exp.entities.split(',').map(e => e.trim()).filter(Boolean).map(ent => (
              <span key={ent} className="px-2.5 py-1 rounded text-xs bg-blue-600/10 text-blue-400 border border-blue-500/20">{ent}</span>
            ))}
          </div>
        </div>

        <div className="text-[10px] text-zinc-700">
          Created {new Date(exp.createdAt).toLocaleString()} &middot; Last export {exp.lastExportAt ? new Date(exp.lastExportAt).toLocaleString() : 'Never'}
        </div>
      </div>
    </main>
  )
}
