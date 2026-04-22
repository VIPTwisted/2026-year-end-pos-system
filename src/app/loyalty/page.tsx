export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Star, Gift, TrendingUp, Plus } from 'lucide-react'

export default async function LoyaltyPage() {
  const [members, tiers, rewards] = await Promise.all([
    prisma.loyaltyMember.findMany({
      orderBy: { lifetimePts: 'desc' },
      include: { tier: { select: { name: true, color: true } } },
    }),
    prisma.loyaltyTier.findMany({
      orderBy: { minPts: 'asc' },
      include: { _count: { select: { members: true } } },
    }),
    prisma.loyaltyReward.findMany({ where: { active: true } }),
  ])

  const totalMembers        = members.length
  const totalPtsOutstanding = members.reduce((s, m) => s + m.points, 0)
  const totalLifetime       = members.reduce((s, m) => s + m.lifetimePts, 0)
  const topEarners          = members.slice(0, 10)
  const maxCount            = tiers.reduce((m, t) => Math.max(m, t._count.members), 1)

  return (
    <>
      <TopBar title="Loyalty Program" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Loyalty Program</h2>
            <p className="text-sm text-zinc-500">{totalMembers} members · {tiers.length} tiers · {rewards.length} active rewards</p>
          </div>
          <div className="flex gap-2">
            <Link href="/loyalty/tiers"><Button variant="outline" size="sm">Tiers</Button></Link>
            <Link href="/loyalty/rewards"><Button variant="outline" size="sm">Rewards</Button></Link>
            <Link href="/loyalty/members/new"><Button><Plus className="w-4 h-4 mr-1" />Enroll Member</Button></Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: Users, color: 'text-blue-400', label: 'Total Members', value: totalMembers, sub: `${tiers.length} tiers` },
            { icon: Star, color: 'text-amber-400', label: 'Points Outstanding', value: totalPtsOutstanding.toLocaleString(), sub: 'available to redeem' },
            { icon: TrendingUp, color: 'text-emerald-400', label: 'Lifetime Points', value: totalLifetime.toLocaleString(), sub: 'all time earned' },
            { icon: Gift, color: 'text-purple-400', label: 'Active Rewards', value: rewards.length, sub: 'redeemable now' },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-2 mb-2">
                  <k.icon className={`w-4 h-4 ${k.color}`} />
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">{k.label}</p>
                </div>
                <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
                <p className="text-xs text-zinc-600 mt-1">{k.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Tier distribution */}
          <Card>
            <CardContent className="pt-5 pb-5">
              <h3 className="text-sm font-medium text-zinc-400 mb-4">Tier Distribution</h3>
              {tiers.length === 0 ? (
                <p className="text-sm text-zinc-600">No tiers configured</p>
              ) : (
                <div className="space-y-3">
                  {tiers.map(t => (
                    <div key={t.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-300 font-medium flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: t.color ?? '#3b82f6' }} />
                          {t.name}
                        </span>
                        <span className="text-zinc-500">{t._count.members}</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(t._count.members / maxCount) * 100}%`, backgroundColor: t.color ?? '#3b82f6' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick links */}
          <Card>
            <CardContent className="pt-5 pb-5">
              <h3 className="text-sm font-medium text-zinc-400 mb-4">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { href: '/loyalty/members', label: 'View All Members', color: 'text-blue-400' },
                  { href: '/loyalty/members/new', label: 'Enroll New Member', color: 'text-emerald-400' },
                  { href: '/loyalty/tiers', label: 'Manage Tiers', color: 'text-amber-400' },
                  { href: '/loyalty/rewards', label: 'Manage Rewards', color: 'text-purple-400' },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="flex items-center justify-between px-3 py-2 bg-zinc-800/60 hover:bg-zinc-700/60 rounded-lg text-sm text-zinc-300 transition-colors">
                    <span className={l.color}>{l.label}</span>
                    <span className="text-zinc-600">→</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active rewards preview */}
          <Card>
            <CardContent className="pt-5 pb-5">
              <h3 className="text-sm font-medium text-zinc-400 mb-4">Active Rewards</h3>
              {rewards.length === 0 ? (
                <p className="text-sm text-zinc-600">No rewards yet</p>
              ) : (
                <div className="space-y-2">
                  {rewards.slice(0, 5).map(r => (
                    <div key={r.id} className="flex justify-between items-center text-sm">
                      <span className="text-zinc-300 truncate">{r.name}</span>
                      <span className="text-amber-400 font-mono text-xs ml-2 shrink-0">{r.pointsCost.toLocaleString()} pts</span>
                    </div>
                  ))}
                  {rewards.length > 5 && <p className="text-xs text-zinc-600">+{rewards.length - 5} more</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top earners */}
        {topEarners.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Top Earners</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Member</th>
                    <th className="text-left pb-3 font-medium">Tier</th>
                    <th className="text-right pb-3 font-medium">Points</th>
                    <th className="text-right pb-3 font-medium">Lifetime</th>
                    <th className="text-center pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {topEarners.map(m => (
                    <tr key={m.id} className="hover:bg-zinc-900/50">
                      <td className="py-2.5 pr-4">
                        <p className="text-zinc-100 text-sm">{m.name}</p>
                        {m.email && <p className="text-xs text-zinc-500">{m.email}</p>}
                      </td>
                      <td className="py-2.5 pr-4">
                        {m.tier ? (
                          <span className="inline-flex items-center gap-1.5 text-xs">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.tier.color ?? '#3b82f6' }} />
                            {m.tier.name}
                          </span>
                        ) : <span className="text-zinc-600 text-xs">—</span>}
                      </td>
                      <td className="py-2.5 pr-4 text-right font-mono text-amber-400">{m.points.toLocaleString()}</td>
                      <td className="py-2.5 pr-4 text-right font-mono text-zinc-400 text-xs">{m.lifetimePts.toLocaleString()}</td>
                      <td className="py-2.5 text-center">
                        <Link href={`/loyalty/members/${m.id}`} className="text-xs text-blue-400 hover:text-blue-300">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </>
  )
}
