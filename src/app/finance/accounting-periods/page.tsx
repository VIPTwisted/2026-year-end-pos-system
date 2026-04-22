export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Plus, Lock, Calendar, CheckCircle } from 'lucide-react'

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
}

export default async function AccountingPeriodsPage() {
  const periods = await prisma.accountingPeriod.findMany({
    orderBy: { startingDate: 'asc' },
  })

  const openCount = periods.filter(p => !p.closed).length
  const closedCount = periods.filter(p => p.closed).length
  const lockedCount = periods.filter(p => p.dateLocked).length

  const actions = (
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors">
        <Plus className="w-3.5 h-3.5" /> Create Year
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        <Lock className="w-3.5 h-3.5" /> Close Year
      </button>
    </div>
  )

  return (
    <>
      <TopBar
        title="Accounting Periods"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={actions}
      />

      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Periods</div>
            <div className="text-2xl font-bold text-zinc-100">{periods.length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Open</div>
            <div className="text-2xl font-bold text-emerald-400">{openCount}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Closed</div>
            <div className="text-2xl font-bold text-zinc-500">{closedCount}</div>
          </div>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Period Start</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                <th className="text-center px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">New Fiscal Year</th>
                <th className="text-center px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Date Locked</th>
                <th className="text-center px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Closed</th>
                <th className="text-center px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Inventory Closed</th>
              </tr>
            </thead>
            <tbody>
              {periods.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-zinc-500">
                    No accounting periods. Use <strong className="text-zinc-400">Create Year</strong> to generate periods.
                  </td>
                </tr>
              ) : (
                periods.map((period, idx) => (
                  <tr
                    key={period.id}
                    className={`hover:bg-zinc-800/30 transition-colors ${idx !== periods.length - 1 ? 'border-b border-zinc-800/40' : ''} ${period.newFiscalYear ? 'bg-zinc-900/20' : ''}`}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {period.newFiscalYear && (
                          <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        )}
                        <span className={`font-mono text-[12px] ${period.newFiscalYear ? 'text-blue-400 font-semibold' : 'text-zinc-300'}`}>
                          {formatDate(period.startingDate)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-200">{period.name}</td>
                    <td className="px-4 py-2.5 text-center">
                      {period.newFiscalYear ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400">
                          <CheckCircle className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {period.dateLocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        period.closed ? 'bg-zinc-700 text-zinc-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {period.closed ? 'Closed' : 'Open'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {period.inventoryClosed ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-700 text-zinc-400">Yes</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-[12px] text-zinc-500">{periods.length} periods · {openCount} open · {closedCount} closed · {lockedCount} date-locked</div>
      </div>
    </>
  )
}
