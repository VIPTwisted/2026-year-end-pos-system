'use client'
import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  Clock, Plus, Pencil, Trash2, X, Check, AlertCircle, CheckCircle,
} from 'lucide-react'

type CaseSLA = {
  id: string
  name: string
  priority: string
  firstResponseHours: number
  resolutionHours: number
  isActive: boolean
  createdAt: string
  _count: { cases: number }
}

type Metrics = {
  breachedSla: number
  casesByPriority: Record<string, number>
}

const PRIORITY_COLORS: Record<string, string> = {
  low:      'bg-zinc-700 text-zinc-300',
  medium:   'bg-blue-500/20 text-blue-300',
  high:     'bg-orange-500/20 text-orange-300',
  critical: 'bg-red-500/20 text-red-400',
}
const PRIORITY_ORDER = ['low', 'medium', 'high', 'critical']

export default function SlaPage() {
  const [policies, setPolicies]   = useState<CaseSLA[]>([])
  const [metrics, setMetrics]     = useState<Metrics | null>(null)
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId]       = useState<string | null>(null)
  const [editForm, setEditForm]   = useState<Partial<CaseSLA>>({})
  const [form, setForm]           = useState({
    name: '', priority: 'medium', firstResponseHours: 4, resolutionHours: 24,
  })

  const fetchAll = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/service/sla').then((r) => r.json()),
      fetch('/api/service/metrics').then((r) => r.json()),
    ]).then(([slaPolicies, m]) => {
      setPolicies(slaPolicies)
      setMetrics(m)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/service/sla', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowModal(false)
      setForm({ name: '', priority: 'medium', firstResponseHours: 4, resolutionHours: 24 })
      fetchAll()
    }
  }

  async function handleEdit(id: string) {
    const res = await fetch(`/api/service/sla/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    if (res.ok) { setEditId(null); fetchAll() }
  }

  async function toggleActive(policy: CaseSLA) {
    await fetch(`/api/service/sla/${policy.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !policy.isActive }),
    })
    fetchAll()
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/service/sla/${id}`, { method: 'DELETE' })
    if (res.ok) fetchAll()
  }

  function startEdit(p: CaseSLA) {
    setEditId(p.id)
    setEditForm({
      name:               p.name,
      firstResponseHours: p.firstResponseHours,
      resolutionHours:    p.resolutionHours,
    })
  }

  const sortedPolicies = [...policies].sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)
  )

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <Clock className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">SLA Policies</h1>
            <p className="text-xs text-zinc-500">
              {policies.filter((p) => p.isActive).length} active polic{policies.filter((p) => p.isActive).length !== 1 ? 'ies' : 'y'}
              {metrics && metrics.breachedSla > 0 && (
                <span className="ml-2 text-red-400">· {metrics.breachedSla} SLA breach{metrics.breachedSla !== 1 ? 'es' : ''}</span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Policy
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : sortedPolicies.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
            <p>No SLA policies. Create one to enforce response targets.</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Policy Name</th>
                  <th className="px-4 py-3 text-left">First Response</th>
                  <th className="px-4 py-3 text-left">Resolution</th>
                  <th className="px-4 py-3 text-left">Cases</th>
                  <th className="px-4 py-3 text-left">Compliance</th>
                  <th className="px-4 py-3 text-left">Active</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {sortedPolicies.map((p) => {
                  const totalCasesForPriority = metrics?.casesByPriority?.[p.priority] ?? 0
                  const breachCount = p.priority === 'critical' ? (metrics?.breachedSla ?? 0) : 0
                  const compliantCount = Math.max(0, totalCasesForPriority - breachCount)

                  return (
                    <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className={cn('text-xs px-2 py-0.5 rounded font-medium', PRIORITY_COLORS[p.priority] ?? 'bg-zinc-700 text-zinc-400')}>
                          {p.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {editId === p.id ? (
                          <input
                            value={editForm.name ?? ''}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 w-48"
                          />
                        ) : (
                          <span className="text-sm text-zinc-200">{p.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editId === p.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={1}
                              value={editForm.firstResponseHours ?? p.firstResponseHours}
                              onChange={(e) => setEditForm({ ...editForm, firstResponseHours: Number(e.target.value) })}
                              className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                            />
                            <span className="text-xs text-zinc-500">hrs</span>
                          </div>
                        ) : (
                          <span className="text-sm text-zinc-300">{p.firstResponseHours}h</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editId === p.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={1}
                              value={editForm.resolutionHours ?? p.resolutionHours}
                              onChange={(e) => setEditForm({ ...editForm, resolutionHours: Number(e.target.value) })}
                              className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                            />
                            <span className="text-xs text-zinc-500">hrs</span>
                          </div>
                        ) : (
                          <span className="text-sm text-zinc-300">{p.resolutionHours}h</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{p._count.cases}</td>
                      <td className="px-4 py-3">
                        {totalCasesForPriority > 0 ? (
                          <div className="flex items-center gap-1.5">
                            {breachCount > 0 ? (
                              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                            )}
                            <span className="text-xs text-zinc-400">
                              {compliantCount}/{totalCasesForPriority} compliant
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-600">No cases</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(p)}
                          className={cn(
                            'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                            p.isActive ? 'bg-indigo-600' : 'bg-zinc-700'
                          )}
                        >
                          <span className={cn(
                            'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform',
                            p.isActive ? 'translate-x-4' : 'translate-x-1'
                          )} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {editId === p.id ? (
                            <>
                              <button
                                onClick={() => handleEdit(p.id)}
                                className="p-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded text-green-400 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditId(null)}
                                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-zinc-400 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(p)}
                                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="p-1.5 bg-zinc-800 hover:bg-red-500/20 border border-zinc-700 hover:border-red-500/30 rounded text-zinc-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Policy Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-base font-semibold">New SLA Policy</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Policy Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Standard Support"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Priority *</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
                >
                  {['low', 'medium', 'high', 'critical'].map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">First Response (hours)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.firstResponseHours}
                    onChange={(e) => setForm({ ...form, firstResponseHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Resolution (hours)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.resolutionHours}
                    onChange={(e) => setForm({ ...form, resolutionHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
                >
                  Create Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
