import { Suspense } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Plus, Users, CheckCircle, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

type BCResource = {
  id: string; resourceNo: string; name: string; resourceType: string
  baseUnit: string; unitPrice: number; unitCost: number
  useTimeSheet: number; blocked: number; createdAt: string
}

async function ResourcesTable({ search, blocked }: { search: string; blocked: string }) {
  let where = 'WHERE 1=1'
  if (search) where += ` AND (resourceNo LIKE '%${search.replace(/'/g, "''")}%' OR name LIKE '%${search.replace(/'/g, "''")}%')`
  if (blocked === 'true') where += ' AND blocked = 1'
  else if (blocked === 'false') where += ' AND blocked = 0'

  const resources = await prisma.$queryRawUnsafe<BCResource[]>(
    `SELECT * FROM "BCResource" ${where} ORDER BY resourceNo ASC`
  )

  if (!resources.length) {
    return (
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16">
        <Users className="w-10 h-10 mb-3 opacity-30 text-zinc-600" />
        <p className="text-[13px] text-zinc-500 mb-4">No resources found.</p>
        <Link href="/projects/bc-resources/new" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-xs font-medium text-white transition-colors">
          <Plus className="w-3.5 h-3.5" /> New Resource
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-zinc-800/60">
            <tr>
              {['No.', 'Name', 'Type', 'Base Unit', 'Unit Price', 'Unit Cost', 'Use Time Sheet', 'Blocked'].map(h => (
                <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${['No.', 'Name', 'Type'].includes(h) ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {resources.map(r => (
              <tr key={r.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 font-mono text-[11px] text-blue-400">{r.resourceNo}</td>
                <td className="px-4 py-3 text-[13px] text-zinc-100">{r.name}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${r.resourceType === 'Person' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {r.resourceType}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-[12px] text-zinc-400">{r.baseUnit}</td>
                <td className="px-4 py-3 text-right text-[12px] text-emerald-400 tabular-nums font-medium">{formatCurrency(Number(r.unitPrice))}</td>
                <td className="px-4 py-3 text-right text-[12px] text-zinc-400 tabular-nums">{formatCurrency(Number(r.unitCost))}</td>
                <td className="px-4 py-3 text-right">
                  {r.useTimeSheet ? <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" /> : <XCircle className="w-4 h-4 text-zinc-700 ml-auto" />}
                </td>
                <td className="px-4 py-3 text-right">
                  {r.blocked ? <XCircle className="w-4 h-4 text-red-400 ml-auto" /> : <CheckCircle className="w-4 h-4 text-zinc-700 ml-auto" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default async function BCResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; blocked?: string }>
}) {
  const sp = await searchParams
  const search = sp.search ?? ''
  const blocked = sp.blocked ?? ''

  return (
    <>
      <TopBar title="Resources" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="flex min-h-0 flex-1">
          <aside className="w-56 shrink-0 border-r border-zinc-800/60 bg-[#0d0d1a] p-4 space-y-4 overflow-y-auto">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">Filters</p>
            <form method="GET" className="space-y-3">
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Search</label>
                <input name="search" defaultValue={search} placeholder="No. or name…" className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[11px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500" />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Blocked</label>
                <select name="blocked" defaultValue={blocked} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[11px] text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500">
                  <option value="">All</option>
                  <option value="false">Active</option>
                  <option value="true">Blocked</option>
                </select>
              </div>
              <button type="submit" className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded transition-colors">Apply</button>
              <Link href="/projects/bc-resources" className="block w-full text-center py-1.5 text-zinc-600 hover:text-zinc-400 text-[11px] transition-colors">Clear</Link>
            </form>
          </aside>

          <div className="flex-1 px-6 py-4 space-y-4 overflow-auto">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[16px] font-semibold text-zinc-100">Resources</h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">People and machines for job planning</p>
              </div>
              <Link href="/projects/bc-resources/new" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium rounded-md transition-colors">
                <Plus className="w-3.5 h-3.5" /> New Resource
              </Link>
            </div>
            <Suspense fallback={<div className="py-10 text-center text-zinc-600 text-sm">Loading…</div>}>
              <ResourcesTable search={search} blocked={blocked} />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  )
}
