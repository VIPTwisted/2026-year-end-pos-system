export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, CheckCircle, HandshakeIcon } from 'lucide-react'

function formatDate(d: Date | string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
}

const TYPE_LABELS: Record<string, string> = {
  sales_price:        'Sales Price',
  purchase_price:     'Purchase Price',
  sales_line_disc:    'Sales Line Disc.',
  purch_line_disc:    'Purch. Line Disc.',
}

const TYPE_COLORS: Record<string, string> = {
  sales_price:        'bg-blue-500/10 text-blue-400',
  purchase_price:     'bg-emerald-500/10 text-emerald-400',
  sales_line_disc:    'bg-purple-500/10 text-purple-400',
  purch_line_disc:    'bg-amber-500/10 text-amber-400',
}

export default async function TradeAgreementsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; search?: string; active?: string }>
}) {
  const sp = await searchParams

  const agreements = await prisma.tradeAgreement.findMany({
    where: {
      ...(sp.type ? { type: sp.type } : {}),
      ...(sp.active !== undefined ? { isActive: sp.active === '1' } : {}),
      ...(sp.search
        ? {
            OR: [
              { journalNumber: { contains: sp.search } },
              { description: { contains: sp.search } },
            ],
          }
        : {}),
    },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true } },
      vendor:   { select: { id: true, name: true } },
      _count:   { select: { lines: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 300,
  })

  const activeCount = agreements.filter(a => a.isActive).length

  const actions = (
    <div className="flex items-center gap-2">
      <Link
        href="/supply-chain/trade-agreements/new"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> New
      </Link>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[12px] font-medium rounded transition-colors">
        <CheckCircle className="w-3.5 h-3.5" /> Activate
      </button>
    </div>
  )

  return (
    <>
      <TopBar
        title="Trade Agreements"
        breadcrumb={[{ label: 'Supply Chain', href: '/supply-chain' }]}
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
                placeholder="Journal No. or Description…"
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[12px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
              />
              <input type="hidden" name="type"   value={sp.type   ?? ''} />
              <input type="hidden" name="active" value={sp.active ?? ''} />
              <button type="submit" className="sr-only">Search</button>
            </form>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Relation</div>
            <div className="space-y-1">
              {[
                { value: '', label: 'All' },
                { value: 'sales_price',     label: 'Sales Price' },
                { value: 'purchase_price',  label: 'Purchase Price' },
                { value: 'sales_line_disc', label: 'Sales Line Disc.' },
                { value: 'purch_line_disc', label: 'Purch. Line Disc.' },
              ].map(opt => (
                <Link
                  key={opt.value}
                  href={`/supply-chain/trade-agreements?type=${opt.value}&search=${sp.search ?? ''}&active=${sp.active ?? ''}`}
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
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Status</div>
            <div className="space-y-1">
              {[
                { value: '', label: 'All' },
                { value: '1', label: 'Active' },
                { value: '0', label: 'Inactive' },
              ].map(opt => (
                <Link
                  key={opt.value}
                  href={`/supply-chain/trade-agreements?type=${sp.type ?? ''}&search=${sp.search ?? ''}&active=${opt.value}`}
                  className={`block px-2 py-1.5 rounded text-[12px] transition-colors ${
                    (sp.active ?? '') === opt.value
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

        {/* Main */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Agreements</div>
              <div className="text-2xl font-bold text-zinc-100">{agreements.length}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Active</div>
              <div className="text-2xl font-bold text-emerald-400">{activeCount}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Sales Price</div>
              <div className="text-2xl font-bold text-zinc-100">{agreements.filter(a => a.type === 'sales_price').length}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Purchase Price</div>
              <div className="text-2xl font-bold text-zinc-100">{agreements.filter(a => a.type === 'purchase_price').length}</div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Journal No.</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Relation</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Account Code</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Starting Date</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Ending Date</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Lines</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Active</th>
                </tr>
              </thead>
              <tbody>
                {agreements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-zinc-500">
                      No trade agreements.{' '}
                      <Link href="/supply-chain/trade-agreements/new" className="text-blue-400 hover:underline">Create one</Link>
                    </td>
                  </tr>
                ) : (
                  agreements.map((ag, idx) => {
                    const acctLabel = ag.customer
                      ? `${ag.customer.firstName} ${ag.customer.lastName}`
                      : ag.vendor?.name ?? '—'
                    return (
                      <tr
                        key={ag.id}
                        className={`hover:bg-zinc-800/30 transition-colors ${idx !== agreements.length - 1 ? 'border-b border-zinc-800/40' : ''}`}
                      >
                        <td className="px-4 py-2.5">
                          <Link href={`/supply-chain/trade-agreements/new?edit=${ag.id}`} className="font-mono text-[12px] text-blue-400 hover:text-blue-300">
                            {ag.journalNumber ?? `TA-${ag.id.slice(-6).toUpperCase()}`}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${TYPE_COLORS[ag.type] ?? 'bg-zinc-700 text-zinc-400'}`}>
                            {TYPE_LABELS[ag.type] ?? ag.type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-zinc-200">{ag.description ?? '—'}</td>
                        <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{acctLabel}</td>
                        <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{formatDate(ag.startDate)}</td>
                        <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{formatDate(ag.endDate)}</td>
                        <td className="px-4 py-2.5 text-right text-zinc-300 tabular-nums">{ag._count.lines}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`w-2 h-2 rounded-full inline-block ${ag.isActive ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-[12px] text-zinc-500">{agreements.length} records</div>
        </main>
      </div>
    </>
  )
}
