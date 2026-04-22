export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { TopBar } from '@/components/layout/TopBar'

export default async function TerritoriesPage() {
  const territories = await prisma.salesTerritory.findMany({
    orderBy: { code: 'asc' },
    include: { _count: { select: { salespeople: true } } },
  })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Sales Territories"
        breadcrumb={[{ label: 'Sales', href: '/sales/salespeople' }]}
        actions={
          <Link
            href="/sales/territories/new"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
          >
            + New Territory
          </Link>
        }
      />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Code</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Region</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Salespeople</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {territories.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500 text-sm">
                    No territories yet.{' '}
                    <Link href="/sales/territories/new" className="text-blue-400 hover:underline">
                      Create one
                    </Link>
                  </td>
                </tr>
              )}
              {territories.map(t => (
                <tr key={t.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/sales/territories/${t.id}`} className="font-mono text-sm text-blue-400 hover:text-blue-300 font-medium">
                      {t.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-200">{t.name}</td>
                  <td className="px-4 py-3 text-sm text-zinc-400">{t.region ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-zinc-400 max-w-xs truncate">{t.description ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-zinc-200 text-right tabular-nums font-semibold">
                    {t._count.salespeople}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${t.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
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
