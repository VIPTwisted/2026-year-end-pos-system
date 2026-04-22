'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import {
  Plus, Mail, FileText, DollarSign, Ban, Send, Download,
  ChevronDown, ChevronRight, AlertTriangle,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────── */
type CollectionStatus = 'current' | '30+' | '60+' | '90+' | 'write-off'

interface Customer {
  id: string
  name: string
  balance: number
  overdue: number
  daysOverdue: number
  creditLimit: number
  lastPayment: string
  agent: string
  status: CollectionStatus
}

interface Activity {
  date: string
  action: string
  amount: number | null
  agent: string
}

interface ApiData {
  kpis: { totalAR: number; overdue: number; ninetyPlus: number; dso: number }
  aging: { current: number; d1_30: number; d31_60: number; d61_90: number; d90plus: number }
  customers: Customer[]
  activities: Record<string, Activity[]>
}

/* ─── Helpers ────────────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const STATUS_CFG: Record<CollectionStatus, { label: string; cls: string }> = {
  current:    { label: 'Current',    cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  '30+':      { label: '30+ days',   cls: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' },
  '60+':      { label: '60+ days',   cls: 'bg-orange-500/15 text-orange-400 border border-orange-500/30' },
  '90+':      { label: '90+ days',   cls: 'bg-red-500/15 text-red-400 border border-red-500/30' },
  'write-off':{ label: 'Write-off',  cls: 'bg-zinc-700/40 text-zinc-400 border border-zinc-600' },
}

const AGING_BARS = [
  { key: 'current', label: 'Current',   color: '#10b981' },
  { key: 'd1_30',   label: '1-30 days', color: '#eab308' },
  { key: 'd31_60',  label: '31-60 days',color: '#f97316' },
  { key: 'd61_90',  label: '61-90 days',color: '#ef4444' },
  { key: 'd90plus', label: '90+ days',  color: '#9f1239' },
] as const

/* ─── Component ──────────────────────────────────────── */
export default function CreditCollectionsPage() {
  const [data, setData] = useState<ApiData | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<CollectionStatus | 'all'>('all')

  useEffect(() => {
    fetch('/api/finance/credit-collections')
      .then((r) => r.json())
      .then(setData)
  }, [])

  if (!data) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a]">
        <TopBar title="Credit & Collections" breadcrumb={[{ label: 'Finance', href: '/finance' }]} />
        <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">Loading…</div>
      </div>
    )
  }

  const { kpis, aging, customers, activities } = data
  const agingTotal = Object.values(aging).reduce((s, v) => s + v, 0) || 1

  const filtered =
    filter === 'all' ? customers : customers.filter((c) => c.status === filter)

  const ribbonBtn = (label: string, icon: React.ReactNode, primary = false) => (
    <button
      key={label}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded transition-colors ${
        primary
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
      }`}
    >
      {icon}
      {label}
    </button>
  )

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Credit & Collections" breadcrumb={[{ label: 'Finance', href: '/finance' }]} />

      <main className="p-6 space-y-5">

        {/* ── KPI Tiles ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total AR', value: fmt(kpis.totalAR), color: 'text-blue-400' },
            { label: 'Overdue', value: fmt(kpis.overdue), color: 'text-orange-400' },
            { label: '90+ Days', value: fmt(kpis.ninetyPlus), color: 'text-red-400' },
            { label: 'DSO', value: `${kpis.dso} days`, color: 'text-purple-400' },
          ].map((k) => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-700/60 rounded-xl p-4">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* ── Aging Bar Chart ── */}
        <div className="bg-[#16213e] border border-zinc-700/60 rounded-xl p-5">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">AR Aging Summary</p>
          <div className="space-y-3">
            {AGING_BARS.map((b) => {
              const val = aging[b.key]
              const pct = (val / agingTotal) * 100
              return (
                <div key={b.key} className="flex items-center gap-3">
                  <span className="text-[11px] text-zinc-400 w-24 shrink-0">{b.label}</span>
                  <div className="flex-1 bg-zinc-800 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: b.color }}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-300 w-24 text-right shrink-0">{fmt(val)}</span>
                </div>
              )
            })}
          </div>
          {/* SVG micro-chart */}
          <svg className="mt-5 w-full h-6" viewBox="0 0 400 24" preserveAspectRatio="none">
            {(() => {
              let x = 0
              return AGING_BARS.map((b) => {
                const pct = (aging[b.key] / agingTotal) * 100
                const w = (pct / 100) * 400
                const rect = (
                  <rect key={b.key} x={x} y={0} width={w} height={24} fill={b.color} opacity={0.8} />
                )
                x += w
                return rect
              })
            })()}
          </svg>
        </div>

        {/* ── Action Ribbon ── */}
        <div className="flex flex-wrap gap-2">
          {ribbonBtn('+ New Collection Activity', <Plus className="w-3.5 h-3.5" />, true)}
          {ribbonBtn('Send Statement', <Send className="w-3.5 h-3.5" />)}
          {ribbonBtn('Apply Payment', <DollarSign className="w-3.5 h-3.5" />)}
          {ribbonBtn('Write Off', <FileText className="w-3.5 h-3.5" />)}
          {ribbonBtn('Put on Hold', <Ban className="w-3.5 h-3.5" />)}
          {ribbonBtn('Collection Letter', <Mail className="w-3.5 h-3.5" />)}
          {ribbonBtn('Export', <Download className="w-3.5 h-3.5" />)}
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex gap-1 flex-wrap">
          {(['all', 'current', '30+', '60+', '90+', 'write-off'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-[11px] font-medium rounded-full transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {f === 'all' ? 'All' : STATUS_CFG[f].label}
            </button>
          ))}
        </div>

        {/* ── Customer Collections Table ── */}
        <div className="bg-[#16213e] border border-zinc-700/60 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead>
              <tr className="border-b border-zinc-700 bg-zinc-900/60">
                {[
                  'Customer', 'Balance Due', 'Overdue', 'Days Overdue',
                  'Credit Limit', 'Available Credit', 'Last Payment',
                  'Collection Agent', 'Status', '',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const cfg = STATUS_CFG[c.status]
                const available = c.creditLimit - c.balance
                const isExpanded = expanded === c.id
                const acts = activities[c.id] ?? []
                return (
                  <>
                    <tr
                      key={c.id}
                      className="border-b border-zinc-800 hover:bg-zinc-800/40 cursor-pointer transition-colors"
                      onClick={() => setExpanded(isExpanded ? null : c.id)}
                    >
                      <td className="px-4 py-3 text-zinc-100 font-medium text-[13px]">{c.name}</td>
                      <td className="px-4 py-3 text-zinc-200 text-right">{fmt(c.balance)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={c.overdue > 0 ? 'text-red-400 font-medium' : 'text-zinc-500'}>
                          {c.overdue > 0 ? fmt(c.overdue) : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={c.daysOverdue > 90 ? 'text-red-400' : c.daysOverdue > 0 ? 'text-orange-400' : 'text-zinc-500'}>
                          {c.daysOverdue > 0 ? `${c.daysOverdue}d` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-300 text-right">{fmt(c.creditLimit)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={available < 0 ? 'text-red-400' : 'text-emerald-400'}>
                          {fmt(available)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-[12px]">{c.lastPayment}</td>
                      <td className="px-4 py-3 text-zinc-300 text-[12px]">{c.agent}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500">
                        {isExpanded
                          ? <ChevronDown className="w-4 h-4" />
                          : <ChevronRight className="w-4 h-4" />}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${c.id}-exp`} className="bg-zinc-900/50">
                        <td colSpan={10} className="px-6 py-4">
                          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                            Activity Log — {c.name}
                          </p>
                          {acts.length === 0 ? (
                            <p className="text-xs text-zinc-600">No activity recorded.</p>
                          ) : (
                            <div className="space-y-2">
                              {acts.map((a, i) => (
                                <div key={i} className="flex items-start gap-4 text-[12px]">
                                  <span className="text-zinc-500 w-24 shrink-0">{a.date}</span>
                                  <span className="text-zinc-200 flex-1">{a.action}</span>
                                  <span className="text-zinc-400 w-24 text-right">
                                    {a.amount != null ? fmt(a.amount) : '—'}
                                  </span>
                                  <span className="text-zinc-500 w-32 text-right">{a.agent}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  )
}
