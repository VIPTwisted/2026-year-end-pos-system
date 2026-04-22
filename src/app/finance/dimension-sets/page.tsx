export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { Layers } from 'lucide-react'

const SAMPLE_SETS = [
  {
    id: '1',
    setId: 1001,
    entries: [
      { dimension: 'Department', value: 'SALES', name: 'Sales Department' },
      { dimension: 'Cost Center', value: 'CC-001', name: 'North Region' },
      { dimension: 'Project', value: 'PROJ-2026', name: 'Project Alpha' },
    ],
    usedIn: 'G/L Entry 10045, 10046',
  },
  {
    id: '2',
    setId: 1002,
    entries: [
      { dimension: 'Department', value: 'MFGR', name: 'Manufacturing' },
      { dimension: 'Cost Center', value: 'CC-003', name: 'Factory Floor' },
    ],
    usedIn: 'G/L Entry 10047',
  },
  {
    id: '3',
    setId: 1003,
    entries: [
      { dimension: 'Department', value: 'ADMIN', name: 'Administration' },
      { dimension: 'Project', value: 'PROJ-2025', name: 'Project Beta' },
    ],
    usedIn: 'G/L Entry 10048, 10049, 10050',
  },
]

export default function DimensionSetsPage() {
  return (
    <>
      <TopBar
        title="Dimension Set Entries"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Dimensions', href: '/finance/dimensions' },
        ]}
      />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
        <div className="mb-4">
          <p className="text-[13px] text-zinc-500">
            Dimension Set Entries are read-only snapshots of dimension combinations attached to posted transactions. Each unique combination receives a Set ID.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Unique Sets</div>
            <div className="text-2xl font-bold text-zinc-100">{SAMPLE_SETS.length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Entries</div>
            <div className="text-2xl font-bold text-zinc-100">{SAMPLE_SETS.reduce((s, set) => s + set.entries.length, 0)}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Dimension Types</div>
            <div className="text-2xl font-bold text-blue-400">{new Set(SAMPLE_SETS.flatMap(s => s.entries.map(e => e.dimension))).size}</div>
          </div>
        </div>

        <div className="space-y-4">
          {SAMPLE_SETS.map(set => (
            <div key={set.id} className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span className="text-[13px] font-semibold text-zinc-200">Set ID: {set.setId}</span>
                </div>
                <span className="text-[11px] text-zinc-500">{set.usedIn}</span>
              </div>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/40 bg-zinc-900/10">
                    <th className="text-left px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Dimension Code</th>
                    <th className="text-left px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Dimension Value Code</th>
                    <th className="text-left px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Dimension Value Name</th>
                  </tr>
                </thead>
                <tbody>
                  {set.entries.map((entry, idx) => (
                    <tr key={idx} className={`hover:bg-zinc-800/30 transition-colors ${idx !== set.entries.length - 1 ? 'border-b border-zinc-800/30' : ''}`}>
                      <td className="px-5 py-2 text-zinc-300 font-medium">{entry.dimension}</td>
                      <td className="px-5 py-2 font-mono text-blue-400">{entry.value}</td>
                      <td className="px-5 py-2 text-zinc-400">{entry.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        <div className="mt-4 text-[12px] text-zinc-500">{SAMPLE_SETS.length} dimension sets</div>
      </div>
    </>
  )
}
