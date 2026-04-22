export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Database, ArrowRight, RotateCcw } from 'lucide-react'

function fmt(d: Date | string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const SOURCE_CLS: Record<string, string> = {
  GENJNL: 'bg-blue-500/10 text-blue-400',
  PAYJNL: 'bg-violet-500/10 text-violet-400',
  CASHREC: 'bg-emerald-500/10 text-emerald-400',
  ASSETS: 'bg-amber-500/10 text-amber-400',
}

export default async function GlRegistersPage() {
  let registers: {
    id: string
    registerNo: number
    creationDate: Date
    sourceCode: string
    userId: string | null
    fromEntryNo: number
    toEntryNo: number
    journalBatch: string | null
    createdAt: Date
    updatedAt: Date
  }[] = []

  try {
    registers = await (prisma as any).glRegister.findMany({
      orderBy: { registerNo: 'desc' },
      take: 200,
    })
  } catch {
    // Table may not exist yet — show empty state
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="G/L Registers"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">
              <ArrowRight className="w-3 h-3" /> Navigate
            </button>
            <button className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">
              <RotateCcw className="w-3 h-3" /> Undo
            </button>
          </div>
        }
      />

      <main className="p-6 space-y-4 max-w-7xl mx-auto">
        {/* Info bar */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#16213e] border border-zinc-800/50">
          <Database className="w-4 h-4 text-blue-400 shrink-0" />
          <p className="text-xs text-zinc-400">
            G/L Registers record every posting that changes G/L entries. Each register covers a range of entry numbers from a single posting batch.
          </p>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-700 rounded-lg overflow-hidden overflow-x-auto">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">G/L Registers</h2>
            <span className="text-xs text-zinc-500">{registers.length} registers</span>
          </div>
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-zinc-700 bg-zinc-900/60">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">No.</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Creation Date</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Source Code</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">User ID</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">From Entry No.</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">To Entry No.</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Journal Batch</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {registers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-zinc-500 text-sm">
                    No G/L registers yet. Post a journal to create the first register entry.
                  </td>
                </tr>
              ) : (
                registers.map((r, i) => (
                  <tr key={r.id} className={`border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors ${i % 2 === 0 ? '' : 'bg-zinc-900/10'}`}>
                    <td className="px-4 py-2.5 tabular-nums text-xs font-mono font-semibold text-zinc-200">
                      {r.registerNo}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-zinc-400">{fmt(r.creationDate)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${SOURCE_CLS[r.sourceCode] ?? 'bg-zinc-700 text-zinc-400'}`}>
                        {r.sourceCode}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-zinc-400 font-mono">{r.userId ?? 'SYSTEM'}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-xs font-mono text-zinc-300">{r.fromEntryNo.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-xs font-mono text-zinc-300">{r.toEntryNo.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-zinc-400">{r.journalBatch ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        href={`/finance/gl-entries?register=${r.registerNo}`}
                        className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-zinc-700/50 text-zinc-300 hover:bg-zinc-700 transition-colors"
                      >
                        <ArrowRight className="w-3 h-3" /> Navigate
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
