export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Layers, GitBranch, ArrowLeft } from 'lucide-react'

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
    certified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    closed: 'bg-zinc-700/40 text-zinc-300 border-zinc-600/40 opacity-60',
  }
  const cls = map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${cls}`}>
      {status}
    </span>
  )
}

export default async function BOMRoutingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; status?: string }>
}) {
  const { tab = 'boms', status } = await searchParams

  const [boms, routings] = await Promise.all([
    prisma.productionBOM.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        outputProduct: { select: { name: true, sku: true } },
        _count: { select: { lines: true } },
      },
    }),
    prisma.routing.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { lines: true } } },
    }),
  ])

  const ALL_STATUSES = ['new', 'certified', 'closed']

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="BOMs & Routings" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        <Link
          href="/manufacturing"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Manufacturing
        </Link>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total BOMs', value: boms.length, color: 'text-blue-400' },
            { label: 'Certified BOMs', value: boms.filter(b => b.status === 'certified').length, color: 'text-emerald-400' },
            { label: 'Total Routings', value: routings.length, color: 'text-violet-400' },
            { label: 'Certified Routings', value: routings.filter(r => r.status === 'certified').length, color: 'text-amber-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 border-b border-zinc-800/50 pb-0">
          {[
            { id: 'boms', label: 'Bills of Material', icon: Layers },
            { id: 'routings', label: 'Routings', icon: GitBranch },
          ].map(({ id, label, icon: Icon }) => (
            <Link
              key={id}
              href={`/manufacturing/bom-routing?tab=${id}${status ? `&status=${status}` : ''}`}
              className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
                tab === id
                  ? 'border-blue-500 text-zinc-100'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Link
              href={tab === 'boms' ? '/manufacturing/boms/new' : '/manufacturing/routings/new'}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              + New {tab === 'boms' ? 'BOM' : 'Routing'}
            </Link>
          </div>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {['', ...ALL_STATUSES].map(s => (
            <Link
              key={s}
              href={s ? `/manufacturing/bom-routing?tab=${tab}&status=${s}` : `/manufacturing/bom-routing?tab=${tab}`}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                (s === '' && !status) || status === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {s || 'All'}
            </Link>
          ))}
        </div>

        {/* BOMs table */}
        {tab === 'boms' && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/30">
              <Layers className="w-4 h-4 text-zinc-400" />
              <h2 className="text-[13px] font-semibold text-zinc-200">Bills of Material</h2>
              <span className="ml-1 text-[11px] bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">{boms.length}</span>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['BOM No.', 'Description', 'Output Product', 'SKU', 'Components', 'Version', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {boms.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[13px] text-zinc-600">
                      No BOMs found.{' '}
                      <Link href="/manufacturing/boms/new" className="text-blue-400 hover:text-blue-300 hover:underline">Create one</Link>
                    </td>
                  </tr>
                ) : (
                  boms.map(bom => (
                    <tr key={bom.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-2.5">
                        <Link href={`/manufacturing/bom-routing/${bom.id}?type=bom`} className="font-mono text-[13px] text-blue-400 hover:text-blue-300 hover:underline">
                          {bom.bomNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-300">{bom.description}</td>
                      <td className="px-4 py-2.5 text-zinc-300">{bom.outputProduct?.name ?? <span className="text-zinc-600">—</span>}</td>
                      <td className="px-4 py-2.5 font-mono text-zinc-500 text-[11px]">{bom.outputProduct?.sku ?? '—'}</td>
                      <td className="px-4 py-2.5 text-zinc-400">{bom._count.lines}</td>
                      <td className="px-4 py-2.5 text-zinc-500">{bom.version ?? '1'}</td>
                      <td className="px-4 py-2.5"><StatusChip status={bom.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Routings table */}
        {tab === 'routings' && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/30">
              <GitBranch className="w-4 h-4 text-zinc-400" />
              <h2 className="text-[13px] font-semibold text-zinc-200">Routings</h2>
              <span className="ml-1 text-[11px] bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">{routings.length}</span>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['Routing No.', 'Description', 'Operations', 'Type', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {routings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[13px] text-zinc-600">
                      No routings found.{' '}
                      <Link href="/manufacturing/routings/new" className="text-blue-400 hover:text-blue-300 hover:underline">Create one</Link>
                    </td>
                  </tr>
                ) : (
                  routings.map(r => (
                    <tr key={r.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-2.5">
                        <Link href={`/manufacturing/routings/${r.id}`} className="font-mono text-[13px] text-blue-400 hover:text-blue-300 hover:underline">
                          {r.routingNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-300">{r.description}</td>
                      <td className="px-4 py-2.5 text-zinc-400">{r._count.lines}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize bg-zinc-700/40 text-zinc-400 border-zinc-600/40">
                          {r.type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5"><StatusChip status={r.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </main>
    </div>
  )
}
