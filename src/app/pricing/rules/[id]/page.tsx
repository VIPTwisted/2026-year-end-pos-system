'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Tag, ChevronRight, Trash2, Check, X, ToggleLeft, ToggleRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface PriceRule {
  id: string
  name: string
  description: string | null
  ruleType: string
  conditionJson: string | null
  actionJson: string | null
  customerGroup: string | null
  priority: number
  stackable: boolean
  isActive: boolean
  validFrom: string | null
  validTo: string | null
  usageLimit: number | null
  usageCount: number
}

const RULE_TYPES = ['BOGO', 'BULK_DISCOUNT', 'FIXED_DISCOUNT', 'PCT_DISCOUNT', 'CUSTOMER_GROUP']

const RULE_TYPE_COLOR: Record<string, string> = {
  BOGO: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  BULK_DISCOUNT: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  FIXED_DISCOUNT: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  PCT_DISCOUNT: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  CUSTOMER_GROUP: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
}

interface RuleForm {
  name: string
  description: string
  ruleType: string
  conditionJson: string
  actionJson: string
  customerGroup: string
  priority: number
  stackable: boolean
  validFrom: string
  validTo: string
  usageLimit: string
}

const DEFAULT_FORM: RuleForm = {
  name: '', description: '', ruleType: '', conditionJson: '', actionJson: '',
  customerGroup: '', priority: 0, stackable: false, validFrom: '', validTo: '', usageLimit: '',
}

function prettyJson(str: string | null) {
  if (!str) return null
  try { return JSON.stringify(JSON.parse(str), null, 2) } catch { return str }
}

