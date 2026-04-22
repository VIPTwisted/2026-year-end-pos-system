'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { RefreshCw, DollarSign, Clock, Calendar, CheckCircle, AlertCircle, PauseCircle, X } from 'lucide-react'

interface BillingCycle {
  id: string
  cycleNumber: number
  billingDate: string
  amount: number
  status: string
  paymentMethod?: string
  paymentRef?: string
  failureReason?: string
  retryCount: number
}

interface PlanProduct { id: string; productName: string; sku?: string; qty: number }

interface Sub {
  id: string
  subscriptionNumber: string
  customerName: string
  customerEmail?: string
  status: string
  quantity: number
  unitPrice: number
  billingAmount: number
  startDate: string
  trialEndDate?: string
  nextBillingDate?: string
  cancelledAt?: string
  cancelReason?: string
  pausedUntil?: string
  totalBilled: number
  plan: { id: string; name: string; billingCycle: string; price: number; products: PlanProduct[] }
  billingCycles: BillingCycle[]
}

const statusBadge: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400',
  trial: 'bg-cyan-500/20 text-cyan-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
  cancelled: 'bg-red-500/20 text-red-400',
  expired: 'bg-zinc-700 text-zinc-400',
  'past-due': 'bg-orange-500/20 text-orange-400',
}

const billingStatusBadge: Record<string, string> = {
  paid: 'bg-emerald-500/20 text-emerald-400',
  failed: 'bg-red-500/20 text-red-400',
  refunded: 'bg-yellow-500/20 text-yellow-400',
  upcoming: 'bg-blue-500/20 text-blue-400',
}

export default function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [sub, setSub] = useState<Sub | null>(null)
  const [loading, setLoading] = useState(true)
  const [pausedUntil, setPausedUntil] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [showCancel, setShowCancel] = useState(false)
  const [working, setWorking] = useState(false)

  const load = () => {
    fetch(`/api/subscriptions/${id}`)
      .then(r => r.json())
      .then(d => { setSub(d); setLoading(false) })
  }

  useEffect(() => { load() }, [id])

  const doAction = async (path: string, body?: object) => {
    setWorking(true)
    await fetch(`/api/subscriptions/${id}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    setWorking(false)
    load()
  }

  if (loading) return <div className="p-6 text-zinc-500">Loading…</div>
  if (!sub) return <div className="p-6 text-red-400">Subscription not found</div>

  const daysActive = Math.floor((Date.now() - new Date(sub.startDate).getTime()) / 86400000)

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-100 font-mono">{sub.subscriptionNumber}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[sub.status] ?? 'bg-zinc-700 text-zinc-400'}`}>{sub.status}</span>
          </div>
          <div className="text-zinc-400 mt-1">{sub.customerName} {sub.customerEmail && <span className="text-zinc-600 text-sm">· {sub.customerEmail}</span>}</div>
          <div className="text-sm text-zinc-500 mt-0.5">Plan: <span className="text-zinc-300">{sub.plan.name}</span> · ${sub.billingAmount.toFixed(2)}/{sub.plan.billingCycle}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Billed', value: `$${sub.totalBilled.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Billing Cycles', value: sub.billingCycles.length.toString(), icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Days Active', value: daysActive.toString(), icon: Clock, color: 'text-violet-400', bg: 'bg-violet-500/10' },
        ].map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${k.bg} flex items-center justify-center`}>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <div>
              <div className="text-xl font-bold text-zinc-100">{k.value}</div>
              <div className="text-xs text-zinc-500">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2"><Calendar className="w-4 h-4" />Billing History</h2>
          {sub.billingCycles.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-zinc-600 text-sm">No billing cycles yet</div>
          ) : (
            <div className="space-y-2">
              {[...sub.billingCycles].reverse().map(cycle => (
                <div key={cycle.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-xs font-bold text-zinc-400">#{cycle.cycleNumber}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-200 font-medium">${cycle.amount.toFixed(2)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${billingStatusBadge[cycle.status] ?? 'bg-zinc-700 text-zinc-400'}`}>{cycle.status}</span>
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {new Date(cycle.billingDate).toLocaleDateString()}
                      {cycle.paymentMethod && ` · ${cycle.paymentMethod}`}
                    </div>
                  </div>
                  {cycle.retryCount > 0 && <div className="text-xs text-orange-400">{cycle.retryCount} retries</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-300">Plan Info</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-zinc-500">Cycle</span><span className="text-zinc-300 capitalize">{sub.plan.billingCycle}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Unit Price</span><span className="text-zinc-300">${sub.unitPrice.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Quantity</span><span className="text-zinc-300">{sub.quantity}</span></div>
              {sub.nextBillingDate && <div className="flex justify-between"><span className="text-zinc-500">Next Billing</span><span className="text-zinc-300">{new Date(sub.nextBillingDate).toLocaleDateString()}</span></div>}
            </div>
          </div>

          <div className="bg-zinc-900 border border-red-900/40 rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-red-400">Manage Subscription</h2>

            {sub.status === 'active' && (
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Pause Until</label>
                  <input type="date" value={pausedUntil} onChange={e => setPausedUntil(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-yellow-500" />
                </div>
                <button onClick={() => doAction('pause', { pausedUntil })} disabled={working} className="w-full flex items-center justify-center gap-2 bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  <PauseCircle className="w-4 h-4" />Pause Subscription
                </button>
              </div>
            )}

            {sub.status === 'paused' && (
              <button onClick={() => doAction('resume')} disabled={working} className="w-full flex items-center justify-center gap-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                <CheckCircle className="w-4 h-4" />Resume Subscription
              </button>
            )}

            {(sub.status === 'active' || sub.status === 'trial' || sub.status === 'paused') && (
              <div className="space-y-2 pt-1 border-t border-zinc-800">
                {!showCancel ? (
                  <button onClick={() => setShowCancel(true)} className="w-full flex items-center justify-center gap-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                    <X className="w-4 h-4" />Cancel Subscription
                  </button>
                ) : (
                  <>
                    <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={2} placeholder="Reason for cancellation…" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-red-500 resize-none" />
                    <div className="flex gap-2">
                      <button onClick={() => { doAction('cancel', { reason: cancelReason }); setShowCancel(false) }} disabled={working} className="flex-1 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50">Confirm Cancel</button>
                      <button onClick={() => setShowCancel(false)} className="px-3 py-2 bg-zinc-800 text-zinc-400 rounded-lg text-sm">Back</button>
                    </div>
                  </>
                )}
              </div>
            )}

            {sub.status === 'cancelled' && (
              <div className="flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle className="w-3.5 h-3.5" />Cancelled {sub.cancelledAt ? new Date(sub.cancelledAt).toLocaleDateString() : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
