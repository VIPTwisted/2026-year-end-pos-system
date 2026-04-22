'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Tag, Plus, ChevronRight, ToggleLeft, ToggleRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PriceRule {
  id: string
  name: string
  description: string | null
  ruleType: string
  priority: number
  stackable: boolean
  isActive: boolean
  validFrom: string | null
  validTo: string | null
  usageLimit: number | null
  usageCount: number
}

const RULE_TYPES = ['BOGO', 'BULK_DISCOUNT', 'FIXED_DISCOUNT', 'PCT_DISCOUNT', 'CUSTOMER_GROUP']
const FILTER_TABS = ['All', 'Active', 'BOGO', 'Bulk', 'Discount', 'Customer Group']

const RULE_TYPE_COLOR: Record<string, string> = {
  BOGO: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  BULK_DISCOUNT: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  FIXED_DISCOUNT: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  PCT_DISCOUNT: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  CUSTOMER_GROUP: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
}

const TAB_FILTER: Record<string, (r: PriceRule) => boolean> = {
  All: () => true,
  Active: (r) => r.isActive,
  BOGO: (r) => r.ruleType === 'BOGO',
  Bulk: (r) => r.ruleType === 'BULK_DISCOUNT',
  Discount: (r) => r.ruleType === 'FIXED_DISCOUNT' || r.ruleType === 'PCT_DISCOUNT',
  'Customer Group': (r) => r.ruleType === 'CUSTOMER_GROUP',
}

export default function PriceRulesPage() {
  const [rules, setRules] = useState<PriceRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', ruleType: 'PCT_DISCOUNT',
    conditionJson: '', actionJson: '', priority: '0',
    stackable: false, validFrom: '', validTo: '', usageLimit: '',
  })
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const res = await fetch('/api/pricing/rules')
      const data = await res.json()
      setRules(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load rules')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleToggle(rule: PriceRule) {
    await fetch(`/api/pricing/rules/${rule.id}/toggle`, { method: 'POST' })
    await load()
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api/pricing/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          ruleType: form.ruleType,
          conditionJson: form.conditionJson || null,
          actionJson: form.actionJson || null,
          priority: Number(form.priority),
          stackable: form.stackable,
          validFrom: form.validFrom || null,
          validTo: form.validTo || null,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        }),
      })
      setShowModal(false)
      setForm({ name: '', description: '', ruleType: 'PCT_DISCOUNT', conditionJson: '', actionJson: '', priority: '0', stackable: false, validFrom: '', validTo: '', usageLimit: '' })
      await load()
    } catch {
      setError('Failed to create rule')
    } finally {
      setSaving(false)
    }
  }

  const filtered = rules.filter(TAB_FILTER[activeTab] ?? (() => true))

  return (
    <div className="min-h-[100dvh] bg-zinc-950 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/pricing" className="text-zinc-500 hover:text-zinc-300 text-sm">Pricing</Link>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
          <span className="text-zinc-100 font-semibold">Price Rules</span>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Rule
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
        {FILTER_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', activeTab === tab ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300')}>
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
          <Tag className="w-4 h-4 text-violet-400" />
          <span className="font-semibold text-zinc-100">Rules</span>
          <span className="text-zinc-500 text-sm ml-1">({filtered.length})</span>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-zinc-800 rounded animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-zinc-500"><Tag className="w-10 h-10 mx-auto mb-3 opacity-40" /><p>No rules in this filter</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Type</th>
                  <th className="text-center px-4 py-3 text-zinc-400 font-medium">Priority</th>
                  <th className="text-center px-4 py-3 text-zinc-400 font-medium">Stackable</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Usage</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Valid</th>
                  <th className="text-center px-4 py-3 text-zinc-400 font-medium">Active</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filtered.map(rule => (
                  <tr key={rule.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/pricing/rules/${rule.id}`} className="text-zinc-200 hover:text-violet-400 font-medium">{rule.name}</Link>
                      {rule.description && <div className="text-xs text-zinc-500 mt-0.5">{rule.description}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border', RULE_TYPE_COLOR[rule.ruleType] ?? 'bg-zinc-700 text-zinc-300 border-zinc-600')}>
                        {rule.ruleType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-400">{rule.priority}</td>
                    <td className="px-4 py-3 text-center"><span className={cn('text-xs', rule.stackable ? 'text-emerald-400' : 'text-zinc-600')}>{rule.stackable ? 'Yes' : 'No'}</span></td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {rule.usageCount}{rule.usageLimit ? `/${rule.usageLimit}` : ''}
                      {rule.usageLimit && (
                        <div className="w-16 h-1 bg-zinc-700 rounded-full mt-1">
                          <div className="h-1 bg-violet-500 rounded-full" style={{ width: `${Math.min(100, (rule.usageCount / rule.usageLimit) * 100)}%` }} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {rule.validFrom ? new Date(rule.validFrom).toLocaleDateString() : '—'}
                      {rule.validTo ? ` → ${new Date(rule.validTo).toLocaleDateString()}` : ''}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggle(rule)} className="text-zinc-400 hover:text-zinc-200 transition-colors">
                        {rule.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-4 py-3"><Link href={`/pricing/rules/${rule.id}`} className="text-zinc-500 hover:text-zinc-300"><ChevronRight className="w-4 h-4" /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <h2 className="text-lg font-semibold text-zinc-100">New Price Rule</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Rule Type *</label>
                <select value={form.ruleType} onChange={e => setForm(f => ({ ...f, ruleType: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500">
                  {RULE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Condition JSON</label>
                <textarea value={form.conditionJson} onChange={e => setForm(f => ({ ...f, conditionJson: e.target.value }))} rows={3}
                  placeholder={'{"minQty": 2, "skus": ["SKU-001"]}'}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm font-mono focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Action JSON</label>
                <textarea value={form.actionJson} onChange={e => setForm(f => ({ ...f, actionJson: e.target.value }))} rows={3}
                  placeholder={'{"discountPct": 10}'}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm font-mono focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Priority</label>
                  <input value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} type="number"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Valid From</label>
                  <input type="date" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Valid To</label>
                  <input type="date" value={form.validTo} onChange={e => setForm(f => ({ ...f, validTo: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Usage Limit</label>
                <input value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} type="number" placeholder="Leave blank for unlimited"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.stackable} onChange={e => setForm(f => ({ ...f, stackable: e.target.checked }))} className="accent-violet-500" />
                <span className="text-sm text-zinc-300">Stackable with other rules</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-2 text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className={cn('flex-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg py-2 text-sm font-medium transition-colors', saving && 'opacity-50')}>
                  {saving ? 'Creating…' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
