import { Suspense } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type LedgerEntry = {
  id: string; jobNo: string | null; taskNo: string | null; entryType: string
  postingDate: string | null; resourceNo: string | null; description: string | null
  quantity: number; totalCost: number; totalPrice: number; createdAt: string
}

const ENTRY_TYPE_COLOR: Record<string, string> = {
  Resource:   'bg-blue-500/20 text-blue-400',
  Item:       'bg-purple-500/20 text-purple-400',
  'G/L Account': 'bg-amber-500/20 text-amber-400',
}

async function LedgerTable({
  jobNo, taskNo, type, dateFrom, dateTo,
}: {
  jobNo: string; taskNo: string; type: string; dateFrom: string; dateTo: string
}) {
  let where = 'WHERE 1=1'
  if (jobNo) where += ` AND jobNo LIKE '%${jobNo.replace(/'/g, "''")}%'`
  if (taskNo) where += ` AND taskNo LIKE '%${taskNo.replace(/'/g, "''")}%'`
  if (type) where += ` AND entryType = '${type.replace(/'/g, "''")}'`
  if (dateFrom) where += ` AND postingDate >= '${dateFrom}'`
  if (dateTo) where += ` AND postingDate <= '${dateTo}'`

  const entries = await prisma.$queryRawUnsafe<LedgerEntry[]>(
    `SELECT * FROM "JobLedgerEntry" ${where} ORDER BY createdAt DESC LIMIT 500`
  )

  const totalCost = entries.reduce((s, e) => s + Number(e.totalCost), 0)
  const totalPrice = entries.reduce((s, e) => s + Number(e.totalPrice), 0)

  if (!entries.length) {
    return (
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16 text-zinc-600">
        <BookOpen className="w-10 h-10 mb-3 opacity-30" />
        <p className="text-[13px] text-zinc-500">No ledger entries found.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60">
        <span className="text-[11px] text-zinc-500">{entries.length} entries</span>
        <div className="flex gap-6 text-[11px]">
          <span className="text-zinc-500">Total Cost: <span className="text-zinc-300 font-medium tabular-nums">{formatCurrency(totalCost)}</span></span>
          <span className="text-zinc-500">Total Price: <span className="text-emerald-400 font-semibold tabular-nums">{formatCurrency(totalPrice)}</span></span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-zinc-800/60">
            <tr>
              {['Entry No.', 'Job No.', 'Posting Date', 'Type', 'No.', 'Description', 'Quantity', 'Total Cost', 'Total Price'].map(h => (
                <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${
                  ['Entry No.', 'Job No.', 'Type', 'No.', 'Description'].includes(h) ? 'text-left' : 'text-right'
                }`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {entries.map((entry, idx) => (
              <tr key={entry.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">{idx + 1}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-blue-400">{entry.jobNo || '—'}</td>
                <td className="px-4 py-3 text-right text-[11px] text-zinc-500 whitespace-nowrap">{entry.postingDate || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-medium ${ENTRY_TYPE_COLOR[entry.entryType] ?? 'bg-zinc-800/60 text-zinc-400'}`}>
                    {entry.entryType}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-zinc-300">{entry.resourceNo || '—'}</td>
                <td className="px-4 py-3 text-[12px] text-zinc-200 max-w-[200px] truncate">{entry.description || '—'}</td>
                <td className="px-4 py-3 text-right text-[12px] text-zinc-300 tabular-nums">{Number(entry.quantity)}</td>
                <td className="px-4 py-3 text-right text-[12px] text-zinc-400 tabular-nums">{formatCurrency(Number(entry.totalCost))}</td>
                <td className="px-4 py-3 text-right text-[12px] text-emerald-400 font-semibold tabular-nums">{formatCurrency(Number(entry.totalPrice))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default async function JobLedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ jobNo?: string; taskNo?: string; type?: string; dateFrom?: string; dateTo?: string }>
}) {
  const sp = await searchParams
  const jobNo = sp.jobNo ?? ''
  const taskNo = sp.taskNo ?? ''
  const type = sp.type ?? ''
  const dateFrom = sp.dateFrom ?? ''
  const dateTo = sp.dateTo ?? ''

  return (
    <>
      <TopBar title="Job Ledger Entries" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="flex min-h-0 flex-1">
          <aside className="w-56 shrink-0 border-r border-zinc-800/60 bg-[#0d0d1a] p-4 space-y-4 overflow-y-auto">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">Filters</p>
            <form method="GET" className="space-y-3">
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Job No.</label>
                <input name="jobNo" defaultValue={jobNo} placeholder="J2026-0001" className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[11px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500" />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Task No.</label>
                <input name="taskNo" defaultValue={taskNo} placeholder="1000" className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[11px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500" />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Type</label>
                <select name="type" defaultValue={type} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[11px] text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500">
                  <option value="">All</option>
                  <option value="Resource">Resource</option>
                  <option value="Item">Item</option>
                  <option value="G/L Account">G/L Account</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Date From</label>
                <input type="date" name="dateFrom" defaultValue={dateFrom} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[11px] text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500" />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Date To</label>
                <input type="date" name="dateTo" defaultValue={dateTo} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[11px] text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500" />
              </div>
              <button type="submit" className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded transition-colors">Apply</button>
              <Link href="/projects/job-ledger" className="block w-full text-center py-1.5 text-zinc-600 hover:text-zinc-400 text-[11px] transition-colors">Clear</Link>
            </form>
          </aside>
          <div className="flex-1 px-6 py-4 space-y-4 overflow-auto">
            <div>
              <h2 className="text-[16px] font-semibold text-zinc-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-zinc-400" /> Job Ledger Entries
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">All posted job transactions</p>
            </div>
            <Suspense fallback={<div className="py-10 text-center text-zinc-600 text-sm">Loading…</div>}>
              <LedgerTable jobNo={jobNo} taskNo={taskNo} type={type} dateFrom={dateFrom} dateTo={dateTo} />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  )
}
