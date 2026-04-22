'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { RefreshCw, Package, Users, CreditCard, Repeat, TrendingDown, DollarSign, AlertCircle, Clock, BarChart3 } from 'lucide-react'

interface Analytics {
  totalActive: number
  totalTrial: number
  totalPastDue: number
  mrr: number
  arr: number
  churnRate: number
  avgLifetimeValue: number
  revenueByMonth: { month: string; amount: number }[]
}

export default function SubscriptionsHub() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/subscriptions/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const fmt = (n: number) => n?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) ?? '$0'

  const kpis = [
    { label: 'Active Subscriptions', value: loading ? '—' : (data?.totalActive ?? 0).toString(), icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'MRR', value: loading ? '—' : fmt(data?.mrr ?? 0), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'ARR', value: loading ? '—' : fmt(data?.arr ?? 0), icon: BarChart3, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Churn Rate', value: loading ? '—' : `${data?.churnRate ?? 0}%`, icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Trial Subscribers', value: loading ? '—' : (data?.totalTrial ?? 0).toString(), icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Past Due', value: loading ? '—' : (data?.totalPastDue ?? 0).toString(), icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ]

  const months = data?.revenueByMonth ?? []
  const maxAmt = Math.max(...months.map(m => m.amount), 1)

  const quickLinks = [
    { href: '/subscriptions/plans', label: 'Plans', icon: Package, desc: 'Manage subscription plans & pricing' },
    { href: '/subscriptions/subscribers', label: 'Subscribers', icon: Users, desc: 'View and manage subscribers' },
    { href: '/subscriptions/billing', label: 'Billing', icon: CreditCard, desc: 'Billing history & payment runs' },
    { href: '/subscriptions/recurring-orders', label: 'Recurring Orders', icon: Repeat, desc: 'Auto-recurring order schedules' },
    { href: '/subscriptions/churn', label: 'Churn Analysis', icon: TrendingDown, desc: 'Churn events & retention insights' },
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <RefreshCw className="w-6 h-6 text-blue-400" />
          Subscription Commerce
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Recurring revenue hub — plans, subscribers, billing &amp; churn</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
            <div className={`w-8 h-8 rounded-lg ${k.bg} flex items-center justify-center`}>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <div className="text-xl font-bold text-zinc-100">{k.value}</div>
            <div className="text-xs text-zinc-500">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Revenue Trend — Last 6 Months</h2>
        {months.length === 0 ? (
          <div className="text-zinc-600 text-sm text-center py-8">No billing data yet</div>
        ) : (
          <div className="flex items-end gap-3 h-32">
            {months.map(m => {
              const pct = maxAmt > 0 ? (m.amount / maxAmt) * 100 : 0
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs text-zinc-400 font-medium">{fmt(m.amount)}</div>
                  <div className="w-full rounded-t-sm bg-blue-500/80" style={{ height: `${Math.max(pct, 2)}%`, minHeight: '4px' }} />
                  <div className="text-xs text-zinc-600">{m.month}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {quickLinks.map(l => (
          <Link key={l.href} href={l.href} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 hover:bg-zinc-800/60 transition-all group">
            <l.icon className="w-5 h-5 text-blue-400 mb-2 group-hover:text-blue-300" />
            <div className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-100">{l.label}</div>
            <div className="text-xs text-zinc-500 mt-1">{l.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
