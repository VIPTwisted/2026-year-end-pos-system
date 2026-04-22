'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Building2, TrendingDown, Package2, DollarSign, Calendar } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AssetGroup {
  id: string
  code: string
  name: string
  depreciationMethod: string
  usefulLifeYears: number
  salvageValuePct: number
}

interface DepreciationLine {
  id: string
  assetId: string
  fiscalYear: string
  periodNumber: number
  depreciationAmount: number
  accumulatedDepreciation: number
  bookValueAfter: number
  postedAt: string
}

interface FixedAsset {
  id: string
  assetNumber: string
  name: string
  description: string | null
  groupId: string
  acquisitionDate: string
  acquisitionCost: number
  salvageValue: number
  usefulLifeYears: number
  depreciationMethod: string
  currentBookValue: number
  accumulatedDeprec: number
  status: string
  location: string | null
  serialNumber: string | null
  notes: string | null
  disposedAt: string | null
  disposalAmount: number | null
  createdAt: string
  updatedAt: string
  group: AssetGroup
  depreciationLines: DepreciationLine[]
}

interface RegisterResponse {
  assets: FixedAsset[]
  groups: AssetGroup[]
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function methodLabel(m: string): string {
  const map: Record<string, string> = {
    straight_line: 'Straight-Line',
    declining_balance: 'Declining Bal.',
    sum_of_years: 'Sum of Years',
    units_of_production: 'Units of Prod.',
    manual: 'Manual',
  }
  return map[m] ?? m
}

function statusBadge(status: string): string {
  const map: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400',
    disposed: 'bg-zinc-700/60 text-zinc-400',
    fully_depreciated: 'bg-amber-500/10 text-amber-400',
    inactive: 'bg-zinc-700/40 text-zinc-500',
  }
  return map[status] ?? 'bg-zinc-700/40 text-zinc-500'
}

