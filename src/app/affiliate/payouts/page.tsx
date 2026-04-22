'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { CreditCard } from 'lucide-react'

interface Payout {
  id: string
  affiliateId: string
  period: string
  directCommission: number
  overrideCommission: number
  bonuses: number
  totalEarned: number
  netPayout: number
  status: string
  paidAt: string | null
  affiliate: { firstName: string; lastName: string; affiliateCode: string }
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400',
  approved: 'bg-blue-500/15 text-blue-400',
  paid: 'bg-violet-500/15 text-violet-400',
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [periodFilter, setPeriodFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (periodFilter) params.set('period', periodFilter)
    const res = await fetch(`/api/affiliate/payouts?${params}`)
    setPayouts(await res.json())
    setLoading(false)
  }, [statusFilter, periodFilter])

  useEffect(() => { load() }, [load])

  const allPeriods = [...new Set(payouts.map(p => p.period))].sort().reverse()

  async function updatePayout(affiliateId: string, pid: string, status: string) {
    await fetch(`/api/affiliate/affiliates/${affiliateId}/payouts/${pid}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  const filtered = payouts.filter(p => {
    if (statusFilter && p.status !== statusFilter) return false
    if (periodFilter && p.period !== periodFilter) return false
    return true
  })

  const totalPending = filtered.filter(p => p.status === 'pending').reduce((s, p) => s + p.netPayout, 0)
  const totalApproved = filtered.filter(p => p.status === 'approved').reduce((s, p) => s + p.netPayout, 0)
  const totalPaid = filtered.filter(p => p.status === 'paid').reduce((s, p) => s + p.netPayout, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="w-6 h-6 text-rose-400" />
        <h1 className="text-xl font-bold text-zinc-100">Payouts</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Total Pending</div>
          <div className="text-2xl font-bold text-amber-400">{fmt(totalPending)}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Total Approved</div>
          <div className="text-2xl font-bold text-blue-400">{fmt(totalApproved)}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Total Paid</div>
          <div className="text-2xl font-bold text-violet-400">{fmt(totalPaid)}</div>
        </div>
      </div>

      <div className="flex gap-3">
        <select value={periodFilter} onChange={e => setPeriodFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
          <option value="">All Periods</option>
          {allPeriods.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">No payouts found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-zinc-500 uppercase border-b border-zinc-800">
                  <th className="px-5 py-3 text-left">Affiliate</th>
                  <th className="px-5 py-3 text-left">Period</th>
                  <th className="px-5 py-3 text-right">Direct</th>
                  <th className="px-5 py-3 text-right">Override</th>
                  <th className="px-5 py-3 text-right">Bonuses</th>
                  <th className="px-5 py-3 text-right">Net Payout</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/affiliate/affiliates/${p.affiliateId}`} className="text-zinc-100 hover:text-blue-400 font-medium">
                        {p.affiliate.firstName} {p.affiliate.lastName}
                      </Link>
                      <div className="font-mono text-xs text-zinc-500">{p.affiliate.affiliateCode}</div>
                    </td>
                    <td className="px-5 py-3 font-mono text-zinc-300">{p.period}</td>
                    <td className="px-5 py-3 text-right text-zinc-400">{fmt(p.directCommission)}</td>
                    <td className="px-5 py-3 text-right text-zinc-400">{fmt(p.overrideCommission)}</td>
                    <td className="px-5 py-3 text-right text-zinc-400">{fmt(p.bonuses)}</td>
                    <td className="px-5 py-3 text-right text-emerald-400 font-bold">{fmt(p.netPayout)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[p.status] ?? ''}`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        {p.status === 'pending' && (
                          <button onClick={() => updatePayout(p.affiliateId, p.id, 'approved')} className="text-xs text-blue-400 hover:underline">Approve</button>
                        )}
                        {p.status === 'approved' && (
                          <button onClick={() => updatePayout(p.affiliateId, p.id, 'paid')} className="text-xs text-emerald-400 hover:underline">Mark Paid</button>
                        )}
                        {p.paidAt && <span className="text-xs text-zinc-600">{new Date(p.paidAt).toLocaleDateString()}</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
