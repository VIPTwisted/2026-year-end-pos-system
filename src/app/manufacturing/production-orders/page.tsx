import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { ClipboardList, ArrowLeft } from 'lucide-react'

const STATUS_CHIP: Record<string, string> = {
  simulated: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
  planned: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  firm_planned: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  released: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  finished: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
}

/* subtle progress bar color per status */
const PROGRESS_COLOR: Record<string, string> = {
  simulated: 'bg-zinc-600',
  planned: 'bg-blue-500',
  firm_planned: 'bg-amber-500',
  released: 'bg-orange-500',
  finished: 'bg-emerald-500',
}

const PROGRESS_PCT: Record<string, number> = {
  simulated: 5,
  planned: 20,
  firm_planned: 45,
  released: 70,
  finished: 100,
}

function StatusChip({ status }: { status: string }) {
  const cls = STATUS_CHIP[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

const ALL_STATUSES = ['simulated', 'planned', 'firm_planned', 'released', 'finished']

export default async function ProductionOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams

  const orders = await prisma.productionOrder.findMany({
    where: status && ALL_STATUSES.includes(status) ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { name: true, sku: true } },
      store: { select: { name: true } },
      bom: { select: { bomNumber: true } },
    },
  })

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Production Orders" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        <Link
          href="/manufacturing"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Manufacturing
        </Link>

        {/* Page header: title + count badge + New button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Production Orders</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {orders.length}
            </span>
          </div>
          <Link href="/manufacturing/production-orders/new">
            <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
              + New Order
            </button>
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {['', ...ALL_STATUSES].map(s => (
            <Link
              key={s}
              href={s ? `/manufacturing/production-orders?status=${s}` : '/manufacturing/production-orders'}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                (s === '' && !status) || status === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {s ? s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'All'}
            </Link>
          ))}
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                {['Order #', 'Product', 'BOM', 'Quantity', 'Qty Finished', 'Progress', 'Due Date', 'Status', 'Store'].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-[13px] text-zinc-600">
                    No orders found.{' '}
                    <Link href="/manufacturing/production-orders/new" className="text-blue-400 hover:text-blue-300 hover:underline">
                      Create one
                    </Link>
                  </td>
                </tr>
              ) : (
                orders.map(order => {
                  const pct = PROGRESS_PCT[order.status] ?? 0
                  const bar = PROGRESS_COLOR[order.status] ?? 'bg-zinc-600'
                  return (
                    <tr key={order.id} className="py-2 border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-2">
                        <Link href={`/manufacturing/production-orders/${order.id}`} className="font-mono text-[13px] text-blue-400 hover:text-blue-300 hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-2">
                        <p className="text-zinc-300">{order.product.name}</p>
                        <p className="text-[11px] text-zinc-600">{order.product.sku}</p>
                      </td>
                      <td className="px-4 py-2 text-zinc-500 font-mono">
                        {order.bom?.bomNumber ?? '—'}
                      </td>
                      <td className="px-4 py-2 text-zinc-300">
                        {order.quantity} {order.unitOfMeasure}
                      </td>
                      <td className="px-4 py-2 text-emerald-400 font-semibold">
                        {order.quantityFinished > 0 ? order.quantityFinished : '—'}
                      </td>
                      <td className="px-4 py-2 min-w-[80px]">
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden w-16">
                          <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-2 text-zinc-500">
                        {order.dueDate ? formatDate(order.dueDate) : '—'}
                      </td>
                      <td className="px-4 py-2">
                        <StatusChip status={order.status} />
                      </td>
                      <td className="px-4 py-2 text-zinc-400">{order.store.name}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  )
}
