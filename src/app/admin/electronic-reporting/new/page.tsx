'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Trash2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface SchemaField {
  name: string
  type: string
  path: string
  required: boolean
}

export default function NewERConfigPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    formatType: 'xlsx',
    category: 'finance',
    version: '1.0',
    templateUrl: '',
  })
  const [fields, setFields] = useState<SchemaField[]>([])
  const [newField, setNewField] = useState<SchemaField>({ name: '', type: 'string', path: '', required: false })

  function setF(key: string, val: string) { setForm(p => ({ ...p, [key]: val })) }

  function addField() {
    if (!newField.name) return
    setFields(p => [...p, { ...newField }])
    setNewField({ name: '', type: 'string', path: '', required: false })
  }
  function removeField(i: number) { setFields(p => p.filter((_, idx) => idx !== i)) }

  async function save() {
    if (!form.name) return
    setSaving(true)
    const payload = { ...form, schemaJson: JSON.stringify(fields) }
    const res = await fetch('/api/admin/electronic-reporting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const cfg = await res.json()
      router.push(`/admin/electronic-reporting/${cfg.id}`)
    }
    setSaving(false)
  }

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-screen">
      <TopBar
        title="New ER Configuration"
        breadcrumb={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Electronic Reporting', href: '/admin/electronic-reporting' },
        ]}
      />

      <div className="p-6 max-w-2xl space-y-6">
        {/* Basic Info */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200">Configuration</h3>
          {(['name', 'version', 'templateUrl'] as const).map(k => (
            <div key={k}>
              <label className="block text-xs text-zinc-500 mb-1 capitalize">{k === 'templateUrl' ? 'Template URL' : k}</label>
              <input
                value={form[k]}
                onChange={e => setF(k, e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600"
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Format Type</label>
              <select value={form.formatType} onChange={e => setF('formatType', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600">
                {['xlsx', 'xml', 'json', 'pdf', 'csv', 'txt'].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Category</label>
              <select value={form.category} onChange={e => setF('category', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600">
                {['finance', 'tax', 'regulatory', 'custom'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Schema Fields */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200">Schema Fields</h3>

          {fields.length > 0 && (
            <table className="w-full text-xs mb-2">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="text-left pb-2">Name</th>
                  <th className="text-left pb-2">Type</th>
                  <th className="text-left pb-2">Path</th>
                  <th className="text-left pb-2">Req</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {fields.map((f, i) => (
                  <tr key={i}>
                    <td className="py-1.5 pr-2 text-zinc-300">{f.name}</td>
                    <td className="py-1.5 pr-2 text-zinc-500 font-mono">{f.type}</td>
                    <td className="py-1.5 pr-2 text-zinc-500">{f.path || '—'}</td>
                    <td className="py-1.5 pr-2">{f.required ? <span className="text-emerald-400">Yes</span> : <span className="text-zinc-600">No</span>}</td>
                    <td className="py-1.5">
                      <button onClick={() => removeField(i)} className="text-red-500 hover:text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Add Field */}
          <div className="border border-zinc-700/50 rounded-lg p-3 space-y-2">
            <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-widest">Add Field</p>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Field name" value={newField.name}
                onChange={e => setNewField(p => ({ ...p, name: e.target.value }))}
                className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-blue-600" />
              <select value={newField.type} onChange={e => setNewField(p => ({ ...p, type: e.target.value }))}
                className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-blue-600">
                {['string', 'number', 'boolean', 'date', 'array'].map(t => <option key={t}>{t}</option>)}
              </select>
              <input placeholder="JSON path" value={newField.path}
                onChange={e => setNewField(p => ({ ...p, path: e.target.value }))}
                className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-blue-600" />
              <div className="flex items-center gap-2 px-2">
                <input type="checkbox" id="req" checked={newField.required}
                  onChange={e => setNewField(p => ({ ...p, required: e.target.checked }))}
                  className="accent-blue-600" />
                <label htmlFor="req" className="text-xs text-zinc-400">Required</label>
              </div>
            </div>
            <button onClick={addField} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors">
              <Plus className="w-3 h-3" /> Add Field
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => router.back()} className="px-4 py-2 text-xs border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-800 transition-colors">Cancel</button>
          <button onClick={save} disabled={saving || !form.name}
            className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors">
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </main>
  )
}
