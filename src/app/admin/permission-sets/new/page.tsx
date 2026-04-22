'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Plus, Trash2 } from 'lucide-react'

const OBJECT_TYPES = ['Table','Page','Report','Codeunit','XMLport','MenuSuite','Query','System'] as const

interface PermRow {
  key: string
  objectType: string
  objectId: string
  objectName: string
  canRead: boolean
  canInsert: boolean
  canModify: boolean
  canDelete: boolean
  canExecute: boolean
}

function emptyRow(): PermRow {
  return { key: crypto.randomUUID(), objectType: 'Table', objectId: '', objectName: '', canRead: false, canInsert: false, canModify: false, canDelete: false, canExecute: false }
}

export default function NewPermissionSetPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ roleId: '', name: '', setType: 'User-Defined' })
  const [rows, setRows] = useState<PermRow[]>([emptyRow()])

  function setF(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  function updateRow(key: string, field: string, val: string | boolean) {
    setRows(prev => prev.map(r => r.key === key ? { ...r, [field]: val } : r))
  }

  function addRow() { setRows(p => [...p, emptyRow()]) }
  function removeRow(key: string) { setRows(p => p.filter(r => r.key !== key)) }

  async function submit() {
    if (!form.roleId || !form.name) { setError('Role ID and Name are required.'); return }
    setSaving(true); setError('')
    const permissions = rows
      .filter(r => r.objectType)
      .map(({ key: _key, ...rest }) => rest)

    const res = await fetch('/api/admin/permission-sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, permissions }),
    })
    if (res.ok) {
      router.push('/admin/permission-sets')
    } else {
      const j = await res.json()
      setError(j.error ?? 'Failed to create')
    }
    setSaving(false)
  }

  const BOOL_COLS = [
    { field: 'canRead', label: 'Read' },
    { field: 'canInsert', label: 'Insert' },
    { field: 'canModify', label: 'Modify' },
    { field: 'canDelete', label: 'Delete' },
    { field: 'canExecute', label: 'Execute' },
  ]

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto min-h-[100dvh]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100">New Permission Set</h1>
            <p className="text-[11px] text-zinc-500">Define a new role with granular object permissions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.back()} className="px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">Cancel</button>
          <button onClick={submit} disabled={saving} className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors disabled:opacity-60">
            {saving ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 px-4 py-2 rounded text-xs text-red-400 border border-red-500/30 bg-red-500/10 max-w-3xl">{error}</div>}

      <div className="max-w-5xl space-y-4">
        {/* General */}
        <div className="rounded-lg px-4 py-4" style={{ background: 'rgba(15,18,48,0.8)', border: '1px solid rgba(99,102,241,0.1)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(165,180,252,0.5)' }}>General</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Role ID <span className="text-red-400">*</span></label>
              <input value={form.roleId} onChange={e => setF('roleId', e.target.value)} placeholder="D365_BC_SALES"
                className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Name <span className="text-red-400">*</span></label>
              <input value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Sales User"
                className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Type</label>
              <select value={form.setType} onChange={e => setF('setType', e.target.value)}
                className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                {['User-Defined','System','Extension'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Permissions table */}
        <div className="rounded-lg" style={{ background: 'rgba(15,18,48,0.8)', border: '1px solid rgba(99,102,241,0.1)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(165,180,252,0.5)' }}>Permissions</p>
            <button onClick={addRow} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Line
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="text-left px-4 py-2.5 font-medium uppercase tracking-widest w-32">Object Type</th>
                  <th className="text-left px-2 py-2.5 font-medium uppercase tracking-widest w-24">Object ID</th>
                  <th className="text-left px-2 py-2.5 font-medium uppercase tracking-widest">Object Name</th>
                  {BOOL_COLS.map(c => (
                    <th key={c.field} className="text-center px-2 py-2.5 font-medium uppercase tracking-widest w-16">{c.label}</th>
                  ))}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {rows.map(row => (
                  <tr key={row.key} className="hover:bg-zinc-800/20">
                    <td className="px-4 py-2">
                      <select value={row.objectType} onChange={e => updateRow(row.key, 'objectType', e.target.value)}
                        className="bg-zinc-800/60 border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 w-full">
                        {OBJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input value={row.objectId} onChange={e => updateRow(row.key, 'objectId', e.target.value)}
                        className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500" placeholder="ID" />
                    </td>
                    <td className="px-2 py-2">
                      <input value={row.objectName} onChange={e => updateRow(row.key, 'objectName', e.target.value)}
                        className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500" placeholder="Name" />
                    </td>
                    {BOOL_COLS.map(c => (
                      <td key={c.field} className="px-2 py-2 text-center">
                        <input type="checkbox" checked={row[c.field as keyof PermRow] as boolean}
                          onChange={e => updateRow(row.key, c.field, e.target.checked)}
                          className="accent-indigo-500 w-3.5 h-3.5" />
                      </td>
                    ))}
                    <td className="px-2 py-2">
                      <button onClick={() => removeRow(row.key)} className="text-zinc-700 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
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
