import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { ArrowLeftRight, Plus, ArrowRight, Package } from 'lucide-react'

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
    released: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    shipped: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    received: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    closed: 'bg-zinc-700/40 text-zinc-500 border-zinc-600/40 opacity-60',
  }
  const cls = map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${cls}`}>
      {status}
    </span>
  )
}

export default async function TransfersPage() {
  const transfers = await prisma.transferOrder.findMany({
    include: {
      fromStore: { select: { name: true } },
      toStore: { select: { name: true } },
      lines: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const open = transfers.filter(t => t.status === 'open').length
  const inTransit = transfers.filter(t => t.status === 'shipped').length
  const receivedThisMonth = transfers.filter(
    t => t.status === 'received' && t.receiptDate && new Date(t.receiptDate) >= startOfMonth
  ).length
  const totalLines = transfers.reduce((s, t) => s + t.lines.length, 0)

  const kpis = [
    { label: 'Open Transfers', value: open, color: 'text-blue-400' },
    { label: 'In Transit', value: inTransit, color: 'text-amber-400' },
    { label: 'Received This Month', value: receivedThisMonth, color: 'text-emerald-400' },
    { label: 'Total Lines', value: totalLines, color: 'text-zinc-300' },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Transfer Orders" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* Page header: title + count + New button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Transfer Orders</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {transfers.length}
            </span>
          </div>
          <Link href="/supply-chain/transfers/new">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
              <Plus className="w-3.5 h-3.5" /> New Transfer
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
          {transfers.length === 0 ? (
            <p className="px-5 py-5 text-[13px] text-zinc-600">No transfer orders yet.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['Transfer #', 'Route', 'Lines', 'Status', 'Shipment Date'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transfers.map(t => (
                  <tr key={t.id} className="py-2 border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2">
                      <Link href={`/supply-chain/transfers/${t.id}`} className="font-mono text-[13px] text-blue-400 hover:text-blue-300 hover:underline">
                        {t.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <span>{t.fromStore.name}</span>
                        <ArrowRight className="w-3 h-3 text-zinc-600" />
                        <span>{t.toStore.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center gap-1 text-zinc-400">
                        <Package className="w-3 h-3" />
                        {t.lines.length}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <StatusChip status={t.status} />
                    </td>
                    <td className="px-4 py-2 text-zinc-500">
                      {t.shipmentDate ? formatDate(t.shipmentDate) : '—'}
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
