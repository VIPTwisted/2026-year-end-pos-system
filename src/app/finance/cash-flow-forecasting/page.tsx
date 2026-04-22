'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { TrendingUp, TrendingDown, DollarSign, BarChart3, GitBranch } from 'lucide-react'

// 13-week rolling forecast data
const WEEKS = Array.from({ length: 13 }, (_, i) => {
  const d = new Date('2026-04-21')
  d.setDate(d.getDate() + i * 7)
  const label = `W${i + 1} ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  const inflow = 85000 + Math.round(Math.random() * 40000 - 10000)
  const outflow = 62000 + Math.round(Math.random() * 25000 - 8000)
  return { label, inflow, outflow, net: inflow - outflow }
})

const currentCash = 420000
const proj30 = currentCash + WEEKS.slice(0, 4).reduce((s, w) => s + w.net, 0)
const proj60 = currentCash + WEEKS.slice(0, 8).reduce((s, w) => s + w.net, 0)
const proj90 = currentCash + WEEKS.slice(0, 13).reduce((s, w) => s + w.net, 0)
const burnRate = WEEKS.reduce((s, w) => s + w.outflow, 0) / 13

const MAX_VAL = Math.max(...WEEKS.map(w => Math.max(w.inflow, w.outflow)))

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="flex flex-col items-center gap-1 w-full">
      <div className="w-full flex items-end h-20 gap-px">
        <div
          className={`w-full rounded-sm transition-all ${color}`}
          style={{ height: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function formatK(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`
}

function formatCur(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function CashFlowForecastingPage() {
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null)
  const hovered = hoveredWeek !== null ? WEEKS[hoveredWeek] : null

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Cash Flow Forecasting" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-zinc-100">13-Week Rolling Forecast</h2>
            <p className="text-[13px] text-zinc-500">AR aging · AP schedule · payroll obligations</p>
          </div>
          <Link
            href="/finance/cash-flow-forecasting/scenarios"
            className="inline-flex items-center gap-1.5 rounded-md bg-[#16213e] hover:bg-zinc-800 text-zinc-300 border border-zinc-700 px-3 h-9 text-[13px] font-medium transition-colors"
          >
            <GitBranch className="w-4 h-4" />
            Scenarios
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-zinc-400" />
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Current Cash</p>
            </div>
            <p className="text-2xl font-bold text-zinc-100 tabular-nums">{formatCur(currentCash)}</p>
            <p className="text-[11px] text-zinc-600 mt-1">as of today</p>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={`w-4 h-4 ${proj30 >= currentCash ? 'text-emerald-400' : 'text-red-400'}`} />
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide">30-Day Balance</p>
            </div>
            <p className={`text-2xl font-bold tabular-nums ${proj30 >= currentCash ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCur(proj30)}
            </p>
            <p className="text-[11px] text-zinc-600 mt-1">projected</p>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={`w-4 h-4 ${proj60 >= currentCash ? 'text-emerald-400' : 'text-red-400'}`} />
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide">60-Day Balance</p>
            </div>
            <p className={`text-2xl font-bold tabular-nums ${proj60 >= currentCash ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCur(proj60)}
            </p>
            <p className="text-[11px] text-zinc-600 mt-1">projected</p>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Weekly Burn</p>
            </div>
            <p className="text-2xl font-bold text-amber-400 tabular-nums">{formatCur(burnRate)}</p>
            <p className="text-[11px] text-zinc-600 mt-1">avg weekly outflows</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-zinc-400" />
              <span className="text-[13px] font-semibold text-zinc-100">Weekly Cash Flow</span>
            </div>
            <div className="flex items-center gap-4 ml-auto text-[11px] text-zinc-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500/70 inline-block" />Inflows</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500/70 inline-block" />Outflows</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500/70 inline-block" />Net</span>
            </div>
          </div>

          {hovered && (
            <div className="mb-4 bg-zinc-900/80 border border-zinc-700 rounded-lg px-4 py-3 flex gap-6 text-[13px]">
              <span className="text-zinc-400 font-medium">{hovered.label}</span>
              <span className="text-emerald-400">In: {formatCur(hovered.inflow)}</span>
              <span className="text-red-400">Out: {formatCur(hovered.outflow)}</span>
              <span className={hovered.net >= 0 ? 'text-blue-400' : 'text-amber-400'}>Net: {formatCur(hovered.net)}</span>
            </div>
          )}

          <div className="flex items-end gap-1 h-36 overflow-x-auto">
            {WEEKS.map((w, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-0.5 flex-1 min-w-[52px] cursor-pointer group"
                onMouseEnter={() => setHoveredWeek(i)}
                onMouseLeave={() => setHoveredWeek(null)}
              >
                <div className="w-full flex items-end gap-px h-28">
                  {/* Inflow bar */}
                  <div
                    className="flex-1 rounded-sm bg-emerald-500/60 group-hover:bg-emerald-500/80 transition-colors"
                    style={{ height: `${Math.round((w.inflow / MAX_VAL) * 100)}%` }}
                  />
                  {/* Outflow bar */}
                  <div
                    className="flex-1 rounded-sm bg-red-500/60 group-hover:bg-red-500/80 transition-colors"
                    style={{ height: `${Math.round((w.outflow / MAX_VAL) * 100)}%` }}
                  />
                  {/* Net bar */}
                  <div
                    className={`flex-1 rounded-sm transition-colors ${w.net >= 0 ? 'bg-blue-500/60 group-hover:bg-blue-500/80' : 'bg-amber-500/60 group-hover:bg-amber-500/80'}`}
                    style={{ height: `${Math.round((Math.abs(w.net) / MAX_VAL) * 100)}%` }}
                  />
                </div>
                <span className="text-[9px] text-zinc-600 group-hover:text-zinc-400 transition-colors whitespace-nowrap">{formatK(w.net)}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-1 mt-1 overflow-x-auto">
            {WEEKS.map((w, i) => (
              <div key={i} className="flex-1 min-w-[52px] text-center">
                <span className="text-[9px] text-zinc-600">{w.label.replace(/W\d+ /, '')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AR / AP Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-3">AR Aging Input</p>
            <div className="space-y-2">
              {[
                { bucket: 'Current (0-30d)', amount: 142000, cls: 'text-emerald-400' },
                { bucket: '31-60 days', amount: 58000, cls: 'text-amber-400' },
                { bucket: '61-90 days', amount: 23000, cls: 'text-orange-400' },
                { bucket: '90+ days', amount: 11000, cls: 'text-red-400' },
              ].map(r => (
                <div key={r.bucket} className="flex justify-between items-center">
                  <span className="text-[12px] text-zinc-400">{r.bucket}</span>
                  <span className={`text-[13px] font-semibold tabular-nums ${r.cls}`}>{formatCur(r.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-3">AP Payment Schedule</p>
            <div className="space-y-2">
              {[
                { bucket: 'Due in 7 days', amount: 38000, cls: 'text-red-400' },
                { bucket: 'Due in 14 days', amount: 51000, cls: 'text-amber-400' },
                { bucket: 'Due in 30 days', amount: 67000, cls: 'text-zinc-300' },
                { bucket: 'Due 30+ days', amount: 94000, cls: 'text-zinc-500' },
              ].map(r => (
                <div key={r.bucket} className="flex justify-between items-center">
                  <span className="text-[12px] text-zinc-400">{r.bucket}</span>
                  <span className={`text-[13px] font-semibold tabular-nums ${r.cls}`}>{formatCur(r.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-3">Payroll Obligations</p>
            <div className="space-y-2">
              {[
                { bucket: 'Next payroll (Apr 30)', amount: 94000, cls: 'text-red-400' },
                { bucket: 'May 15 payroll', amount: 94000, cls: 'text-amber-400' },
                { bucket: 'May 30 payroll', amount: 94000, cls: 'text-zinc-300' },
                { bucket: 'Benefits / taxes', amount: 18500, cls: 'text-zinc-500' },
              ].map(r => (
                <div key={r.bucket} className="flex justify-between items-center">
                  <span className="text-[12px] text-zinc-400">{r.bucket}</span>
                  <span className={`text-[13px] font-semibold tabular-nums ${r.cls}`}>{formatCur(r.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
