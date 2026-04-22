'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Play, Eye, RefreshCw, Clock } from 'lucide-react'

interface Plan {
  id: string
  name: string
  planType: string
  horizon: number
  fenceInside: number
  status: string
  lastRunAt: string | null
  _count: { plannedOrders: number; actionMessages: number }
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  running: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  failed: 'bg-red-500/20 text-red-400',
}

const INIT = { name: '', planType: 'static', horizon: 90, fenceInside: 7 }

export default function MasterPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [form, setForm] = useState(INIT)
  const [showForm, setShowForm] = useState(false)
  const [runningId, setRunningId] = useState<string | null>(null)

  useEffect(() => { fetchPlans() }, [])

  async function fetchPlans() {
    const data = await fetch('/api/planning/master-plans').then(r => r.json())
    setPlans(Array.isArray(data) ? data : [])
  }

  async function create() {
    if (!form.name.trim()) return
    await fetch('/api/planning/master-plans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setForm(INIT); setShowForm(false); fetchPlans()
  }

  async function runPlan(id: string) {
    setRunningId(id)
    await fetch(`/api/planning/master-plans/${id}/run`, { method: 'POST' })
    setRunningId(null); fetchPlans()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Master Plans</h1>
          <p className="text-zinc-400 text-sm mt-1">Create and run MRP plans across your supply chain</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />New Plan
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-100">New Master Plan</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Plan Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Q3 Static Plan"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Type</label>
              <select value={form.planType} onChange={e => setForm({ ...form, planType: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                <option value="static">Static</option>
                <option value="dynamic">Dynamic</option>
                <option value="regen">Regenerative</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Horizon (days)</label>
              <input type="number" value={form.horizon} onChange={e => setForm({ ...form, horizon: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Fence (days)</label>
              <input type="number" value={form.fenceInside} onChange={e => setForm({ ...form, fenceInside: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={create} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Create</button>
            <button onClick={() => { setShowForm(false); setForm(INIT) }} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Plan Name', 'Type', 'Horizon', 'Status', 'Last Run', 'Orders', 'Messages', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 && <tr><td colSpan={8} className="px-5 py-10 text-center text-zinc-600">No master plans yet.</td></tr>}
            {plans.map(p => (
              <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="px-5 py-3 text-zinc-100 font-medium">{p.name}</td>
                <td className="px-5 py-3 text-zinc-400 capitalize">{p.planType}</td>
                <td className="px-5 py-3 text-zinc-400">{p.horizon}d</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_BADGE[p.status] ?? 'bg-zinc-700 text-zinc-300'}`}>{p.status}</span>
                </td>
                <td className="px-5 py-3 text-zinc-400 text-xs">
                  {p.lastRunAt ? <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(p.lastRunAt).toLocaleString()}</span> : <span className="text-zinc-600">Never</span>}
                </td>
                <td className="px-5 py-3 text-zinc-300">{p._count.plannedOrders}</td>
                <td className="px-5 py-3 text-zinc-300">{p._count.actionMessages}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => runPlan(p.id)} disabled={runningId === p.id}
                      className="flex items-center gap-1 text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 px-2 py-1 rounded transition-colors disabled:opacity-50">
                      {runningId === p.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}Run
                    </button>
                    <Link href={`/planning/master-plans/${p.id}`} className="flex items-center gap-1 text-xs bg-zinc-700 text-zinc-300 hover:bg-zinc-600 px-2 py-1 rounded transition-colors">
                      <Eye className="w-3 h-3" />View
                    </Link>
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
