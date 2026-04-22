'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Tag, Layers, ShieldOff, Trash2, X, ChevronRight } from 'lucide-react'

interface FinDimension {
  id: string
  code: string
  name: string
  description: string | null
  isBlocked: boolean
  createdAt: string
  _count: { values: number }
}

interface FinDimensionValue {
  id: string
  dimensionId: string
  code: string
  name: string
  isBlocked: boolean
  createdAt: string
}

interface Toast {
  msg: string
  type: 'ok' | 'err'
}

export default function DimensionsPage() {
  const [dimensions, setDimensions] = useState<FinDimension[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [values, setValues] = useState<FinDimensionValue[]>([])
  const [loading, setLoading] = useState(true)
  const [valuesLoading, setValuesLoading] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  // Create dimension form
  const [showCreateDim, setShowCreateDim] = useState(false)
  const [dimCode, setDimCode] = useState('')
  const [dimName, setDimName] = useState('')
  const [dimDesc, setDimDesc] = useState('')
  const [dimSaving, setDimSaving] = useState(false)

  // Create value form
  const [showCreateVal, setShowCreateVal] = useState(false)
  const [valCode, setValCode] = useState('')
  const [valName, setValName] = useState('')
  const [valSaving, setValSaving] = useState(false)

  // Delete confirmation
  const [deletingDimId, setDeletingDimId] = useState<string | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const fetchDimensions = useCallback(async () => {
    try {
      const res = await fetch('/api/finance/dimensions')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setDimensions(data)
    } catch {
      notify('Failed to load dimensions', 'err')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchValues = useCallback(async (dimId: string) => {
    setValuesLoading(true)
    try {
      const res = await fetch(`/api/finance/dimensions/${dimId}/values`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setValues(data)
    } catch {
      notify('Failed to load values', 'err')
    } finally {
      setValuesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDimensions()
  }, [fetchDimensions])

  useEffect(() => {
    if (selectedId) fetchValues(selectedId)
    else setValues([])
  }, [selectedId, fetchValues])

  const handleSelectDimension = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id))
    setShowCreateVal(false)
    setValCode('')
    setValName('')
  }

  const handleCreateDimension = async () => {
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
      setShowCreateDim(false)
      setDimCode('')
      setDimName('')
      setDimDesc('')
      fetchDimensions()
    } catch {
      notify('Failed to create dimension', 'err')
    } finally {
      setDimSaving(false)
    }
  }

  const handleToggleBlockDimension = async (dim: FinDimension) => {
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

  const handleDeleteDimension = async (id: string) => {
    try {
      const res = await fetch(`/api/finance/dimensions/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        notify(d.error ?? 'Failed to delete', 'err')
        return
      }
      notify('Dimension deleted')
      if (selectedId === id) setSelectedId(null)
      setDeletingDimId(null)
      fetchDimensions()
    } catch {
      notify('Failed to delete', 'err')
    }
  }

  const handleCreateValue = async () => {
    if (!selectedId || !valCode.trim() || !valName.trim()) return
    setValSaving(true)
    try {
      const res = await fetch(`/api/finance/dimensions/${selectedId}/values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: valCode, name: valName }),
      })
      if (!res.ok) {
        const d = await res.json()
        notify(d.error ?? 'Failed to create value', 'err')
        return
      }
      notify('Value added')
      setShowCreateVal(false)
      setValCode('')
      setValName('')
      fetchValues(selectedId)
      fetchDimensions()
    } catch {
      notify('Failed to create value', 'err')
    } finally {
      setValSaving(false)
    }
  }

  const handleToggleBlockValue = async (val: FinDimensionValue) => {
    try {
      const res = await fetch(`/api/finance/dimensions/${val.dimensionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !val.isBlocked }),
      })
      if (!res.ok) throw new Error()
      notify(val.isBlocked ? 'Value unblocked' : 'Value blocked')
      if (selectedId) fetchValues(selectedId)
    } catch {
      notify('Failed to update value', 'err')
    }
  }

  const handleDeleteValue = async (val: FinDimensionValue) => {
    if (!selectedId) return
    try {
      const res = await fetch(`/api/finance/dimensions/${selectedId}/values`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valueId: val.id }),
      })
      if (!res.ok) throw new Error()
      notify('Value removed')
      fetchValues(selectedId)
      fetchDimensions()
    } catch {
      notify('Failed to delete value', 'err')
    }
  }

  const selectedDim = dimensions.find(d => d.id === selectedId)

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] flex flex-col">
      <TopBar title="Financial Dimensions" />

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
              <h2 className="text-xl font-bold text-zinc-100">Financial Dimensions</h2>
              <p className="text-sm text-zinc-500 mt-0.5">D365 BC-style dimensions for cost centers, departments, and projects</p>
            </div>
            <button
              onClick={() => { setShowCreateDim(v => !v); setShowCreateVal(false) }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Dimension
            </button>
          </div>

          {/* Create Dimension Form */}
          {showCreateDim && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">New Dimension</span>
                <button onClick={() => setShowCreateDim(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Code *</label>
                  <input
                    value={dimCode}
                    onChange={e => setDimCode(e.target.value.toUpperCase())}
                    placeholder="DEPT"
                    maxLength={20}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Name *</label>
                  <input
                    value={dimName}
                    onChange={e => setDimName(e.target.value)}
                    placeholder="Department"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Description</label>
                  <input
                    value={dimDesc}
                    onChange={e => setDimDesc(e.target.value)}
                    placeholder="Optional description"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setShowCreateDim(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDimension}
                  disabled={dimSaving || !dimCode.trim() || !dimName.trim()}
                  className="px-4 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded transition-colors"
                >
                  {dimSaving ? 'Creating…' : 'Create'}
                </button>
              </div>
            </div>
          )}

          {/* Two-panel layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left: Dimensions table */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-zinc-100">Dimensions</span>
                <span className="ml-auto text-[11px] text-zinc-500">{dimensions.length} total</span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-zinc-500 text-sm">Loading…</div>
              ) : dimensions.length === 0 ? (
                <div className="p-8 text-center">
                  <Layers className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">No dimensions yet</p>
                  <p className="text-xs text-zinc-600 mt-1">Click "New Dimension" to create one</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Code</th>
                      <th className="text-left py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                      <th className="text-center py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Values</th>
                      <th className="text-center py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                      <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {dimensions.map(dim => (
                      <tr
                        key={dim.id}
                        onClick={() => handleSelectDimension(dim.id)}
                        className={`cursor-pointer transition-colors ${selectedId === dim.id ? 'bg-blue-600/10 border-l-2 border-l-blue-500' : 'hover:bg-zinc-800/40'}`}
                      >
                        <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{dim.code}</td>
                        <td className="py-2.5 pr-3">
                          <span className="text-sm text-zinc-200">{dim.name}</span>
                          {dim.description && (
                            <span className="block text-xs text-zinc-600 truncate max-w-[120px]">{dim.description}</span>
                          )}
                        </td>
                        <td className="py-2.5 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-medium text-zinc-300">
                            {dim._count.values}
                          </span>
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium
                            ${dim.isBlocked ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {dim.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleToggleBlockDimension(dim)}
                              title={dim.isBlocked ? 'Unblock' : 'Block'}
                              className="p-1 text-zinc-500 hover:text-amber-400 transition-colors"
                            >
                              <ShieldOff className="w-3.5 h-3.5" />
                            </button>
                            {deletingDimId === dim.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDeleteDimension(dim.id)}
                                  className="px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeletingDimId(null)}
                                  className="text-zinc-500 hover:text-zinc-300"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingDimId(dim.id)}
                                className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform text-zinc-600 ${selectedId === dim.id ? 'rotate-90 text-blue-400' : ''}`} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Right: Values panel */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-zinc-100">
                  {selectedDim ? `${selectedDim.code} — Values` : 'Dimension Values'}
                </span>
                {selectedId && (
                  <button
                    onClick={() => setShowCreateVal(v => !v)}
                    className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Value
                  </button>
                )}
              </div>

              {!selectedId ? (
                <div className="p-8 text-center">
                  <Tag className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">Select a dimension</p>
                  <p className="text-xs text-zinc-600 mt-1">Click a dimension on the left to view its values</p>
                </div>
              ) : (
                <>
                  {/* Add Value Form */}
                  {showCreateVal && (
                    <div className="px-4 py-3 bg-zinc-900/50 border-b border-zinc-800">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Code *</label>
                          <input
                            value={valCode}
                            onChange={e => setValCode(e.target.value.toUpperCase())}
                            placeholder="SALES"
                            maxLength={20}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Name *</label>
                          <input
                            value={valName}
                            onChange={e => setValName(e.target.value)}
                            placeholder="Sales Department"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setShowCreateVal(false); setValCode(''); setValName('') }}
                          className="px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateValue}
                          disabled={valSaving || !valCode.trim() || !valName.trim()}
                          className="px-3 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded transition-colors"
                        >
                          {valSaving ? 'Adding…' : 'Add'}
                        </button>
                      </div>
                    </div>
                  )}

                  {valuesLoading ? (
                    <div className="p-8 text-center text-zinc-500 text-sm">Loading values…</div>
                  ) : values.length === 0 ? (
                    <div className="p-8 text-center">
                      <Tag className="w-7 h-7 text-zinc-700 mx-auto mb-2" />
                      <p className="text-sm text-zinc-500">No values yet</p>
                      <p className="text-xs text-zinc-600 mt-1">Click "Add Value" to create dimension values</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800">
                          <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Code</th>
                          <th className="text-left py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                          <th className="text-center py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800">
                        {values.map(val => (
                          <tr key={val.id} className="hover:bg-zinc-800/40 transition-colors">
                            <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{val.code}</td>
                            <td className="py-2.5 pr-3 text-sm text-zinc-200">{val.name}</td>
                            <td className="py-2.5 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium
                                ${val.isBlocked ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                {val.isBlocked ? 'Blocked' : 'Active'}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleToggleBlockValue(val)}
                                  title={val.isBlocked ? 'Unblock' : 'Block'}
                                  className="p-1 text-zinc-500 hover:text-amber-400 transition-colors"
                                >
                                  <ShieldOff className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteValue(val)}
                                  className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
