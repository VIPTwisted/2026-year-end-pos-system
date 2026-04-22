'use client'

import { TopBar } from '@/components/layout/TopBar'
import { useState } from 'react'
import { ArrowLeft, TrendingDown, Play, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

type EntryResult = {
  assetNumber: string
  description: string
  depreciationAmount: number
  newBookValue: number
}

type RunResult = {
  processed: number
  totalDepreciation: number
  entries: EntryResult[]
  message?: string
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export default function DepreciationRunPage() {
  const [postingDate, setPostingDate] = useState(new Date().toISOString().split('T')[0])
  const [bookCode, setBookCode] = useState('COMPANY')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<RunResult | null>(null)

  async function handleRun() {
    setRunning(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/fixed-assets/depreciation-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postingDate: new Date(postingDate).toISOString(),
          bookCode,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Run failed'); return }
      setResult(data)
    } catch {
      setError('Network error — please try again')
    } finally {
      setRunning(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-[13px] rounded-lg px-3 py-2 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors'
  const labelCls = 'block text-[11px] uppercase tracking-widest text-zinc-500 mb-1.5'

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Depreciation Run" />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">

          <Link href="/fixed-assets" className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Fixed Assets
          </Link>

          <div>
            <h2 className="text-[18px] font-semibold text-zinc-100">Batch Depreciation Run</h2>
            <p className="text-[13px] text-zinc-500 mt-1">
              Post monthly depreciation for all active assets that have not been depreciated this period.
            </p>
          </div>

          {/* Run Parameters */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4">Run Parameters</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Posting Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={postingDate}
                  onChange={e => setPostingDate(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Book Code</label>
                <input
                  className={inputCls}
                  value={bookCode}
                  onChange={e => setBookCode(e.target.value)}
                  placeholder="COMPANY"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <p className="text-[13px] text-red-400">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800/50">
              <p className="text-[11px] text-zinc-500">
                Assets depreciated this calendar month will be skipped automatically.
              </p>
              <button
                onClick={handleRun}
                disabled={running}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 h-9 text-[13px] font-medium transition-colors"
              >
                {running ? (
                  <>
                    <TrendingDown className="w-4 h-4 animate-pulse" />
                    Running…
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Depreciation
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-[13px] font-semibold text-zinc-100">Run Complete</h3>
                </div>

                {result.message && result.processed === 0 ? (
                  <p className="text-[13px] text-zinc-400">{result.message}</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Assets Processed</p>
                      <p className="text-2xl font-bold text-zinc-100">{result.processed}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Total Depreciation</p>
                      <p className="text-2xl font-bold text-red-400">{fmt(result.totalDepreciation)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Detail Table */}
              {result.entries.length > 0 && (
                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                  <div className="px-5 py-3 border-b border-zinc-800/50">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">Entries Posted</p>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800/50">
                        <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Asset #</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Description</th>
                        <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Depreciation</th>
                        <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">New Book Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.entries.map((e, i) => (
                        <tr key={i} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                          <td className="px-5 py-2 text-[13px] font-mono font-semibold text-blue-400">{e.assetNumber}</td>
                          <td className="px-4 py-2 text-[13px] text-zinc-300">{e.description}</td>
                          <td className="px-4 py-2 text-right text-[13px] font-mono text-red-400">{fmt(e.depreciationAmount)}</td>
                          <td className="px-4 py-2 text-right text-[13px] font-mono font-semibold text-emerald-400">{fmt(e.newBookValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-zinc-800/50 bg-zinc-900/30">
                        <td colSpan={2} className="px-5 py-2 text-[13px] font-semibold text-zinc-400">Total</td>
                        <td className="px-4 py-2 text-right text-[13px] font-mono font-bold text-red-400">{fmt(result.totalDepreciation)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
