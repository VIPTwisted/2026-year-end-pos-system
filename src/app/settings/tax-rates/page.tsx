import { prisma } from '@/lib/prisma'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { ArrowLeft, Plus, Star, Percent } from 'lucide-react'

export default async function TaxRatesPage() {
  const taxCodes = await prisma.taxCode.findMany({ orderBy: { name: 'asc' } })

  const highest = taxCodes.length > 0
    ? Math.max(...taxCodes.map((t) => t.rate))
    : null

  const activeCodes = taxCodes.filter((t) => t.isActive)
  const defaultCode = taxCodes.find((t) => t.taxType === 'sales' && t.isActive) ?? taxCodes[0] ?? null

  return (
    <>
      <TopBar title="Tax Rates" />

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="px-6 py-4 space-y-6 max-w-7xl">

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/settings"
                className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Settings
              </Link>
              <span className="text-zinc-700">/</span>
              <h2 className="text-base font-semibold text-zinc-100">Tax Rates</h2>
            </div>
            <Link
              href="/settings/tax-rates/new"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Tax Rate
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Rates</div>
              <div className="text-2xl font-bold text-zinc-100">{taxCodes.length}</div>
              <div className="text-xs text-zinc-500 mt-1">{activeCodes.length} active</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Primary Rate</div>
              <div className="text-2xl font-bold text-zinc-100">
                {defaultCode ? `${defaultCode.rate.toFixed(4)}%` : '—'}
              </div>
              <div className="text-xs text-zinc-500 mt-1">{defaultCode?.name ?? 'None configured'}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Highest Rate</div>
              <div className="text-2xl font-bold text-zinc-100">
                {highest !== null ? `${highest.toFixed(4)}%` : '—'}
              </div>
              <div className="text-xs text-zinc-500 mt-1">across all codes</div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Code</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Rate</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Type</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Primary</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {taxCodes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-zinc-500">
                      No tax rates configured. <Link href="/settings/tax-rates/new" className="text-blue-400 hover:underline">Add one</Link>.
                    </td>
                  </tr>
                ) : (
                  taxCodes.map((code, idx) => (
                    <tr key={code.id} className={`border-b border-zinc-800 hover:bg-zinc-800/20 transition-colors ${idx % 2 === 0 ? '' : 'bg-zinc-800/10'}`}>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">{code.code}</td>
                      <td className="px-4 py-3 text-sm text-zinc-200 font-medium">{code.name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums text-emerald-400">
                          <Percent className="w-3 h-3" />
                          {code.rate.toFixed(4)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 capitalize">
                          {code.taxType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500 max-w-xs truncate">{code.description ?? '—'}</td>
                      <td className="px-4 py-3">
                        {defaultCode?.id === code.id ? (
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        ) : (
                          <span className="text-zinc-700">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          code.isActive
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-zinc-700 text-zinc-400'
                        }`}>
                          {code.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/settings/tax-rates/${code.id}`}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </>
  )
}
