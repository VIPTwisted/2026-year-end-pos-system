export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'

export default async function SalespeoplePage() {
  const salespeople = await prisma.salesperson.findMany({
    orderBy: { code: 'asc' },
    include: {
      territory: { select: { code: true, name: true } },
      employee: { select: { firstName: true, lastName: true } },
    },
  })

  const total = salespeople.length
  const active = salespeople.filter(s => s.isActive).length
  const totalYtdSales = salespeople.reduce((sum, s) => sum + Number(s.ytdSales), 0)
  const totalYtdCommission = salespeople.reduce((sum, s) => sum + Number(s.ytdCommission), 0)

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Salespeople"
        breadcrumb={[{ label: 'Sales', href: '/sales/salespeople' }]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/sales/territories"
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded transition-colors"
            >
              Territories
            </Link>
            <Link
              href="/sales/salespeople/new"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
            >
              + New Salesperson
            </Link>
          </div>
        }
      />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total</div>
            <div className="text-2xl font-bold text-zinc-100">{total}</div>
            <div className="text-xs text-zinc-500 mt-1">salespeople</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Active</div>
            <div className="text-2xl font-bold text-emerald-400">{active}</div>
            <div className="text-xs text-zinc-500 mt-1">{total - active} inactive</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">YTD Sales</div>
            <div className="text-2xl font-bold text-zinc-100 tabular-nums">{formatCurrency(totalYtdSales)}</div>
            <div className="text-xs text-zinc-500 mt-1">all salespeople</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">YTD Commission</div>
            <div className="text-2xl font-bold text-amber-400 tabular-nums">{formatCurrency(totalYtdCommission)}</div>
            <div className="text-xs text-zinc-500 mt-1">all salespeople</div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Code</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Territory</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Employee</th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Comm %</th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">YTD Sales</th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">YTD Commission</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {salespeople.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-zinc-500 text-sm">
                    No salespeople yet.{' '}
                    <Link href="/sales/salespeople/new" className="text-blue-400 hover:underline">
                      Add one
                    </Link>
                  </td>
                </tr>
              )}
              {salespeople.map(s => (
                <tr key={s.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/sales/salespeople/${s.id}`} className="font-mono text-sm text-blue-400 hover:text-blue-300 font-medium">
                      {s.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-200 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {s.territory ? (
                      <span className="font-mono text-xs bg-zinc-800 px-1.5 py-0.5 rounded">
                        {s.territory.code}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {s.employee ? (
                      <Link href={`/hr/employees/${s.employeeId}`} className="text-blue-400/70 hover:text-blue-400 text-xs">
                        {s.employee.firstName} {s.employee.lastName}
                      </Link>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-200 text-right tabular-nums">
                    {Number(s.commissionPct).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-200 text-right tabular-nums font-semibold">
                    {formatCurrency(Number(s.ytdSales))}
                  </td>
                  <td className="px-4 py-3 text-sm text-amber-400 text-right tabular-nums font-semibold">
                    {formatCurrency(Number(s.ytdCommission))}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${s.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
