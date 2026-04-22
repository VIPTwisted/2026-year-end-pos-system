export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Inbox } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    posted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    handled: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30'}`}>
      {status}
    </span>
  )
}

export default async function ICInboxPage() {
  const transactions = await prisma.intercompanyTransaction.findMany({
    where: { direction: 'receiving' },
    orderBy: { postingDate: 'desc' },
    include: { partner: { select: { id: true, partnerCode: true, partnerName: true } } },
    take: 100,
  })

  const pending = transactions.filter(t => t.status === 'pending')
  const handled = transactions.filter(t => t.status === 'handled')

  return (
    <>
      <TopBar title="IC Inbox" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Finance &rsaquo; Intercompany</p>
              <h2 className="text-xl font-bold text-zinc-100">IC Inbox</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Incoming intercompany transactions awaiting processing</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Pending</div>
                <div className="text-xl font-bold text-amber-400 tabular-nums">{pending.length}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Handled</div>
                <div className="text-xl font-bold text-emerald-400 tabular-nums">{handled.length}</div>
              </div>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-14 text-zinc-600">
              <Inbox className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-[13px]">IC Inbox is empty.</p>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Transaction No.', 'IC Partner', 'Document Type', 'Document No.', 'Amount', 'Currency', 'Posting Date', 'Status', 'Actions'].map(h => (
                        <th key={h} className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap ${h === 'Amount' ? 'text-right' : h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/finance/intercompany/${tx.id}`} className="font-mono text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
                            {tx.transactionNo ?? `IC-${tx.id.slice(-6).toUpperCase()}`}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-zinc-300">{tx.partner?.partnerCode ?? '—'}</td>
                        <td className="px-4 py-3 text-[12px] text-zinc-400 capitalize">{tx.documentType ?? tx.type}</td>
                        <td className="px-4 py-3 font-mono text-[12px] text-zinc-300">{tx.documentNo ?? '—'}</td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-zinc-200 tabular-nums">{formatCurrency(tx.amount)}</td>
                        <td className="px-4 py-3 text-[12px] text-zinc-400">{tx.currency}</td>
                        <td className="px-4 py-3 text-[12px] text-zinc-500">
                          {tx.postingDate ? new Date(tx.postingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                        <td className="px-4 py-3 text-right">
                          {tx.status === 'pending' && (
                            <div className="flex items-center justify-end gap-1">
                              <button className="h-6 px-2.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">
                                Handle
                              </button>
                              <button className="h-6 px-2.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors">
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2.5 border-t border-zinc-800/40 text-[11px] text-zinc-600">
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
