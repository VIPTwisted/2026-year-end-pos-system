'use client'

import { useState, useEffect } from 'react'
import { Plus, Zap, PauseCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Sequence = {
  id: string
  name: string
  description: string | null
  status: string
  targetType: string
  steps: { id: string }[]
  createdAt: string
}

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', targetType: 'leads' })

  async function load() {
    setLoading(true)
    const res = await fetch('/api/sales/sequences')
    setSequences(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function create() {
    await fetch('/api/sales/sequences', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowModal(false)
    setForm({ name: '', description: '', targetType: 'leads' })
    load()
  }

  async function toggle(id: string) {
    await fetch(`/api/sales/sequences/${id}/activate`, { method: 'POST' })
    load()
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Sequences</h1>
          <p className="text-sm text-zinc-400 mt-1">Automated outreach sequences</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-md transition-colors">
          <Plus className="w-4 h-4" /> New Sequence
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Target</th>
              <th className="text-center px-4 py-3 text-zinc-500 font-medium">Steps</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-600">Loading...</td></tr>}
            {!loading && sequences.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-600">No sequences found</td></tr>}
            {sequences.map((seq) => (
              <tr key={seq.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/sales/sequences/${seq.id}`} className="text-zinc-200 hover:text-white font-medium">{seq.name}</Link>
                  {seq.description && <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-xs">{seq.description}</p>}
                </td>
                <td className="px-4 py-3 text-zinc-400 capitalize">{seq.targetType}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-800 text-zinc-300 text-xs font-medium">{seq.steps.length}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded text-xs capitalize', seq.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400')}>{seq.status}</span>
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(seq.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(seq.id)} className={cn('flex items-center gap-1 text-xs transition-colors', seq.status === 'active' ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300')}>
                    {seq.status === 'active' ? <><PauseCircle className="w-3.5 h-3.5" /> Pause</> : <><Zap className="w-3.5 h-3.5" /> Activate</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100">New Sequence</h2>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Target Type</label>
              <select value={form.targetType} onChange={(e) => setForm({ ...form, targetType: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500">
                <option value="leads">Leads</option>
                <option value="contacts">Contacts</option>
                <option value="accounts">Accounts</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 px-3 py-2 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">Cancel</button>
              <button onClick={create} className="flex-1 px-3 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
