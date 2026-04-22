export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Building2, Plus } from 'lucide-react'

export default async function ICPartnersPage() {
  const partners = await prisma.intercompanyPartner.findMany({
    orderBy: { partnerCode: 'asc' },
    include: { _count: { select: { transactions: true } } },
  })

  return (
    <>
      <TopBar title="IC Partners" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Finance &rsaquo; Intercompany</p>
              <h2 className="text-xl font-bold text-zinc-100">IC Partners</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Related entities for intercompany transactions</p>
            </div>
            <Link href="/finance/intercompany/partners/new">
              <button className="h-8 px-4 rounded text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />New Partner
              </button>
            </Link>
          </div>

          {partners.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-14 text-zinc-600">
              <Building2 className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-[13px]">No IC partners defined yet.</p>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Code', 'Company Name', 'IC Partner Type', 'Inbox Type', 'Inbox Details', 'Outbox Type', 'Auto Accept', 'Currency', 'Transactions'].map(h => (
                        <th key={h} className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap ${h === 'Transactions' || h === 'Auto Accept' ? 'text-center' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {partners.map(p => (
                      <tr key={p.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-[13px] font-semibold text-blue-400">{p.partnerCode}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-200">{p.partnerName ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {p.partnerType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-zinc-400">{p.inboxType}</td>
                        <td className="px-4 py-3 text-[12px] text-zinc-500 max-w-[160px] truncate">{p.inboxDetails ?? '—'}</td>
                        <td className="px-4 py-3 text-[12px] text-zinc-400">{p.outboxType}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[11px] font-medium ${p.autoAcceptTxns ? 'text-emerald-400' : 'text-zinc-600'}`}>
                            {p.autoAcceptTxns ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-zinc-400">{p.currency}</td>
                        <td className="px-4 py-3 text-center text-[12px] tabular-nums text-zinc-400">
                          {p._count.transactions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2.5 border-t border-zinc-800/40 text-[11px] text-zinc-600">
                {partners.length} partner{partners.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
