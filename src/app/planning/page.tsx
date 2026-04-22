'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart3, Calendar, TrendingUp, Layers, Shield, Play, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface Plan {
  id: string
  name: string
  planType: string
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

export default function PlanningHub() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [forecastCount, setForecastCount] = useState(0)
  const [safetyCount, setSafetyCount] = useState(0)
  const [running, setRunning] = useState(false)
  const [runMsg, setRunMsg] = useState('')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [p, f, s] = await Promise.all([
      fetch('/api/planning/master-plans').then(r => r.json()),
      fetch('/api/planning/forecasts').then(r => r.json()),
      fetch('/api/planning/safety-stock').then(r => r.json()),
    ])
    setPlans(Array.isArray(p) ? p : [])
    setForecastCount(Array.isArray(f) ? f.length : 0)
    setSafetyCount(Array.isArray(s) ? s.length : 0)
  }

  const totalOrders = plans.reduce((s, p) => s + p._count.plannedOrders, 0)
  const totalMessages = plans.reduce((s, p) => s + p._count.actionMessages, 0)
  const activePlans = plans.filter(p => p.status !== 'draft').length

  async function quickRun() {
    const first = plans[0]
    if (!first) return
    setRunning(true)
    setRunMsg('')
    const res = await fetch(`/api/planning/master-plans/${first.id}/run`, { method: 'POST' })
    const data = await res.json()
    setRunMsg(`Plan "${first.name}" completed: ${data.ordersGenerated} orders, ${data.messagesGenerated} messages`)
    setRunning(false)
    fetchAll()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Master Planning</h1>
          <p className="text-zinc-400 text-sm mt-1">D365 Supply Chain — Master Planning & Demand Forecasting</p>
        </div>
        <button onClick={quickRun} disabled={running || plans.length === 0}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}Run Master Plan
        </button>
      </div>

      {runMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />{runMsg}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Active Plans', value: activePlans, icon: BarChart3, color: 'text-blue-400' },
          { label: 'Planned Orders', value: totalOrders, icon: Calendar, color: 'text-purple-400' },
          { label: 'Action Messages', value: totalMessages, icon: AlertCircle, color: 'text-yellow-400' },
          { label: 'Forecast Models', value: forecastCount, icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Safety Stock Rules', value: safetyCount, icon: Shield, color: 'text-red-400' },
        ].map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">{k.label}</span>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <div className="text-2xl font-bold text-zinc-100">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Master Plans', href: '/planning/master-plans', icon: Calendar, desc: 'Static, dynamic & regen plans' },
          { label: 'Demand Forecasting', href: '/planning/forecasts', icon: TrendingUp, desc: 'Moving avg, exponential, trend' },
          { label: 'Coverage Groups', href: '/planning/coverage-groups', icon: Layers, desc: 'Period, min-max, requirement' },
          { label: 'Safety Stock', href: '/planning/safety-stock', icon: Shield, desc: 'Fixed, days-of-supply, service level' },
        ].map(q => (
          <Link key={q.href} href={q.href} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 transition-colors group">
            <q.icon className="w-6 h-6 text-blue-400 mb-3" />
            <div className="text-sm font-semibold text-zinc-100 group-hover:text-white">{q.label}</div>
            <div className="text-xs text-zinc-500 mt-1">{q.desc}</div>
          </Link>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Plan Runs</h2>
          <Link href="/planning/master-plans" className="text-xs text-blue-400 hover:text-blue-300">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Plan Name', 'Type', 'Last Run', 'Orders', 'Messages', 'Status'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-600 text-sm">No plans yet</td></tr>
              )}
              {plans.map(p => (
                <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-6 py-3 text-zinc-100 font-medium">
                    <Link href={`/planning/master-plans/${p.id}`} className="hover:text-blue-400">{p.name}</Link>
                  </td>
                  <td className="px-6 py-3 text-zinc-400 capitalize">{p.planType}</td>
                  <td className="px-6 py-3 text-zinc-400 text-xs">
                    {p.lastRunAt ? <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(p.lastRunAt).toLocaleString()}</span> : <span className="text-zinc-600">Never</span>}
                  </td>
                  <td className="px-6 py-3 text-zinc-300">{p._count.plannedOrders}</td>
                  <td className="px-6 py-3 text-zinc-300">{p._count.actionMessages}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_BADGE[p.status] ?? 'bg-zinc-700 text-zinc-300'}`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
