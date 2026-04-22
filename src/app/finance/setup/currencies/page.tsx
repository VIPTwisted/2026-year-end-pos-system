export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Plus, RefreshCw } from 'lucide-react'

function fmt(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default async function FinanceCurrenciesPage() {
  const currencies = await prisma.financeCurrency.findMany({ orderBy: { code: 'asc' } })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Currencies" />
      <main className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link
            href="/finance/setup/currencies/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </Link>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16213e] hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors border border-zinc-700">
            <RefreshCw className="w-3.5 h-3.5" /> Update Exchange Rates
          </button>
        </div>

        <div className="bg-[#16213e] border border-zinc-700 rounded-lg p-4">
          <p className="text-xs text-zinc-400">{currencies.length} Currenc{currencies.length !== 1 ? 'ies' : 'y'}</p>
        </div>

        <div className="bg-[#16213e] border border-zinc-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 bg-zinc-900/60">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Description</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-400">Exchange Rate Amount</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-400">Relational Exch. Rate Amount</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Last Date Modified</th>
              </tr>
            </thead>
            <tbody>
              {currencies.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500 text-sm">No currencies found.</td></tr>
              )}
              {currencies.map((c, i) => (
                <tr key={c.id} className={`border-b border-zinc-800 hover:bg-zinc-800/40 transition-colors ${i % 2 === 0 ? '' : 'bg-zinc-900/20'}`}>
                  <td className="px-4 py-2.5">
                    <Link href={`/finance/setup/currencies/new?id=${c.id}`} className="text-blue-400 hover:underline font-mono text-xs font-bold">{c.code}</Link>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-300 text-xs">{c.description ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right text-zinc-300 text-xs font-mono">{c.exchangeRateAmount.toFixed(6)}</td>
                  <td className="px-4 py-2.5 text-right text-zinc-300 text-xs font-mono">{c.relationalExchRateAmt.toFixed(6)}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-xs">{fmt(c.lastDateModified)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
