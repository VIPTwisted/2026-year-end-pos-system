'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { LinkIcon, CheckSquare } from 'lucide-react'

interface Referral {
  id: string
  affiliateId: string
  orderId: string | null
  customerName: string | null
  saleAmount: number
  commissionAmount: number
  status: string
  createdAt: string
  affiliate: { firstName: string; lastName: string; affiliateCode: string }
}

const TABS = ['All', 'Pending', 'Confirmed', 'Paid', 'Cancelled'] as const
type FilterTab = typeof TABS[number]

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400',
  confirmed: 'bg-blue-500/15 text-blue-400',
  paid: 'bg-violet-500/15 text-violet-400',
  cancelled: 'bg-rose-500/15 text-rose-400',
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('All')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirming, setConfirming] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/affiliate/affiliates')
    const affiliates: { id: string; firstName: string; lastName: string; affiliateCode: string }[] = await res.json()

    const all: Referral[] = []
    await Promise.all(
      affiliates.slice(0, 50).map(async (a) => {
        const r = await fetch(`/api/affiliate/affiliates/${a.id}/referrals`)
        const refs = await r.json()
        refs.forEach((ref: Omit<Referral, 'affiliate'>) => {
          all.push({ ...ref, affiliate: { firstName: a.firstName, lastName: a.lastName, affiliateCode: a.affiliateCode } })
        })
      })
    )
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setReferrals(all)
    setSelected(new Set())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = referrals.filter(r => activeTab === 'All' || r.status === activeTab.toLowerCase())

  function toggleSelect(id: string) {
    setSelected(s => { const next = new Set(s); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  function toggleAll() {
    const pending = filtered.filter(r => r.status === 'pending')
    setSelected(selected.size === pending.length ? new Set() : new Set(pending.map(r => r.id)))
  }

  async function confirmReferral(affiliateId: string, rid: string) {
    await fetch(`/api/affiliate/affiliates/${affiliateId}/referrals/${rid}/confirm`, { method: 'POST' })
    load()
  }

  async function batchConfirm() {
    setConfirming(true)
    const toConfirm = filtered.filter(r => selected.has(r.id) && r.status === 'pending')
    await Promise.all(toConfirm.map(r => confirmReferral(r.affiliateId, r.id)))
    setConfirming(false)
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  const pendingSelected = [...selected].filter(id => referrals.find(r => r.id === id)?.status === 'pending')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LinkIcon className="w-6 h-6 text-violet-400" />
          <h1 className="text-xl font-bold text-zinc-100">All Referrals</h1>
        </div>
        {pendingSelected.length > 0 && (
          <button onClick={batchConfirm} disabled={confirming}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
            <CheckSquare className="w-4 h-4" /> Confirm Selected ({pendingSelected.length})
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === t ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-100'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">No referrals found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-zinc-500 uppercase border-b border-zinc-800">
                  <th className="px-4 py-3">
                    <input type="checkbox" className="rounded border-zinc-600" onChange={toggleAll}
                      checked={selected.size > 0 && selected.size === filtered.filter(r => r.status === 'pending').length} />
                  </th>
                  <th className="px-4 py-3 text-left">Affiliate</th>
                  <th className="px-4 py-3 text-left">Order#</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-right">Sale Amount</th>
                  <th className="px-4 py-3 text-right">Commission</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3">
                      {r.status === 'pending' && (
                        <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} className="rounded border-zinc-600" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/affiliate/affiliates/${r.affiliateId}`} className="text-zinc-100 hover:text-blue-400 font-medium">
                        {r.affiliate.firstName} {r.affiliate.lastName}
                      </Link>
                      <div className="font-mono text-xs text-zinc-500">{r.affiliate.affiliateCode}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{r.orderId ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-300">{r.customerName ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-medium">{fmt(r.saleAmount)}</td>
                    <td className="px-4 py-3 text-right text-amber-400">{fmt(r.commissionAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[r.status] ?? ''}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {r.status === 'pending' && (
                        <button onClick={() => confirmReferral(r.affiliateId, r.id)} className="text-xs text-blue-400 hover:underline">Confirm</button>
                      )}
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