// Compute projected depreciation schedule (straight-line only for now)
function buildSchedule(asset: FixedAsset): { year: number; amount: number; accumulated: number; bookValue: number }[] {
  const depreciable = asset.acquisitionCost - asset.salvageValue
  if (depreciable <= 0 || asset.usefulLifeYears <= 0) return []
  const annualDeprec = depreciable / asset.usefulLifeYears
  const schedule = []
  let accumulated = asset.accumulatedDeprec
  const startYear = new Date(asset.acquisitionDate).getFullYear()
  for (let i = 0; i < asset.usefulLifeYears; i++) {
    const yearDeprec = Math.min(annualDeprec, Math.max(0, asset.acquisitionCost - asset.salvageValue - accumulated))
    if (yearDeprec <= 0) break
    accumulated += yearDeprec
    schedule.push({
      year: startYear + i + 1,
      amount: yearDeprec,
      accumulated,
      bookValue: asset.acquisitionCost - accumulated,
    })
  }
  return schedule
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AssetRegisterPage() {
  const [data, setData] = useState<RegisterResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'register' | 'depreciation'>('register')
  const [statusFilter, setStatusFilter] = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (groupFilter) params.set('groupId', groupFilter)
    const url = `/api/assets/register${params.toString() ? '?' + params.toString() : ''}`
    fetch(url)
      .then(r => r.json())
      .then((d: RegisterResponse | { error: string }) => {
        if ('error' in d) { setError(d.error); setData(null) }
        else setData(d)
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [statusFilter, groupFilter])

  useEffect(() => { load() }, [load])

  const assets = data?.assets ?? []
  const groups = data?.groups ?? []

  const totals = {
    count: assets.length,
    acquisitionCost: assets.reduce((s, a) => s + a.acquisitionCost, 0),
    accumulatedDeprec: assets.reduce((s, a) => s + a.accumulatedDeprec, 0),
    netBookValue: assets.reduce((s, a) => s + a.currentBookValue, 0),
  }

  return (
    <>
      <TopBar
        title="Asset Register"
        actions={
          <Link
            href="/fixed-assets/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            + New Asset
          </Link>
        }
      />

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* Header */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Finance / Fixed Assets</p>
            <h2 className="text-xl font-bold text-zinc-100">Asset Register</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Full asset register with depreciation schedules</p>
          </div>

          {/* KPI tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Assets', value: totals.count.toString(), icon: Package2, color: 'text-blue-400' },
              { label: 'Acquisition Cost', value: fmt(totals.acquisitionCost), icon: DollarSign, color: 'text-zinc-100' },
              { label: 'Accum. Depreciation', value: fmt(totals.accumulatedDeprec), icon: TrendingDown, color: 'text-red-400' },
              { label: 'Net Book Value', value: fmt(totals.netBookValue), icon: Building2, color: 'text-emerald-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{label}</p>
                </div>
                <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-[#16213e] border border-zinc-800/50 rounded-lg p-1 w-fit">
            {(['register', 'depreciation'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-[12px] font-medium capitalize transition-colors ${
                  activeTab === tab ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {tab === 'register' ? 'Asset Register' : 'Depreciation Schedule'}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="fully_depreciated">Fully Depreciated</option>
              <option value="disposed">Disposed</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={groupFilter}
              onChange={e => setGroupFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">All Categories</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-5 py-3 text-sm text-red-400">{error}</div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex items-center justify-center py-20">
              <div className="w-5 h-5 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
            </div>
          )}

          {/* ── REGISTER TAB ── */}
          {!loading && activeTab === 'register' && (
            assets.length === 0 ? (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16 text-zinc-600">
                <Package2 className="w-8 h-8 mb-3 opacity-30" />
                <p className="text-[13px]">No assets found.</p>
              </div>
            ) : (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-zinc-800/60">
                      <tr>
                        {[
                          { h: 'Asset #', cls: 'text-left w-28' },
                          { h: 'Name', cls: 'text-left' },
                          { h: 'Category', cls: 'text-left' },
                          { h: 'Acq. Date', cls: 'text-left' },
                          { h: 'Method', cls: 'text-left' },
                          { h: 'Cost', cls: 'text-right' },
                          { h: 'Accum. Depr.', cls: 'text-right' },
                          { h: 'Net Book Value', cls: 'text-right' },
                          { h: 'Status', cls: 'text-center' },
                        ].map(({ h, cls }) => (
                          <th key={h} className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 ${cls}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {assets.map(asset => (
                        <tr key={asset.id} className="hover:bg-zinc-800/20 transition-colors">
                          <td className="px-4 py-3">
                            <Link
                              href={`/fixed-assets/${asset.id}`}
                              className="font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              {asset.assetNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-zinc-100 font-medium">{asset.name}</p>
                            {asset.description && (
                              <p className="text-[11px] text-zinc-500 mt-0.5 truncate max-w-[200px]">{asset.description}</p>
                            )}
                            {asset.location && (
                              <p className="text-[10px] text-zinc-600 mt-0.5">{asset.location}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-zinc-300">{asset.group.name}</p>
                            <p className="text-[11px] text-zinc-600">{asset.group.code}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-400 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 opacity-50" />
                              {fmtDate(asset.acquisitionDate)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-400">
                            {methodLabel(asset.depreciationMethod)}
                            <p className="text-[11px] text-zinc-600">{asset.usefulLifeYears}yr</p>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm tabular-nums text-zinc-100">
                            {fmt(asset.acquisitionCost)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm tabular-nums text-red-400">
                            {fmt(asset.accumulatedDeprec)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm tabular-nums font-semibold text-emerald-400">
                            {fmt(asset.currentBookValue)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${statusBadge(asset.status)}`}>
                              {asset.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {/* ── DEPRECIATION SCHEDULE TAB ── */}
          {!loading && activeTab === 'depreciation' && (
            <div className="space-y-4">
              {assets.filter(a => a.status === 'active').length === 0 ? (
                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16 text-zinc-600">
                  <TrendingDown className="w-8 h-8 mb-3 opacity-30" />
                  <p className="text-[13px]">No active assets to show schedules for.</p>
                </div>
              ) : (
                assets
                  .filter(a => a.status === 'active')
                  .map(asset => {
                    const schedule = buildSchedule(asset)
                    const isOpen = expandedId === asset.id
                    return (
                      <div key={asset.id} className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                        {/* Asset header row */}
                        <button
                          onClick={() => setExpandedId(isOpen ? null : asset.id)}
                          className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/20 transition-colors text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-mono text-xs text-zinc-500">{asset.assetNumber}</p>
                              <p className="text-sm font-semibold text-zinc-100">{asset.name}</p>
                            </div>
                            <div className="hidden sm:block text-[11px] text-zinc-500">
                              {asset.group.name} · {methodLabel(asset.depreciationMethod)} · {asset.usefulLifeYears}yr
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right hidden md:block">
                              <p className="text-[10px] text-zinc-500">Cost</p>
                              <p className="font-mono text-sm text-zinc-300">{fmt(asset.acquisitionCost)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-zinc-500">Net Book Value</p>
                              <p className="font-mono text-sm font-semibold text-emerald-400">{fmt(asset.currentBookValue)}</p>
                            </div>
                            <svg
                              className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {/* Expanded schedule */}
                        {isOpen && (
                          <div className="border-t border-zinc-800/60">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-zinc-800/40">
                                  <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Year</th>
                                  <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Depreciation</th>
                                  <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Accum. Depr.</th>
                                  <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Book Value</th>
                                  <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Posted</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-800/30">
                                {schedule.map((row) => {
                                  const posted = asset.depreciationLines.find(
                                    dl => parseInt(dl.fiscalYear) === row.year
                                  )
                                  return (
                                    <tr key={row.year} className={`${posted ? 'bg-zinc-900/30' : ''} hover:bg-zinc-800/10 transition-colors`}>
                                      <td className="px-5 py-2.5 text-zinc-300 tabular-nums">{row.year}</td>
                                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-amber-400">{fmt(row.amount)}</td>
                                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-red-400">{fmt(row.accumulated)}</td>
                                      <td className="px-4 py-2.5 text-right font-mono tabular-nums font-semibold text-emerald-400">{fmt(row.bookValue)}</td>
                                      <td className="px-4 py-2.5 text-center">
                                        {posted ? (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400">
                                            Posted
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-700/60 text-zinc-500">
                                            Projected
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )
                  })
              )}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
