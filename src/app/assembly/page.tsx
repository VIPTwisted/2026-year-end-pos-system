export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Layers, Plus } from 'lucide-react'

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
    released: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    finished: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  }
  const cls = map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${cls}`}>
      {status}
    </span>
  )
}

export default async function AssemblyOrdersPage() {
  const orders = await prisma.assemblyOrder.findMany({
    include: {
      product: { select: { name: true, sku: true } },
      store: { select: { name: true } },
      lines: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const open = orders.filter(o => o.status === 'open').length
  const released = orders.filter(o => o.status === 'released').length
  const finished = orders.filter(o => o.status === 'finished').length
  const thisWeek = orders.filter(o => new Date(o.createdAt) >= weekStart).length

  const kpis = [
    { label: 'Open', value: open, color: 'text-zinc-300' },
    { label: 'Released', value: released, color: 'text-blue-400' },
    { label: 'Finished', value: finished, color: 'text-emerald-400' },
    { label: 'This Week', value: thisWeek, color: 'text-violet-400' },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Assembly Orders" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* Page header: title + count + New button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Assembly Orders</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {orders.length}
            </span>
          </div>
          <Link href="/assembly/orders/new">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
              <Plus className="w-3.5 h-3.5" /> New Assembly Order
            </button>
          </Link>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map(({ label, value, color }) => (
            <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {orders.length === 0 ? (
            <p className="px-5 py-5 text-[13px] text-zinc-600">No assembly orders yet.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['Order #', 'Product', 'Qty', 'Store', 'Due Date', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="py-2 border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2">
                      <Link href={`/assembly/orders/${o.id}`} className="font-mono text-[13px] text-blue-400 hover:text-blue-300 hover:underline">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-zinc-300">{o.product.name}</p>
                      <p className="text-[11px] text-zinc-600">{o.product.sku}</p>
                    </td>
                    <td className="px-4 py-2 text-zinc-400">{o.quantity}</td>
                    <td className="px-4 py-2 text-zinc-500">{o.store.name}</td>
                    <td className="px-4 py-2 text-zinc-500">
                      {o.dueDate ? formatDate(o.dueDate) : '—'}
                    </td>
                    <td className="px-4 py-2">
                      <StatusChip status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
