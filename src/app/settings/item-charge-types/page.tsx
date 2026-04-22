'use client'

import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Check, X } from 'lucide-react'

interface ChargeType {
  id: string
  code: string
  name: string
  description: string | null
  glAccountId: string | null
  isActive: boolean
}

interface DraftType {
  code: string
  name: string
  description: string
  glAccountId: string
}

export default function ItemChargeTypesPage() {
  const [types, setTypes] = useState<ChargeType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState<DraftType>({ code: '', name: '', description: '', glAccountId: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  const loadTypes = useCallback(() => {
    setLoading(true)
    fetch('/api/purchasing/item-charges/charge-types')
      .then(r => r.json())
      .then((d: ChargeType[]) => {
        setTypes(Array.isArray(d) ? d : [])
        setError(null)
      })
      .catch(() => setError('Failed to load charge types'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadTypes() }, [loadTypes])

  function resetForm() {
    setDraft({ code: '', name: '', description: '', glAccountId: '' })
    setFormError('')
    setShowForm(false)
  }

  async function submitNew() {
    if (!draft.code.trim()) { setFormError('Code is required'); return }
    if (!draft.name.trim()) { setFormError('Name is required'); return }
    setFormError('')
    setSaving(true)

    try {
      const res = await fetch('/api/purchasing/item-charges/charge-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: draft.code.trim(),
          name: draft.name.trim(),
          description: draft.description.trim() || null,
          glAccountId: draft.glAccountId.trim() || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setFormError(data.error ?? 'Failed to create')
        setSaving(false)
        return
      }

      notify('Charge type created')
      resetForm()
      loadTypes()
    } catch {
      setFormError('Network error')
      setSaving(false)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(ct: ChargeType) {
    try {
      const res = await fetch(`/api/purchasing/item-charges/charge-types/${ct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !ct.isActive }),
      })
      if (!res.ok) throw new Error('Failed')
      setTypes(prev =>
        prev.map(t => (t.id === ct.id ? { ...t, isActive: !t.isActive } : t))
      )
      notify(`${ct.code} ${!ct.isActive ? 'activated' : 'deactivated'}`)
    } catch {
      notify('Failed to update', 'err')
    }
  }

  const inputClass =
    'w-full rounded bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors'

  return (
    <>
      <TopBar
        title="Item Charge Types"
        breadcrumb={[{ label: 'Settings', href: '/settings' }]}
        actions={
          !showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 h-8 px-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Type
            </button>
          ) : undefined
        }
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-[13px] font-medium shadow-lg transition-all ${
            toast.type === 'ok'
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/20 border border-red-500/30 text-red-300'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-4xl mx-auto space-y-6">

          <div>
            <h1 className="text-xl font-bold text-zinc-100">Item Charge Types</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              Define charge types like FREIGHT, CUSTOMS, INSURANCE, HANDLING
            </p>
          </div>

          {/* Inline add form */}
          {showForm && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">
                New Charge Type
              </p>
              {formError && (
                <p className="text-[13px] text-red-400 mb-3">{formError}</p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={draft.code}
                    onChange={e => setDraft(d => ({ ...d, code: e.target.value.toUpperCase() }))}
                    placeholder="FREIGHT"
                    maxLength={20}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                    placeholder="Ocean Freight"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={draft.description}
                    onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                    placeholder="Optional description"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                    GL Account
                  </label>
                  <input
                    type="text"
                    value={draft.glAccountId}
                    onChange={e => setDraft(d => ({ ...d, glAccountId: e.target.value }))}
                    placeholder="e.g. 6100"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={submitNew}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 h-8 px-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium rounded transition-colors disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={resetForm}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 h-8 px-3 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 text-[13px] rounded transition-colors disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex items-center justify-center py-16">
              <p className="text-[13px] text-zinc-500">Loading…</p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-800/60 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          ) : types.length === 0 && !showForm ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-20 text-zinc-500">
              <p className="text-[13px] mb-4">No charge types defined yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-1.5 h-8 px-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add First Type
              </button>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-zinc-500 text-[11px] uppercase tracking-wide">
                    <th className="text-left px-4 py-2.5 font-medium">Code</th>
                    <th className="text-left py-2.5 font-medium">Name</th>
                    <th className="text-left py-2.5 font-medium">Description</th>
                    <th className="text-left py-2.5 font-medium">GL Account</th>
                    <th className="text-center px-4 py-2.5 font-medium">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {types.map((ct, idx) => (
                    <tr
                      key={ct.id}
                      className={`hover:bg-zinc-800/30 transition-colors ${idx !== types.length - 1 ? 'border-b border-zinc-800/50' : ''}`}
                    >
                      <td className="px-4 py-2.5">
                        <span className="font-mono font-semibold text-zinc-100">{ct.code}</span>
                      </td>
                      <td className="py-2.5 pr-6 text-zinc-200">{ct.name}</td>
                      <td className="py-2.5 pr-6 text-zinc-500 text-[12px]">
                        {ct.description || <span className="text-zinc-700">—</span>}
                      </td>
                      <td className="py-2.5 pr-6 font-mono text-zinc-500 text-[12px]">
                        {ct.glAccountId || <span className="text-zinc-700">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          onClick={() => toggleActive(ct)}
                          className={`inline-flex items-center justify-center w-10 h-5 rounded-full transition-colors ${
                            ct.isActive ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-zinc-800 border border-zinc-700'
                          }`}
                          title={ct.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-full transition-all ${
                              ct.isActive ? 'bg-emerald-400' : 'bg-zinc-600'
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Preset suggestions */}
          {types.length === 0 && !showForm && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                Suggested Defaults (D365 BC Standard)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['FREIGHT', 'CUSTOMS', 'INSURANCE', 'HANDLING'].map(code => (
                  <button
                    key={code}
                    onClick={() => {
                      setDraft({
                        code,
                        name: code.charAt(0) + code.slice(1).toLowerCase(),
                        description: '',
                        glAccountId: '',
                      })
                      setShowForm(true)
                    }}
                    className="h-9 px-3 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 text-[12px] font-mono font-medium transition-colors"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
