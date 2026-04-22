'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Plus, Layers, X } from 'lucide-react'

type ResourceGroup = {
  id: string; groupNo: string; name: string; unitOfMeasure: string; createdAt: string
}

export default function ResourceGroupsPage() {
  const [groups, setGroups] = useState<ResourceGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ groupNo: '', name: '', unitOfMeasure: 'hour' })

  useEffect(() => {
    fetch('/api/projects/resource-groups')
      .then(r => r.json())
      .then(d => setGroups(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/projects/resource-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupNo: form.groupNo || undefined, name: form.name.trim(), unitOfMeasure: form.unitOfMeasure }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setGroups(prev => [...prev, data])
      setForm({ groupNo: '', name: '', unitOfMeasure: 'hour' })
      setShowForm(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[12px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50'
  const labelCls = 'block text-[10px] font-medium text-zinc-500 mb-1 uppercase tracking-wide'

  return (
    <>
      <TopBar title="Resource Groups" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-zinc-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-400" /> Resource Groups
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">Group related resources for planning</p>
          </div>
          <Button size="sm" onClick={() => setShowForm(s => !s)} className="gap-1.5 bg-blue-600 hover:bg-blue-500">
            <Plus className="w-3.5 h-3.5" /> New Group
          </Button>
        </div>

        {showForm && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold text-zinc-200">New Resource Group</h3>
              <button onClick={() => setShowForm(false)} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Group No.</label>
                <input type="text" value={form.groupNo} onChange={set('groupNo')} placeholder="Auto-generated" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Name <span className="text-red-400">*</span></label>
                <input type="text" value={form.name} onChange={set('name')} placeholder="e.g. IT Consultants" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Unit of Measure</label>
                <select value={form.unitOfMeasure} onChange={set('unitOfMeasure')} className={inputCls}>
                  <option value="hour">hour</option>
                  <option value="day">day</option>
                  <option value="piece">piece</option>
                </select>
              </div>
              {error && <div className="col-span-full text-[11px] text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>}
              <div className="col-span-full flex items-center gap-3 pt-1">
                <Button type="submit" size="sm" disabled={submitting} className="bg-blue-600 hover:bg-blue-500">
                  {submitting ? 'Adding…' : 'Create'}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {loading ? (
            <div className="py-10 text-center text-zinc-600 text-sm">Loading…</div>
          ) : groups.length === 0 ? (
            <div className="py-12 text-center text-zinc-600">
              <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-[13px] text-zinc-500">No resource groups yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-800/60">
                  <tr>
                    {['Group No.', 'Name', 'Unit of Measure', 'Created'].map(h => (
                      <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${['Group No.', 'Name'].includes(h) ? 'text-left' : 'text-right'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {groups.map(g => (
                    <tr key={g.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-blue-400">{g.groupNo}</td>
                      <td className="px-4 py-3 text-[13px] text-zinc-100">{g.name}</td>
                      <td className="px-4 py-3 text-right text-[12px] text-zinc-400">{g.unitOfMeasure}</td>
                      <td className="px-4 py-3 text-right text-[11px] text-zinc-600">
                        {new Date(g.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
