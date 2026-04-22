import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Wrench, Clock, CheckCircle2, Package, DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_BADGE: Record<string, string> = {
  intake:    'bg-zinc-700/60 text-zinc-300',
  diagnosed: 'bg-blue-500/15 text-blue-400',
  in_repair: 'bg-amber-500/15 text-amber-400',
  ready:     'bg-emerald-500/15 text-emerald-400',
  completed: 'bg-zinc-800/80 text-zinc-500',
  cancelled: 'bg-red-500/15 text-red-400',
}

const PRIORITY_BADGE: Record<string, string> = {
  low:    'bg-zinc-700/40 text-zinc-500',
  normal: 'bg-blue-500/10 text-blue-400',
  high:   'bg-amber-500/15 text-amber-400',
  urgent: 'bg-red-500/15 text-red-400',
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    intake:    'Intake',
    diagnosed: 'Diagnosed',
    in_repair: 'In Repair',
    ready:     'Ready',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
  return map[s] ?? s
}

function daysIn(intakeAt: Date): number {
  return Math.floor((Date.now() - new Date(intakeAt).getTime()) / 86400000)
}

export default async function ServiceOrdersPage() {
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const [orders, completedToday, revenueToday] = await Promise.all([
    prisma.serviceOrder.findMany({
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
        technician: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.serviceOrder.count({
      where: { status: 'completed', completedAt: { gte: todayStart } },
    }),
    prisma.serviceOrder.findMany({
      where: { status: 'completed', completedAt: { gte: todayStart } },
      select: { totalCost: true },
    }),
  ])

  const totalRevToday = revenueToday.reduce(
    (sum, o) => sum + parseFloat(String(o.totalCost)),
    0
  )
  const inRepair = orders.filter(o => o.status === 'in_repair').length
  const readyForPickup = orders.filter(o => o.status === 'ready').length

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] flex flex-col">
      <TopBar
        title="Service Orders"
        breadcrumb={[{ label: 'Dashboard', href: '/' }]}
        actions={
          <Link
            href="/service-orders/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Service Order
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Orders</div>
            <div className="text-2xl font-bold text-zinc-100">{orders.length}</div>
            <div className="text-xs text-zinc-500 mt-1">all time</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1">
              <Wrench className="w-3 h-3" /> In Repair
            </div>
            <div className="text-2xl font-bold text-amber-400">{inRepair}</div>
            <div className="text-xs text-zinc-500 mt-1">active jobs</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1">
              <Package className="w-3 h-3" /> Ready
            </div>
            <div className="text-2xl font-bold text-emerald-400">{readyForPickup}</div>
            <div className="text-xs text-zinc-500 mt-1">awaiting pickup</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Completed Today
            </div>
            <div className="text-2xl font-bold text-zinc-100">{completedToday}</div>
            <div className="text-xs text-zinc-500 mt-1">today</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Revenue Today
            </div>
            <div className="text-2xl font-bold tabular-nums text-zinc-100">{formatCurrency(totalRevToday)}</div>
            <div className="text-xs text-zinc-500 mt-1">completed orders</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-zinc-100">All Service Orders</h2>
            <span className="text-[11px] text-zinc-500">{orders.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Order #</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Customer</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Device</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Issue</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Technician</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Priority</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Days In</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-zinc-500">
                      No service orders yet.{' '}
                      <Link href="/service-orders/new" className="text-blue-400 hover:text-blue-300">
                        Create one
                      </Link>
                    </td>
                  </tr>
                )}
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/service-orders/${order.id}`}
                        className="font-mono text-[12px] text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        {order.orderNo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-200">
                      {order.customer
                        ? `${order.customer.firstName} ${order.customer.lastName}`
                        : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {order.deviceType || <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400 max-w-[180px] truncate" title={order.issueReported}>
                      {order.issueReported}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {order.technician
                        ? `${order.technician.firstName} ${order.technician.lastName}`
                        : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_BADGE[order.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${PRIORITY_BADGE[order.priority] ?? 'bg-zinc-700 text-zinc-300'}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-zinc-400">
                      {daysIn(order.intakeAt)}d
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-sm text-zinc-100 tabular-nums">
                      {formatCurrency(parseFloat(String(order.totalCost)))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
