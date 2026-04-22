'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'

interface CoverageGroup {
  id: string; name: string; coverageType: string; coverageDays: number
  minQty: number; maxQty: number; reorderPoint: number; safetyStock: number
  leadTimeDays: number; products: string
}

const INIT = { name: '', coverageType: 'period', coverageDays: 30, minQty: 0, maxQty: 100, reorderPoint: 10, safetyStock: 5, leadTimeDays: 7 }
const COVERAGE_BADGE: Record<string, string> = {
  period: 'bg-blue-500/20 text-blue-400',
  'min-max': 'bg-purple-500/20 text-purple-400',
  requirement: 'bg-emerald-500/20 text-emerald-400',
}

export default function CoverageGroupsPage() {
  const [groups, setGroups] = useState<CoverageGroup[]>([])
  const [form, setForm] = useState(INIT)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(INIT)

  useEffect(() => { fetchGroups() }, [])

  async function fetchGroups() {
    const data = await fetch('/api/planning/coverage-groups').then(r => r.json())
    setGroups(Array.isArray(data) ? data : [])
  }

  async function create() {
    if (!form.name.trim()) return
    await fetch('/api/planning/coverage-groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setForm(INIT); setShowForm(false); fetchGroups()
  }

  async function update(id: string) {
    await fetch(`/api/planning/coverage-groups/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) })
    setEditingId(null); fetchGroups()
  }

  async function remove(id: string) {
    if (!confirm('Delete this coverage group?')) return
    await fetch(`/api/planning/coverage-groups/${id}`, { method: 'DELETE' })
    fetchGroups()
  }

  function startEdit(g: CoverageGroup) {
    setEditingId(g.id)
    setEditForm({ name: g.name, coverageType: g.coverageType, coverageDays: g.coverageDays, minQty: g.minQty, maxQty: g.maxQty, reorderPoint: g.reorderPoint, safetyStock: g.safetyStock, leadTimeDays: g.leadTimeDays })
  }

  function productCount(products: string) { try { return JSON.parse(products).length } catch { return 0 } }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Coverage Groups</h1>
          <p className="text-zinc-400 text-sm mt-1">Define supply coverage parameters per product group</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />New Group
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-100">New Coverage Group</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Group Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Electronics - Period 30"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Coverage Type</label>
              <select value={form.coverageType} onChange={e => setForm({ ...form, coverageType: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                <option value="period">Period</option>
                <option value="min-max">Min-Max</option>
                <option value="requirement">Requirement</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Coverage Days</label>
              <input type="number" value={form.coverageDays} onChange={e => setForm({ ...form, coverageDays: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Min Qty</label>
              <input type="number" value={form.minQty} onChange={e => setForm({ ...form, minQty: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Max Qty</label>
              <input type="number" value={form.maxQty} onChange={e => setForm({ ...form, maxQty: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Safety Stock</label>
              <input type="number" value={form.safetyStock} onChange={e => setForm({ ...form, safetyStock: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Lead Time (days)</label>
              <input type="number" value={form.leadTimeDays} onChange={e => setForm({ ...form, leadTimeDays: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={create} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Create Group</button>
            <button onClick={() => { setShowForm(false); setForm(INIT) }} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-800">
            {['Name', 'Type', 'Coverage Days', 'Min / Max', 'Safety Stock', 'Lead Time', 'Products', 'Actions'].map(h => (
              <th key={h} className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {groups.length === 0 && <tr><td colSpan={8} className="px-5 py-10 text-center text-zinc-600">No coverage groups yet.</td></tr>}
            {groups.map(g => (
              editingId === g.id ? (
                <tr key={g.id} className="border-b border-zinc-800 bg-zinc-800/40">
                  <td className="px-3 py-2"><input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none" /></td>
                  <td className="px-3 py-2">
                    <select value={editForm.coverageType} onChange={e => setEditForm({ ...editForm, coverageType: e.target.value })}
                      className="bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none">
                      <option value="period">Period</option><option value="min-max">Min-Max</option><option value="requirement">Requirement</option>
                    </select>
                  </td>
                  <td className="px-3 py-2"><input type="number" value={editForm.coverageDays} onChange={e => setEditForm({ ...editForm, coverageDays: Number(e.target.value) })}
                    className="w-20 bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none" /></td>
                  <td className="px-3 py-2 text-zinc-400 text-xs">{editForm.minQty} / {editForm.maxQty}</td>
                  <td className="px-3 py-2"><input type="number" value={editForm.safetyStock} onChange={e => setEditForm({ ...editForm, safetyStock: Number(e.target.value) })}
                    className="w-16 bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none" /></td>
                  <td className="px-3 py-2"><input type="number" value={editForm.leadTimeDays} onChange={e => setEditForm({ ...editForm, leadTimeDays: Number(e.target.value) })}
                    className="w-16 bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none" /></td>
                  <td className="px-3 py-2 text-zinc-500 text-xs">{productCount(g.products)}</td>
                  <td className="px-3 py-2"><div className="flex gap-2">
                    <button onClick={() => update(g.id)} className="text-emerald-400 hover:text-emerald-300"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingId(null)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              ) : (
                <tr key={g.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-5 py-3 text-zinc-100 font-medium">{g.name}</td>
                  <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${COVERAGE_BADGE[g.coverageType] ?? 'bg-zinc-700 text-zinc-300'}`}>{g.coverageType}</span></td>
                  <td className="px-5 py-3 text-zinc-400">{g.coverageDays}d</td>
                  <td className="px-5 py-3 text-zinc-400 text-xs">{g.minQty} / {g.maxQty}</td>
                  <td className="px-5 py-3 text-zinc-400">{g.safetyStock}</td>
                  <td className="px-5 py-3 text-zinc-400">{g.leadTimeDays}d</td>
                  <td className="px-5 py-3 text-zinc-400">{productCount(g.products)}</td>
                  <td className="px-5 py-3"><div className="flex gap-2">
                    <button onClick={() => startEdit(g)} className="text-zinc-400 hover:text-zinc-200 transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(g.id)} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
