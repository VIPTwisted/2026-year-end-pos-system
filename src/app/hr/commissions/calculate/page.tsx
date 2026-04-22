'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

export default function CalculatePeriodPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const now = new Date()
  const defaultPeriod =
    searchParams.get('period') ??
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const [period, setPeriod] = useState(defaultPeriod)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ created: number; skipped: number; period: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCalculate() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/hr/commissions/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Calculation failed')
        return
      }

      const data = await res.json() as { created: number; skipped: number; period: string }
      setResult(data)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="Calculate Commissions" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a]">
        <div className="max-w-md mx-auto space-y-6 mt-8">

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">Calculate Period Commissions</h2>
              <p className="text-[13px] text-zinc-500 mt-1">
                Scans all completed orders in the selected period and creates commission records for assigned employees.
                Already-calculated orders are skipped.
              </p>
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                Period (YYYY-MM)
              </label>
              <input
                type="month"
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {error && (
              <div className="px-3 py-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {result && (
              <div className="px-3 py-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm space-y-1">
                <p className="font-semibold">Calculation complete for {result.period}</p>
                <p>{result.created} commission records created</p>
                <p>{result.skipped} orders skipped (no rate / already calculated)</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleCalculate}
                disabled={loading || !period}
                className="flex-1 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {loading ? 'Calculating…' : 'Run Calculation'}
              </button>
              <button
                onClick={() => router.push(`/hr/commissions?period=${period}`)}
                className="px-4 py-2 rounded-md border border-zinc-700 text-zinc-400 text-sm hover:border-zinc-500 transition-colors"
              >
                View Ledger
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
