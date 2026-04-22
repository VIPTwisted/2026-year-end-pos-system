'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

type Card = {
  id: string
  cardNumber: string
  availablePoints: number
  lifetimePoints: number
  status: string
  enrolledAt: Date
  customer: { id: string; firstName: string; lastName: string; email: string | null }
  tier: { id: string; name: string; color: string | null } | null
  program: { id: string; name: string }
}

type Tier = {
  id: string
  name: string
  color: string | null
}

interface Props {
  cards: Card[]
  tiers: Tier[]
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    blocked: 'bg-red-500/15 text-red-400 border-red-500/30',
    expired: 'bg-zinc-700/50 text-zinc-500 border-zinc-700',
  }
  return map[status] ?? map.active
}

export function LoyaltyCardsClient({ cards, tiers }: Props) {
  const [search, setSearch] = useState('')
  const [filterTier, setFilterTier] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return cards.filter(c => {
      const matchSearch = !q || c.cardNumber.toLowerCase().includes(q)
        || `${c.customer.firstName} ${c.customer.lastName}`.toLowerCase().includes(q)
        || (c.customer.email ?? '').toLowerCase().includes(q)
      const matchTier = !filterTier || c.tier?.id === filterTier
      const matchStatus = !filterStatus || c.status === filterStatus
      return matchSearch && matchTier && matchStatus
    })
  }, [cards, search, filterTier, filterStatus])

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customer or card #..."
            className="w-full pl-8 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <select
          value={filterTier}
          onChange={e => setFilterTier(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-[13px] text-zinc-300 focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="">All Tiers</option>
          {tiers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-[13px] text-zinc-300 focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
          <option value="expired">Expired</option>
        </select>
        {(search || filterTier || filterStatus) && (
          <button
            onClick={() => { setSearch(''); setFilterTier(''); setFilterStatus('') }}
            className="text-[12px] text-zinc-500 hover:text-zinc-300 px-2.5 py-2 bg-zinc-900 border border-zinc-800 rounded transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      {(search || filterTier || filterStatus) && (
        <p className="text-[12px] text-zinc-500 mb-3">{filtered.length} of {cards.length} cards</p>
      )}

      {filtered.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col items-center justify-center py-16 text-zinc-500">
          <p className="text-[13px]">No cards match your filters</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-[11px] uppercase tracking-wide">
                  <th className="text-left px-4 py-2.5 font-medium">Card #</th>
                  <th className="text-left py-2.5 font-medium">Customer</th>
                  <th className="text-left py-2.5 font-medium">Tier</th>
                  <th className="text-right py-2.5 font-medium">Available Pts</th>
                  <th className="text-right py-2.5 font-medium">Lifetime Pts</th>
                  <th className="text-left py-2.5 font-medium">Status</th>
                  <th className="text-left py-2.5 font-medium">Enrolled</th>
                  <th className="text-right px-4 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((card, idx) => (
                  <tr
                    key={card.id}
                    className={`hover:bg-zinc-800/30 transition-colors ${idx !== filtered.length - 1 ? 'border-b border-zinc-800/50' : ''}`}
                  >
                    <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-400">{card.cardNumber}</td>
                    <td className="py-2.5 pr-4">
                      <div className="font-medium text-zinc-100">{card.customer.firstName} {card.customer.lastName}</div>
                      {card.customer.email && <div className="text-[11px] text-zinc-500">{card.customer.email}</div>}
                    </td>
                    <td className="py-2.5 pr-4">
                      {card.tier ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: card.tier.color ?? '#71717a' }} />
                          <span className="text-zinc-300">{card.tier.name}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono font-semibold text-amber-400 tabular-nums">
                      {card.availablePoints.toLocaleString()}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono text-zinc-400 tabular-nums">
                      {card.lifetimePoints.toLocaleString()}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${statusBadge(card.status)}`}>
                        {card.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-[11px] text-zinc-500 whitespace-nowrap">
                      {new Date(card.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <Link href={`/loyalty/cards/${card.id}`} className="text-blue-400 hover:text-blue-300 text-[12px] transition-colors">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