export default function RuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [rule, setRule] = useState<PriceRule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<RuleForm>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function load() {
    try {
      const res = await fetch(`/api/pricing/rules/${id}`)
      if (!res.ok) throw new Error('Not found')
      const data = await res.json()
      setRule(data)
      setForm({
        name: data.name,
        description: data.description ?? '',
        ruleType: data.ruleType,
        conditionJson: data.conditionJson ?? '',
        actionJson: data.actionJson ?? '',
        customerGroup: data.customerGroup ?? '',
        priority: data.priority,
        stackable: data.stackable,
        validFrom: data.validFrom ? new Date(data.validFrom).toISOString().split('T')[0] : '',
        validTo: data.validTo ? new Date(data.validTo).toISOString().split('T')[0] : '',
        usageLimit: data.usageLimit != null ? String(data.usageLimit) : '',
      })
    } catch {
      setError('Failed to load rule')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch(`/api/pricing/rules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          priority: Number(form.priority),
          usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
          validFrom: form.validFrom || null,
          validTo: form.validTo || null,
          conditionJson: form.conditionJson || null,
          actionJson: form.actionJson || null,
          customerGroup: form.customerGroup || null,
          description: form.description || null,
        }),
      })
      setEditing(false)
      await load()
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle() {
    await fetch(`/api/pricing/rules/${id}/toggle`, { method: 'POST' })
    await load()
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch(`/api/pricing/rules/${id}`, { method: 'DELETE' })
      router.push('/pricing/rules')
    } catch {
      setError('Failed to delete')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 p-6 space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />)}
      </div>
    )
  }

  if (!rule) {
    return <div className="min-h-[100dvh] bg-zinc-950 p-6"><div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-4">{error || 'Not found'}</div></div>
  }

  const usagePct = rule.usageLimit ? Math.min(100, (rule.usageCount / rule.usageLimit) * 100) : 0

  return (
    <div className="min-h-[100dvh] bg-zinc-950 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/pricing" className="text-zinc-500 hover:text-zinc-300 text-sm">Pricing</Link>
        <ChevronRight className="w-4 h-4 text-zinc-600" />
        <Link href="/pricing/rules" className="text-zinc-500 hover:text-zinc-300 text-sm">Rules</Link>
        <ChevronRight className="w-4 h-4 text-zinc-600" />
        <span className="text-zinc-100 font-semibold text-sm">{rule.name}</span>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-violet-400" />
            <div>
              <h1 className="text-xl font-bold text-zinc-100">{rule.name}</h1>
              {rule.description && <p className="text-zinc-400 text-sm">{rule.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('text-xs px-2 py-1 rounded-full border', RULE_TYPE_COLOR[rule.ruleType] ?? 'bg-zinc-700 text-zinc-300 border-zinc-600')}>
              {rule.ruleType.replace(/_/g, ' ')}
            </span>
            <button onClick={handleToggle} className="text-zinc-400 hover:text-zinc-200">
              {rule.isActive ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6" />}
            </button>
            <button onClick={() => setEditing(!editing)} className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded-lg text-sm transition-colors">
              {editing ? <X className="w-3.5 h-3.5" /> : 'Edit'}
            </button>
          </div>
        </div>
      </div>

      {editing ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Name *</label>
                <input value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Rule Type</label>
                <select value={form.ruleType ?? ''} onChange={e => setForm(f => ({ ...f, ruleType: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500">
                  {RULE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Description</label>
                <input value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Customer Group</label>
                <input value={form.customerGroup ?? ''} onChange={e => setForm(f => ({ ...f, customerGroup: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Condition JSON</label>
              <textarea value={form.conditionJson ?? ''} onChange={e => setForm(f => ({ ...f, conditionJson: e.target.value }))} rows={4}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm font-mono focus:outline-none focus:border-violet-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Action JSON</label>
              <textarea value={form.actionJson ?? ''} onChange={e => setForm(f => ({ ...f, actionJson: e.target.value }))} rows={4}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm font-mono focus:outline-none focus:border-violet-500 resize-none" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Priority</label>
                <input value={form.priority ?? 0} onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))} type="number"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Usage Limit</label>
                <input value={form.usageLimit ?? ''} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} type="number" placeholder="Unlimited"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Valid From</label>
                <input type="date" value={form.validFrom ?? ''} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Valid To</label>
                <input type="date" value={form.validTo ?? ''} onChange={e => setForm(f => ({ ...f, validTo: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.stackable ?? false} onChange={e => setForm(f => ({ ...f, stackable: e.target.checked }))} className="accent-violet-500" />
              <span className="text-sm text-zinc-300">Stackable with other rules</span>
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditing(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-2 text-sm">Cancel</button>
              <button type="submit" disabled={saving} className={cn('flex-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg py-2 text-sm font-medium', saving && 'opacity-50')}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Condition</h3>
            {rule.conditionJson ? (
              <pre className="text-xs text-zinc-300 font-mono bg-zinc-800 rounded-lg p-3 overflow-x-auto">{prettyJson(rule.conditionJson)}</pre>
            ) : <p className="text-zinc-500 text-sm">No condition set (applies to all)</p>}
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Action</h3>
            {rule.actionJson ? (
              <pre className="text-xs text-zinc-300 font-mono bg-zinc-800 rounded-lg p-3 overflow-x-auto">{prettyJson(rule.actionJson)}</pre>
            ) : <p className="text-zinc-500 text-sm">No action defined</p>}
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-zinc-100">Usage Statistics</h3>
        <div className="flex items-center gap-4">
          <div><div className="text-2xl font-bold text-zinc-100">{rule.usageCount}</div><div className="text-xs text-zinc-500">Times used</div></div>
          <div><div className="text-2xl font-bold text-zinc-100">{rule.usageLimit ?? '∞'}</div><div className="text-xs text-zinc-500">Limit</div></div>
          {rule.usageLimit && (
            <div className="flex-1">
              <div className="flex justify-between text-xs text-zinc-400 mb-1"><span>Usage</span><span>{Math.round(usagePct)}%</span></div>
              <div className="h-2 bg-zinc-800 rounded-full">
                <div className={cn('h-2 rounded-full', usagePct >= 90 ? 'bg-red-500' : usagePct >= 70 ? 'bg-amber-500' : 'bg-violet-500')} style={{ width: `${usagePct}%` }} />
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-sm">
          <div><span className="text-zinc-500">Priority: </span><span className="text-zinc-200">{rule.priority}</span></div>
          <div><span className="text-zinc-500">Stackable: </span><span className={rule.stackable ? 'text-emerald-400' : 'text-zinc-400'}>{rule.stackable ? 'Yes' : 'No'}</span></div>
          {rule.validFrom && <div><span className="text-zinc-500">From: </span><span className="text-zinc-200">{new Date(rule.validFrom).toLocaleDateString()}</span></div>}
          {rule.validTo && <div><span className="text-zinc-500">To: </span><span className="text-zinc-200">{new Date(rule.validTo).toLocaleDateString()}</span></div>}
        </div>
      </div>

      <div className="bg-zinc-900 border border-red-500/20 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-red-400 mb-3">Danger Zone</h3>
        {confirmDelete ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-300">Are you sure? This cannot be undone.</span>
            <button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1">
              <Trash2 className="w-4 h-4" /> {deleting ? 'Deleting…' : 'Delete'}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="text-zinc-400 hover:text-zinc-200 text-sm">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 text-red-400 hover:text-red-300 border border-red-500/30 px-4 py-2 rounded-lg text-sm transition-colors">
            <Trash2 className="w-4 h-4" /> Delete Rule
          </button>
        )}
      </div>
    </div>
  )
}
