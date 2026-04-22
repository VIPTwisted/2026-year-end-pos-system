'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Tag, Layers, ShieldOff, Trash2, X, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface FinDimension {
  id: string
  code: string
  name: string
  description: string | null
  isBlocked: boolean
  createdAt: string
  _count: { values: number }
}

interface Toast {
  msg: string
  type: 'ok' | 'err'
}

export default function DimensionsPage() {
  const [dimensions, setDimensions] = useState<FinDimension[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<Toast | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [dimCode, setDimCode] = useState('')
  const [dimName, setDimName] = useState('')
  const [dimDesc, setDimDesc] = useState('')
  const [dimSaving, setDimSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const fetchDimensions = useCallback(async () => {
    try {
      const res = await fetch('/api/finance/dimensions')
      if (!res.ok) throw new Error()
      setDimensions(await res.json())
    } catch {
      notify('Failed to load dimensions', 'err')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDimensions() }, [fetchDimensions])

  const handleCreate = async () => {
    if (!dimCode.trim() || !dimName.trim()) return
    setDimSaving(true)
    try {
      const res = await fetch('/api/finance/dimensions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: dimCode, name: dimName, description: dimDesc }),
      })
      if (!res.ok) {
        const d = await res.json()
        notify(d.error ?? 'Failed to create', 'err')
        return
      }
      notify('Dimension created')
      setShowCreate(false)
      setDimCode(''); setDimName(''); setDimDesc('')
      fetchDimensions()
    } catch {
      notify('Failed to create dimension', 'err')
    } finally {
      setDimSaving(false)
    }
  }

  const handleToggleBlock = async (dim: FinDimension) => {
    try {
      const res = await fetch(`/api/finance/dimensions/${dim.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !dim.isBlocked }),
      })
      if (!res.ok) throw new Error()
      notify(dim.isBlocked ? 'Dimension unblocked' : 'Dimension blocked')
      fetchDimensions()
    } catch {
      notify('Failed to update', 'err')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/finance/dimensions/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        notify(d.error ?? 'Failed to delete', 'err')
        return
      }
      notify('Dimension deleted')
      setDeletingId(null)
      fetchDimensions()
    } catch {
      notify('Failed to delete', 'err')
    }
  }

  const actions = (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => setShowCreate(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> New
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        Edit
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        Delete
      </button>
      <div className="w-px h-5 bg-zinc-700 mx-1" />
      <span className="px-3 py-1.5 text-zinc-500 text-[12px]">
        <Tag className="w-3.5 h-3.5 inline mr-1" />
        Dimension Values ▼
      </span>
    </div>
  )

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Dimensions"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={actions}
      />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-[13px] font-medium shadow-lg
          ${toast.type === 'ok' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
          {toast.msg}
        </div>
      )}

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-4">

          {/* Create form */}
          {showCreate && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span className="text-[13px] font-semibold text-zinc-100">New Dimension</span>
                </div>
                <button onClick={() => setShowCreate(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Code *</label>
                  <input
                    value={dimCode}
                    onChange={e => setDimCode(e.target.value.toUpperCase())}
                    placeholder="DEPT"
                    maxLength={20}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Name *</label>
                  <input
                    value={dimName}
                    onChange={e => setDimName(e.target.value)}
                    placeholder="Department"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Description</label>
                  <input
                    value={dimDesc}
                    onChange={e => setDimDesc(e.target.value)}
                    placeholder="Optional description"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-3 py-1.5 text-[12px] text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={dimSaving || !dimCode.trim() || !dimName.trim()}
                  className="px-4 py-1.5 text-[12px] font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded transition-colors"
                >
                  {dimSaving ? 'Creating…' : 'Create'}
                </button>
              </div>
            </div>
          )}

          {/* Main table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Code</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Filter Code Caption</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Consolidation Code</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Map-to IC Dimension Code</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Values</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Blocked</th>
                  <th className="px-4 py-2.5 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-zinc-500 text-[13px]">Loading…</td>
                  </tr>
                ) : dimensions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <Layers className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                      <p className="text-[13px] text-zinc-500">No dimensions defined.</p>
                      <p className="text-[12px] text-zinc-600 mt-1">Click &ldquo;New&rdquo; to create the first dimension.</p>
                    </td>
                  </tr>
                ) : (
                  dimensions.map((dim, idx) => (
                    <tr
                      key={dim.id}
                      className={`hover:bg-[rgba(99,102,241,0.05)] transition-colors ${
                        idx !== dimensions.length - 1 ? 'border-b border-zinc-800/40' : ''
                      }`}
                    >
                      <td className="px-4 py-2.5 font-mono text-[12px] text-indigo-400">{dim.code}</td>
                      <td className="px-4 py-2.5 text-zinc-200">{dim.name}</td>
                      <td className="px-4 py-2.5 text-zinc-500 text-[12px]">
                        {dim.description ?? dim.code}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-500 text-[12px]">—</td>
                      <td className="px-4 py-2.5 text-zinc-500 text-[12px]">—</td>
                      <td className="px-4 py-2.5 text-center">
                        <Link
                          href={`/finance/dimensions/${dim.id}`}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-800 hover:bg-indigo-500/20 text-[12px] font-semibold text-zinc-300 hover:text-indigo-300 transition-colors"
                        >
                          {dim._count.values}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium
                          ${dim.isBlocked ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {dim.isBlocked ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/finance/dimensions/${dim.id}`}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-zinc-400 hover:text-indigo-300 hover:bg-[rgba(99,102,241,0.1)] rounded transition-colors"
                          >
                            <Tag className="w-3 h-3" /> Values <ChevronRight className="w-3 h-3" />
                          </Link>
                          <button
                            onClick={() => handleToggleBlock(dim)}
                            title={dim.isBlocked ? 'Unblock' : 'Block'}
                            className="p-1 text-zinc-500 hover:text-amber-400 transition-colors"
                          >
                            <ShieldOff className="w-3.5 h-3.5" />
                          </button>
                          {deletingId === dim.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(dim.id)}
                                className="px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                              >
                                Confirm
                              </button>
                              <button onClick={() => setDeletingId(null)} className="text-zinc-500 hover:text-zinc-300">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingId(dim.id)}
                              className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && (
            <div className="text-[12px] text-zinc-500">{dimensions.length} records</div>
          )}
        </div>
      </main>
    </div>
  )
}
