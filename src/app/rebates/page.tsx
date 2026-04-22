'use client'

// TODO: Add RebateAgreement model to Prisma schema when ready.
// Static mock data used until schema is defined.

import { useState } from 'react'
import Link from 'next/link'
import { DollarSign, Plus, ChevronRight, TrendingUp, ArrowUpDown, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RebateAgreement {
  id: string
  name: string
  party: string
  partyType: 'vendor' | 'customer'
  type: 'vendor-funded' | 'customer-earned'
  rebatePct: number
  threshold: number
  accrued: number
  status: 'active' | 'pending' | 'expired' | 'closed'
  startDate: string
  endDate: string
}

const MOCK_REBATES: RebateAgreement[] = [
  {
    id: 'r001',
    name: 'Q2 Vendor Volume Rebate',
    party: 'Apex Electronics Inc.',
    partyType: 'vendor',
    type: 'vendor-funded',
    rebatePct: 3.5,
    threshold: 50000,
    accrued: 4312.50,
    status: 'active',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
  },
  {
    id: 'r002',
    name: 'Gold Customer Loyalty Rebate',
    party: 'MegaRetail Corp',
    partyType: 'customer',
    type: 'customer-earned',
    rebatePct: 2.0,
    threshold: 100000,
    accrued: 8750.00,
    status: 'active',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
  },
  {
    id: 'r003',
    name: 'Seasonal Promo Rebate — Spring',
    party: 'FlexSupply Co.',
    partyType: 'vendor',
    type: 'vendor-funded',
    rebatePct: 5.0,
    threshold: 25000,
    accrued: 3125.00,
    status: 'active',
    startDate: '2026-03-01',
    endDate: '2026-05-31',
  },
  {
    id: 'r004',
    name: 'Platinum Tier Annual Agreement',
    party: 'Prestige Wholesale Ltd.',
    partyType: 'customer',
    type: 'customer-earned',
    rebatePct: 4.5,
    threshold: 500000,
    accrued: 22500.00,
    status: 'active',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
  },
  {
    id: 'r005',
    name: 'FY2025 Annual Volume Incentive',
    party: 'NorthStar Distributors',
    partyType: 'vendor',
    type: 'vendor-funded',
    rebatePct: 2.75,
    threshold: 200000,
    accrued: 15400.00,
    status: 'closed',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  },
  {
    id: 'r006',
    name: 'New Partner Onboarding Rebate',
    party: 'SunBridge Retail',
    partyType: 'customer',
    type: 'customer-earned',
    rebatePct: 1.5,
    threshold: 10000,
    accrued: 0,
    status: 'pending',
    startDate: '2026-05-01',
    endDate: '2026-10-31',
  },
]

const STATUS_STYLE: Record<string, string> = {
  active:  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  expired: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
  closed:  'bg-zinc-700/20 text-zinc-500 border-zinc-700/30',
}

const TYPE_STYLE: Record<string, string> = {
  'vendor-funded':   'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'customer-earned': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
}

export default function RebatesPage() {
  const [filter, setFilter] = useState<'all' | 'vendor-funded' | 'customer-earned'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'closed'>('all')

  const filtered = MOCK_REBATES.filter(r => {
    const typeMatch   = filter === 'all' || r.type === filter
    const statusMatch = statusFilter === 'all' || r.status === statusFilter
    return typeMatch && statusMatch
  })

  const totalAccrued = filtered.reduce((sum, r) => sum + r.accrued, 0)
  const activeCount  = MOCK_REBATES.filter(r => r.status === 'active').length
  const vendorCount  = MOCK_REBATES.filter(r => r.type === 'vendor-funded').length
  const customerCount = MOCK_REBATES.filter(r => r.type === 'customer-earned').length

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Rebate Management</h1>
          <p className="text-zinc-500 text-xs mt-0.5">Vendor-funded &amp; customer-earned rebate agreements</p>
        </div>
        <Link
          href="/rebates/new"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Agreement
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-zinc-500">Total Accrued</span>
          </div>
          <div className="text-xl font-bold text-zinc-100">{fmtMoney(MOCK_REBATES.reduce((s, r) => s + r.accrued, 0))}</div>
        </div>
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-zinc-500">Active Agreements</span>
          </div>
          <div className="text-xl font-bold text-zinc-100">{activeCount}</div>
        </div>
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpDown className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-500">Vendor-Funded</span>
          </div>
          <div className="text-xl font-bold text-zinc-100">{vendorCount}</div>
        </div>
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-zinc-500">Customer-Earned</span>
          </div>
          <div className="text-xl font-bold text-zinc-100">{customerCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          {(['all', 'vendor-funded', 'customer-earned'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize',
                filter === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              {t === 'all' ? 'All Types' : t.replace('-', ' ')}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          {(['all', 'active', 'pending', 'closed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize',
                statusFilter === s ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              {s === 'all' ? 'All Status' : s}
            </button>
          ))}
        </div>
        <span className="text-zinc-600 text-xs ml-auto">
          Showing {filtered.length} of {MOCK_REBATES.length} · Accrued: {fmtMoney(totalAccrued)}
        </span>
      </div>

      {/* Table */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-zinc-800">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-zinc-100">Rebate Agreements</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Agreement</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Vendor / Customer</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Type</th>
                <th className="text-right px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Rebate %</th>
                <th className="text-right px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Threshold</th>
                <th className="text-right px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Accrued</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Period</th>
                <th className="text-center px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-200">{r.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-zinc-300 text-sm">{r.party}</div>
                    <div className="text-xs text-zinc-600 capitalize">{r.partyType}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full border', TYPE_STYLE[r.type])}>
                      {r.type.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-zinc-300">{r.rebatePct.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-right font-mono text-zinc-400">{fmtMoney(r.threshold)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-emerald-400 font-medium">{fmtMoney(r.accrued)}</span>
                    <div className="w-24 h-1 bg-zinc-800 rounded-full mt-1 ml-auto">
                      <div
                        className="h-1 bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, (r.accrued / (r.threshold * r.rebatePct / 100)) * 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {fmtDate(r.startDate)} → {fmtDate(r.endDate)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full border capitalize', STATUS_STYLE[r.status])}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/rebates/${r.id}`} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
