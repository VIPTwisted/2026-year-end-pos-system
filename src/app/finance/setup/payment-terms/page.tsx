export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Plus, Edit2 } from 'lucide-react'

export default async function PaymentTermsPage() {
  const terms = await prisma.paymentTerm.findMany({ orderBy: { code: 'asc' } })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Payment Terms" />
      <main className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link
            href="/finance/setup/payment-terms/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </Link>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16213e] hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors border border-zinc-700">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        <div className="bg-[#16213e] border border-zinc-700 rounded-lg p-4">
          <p className="text-xs text-zinc-400">{terms.length} Payment Term{terms.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-[#16213e] border border-zinc-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 bg-zinc-900/60">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Description</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Due Date Calculation</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Discount Date Calculation</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-400">Discount %</th>
              </tr>
            </thead>
            <tbody>
              {terms.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500 text-sm">No payment terms found.</td></tr>
              )}
              {terms.map((t, i) => (
                <tr key={t.id} className={`border-b border-zinc-800 hover:bg-zinc-800/40 transition-colors ${i % 2 === 0 ? '' : 'bg-zinc-900/20'}`}>
                  <td className="px-4 py-2.5">
                    <Link href={`/finance/setup/payment-terms/new?id=${t.id}`} className="text-blue-400 hover:underline font-mono text-xs">{t.code}</Link>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-300 text-xs">{t.description ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-300 text-xs font-mono">{t.dueDateCalculation ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-300 text-xs font-mono">{t.discountDateCalculation ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right text-zinc-300 text-xs font-mono">{t.discountPercent.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
