'use client'
import { useEffect, useState } from 'react'
import { Shield, Plus, Trash2, Info } from 'lucide-react'

type FraudRule = {
  id: string
  ruleName: string
  ruleType: string
  threshold: number | null
  action: string
  points: number
  isActive: boolean
  createdAt: string
}

const ACTION_BADGE: Record<string, string> = {
  flag: 'bg-yellow-500/20 text-yellow-400',
  hold: 'bg-orange-500/20 text-orange-400',
  block: 'bg-red-500/20 text-red-400',
}

const RULE_TYPES = ['order-amount', 'new-customer', 'multiple-cards', 'shipping-mismatch', 'velocity']
const ACTIONS = ['flag', 'hold', 'block']

const BLANK: Omit<FraudRule, 'id' | 'createdAt'> = {
  ruleName: '',
  ruleType: 'order-amount',
  threshold: null,
  action: 'flag',
  points: 10,
  isActive: true,
}

export default function FraudRulesPage() {
  const [rules, setRules] = useState<FraudRule[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ ...BLANK })
  const [creating, setCreating] = useState(false)

  const load = async () => {
    const res = await fetch('/api/call-center/fraud-rules')
    const data = await res.json()
    setRules(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function createRule() {
    if (!form.ruleName) return
    setCreating(true)
    await fetch('/api/call-center/fraud-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    await load()
    setForm({ ...BLANK })
    setCreating(false)
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/call-center/fraud-rules/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, isActive: !current } : r))
  }

  async function deleteRule(id: string) {
    if (!confirm('Delete this fraud rule?')) return
    await fetch(`/api/call-center/fraud-rules/${id}`, { method: 'DELETE' })
    setRules((prev) => prev.filter((r) => r.id !== id))
  }

  const totalMaxScore = rules.filter((r) => r.isActive).reduce((s, r) => s + r.points, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-red-400" />
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Fraud Rules Configuration</h1>
          <p className="text-zinc-500 text-sm">Automated fraud detection engine</p>
        </div>
      </div>

      <div className="bg-red-950/20 border border-red-800/30 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
        <div className="text-sm">
          <span className="text-red-400 font-medium">Scoring Logic: </span>
          <span className="text-zinc-400">
            Orders scoring <span className="text-red-400 font-bold">50+</span> are automatically placed on fraud hold.
            Current active rules max score: <span className="text-zinc-200 font-bold">{totalMaxScore}</span>
          </span>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Rule Name', 'Type', 'Threshold', 'Action', 'Points', 'Active', 'Delete'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-600">Loading...</td></tr>
            ) : rules.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-600">No rules configured.</td></tr>
            ) : (
              rules.map((rule) => (
                <tr key={rule.id} className={`border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors ${!rule.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 text-zinc-200 font-medium">{rule.ruleName}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs font-mono">{rule.ruleType}</td>
                  <td className="px-4 py-3 text-zinc-300">{rule.threshold != null ? `$${rule.threshold}` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${ACTION_BADGE[rule.action] ?? 'bg-zinc-700 text-zinc-300'}`}>
                      {rule.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-red-400 font-bold">+{rule.points}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(rule.id, rule.isActive)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${rule.isActive ? 'bg-green-600' : 'bg-zinc-700'}`}
                    >
                      <span className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${rule.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteRule(rule.id)} className="text-zinc-600 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h2 className="font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-400" />
          Add New Rule
        </h2>
        <div className="grid grid-cols-5 gap-3">
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Rule Name</label>
            <input
              value={form.ruleName}
              onChange={(e) => setForm((p) => ({ ...p, ruleName: e.target.value }))}
              placeholder="e.g. High Value Order"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Rule Type</label>
            <select
              value={form.ruleType}
              onChange={(e) => setForm((p) => ({ ...p, ruleType: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none"
            >
              {RULE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Threshold ($)</label>
            <input
              type="number"
              min={0}
              value={form.threshold ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, threshold: e.target.value ? parseFloat(e.target.value) : null }))}
              placeholder="e.g. 500"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Action</label>
            <select
              value={form.action}
              onChange={(e) => setForm((p) => ({ ...p, action: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none"
            >
              {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Points</label>
            <input
              type="number"
              min={1}
              value={form.points}
              onChange={(e) => setForm((p) => ({ ...p, points: parseInt(e.target.value) }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={createRule}
            disabled={!form.ruleName || creating}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            Add Rule
          </button>
        </div>
      </div>
    </div>
  )
}
