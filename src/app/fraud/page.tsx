import { prisma } from '@/lib/prisma'
import { ShieldAlert, ShieldCheck, AlertTriangle, Ban } from 'lucide-react'
import Link from 'next/link'

export default async function FraudPage() {
  const [rules, reviews, blocked] = await Promise.all([
    prisma.fraudRule.findMany(),
    prisma.fraudReview.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.blockedEntity.findMany(),
  ])

  const pending = reviews.filter((r) => r.status === 'pending')
  const activeRules = rules.filter((r) => r.isActive)

  const riskBuckets = [
    { label: '0-25 Low', color: 'bg-emerald-500', count: reviews.filter((r) => r.riskScore <= 25).length },
    { label: '26-50 Medium', color: 'bg-yellow-500', count: reviews.filter((r) => r.riskScore > 25 && r.riskScore <= 50).length },
    { label: '51-75 High', color: 'bg-orange-500', count: reviews.filter((r) => r.riskScore > 50 && r.riskScore <= 75).length },
    { label: '76-100 Critical', color: 'bg-red-500', count: reviews.filter((r) => r.riskScore > 75).length },
  ]
  const maxBucket = Math.max(...riskBuckets.map((b) => b.count), 1)
  const recentHighRisk = reviews.filter((r) => r.riskScore >= 75).slice(0, 10)

  return (
    <div className="p-6 space-y-6">
      {pending.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-sm">
            <span className="font-semibold">{pending.length} pending fraud review{pending.length !== 1 ? 's' : ''}</span> require attention.{' '}
            <Link href="/fraud/reviews" className="underline hover:text-amber-200">Review now</Link>
          </p>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Fraud Protection</h1>
        <p className="text-zinc-400 text-sm mt-1">Rules, review queue, and blocked entities</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Rules', value: rules.length, icon: ShieldAlert, color: 'text-blue-400', bg: 'bg-blue-500/10', href: '/fraud/rules' },
          { label: 'Active Rules', value: activeRules.length, icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', href: '/fraud/rules' },
          { label: 'Pending Reviews', value: pending.length, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', href: '/fraud/reviews' },
          { label: 'Blocked Entities', value: blocked.length, icon: Ban, color: 'text-red-400', bg: 'bg-red-500/10', href: '/fraud/blocked' },
        ].map((kpi) => (
          <Link key={kpi.label} href={kpi.href} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 ${kpi.bg} rounded-lg flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <span className="text-zinc-400 text-sm">{kpi.label}</span>
            </div>
            <p className="text-3xl font-bold text-zinc-100">{kpi.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <h2 className="text-sm font-medium text-zinc-400 mb-4">Risk Distribution</h2>
          <div className="space-y-3">
            {riskBuckets.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">{b.label}</span>
                  <span className="text-zinc-500">{b.count}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full ${b.color} rounded-full transition-all`} style={{ width: `${(b.count / maxBucket) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-sm font-medium text-zinc-300">Recent High-Risk Orders</h2>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-zinc-500 font-medium px-4 py-2">Order</th>
                <th className="text-left text-zinc-500 font-medium px-4 py-2">Customer</th>
                <th className="text-left text-zinc-500 font-medium px-4 py-2">Score</th>
                <th className="text-left text-zinc-500 font-medium px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentHighRisk.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-zinc-600 py-4">No high-risk orders</td></tr>
              ) : recentHighRisk.map((r) => (
                <tr key={r.id} className="border-b border-zinc-800/50">
                  <td className="px-4 py-2 font-mono text-zinc-300">{r.orderNumber ?? '—'}</td>
                  <td className="px-4 py-2 text-zinc-400">{r.customerEmail ?? '—'}</td>
                  <td className="px-4 py-2"><span className="text-red-400 font-medium">{r.riskScore}</span></td>
                  <td className="px-4 py-2 capitalize text-zinc-400">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
