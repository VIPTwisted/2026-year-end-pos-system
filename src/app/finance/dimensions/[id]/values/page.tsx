'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Plus, Tag, Trash2, ShieldOff, X } from 'lucide-react'

interface FinDimension {
  id: string
  code: string
  name: string
  description: string | null
  isBlocked: boolean
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

interface Toast { msg: string; type: 'ok' | 'err' }

const inp = 'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'
const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'

// D365 BC dimension value types
const VALUE_TYPES = ['Standard', 'Heading', 'Total', 'Begin-Total', 'End-Total']

export default function DimensionValuesPage() {
  const { id } = useParams<{ id: string }>()
  const [dim, setDim] = useState<FinDimension | null>(null)
  const [values, setValues] = useState<FinDimensionValue[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<Toast | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [valCode, setValCode] = useState('')
  const [valName, setValName] = useState('')
  const [valType, setValType] = useState('Standard')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const fetchAll = useCallback(async () => {
    try {
      const [dimsRes, valsRes] = await Promise.all([
        fetch('/api/finance/dimensions'),
        fetch(`/api/finance/dimensions/${id}/values`),
      ])
      if (dimsRes.ok) {
        const dims: FinDimension[] = await dimsRes.json()
        setDim(dims.find(d => d.id === id) ?? null)
      }
      if (valsRes.ok) setValues(await valsRes.json())
    } catch {
      notify('Failed to load', 'err')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleAddValue = async () => {
    if (!valCode.trim() || !valName.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/finance/dimensions/${id}/values`, {
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
      setShowAdd(false); setValCode(''); setValName(''); setValType('Standard')
      fetchAll()
    } catch {
      notify('Failed to add value', 'err')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleBlock = async (val: FinDimensionValue) => {
    try {
      const res = await fetch(`/api/finance/dimensions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !val.isBlocked }),
      })
      if (!res.ok) throw new Error()
      notify(val.isBlocked ? 'Value unblocked' : 'Value blocked')
      fetchAll()
    } catch {
      notify('Failed to update', 'err')
    }
  }

  const handleDelete = async (valId: string) => {
    try {
      const res = await fetch(`/api/finance/dimensions/${id}/values`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valueId: valId }),
      })
      if (!res.ok) throw new Error()
      notify('Value deleted')
      setDeletingId(null)
      fetchAll()
    } catch {
      notify('Failed to delete', 'err')
    }
  }

  const actions = (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => setShowAdd(v => !v)}
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
    </div>
  )

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title={dim ? `${dim.code} — Dimension Values` : 'Dimension Values'}
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Dimensions', href: '/finance/dimensions' },
        ]}
        actions={actions}
      />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-[13px] font-medium shadow-lg
          ${toast.type === 'ok' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
          {toast.msg}
        </div>
      )}

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-4">

          {/* Back link */}
          <Link
            href="/finance/dimensions"
            className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dimensions
          </Link>

          {loading ? (
            <div className="text-zinc-500 text-[13px]">Loading…</div>
          ) : !dim ? (
            <div className="text-zinc-500 text-[13px]">Dimension not found.</div>
          ) : (
            <>
              {/* Dimension info card */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-[12px] text-zinc-500">{dim.code}</p>
                    <h2 className="text-[17px] font-semibold text-zinc-100 mt-0.5">{dim.name}</h2>
                    {dim.description && (
                      <p className="text-[13px] text-zinc-500 mt-1">{dim.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      dim.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {dim.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                    <span className="text-[12px] text-zinc-500">{dim._count.values} values</span>
                  </div>
                </div>
              </div>

              {/* Add value form */}
              {showAdd && (
                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-400" />
                      <span className="text-[13px] font-semibold text-zinc-100">New Dimension Value</span>
                    </div>
                    <button onClick={() => setShowAdd(false)} className="text-zinc-500 hover:text-zinc-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className={labelCls}>Code *</label>
                      <input
                        value={valCode}
                        onChange={e => setValCode(e.target.value.toUpperCase())}
                        placeholder="SALES"
                        maxLength={20}
                        className={inp + ' font-mono'}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Name *</label>
                      <input
                        value={valName}
                        onChange={e => setValName(e.target.value)}
                        placeholder="Sales Department"
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Dimension Value Type</label>
                      <select
                        value={valType}
                        onChange={e => setValType(e.target.value)}
                        className={inp}
                      >
                        {VALUE_TYPES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setShowAdd(false); setValCode(''); setValName(''); setValType('Standard') }}
                      className="px-3 py-1.5 text-[12px] text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddValue}
                      disabled={saving || !valCode.trim() || !valName.trim()}
                      className="px-4 py-1.5 text-[12px] font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded transition-colors"
                    >
                      {saving ? 'Adding…' : 'Add Value'}
                    </button>
                  </div>
                </div>
              )}

              {/* Values table */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Code</th>
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Dimension Value Type</th>
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Totaling</th>
                      <th className="text-center px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Blocked</th>
                      <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Indentation</th>
                      <th className="px-4 py-2.5 w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {values.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-14">
                          <Tag className="w-7 h-7 text-zinc-700 mx-auto mb-2" />
                          <p className="text-[13px] text-zinc-500">No dimension values yet.</p>
                          <p className="text-[12px] text-zinc-600 mt-1">Click &ldquo;New&rdquo; to add values.</p>
                        </td>
                      </tr>
                    ) : (
                      values.map((val, idx) => (
                        <tr
                          key={val.id}
                          className={`hover:bg-[rgba(99,102,241,0.05)] transition-colors ${
                            idx !== values.length - 1 ? 'border-b border-zinc-800/40' : ''
                          }`}
                        >
                          <td className="px-4 py-2.5 font-mono text-[12px] text-indigo-400">{val.code}</td>
                          <td className="px-4 py-2.5 text-zinc-200">{val.name}</td>
                          <td className="px-4 py-2.5 text-zinc-400 text-[12px]">Standard</td>
                          <td className="px-4 py-2.5 text-zinc-500 text-[12px]">—</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                              val.isBlocked ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {val.isBlocked ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right text-zinc-500 text-[12px]">0</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1 justify-end">
                              <button
                                onClick={() => handleToggleBlock(val)}
                                title={val.isBlocked ? 'Unblock' : 'Block'}
                                className="p-1 text-zinc-500 hover:text-amber-400 transition-colors"
                              >
                                <ShieldOff className="w-3.5 h-3.5" />
                              </button>
                              {deletingId === val.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDelete(val.id)}
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
                                  onClick={() => setDeletingId(val.id)}
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
                <div className="text-[12px] text-zinc-500">{values.length} values</div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
