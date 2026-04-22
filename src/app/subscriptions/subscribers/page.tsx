'use client'
import { useEffect, useState } from 'react'
import { Users, Plus, Search, Pause, Play, X, Eye } from 'lucide-react'
import Link from 'next/link'

interface Plan { id: string; name: string; billingCycle: string }
interface Sub {
  id: string
  subscriptionNumber: string
  customerName: string
  customerEmail?: string
  status: string
  startDate: string
  nextBillingDate?: string
  billingAmount: number
  totalBilled: number
  plan: { name: string; billingCycle: string }
  _count: { billingCycles: number }
}

const STATUS_TABS = ['all', 'trial', 'active', 'paused', 'cancelled', 'past-due', 'expired']

const statusBadge: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400',
  trial: 'bg-cyan-500/20 text-cyan-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
  cancelled: 'bg-red-500/20 text-red-400',
  expired: 'bg-zinc-700 text-zinc-400',
  'past-due': 'bg-orange-500/20 text-orange-400',
}

export default function SubscribersPage() {
  const [subs, setSubs] = useState<Sub[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ planId: '', customerName: '', customerEmail: '', quantity: '1', startDate: new Date().toISOString().slice(0, 10), trialDays: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (tab !== 'all') params.set('status', tab)
    if (search) params.set('search', search)
    Promise.all([
      fetch(`/api/subscriptions?${params}`).then(r => r.json()),
      fetch('/api/subscriptions/plans').then(r => r.json()),
    ]).then(([s, p]) => { setSubs(s); setPlans(p); setLoading(false) })
  }

  useEffect(() => { load() }, [tab, search])

  const submit = async () => {
    setSaving(true)
    await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, quantity: +form.quantity, trialDays: form.trialDays ? +form.trialDays : undefined }),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ planId: '', customerName: '', customerEmail: '', quantity: '1', startDate: new Date().toISOString().slice(0, 10), trialDays: '' })
    load()
  }

  const action = async (id: string, path: string, body?: object) => {
    await fetch(`/api/subscriptions/${id}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    load()
  }

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2"><Users className="w-6 h-6 text-blue-400" />Subscribers</h1>
          <p className="text-zinc-500 text-sm mt-1">{subs.length} subscribers shown</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Subscription
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-zinc-200">New Subscription</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Plan</label>
              <select value={form.planId} onChange={e => setForm(p => ({ ...p, planId: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                <option value="">Select plan…</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name} ({p.billingCycle})</option>)}
              </select>
            </div>
            {[
              { key: 'customerName', label: 'Customer Name', type: 'text' },
              { key: 'customerEmail', label: 'Email', type: 'email' },
              { key: 'quantity', label: 'Quantity', type: 'number' },
              { key: 'startDate', label: 'Start Date', type: 'date' },
              { key: 'trialDays', label: 'Trial Days Override', type: 'number' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-zinc-400 block mb-1">{f.label}</label>
                <input type={f.type} value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={submit} disabled={saving || !form.planId || !form.customerName} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Creating…' : 'Create Subscription'}</button>
            <button onClick={() => setShowForm(false)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {STATUS_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors capitalize ${tab === t ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>{t}</button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email…" className="bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 w-56" />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-950">
            <tr>
              {['Sub #', 'Customer', 'Plan', 'Status', 'Start', 'Next Billing', 'Amount', 'Total Billed', 'Cycles', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-zinc-600">Loading…</td></tr>
            ) : subs.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-zinc-600">No subscribers found</td></tr>
            ) : subs.map(sub => (
              <tr key={sub.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 text-zinc-300 font-mono text-xs">{sub.subscriptionNumber}</td>
                <td className="px-4 py-3">
                  <div className="text-zinc-200 font-medium">{sub.customerName}</div>
                  {sub.customerEmail && <div className="text-zinc-500 text-xs">{sub.customerEmail}</div>}
                </td>
                <td className="px-4 py-3 text-zinc-400">{sub.plan?.name ?? '—'}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[sub.status] ?? 'bg-zinc-700 text-zinc-400'}`}>{sub.status}</span></td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(sub.startDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 text-zinc-200">${sub.billingAmount.toFixed(2)}</td>
                <td className="px-4 py-3 text-zinc-400">${sub.totalBilled.toFixed(2)}</td>
                <td className="px-4 py-3 text-zinc-500">{sub._count?.billingCycles ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link href={`/subscriptions/subscribers/${sub.id}`} className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors"><Eye className="w-3.5 h-3.5" /></Link>
                    {sub.status === 'active' && (
                      <button onClick={() => action(sub.id, 'pause', {})} className="p-1.5 rounded bg-zinc-800 hover:bg-yellow-500/20 text-zinc-400 hover:text-yellow-400 transition-colors"><Pause className="w-3.5 h-3.5" /></button>
                    )}
                    {sub.status === 'paused' && (
                      <button onClick={() => action(sub.id, 'resume')} className="p-1.5 rounded bg-zinc-800 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 transition-colors"><Play className="w-3.5 h-3.5" /></button>
                    )}
                    {(sub.status === 'active' || sub.status === 'trial' || sub.status === 'paused') && (
                      <button onClick={() => { const r = prompt('Cancel reason?'); if (r !== null) action(sub.id, 'cancel', { reason: r }) }} className="p-1.5 rounded bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
