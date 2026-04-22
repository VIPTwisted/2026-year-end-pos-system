'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BarChart2, TrendingUp, TrendingDown, LayoutDashboard,
  FileBarChart, Target, Store, Package, Clock, Users, ArrowUpRight,
} from 'lucide-react'

type TrendPoint = { date: string; revenue: number; transactions: number; avgTicket: number }
type TopProduct = { rank: number; productName: string; unitsSold: number; revenue: number; pct: number }
type StoreRow = { store: string; revenue: number; transactions: number; avgTicket: number; yoyGrowth: number }
type HourRow = { hour: number; label: string; transactions: number; revenue: number }
type EmpRow = { employeeName: string; transactions: number; revenue: number; avgTicket: number }

const RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: 'YTD', days: Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000) },
]

function fmt(n: number, prefix = '$') {
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${prefix}${(n / 1_000).toFixed(1)}K`
  return `${prefix}${n.toFixed(0)}`
}

function SvgLineChart({ data }: { data: TrendPoint[] }) {
  if (!data.length) return null
  const W = 800, H = 160, PAD = 12
  const vals = data.map(d => d.revenue)
  const min = Math.min(...vals), max = Math.max(...vals)
  const range = max - min || 1
  const pts = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2)
    const y = PAD + ((max - d.revenue) / range) * (H - PAD * 2)
    return `${x},${y}`
  })
  const area = `M${pts[0]} L${pts.join(' L')} L${PAD + (W - PAD * 2)},${H} L${PAD},${H} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaGrad)" />
      <polyline points={pts.join(' ')} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AdvancedAnalyticsPage() {
  const [range, setRange] = useState(RANGES[1])
  const [trend, setTrend] = useState<TrendPoint[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [stores, setStores] = useState<StoreRow[]>([])
  const [hours, setHours] = useState<HourRow[]>([])
  const [employees, setEmployees] = useState<EmpRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/analytics/data/sales-trend?days=${range.days}`).then(r => r.json()),
      fetch('/api/analytics/data/top-products?limit=5').then(r => r.json()),
      fetch('/api/analytics/data/sales-by-store').then(r => r.json()),
      fetch('/api/analytics/data/sales-by-hour').then(r => r.json()),
      fetch('/api/analytics/data/employee-performance').then(r => r.json()),
    ]).then(([t, tp, st, h, e]) => {
      setTrend(t); setTopProducts(tp); setStores(st); setHours(h); setEmployees(e); setLoading(false)
    })
  }, [range.days])

  const totalRevenue = trend.reduce((s, d) => s + d.revenue, 0)
  const totalTx = trend.reduce((s, d) => s + d.transactions, 0)
  const avgTicket = totalTx ? totalRevenue / totalTx : 0
  const topStore = [...stores].sort((a, b) => b.revenue - a.revenue)[0]
  const topProduct = topProducts[0]
  const busiestHour = [...hours].sort((a, b) => b.transactions - a.transactions)[0]
  const bestEmployee = [...employees].sort((a, b) => b.revenue - a.revenue)[0]

  const kpis = [
    { label: 'Total Revenue', value: fmt(totalRevenue), target: fmt(range.days * 18000), up: true },
    { label: 'Transactions', value: totalTx.toLocaleString(), target: `${(range.days * 180).toLocaleString()} target`, up: true },
    { label: 'Avg Ticket', value: `$${avgTicket.toFixed(2)}`, target: '$110 target', up: avgTicket > 110 },
    { label: 'Top Store Revenue', value: topStore ? fmt(topStore.revenue) : '–', target: 'vs peers', up: true },
    { label: 'Units Sold', value: topProduct ? topProduct.unitsSold.toLocaleString() : '–', target: '#1 product', up: true },
    { label: 'Peak Hour Tx', value: busiestHour ? busiestHour.transactions.toString() : '–', target: busiestHour?.label ?? '', up: true },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Advanced Analytics</h1>
          <p className="text-sm text-zinc-400 mt-1">D365 Commerce Analytics — Power BI Embedded</p>
        </div>
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {RANGES.map(r => (
            <button key={r.label} onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${range.label === r.label ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500 uppercase tracking-wide">{k.label}</span>
              {k.up ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
            </div>
            <div className="text-xl font-bold text-zinc-100">{loading ? '...' : k.value}</div>
            <div className="text-xs text-zinc-600 mt-1">{k.target}</div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-100">Revenue Trend — Last {range.label}</h2>
          <span className="text-xs text-zinc-500">{fmt(totalRevenue)} total</span>
        </div>
        {loading ? <div className="h-40 flex items-center justify-center text-zinc-600 text-sm">Loading...</div> : <SvgLineChart data={trend} />}
        {!loading && (
          <div className="flex justify-between mt-2 px-1">
            <span className="text-xs text-zinc-600">{trend[0]?.date}</span>
            <span className="text-xs text-zinc-600">{trend[trend.length - 1]?.date}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Top Store', icon: Store, color: 'blue', value: topStore?.store, sub: topStore ? `${fmt(topStore.revenue)} · ${topStore.transactions.toLocaleString()} tx` : '' },
          { label: 'Top Product', icon: Package, color: 'emerald', value: topProduct?.productName, sub: topProduct ? `${fmt(topProduct.revenue)} · ${topProduct.unitsSold} units` : '' },
          { label: 'Busiest Hour', icon: Clock, color: 'amber', value: busiestHour?.label, sub: busiestHour ? `${busiestHour.transactions} transactions` : '' },
          { label: 'Best Employee', icon: Users, color: 'purple', value: bestEmployee?.employeeName, sub: bestEmployee ? `${fmt(bestEmployee.revenue)} · ${bestEmployee.transactions} tx` : '' },
        ].map(card => (
          <div key={card.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <card.icon className={`w-4 h-4 ${card.color === 'blue' ? 'text-blue-400' : card.color === 'emerald' ? 'text-emerald-400' : card.color === 'amber' ? 'text-amber-400' : 'text-purple-400'}`} />
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{card.label}</span>
            </div>
            {loading ? <div className="text-zinc-600 text-sm">Loading...</div> : (
              <>
                <div className="text-base font-bold text-zinc-100 leading-tight">{card.value ?? '–'}</div>
                <div className="text-xs text-zinc-500 mt-1">{card.sub}</div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Dashboards', desc: 'Build custom widget dashboards', href: '/advanced-analytics/dashboards', icon: LayoutDashboard, color: 'blue' },
          { label: 'Reports', desc: 'Saved reports & scheduled exports', href: '/advanced-analytics/reports', icon: FileBarChart, color: 'emerald' },
          { label: 'KPI Scorecards', desc: 'Target vs actual metric tracking', href: '/advanced-analytics/scorecards', icon: Target, color: 'amber' },
        ].map(link => (
          <Link key={link.href} href={link.href}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-colors group flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${link.color === 'blue' ? 'bg-blue-600/20' : link.color === 'emerald' ? 'bg-emerald-600/20' : 'bg-amber-600/20'}`}>
              <link.icon className={`w-5 h-5 ${link.color === 'blue' ? 'text-blue-400' : link.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'}`} />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-100 group-hover:text-white">{link.label}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{link.desc}</div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 ml-auto mt-0.5" />
          </Link>
        ))}
      </div>
    </div>
  )
}
