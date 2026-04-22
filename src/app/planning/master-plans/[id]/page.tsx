'use client'
import { useEffect, useState, use } from 'react'
import { Play, RefreshCw, Clock, Check, X, Lock } from 'lucide-react'

interface PlannedOrder {
  id: string; orderType: string; productName: string; qty: number
  needDate: string | null; sourceName: string | null; destinationName: string | null
  status: string; firmedAt: string | null
}
interface ActionMessage {
  id: string; messageType: string; productName: string; currentDate: string | null
  suggestedDate: string | null; currentQty: number | null; suggestedQty: number | null
  reason: string | null; status: string
}
interface Plan {
  id: string; name: string; planType: string; horizon: number; fenceInside: number
  status: string; lastRunAt: string | null
  plannedOrders: PlannedOrder[]; actionMessages: ActionMessage[]
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300', running: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-emerald-500/20 text-emerald-400', failed: 'bg-red-500/20 text-red-400',
  planned: 'bg-zinc-700 text-zinc-300', firmed: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400', open: 'bg-yellow-500/20 text-yellow-400',
  accepted: 'bg-emerald-500/20 text-emerald-400', rejected: 'bg-red-500/20 text-red-400',
}
const ORDER_TYPE_BADGE: Record<string, string> = {
  purchase: 'bg-blue-500/20 text-blue-400', transfer: 'bg-purple-500/20 text-purple-400',
  production: 'bg-emerald-500/20 text-emerald-400',
}
const MSG_TYPE_BADGE: Record<string, string> = {
  advance: 'bg-yellow-500/20 text-yellow-400', postpone: 'bg-orange-500/20 text-orange-400',
  increase: 'bg-emerald-500/20 text-emerald-400', decrease: 'bg-red-500/20 text-red-400',
  cancel: 'bg-red-600/20 text-red-300', 'new-order': 'bg-blue-500/20 text-blue-400',
}

type Tab = 'orders' | 'messages' | 'settings'
type OrderFilter = 'all' | 'purchase' | 'transfer' | 'production' | 'firmed'
type MsgFilter = 'open' | 'accepted' | 'rejected'

