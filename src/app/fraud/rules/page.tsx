'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Plus, X, ToggleLeft, ToggleRight } from 'lucide-react'

type FraudRule = {
  id: string
  ruleName: string
  ruleType: string
  riskScore: number
  action: string
  triggeredCount: number
  isActive: boolean
  description: string | null
}

const TYPE_COLORS: Record<string, string> = {
  velocity: 'bg-purple-500/10 text-purple-400',
  amount: 'bg-blue-500/10 text-blue-400',
  location: 'bg-amber-500/10 text-amber-400',
  device: 'bg-cyan-500/10 text-cyan-400',
  blacklist: 'bg-red-500/10 text-red-400',
}

export default function FraudRulesPage() {
  const [rules, setRules] = useState<FraudRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ ruleName: '', ruleType: 'velocity', riskScore: '50', action: 'review', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/fraud/rules')
      .then((r) => r.json())
      .then(setRules)
      .finally(() => setLoading(false))
  }, [])

  async function toggleActive(rule: FraudRule) {
    await fetch(`/api/fraud/rules/${rule.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !rule.isActive }),
    })
    setRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, isActive: !r.isActive } : r))
  }

  async function handleCreate() {
    setSaving(true)
    const res = await fetch('/api/fraud/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, riskScore: parseInt(form.riskScore) }),
    })
    const created = await res.json()
    setRules((prev) => [created, ...prev])
    setShowModal(false)
    setForm({ ruleName: '', ruleType: 'velocity', riskScore: '50', action: 'review', description: '' })
    setSaving(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Fraud Rules</h1>
          <p className="text-zinc-400 text-sm mt-1">Configure automated fraud detection rules</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Rule
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Rule Name</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Type</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Risk Score</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Action</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Triggered</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center text-zinc-500 py-8">Loading...</td></tr>
            ) : rules.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-zinc-500 py-8">No rules configured</td></tr>
            ) : rules.map((r) => (
              <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-zinc-100">{r.ruleName}</p>
                  {r.description && <p className="text-xs text-zinc-500">{r.description}</p>}
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize', TYPE_COLORS[r.ruleType] ?? 'bg-zinc-700 text-zinc-300')}>{r.ruleType}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('font-medium', r.riskScore >= 75 ? 'text-red-400' : r.riskScore >= 50 ? 'text-orange-400' : r.riskScore >= 25 ? 'text-yellow-400' : 'text-emerald-400')}>
                    {r.riskScore}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400 capitalize">{r.action}</td>
                <td className="px-4 py-3 text-zinc-400">{r.triggeredCount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(r)} className="text-zinc-400 hover:text-zinc-100 transition-colors">
                    {r.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-100">New Fraud Rule</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Rule Name</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  value={form.ruleName} onChange={(e) => setForm((f) => ({ ...f, ruleName: e.target.value }))} placeholder="High velocity purchases" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5">Type</label>
                  <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={form.ruleType} onChange={(e) => setForm((f) => ({ ...f, ruleType: e.target.value }))}>
                    <option value="velocity">Velocity</option>
                    <option value="amount">Amount</option>
                    <option value="location">Location</option>
                    <option value="device">Device</option>
                    <option value="blacklist">Blacklist</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5">Risk Score (0-100)</label>
                  <input type="number" min="0" max="100" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={form.riskScore} onChange={(e) => setForm((f) => ({ ...f, riskScore: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Action</label>
                <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  value={form.action} onChange={(e) => setForm((f) => ({ ...f, action: e.target.value }))}>
                  <option value="review">Review</option>
                  <option value="block">Block</option>
                  <option value="flag">Flag</option>
                  <option value="notify">Notify</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Description</label>
                <textarea className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none" rows={2}
                  value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm py-2 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.ruleName} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">
                {saving ? 'Saving...' : 'Create Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
