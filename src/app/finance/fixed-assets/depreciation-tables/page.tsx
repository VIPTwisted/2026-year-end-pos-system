export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { Plus } from 'lucide-react'

const SAMPLE_TABLES = [
  { id: '1', code: 'DT-5YR',   description: '5-Year Custom Schedule',  lines: 5,  book: 'BOOK-TAX',  totalPct: 100 },
  { id: '2', code: 'DT-MACRS5', description: 'MACRS 5-Year',           lines: 6,  book: 'BOOK-TAX',  totalPct: 100 },
  { id: '3', code: 'DT-MACRS7', description: 'MACRS 7-Year',           lines: 8,  book: 'BOOK-TAX',  totalPct: 100 },
  { id: '4', code: 'DT-UOP',    description: 'Units of Production',    lines: 10, book: 'BOOK-GAAP', totalPct: 100 },
]

const MACRS5_RATES = [20.00, 32.00, 19.20, 11.52, 11.52, 5.76]

export default function DepreciationTablesPage() {
  return (
    <>
      <TopBar
        title="Depreciation Tables"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Fixed Assets', href: '/finance/fixed-assets' },
          { label: 'Depreciation Books', href: '/finance/fixed-assets/depreciation-books' },
        ]}
        actions={
          <Link
            href="/finance/fixed-assets/depreciation-tables/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Table
          </Link>
        }
      />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6 space-y-6">
        {/* Tables list */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
            <h2 className="text-[13px] font-semibold text-zinc-200">Table Library</h2>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Code</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Depreciation Book</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Lines</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Total %</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_TABLES.map((t, idx) => (
                <tr key={t.id} className={`hover:bg-zinc-800/30 transition-colors ${idx !== SAMPLE_TABLES.length - 1 ? 'border-b border-zinc-800/40' : ''}`}>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-blue-400">{t.code}</td>
                  <td className="px-4 py-2.5 text-zinc-200">{t.description}</td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-400">{t.book}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-zinc-300">{t.lines}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-emerald-400">{t.totalPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Example: MACRS 5-Year detail */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
            <h2 className="text-[13px] font-semibold text-zinc-200">Example: MACRS 5-Year (DT-MACRS5)</h2>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Year</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Depreciation %</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Cumulative %</th>
              </tr>
            </thead>
            <tbody>
              {MACRS5_RATES.map((rate, idx) => (
                <tr key={idx} className={`hover:bg-zinc-800/30 transition-colors ${idx !== MACRS5_RATES.length - 1 ? 'border-b border-zinc-800/40' : ''}`}>
                  <td className="px-4 py-2 text-zinc-400">Year {idx + 1}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-zinc-200 font-semibold">{rate.toFixed(2)}%</td>
                  <td className="px-4 py-2 text-right tabular-nums text-zinc-400">
                    {MACRS5_RATES.slice(0, idx + 1).reduce((s, r) => s + r, 0).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
