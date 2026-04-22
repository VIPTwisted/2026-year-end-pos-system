'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Tag, Plus, Trash2, ShieldOff, X } from 'lucide-react'

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

interface Toast { msg: string; type: 'ok' | 'err' }

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors'
const labelCls = 'block text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'

export default function DimensionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [dim, setDim] = useState<FinDimension | null>(null)
  const [values, setValues] = useState<FinDimensionValue[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<Toast | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [valCode, setValCode] = useState('')
  const [valName, setValName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const fetchDim = useCallback(async () => {
    try {
      const [dimRes, valRes] = await Promise.all([
        fetch(`/api/finance/dimensions`),
        fetch(`/api/finance/dimensions/${id}/values`),
      ])
      if (dimRes.ok) {
        const dims: FinDimension[] = await dimRes.json()
        const found = dims.find(d => d.id === id)
        setDim(found ?? null)
      }
      if (valRes.ok) setValues(await valRes.json())
    } catch {
      notify('Failed to load', 'err')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchDim() }, [fetchDim])

  const handleAddValue = async () => {
    if (!valCode.trim() || !valName.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/finance/dimensions/${id}/values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: valCode, name: valName }),
      })
      if (!res.ok) { const d = await res.json(); notify(d.error ?? 'Failed', 'err'); return }
      notify('Value added')
      setShowAdd(false); setValCode(''); setValName('')
      fetchDim()
    } catch { notify('Failed to add value', 'err') }
    finally { setSaving(false) }
  }

  const handleToggleBlock = async (val: FinDimensionValue) => {
    try {
      await fetch(`/api/finance/dimensions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !val.isBlocked }),
      })
      notify(val.isBlocked ? 'Value unblocked' : 'Value blocked')
      fetchDim()
    } catch { notify('Failed to update', 'err') }
  }

  const handleDelete = async (valId: string) => {
    try {
      const res = await fetch(`/api/finance/dimensions/${id}/values`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valueId: valId }),
      })
      if (!res.ok) throw new Error()
      notify('Value removed')
      setDeletingId(null)
      fetchDim()
    } catch { notify('Failed to delete', 'err') }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={dim ? `${dim.code} — ${dim.name}` : 'Dimension Values'} />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-[13px] font-medium shadow-lg
          ${toast.type === 'ok' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
          {toast.msg}
        </div>
      )}

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">

          <div className="flex items-center gap-3">
            <Link
              href="/finance/dimensions"
              className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dimensions
            </Link>
          </div>

          {loading ? (
            <div className="text-zinc-500 text-[13px]">Loading…</div>
          ) : !dim ? (
            <div className="text-zinc-500 text-[13px]">Dimension not found.</div>
          ) : (
            <>
              {/* Dimension Info */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-[12px] text-zinc-500">{dim.code}</p>
                    <h2 className="text-[18px] font-semibold text-zinc-100 mt-0.5">{dim.name}</h2>
                    {dim.description && <p className="text-[13px] text-zinc-500 mt-1">{dim.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium
                      ${dim.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {dim.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                    <span className="text-[12px] text-zinc-500">{dim._count.values} values</span>
                  </div>
                </div>
              </div>

              {/* Values */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  <span className="text-[13px] font-semibold text-zinc-100">Dimension Values</span>
                  <button
                    onClick={() => setShowAdd(v => !v)}
                    className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Value
                  </button>
                </div>

                {showAdd && (
                  <div className="px-5 py-4 bg-zinc-900/50 border-b border-zinc-800">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className={labelCls}>Code *</label>
                        <input
                          value={valCode}
                          onChange={e => setValCode(e.target.value.toUpperCase())}
                          placeholder="SALES"
                          maxLength={20}
                          className={inputCls + ' font-mono'}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Name *</label>
                        <input
                          value={valName}
                          onChange={e => setValName(e.target.value)}
                          placeholder="Sales Department"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setShowAdd(false); setValCode(''); setValName('') }}
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

                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Code</th>
                      <th className="text-left py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                      <th className="text-left py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Used in Entries</th>
                      <th className="text-center py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {values.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-zinc-500 text-[13px]">
                          No values yet — click &ldquo;Add Value&rdquo; to create one
                        </td>
                      </tr>
                    ) : values.map(val => (
                      <tr key={val.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-5 py-3 font-mono text-[12px] text-zinc-400">{val.code}</td>
                        <td className="py-3 pr-4 text-zinc-200 text-[13px]">{val.name}</td>
                        <td className="py-3 pr-4 text-zinc-500 text-[12px]">—</td>
                        <td className="py-3 text-center">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium
                            ${val.isBlocked ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {val.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
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
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
