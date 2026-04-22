export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeftRight, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    open:      'bg-blue-500/10 text-blue-400 border-blue-500/30',
    draft:     'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
    released:  'bg-amber-500/10 text-amber-400 border-amber-500/30',
    shipped:   'bg-purple-500/10 text-purple-400 border-purple-500/30',
    received:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    cancelled: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
  }
  const cls = map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${cls}`}>
      {status}
    </span>
  )
}

export default async function TransferOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const { status = 'open', search } = await searchParams

  const statusFilter = status === 'all' ? {} : { status }
  const searchFilter = search
    ? { OR: [{ orderNumber: { contains: search } }, { transferNumber: { contains: search } }] }
    : {}

  const transfers = await prisma.transferOrder.findMany({
    where: { ...statusFilter, ...searchFilter },
    include: {
      fromStore: { select: { name: true } },
      toStore:   { select: { name: true } },
      _count:    { select: { lines: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const tabs = [
    { label: 'Open',      value: 'open' },
    { label: 'Released',  value: 'released' },
    { label: 'Shipped',   value: 'shipped' },
    { label: 'Received',  value: 'received' },
    { label: 'All',       value: 'all' },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Transfer Orders" />
      <main className="flex-1 p-6 space-y-5">

        {/* Ribbon */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-1 bg-zinc-900/60 border border-zinc-800/50 rounded-lg p-1">
            {tabs.map(t => (
              <Link key={t.value} href={`/warehouse/transfers?status=${t.value}${search ? `&search=${search}` : ''}`}>
                <button className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${status === t.value ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'}`}>
                  {t.label}
                </button>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <form method="GET">
              <input
                name="search"
                defaultValue={search ?? ''}
                placeholder="Search No…"
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500 w-48"
              />
              <input type="hidden" name="status" value={status} />
            </form>
            <Link href="/warehouse/transfers/new">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-zinc-800/30 bg-zinc-900/20">
            <span className="text-xs text-zinc-500">{transfers.length} record{transfers.length !== 1 ? 's' : ''}</span>
          </div>
          {transfers.length === 0 ? (
            <div className="p-12 text-center">
              <ArrowLeftRight className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-[13px]">No transfer orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                    <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">No.</th>
                    <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Transfer-from</th>
                    <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Transfer-to</th>
                    <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">In-Transit</th>
                    <th className="text-center px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Status</th>
                    <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Shipment Date</th>
                    <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Receipt Date</th>
                    <th className="text-right px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Lines</th>
                    <th className="w-6 px-2" />
                  </tr>
                </thead>
                <tbody>
                  {transfers.map(t => (
                    <tr key={t.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-2">
                        <Link href={`/warehouse/transfers/${t.id}`} className="font-mono text-[13px] font-semibold text-blue-400 hover:text-blue-300 hover:underline">
                          {t.transferNumber ?? t.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-zinc-300">{t.fromStore?.name ?? '—'}</td>
                      <td className="px-4 py-2 text-zinc-300">{t.toStore?.name ?? '—'}</td>
                      <td className="px-4 py-2 text-zinc-400 font-mono text-xs">{t.inTransitCode ?? '—'}</td>
                      <td className="px-4 py-2 text-center">
                        <StatusChip status={t.status} />
                      </td>
                      <td className="px-4 py-2 text-zinc-400">{t.shipmentDate ? formatDate(t.shipmentDate) : '—'}</td>
                      <td className="px-4 py-2 text-zinc-400">{t.receiptDate ? formatDate(t.receiptDate) : '—'}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-zinc-300">{t._count.lines}</td>
                      <td className="px-2 py-2 text-zinc-600">›</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
