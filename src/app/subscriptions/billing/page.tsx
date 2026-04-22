'use client'
import { useEffect, useState } from 'react'
import { CreditCard, Play, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'

interface BillingRecord {
  id: string
  cycleNumber: number
  billingDate: string
  amount: number
  status: string
  paymentMethod?: string
  failureReason?: string
  retryCount: number
  subscriptionId: string
  subscription?: { subscriptionNumber: string; customerName: string }
}

const statusBadge: Record<string, string> = {
  paid: 'bg-emerald-500/20 text-emerald-400',
  failed: 'bg-red-500/20 text-red-400',
  refunded: 'bg-yellow-500/20 text-yellow-400',
  upcoming: 'bg-blue-500/20 text-blue-400',
}

export default function BillingPage() {
  const [records, setRecords] = useState<BillingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [runResult, setRunResult] = useState<{ processed: number; total: number } | null>(null)
  const [running, setRunning] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const load = async () => {
    setLoading(true)
    const subs = await fetch('/api/subscriptions').then(r => r.json())
    const allBilling: BillingRecord[] = []
    await Promise.all(
      subs.map(async (sub: { id: string; subscriptionNumber: string; customerName: string }) => {
        const cycles = await fetch(`/api/subscriptions/${sub.id}/billing`).then(r => r.json())
        cycles.forEach((c: BillingRecord) => {
          allBilling.push({ ...c, subscription: { subscriptionNumber: sub.subscriptionNumber, customerName: sub.customerName } })
        })
      })
    )
    allBilling.sort((a, b) => new Date(b.billingDate).getTime() - new Date(a.billingDate).getTime())
    setRecords(allBilling)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const runBilling = async () => {
    setRunning(true)
    const res = await fetch('/api/subscriptions/run-billing', { method: 'POST' })
    const data = await res.json()
    setRunResult(data)
    setShowModal(true)
    setRunning(false)
    load()
  }

  const now = new Date()
  const thisMonth = records.filter(r => {
    const d = new Date(r.billingDate)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const billedThisMonth = thisMonth.filter(r => r.status === 'paid').reduce((s, r) => s + r.amount, 0)
  const failed = records.filter(r => r.status === 'failed')
  const retryQueue = failed.filter(r => r.retryCount < 3)
  const successRate = records.length > 0 ? Math.round((records.filter(r => r.status === 'paid').length / records.length) * 100) : 100
  const paid = records.filter(r => r.status === 'paid')

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2"><CreditCard className="w-6 h-6 text-blue-400" />Billing Management</h1>
          <p className="text-zinc-500 text-sm mt-1">{records.length} billing records</p>
        </div>
        <button onClick={runBilling} disabled={running} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
          <Play className="w-4 h-4" />{running ? 'Running…' : 'Run Billing Now'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Billed This Month', value: `$${billedThisMonth.toFixed(2)}`, icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Failed Payments', value: failed.length.toString(), icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Retry Queue', value: retryQueue.length.toString(), icon: RefreshCw, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Success Rate', value: `${successRate}%`, icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-500/10' },
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

      {showModal && runResult && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <div>
                <h3 className="text-base font-semibold text-zinc-100">Billing Complete</h3>
                <p className="text-sm text-zinc-400">Processed {runResult.processed} of {runResult.total} due subscriptions</p>
              </div>
            </div>
            <button onClick={() => setShowModal(false)} className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Close</button>
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-500" />
          <span className="text-sm font-semibold text-zinc-300">Billing History</span>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-950">
            <tr>
              {['Subscription #', 'Customer', 'Cycle', 'Amount', 'Status', 'Method', 'Date'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-600">Loading…</td></tr>
            ) : paid.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-600">No billing records yet</td></tr>
            ) : paid.slice(0, 100).map(r => (
              <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 text-zinc-300 font-mono text-xs">{r.subscription?.subscriptionNumber ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{r.subscription?.customerName ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-500">#{r.cycleNumber}</td>
                <td className="px-4 py-3 text-zinc-200 font-medium">${r.amount.toFixed(2)}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[r.status] ?? 'bg-zinc-700 text-zinc-400'}`}>{r.status}</span></td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{r.paymentMethod ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(r.billingDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
