export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Plus, Send } from 'lucide-react'

function fmt(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

const STATUS_COLORS: Record<string, string> = {
  Open: 'bg-amber-500/15 text-amber-400',
  Submitted: 'bg-blue-500/15 text-blue-400',
  Accepted: 'bg-emerald-500/15 text-emerald-400',
}

export default async function VatReturnsPage() {
  const returns = await prisma.vatReturn.findMany({
    orderBy: { startDate: 'desc' },
  })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="VAT Returns" />
      <main className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link
            href="/finance/vat-returns/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Period
          </Link>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16213e] hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors border border-zinc-700">
            <Send className="w-3.5 h-3.5" /> Submit
          </button>
        </div>

        <div className="bg-[#16213e] border border-zinc-700 rounded-lg p-4 flex items-center gap-8">
          <div>
            <p className="text-xs text-zinc-500">Total Returns</p>
            <p className="text-lg font-semibold text-zinc-100">{returns.length}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Open</p>
            <p className="text-lg font-semibold text-amber-400">{returns.filter(r => r.status === 'Open').length}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Submitted</p>
            <p className="text-lg font-semibold text-blue-400">{returns.filter(r => r.status === 'Submitted').length}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Accepted</p>
            <p className="text-lg font-semibold text-emerald-400">{returns.filter(r => r.status === 'Accepted').length}</p>
          </div>
        </div>

        <div className="bg-[#16213e] border border-zinc-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 bg-zinc-900/60">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Return Period</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Start Date</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">End Date</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Status</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-400">Total VAT Due</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-400">Net VAT Due</th>
              </tr>
            </thead>
            <tbody>
              {returns.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-500 text-sm">No VAT returns found.</td></tr>
              )}
              {returns.map((r, i) => (
                <tr key={r.id} className={`border-b border-zinc-800 hover:bg-zinc-800/40 transition-colors ${i % 2 === 0 ? '' : 'bg-zinc-900/20'}`}>
                  <td className="px-4 py-2.5">
                    <Link href={`/finance/vat-returns/${r.id}`} className="text-blue-400 hover:underline text-xs font-mono">{r.returnPeriod}</Link>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-300 text-xs">{fmt(r.startDate)}</td>
                  <td className="px-4 py-2.5 text-zinc-300 text-xs">{fmt(r.endDate)}</td>
                  <td className="px-4 py-2.5 text-xs">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_COLORS[r.status] ?? 'bg-zinc-700/50 text-zinc-400'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-zinc-300 text-xs font-mono">{fmtCurrency(r.totalVatDue)}</td>
                  <td className={`px-4 py-2.5 text-right text-xs font-mono font-semibold ${r.netVatDue >= 0 ? 'text-zinc-300' : 'text-emerald-400'}`}>
                    {fmtCurrency(r.netVatDue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
