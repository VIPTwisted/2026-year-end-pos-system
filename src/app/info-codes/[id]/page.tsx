'use client'

import { use, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Plus, Monitor } from 'lucide-react'

type InfoSubCode = { id: string; subCodeId: string; description: string; sortOrder: number }
type InfoCode = {
  id: string
  infoCodeId: string
  description: string
  prompt: string
  inputType: string
  triggerType: string
  isRequired: boolean
  isActive: boolean
  subCodes: InfoSubCode[]
}

export default function InfoCodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [code, setCode] = useState<InfoCode | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<InfoCode>>({})
  const [subForm, setSubForm] = useState({ subCodeId: '', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/info-codes/${id}`)
      .then((r) => r.json())
      .then((data) => { setCode(data); setEditing(data) })
      .finally(() => setLoading(false))
  }, [id])

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/info-codes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })
    const updated = await res.json()
    setCode((c) => c ? { ...c, ...updated } : c)
    setSaving(false)
  }

  async function handleAddSubCode() {
    const res = await fetch(`/api/info-codes/${id}/sub-codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...subForm, sortOrder: (code?.subCodes.length ?? 0) + 1 }),
    })
    const sub = await res.json()
    setCode((c) => c ? { ...c, subCodes: [...c.subCodes, sub] } : c)
    setSubForm({ subCodeId: '', description: '' })
  }

  if (loading) return <div className="p-6 text-zinc-400">Loading...</div>
  if (!code) return <div className="p-6 text-zinc-400">Not found</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">{code.infoCodeId}</h1>
        <p className="text-zinc-400 text-sm mt-1">{code.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <h2 className="text-sm font-medium text-zinc-300 mb-4">Info Code Fields</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Description</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  value={editing.description ?? ''} onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Prompt</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  value={editing.prompt ?? ''} onChange={(e) => setEditing((p) => ({ ...p, prompt: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5">Input Type</label>
                  <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={editing.inputType ?? 'list'} onChange={(e) => setEditing((p) => ({ ...p, inputType: e.target.value }))}>
                    <option value="list">List</option>
                    <option value="text">Text</option>
                    <option value="date">Date</option>
                    <option value="number">Number</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5">Trigger</label>
                  <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={editing.triggerType ?? 'manual'} onChange={(e) => setEditing((p) => ({ ...p, triggerType: e.target.value }))}>
                    <option value="manual">Manual</option>
                    <option value="line">Line</option>
                    <option value="payment">Payment</option>
                    <option value="transaction">Transaction</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-blue-500" checked={editing.isRequired ?? false} onChange={(e) => setEditing((p) => ({ ...p, isRequired: e.target.checked }))} />
                <span className="text-sm text-zinc-300">Required</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-blue-500" checked={editing.isActive ?? true} onChange={(e) => setEditing((p) => ({ ...p, isActive: e.target.checked }))} />
                <span className="text-sm text-zinc-300">Active</span>
              </label>
              <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors mt-1">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-medium text-zinc-300">POS Preview</h2>
            </div>
            <div className="bg-zinc-950 border border-zinc-700 rounded-lg p-4">
              <p className="text-xs text-zinc-500 mb-2 font-mono">POS PROMPT</p>
              <p className="text-sm font-medium text-zinc-200 mb-3">{editing.prompt || code.prompt}</p>
              {editing.inputType === 'list' || editing.inputType === undefined ? (
                <div className="space-y-1.5">
                  {code.subCodes.map((s) => (
                    <div key={s.id} className="bg-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-300 flex items-center gap-2">
                      <span className="text-zinc-500 font-mono">{s.subCodeId}</span>
                      {s.description}
                    </div>
                  ))}
                  {code.subCodes.length === 0 && <div className="text-xs text-zinc-600 italic">No sub-codes</div>}
                </div>
              ) : (
                <div className="bg-zinc-800 rounded px-3 py-2 text-xs text-zinc-500 italic">{editing.inputType} input field</div>
              )}
              {(editing.isRequired ?? code.isRequired) && <p className="text-xs text-amber-400 mt-2">* Required</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h2 className="text-sm font-medium text-zinc-300">Sub-Codes</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-zinc-400 font-medium px-4 py-2 text-xs">#</th>
                  <th className="text-left text-zinc-400 font-medium px-4 py-2 text-xs">Sub Code ID</th>
                  <th className="text-left text-zinc-400 font-medium px-4 py-2 text-xs">Description</th>
                </tr>
              </thead>
              <tbody>
                {code.subCodes.length === 0 ? (
                  <tr><td colSpan={3} className="text-center text-zinc-500 py-4 text-xs">No sub-codes</td></tr>
                ) : code.subCodes.map((s, i) => (
                  <tr key={s.id} className="border-b border-zinc-800/50">
                    <td className="px-4 py-2 text-zinc-500 text-xs">{i + 1}</td>
                    <td className="px-4 py-2 font-mono text-xs text-zinc-300">{s.subCodeId}</td>
                    <td className="px-4 py-2 text-zinc-400 text-xs">{s.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Add Sub-Code</h3>
            <div className="space-y-2">
              <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                placeholder="Sub Code ID (e.g. JOHN)" value={subForm.subCodeId} onChange={(e) => setSubForm((f) => ({ ...f, subCodeId: e.target.value }))} />
              <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                placeholder="Description" value={subForm.description} onChange={(e) => setSubForm((f) => ({ ...f, description: e.target.value }))} />
              <button onClick={handleAddSubCode} disabled={!subForm.subCodeId || !subForm.description}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-3 py-2 rounded-lg transition-colors w-full justify-center">
                <Plus className="w-4 h-4" /> Add Sub-Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
