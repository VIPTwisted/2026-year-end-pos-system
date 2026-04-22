export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Pencil, Ruler } from 'lucide-react'

export default async function UnitsOfMeasurePage() {
  const units = await prisma.unitOfMeasure.findMany({
    orderBy: { code: 'asc' },
  })

  return (
    <>
      <TopBar title="Units of Measure" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Action Ribbon */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-4 py-2 flex items-center gap-1">
          <Link href="/inventory/units-of-measure/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
            <Plus className="w-3.5 h-3.5" /> New
          </Link>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-zinc-300 hover:bg-zinc-800 rounded transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <div className="ml-auto text-[12px] text-zinc-500">{units.length} unit{units.length !== 1 ? 's' : ''}</div>
        </div>

        <div className="px-6 py-4">
          <div className="bg-[#16213e] rounded-lg border border-zinc-800/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/40">
              <Ruler className="w-4 h-4 text-zinc-500" />
              <span className="text-[13px] font-medium text-zinc-300">Units of Measure</span>
            </div>

            {units.length === 0 ? (
              <div className="py-16 text-center">
                <Ruler className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-[13px] text-zinc-500 mb-2">No units of measure defined</p>
                <p className="text-[12px] text-zinc-600 mb-4">Standard units: EACH, BOX, CASE, LB, KG, etc.</p>
                <Link href="/inventory/units-of-measure/new"
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium transition-colors">
                  <Plus className="w-3.5 h-3.5" /> New UOM
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/40">
                    <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">Code</th>
                    <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">Description</th>
                    <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">International Standard Code</th>
                    <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map(uom => (
                    <tr key={uom.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-[13px] text-zinc-100 font-semibold">{uom.code}</span>
                      </td>
                      <td className="py-3 px-4 text-[13px] text-zinc-300">{uom.description ?? '—'}</td>
                      <td className="py-3 px-4 text-[12px] text-zinc-500 font-mono">{uom.internationalStandardCode ?? '—'}</td>
                      <td className="py-3 px-4 text-[12px] text-zinc-600">
                        {new Date(uom.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
