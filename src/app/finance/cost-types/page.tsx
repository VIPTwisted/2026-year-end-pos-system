export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Edit2 } from 'lucide-react'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

const TYPE_BADGE: Record<string, string> = {
  cost_type:   'bg-blue-500/10 text-blue-400',
  heading:     'bg-zinc-700 text-zinc-300',
  total:       'bg-purple-500/10 text-purple-400',
  begin_total: 'bg-amber-500/10 text-amber-400',
  end_total:   'bg-amber-500/10 text-amber-400',
}

const TYPE_LABELS: Record<string, string> = {
  cost_type:   'Cost Type',
  heading:     'Heading',
  total:       'Total',
  begin_total: 'Begin-Total',
  end_total:   'End-Total',
}

export default async function CostTypesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string }>
}) {
  const sp = await searchParams

  const costTypes = await prisma.costType.findMany({
    where: {
      ...(sp.search ? {
        OR: [
          { no: { contains: sp.search } },
          { name: { contains: sp.search } },
        ],
      } : {}),
      ...(sp.type ? { type: sp.type } : {}),
    },
    orderBy: { no: 'asc' },
  })

  const actions = (
    <div className="flex items-center gap-2">
      <Link
        href="/finance/cost-types/new"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> New
      </Link>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        <Edit2 className="w-3.5 h-3.5" /> Edit
      </button>
    </div>
  )

  return (
    <>
      <TopBar
        title="Cost Types"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Cost Accounting', href: '/finance/cost-accounting' },
        ]}
        actions={actions}
      />

      <div className="flex min-h-[100dvh] bg-[#0f0f1a]">
        {/* Filter Pane */}
        <aside className="w-60 shrink-0 border-r border-zinc-800/50 bg-[#0f0f1a] p-4 space-y-5">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Search</div>
            <form>
              <input
                name="search"
                defaultValue={sp.search ?? ''}
                placeholder="No. or Name…"
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[12px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
              />
              <input type="hidden" name="type" value={sp.type ?? ''} />
              <button type="submit" className="sr-only">Search</button>
            </form>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Type</div>
            <div className="space-y-1">
              {[
                { value: '', label: 'All Types' },
                { value: 'cost_type', label: 'Cost Type' },
                { value: 'heading', label: 'Heading' },
                { value: 'total', label: 'Total' },
                { value: 'begin_total', label: 'Begin-Total' },
                { value: 'end_total', label: 'End-Total' },
              ].map(opt => (
                <Link
                  key={opt.value}
                  href={`/finance/cost-types?type=${opt.value}&search=${sp.search ?? ''}`}
                  className={`block px-2 py-1.5 rounded text-[12px] transition-colors ${
                    (sp.type ?? '') === opt.value
                      ? 'bg-blue-600/20 text-blue-300'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Cost Types</div>
              <div className="text-2xl font-bold text-zinc-100">{costTypes.filter(c => c.type === 'cost_type').length}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Records</div>
              <div className="text-2xl font-bold text-zinc-100">{costTypes.length}</div>
            </div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">No.</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Type</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">G/L Account Range</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Blocked</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Net Change</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Balance</th>
                </tr>
              </thead>
              <tbody>
                {costTypes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-zinc-500">
                      No cost types found.
                    </td>
                  </tr>
                ) : (
                  costTypes.map((ct, idx) => (
                    <tr
                      key={ct.id}
                      className={`hover:bg-zinc-800/30 transition-colors ${idx !== costTypes.length - 1 ? 'border-b border-zinc-800/40' : ''} ${
                        ct.type === 'heading' ? 'bg-zinc-900/30' : ''
                      }`}
                    >
                      <td className="px-4 py-2.5" style={{ paddingLeft: `${16 + ct.indentation * 16}px` }}>
                        <Link
                          href={`/finance/cost-types/${ct.id}`}
                          className={`font-mono text-[12px] ${ct.type === 'heading' ? 'text-zinc-300 font-semibold' : 'text-blue-400 hover:text-blue-300'}`}
                        >
                          {ct.no}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/finance/cost-types/${ct.id}`}
                          className={`${ct.type === 'heading' ? 'text-zinc-100 font-semibold' : 'text-zinc-200 hover:text-zinc-100'}`}
                        >
                          {ct.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${TYPE_BADGE[ct.type] ?? 'bg-zinc-700 text-zinc-400'}`}>
                          {TYPE_LABELS[ct.type] ?? ct.type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-500 font-mono text-[11px]">{ct.glAccountRange ?? '—'}</td>
                      <td className="px-4 py-2.5 text-center">
                        {ct.blocked ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400">Yes</span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-zinc-400">{formatCurrency(ct.netChange)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-zinc-200">{formatCurrency(ct.balance)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-[12px] text-zinc-500">{costTypes.length} records</div>
        </main>
      </div>
    </>
  )
}
