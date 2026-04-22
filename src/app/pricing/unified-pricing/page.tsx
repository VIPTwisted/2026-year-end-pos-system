'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Tag, Users, BookOpen, ArrowLeftRight, Plus, ChevronRight,
  ToggleRight, ToggleLeft, Calendar, Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface UnifiedRule {
  id: string
  name: string
  ruleType: string         // base | discount | markup | margin | BOGO | BULK_DISCOUNT | FIXED_DISCOUNT | PCT_DISCOUNT
  priority: number
  validFrom: string | null
  validTo: string | null
  channels: string[]
  isActive: boolean
  source: 'price_rule' | 'price_book'
}

interface UnifiedStats {
  activeRules: number
  priceGroups: number
  b2bAccounts: number
  tradeAgreements: number
}

const TYPE_COLOR: Record<string, string> = {
  base:           'bg-blue-500/20 text-blue-300 border-blue-500/30',
  discount:       'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  markup:         'bg-amber-500/20 text-amber-300 border-amber-500/30',
  margin:         'bg-violet-500/20 text-violet-300 border-violet-500/30',
  BOGO:           'bg-rose-500/20 text-rose-300 border-rose-500/30',
  BULK_DISCOUNT:  'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  FIXED_DISCOUNT: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  PCT_DISCOUNT:   'bg-amber-500/20 text-amber-300 border-amber-500/30',
  CUSTOMER_GROUP: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
}

function typeBadge(t: string) {
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full border', TYPE_COLOR[t] ?? 'bg-zinc-700 text-zinc-300 border-zinc-600')}>
      {t.replace(/_/g, ' ')}
    </span>
  )
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
}

export default function UnifiedPricingPage() {
  const [stats, setStats] = useState<UnifiedStats>({ activeRules: 0, priceGroups: 0, b2bAccounts: 0, tradeAgreements: 0 })
  const [rules, setRules] = useState<UnifiedRule[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/pricing/unified')
        const data = await res.json()
        setStats(data.stats ?? { activeRules: 0, priceGroups: 0, b2bAccounts: 0, tradeAgreements: 0 })
        setRules(Array.isArray(data.rules) ? data.rules : [])
      } catch {
        console.error('Failed to load unified pricing')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const allTypes = ['All', ...Array.from(new Set(rules.map(r => r.ruleType)))]

  const filtered = rules.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'All' || r.ruleType === filterType
    return matchSearch && matchType
  })

  const kpis = [
    { label: 'Active Price Rules', value: stats.activeRules, icon: Tag, color: 'text-violet-400', href: '/pricing/rules' },
    { label: 'Price Groups', value: stats.priceGroups, icon: Layers, color: 'text-blue-400', href: '/pricing/price-groups' },
    { label: 'B2B w/ Custom Pricing', value: stats.b2bAccounts, icon: Users, color: 'text-emerald-400', href: '/b2b' },
    { label: 'Trade Agreements', value: stats.tradeAgreements, icon: ArrowLeftRight, color: 'text-amber-400', href: '/pricing/price-books' },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/pricing" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Pricing</Link>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Unified Pricing Engine</h1>
            <p className="text-zinc-500 text-xs mt-0.5">Consolidated view of all active price rules, books &amp; trade agreements</p>
          </div>
        </div>
        <Link
          href="/pricing/unified-pricing/rules/new"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Rule
        </Link>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(kpi => (
            <Link key={kpi.label} href={kpi.href}
              className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4 hover:border-zinc-700 transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <kpi.icon className={cn('w-5 h-5', kpi.color)} />
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </div>
              <div className="text-2xl font-bold text-zinc-100">{kpi.value}</div>
              <div className="text-zinc-400 text-xs mt-1">{kpi.label}</div>
            </Link>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search rules..."
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 w-56"
        />
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          {allTypes.map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                filterType === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              {t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-violet-400" />
            <span className="font-semibold text-zinc-100">Price Rules</span>
            <span className="text-zinc-500 text-sm">({filtered.length})</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <BookOpen className="w-3.5 h-3.5" />
            Aggregated from PriceRule + PriceBook
          </div>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-zinc-800/50 rounded animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No rules found</p>
            <Link href="/pricing/unified-pricing/rules/new" className="mt-3 inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300">
              <Plus className="w-3 h-3" /> Create first rule
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Rule Name</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Type</th>
                  <th className="text-center px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Priority</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Date Range</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Channels</th>
                  <th className="text-center px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.map(rule => (
                  <tr key={rule.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-200">{rule.name}</div>
                      <div className="text-xs text-zinc-600 mt-0.5 capitalize">{rule.source.replace('_', ' ')}</div>
                    </td>
                    <td className="px-4 py-3">{typeBadge(rule.ruleType)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded-full font-mono">{rule.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <Calendar className="w-3 h-3 text-zinc-600" />
                        {fmtDate(rule.validFrom)} → {fmtDate(rule.validTo)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {rule.channels.length === 0 ? (
                        <span className="text-xs text-zinc-600">All channels</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {rule.channels.map(ch => (
                            <span key={ch} className="text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">{ch}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {rule.isActive
                        ? <ToggleRight className="w-5 h-5 text-emerald-400 inline" />
                        : <ToggleLeft className="w-5 h-5 text-zinc-600 inline" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
