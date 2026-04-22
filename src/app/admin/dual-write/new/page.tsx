'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

export const dynamic = 'force-dynamic'

export default function NewDualWriteMappingPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    mappingName: '',
    sourceEntity: '',
    targetEntity: '',
    syncDirection: 'bidirectional',
    status: 'paused',
  })

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  async function save() {
    if (!form.mappingName || !form.sourceEntity || !form.targetEntity) return
    setSaving(true)
    const res = await fetch('/api/admin/dual-write', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    if (res.ok) { router.push('/admin/dual-write') }
    setSaving(false)
  }

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-screen">
      <TopBar
        title="New Dual-Write Mapping"
        breadcrumb={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Dual-Write', href: '/admin/dual-write' },
        ]}
      />
      <div className="p-6 max-w-lg space-y-6">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Mapping Name *</label>
            <input value={form.mappingName} onChange={e => set('mappingName', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Source Entity *</label>
              <select value={form.sourceEntity} onChange={e => set('sourceEntity', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600">
                <option value="">Select...</option>
                {['Finance', 'Commerce', 'Dataverse', 'Supply Chain', 'HR'].map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Target Entity *</label>
              <select value={form.targetEntity} onChange={e => set('targetEntity', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600">
                <option value="">Select...</option>
                {['Finance', 'Commerce', 'Dataverse', 'Supply Chain', 'HR'].map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Sync Direction</label>
            <select value={form.syncDirection} onChange={e => set('syncDirection', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600">
              <option value="bidirectional">Bidirectional</option>
              <option value="source_to_target">Source → Target</option>
              <option value="target_to_source">Target → Source</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Initial Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600">
              <option value="paused">Paused</option>
              <option value="running">Running</option>
              <option value="stopped">Stopped</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="px-4 py-2 text-xs border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-800 transition-colors">Cancel</button>
          <button onClick={save} disabled={saving || !form.mappingName || !form.sourceEntity || !form.targetEntity}
            className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors">
            {saving ? 'Saving...' : 'Create Mapping'}
          </button>
        </div>
      </div>
    </main>
  )
}
