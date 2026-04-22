'use client'

import { useEffect, useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, Package, AlertTriangle, Users, TrendingUp, RefreshCw } from 'lucide-react'

interface ConversionStats {
  conversionRate: number
  avgBasketSize: number
  avgBasketValue: number
  totalTransactions: number
}

interface CategoryRevenue {
  category: string
  revenue: number
  transactions: number
  pctOfTotal: number
}

interface SlowMover {
  productId: string
  productName: string
  sku: string
  stockOnHand: number
  daysSinceLastSale: number
  avgDailySales: number
  daysOfStock: number
}

interface StaffMetric {
  name: string
  role: string
  transactions: number
  revenue: number
  avgTicket: number
}

interface OperationalData {
  conversion: ConversionStats
  topCategories: CategoryRevenue[]
  slowMovers: SlowMover[]
  staffMetrics: StaffMetric[]
}

type Range = '7d' | '30d' | '90d'

function fmt(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) }
function fmtFull(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }

function ScoreBar({ value, max, color = 'bg-blue-500' }: { value: number; max: number; color?: string }) {
  return (
    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min((value / (max || 1)) * 100, 100)}%` }} />
    </div>
  )
}

export default function OperationalInsightsPage() {
  const [range, setRange] = useState<Range>('30d')
  const [data, setData] = useState<OperationalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const getDateRange = useCallback((r: Range) => {
    const to = new Date()
    const from = new Date()
    if (r === '7d') from.setDate(from.getDate() - 7)
    else if (r === '30d') from.setDate(from.getDate() - 30)
    else from.setDate(from.getDate() - 90)
    return { from: from.toISOString(), to: to.toISOString() }
  }, [])

  const load = useCallback(async (r: Range) => {
    setRefreshing(true)
    const { from, to } = getDateRange(r)
    const qs = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    try {
      const [convRes, catRes, slowRes, staffRes] = await Promise.all([
        fetch(`/api/analytics/operational/conversion?${qs}`),
        fetch(`/api/analytics/operational/categories?${qs}`),
        fetch(`/api/analytics/operational/slow-movers`),
        fetch(`/api/analytics/operational/staff?${qs}`),
      ])
      const [conv, cats, slow, staff] = await Promise.all([
        convRes.ok ? convRes.json() : null,
        catRes.ok ? catRes.json() : null,
        slowRes.ok ? slowRes.json() : null,
        staffRes.ok ? staffRes.json() : null,
      ])
      setData({
        conversion: conv ?? { conversionRate: 0, avgBasketSize: 0, avgBasketValue: 0, totalTransactions: 0 },
        topCategories: Array.isArray(cats) ? cats : [],
        slowMovers: Array.isArray(slow) ? slow : [],
        staffMetrics: Array.isArray(staff) ? staff : [],
      })
    } catch {
      setData(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [getDateRange])

  useEffect(() => { load(range) }, [range, load])

  const conversion = data?.conversion
  const topCats = data?.topCategories ?? []
  const slowMovers = data?.slowMovers ?? []
  const staff = data?.staffMetrics ?? []
  const maxCatRev = Math.max(...topCats.map(c => c.revenue), 1)
  const maxStaffRev = Math.max(...staff.map(s => s.revenue), 1)

  return (
    <>
      <TopBar title="Operational Insights" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        {/* Range selector */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Operational Dashboard</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Store performance, inventory health, and staff productivity</p>
          </div>
          <div className="flex items-center gap-2">
            {refreshing && <RefreshCw className="w-4 h-4 text-zinc-500 animate-spin" />}
            <div className="flex gap-1 bg-zinc-800/60 rounded-lg p-1">
              {(['7d', '30d', '90d'] as Range[]).map(r => (
                <button key={r} onClick={() => setRange(r)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${range === r ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Conversion KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Conversion Rate', value: loading ? '—' : `${(conversion?.conversionRate ?? 0).toFixed(2)}%`, color: 'text-emerald-400', icon: TrendingUp, bg: 'bg-emerald-500/10' },
            { label: 'Avg Basket Size', value: loading ? '—' : `${(conversion?.avgBasketSize ?? 0).toFixed(1)} items`, color: 'text-blue-400', icon: ShoppingCart, bg: 'bg-blue-500/10' },
            { label: 'Avg Basket Value', value: loading ? '—' : fmtFull(conversion?.avgBasketValue ?? 0), color: 'text-amber-400', icon: ShoppingCart, bg: 'bg-amber-500/10' },
            { label: 'Total Transactions', value: loading ? '—' : (conversion?.totalTransactions ?? 0).toLocaleString(), color: 'text-zinc-100', icon: Package, bg: 'bg-zinc-800' },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">{k.label}</p>
                  <div className={`w-8 h-8 rounded-lg ${k.bg} flex items-center justify-center`}>
                    <k.icon className={`w-4 h-4 ${k.color}`} />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Top categories */}
          <Card>
            <CardContent className="pt-5">
              <h2 className="text-sm font-semibold text-zinc-100 mb-4">Top Categories by Revenue</h2>
              {loading ? (
                <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 bg-zinc-800 rounded animate-pulse" />)}</div>
              ) : topCats.length === 0 ? (
                <p className="text-zinc-500 text-sm py-6 text-center">No category data available.</p>
              ) : (
                <div className="space-y-3">
                  {topCats.slice(0, 8).map((cat, i) => (
                    <div key={cat.category} className="flex items-center gap-3">
                      <span className="text-xs text-zinc-600 w-4 font-mono">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm text-zinc-200 truncate">{cat.category}</span>
                          <span className="text-xs text-zinc-500 shrink-0">{cat.transactions.toLocaleString()} txns</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ScoreBar value={cat.revenue} max={maxCatRev} color="bg-blue-500" />
                          <span className="text-xs text-zinc-400 w-8 shrink-0">{cat.pctOfTotal.toFixed(1)}%</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-emerald-400 w-20 text-right shrink-0">{fmt(cat.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staff productivity */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-zinc-500" />
                <h2 className="text-sm font-semibold text-zinc-100">Staff Productivity</h2>
              </div>
              {loading ? (
                <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-zinc-800 rounded animate-pulse" />)}</div>
              ) : staff.length === 0 ? (
                <p className="text-zinc-500 text-sm py-6 text-center">No staff data available.</p>
              ) : (
                <div className="space-y-3">
                  {staff.slice(0, 8).map((s, i) => (
                    <div key={s.name + i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-zinc-400">{s.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-sm text-zinc-200 truncate">{s.name}</span>
                          <span className="text-xs text-zinc-500 shrink-0">{s.transactions} txns</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ScoreBar value={s.revenue} max={maxStaffRev} color="bg-violet-500" />
                          <span className="text-xs text-zinc-500 w-16 text-right shrink-0">avg {fmtFull(s.avgTicket)}</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-emerald-400 w-18 text-right shrink-0">{fmt(s.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Slow-moving inventory */}
        <Card>
          <CardContent className="pt-0 pb-0 px-0">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-zinc-100">Slow-Moving Inventory Alerts</h2>
              </div>
              <span className="text-xs text-zinc-500">{slowMovers.length} item{slowMovers.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Product', 'SKU', 'Stock on Hand', 'Days Since Sale', 'Avg Daily Sales', 'Days of Stock', 'Alert'].map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider text-left first:pl-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="py-12 text-center text-zinc-500">Loading...</td></tr>
                  ) : slowMovers.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-zinc-500">No slow-moving inventory detected.</td></tr>
                  ) : slowMovers.map(item => {
                    const severity = item.daysOfStock > 180 ? 'critical' : item.daysOfStock > 90 ? 'warning' : 'ok'
                    return (
                      <tr key={item.productId} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                        <td className="pl-6 pr-4 py-3 font-medium text-zinc-200">{item.productName}</td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-500">{item.sku}</td>
                        <td className="px-4 py-3 text-zinc-300">{item.stockOnHand.toLocaleString()}</td>
                        <td className="px-4 py-3 text-zinc-400">{item.daysSinceLastSale}d</td>
                        <td className="px-4 py-3 text-zinc-400">{item.avgDailySales.toFixed(1)}/day</td>
                        <td className="px-4 py-3">
                          <span className={`font-medium ${item.daysOfStock > 180 ? 'text-red-400' : item.daysOfStock > 90 ? 'text-amber-400' : 'text-zinc-300'}`}>
                            {item.daysOfStock}d
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            severity === 'critical' ? 'bg-red-500/15 text-red-300 border border-red-500/25' :
                            severity === 'warning' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25' :
                            'bg-zinc-700 text-zinc-400'
                          }`}>
                            {severity === 'critical' ? 'Overstock' : severity === 'warning' ? 'Slow' : 'Monitor'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
