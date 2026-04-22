export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'

function formatPct(val: number): string {
  return `${(val * 100).toFixed(2)}%`
}

export default async function CommissionRatesPage() {
  const rates = await prisma.commissionRate.findMany({
    include: {
      employee: {
        select: { id: true, firstName: true, lastName: true, position: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const activeCount = rates.filter(r => r.isActive).length

  return (
    <>
      <TopBar title="Commission Rates" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">Commission Rate Configuration</h1>
            <p className="text-[13px] text-zinc-500">{rates.length} rates · {activeCount} active</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/hr/commissions"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 text-[13px] font-medium hover:border-zinc-500 transition-colors"
            >
              ← Ledger
            </Link>
            <Link
              href="/hr/commissions/rates/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
            >
              + Add Rate
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Total Rates</p>
            <p className="text-2xl font-bold text-zinc-100">{rates.length}</p>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Active</p>
            <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Inactive</p>
            <p className="text-2xl font-bold text-zinc-500">{rates.length - activeCount}</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Employee</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Role / Position</th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Rate %</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Category</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {rates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-500 text-sm">
                    No commission rates configured. Add a rate to start tracking commissions.
                  </td>
                </tr>
              ) : (
                rates.map(r => (
                  <tr key={r.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 text-zinc-200">
                      {r.employee
                        ? `${r.employee.firstName} ${r.employee.lastName}`
                        : <span className="text-zinc-500 italic">All Employees</span>}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {r.role ?? <span className="text-zinc-600 italic">All Roles</span>}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-blue-400">
                      {formatPct(r.rate)}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {r.productCategory ?? <span className="text-zinc-600 italic">All Categories</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        r.isActive
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-zinc-700 text-zinc-400'
                      }`}>
                        {r.isActive ? 'active' : 'inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
