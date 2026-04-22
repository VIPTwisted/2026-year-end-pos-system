export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Plus, Edit2 } from 'lucide-react'

const CALC_TYPE_COLORS: Record<string, string> = {
  Normal: 'bg-blue-500/15 text-blue-400',
  ReverseCharge: 'bg-amber-500/15 text-amber-400',
  FullVAT: 'bg-purple-500/15 text-purple-400',
  NoTaxableVAT: 'bg-zinc-500/20 text-zinc-400',
}

export default async function VatPostingSetupPage() {
  const setups = await prisma.vatPostingSetup.findMany({
    orderBy: [{ vatBusPostingGroup: 'asc' }, { vatProdPostingGroup: 'asc' }],
  })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="VAT Posting Setup" />
      <main className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link
            href="/finance/setup/vat-posting/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </Link>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16213e] hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors border border-zinc-700">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        <div className="bg-[#16213e] border border-zinc-700 rounded-lg p-4">
          <p className="text-xs text-zinc-400">{setups.length} VAT Posting Setup combination{setups.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-[#16213e] border border-zinc-700 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-700 bg-zinc-900/60">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">VAT Bus. Posting Group</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">VAT Prod. Posting Group</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-400">VAT %</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">VAT Calculation Type</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Sales VAT Account</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Purchase VAT Account</th>
              </tr>
            </thead>
            <tbody>
              {setups.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-500 text-sm">No VAT posting setups found.</td></tr>
              )}
              {setups.map((s, i) => (
                <tr key={s.id} className={`border-b border-zinc-800 hover:bg-zinc-800/40 transition-colors ${i % 2 === 0 ? '' : 'bg-zinc-900/20'}`}>
                  <td className="px-4 py-2.5">
                    <Link href={`/finance/setup/vat-posting/new?id=${s.id}`} className="text-blue-400 hover:underline font-mono text-xs">{s.vatBusPostingGroup || '—'}</Link>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-300 text-xs font-mono">{s.vatProdPostingGroup || '—'}</td>
                  <td className="px-4 py-2.5 text-right text-zinc-300 text-xs font-mono">{s.vatPercent.toFixed(2)}%</td>
                  <td className="px-4 py-2.5 text-xs">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${CALC_TYPE_COLORS[s.vatCalculationType] ?? 'bg-zinc-700/50 text-zinc-400'}`}>
                      {s.vatCalculationType}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-400 text-xs font-mono">{s.salesVatAccount ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-xs font-mono">{s.purchaseVatAccount ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
