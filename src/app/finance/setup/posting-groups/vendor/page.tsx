export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default async function VendorPostingGroupsPage() {
  const groups = await prisma.vendorPostingGroup.findMany({ orderBy: { code: 'asc' } })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Vendor Posting Groups" />
      <main className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link
            href="/finance/setup/posting-groups/vendor/new"
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
          <p className="text-xs text-zinc-400">{groups.length} Vendor Posting Group{groups.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-[#16213e] border border-zinc-700 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-700 bg-zinc-900/60">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Description</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Payables Account</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Pmt. Disc. Debit Acc.</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Pmt. Disc. Credit Acc.</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Invoice Rounding Account</th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-500 text-sm">No vendor posting groups found.</td></tr>
              )}
              {groups.map((g, i) => (
                <tr key={g.id} className={`border-b border-zinc-800 hover:bg-zinc-800/40 transition-colors ${i % 2 === 0 ? '' : 'bg-zinc-900/20'}`}>
                  <td className="px-4 py-2.5">
                    <Link href={`/finance/setup/posting-groups/vendor/new?id=${g.id}`} className="text-blue-400 hover:underline font-mono text-xs">{g.code}</Link>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-300 text-xs">{g.description ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-xs font-mono">{g.payablesAccount ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-xs font-mono">{g.paymentDiscDebitAcc ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-xs font-mono">{g.paymentDiscCreditAcc ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-xs font-mono">{g.invoiceRoundingAccount ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
