'use client'
import { useEffect, useState, useCallback } from 'react'
import { DollarSign } from 'lucide-react'

interface Commission {
  id: string
  affiliateId: string
  commissionType: string
  amount: number
  description: string | null
  status: string
  createdAt: string
  affiliate: { firstName: string; lastName: string; affiliateCode: string }
}

const TYPE_COLORS: Record<string, string> = {
  direct: 'bg-blue-500/15 text-blue-400',
  override: 'bg-violet-500/15 text-violet-400',
  bonus: 'bg-amber-500/15 text-amber-400',
  'tier-bonus': 'bg-rose-500/15 text-rose-400',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400',
  approved: 'bg-emerald-500/15 text-emerald-400',
  paid: 'bg-violet-500/15 text-violet-400',
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (typeFilter) params.set('type', typeFilter)
    const res = await fetch(`/api/affiliate/commissions?${params}`)
    setCommissions(await res.json())
    setLoading(false)
  }, [statusFilter, typeFilter])

  useEffect(() => { load() }, [load])

  async function approve(id: string) {
    await fetch(`/api/affiliate/commissions/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    })
    load()
  }

  async function markPaid(id: string) {
    await fetch(`/api/affiliate/commissions/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid' }),
    })
    load()
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  const pendingTotal = commissions.filter(c => c.status === 'pending').reduce((s, c) => s + c.amount, 0)
  const approvedTotal = commissions.filter(c => c.status === 'approved').reduce((s, c) => s + c.amount, 0)
  const paidThisMonth = commissions
    .filter(c => {
      if (c.status !== 'paid') return false
      const d = new Date(c.createdAt); const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((s, c) => s + c.amount, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <DollarSign className="w-6 h-6 text-amber-400" />
        <h1 className="text-xl font-bold text-zinc-100">Commission Dashboard</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Pending Approval</div>
          <div className="text-2xl font-bold text-amber-400">{fmt(pendingTotal)}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Approved (Not Paid)</div>
          <div className="text-2xl font-bold text-blue-400">{fmt(approvedTotal)}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Paid This Month</div>
          <div className="text-2xl font-bold text-violet-400">{fmt(paidThisMonth)}</div>
        </div>
      </div>

      <div className="flex gap-3">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="paid">Paid</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
          <option value="">All Types</option>
          <option value="direct">Direct</option>
          <option value="override">Override</option>
          <option value="bonus">Bonus</option>
          <option value="tier-bonus">Tier Bonus</option>
        </select>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-sm">Loading...</div>
        ) : commissions.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">No commissions found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-zinc-500 uppercase border-b border-zinc-800">
                  <th className="px-5 py-3 text-left">Affiliate</th>
                  <th className="px-5 py-3 text-left">Type</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-left">Description</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {commissions.map(c => (
                  <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="text-zinc-100 font-medium">{c.affiliate.firstName} {c.affiliate.lastName}</div>
                      <div className="font-mono text-xs text-zinc-500">{c.affiliate.affiliateCode}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[c.commissionType] ?? 'bg-zinc-700 text-zinc-400'}`}>
                        {c.commissionType}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-amber-400 font-bold">{fmt(c.amount)}</td>
                    <td className="px-5 py-3 text-zinc-400 text-xs max-w-xs truncate">{c.description ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[c.status] ?? ''}`}>{c.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        {c.status === 'pending' && <button onClick={() => approve(c.id)} className="text-xs text-blue-400 hover:underline">Approve</button>}
                        {c.status === 'approved' && <button onClick={() => markPaid(c.id)} className="text-xs text-violet-400 hover:underline">Mark Paid</button>}
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
