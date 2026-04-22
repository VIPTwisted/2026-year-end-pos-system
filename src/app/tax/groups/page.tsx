'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Plus, X } from 'lucide-react'
import Link from 'next/link'

type TaxGroup = {
  id: string
  groupCode: string
  groupName: string
  description: string | null
  isActive: boolean
  components: { id: string }[]
}

export default function TaxGroupsPage() {
  const [groups, setGroups] = useState<TaxGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ groupCode: '', groupName: '', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/tax/groups')
      .then((r) => r.json())
      .then(setGroups)
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate() {
    setSaving(true)
    const res = await fetch('/api/tax/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const created = await res.json()
    setGroups((prev) => [...prev, { ...created, components: [] }])
    setShowModal(false)
    setForm({ groupCode: '', groupName: '', description: '' })
    setSaving(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Tax Groups</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage tax group codes and components</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Group
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Group Code</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Name</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Components</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center text-zinc-500 py-8">Loading...</td></tr>
            ) : groups.length === 0 ? (
              <tr><td colSpan={4} className="text-center text-zinc-500 py-8">No tax groups</td></tr>
            ) : groups.map((g) => (
              <tr key={g.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/tax/groups/${g.id}`} className="text-blue-400 hover:text-blue-300 font-mono">{g.groupCode}</Link>
                </td>
                <td className="px-4 py-3 text-zinc-100">{g.groupName}</td>
                <td className="px-4 py-3 text-zinc-400">{g.components.length}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', g.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500')}>
                    {g.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-100">New Tax Group</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Group Code</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  value={form.groupCode} onChange={(e) => setForm((f) => ({ ...f, groupCode: e.target.value }))} placeholder="e.g. STANDARD" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Name</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  value={form.groupName} onChange={(e) => setForm((f) => ({ ...f, groupName: e.target.value }))} placeholder="Standard Tax Group" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Description</label>
                <textarea className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none" rows={2}
                  value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm py-2 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.groupCode || !form.groupName} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">
                {saving ? 'Saving...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
