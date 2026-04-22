'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Sliders, Plus, RefreshCw, ChevronRight } from 'lucide-react'

interface PricingRule {
  id: string
  name: string
  adjustType: string
  adjustValue: number
  productId: string | null
  categoryId: string | null
  priceGroupId: string | null
  startDate: string | null
  endDate: string | null
  isActive: boolean
  createdAt: string
}

const ADJUST_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  percent: { label: 'Percent', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  fixed: { label: 'Fixed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  new_price: { label: 'New Price', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
}

function formatDate(dt: string | null) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PricingRulesPage() {
  const [rules, setRules] = useState<PricingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', adjustType: 'percent', adjustValue: '', startDate: '', endDate: '',
  })

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/commerce/pricing?view=rules')
      const data = await res.json()
      setRules(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/commerce/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          view: 'rule',
          name: form.name,
          adjustType: form.adjustType,
          adjustValue: parseFloat(form.adjustValue) || 0,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); return }
      setShowForm(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="Pricing Rules" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
              <Link href="/commerce/pricing" className="hover:text-zinc-300">Price Groups</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-zinc-300">Pricing Rules</span>
            </div>
            <h1 className="text-xl font-bold text-zinc-100">Pricing Rules</h1>
            <p className="text-sm text-zinc-500">{rules.length} rule(s) configured</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> New Rule
            </button>
          </div>
        </div>

        {showForm && (
          <Card className="border-indigo-500/20 bg-indigo-500/5">
            <CardContent className="pt-5 pb-5">
              <h3 className="text-sm font-semibold text-zinc-100 mb-4">New Pricing Rule</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-zinc-500 mb-1">Rule Name *</label>
                  <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    placeholder="Holiday Price Reduction" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Adjustment Type</label>
                  <select className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    value={form.adjustType} onChange={e => setForm(f => ({ ...f, adjustType: e.target.value }))}>
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="new_price">New Price</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Value *</label>
                  <input type="number" step="0.01"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    placeholder="10" value={form.adjustValue}
                    onChange={e => setForm(f => ({ ...f, adjustValue: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Start Date</label>
                  <input type="date" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">End Date</label>
                  <input type="date" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
                {error && <p className="col-span-2 text-xs text-rose-400">{error}</p>}
                <div className="col-span-2 flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50">
                    {saving ? 'Saving…' : 'Create Rule'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card><CardContent className="flex items-center justify-center py-16 text-zinc-600">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading…
          </CardContent></Card>
        ) : rules.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <Sliders className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm">No pricing rules yet.</p>
          </CardContent></Card>
        ) : (
          <Card>
            <CardContent className="px-0 py-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-6 py-3">Rule Name</th>
                    <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Type</th>
                    <th className="text-right text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Value</th>
                    <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Start</th>
                    <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">End</th>
                    <th className="text-center text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map(rule => {
                    const typeInfo = ADJUST_TYPE_LABELS[rule.adjustType] ?? ADJUST_TYPE_LABELS.percent
                    const now = new Date()
                    const isExpired = rule.endDate && new Date(rule.endDate) < now
                    const isUpcoming = rule.startDate && new Date(rule.startDate) > now
                    const statusLabel = !rule.isActive ? 'Inactive' : isExpired ? 'Expired' : isUpcoming ? 'Upcoming' : 'Active'
                    const statusColor = !rule.isActive || isExpired
                      ? 'bg-zinc-700/30 text-zinc-500 border-zinc-700/40'
                      : isUpcoming
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    return (
                      <tr key={rule.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-3 font-medium text-zinc-200">{rule.name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded border ${typeInfo.color}`}>{typeInfo.label}</span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-zinc-300">
                          {rule.adjustType === 'percent' ? `${rule.adjustValue}%`
                            : rule.adjustType === 'fixed' ? `-$${rule.adjustValue}`
                            : `$${rule.adjustValue}`}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{formatDate(rule.startDate)}</td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{formatDate(rule.endDate)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded border ${statusColor}`}>{statusLabel}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
