import { Suspense } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Plus, Clock, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

type BCTimeSheet = {
  id: string; sheetNo: string; resourceId: string | null; startDate: string
  endDate: string; ownerId: string | null; status: string; createdAt: string
  resourceName: string | null; resourceNo: string | null
}

const STATUS_COLOR: Record<string, string> = {
  Open:      'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Submitted: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Rejected:  'bg-red-500/20 text-red-400 border-red-500/30',
  Approved:  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

async function TimeSheetsTable({ status }: { status: string }) {
  let where = 'WHERE 1=1'
  if (status) where += ` AND t.status = '${status.replace(/'/g, "''")}'`

  const sheets = await prisma.$queryRawUnsafe<BCTimeSheet[]>(
    `SELECT t.*, r.name AS resourceName, r.resourceNo
     FROM "BCTimeSheet" t
     LEFT JOIN "BCResource" r ON r.id = t.resourceId
     ${where}
     ORDER BY t.createdAt DESC`
  )

  if (!sheets.length) {
    return (
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16">
        <Clock className="w-10 h-10 mb-3 opacity-30 text-zinc-600" />
        <p className="text-[13px] text-zinc-500">No time sheets found.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-zinc-800/60">
            <tr>
              {['No.', 'Resource', 'Start Date', 'End Date', 'Owner', 'Status', ''].map(h => (
                <th key={h + Math.random()} className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${['No.', 'Resource', 'Owner'].includes(h) ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {sheets.map(sheet => (
              <tr key={sheet.id} className="hover:bg-zinc-800/30 transition-colors group">
                <td className="px-4 py-3 font-mono text-[11px] text-blue-400">{sheet.sheetNo}</td>
                <td className="px-4 py-3 text-[12px] text-zinc-200">
                  {sheet.resourceName ? (
                    <div>
                      <span>{sheet.resourceName}</span>
                      <span className="text-zinc-600 ml-1.5 text-[10px] font-mono">{sheet.resourceNo}</span>
                    </div>
                  ) : <span className="text-zinc-700">—</span>}
                </td>
                <td className="px-4 py-3 text-right text-[11px] text-zinc-400">{sheet.startDate}</td>
                <td className="px-4 py-3 text-right text-[11px] text-zinc-400">{sheet.endDate}</td>
                <td className="px-4 py-3 text-[12px] text-zinc-400">{sheet.ownerId || <span className="text-zinc-700">—</span>}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_COLOR[sheet.status] ?? 'bg-zinc-800/60 text-zinc-400 border-zinc-700'}`}>
                    {sheet.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-zinc-600 group-hover:text-blue-400 transition-colors">
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default async function BCTimeSheetsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const sp = await searchParams
  const status = sp.status ?? ''

  return (
    <>
      <TopBar title="Time Sheets" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="flex min-h-0 flex-1">
          {/* Filter */}
          <aside className="w-56 shrink-0 border-r border-zinc-800/60 bg-[#0d0d1a] p-4 space-y-4 overflow-y-auto">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">Filters</p>
            <form method="GET" className="space-y-3">
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Status</label>
                <select name="status" defaultValue={status} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[11px] text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500">
                  <option value="">All</option>
                  <option value="Open">Open</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>
              <button type="submit" className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded transition-colors">Apply</button>
              <Link href="/projects/bc-timesheets" className="block w-full text-center py-1.5 text-zinc-600 hover:text-zinc-400 text-[11px] transition-colors">Clear</Link>
            </form>
          </aside>

          <div className="flex-1 px-6 py-4 space-y-4 overflow-auto">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[16px] font-semibold text-zinc-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" /> Time Sheets
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">Resource time tracking</p>
              </div>
              <Link href="/projects/bc-timesheets/new" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium rounded-md transition-colors">
                <Plus className="w-3.5 h-3.5" /> New Time Sheet
              </Link>
            </div>
            <Suspense fallback={<div className="py-10 text-center text-zinc-600 text-sm">Loading…</div>}>
              <TimeSheetsTable status={status} />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  )
}
