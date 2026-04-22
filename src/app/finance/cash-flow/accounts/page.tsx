export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { DollarSign, Plus } from 'lucide-react'

const SOURCE_TYPE_BADGE: Record<string, string> = {
  'Liquid Funds': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Receivables': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Sales Orders': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Purch. Orders': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Payroll': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Fixed Assets': 'bg-zinc-600/40 text-zinc-300 border-zinc-500/20',
  'Manual': 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30',
  'G/L Account': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
}

export default async function CashFlowAccountsPage() {
  const accounts = await prisma.cashFlowAccount.findMany({
    orderBy: { accountNo: 'asc' },
  })

  const bySource = accounts.reduce<Record<string, number>>((acc, a) => {
    acc[a.sourceType] = (acc[a.sourceType] ?? 0) + 1
    return acc
  }, {})

  return (
    <>
      <TopBar title="Cash Flow Accounts" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Finance &rsaquo; Cash Flow</p>
              <h2 className="text-xl font-bold text-zinc-100">Cash Flow Accounts</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Chart of accounts for cash flow categorization and forecasting</p>
            </div>
            <button className="h-8 px-4 rounded text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />New Account
            </button>
          </div>

          {/* Source type summary */}
          {Object.keys(bySource).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(bySource).map(([type, count]) => (
                <div key={type} className="flex items-center gap-1.5 bg-zinc-800/40 border border-zinc-700/60 rounded px-3 py-1.5">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${SOURCE_TYPE_BADGE[type] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30'}`}>
                    {type}
                  </span>
                  <span className="text-[11px] text-zinc-500 tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          )}

          {accounts.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-14 text-zinc-600">
              <DollarSign className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-[13px]">No Cash Flow Accounts defined yet.</p>
              <p className="text-[11px] mt-1 text-zinc-700">Add accounts to categorize cash flow sources and uses.</p>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['No.', 'Name', 'Source Type', 'G/L Integration', 'G/L Account No.', 'Description', 'Active'].map(h => (
                        <th key={h} className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap ${h === 'G/L Integration' || h === 'Active' ? 'text-center' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {accounts.map(a => (
                      <tr key={a.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-[13px] font-semibold text-blue-400">{a.accountNo}</span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-zinc-200">{a.name}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${SOURCE_TYPE_BADGE[a.sourceType] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30'}`}>
                            {a.sourceType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[11px] font-medium ${a.glIntegration ? 'text-emerald-400' : 'text-zinc-600'}`}>
                            {a.glIntegration ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px] text-zinc-400">{a.glAccountNo ?? '—'}</td>
                        <td className="px-4 py-3 text-[12px] text-zinc-500 max-w-[200px] truncate">{a.description ?? '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`w-2 h-2 rounded-full inline-block ${a.isActive ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2.5 border-t border-zinc-800/40 text-[11px] text-zinc-600">
                {accounts.length} account{accounts.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
