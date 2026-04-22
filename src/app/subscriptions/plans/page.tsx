'use client'
import { useEffect, useState } from 'react'
import { Package, Plus, Trash2, Edit2, Check, X, Users } from 'lucide-react'

interface Plan {
  id: string
  name: string
  description?: string
  planCode: string
  billingCycle: string
  price: number
  setupFee: number
  trialDays: number
  isActive: boolean
  features: string
  _count?: { subscriptions: number }
}

const CYCLES = ['weekly', 'monthly', 'quarterly', 'annually']

const cycleColor: Record<string, string> = {
  weekly: 'bg-cyan-500/20 text-cyan-400',
  monthly: 'bg-blue-500/20 text-blue-400',
  quarterly: 'bg-violet-500/20 text-violet-400',
  annually: 'bg-emerald-500/20 text-emerald-400',
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', planCode: '', billingCycle: 'monthly', price: '', setupFee: '', trialDays: '0', description: '' })
  const [features, setFeatures] = useState<string[]>([])
  const [newFeature, setNewFeature] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    fetch('/api/subscriptions/plans').then(r => r.json()).then(d => { setPlans(d); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const submit = async () => {
    setSaving(true)
    await fetch('/api/subscriptions/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: +form.price, setupFee: +form.setupFee, trialDays: +form.trialDays, features }),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ name: '', planCode: '', billingCycle: 'monthly', price: '', setupFee: '', trialDays: '0', description: '' })
    setFeatures([])
    load()
  }

  const toggleActive = async (plan: Plan) => {
    await fetch(`/api/subscriptions/plans/${plan.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !plan.isActive }),
    })
    load()
  }

  const deletePlan = async (id: string) => {
    if (!confirm('Delete this plan?')) return
    await fetch(`/api/subscriptions/plans/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2"><Package className="w-6 h-6 text-blue-400" />Subscription Plans</h1>
          <p className="text-zinc-500 text-sm mt-1">{plans.length} plans configured</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-zinc-200">New Subscription Plan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'name', label: 'Plan Name', type: 'text' },
              { key: 'planCode', label: 'Plan Code', type: 'text' },
              { key: 'price', label: 'Price / Cycle ($)', type: 'number' },
              { key: 'setupFee', label: 'Setup Fee ($)', type: 'number' },
              { key: 'trialDays', label: 'Trial Days', type: 'number' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-zinc-400 block mb-1">{f.label}</label>
                <input
                  type={f.type}
                  value={(form as Record<string, string>)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Billing Cycle</label>
              <select value={form.billingCycle} onChange={e => setForm(p => ({ ...p, billingCycle: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                {CYCLES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-2">Features</label>
            <div className="flex gap-2 mb-2">
              <input value={newFeature} onChange={e => setNewFeature(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newFeature.trim()) { setFeatures(p => [...p, newFeature.trim()]); setNewFeature('') } }} placeholder="Add feature and press Enter" className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              <button onClick={() => { if (newFeature.trim()) { setFeatures(p => [...p, newFeature.trim()]); setNewFeature('') } }} className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-3 py-2 rounded-lg text-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {features.map((f, i) => (
                <span key={i} className="flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-full">
                  <Check className="w-3 h-3 text-emerald-400" />{f}
                  <button onClick={() => setFeatures(p => p.filter((_, j) => j !== i))}><X className="w-3 h-3 text-zinc-500 hover:text-red-400" /></button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={submit} disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Create Plan'}</button>
            <button onClick={() => setShowForm(false)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-zinc-500 text-sm">Loading plans…</div>
      ) : plans.length === 0 ? (
        <div className="text-zinc-600 text-sm text-center py-16">No plans yet. Create your first plan.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => {
            const featureList: string[] = (() => { try { return JSON.parse(plan.features) } catch { return [] } })()
            return (
              <div key={plan.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-base font-semibold text-zinc-100">{plan.name}</div>
                    <div className="text-xs text-zinc-500 font-mono mt-0.5">{plan.planCode}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cycleColor[plan.billingCycle] ?? 'bg-zinc-700 text-zinc-400'}`}>{plan.billingCycle}</span>
                </div>
                {plan.description && <p className="text-xs text-zinc-500">{plan.description}</p>}
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-zinc-100">${plan.price.toFixed(2)}</span>
                  {plan.setupFee > 0 && <span className="text-xs text-zinc-500">+${plan.setupFee} setup</span>}
                  {plan.trialDays > 0 && <span className="text-xs bg-yellow-500/15 text-yellow-400 px-2 py-0.5 rounded-full">{plan.trialDays}d trial</span>}
                </div>
                {featureList.length > 0 && (
                  <ul className="space-y-1">
                    {featureList.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center gap-1 text-xs text-zinc-500 mt-auto pt-1 border-t border-zinc-800">
                  <Users className="w-3 h-3" />{plan._count?.subscriptions ?? 0} subscribers
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(plan)} className={`flex-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${plan.isActive ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'}`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <a href={`/subscriptions/plans/${plan.id}`} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors"><Edit2 className="w-3.5 h-3.5" /></a>
                  <button onClick={() => deletePlan(plan.id)} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
