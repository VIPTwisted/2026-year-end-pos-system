import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { RefreshCw, Plus, Zap } from 'lucide-react'

export const dynamic = 'force-dynamic'

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    paused: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
  }
  const cls = map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${cls}`}>
      {status}
    </span>
  )
}

const FREQ_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Bi-Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
}

export default async function SubscriptionOrdersPage() {
  const orders = await prisma.subscriptionOrder.findMany({
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
  })

  const active = orders.filter(o => o.status === 'active').length
  const due = orders.filter(o => {
    if (!o.nextOrderDate || o.status !== 'active') return false
    return new Date(o.nextOrderDate) <= new Date()
  }).length

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Subscription Orders" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Subscriptions', value: orders.length, color: 'text-zinc-200' },
            { label: 'Active', value: active, color: 'text-emerald-400' },
            { label: 'Due for Processing', value: due, color: due > 0 ? 'text-amber-400' : 'text-zinc-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-5 py-4">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-xl font-semibold font-mono ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Subscription Orders</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {orders.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
              <Zap className="w-3.5 h-3.5" /> Process Due Orders
            </button>
            <Link href="/iom/subscription-orders/new">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {orders.length === 0 ? (
            <p className="px-5 py-5 text-[13px] text-zinc-600">No subscription orders found.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['No.', 'Customer', 'Item', 'Qty', 'Unit Price', 'Frequency', 'Next Order Date', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => {
                  const isDue = o.nextOrderDate && new Date(o.nextOrderDate) <= new Date() && o.status === 'active'
                  return (
                    <tr key={o.id} className={`border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors ${isDue ? 'bg-amber-500/5' : ''}`}>
                      <td className="px-4 py-2.5 font-mono text-blue-400 text-[12px]">{o.orderNo}</td>
                      <td className="px-4 py-2.5 text-zinc-300">
                        {o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-400">{o.itemName ?? '—'}</td>
                      <td className="px-4 py-2.5 text-zinc-400 font-mono text-[12px]">{o.qty}</td>
                      <td className="px-4 py-2.5 text-zinc-200 font-mono text-[12px]">{formatCurrency(o.unitPrice)}</td>
                      <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{FREQ_LABELS[o.frequency] ?? o.frequency}</td>
                      <td className="px-4 py-2.5 text-[12px]">
                        {o.nextOrderDate ? (
                          <span className={isDue ? 'text-amber-400 font-medium' : 'text-zinc-400'}>
                            {new Date(o.nextOrderDate).toLocaleDateString()}
                            {isDue && ' — Due'}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-2.5"><StatusChip status={o.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
