'use client'
import { useEffect, useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, ShoppingCart, TrendingUp, Package, Users, Store } from 'lucide-react'

interface DailyPoint { date: string; sales: number; orders: number }
interface SalesSummary {
  totalRevenue: number
  totalTransactions: number
  avgOrderValue: number
  totalDiscounts: number
  daily: DailyPoint[]
}
interface TopProduct { productId: string; productName: string; sku: string; unitsSold: number; revenue: number; pctOfTotal: number }
interface TopCustomer { id: string; firstName: string; lastName: string; email: string | null; totalSpent: number; visitCount: number }
interface StorePerf { storeId: string; storeName: string; city: string | null; state: string | null; revenue: number; transactions: number; avgOrder: number; pctOfTotal: number }
interface CustomerStats {
  totalCustomers: number; newCustomers: number; returningCustomers: number
  activeInPeriod: number; newInPeriod: number; returningInPeriod: number
  topSpenders: TopCustomer[]
}

type Range = '7d' | '30d' | '90d'
type Tab = 'overview' | 'products' | 'customers' | 'stores'

function fmt(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) }
function fmtFull(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }

function BarChart({ data }: { data: DailyPoint[] }) {
  if (!data.length) return <div className="h-40 flex items-center justify-center text-zinc-600 text-sm">No data</div>
  const max = Math.max(...data.map(d => d.sales), 1)
  return (
    <div className="flex items-end gap-0.5 h-40 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
          <div className="absolute bottom-full mb-1 hidden group-hover:block bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 whitespace-nowrap z-10">
            <div>{new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            <div className="text-emerald-400">{fmt(d.sales)}</div>
            <div className="text-zinc-400">{d.orders} orders</div>
          </div>
          <div className="w-full bg-blue-500/80 hover:bg-blue-400 rounded-sm transition-colors min-h-[2px]" style={{ height: `${(d.sales / max) * 100}%` }} />
          {data.length <= 14 && <span className="text-[9px] text-zinc-600">{new Date(d.date).getDate()}</span>}
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [range, setRange] = useState<Range>('30d')
  const [loading, setLoading] = useState(true)

  const [summary, setSummary] = useState<SalesSummary | null>(null)
  const [products, setProducts] = useState<TopProduct[]>([])
  const [customers, setCustomers] = useState<CustomerStats | null>(null)
  const [stores, setStores] = useState<StorePerf[]>([])
  const [storesRevenue, setStoresRevenue] = useState(0)

  const getDateRange = useCallback((r: Range) => {
    const to = new Date()
    const from = new Date()
    if (r === '7d') from.setDate(from.getDate() - 7)
    else if (r === '30d') from.setDate(from.getDate() - 30)
    else from.setDate(from.getDate() - 90)
    return { from: from.toISOString(), to: to.toISOString() }
  }, [])

  const load = useCallback(async (r: Range) => {
    setLoading(true)
    const { from, to } = getDateRange(r)
    const qs = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`

    const [summRes, prodRes, custRes, storeRes] = await Promise.all([
      fetch(`/api/analytics/sales-summary?${qs}`),
      fetch(`/api/analytics/top-products?${qs}&limit=10`),
      fetch(`/api/analytics/customer-stats?${qs}`),
      fetch(`/api/analytics/store-performance?${qs}`),
    ])

    const [s, p, c, st] = await Promise.all([summRes.json(), prodRes.json(), custRes.json(), storeRes.json()])

    setSummary(s)
    setProducts(p.products ?? [])
    setCustomers(c)
    setStores(st.stores ?? [])
    setStoresRevenue(st.totalRevenue ?? 0)
    setLoading(false)
  }, [getDateRange])

  useEffect(() => { load(range) }, [range, load])

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'products', label: 'Products' },
    { key: 'customers', label: 'Customers' },
    { key: 'stores', label: 'Stores' },
  ]

  const RANGES: Range[] = ['7d', '30d', '90d']

  return (
    <>
      <TopBar title="Analytics" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-zinc-800/60 rounded-lg p-1">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>{t.label}</button>
            ))}
          </div>
          <div className="flex gap-1">
            {RANGES.map(r => (
              <Button key={r} variant={range === r ? 'default' : 'outline'} size="sm" onClick={() => setRange(r)}>{r}</Button>
            ))}
          </div>
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Revenue', value: fmt(summary?.totalRevenue ?? 0), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                { label: 'Transactions', value: (summary?.totalTransactions ?? 0).toLocaleString(), icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { label: 'Avg Order Value', value: fmtFull(summary?.avgOrderValue ?? 0), icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                { label: 'Discounts Given', value: fmt(summary?.totalDiscounts ?? 0), icon: Package, color: 'text-red-400', bg: 'bg-red-400/10' },
              ].map(k => (
                <Card key={k.label}>
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-zinc-500 font-medium">{k.label}</span>
                      <div className={`w-8 h-8 rounded-lg ${k.bg} flex items-center justify-center`}>
                        <k.icon className={`w-4 h-4 ${k.color}`} />
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${k.color}`}>{loading ? '—' : k.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100">Sales Trend</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Hover bars for details</p>
                  </div>
                  {summary && <span className="text-xs text-zinc-500">{summary.daily.length} days</span>}
                </div>
                {loading ? <div className="h-40 flex items-center justify-center text-zinc-600 text-sm">Loading...</div> : <BarChart data={summary?.daily ?? []} />}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-semibold text-zinc-100 mb-4">Top 5 Products</h3>
                  <div className="space-y-3">
                    {loading ? <div className="text-zinc-600 text-sm py-4 text-center">Loading...</div> : products.slice(0, 5).map((p, i) => (
                      <div key={p.productId} className="flex items-center gap-3">
                        <span className="text-xs text-zinc-600 w-4 text-center font-mono">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-zinc-200 truncate">{p.productName}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.pctOfTotal}%` }} />
                            </div>
                            <span className="text-xs text-zinc-500 w-10 text-right">{p.pctOfTotal.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-medium text-emerald-400">{fmt(p.revenue)}</div>
                          <div className="text-xs text-zinc-500">{p.unitsSold.toFixed(0)} units</div>
                        </div>
                      </div>
                    ))}
                    {!loading && products.length === 0 && <div className="text-zinc-600 text-sm py-4 text-center">No sales data</div>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-semibold text-zinc-100 mb-4">Customer Overview</h3>
                  {loading ? <div className="text-zinc-600 text-sm py-4 text-center">Loading...</div> : customers ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Total Customers', value: customers.totalCustomers.toLocaleString(), color: 'text-zinc-100' },
                          { label: 'Active in Period', value: customers.activeInPeriod.toLocaleString(), color: 'text-blue-400' },
                          { label: 'New in Period', value: customers.newInPeriod.toLocaleString(), color: 'text-emerald-400' },
                          { label: 'Returning', value: customers.returningInPeriod.toLocaleString(), color: 'text-amber-400' },
                        ].map(s => (
                          <div key={s.label} className="bg-zinc-800/40 rounded-lg p-3">
                            <div className="text-xs text-zinc-500 mb-1">{s.label}</div>
                            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-zinc-500 mb-1.5"><span>New</span><span>Returning</span></div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                          {(() => {
                            const total = (customers.newInPeriod + customers.returningInPeriod) || 1
                            const newPct = (customers.newInPeriod / total) * 100
                            return (
                              <>
                                <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: `${newPct}%` }} />
                                <div className="h-full bg-amber-500 rounded-r-full" style={{ width: `${100 - newPct}%` }} />
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  ) : <div className="text-zinc-600 text-sm py-4 text-center">No data</div>}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {tab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-100">Top 10 Products</h2>
              <span className="text-xs text-zinc-500">by revenue in period</span>
            </div>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      {['#', 'Product', 'SKU', 'Units Sold', 'Revenue', '% of Total'].map(h => (
                        <th key={h} className={`${h === '#' ? 'px-5' : 'px-4'} py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider ${h === 'Units Sold' || h === 'Revenue' || h === '% of Total' ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? <tr><td colSpan={6} className="py-12 text-center text-zinc-500">Loading...</td></tr>
                    : products.length === 0 ? <tr><td colSpan={6} className="py-12 text-center text-zinc-500">No sales data</td></tr>
                    : products.map((p, i) => (
                      <tr key={p.productId} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                        <td className="px-5 py-3 text-zinc-600 font-mono text-xs">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-zinc-200">{p.productName}</td>
                        <td className="px-4 py-3 text-xs font-mono text-zinc-500">{p.sku}</td>
                        <td className="px-4 py-3 text-right text-zinc-300">{p.unitsSold.toFixed(0)}</td>
                        <td className="px-4 py-3 text-right font-medium text-emerald-400">{fmtFull(p.revenue)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.pctOfTotal}%` }} />
                            </div>
                            <span className="text-xs text-zinc-400 w-10 text-right">{p.pctOfTotal.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {tab === 'customers' && (
          <div className="space-y-6">
            {customers && !loading && (
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Customers', value: customers.totalCustomers.toLocaleString(), icon: Users, color: 'text-zinc-100', bg: 'bg-zinc-800' },
                  { label: 'New Customers', value: customers.newInPeriod.toLocaleString(), icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                  { label: 'Returning', value: customers.returningInPeriod.toLocaleString(), icon: Users, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                ].map(k => (
                  <Card key={k.label}>
                    <CardContent className="pt-5 pb-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-zinc-500">{k.label}</span>
                        <div className={`w-8 h-8 rounded-lg ${k.bg} flex items-center justify-center`}><k.icon className={`w-4 h-4 ${k.color}`} /></div>
                      </div>
                      <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">Top 10 Customers by Spend</h2>
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        {['#', 'Name', 'Email', 'Visits', 'Total Spent'].map(h => (
                          <th key={h} className={`${h === '#' ? 'px-5' : 'px-4'} py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider ${h === 'Visits' || h === 'Total Spent' ? 'text-right' : 'text-left'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? <tr><td colSpan={5} className="py-12 text-center text-zinc-500">Loading...</td></tr>
                      : (customers?.topSpenders ?? []).length === 0 ? <tr><td colSpan={5} className="py-12 text-center text-zinc-500">No data</td></tr>
                      : (customers?.topSpenders ?? []).map((c, i) => (
                        <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                          <td className="px-5 py-3 text-zinc-600 font-mono text-xs">{i + 1}</td>
                          <td className="px-4 py-3 font-medium text-zinc-200">{c.firstName} {c.lastName}</td>
                          <td className="px-4 py-3 text-zinc-500 text-xs">{c.email ?? '—'}</td>
                          <td className="px-4 py-3 text-right text-zinc-400">{c.visitCount}</td>
                          <td className="px-4 py-3 text-right font-medium text-emerald-400">{fmtFull(c.totalSpent)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === 'stores' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-100">Sales by Store</h2>
              <span className="text-xs text-zinc-500">Total: {fmt(storesRevenue)}</span>
            </div>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      {['#', 'Store', 'Location', 'Transactions', 'Avg Order', 'Revenue', '% of Total'].map(h => (
                        <th key={h} className={`${h === '#' ? 'px-5' : 'px-4'} py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider ${['Transactions', 'Avg Order', 'Revenue', '% of Total'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? <tr><td colSpan={7} className="py-12 text-center text-zinc-500">Loading...</td></tr>
                    : stores.length === 0 ? <tr><td colSpan={7} className="py-12 text-center text-zinc-500">No store data</td></tr>
                    : stores.map((s, i) => (
                      <tr key={s.storeId} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                        <td className="px-5 py-3 text-zinc-600 font-mono text-xs">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-600/20 rounded-lg flex items-center justify-center"><Store className="w-3.5 h-3.5 text-blue-400" /></div>
                            <span className="font-medium text-zinc-200">{s.storeName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-zinc-500 text-xs">{[s.city, s.state].filter(Boolean).join(', ') || '—'}</td>
                        <td className="px-4 py-3 text-right text-zinc-400">{s.transactions.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-zinc-400">{fmtFull(s.avgOrder)}</td>
                        <td className="px-4 py-3 text-right font-medium text-emerald-400">{fmtFull(s.revenue)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.pctOfTotal}%` }} />
                            </div>
                            <span className="text-xs text-zinc-400 w-10 text-right">{s.pctOfTotal.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </main>
    </>
  )
}
