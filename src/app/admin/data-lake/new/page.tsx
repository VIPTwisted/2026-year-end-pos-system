'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Check } from 'lucide-react'

export const dynamic = 'force-dynamic'

const AVAILABLE_ENTITIES = ['Customers', 'Orders', 'Products', 'Inventory', 'Finance', 'Employees', 'Vendors', 'Transactions']

export default function NewDataLakeExportPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    exportName: '',
    destination: '',
    scheduleType: 'continuous',
  })
  const [selectedEntities, setSelectedEntities] = useState<string[]>([])

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }
  function toggleEntity(ent: string) {
    setSelectedEntities(prev => prev.includes(ent) ? prev.filter(e => e !== ent) : [...prev, ent])
  }

  async function save() {
    if (!form.exportName || selectedEntities.length === 0) return
    setSaving(true)
    const payload = { ...form, entities: selectedEntities.join(', '), status: 'inactive' }
    const res = await fetch('/api/admin/data-lake', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    if (res.ok) { router.push('/admin/data-lake') }
    setSaving(false)
  }

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-screen">
      <TopBar
        title="New Data Lake Export"
        breadcrumb={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Data Lake', href: '/admin/data-lake' },
        ]}
      />
      <div className="p-6 max-w-lg space-y-6">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Export Name *</label>
            <input value={form.exportName} onChange={e => set('exportName', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600" />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Destination URL</label>
            <input value={form.destination} onChange={e => set('destination', e.target.value)}
              placeholder="https://storage.example.com/lake"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600" />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Schedule Type</label>
            <select value={form.scheduleType} onChange={e => set('scheduleType', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600">
              <option value="continuous">Continuous</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          {/* Entity multi-select */}
          <div>
            <label className="block text-xs text-zinc-500 mb-2">Entities to Export *</label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_ENTITIES.map(ent => {
                const selected = selectedEntities.includes(ent)
                return (
                  <button
                    key={ent}
                    type="button"
                    onClick={() => toggleEntity(ent)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs border transition-colors ${
                      selected
                        ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                  >
                    {ent}
                    {selected && <Check className="w-3 h-3" />}
                  </button>
                )
              })}
            </div>
            {selectedEntities.length > 0 && (
              <p className="text-[11px] text-zinc-600 mt-2">{selectedEntities.length} selected: {selectedEntities.join(', ')}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => router.back()} className="px-4 py-2 text-xs border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-800 transition-colors">Cancel</button>
          <button onClick={save} disabled={saving || !form.exportName || selectedEntities.length === 0}
            className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors">
            {saving ? 'Saving...' : 'Create Export'}
          </button>
        </div>
      </div>
    </main>
  )
}
