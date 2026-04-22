import Link from 'next/link'
import { Hash, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getNoSeries() {
  try {
    const { prisma } = await import('@/lib/prisma')
    return await (prisma as any).numberSeries.findMany({ orderBy: { createdAt: 'asc' } })
  } catch {
    return []
  }
}

export default async function NoSeriesPage() {
  const series: any[] = await getNoSeries()

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto min-h-[100dvh]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            <Hash className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100">Number Series</h1>
            <p className="text-[11px] text-zinc-500">{series.length} series configured</p>
          </div>
        </div>
        <Link href="/admin/no-series/new"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors">
          <Plus className="w-3.5 h-3.5" /> New
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              {['Code','Description','Starting No.','Last No. Used','Default','Manual','Blocked'].map((h, i) => (
                <th key={i} className="pb-2 font-medium uppercase tracking-widest text-left pr-6">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {series.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-600">
                  No number series configured. Add series for documents like invoices, orders, etc.
                </td>
              </tr>
            )}
            {series.map((s: any) => (
              <tr key={s.id} className="hover:bg-zinc-800/20 transition-colors">
                <td className="py-2.5 pr-6 font-mono text-zinc-300">{s.code}</td>
                <td className="py-2.5 pr-6 text-zinc-200">{s.description}</td>
                <td className="py-2.5 pr-6 font-mono text-zinc-400">{s.startingNo || '—'}</td>
                <td className="py-2.5 pr-6 font-mono text-zinc-400">{s.lastNoUsed || '—'}</td>
                <td className="py-2.5 pr-6">
                  {s.defaultNos
                    ? <span className="text-emerald-400">✓</span>
                    : <span className="text-zinc-700">—</span>}
                </td>
                <td className="py-2.5 pr-6">
                  {s.manualNos
                    ? <span className="text-zinc-300">✓</span>
                    : <span className="text-zinc-700">—</span>}
                </td>
                <td className="py-2.5 pr-6">
                  {s.blocked
                    ? <span className="text-red-400">Blocked</span>
                    : <span className="text-zinc-700">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
