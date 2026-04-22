'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Transaction = {
  id: string
  type: string
  points: number
  description: string | null
  orderId: string | null
  createdAt: Date
}

type Tier = {
  id: string
  name: string
  minimumPoints: number
  earningRate: number
  rewardRate: number
  color: string | null
}

type Card = {
  id: string
  cardNumber: string
  totalPoints: number
  availablePoints: number
  lifetimePoints: number
  status: string
  enrolledAt: Date
  lastActivity: Date | null
  customer: { id: string; firstName: string; lastName: string; email: string | null; phone: string | null }
  tier: Tier | null
  program: { id: string; name: string; tiers: Tier[] }
  transactions: Transaction[]
}

interface Props {
  card: Card
}

function typeBadge(type: string): string {
  const map: Record<string, string> = {
    earn:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    redeem: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    adjust: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    expire: 'bg-red-500/15 text-red-400 border-red-500/30',
    enroll: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  }
  return map[type.toLowerCase()] ?? map.adjust
}

export function LoyaltyCardClient({ card: initialCard }: Props) {
  const router = useRouter()
  const [card, setCard] = useState(initialCard)
  const [adjusting, setAdjusting] = useState(false)
  const [adjustPoints, setAdjustPoints] = useState('')
  const [adjustDesc, setAdjustDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [changingTier, setChangingTier] = useState(false)
  const [selectedTierId, setSelectedTierId] = useState(card.tier?.id ?? '')

  async function doAdjust() {
    const delta = parseInt(adjustPoints)
    if (isNaN(delta) || delta === 0) { setError('Enter a non-zero points value'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/loyalty/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustPoints: delta, description: adjustDesc || undefined }),
      })
      if (!res.ok) throw new Error(await res.text())
      router.refresh()
      setAdjusting(false)
      setAdjustPoints('')
      setAdjustDesc('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to adjust points')
    } finally {
      setSaving(false)
    }
  }

  async function setStatus(status: string) {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/loyalty/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error(await res.text())
      setCard(c => ({ ...c, status }))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update card')
    } finally {
      setSaving(false)
    }
  }

  async function saveTier() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/loyalty/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId: selectedTierId || null }),
      })
      if (!res.ok) throw new Error(await res.text())
      const newTier = card.program.tiers.find(t => t.id === selectedTierId) ?? null
      setCard(c => ({ ...c, tier: newTier }))
      setChangingTier(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change tier')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded text-[13px] text-red-400">{error}</div>
      )}

      {/* Card Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              {card.tier && (
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: card.tier.color ?? '#71717a' }} />
              )}
              <h2 className="text-base font-semibold text-zinc-100">{card.customer.firstName} {card.customer.lastName}</h2>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                card.status === 'active' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : card.status === 'blocked' ? 'bg-red-500/15 text-red-400 border-red-500/30'
                : 'bg-zinc-700/50 text-zinc-500 border-zinc-700'
              }`}>{card.status}</span>
            </div>
            <p className="text-[12px] font-mono text-zinc-500">{card.cardNumber}</p>
          </div>
          <div className="flex gap-2">
            {card.status === 'active' && (
              <button
                onClick={() => setStatus('blocked')}
                disabled={saving}
                className="text-[12px] px-2.5 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded transition-colors disabled:opacity-50"
              >
                Block Card
              </button>
            )}
            {card.status === 'blocked' && (
              <button
                onClick={() => setStatus('active')}
                disabled={saving}
                className="text-[12px] px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded transition-colors disabled:opacity-50"
              >
                Unblock
              </button>
            )}
          </div>
        </div>

        {/* Points Summary */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: 'Available Points', value: card.availablePoints.toLocaleString(), color: 'text-amber-400' },
            { label: 'Total Points', value: card.totalPoints.toLocaleString(), color: 'text-zinc-300' },
            { label: 'Lifetime Points', value: card.lifetimePoints.toLocaleString(), color: 'text-violet-400' },
          ].map(s => (
            <div key={s.label} className="bg-zinc-800/60 rounded-lg px-4 py-3">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px] mb-5">
          <div className="flex justify-between">
            <span className="text-zinc-500">Program</span>
            <Link href={`/loyalty/programs/${card.program.id}`} className="text-blue-400 hover:text-blue-300 transition-colors">{card.program.name}</Link>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Customer</span>
            <Link href={`/customers/${card.customer.id}`} className="text-blue-400 hover:text-blue-300 transition-colors">{card.customer.email ?? '—'}</Link>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Enrolled</span>
            <span className="text-zinc-300">{new Date(card.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Last Activity</span>
            <span className="text-zinc-300">{card.lastActivity ? new Date(card.lastActivity).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}</span>
          </div>
        </div>

        {/* Tier + Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-800">
          {/* Tier Change */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-zinc-500">Tier:</span>
            {changingTier ? (
              <>
                <select value={selectedTierId} onChange={e => setSelectedTierId(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[12px] text-zinc-100 focus:outline-none focus:border-blue-500">
                  <option value="">No Tier</option>
                  {card.program.tiers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <button onClick={saveTier} disabled={saving} className="text-[12px] px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 transition-colors">
                  {saving ? '...' : 'Save'}
                </button>
                <button onClick={() => setChangingTier(false)} className="text-[12px] px-2 py-1 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700 transition-colors">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="text-[13px] text-zinc-200 font-medium flex items-center gap-1.5">
                  {card.tier && <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: card.tier.color ?? '#71717a' }} />}
                  {card.tier?.name ?? 'No Tier'}
                </span>
                <button onClick={() => setChangingTier(true)}
                  className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">Change</button>
              </>
            )}
          </div>

          {/* Adjust Points */}
          {adjusting ? (
            <div className="flex items-center gap-2 ml-auto">
              <input
                type="number"
                value={adjustPoints}
                onChange={e => setAdjustPoints(e.target.value)}
                placeholder="+/- points"
                className="w-28 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[12px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <input
                value={adjustDesc}
                onChange={e => setAdjustDesc(e.target.value)}
                placeholder="Reason (optional)"
                className="w-36 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[12px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button onClick={doAdjust} disabled={saving}
                className="text-[12px] px-2.5 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 transition-colors">
                {saving ? '...' : 'Apply'}
              </button>
              <button onClick={() => { setAdjusting(false); setAdjustPoints(''); setError('') }}
                className="text-[12px] px-2 py-1 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700 transition-colors">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setAdjusting(true)}
              className="ml-auto text-[12px] px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 rounded transition-colors">
              Adjust Points
            </button>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-zinc-100">Transaction History</h3>
          <span className="text-[11px] text-zinc-500">{card.transactions.length} transactions</span>
        </div>

        {card.transactions.length === 0 ? (
          <div className="px-5 py-10 text-center text-zinc-600 text-[13px]">No transactions yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/60 text-zinc-500 text-[11px] uppercase tracking-wide">
                  <th className="text-left px-4 py-2.5 font-medium">Date</th>
                  <th className="text-left py-2.5 font-medium">Type</th>
                  <th className="text-right py-2.5 font-medium">Points</th>
                  <th className="text-left py-2.5 font-medium">Description</th>
                  <th className="text-left px-4 py-2.5 font-medium">Order</th>
                </tr>
              </thead>
              <tbody>
                {card.transactions.map((tx, idx) => (
                  <tr key={tx.id} className={`hover:bg-zinc-800/30 transition-colors ${idx !== card.transactions.length - 1 ? 'border-b border-zinc-800/40' : ''}`}>
                    <td className="px-4 py-2.5 text-zinc-400 text-[11px] whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${typeBadge(tx.type)}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`py-2.5 pr-4 text-right font-mono font-semibold tabular-nums ${tx.points >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.points >= 0 ? '+' : ''}{tx.points.toLocaleString()}
                    </td>
                    <td className="py-2.5 pr-4 text-zinc-400 text-[12px]">{tx.description ?? '—'}</td>
                    <td className="px-4 py-2.5 text-[12px]">
                      {tx.orderId ? (
                        <Link href={`/orders/${tx.orderId}`} className="text-blue-400 hover:text-blue-300 font-mono text-[11px] transition-colors">
                          {tx.orderId.slice(0, 8)}…
                        </Link>
                      ) : (
                        <span className="text-zinc-600">—</span>
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
