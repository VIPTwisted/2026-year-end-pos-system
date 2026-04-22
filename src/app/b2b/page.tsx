'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  ShoppingCart,
  FileText,
  CreditCard,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface B2BAccount {
  id: string
  accountCode: string
  companyName: string
  creditLimit: number
  creditUsed: number
  isApproved: boolean
  isActive: boolean
  _count: { orders: number; portalQuotes: number }
}

interface B2BOrder {
  id: string
  orderNumber: string
  account: { companyName: string }
  status: string
  orderDate: string
  totalAmt: number
}

const ORDER_STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-900/40 text-amber-400 border-amber-800/40',
  approved: 'bg-emerald-900/40 text-emerald-400 border-emerald-800/40',
  processing: 'bg-blue-900/40 text-blue-400 border-blue-800/40',
  shipped: 'bg-purple-900/40 text-purple-400 border-purple-800/40',
  delivered: 'bg-emerald-900/60 text-emerald-300 border-emerald-800/60',
  cancelled: 'bg-zinc-800 text-zinc-500 border-zinc-700',
}

function CreditBar({ used, limit, company }: { used: number; limit: number; company: string }) {
  const pct = limit ? Math.min((used / limit) * 100, 100) : 0
  const color = pct >= 80 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-zinc-300 w-40 truncate">{company}</span>
      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-zinc-500 w-12 text-right">{pct.toFixed(0)}%</span>
      <span className="text-xs text-zinc-500 w-24 text-right">{fmt(used)} / {fmt(limit)}</span>
    </div>
  )
}

export default function B2BHubPage() {
  const [accounts, setAccounts] = useState<B2BAccount[]>([])
  const [orders, setOrders] = useState<B2BOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [accountsRes, ordersRes] = await Promise.all([
          fetch('/api/b2b/accounts'),
          fetch('/api/b2b/orders'),
        ])
        const [accountsData, ordersData] = await Promise.all([accountsRes.json(), ordersRes.json()])
        setAccounts(Array.isArray(accountsData) ? accountsData : [])
        setOrders(Array.isArray(ordersData) ? ordersData : [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const totalAccounts = accounts.length
  const approvedAccounts = accounts.filter((a) => a.isApproved).length
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const totalRevenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.totalAmt, 0)
  const recentOrders = [...orders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).slice(0, 8)
  const accountsWithCredit = accounts.filter((a) => a.creditLimit > 0).sort((a, b) => (b.creditUsed / b.creditLimit) - (a.creditUsed / a.creditLimit))

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-7 h-7 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">B2B Wholesale Portal</h1>
            <p className="text-sm text-zinc-500">Wholesale accounts, orders &amp; quotes</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Accounts', value: loading ? '—' : String(totalAccounts), icon: Building2, color: 'text-blue-400' },
            { label: 'Approved Accounts', value: loading ? '—' : String(approvedAccounts), icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Pending Orders', value: loading ? '—' : String(pendingOrders), icon: Clock, color: 'text-amber-400' },
            { label: 'Total Revenue', value: loading ? '—' : fmt(totalRevenue), icon: TrendingUp, color: 'text-purple-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-zinc-500">{label}</span>
                <Icon className={cn('w-4 h-4', color)} />
              </div>
              <p className="text-2xl font-bold text-zinc-100">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { href: '/b2b/accounts', icon: Building2, label: 'Accounts', desc: 'Manage wholesale customers', color: 'text-blue-400' },
            { href: '/b2b/orders', icon: ShoppingCart, label: 'Orders', desc: 'B2B order management', color: 'text-emerald-400' },
            { href: '/b2b/quotes', icon: FileText, label: 'Quotes', desc: 'Portal quote management', color: 'text-purple-400' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 transition-colors group flex items-center justify-between">
              <div className="flex items-center gap-3">
                <item.icon className={cn('w-5 h-5', item.color)} />
                <div>
                  <div className="text-sm font-semibold text-zinc-100">{item.label}</div>
                  <div className="text-xs text-zinc-500">{item.desc}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-400" /> Recent Orders
              </h2>
              <Link href="/b2b/orders" className="text-xs text-zinc-500 hover:text-zinc-300">View all</Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Account', 'Date', 'Total', 'Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-2 text-xs uppercase tracking-widest text-zinc-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-zinc-800/50">
                      {Array.from({ length: 4 }).map((__, j) => (
                        <td key={j} className="px-4 py-2.5"><div className="h-3 bg-zinc-800 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : recentOrders.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-500">No orders yet</td></tr>
                ) : (
                  recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                      <td className="px-4 py-2.5 text-zinc-300 text-xs">{o.account.companyName}</td>
                      <td className="px-4 py-2.5 text-zinc-500 text-xs">{fmtDate(o.orderDate)}</td>
                      <td className="px-4 py-2.5 text-zinc-100 font-medium text-xs">{fmt(o.totalAmt)}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn('px-2 py-0.5 rounded text-xs border capitalize', ORDER_STATUS_BADGE[o.status] || 'bg-zinc-800 text-zinc-400 border-zinc-700')}>{o.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-400" /> Credit Utilization
              </h2>
              <div className="flex items-center gap-3 text-xs text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />&lt;60%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />&lt;80%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />&ge;80%</span>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-6 bg-zinc-800 rounded animate-pulse" />
                ))
              ) : accountsWithCredit.length === 0 ? (
                <p className="text-center text-zinc-500 py-8 text-sm">No credit lines configured</p>
              ) : (
                accountsWithCredit.slice(0, 8).map((a) => (
                  <Link key={a.id} href={`/b2b/accounts/${a.id}`} className="block hover:bg-zinc-800/30 rounded px-1 py-0.5 -mx-1 transition-colors">
                    <CreditBar used={a.creditUsed} limit={a.creditLimit} company={a.companyName} />
                  </Link>
                ))
              )}
              {!loading && accountsWithCredit.some((a) => (a.creditUsed / a.creditLimit) >= 0.8) && (
                <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {accountsWithCredit.filter((a) => (a.creditUsed / a.creditLimit) >= 0.8).length} account(s) at or above 80% credit utilization
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
