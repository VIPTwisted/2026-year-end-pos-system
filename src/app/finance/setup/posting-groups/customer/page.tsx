export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default async function CustomerPostingGroupsPage() {
  const groups = await prisma.customerPostingGroup.findMany({ orderBy: { code: 'asc' } })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Customer Posting Groups" />
      <main className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link
            href="/finance/setup/posting-groups/customer/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </Link>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16213e] hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors border border-zinc-700">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16213e] hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors border border-zinc-700">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>

        <div className="bg-[#16213e] border border-zinc-700 rounded-lg p-4">
          <p className="text-xs text-zinc-400">{groups.length} Customer Posting Group{groups.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-[#16213e] border border-zinc-700 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-zinc-700 bg-zinc-900/60">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Description</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Receivables Account</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Pmt. Disc. Debit Acc.</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Pmt. Disc. Credit Acc.</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Interest Account</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Add. Fee Account</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Debit Rounding Acc.</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Credit Rounding Acc.</th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-500 text-sm">No customer posting groups found.</td></tr>
              )}
              {groups.map((g, i) => (
                <tr key={g.id} className={`border-b border-zinc-800 hover:bg-zinc-800/40 transition-colors ${i % 2 === 0 ? '' : 'bg-zinc-900/20'}`}>
                  <td className="px-4 py-2.5">
                    <Link href={`/finance/setup/posting-groups/customer/new?id=${g.id}`} className="text-blue-400 hover:underline font-mono text-xs">{g.code}</Link>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-300 text-xs">{g.description ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-xs font-mono">{g.receivablesAccount ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-xs font-mono">{g.paymentDiscDebitAcc ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-xs font-mono">{g.paymentDiscCreditAcc ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-xs font-mono">{g.interestAccount ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-xs font-mono">{g.additionalFeeAccount ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-xs font-mono">{g.debitRoundingAcc ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-xs font-mono">{g.creditRoundingAcc ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
