'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Building2, X, Pencil, Check, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface FinCostCenter {
  id: string
  code: string
  name: string
  department: string | null
  manager: string | null
  budget: number
  isActive: boolean
  createdAt: string
}

interface Toast {
  msg: string
  type: 'ok' | 'err'
}

export default function CostCentersPage() {
  const [centers, setCenters] = useState<FinCostCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<Toast | null>(null)

  // Create form
  const [showCreate, setShowCreate] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newName, setNewName] = useState('')
  const [newDept, setNewDept] = useState('')
  const [newMgr, setNewMgr] = useState('')
  const [newBudget, setNewBudget] = useState('')
  const [creating, setCreating] = useState(false)

  // Edit row
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDept, setEditDept] = useState('')
  const [editMgr, setEditMgr] = useState('')
  const [editBudget, setEditBudget] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const fetchCenters = useCallback(async () => {
    try {
      const res = await fetch('/api/finance/cost-centers')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCenters(data)
    } catch {
      notify('Failed to load cost centers', 'err')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCenters()
  }, [fetchCenters])

  const totalCenters = centers.length
  const activeCenters = centers.filter(c => c.isActive).length
  const totalBudget = centers.reduce((sum, c) => sum + Number(c.budget), 0)

  const handleCreate = async () => {
    if (!newCode.trim() || !newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/finance/cost-centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode,
          name: newName,
          department: newDept || undefined,
          manager: newMgr || undefined,
          budget: newBudget ? parseFloat(newBudget) : 0,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        notify(d.error ?? 'Failed to create', 'err')
        return
      }
      notify('Cost center created')
      setShowCreate(false)
      setNewCode('')
      setNewName('')
      setNewDept('')
      setNewMgr('')
      setNewBudget('')
      fetchCenters()
    } catch {
      notify('Failed to create cost center', 'err')
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (center: FinCostCenter) => {
    setEditId(center.id)
    setEditName(center.name)
    setEditDept(center.department ?? '')
    setEditMgr(center.manager ?? '')
    setEditBudget(String(center.budget))
  }

  const handleSaveEdit = async () => {
    if (!editId) return
    setEditSaving(true)
    try {
      const res = await fetch(`/api/finance/cost-centers/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          department: editDept || null,
          manager: editMgr || null,
          budget: editBudget ? parseFloat(editBudget) : 0,
        }),
      })
      if (!res.ok) throw new Error()
      notify('Saved')
      setEditId(null)
      fetchCenters()
    } catch {
      notify('Failed to save', 'err')
    } finally {
      setEditSaving(false)
    }
  }

  const handleToggleActive = async (center: FinCostCenter) => {
    try {
      const res = await fetch(`/api/finance/cost-centers/${center.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !center.isActive }),
      })
      if (!res.ok) throw new Error()
      notify(center.isActive ? 'Deactivated' : 'Activated')
      fetchCenters()
    } catch {
      notify('Failed to update', 'err')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/finance/cost-centers/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      notify('Deleted')
      setDeletingId(null)
      fetchCenters()
    } catch {
      notify('Failed to delete', 'err')
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] flex flex-col">
      <TopBar title="Cost Centers" />

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all
            ${toast.type === 'ok' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}
        >
          {toast.msg}
        </div>
      )}

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-100">Cost Centers</h2>
              <p className="text-sm text-zinc-500 mt-0.5">Financial dimension cost centers with budget tracking</p>
            </div>
            <button
              onClick={() => setShowCreate(v => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Cost Center
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Centers</div>
              <div className="text-2xl font-bold text-zinc-100">{totalCenters}</div>
              <div className="text-xs text-zinc-500 mt-1">{activeCenters} active</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Active Centers</div>
              <div className="text-2xl font-bold text-emerald-400">{activeCenters}</div>
              <div className="text-xs text-zinc-500 mt-1">{totalCenters - activeCenters} inactive</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Budget</div>
              <div className="text-2xl font-bold text-blue-400 tabular-nums">{formatCurrency(totalBudget)}</div>
              <div className="text-xs text-zinc-500 mt-1">across all centers</div>
            </div>
          </div>

          {/* Create Form */}
          {showCreate && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">New Cost Center</span>
                <button onClick={() => setShowCreate(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Code *</label>
                  <input
                    value={newCode}
                    onChange={e => setNewCode(e.target.value.toUpperCase())}
                    placeholder="CC001"
                    maxLength={20}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Name *</label>
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Sales Team"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Department</label>
                  <input
                    value={newDept}
                    onChange={e => setNewDept(e.target.value)}
                    placeholder="Sales"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Manager</label>
                  <input
                    value={newMgr}
                    onChange={e => setNewMgr(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Budget ($)</label>
                  <input
                    value={newBudget}
                    onChange={e => setNewBudget(e.target.value)}
                    placeholder="50000"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none tabular-nums"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newCode.trim() || !newName.trim()}
                  className="px-4 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded transition-colors"
                >
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-zinc-100">All Cost Centers</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-zinc-500 text-sm">Loading…</div>
            ) : centers.length === 0 ? (
              <div className="p-10 text-center">
                <Building2 className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No cost centers yet</p>
                <p className="text-xs text-zinc-600 mt-1">Click "New Cost Center" to add one</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Code</th>
                    <th className="text-left py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                    <th className="text-left py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Department</th>
                    <th className="text-left py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Manager</th>
                    <th className="text-right py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Budget</th>
                    <th className="text-center py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                    <th className="px-5 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {centers.map(center => (
                    <tr key={center.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-zinc-400">{center.code}</td>
                      {editId === center.id ? (
                        <>
                          <td className="py-2 pr-3">
                            <input
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              value={editDept}
                              onChange={e => setEditDept(e.target.value)}
                              placeholder="Department"
                              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              value={editMgr}
                              onChange={e => setEditMgr(e.target.value)}
                              placeholder="Manager"
                              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 pr-5 text-right">
                            <input
                              value={editBudget}
                              onChange={e => setEditBudget(e.target.value)}
                              type="number"
                              min="0"
                              step="0.01"
                              className="w-28 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none tabular-nums text-right"
                            />
                          </td>
                          <td className="py-2 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium
                              ${center.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                              {center.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-5 py-2">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={handleSaveEdit}
                                disabled={editSaving}
                                className="p-1 text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditId(null)}
                                className="p-1 text-zinc-500 hover:text-zinc-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 pr-3 text-sm text-zinc-200 font-medium">{center.name}</td>
                          <td className="py-3 pr-3 text-sm text-zinc-400">{center.department ?? <span className="text-zinc-700">—</span>}</td>
                          <td className="py-3 pr-3 text-sm text-zinc-400">{center.manager ?? <span className="text-zinc-700">—</span>}</td>
                          <td className="py-3 pr-5 text-right text-sm text-zinc-300 tabular-nums font-semibold">
                            {formatCurrency(Number(center.budget))}
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => handleToggleActive(center)}
                              className="transition-colors"
                              title={center.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {center.isActive ? (
                                <ToggleRight className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-zinc-600" />
                              )}
                            </button>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => startEdit(center)}
                                className="p-1 text-zinc-500 hover:text-blue-400 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              {deletingId === center.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDelete(center.id)}
                                    className="px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setDeletingId(null)}
                                    className="text-zinc-500 hover:text-zinc-300"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeletingId(center.id)}
                                  className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
