'use client'

import { useEffect, useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Pencil, X, Check } from 'lucide-react'

interface PaymentTerm {
  id: string
  code: string
  description: string
  discountPct: number
  discountDays: number
  netDays: number
  isActive: boolean
}

interface EditForm {
  id: string | null   // null = new
  code: string
  description: string
  discountPct: string
  discountDays: string
  netDays: string
  isActive: boolean
}

interface Toast {
  msg: string
  type: 'ok' | 'err'
}

const BLANK_FORM: EditForm = {
  id: null,
  code: '',
  description: '',
  discountPct: '0',
  discountDays: '0',
  netDays: '30',
  isActive: true,
}

function termLabel(t: PaymentTerm): string {
  if (t.discountPct > 0) return `${t.discountPct}% if paid within ${t.discountDays}d, net ${t.netDays}d`
  return `Net ${t.netDays} days`
}

export default function CashDiscountsPage() {
  const [terms, setTerms] = useState<PaymentTerm[]>([])
  const [loading, setLoading] = useState(true)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  const load = useCallback(() => {
    fetch('/api/finance/cash-discounts')
      .then((r) => r.json())
      .then((d: { terms: PaymentTerm[] }) => setTerms(d.terms))
      .catch(() => notify('Failed to load payment terms', 'err'))
      .finally(() => setLoading(false))
  }, [notify])

  useEffect(() => { load() }, [load])

  const openEdit = useCallback((t?: PaymentTerm) => {
    if (t) {
      setEditForm({
        id: t.id,
        code: t.code,
        description: t.description,
        discountPct: String(t.discountPct),
        discountDays: String(t.discountDays),
        netDays: String(t.netDays),
        isActive: t.isActive,
      })
    } else {
      setEditForm({ ...BLANK_FORM })
    }
  }, [])

  const save = useCallback(async () => {
    if (!editForm) return
    setSaving(true)
    try {
      const payload = {
        id: editForm.id ?? undefined,
        code: editForm.code.trim().toUpperCase(),
        description: editForm.description.trim(),
        discountPct: parseFloat(editForm.discountPct) || 0,
        discountDays: parseInt(editForm.discountDays) || 0,
        netDays: parseInt(editForm.netDays) || 30,
        isActive: editForm.isActive,
      }
      const res = await fetch('/api/finance/cash-discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Save failed')
      notify(editForm.id ? 'Payment term updated' : 'Payment term created', 'ok')
      setEditForm(null)
      load()
    } catch {
      notify('Failed to save', 'err')
    } finally {
      setSaving(false)
    }
  }, [editForm, load, notify])

  const withDiscount = terms.filter((t) => t.discountPct > 0 && t.isActive)
  const activeCount = terms.filter((t) => t.isActive).length

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Cash Discounts & Payment Terms"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={
          <button
            onClick={() => openEdit()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Term
          </button>
        }
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Edit modal */}
      {editForm && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">
                {editForm.id ? 'Edit Payment Term' : 'New Payment Term'}
              </h2>
              <button onClick={() => setEditForm(null)}><X className="w-4 h-4 text-zinc-500" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Code</label>
                <input
                  value={editForm.code}
                  onChange={(e) => setEditForm((p) => p ? { ...p, code: e.target.value } : p)}
                  placeholder="e.g. 2/10 NET30"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Net Days</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.netDays}
                  onChange={(e) => setEditForm((p) => p ? { ...p, netDays: e.target.value } : p)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Description</label>
              <input
                value={editForm.description}
                onChange={(e) => setEditForm((p) => p ? { ...p, description: e.target.value } : p)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Discount %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={editForm.discountPct}
                  onChange={(e) => setEditForm((p) => p ? { ...p, discountPct: e.target.value } : p)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Discount Days</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.discountDays}
                  onChange={(e) => setEditForm((p) => p ? { ...p, discountDays: e.target.value } : p)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.isActive}
                onChange={(e) => setEditForm((p) => p ? { ...p, isActive: e.target.checked } : p)}
                className="rounded border-zinc-700"
              />
              <span className="text-sm text-zinc-300">Active</span>
            </label>

            <div className="flex gap-2 pt-1">
              <button
                onClick={save}
                disabled={saving || !editForm.code || !editForm.description}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded px-4 py-2 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => setEditForm(null)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm font-medium rounded px-4 py-2 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Terms</div>
            <div className="text-2xl font-bold text-zinc-100">{terms.length}</div>
            <div className="text-xs text-zinc-500 mt-1">{activeCount} active</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">With Discount</div>
            <div className="text-2xl font-bold text-emerald-400">{withDiscount.length}</div>
            <div className="text-xs text-zinc-500 mt-1">offer early pay discount</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Max Discount</div>
            <div className="text-2xl font-bold text-emerald-400">
              {withDiscount.length > 0 ? `${Math.max(...withDiscount.map((t) => t.discountPct))}%` : '—'}
            </div>
            <div className="text-xs text-zinc-500 mt-1">highest cash discount</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">Payment Terms</h2>
            <span className="text-xs text-zinc-500">{terms.length} terms</span>
          </div>

          {loading ? (
            <div className="py-16 text-center"><p className="text-sm text-zinc-500">Loading…</p></div>
          ) : terms.length === 0 ? (
            <div className="py-16 text-center"><p className="text-sm text-zinc-500">No payment terms configured.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Code</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Discount %</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Discount Days</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Net Days</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Summary</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {terms.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded">{t.code}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300">{t.description}</td>
                      <td className="px-4 py-3 text-center">
                        {t.discountPct > 0
                          ? <span className="font-mono text-sm text-emerald-400 font-semibold">{t.discountPct}%</span>
                          : <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {t.discountDays > 0
                          ? <span className="font-mono text-sm text-zinc-300">{t.discountDays}d</span>
                          : <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono text-sm text-zinc-300">{t.netDays}d</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{termLabel(t)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${t.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-500'}`}>
                          {t.isActive ? 'active' : 'inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openEdit(t)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
