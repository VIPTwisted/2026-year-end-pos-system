export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { Plus, Trash2 } from 'lucide-react'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

const SAMPLE_ENTRIES = [
  { id: '1', date: '2026-03-31', journalNo: 'ELIM-0001', description: 'Intercompany sales elimination',        debit: 250000, credit: 250000, account: '4000', entity: 'Sub-A / Parent' },
  { id: '2', date: '2026-03-31', journalNo: 'ELIM-0001', description: 'Intercompany receivable elimination',   debit: 125000, credit: 125000, account: '1200', entity: 'Sub-B / Parent' },
  { id: '3', date: '2026-03-31', journalNo: 'ELIM-0002', description: 'Investment in subsidiary elimination',  debit: 500000, credit: 500000, account: '1600', entity: 'Parent / Sub-A' },
  { id: '4', date: '2026-03-31', journalNo: 'ELIM-0002', description: 'Intercompany dividend elimination',     debit:  45000, credit:  45000, account: '3200', entity: 'Sub-A / Parent' },
]

export default function EliminationJournalPage() {
  const total = SAMPLE_ENTRIES.reduce((s, e) => s + e.debit, 0)

  return (
    <>
      <TopBar
        title="Elimination Journals"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Consolidation', href: '/finance/consolidation' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/finance/consolidation/elimination/new"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Journal
            </Link>
          </div>
        }
      />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Elimination Lines</div>
            <div className="text-2xl font-bold text-zinc-100">{SAMPLE_ENTRIES.length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Eliminated (Dr)</div>
            <div className="text-xl font-bold text-zinc-100 tabular-nums">{formatCurrency(total)}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Journals</div>
            <div className="text-2xl font-bold text-zinc-100">{new Set(SAMPLE_ENTRIES.map(e => e.journalNo)).size}</div>
          </div>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Date</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Journal No.</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Account</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Entity</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Debit</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Credit</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ENTRIES.map((e, idx) => (
                <tr key={e.id} className={`hover:bg-zinc-800/30 transition-colors ${idx !== SAMPLE_ENTRIES.length - 1 ? 'border-b border-zinc-800/40' : ''}`}>
                  <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{e.date}</td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-blue-400">{e.journalNo}</td>
                  <td className="px-4 py-2.5 text-zinc-200 text-[12px]">{e.description}</td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-400">{e.account}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{e.entity}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-zinc-300">{formatCurrency(e.debit)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-zinc-300">{formatCurrency(e.credit)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-700 bg-zinc-900/20">
                <td colSpan={5} className="px-4 py-2.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Total</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-bold text-zinc-100">{formatCurrency(total)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-bold text-zinc-100">{formatCurrency(total)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  )
}
