'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, DollarSign, TrendingUp, Network, Target, Link as LinkIcon, CreditCard, Award } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  code: string
  tier: string
  sales: number
  commission: number
  teamSize: number
}

interface KPIs {
  activeAffiliates: number
  pendingReferrals: number
  unpaidCommission: number
  monthlyRevenue: number
  topEarner: { name: string; amount: number } | null
}

const RANK_MEDALS = ['🥇', '🥈', '🥉']

export default function AffiliateHubPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [kpis, setKpis] = useState<KPIs>({
    activeAffiliates: 0,
    pendingReferrals: 0,
    unpaidCommission: 0,
    monthlyRevenue: 0,
    topEarner: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [lbRes, affiliatesRes, commissionsRes] = await Promise.all([
        fetch('/api/affiliate/leaderboard'),
        fetch('/api/affiliate/affiliates?status=active'),
        fetch('/api/affiliate/commissions?status=pending'),
      ])
      const lb: LeaderboardEntry[] = await lbRes.json()
      const affiliates = await affiliatesRes.json()
      const commissions = await commissionsRes.json()

      const unpaid = commissions.reduce((s: number, c: { amount: number }) => s + c.amount, 0)
      const topEarner = lb[0] ? { name: lb[0].name, amount: lb[0].commission } : null

      setLeaderboard(lb)
      setKpis({
        activeAffiliates: Array.isArray(affiliates) ? affiliates.length : 0,
        pendingReferrals: 0,
        unpaidCommission: unpaid,
        monthlyRevenue: lb.reduce((s, a) => s + a.sales, 0),
        topEarner,
      })
      setLoading(false)
    }
    load()
  }, [])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  const QUICK_LINKS = [
    { label: 'Programs', href: '/affiliate/programs', icon: Target, color: 'text-blue-400' },
    { label: 'Affiliates', href: '/affiliate/affiliates', icon: Users, color: 'text-emerald-400' },
    { label: 'Referrals', href: '/affiliate/referrals', icon: LinkIcon, color: 'text-violet-400' },
    { label: 'Commissions', href: '/affiliate/commissions', icon: DollarSign, color: 'text-amber-400' },
    { label: 'Payouts', href: '/affiliate/payouts', icon: CreditCard, color: 'text-rose-400' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Network className="w-7 h-7 text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Affiliate &amp; MLM Hub</h1>
          <p className="text-sm text-zinc-500">Partner network overview</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Active Affiliates</span>
          </div>
          <div className="text-2xl font-bold text-zinc-100">{loading ? '—' : kpis.activeAffiliates}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Pending Referrals</span>
          </div>
          <div className="text-2xl font-bold text-zinc-100">{loading ? '—' : kpis.pendingReferrals}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Unpaid Commission</span>
          </div>
          <div className="text-2xl font-bold text-zinc-100">{loading ? '—' : fmt(kpis.unpaidCommission)}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Affiliate Revenue</span>
          </div>
          <div className="text-2xl font-bold text-zinc-100">{loading ? '—' : fmt(kpis.monthlyRevenue)}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Top Earner</span>
          </div>
          {loading ? (
            <div className="text-2xl font-bold text-zinc-100">—</div>
          ) : kpis.topEarner ? (
            <>
              <div className="text-sm font-semibold text-zinc-100 truncate">{kpis.topEarner.name}</div>
              <div className="text-xs text-emerald-400">{fmt(kpis.topEarner.amount)}</div>
            </>
          ) : (
            <div className="text-sm text-zinc-500">No data</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {QUICK_LINKS.map(({ label, href, icon: Icon, color }) => (
          <Link key={href} href={href}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors group">
            <Icon className={`w-6 h-6 ${color} group-hover:scale-110 transition-transform`} />
            <span className="text-xs text-zinc-400 group-hover:text-zinc-100">{label}</span>
          </Link>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Top Affiliates Leaderboard</h2>
          <Link href="/affiliate/affiliates" className="text-xs text-blue-400 hover:underline">View All</Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-sm">Loading...</div>
        ) : leaderboard.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">No affiliates yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-zinc-500 uppercase border-b border-zinc-800">
                  <th className="px-5 py-3 text-left">Rank</th>
                  <th className="px-5 py-3 text-left">Affiliate</th>
                  <th className="px-5 py-3 text-left">Code</th>
                  <th className="px-5 py-3 text-left">Tier</th>
                  <th className="px-5 py-3 text-right">Total Sales</th>
                  <th className="px-5 py-3 text-right">Commission</th>
                  <th className="px-5 py-3 text-right">Team</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map(entry => (
                  <tr key={entry.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors">
                    <td className="px-5 py-3 text-zinc-300 font-medium">
                      {entry.rank <= 3 ? RANK_MEDALS[entry.rank - 1] : `#${entry.rank}`}
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/affiliate/affiliates/${entry.id}`} className="text-zinc-100 hover:text-blue-400 font-medium">
                        {entry.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-mono text-zinc-400 text-xs">{entry.code}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-xs">{entry.tier}</span>
                    </td>
                    <td className="px-5 py-3 text-right text-emerald-400 font-medium">{fmt(entry.sales)}</td>
                    <td className="px-5 py-3 text-right text-amber-400">{fmt(entry.commission)}</td>
                    <td className="px-5 py-3 text-right text-zinc-400">{entry.teamSize}</td>
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
