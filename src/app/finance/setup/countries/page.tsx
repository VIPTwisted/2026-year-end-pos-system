export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Plus, Edit2 } from 'lucide-react'

export default async function FinanceCountriesPage() {
  const countries = await prisma.financeCountry.findMany({ orderBy: { code: 'asc' } })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Countries/Regions" />
      <main className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link
            href="/finance/setup/countries/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </Link>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16213e] hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors border border-zinc-700">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        <div className="bg-[#16213e] border border-zinc-700 rounded-lg p-4">
          <p className="text-xs text-zinc-400">{countries.length} Countr{countries.length !== 1 ? 'ies' : 'y'}/Region{countries.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-[#16213e] border border-zinc-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 bg-zinc-900/60">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">EU Country/Region Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">VAT Scheme</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Intrastat Code</th>
              </tr>
            </thead>
            <tbody>
              {countries.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500 text-sm">No countries/regions found.</td></tr>
              )}
              {countries.map((c, i) => (
                <tr key={c.id} className={`border-b border-zinc-800 hover:bg-zinc-800/40 transition-colors ${i % 2 === 0 ? '' : 'bg-zinc-900/20'}`}>
                  <td className="px-4 py-2.5">
                    <Link href={`/finance/setup/countries/new?id=${c.id}`} className="text-blue-400 hover:underline font-mono text-xs font-bold">{c.code}</Link>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-300 text-xs">{c.name}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-xs font-mono">{c.euCountryCode ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-xs">{c.vatScheme ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-xs font-mono">{c.intrastatCode ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
