'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, FileText, Pencil, Trash2 } from 'lucide-react'

interface JournalTemplate {
  id: string
  name: string
  description: string | null
  templateType: string
  balAccountType: string
  balAccountNo: string | null
  noSeries: string | null
  recurring: boolean
  sourceCode: string | null
  createdAt: string
}

const TYPE_CLS: Record<string, string> = {
  General: 'bg-blue-500/10 text-blue-400',
  Sales: 'bg-violet-500/10 text-violet-400',
  Purchases: 'bg-amber-500/10 text-amber-400',
  Payment: 'bg-emerald-500/10 text-emerald-400',
  CashReceipt: 'bg-teal-500/10 text-teal-400',
  Assets: 'bg-orange-500/10 text-orange-400',
  Intercompany: 'bg-pink-500/10 text-pink-400',
}

const TEMPLATE_TYPES = [
  'General', 'Sales', 'Purchases', 'Payment', 'CashReceipt', 'Assets', 'Intercompany',
]

const BAL_TYPES = ['G/L Account', 'Bank Account']

type FormState = {
  name: string
  description: string
  templateType: string
  balAccountType: string
  balAccountNo: string
  noSeries: string
  recurring: boolean
  sourceCode: string
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  templateType: 'General',
  balAccountType: 'G/L Account',
  balAccountNo: '',
  noSeries: '',
  recurring: false,
  sourceCode: 'GENJNL',
}

export default function JournalTemplatesPage() {
  const [templates, setTemplates] = useState<JournalTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/finance/journals/templates')
      .then(r => r.json())
      .then(d => setTemplates(d.templates ?? []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const save = async () => {
    if (!form.name.trim()) { notify('Name is required', 'err'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/finance/journals/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      notify('Template saved')
      setForm({ ...EMPTY_FORM })
      setShowForm(false)
      load()
    } catch {
      notify('Save failed', 'err')
    } finally {
      setSaving(false)
    }
  }

  const deleteTemplate = async (id: string) => {
    setDeletingId(id)
    try {
      await fetch(`/api/finance/journals/templates?id=${id}`, { method: 'DELETE' })
      notify('Template deleted')
      load()
    } catch {
      notify('Delete failed', 'err')
    } finally {
      setDeletingId(null)
    }
  }

  const inputCls = 'w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500'
  const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Journal Templates"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Journals', href: '/finance/journals/general' },
        ]}
        actions={
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Template
          </button>
        }
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-5">
        {/* Info */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#16213e] border border-zinc-800/50">
          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
          <p className="text-xs text-zinc-400">
            Journal Templates define the setup for each journal type — including the balancing account, number series, and source code. Used to quickly create new journal batches with the correct defaults.
          </p>
        </div>

        {/* New template form */}
        {showForm && (
          <div className="bg-[#16213e] border border-blue-600/30 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100">New Journal Template</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className={labelCls}>Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value.toUpperCase() }))}
                  placeholder="GENERAL" className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="General journal for all G/L postings" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Type</label>
                <select value={form.templateType} onChange={e => setForm(f => ({ ...f, templateType: e.target.value }))}
                  className={inputCls}>
                  {TEMPLATE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Bal. Account Type</label>
                <select value={form.balAccountType} onChange={e => setForm(f => ({ ...f, balAccountType: e.target.value }))}
                  className={inputCls}>
                  {BAL_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Bal. Account No.</label>
                <input value={form.balAccountNo} onChange={e => setForm(f => ({ ...f, balAccountNo: e.target.value }))}
                  placeholder="2000" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>No. Series</label>
                <input value={form.noSeries} onChange={e => setForm(f => ({ ...f, noSeries: e.target.value }))}
                  placeholder="GENJNL-NOS" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Source Code</label>
                <input value={form.sourceCode} onChange={e => setForm(f => ({ ...f, sourceCode: e.target.value.toUpperCase() }))}
                  placeholder="GENJNL" className={inputCls} />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.recurring} onChange={e => setForm(f => ({ ...f, recurring: e.target.checked }))}
                    className="w-4 h-4 accent-blue-500" />
                  <span className="text-sm text-zinc-300">Recurring</span>
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button onClick={save} disabled={saving || !form.name.trim()}
                className="px-4 py-2 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors">
                {saving ? 'Saving…' : 'Save Template'}
              </button>
              <button onClick={() => { setShowForm(false); setForm({ ...EMPTY_FORM }) }}
                className="px-3 py-2 rounded text-xs font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Templates table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">Journal Templates</h2>
            <span className="text-xs text-zinc-500">{templates.length} templates</span>
          </div>
          {loading ? (
            <div className="py-16 text-center text-sm text-zinc-500">Loading…</div>
          ) : templates.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-zinc-500 mb-2">No journal templates yet.</p>
              <button onClick={() => setShowForm(true)} className="text-xs text-blue-400 hover:text-blue-300">Create your first template →</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    {['Name', 'Description', 'Type', 'Bal. Account Type', 'Bal. Account No.', 'No. Series', 'Source Code', 'Recurring', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {templates.map(t => (
                    <tr key={t.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded">{t.name}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{t.description ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${TYPE_CLS[t.templateType] ?? 'bg-zinc-700 text-zinc-400'}`}>
                          {t.templateType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{t.balAccountType}</td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-300">{t.balAccountNo ?? '—'}</td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-400">{t.noSeries ?? '—'}</td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-400">{t.sourceCode ?? '—'}</td>
                      <td className="px-4 py-3">
                        {t.recurring ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-violet-500/10 text-violet-400">Yes</span>
                        ) : (
                          <span className="text-zinc-600 text-xs">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTemplate(t.id)}
                            disabled={deletingId === t.id}
                            className="p-1 rounded hover:bg-red-900/40 text-zinc-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
