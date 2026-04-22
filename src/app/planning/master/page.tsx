'use client'
import { useEffect, useState } from 'react'
import { Play, RefreshCw, Calendar, Clock, CheckCircle, AlertCircle, X, ChevronDown } from 'lucide-react'

interface MasterPlanRow {
  id: string
  name: string
  planType: string
  lastRunAt: string | null
  status: string
  _count: { plannedOrders: number; actionMessages: number }
}

interface PlannedOrderRow {
  id: string
  planId: string
  productName: string
  orderType: string
  qty: number
  needDate: string | null
  status: string
  sourceName: string | null
  destinationName: string | null
}

const STATUS_BADGE: Record<string, string> = {
  draft:     'bg-zinc-700/60 text-zinc-400',
  running:   'bg-blue-500/20 text-blue-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  failed:    'bg-red-500/20 text-red-400',
}

const ORDER_TYPE_BADGE: Record<string, string> = {
  purchase:   'bg-blue-500/20 text-blue-400',
  production: 'bg-purple-500/20 text-purple-400',
  transfer:   'bg-yellow-500/20 text-yellow-400',
}

const ORDER_STATUS_BADGE: Record<string, string> = {
  planned:   'bg-zinc-700/60 text-zinc-400',
  firmed:    'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export default function MasterPlanningPage() {
  const [plans, setPlans] = useState<MasterPlanRow[]>([])
  const [orders, setOrders] = useState<PlannedOrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [running, setRunning] = useState(false)
  const [runMsg, setRunMsg] = useState('')
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [runHorizon, setRunHorizon] = useState(90)
  const [includeSafety, setIncludeSafety] = useState(true)
  const [explosionType, setExplosionType] = useState('forward')
  const [filterPlanId, setFilterPlanId] = useState('all')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [p, o] = await Promise.all([
      fetch('/api/planning/master').then(r => r.json()).catch(() => []),
      fetch('/api/planning/master?orders=1').then(r => r.json()).catch(() => ({})),
    ])
    const planArr = Array.isArray(p) ? p : []
    setPlans(planArr)
    setOrders(Array.isArray(o.orders) ? o.orders : [])
    if (planArr.length > 0 && !selectedPlanId) setSelectedPlanId(planArr[0].id)
    setLoading(false)
  }

  async function runPlan() {
    if (!selectedPlanId) return
    setRunning(true)
    setRunMsg('')
    const res = await fetch('/api/planning/master', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: selectedPlanId, horizon: runHorizon, includeSafety, explosionType }),
    })
    const data = await res.json()
    setRunMsg(data.message ?? `Completed: ${data.ordersGenerated ?? 0} orders`)
    setRunning(false)
    setShowModal(false)
    load()
  }

  const visibleOrders = filterPlanId === 'all' ? orders : orders.filter(o => o.planId === filterPlanId)
  const totalOrders   = plans.reduce((s, p) => s + p._count.plannedOrders, 0)
  const totalMessages = plans.reduce((s, p) => s + p._count.actionMessages, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Master Planning</h1>
          <p className="text-zinc-400 text-sm mt-1">Plan runs, planned orders, and explosion settings</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Play className="w-4 h-4" />Run Planning
        </button>
      </div>

      {runMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 text-emerald-400 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 shrink-0" />{runMsg}</div>
          <button onClick={() => setRunMsg('')} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Plans',           value: plans.length,    color: 'text-blue-400' },
          { label: 'Planned Orders',  value: totalOrders,     color: 'text-purple-400' },
          { label: 'Action Messages', value: totalMessages,   color: 'text-yellow-400' },
          { label: 'Active Plans',    value: plans.filter(p => p.status === 'completed').length, color: 'text-emerald-400' },
        ].map(k => (
          <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
            <span className="text-xs text-zinc-500 block mb-2">{k.label}</span>
            <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Plan runs table */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-100">Plan Runs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Plan Name', 'Type', 'Last Run', 'Planned Orders', 'Action Msgs', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="px-6 py-10 text-center text-zinc-600 text-sm">Loading…</td></tr>}
              {!loading && plans.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-zinc-600 text-sm">No master plans found. Create one in the coverage groups module.</td></tr>
              )}
              {plans.map(p => (
                <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="px-4 py-3 text-zinc-100 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs capitalize">{p.planType}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {p.lastRunAt
                      ? <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(p.lastRunAt).toLocaleString()}</span>
                      : <span className="text-zinc-600">Never</span>}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{p._count.plannedOrders}</td>
                  <td className="px-4 py-3 text-zinc-300">{p._count.actionMessages}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[p.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Planned orders table */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Planned Orders</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Filter plan:</span>
            <div className="relative">
              <select value={filterPlanId} onChange={e => setFilterPlanId(e.target.value)}
                className="appearance-none bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs pl-3 pr-7 py-1.5 rounded-lg focus:outline-none">
                <option value="all">All Plans</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Item', 'Qty', 'Type', 'Source', 'Destination', 'Need Date', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleOrders.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-zinc-600 text-sm">No planned orders. Run master planning to generate.</td></tr>
              )}
              {visibleOrders.map(o => (
                <tr key={o.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="px-4 py-3 text-zinc-100 font-medium">{o.productName}</td>
                  <td className="px-4 py-3 text-zinc-300 font-mono">{o.qty.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${ORDER_TYPE_BADGE[o.orderType] ?? 'bg-zinc-700 text-zinc-400'}`}>
                      {o.orderType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{o.sourceName ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{o.destinationName ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {o.needDate ? <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(o.needDate).toLocaleDateString()}</span> : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${ORDER_STATUS_BADGE[o.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Run Planning modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#16213e] border border-zinc-700 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-100">Run Master Planning</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Select Plan</label>
                <select value={selectedPlanId} onChange={e => setSelectedPlanId(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  {plans.length === 0 && <option value="">No plans available</option>}
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name} ({p.planType})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Planning Horizon (days)</label>
                <input type="number" value={runHorizon} onChange={e => setRunHorizon(Number(e.target.value))} min={1} max={365}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Explosion Type</label>
                <select value={explosionType} onChange={e => setExplosionType(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  <option value="forward">Forward Scheduling</option>
                  <option value="backward">Backward Scheduling</option>
                  <option value="infinite">Infinite Capacity</option>
                  <option value="finite">Finite Capacity</option>
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${includeSafety ? 'bg-blue-600' : 'bg-zinc-700'}`}
                  onClick={() => setIncludeSafety(v => !v)}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${includeSafety ? 'translate-x-4' : 'translate-x-1'}`} />
                </div>
                <span className="text-sm text-zinc-300">Include safety stock rules</span>
              </label>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={runPlan} disabled={running || !selectedPlanId}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {running ? 'Running…' : 'Run Plan'}
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-lg text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
