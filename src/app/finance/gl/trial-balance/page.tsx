'use client'

import { useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BarChart3, Search } from 'lucide-react'

interface TBRow {
  accountCode: string; accountName: string; accountType: string
  normalBalance: string; totalDebit: number; totalCredit: number
}
interface TrialBalance { period: string; rows: TBRow[]; grandDebit: number; grandCredit: number }

export default function TrialBalancePage() {
  const [period, setPeriod] = useState('')
  const [data, setData] = useState<TrialBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetch_() {
    setLoading(true); setError('')
    const url = period ? `/api/finance/trial-balance?period=${period}` : '/api/finance/trial-balance'
    const res = await fetch(url)
    if (res.ok) setData(await res.json())
    else { const d = await res.json(); setError(d.error || 'Failed') }
    setLoading(false)
  }

  const grouped = data?.rows.reduce((g, r) => {
    if (!g[r.accountType]) g[r.accountType] = []
    g[r.accountType].push(r)
    return g
  }, {} as Record<string, TBRow[]>) || {}

  const balanced = data ? Math.abs(data.grandDebit - data.grandCredit) < 0.001 : false

  return (
    <>
      <TopBar title="Trial Balance" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Trial Balance</h2>
            <p className="text-sm text-zinc-500">Aggregated from posted journals</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs text-zinc-400 mb-1 block">Period (YYYY-MM, blank = all posted)</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 font-mono"
                  value={period} onChange={e => setPeriod(e.target.value)} placeholder="e.g. 2026-04" />
              </div>
              <Button onClick={fetch_} disabled={loading}>
                <Search className="w-4 h-4 mr-1" />{loading ? 'Loading…' : 'Generate'}
              </Button>
            </div>
            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
          </CardContent>
        </Card>

        {data && (
          <>
            <div className={cn('text-sm font-medium px-4 py-2 rounded-lg border', balanced ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-amber-400 bg-amber-400/10 border-amber-400/20')}>
              {balanced ? `Balanced — ${data.period === 'all' ? 'All posted periods' : `Period ${data.period}`}` : `Out of balance by $${Math.abs(data.grandDebit - data.grandCredit).toFixed(2)}`}
            </div>

            {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([type, rows]) => {
              const secDr = rows.reduce((s, r) => s + r.totalDebit, 0)
              const secCr = rows.reduce((s, r) => s + r.totalCredit, 0)
              return (
                <div key={type}>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">{type}</h3>
                  <Card>
                    <CardContent className="p-0">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                            <th className="text-left px-4 py-3 font-medium">Code</th>
                            <th className="text-left px-4 py-3 font-medium">Account</th>
                            <th className="text-right px-4 py-3 font-medium">Total Debit</th>
                            <th className="text-right px-4 py-3 font-medium">Total Credit</th>
                            <th className="text-right px-4 py-3 font-medium">Net</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                          {rows.map(r => {
                            const net = r.normalBalance === 'debit' ? r.totalDebit - r.totalCredit : r.totalCredit - r.totalDebit
                            return (
                              <tr key={r.accountCode} className="hover:bg-zinc-900/50">
                                <td className="px-4 py-2.5 font-mono text-xs text-zinc-300">{r.accountCode}</td>
                                <td className="px-4 py-2.5 text-zinc-200">{r.accountName}</td>
                                <td className="px-4 py-2.5 text-right font-mono text-zinc-300">${r.totalDebit.toFixed(2)}</td>
                                <td className="px-4 py-2.5 text-right font-mono text-zinc-300">${r.totalCredit.toFixed(2)}</td>
                                <td className={cn('px-4 py-2.5 text-right font-mono font-semibold', net >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                                  ${Math.abs(net).toFixed(2)}
                                </td>
                              </tr>
                            )
                          })}
                          <tr className="border-t border-zinc-700 bg-zinc-900/30 text-xs font-medium">
                            <td className="px-4 py-2 text-zinc-500" colSpan={2}>{type} Subtotal</td>
                            <td className="px-4 py-2 text-right font-mono text-zinc-300">${secDr.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right font-mono text-zinc-300">${secCr.toFixed(2)}</td>
                            <td />
                          </tr>
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </div>
              )
            })}

            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">Grand Totals</span>
                  <div className="flex gap-8">
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">Total Debits</p>
                      <p className="font-mono font-semibold text-zinc-100">${data.grandDebit.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">Total Credits</p>
                      <p className={cn('font-mono font-semibold', balanced ? 'text-emerald-400' : 'text-amber-400')}>${data.grandCredit.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </>
  )
}
