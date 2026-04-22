export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Star, TrendingUp, Gift, Plus } from 'lucide-react'

export default async function LoyaltyDashboardPage() {
  const [members, tiers, rewards] = await Promise.all([
    prisma.loyaltyMember.findMany({
      orderBy: { pointsLifetime: 'desc' },
      include: { tier: true },
      take: 50,
    }),
    prisma.loyaltyTier.findMany({ orderBy: { sortOrder: 'asc' }, include: { _count: { select: { members: true } } } }),
    prisma.loyaltyReward.count({ where: { isActive: true } }),
  ])

  const totalMembers = members.length
  const totalPoints = members.reduce((s, m) => s + m.pointsBalance, 0)
  const totalRedeemed = members.reduce((s, m) => s + m.pointsRedeemed, 0)
  const activeThisMonth = members.filter(m => {
    if (!m.lastActivityAt) return false
    const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - 1)
    return new Date(m.lastActivityAt) > cutoff
  }).length

  const maxMembers = Math.max(...tiers.map(t => t._count.members), 1)

  return (
    <>
      <TopBar title="Loyalty 2.0" />
      <main className="flex-1 p-6 overflow-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Loyalty Program</h2>
            <p className="text-sm text-zinc-500">{totalMembers} enrolled members</p>
          </div>
          <div className="flex gap-2">
            <Link href="/loyalty/tiers"><Button variant="outline" size="sm">Manage Tiers</Button></Link>
            <Link href="/loyalty/rewards"><Button variant="outline" size="sm">Rewards</Button></Link>
            <Link href="/loyalty/members/new"><Button size="sm"><Plus className="w-4 h-4 mr-1" />Enroll</Button></Link>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-blue-400" /><p className="text-xs text-zinc-500 uppercase tracking-wide">Total Members</p></div>
              <p className="text-2xl font-bold text-blue-400">{totalMembers.toLocaleString()}</p>
              <p className="text-xs text-zinc-600 mt-1">{activeThisMonth} active this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2"><Star className="w-4 h-4 text-amber-400" /><p className="text-xs text-zinc-500 uppercase tracking-wide">Points Outstanding</p></div>
              <p className="text-2xl font-bold text-amber-400">{totalPoints.toLocaleString()}</p>
              <p className="text-xs text-zinc-600 mt-1">across all members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-emerald-400" /><p className="text-xs text-zinc-500 uppercase tracking-wide">Points Redeemed</p></div>
              <p className="text-2xl font-bold text-emerald-400">{totalRedeemed.toLocaleString()}</p>
              <p className="text-xs text-zinc-600 mt-1">lifetime total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2"><Gift className="w-4 h-4 text-purple-400" /><p className="text-xs text-zinc-500 uppercase tracking-wide">Active Rewards</p></div>
              <p className="text-2xl font-bold text-purple-400">{rewards}</p>
              <p className="text-xs text-zinc-600 mt-1">in catalog</p>
            </CardContent>
          </Card>
        </div>

        {tiers.length > 0 && (
          <Card>
            <CardContent className="pt-5 pb-5">
              <h3 className="text-sm font-medium text-zinc-300 mb-4">Tier Distribution</h3>
              <div className="space-y-3">
                {tiers.map(t => (
                  <div key={t.id} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.colorHex || '#6366f1' }} />
                    <span className="text-sm text-zinc-300 w-24 truncate">{t.name}</span>
                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(t._count.members / maxMembers) * 100}%`, backgroundColor: t.colorHex || '#6366f1' }} />
                    </div>
                    <span className="text-xs text-zinc-500 w-16 text-right">{t._count.members} members</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-400">Top Earners</h3>
            <Link href="/loyalty/members" className="text-xs text-blue-400 hover:text-blue-300">View all</Link>
          </div>
          {members.length === 0 ? (
            <p className="text-sm text-zinc-600">No members yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Member</th>
                    <th className="text-left pb-3 font-medium">Tier</th>
                    <th className="text-right pb-3 font-medium">Balance</th>
                    <th className="text-right pb-3 font-medium">Lifetime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {members.slice(0, 10).map(m => (
                    <tr key={m.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4">
                        <Link href={`/loyalty/members/${m.id}`} className="text-zinc-100 hover:text-blue-400">{m.customerName || 'Unnamed'}</Link>
                        {m.customerEmail && <p className="text-xs text-zinc-600">{m.customerEmail}</p>}
                      </td>
                      <td className="py-3 pr-4">
                        {m.tier ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.tier.colorHex || '#6366f1' }} />
                            <span className="text-xs text-zinc-300">{m.tier.name}</span>
                          </div>
                        ) : <span className="text-zinc-600 text-xs">—</span>}
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-emerald-400 tabular-nums">{m.pointsBalance.toLocaleString()}</td>
                      <td className="py-3 text-right text-zinc-400 text-xs tabular-nums">{m.pointsLifetime.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
