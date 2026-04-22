'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react'

function formatCur(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

const SCENARIO_COLORS = {
  base: { label: 'Base Case', bg: 'bg-blue-600/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  optimistic: { label: 'Optimistic', bg: 'bg-emerald-600/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  pessimistic: { label: 'Pessimistic', bg: 'bg-amber-600/20', text: 'text-amber-400', border: 'border-amber-500/30' },
}

type Scenario = 'base' | 'optimistic' | 'pessimistic'

const WEEKS_13 = Array.from({ length: 13 }, (_, i) => {
  const d = new Date('2026-04-21')
  d.setDate(d.getDate() + i * 7)
  const label = `W${i + 1} ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  const baseIn = 85000 + (i * 1200)
  const baseOut = 62000 + (i * 400)

  return {
    label,
    base: { inflow: baseIn, outflow: baseOut },
    optimistic: { inflow: baseIn * 1.15, outflow: baseOut * 0.92 },
    pessimistic: { inflow: baseIn * 0.78, outflow: baseOut * 1.08 },
  }
})

const currentCash = 420000

function cumulativeCash(scenario: Scenario): number[] {
  let cash = currentCash
  return WEEKS_13.map(w => {
    cash += w[scenario].inflow - w[scenario].outflow
    return Math.round(cash)
  })
}

const BASE_CUM = cumulativeCash('base')
const OPT_CUM = cumulativeCash('optimistic')
const PESS_CUM = cumulativeCash('pessimistic')

export default function ScenariosPage() {
  const [activeScenarios, setActiveScenarios] = useState<Set<Scenario>>(
    new Set(['base', 'optimistic', 'pessimistic'])
  )

  const toggle = (s: Scenario) => {
    setActiveScenarios(prev => {
      const next = new Set(prev)
      if (next.has(s)) {
        if (next.size > 1) next.delete(s)
      } else {
        next.add(s)
      }
      return next
    })
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Scenario Comparison" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="flex items-center gap-3">
          <Link
            href="/finance/cash-flow-forecasting"
            className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Forecast
          </Link>
          <span className="text-zinc-700">/</span>
          <h2 className="text-[16px] font-semibold text-zinc-100">Scenario Comparison</h2>
        </div>

        {/* Scenario toggles + summaries */}
        <div className="grid grid-cols-3 gap-4">
          {(Object.keys(SCENARIO_COLORS) as Scenario[]).map(s => {
            const c = SCENARIO_COLORS[s]
            const cum = s === 'base' ? BASE_CUM : s === 'optimistic' ? OPT_CUM : PESS_CUM
            const finalCash = cum[cum.length - 1]
            const totalInflow = WEEKS_13.reduce((acc, w) => acc + w[s].inflow, 0)
            const totalOutflow = WEEKS_13.reduce((acc, w) => acc + w[s].outflow, 0)
            const isActive = activeScenarios.has(s)
            return (
              <button
                key={s}
                onClick={() => toggle(s)}
                className={`text-left p-5 rounded-lg border transition-all
                  ${isActive ? `${c.bg} ${c.border}` : 'bg-zinc-900/30 border-zinc-800 opacity-50'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[12px] font-bold uppercase tracking-widest ${c.text}`}>{c.label}</span>
                  {s === 'optimistic' && <TrendingUp className={`w-4 h-4 ${c.text}`} />}
                  {s === 'pessimistic' && <TrendingDown className={`w-4 h-4 ${c.text}`} />}
                  {s === 'base' && <Minus className={`w-4 h-4 ${c.text}`} />}
                </div>
                <p className={`text-[22px] font-bold tabular-nums ${c.text}`}>{formatCur(finalCash)}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">13-week end balance</p>
                <div className="mt-3 pt-3 border-t border-zinc-800/50 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-zinc-600">Total Inflows</p>
                    <p className="text-[12px] text-emerald-400 font-medium tabular-nums">{formatCur(totalInflow)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-600">Total Outflows</p>
                    <p className="text-[12px] text-red-400 font-medium tabular-nums">{formatCur(totalOutflow)}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Side-by-side week table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <span className="text-[13px] font-semibold text-zinc-100">Week-by-Week Comparison</span>
            <span className="text-[11px] text-zinc-500 ml-3">Cumulative ending cash position</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-32">Week</th>
                  {(Object.keys(SCENARIO_COLORS) as Scenario[]).flatMap(s => [
                    <th key={`${s}-in`} className={`text-right py-3 px-2 text-[10px] font-semibold uppercase tracking-widest ${SCENARIO_COLORS[s].text} opacity-70`}>
                      {SCENARIO_COLORS[s].label} In
                    </th>,
                    <th key={`${s}-out`} className={`text-right py-3 px-2 text-[10px] font-semibold uppercase tracking-widest ${SCENARIO_COLORS[s].text} opacity-70`}>
                      Out
                    </th>,
                    <th key={`${s}-cash`} className={`text-right py-3 px-3 text-[10px] font-semibold uppercase tracking-widest ${SCENARIO_COLORS[s].text}`}>
                      Cash
                    </th>,
                  ])}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {WEEKS_13.map((w, i) => (
                  <tr key={i} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-5 py-2.5 text-[12px] text-zinc-400 whitespace-nowrap">{w.label}</td>
                    {/* Base */}
                    <td className="py-2.5 px-2 text-right text-[12px] text-emerald-500/80 tabular-nums">{formatCur(w.base.inflow)}</td>
                    <td className="py-2.5 px-2 text-right text-[12px] text-red-500/80 tabular-nums">{formatCur(w.base.outflow)}</td>
                    <td className="py-2.5 px-3 text-right text-[13px] font-semibold text-blue-400 tabular-nums">{formatCur(BASE_CUM[i])}</td>
                    {/* Optimistic */}
                    <td className="py-2.5 px-2 text-right text-[12px] text-emerald-500/80 tabular-nums">{formatCur(w.optimistic.inflow)}</td>
                    <td className="py-2.5 px-2 text-right text-[12px] text-red-500/80 tabular-nums">{formatCur(w.optimistic.outflow)}</td>
                    <td className="py-2.5 px-3 text-right text-[13px] font-semibold text-emerald-400 tabular-nums">{formatCur(OPT_CUM[i])}</td>
                    {/* Pessimistic */}
                    <td className="py-2.5 px-2 text-right text-[12px] text-emerald-500/80 tabular-nums">{formatCur(w.pessimistic.inflow)}</td>
                    <td className="py-2.5 px-2 text-right text-[12px] text-red-500/80 tabular-nums">{formatCur(w.pessimistic.outflow)}</td>
                    <td className="py-2.5 px-3 text-right text-[13px] font-semibold text-amber-400 tabular-nums">{formatCur(PESS_CUM[i])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  )
}
