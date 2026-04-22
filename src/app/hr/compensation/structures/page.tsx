export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { Plus } from 'lucide-react'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

const TYPE_COLORS: Record<string, string> = {
  'Graded':  'bg-blue-500/10 text-blue-400',
  'Band':    'bg-emerald-500/10 text-emerald-400',
  'Step':    'bg-purple-500/10 text-purple-400',
  'Broadband': 'bg-amber-500/10 text-amber-400',
}

const SAMPLE_STRUCTURES = [
  { id: '1', code: 'EXEC',  description: 'Executive Compensation',  type: 'Band',    effectiveDate: '2026-01-01', currency: 'USD', rangeMin: 150000, rangeMax: 500000, grades: 3  },
  { id: '2', code: 'MGMT',  description: 'Management Band',         type: 'Graded',  effectiveDate: '2026-01-01', currency: 'USD', rangeMin:  70000, rangeMax: 180000, grades: 6  },
  { id: '3', code: 'PROF',  description: 'Professional Staff',      type: 'Graded',  effectiveDate: '2026-01-01', currency: 'USD', rangeMin:  45000, rangeMax:  95000, grades: 8  },
  { id: '4', code: 'HOURLY', description: 'Hourly / Nonexempt',     type: 'Step',    effectiveDate: '2026-01-01', currency: 'USD', rangeMin:  30000, rangeMax:  55000, grades: 10 },
]

export default function CompensationStructuresPage() {
  return (
    <>
      <TopBar
        title="Compensation Structures"
        breadcrumb={[
          { label: 'Human Resources', href: '/hr' },
          { label: 'Compensation', href: '/hr/compensation' },
        ]}
        actions={
          <Link
            href="/hr/compensation/structures/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Structure
          </Link>
        }
      />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Structures</div>
            <div className="text-2xl font-bold text-zinc-100">{SAMPLE_STRUCTURES.length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Graded</div>
            <div className="text-2xl font-bold text-blue-400">{SAMPLE_STRUCTURES.filter(s => s.type === 'Graded').length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Band / Step</div>
            <div className="text-2xl font-bold text-emerald-400">{SAMPLE_STRUCTURES.filter(s => s.type === 'Band' || s.type === 'Step').length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Grade Levels</div>
            <div className="text-2xl font-bold text-zinc-100">{SAMPLE_STRUCTURES.reduce((s, st) => s + st.grades, 0)}</div>
          </div>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Code</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Type</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Effective Date</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Currency</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Range Min</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Range Max</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Grades</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_STRUCTURES.map((s, idx) => (
                <tr key={s.id} className={`hover:bg-zinc-800/30 transition-colors ${idx !== SAMPLE_STRUCTURES.length - 1 ? 'border-b border-zinc-800/40' : ''}`}>
                  <td className="px-4 py-2.5">
                    <Link href={`/hr/compensation/structures/${s.id}`} className="font-mono text-[12px] text-blue-400 hover:underline">{s.code}</Link>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-200">{s.description}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${TYPE_COLORS[s.type] ?? 'bg-zinc-700 text-zinc-400'}`}>
                      {s.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{s.effectiveDate}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{s.currency}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-zinc-300">{formatCurrency(s.rangeMin)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-zinc-300">{formatCurrency(s.rangeMax)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-zinc-300">{s.grades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-[12px] text-zinc-500">{SAMPLE_STRUCTURES.length} compensation structures</div>
      </div>
    </>
  )
}