export default function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [tab, setTab] = useState<Tab>('orders')
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all')
  const [msgFilter, setMsgFilter] = useState<MsgFilter>('open')
  const [running, setRunning] = useState(false)
  const [settings, setSettings] = useState({ name: '', planType: 'static', horizon: 90, fenceInside: 7 })

  useEffect(() => { fetchPlan() }, [id])

  async function fetchPlan() {
    const data = await fetch(`/api/planning/master-plans/${id}`).then(r => r.json())
    setPlan(data)
    setSettings({ name: data.name, planType: data.planType, horizon: data.horizon, fenceInside: data.fenceInside })
  }

  async function runPlan() {
    setRunning(true)
    await fetch(`/api/planning/master-plans/${id}/run`, { method: 'POST' })
    setRunning(false); fetchPlan()
  }

  async function firmOrder(oid: string) {
    await fetch(`/api/planning/master-plans/${id}/planned-orders/${oid}/firm`, { method: 'POST' })
    fetchPlan()
  }

  async function firmAllPurchase() {
    const orders = plan?.plannedOrders.filter(o => o.orderType === 'purchase' && o.status === 'planned') ?? []
    await Promise.all(orders.map(o => fetch(`/api/planning/master-plans/${id}/planned-orders/${o.id}/firm`, { method: 'POST' })))
    fetchPlan()
  }

  async function updateMessage(mid: string, status: string) {
    await fetch(`/api/planning/master-plans/${id}/action-messages/${mid}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    })
    fetchPlan()
  }

  async function saveSettings() {
    await fetch(`/api/planning/master-plans/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings),
    })
    fetchPlan()
  }

  if (!plan) return <div className="p-6 text-zinc-500">Loading...</div>

  const filteredOrders = plan.plannedOrders.filter(o => {
    if (orderFilter === 'all') return true
    if (orderFilter === 'firmed') return o.status === 'firmed'
    return o.orderType === orderFilter
  })
  const filteredMessages = plan.actionMessages.filter(m => m.status === msgFilter)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-100">{plan.name}</h1>
            <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_BADGE[plan.status] ?? 'bg-zinc-700 text-zinc-300'}`}>{plan.status}</span>
          </div>
          {plan.lastRunAt && <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />Last run: {new Date(plan.lastRunAt).toLocaleString()}</p>}
        </div>
        <button onClick={runPlan} disabled={running}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}Run Plan Now
        </button>
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {(['orders', 'messages', 'settings'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}>
            {t === 'orders' ? `Planned Orders (${plan.plannedOrders.length})` : t === 'messages' ? `Action Messages (${plan.actionMessages.length})` : 'Settings'}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {(['all', 'purchase', 'transfer', 'production', 'firmed'] as OrderFilter[]).map(f => (
                <button key={f} onClick={() => setOrderFilter(f)}
                  className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${orderFilter === f ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>{f}</button>
              ))}
            </div>
            <button onClick={firmAllPurchase} className="flex items-center gap-1 text-xs bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 px-3 py-1.5 rounded transition-colors">
              <Lock className="w-3 h-3" />Firm All Purchase
            </button>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-zinc-800">
                {['Product', 'Type', 'Qty', 'Need Date', 'Source', 'Destination', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filteredOrders.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">No orders match this filter</td></tr>}
                {filteredOrders.map(o => (
                  <tr key={o.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                    <td className="px-4 py-3 text-zinc-100 font-medium">{o.productName}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${ORDER_TYPE_BADGE[o.orderType] ?? 'bg-zinc-700 text-zinc-300'}`}>{o.orderType}</span></td>
                    <td className="px-4 py-3 text-zinc-300">{o.qty.toLocaleString()}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{o.needDate ? new Date(o.needDate).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{o.sourceName ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{o.destinationName ?? '—'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[o.status] ?? 'bg-zinc-700 text-zinc-300'}`}>{o.status}</span></td>
                    <td className="px-4 py-3">
                      {o.status === 'planned' && (
                        <button onClick={() => firmOrder(o.id)} className="flex items-center gap-1 text-xs bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 px-2 py-1 rounded transition-colors">
                          <Lock className="w-3 h-3" />Firm
                        </button>
                      )}
                      {o.status === 'firmed' && <span className="text-xs text-zinc-600">Firmed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'messages' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {(['open', 'accepted', 'rejected'] as MsgFilter[]).map(f => (
              <button key={f} onClick={() => setMsgFilter(f)}
                className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${msgFilter === f ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>{f}</button>
            ))}
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-zinc-800">
                {['Type', 'Product', 'Current Date', 'Suggested Date', 'Curr Qty', 'Sugg Qty', 'Reason', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filteredMessages.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">No {msgFilter} messages</td></tr>}
                {filteredMessages.map(m => (
                  <tr key={m.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${MSG_TYPE_BADGE[m.messageType] ?? 'bg-zinc-700 text-zinc-300'}`}>{m.messageType}</span></td>
                    <td className="px-4 py-3 text-zinc-100 font-medium">{m.productName}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{m.currentDate ? new Date(m.currentDate).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{m.suggestedDate ? new Date(m.suggestedDate).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-zinc-300">{m.currentQty ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-300">{m.suggestedQty ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs max-w-[180px] truncate">{m.reason ?? '—'}</td>
                    <td className="px-4 py-3">
                      {m.status === 'open' ? (
                        <div className="flex gap-2">
                          <button onClick={() => updateMessage(m.id, 'accepted')} className="flex items-center gap-1 text-xs bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 px-2 py-1 rounded transition-colors">
                            <Check className="w-3 h-3" />Accept
                          </button>
                          <button onClick={() => updateMessage(m.id, 'rejected')} className="flex items-center gap-1 text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30 px-2 py-1 rounded transition-colors">
                            <X className="w-3 h-3" />Reject
                          </button>
                        </div>
                      ) : <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[m.status]}`}>{m.status}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5 max-w-lg">
          <h3 className="text-sm font-semibold text-zinc-100">Plan Settings</h3>
          <div className="space-y-4">
            {[
              { label: 'Plan Name', key: 'name', type: 'text' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-zinc-400 mb-1">{f.label}</label>
                <input value={(settings as any)[f.key]} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Plan Type</label>
              <select value={settings.planType} onChange={e => setSettings({ ...settings, planType: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                <option value="static">Static</option>
                <option value="dynamic">Dynamic</option>
                <option value="regen">Regenerative</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Horizon (days)</label>
              <input type="number" value={settings.horizon} onChange={e => setSettings({ ...settings, horizon: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Action Fence (days)</label>
              <input type="number" value={settings.fenceInside} onChange={e => setSettings({ ...settings, fenceInside: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Save Changes</button>
            <button onClick={runPlan} disabled={running}
              className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}Run Plan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
