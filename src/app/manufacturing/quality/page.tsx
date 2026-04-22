import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { CheckSquare, Plus } from 'lucide-react'

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
    in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    passed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    failed: 'bg-red-500/10 text-red-400 border-red-500/30',
    closed: 'bg-zinc-700/40 text-zinc-500 border-zinc-600/40 opacity-60',
  }
  const cls = map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  const label: Record<string, string> = {
    open: 'Open', in_progress: 'In Progress', passed: 'Passed', failed: 'Failed', closed: 'Closed',
  }
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border ${cls}`}>
      {label[status] ?? status}
    </span>
  )
}

const TEST_TYPE_LABEL: Record<string, string> = {
  incoming: 'Incoming',
  in_process: 'In-Process',
  outgoing: 'Outgoing',
}

export default async function QualityOrdersPage() {
  const orders = await prisma.qualityOrder.findMany({
    include: {
      product: { select: { name: true, sku: true } },
      measurements: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const open = orders.filter(o => o.status === 'open').length
  const inProgress = orders.filter(o => o.status === 'in_progress').length
  const passed = orders.filter(o => o.status === 'passed').length
  const failed = orders.filter(o => o.status === 'failed').length
  const total = passed + failed
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : null

  const kpis = [
    { label: 'Open', value: open, color: 'text-zinc-300' },
    { label: 'In Progress', value: inProgress, color: 'text-blue-400' },
    { label: 'Passed', value: passed, color: 'text-emerald-400' },
    { label: passRate ? `Failed (${passRate}% pass)` : 'Failed', value: failed, color: failed > 0 ? 'text-red-400' : 'text-zinc-500' },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Quality Orders" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* Page header: title + count + New button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Quality Orders</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {orders.length}
            </span>
          </div>
          <Link href="/manufacturing/quality/new">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
              <Plus className="w-3.5 h-3.5" /> New Quality Order
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
            <p className="px-5 py-5 text-[13px] text-zinc-600">No quality orders yet.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['Order #', 'Product', 'Type', 'Qty', 'Sample', 'Assigned To', 'Due Date', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="py-2 border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2">
                      <Link href={`/manufacturing/quality/${o.id}`} className="font-mono text-[13px] text-blue-400 hover:text-blue-300 hover:underline">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-zinc-300">{o.product.name}</td>
                    <td className="px-4 py-2 text-zinc-500">{TEST_TYPE_LABEL[o.testType] ?? o.testType}</td>
                    <td className="px-4 py-2 text-zinc-400">{o.quantity}</td>
                    <td className="px-4 py-2 text-zinc-500">{o.sampleSize}</td>
                    <td className="px-4 py-2 text-zinc-400">{o.assignedTo ?? '—'}</td>
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
