'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Tag, Users, Percent, PlayCircle, ChevronRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PriceBook {
  id: string
  name: string
  currency: string
  isDefault: boolean
  isActive: boolean
  _count: { entries: number }
}

interface PriceRule {
  id: string
  name: string
  ruleType: string
  isActive: boolean
  priority: number
  usageCount: number
  usageLimit: number | null
}

const RULE_TYPE_COLOR: Record<string, string> = {
  BOGO: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  BULK_DISCOUNT: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  FIXED_DISCOUNT: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  PCT_DISCOUNT: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  CUSTOMER_GROUP: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
}

export default function PricingHubPage() {
  const [books, setBooks] = useState<PriceBook[]>([])
  const [rules, setRules] = useState<PriceRule[]>([])
  const [groupCount, setGroupCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [bRes, rRes, gRes] = await Promise.all([
          fetch('/api/pricing/price-books'),
          fetch('/api/pricing/rules'),
          fetch('/api/pricing/customer-groups'),
        ])
        const bData = await bRes.json()
        const rData = await rRes.json()
        const gData = await gRes.json()
        setBooks(Array.isArray(bData) ? bData : [])
        setRules(Array.isArray(rData) ? rData : [])
        setGroupCount(Object.keys(gData).length)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const activeRules = rules.filter(r => r.isActive)

  const kpis = [
    { label: 'Price Books', value: books.length, icon: BookOpen, color: 'text-blue-400', href: '/pricing/price-books' },
    { label: 'Active Rules', value: activeRules.length, icon: Tag, color: 'text-violet-400', href: '/pricing/rules' },
    { label: 'Customer Groups', value: groupCount, icon: Users, color: 'text-emerald-400', href: '/pricing/customer-groups' },
    { label: 'Total Rules', value: rules.length, icon: Percent, color: 'text-amber-400', href: '/pricing/rules' },
  ]

  return (
    <div className="min-h-[100dvh] bg-zinc-950 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Advanced Pricing Engine</h1>
          <p className="text-zinc-400 text-sm mt-1">Price books, rules, group overrides &amp; simulator</p>
        </div>
        <Link href="/pricing/simulate" className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <PlayCircle className="w-4 h-4" />
          Price Simulator
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <Link key={kpi.label} href={kpi.href} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors group">
              <div className="flex items-center justify-between mb-3">
                <kpi.icon className={cn('w-5 h-5', kpi.color)} />
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </div>
              <div className="text-2xl font-bold text-zinc-100">{kpi.value}</div>
              <div className="text-zinc-400 text-sm mt-1">{kpi.label}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Books */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-zinc-100">Price Books</span>
            </div>
            <Link href="/pricing/price-books" className="text-zinc-400 hover:text-zinc-200 text-xs flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-zinc-800 rounded animate-pulse" />)}
            </div>
          ) : books.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No price books yet</p>
              <Link href="/pricing/price-books" className="mt-3 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                <Plus className="w-3 h-3" /> Create one
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {books.slice(0, 6).map(book => (
                <Link key={book.id} href={`/pricing/price-books/${book.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-2 h-2 rounded-full', book.isActive ? 'bg-emerald-400' : 'bg-zinc-600')} />
                    <div>
                      <div className="text-sm text-zinc-200 font-medium">{book.name}</div>
                      <div className="text-xs text-zinc-500">{book.currency} · {book._count.entries} entries</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {book.isDefault && (
                      <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">Default</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Active Rules Feed */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-violet-400" />
              <span className="font-semibold text-zinc-100">Active Rules</span>
            </div>
            <Link href="/pricing/rules" className="text-zinc-400 hover:text-zinc-200 text-xs flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-zinc-800 rounded animate-pulse" />)}
            </div>
          ) : activeRules.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active rules</p>
              <Link href="/pricing/rules" className="mt-3 inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300">
                <Plus className="w-3 h-3" /> Create one
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {activeRules.slice(0, 6).map(rule => (
                <Link key={rule.id} href={`/pricing/rules/${rule.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800/50 transition-colors">
                  <div>
                    <div className="text-sm text-zinc-200 font-medium">{rule.name}</div>
                    <div className="text-xs text-zinc-500">Priority {rule.priority} · {rule.usageCount}{rule.usageLimit ? `/${rule.usageLimit}` : ''} uses</div>
                  </div>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full border', RULE_TYPE_COLOR[rule.ruleType] ?? 'bg-zinc-700 text-zinc-300 border-zinc-600')}>
                    {rule.ruleType.replace(/_/g, ' ')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Price Books', desc: 'Manage catalogs', href: '/pricing/price-books', icon: BookOpen, color: 'text-blue-400' },
          { label: 'Rules', desc: 'BOGO, bulk, PCT', href: '/pricing/rules', icon: Tag, color: 'text-violet-400' },
          { label: 'Customer Groups', desc: 'Group overrides', href: '/pricing/customer-groups', icon: Users, color: 'text-emerald-400' },
          { label: 'Simulator', desc: 'Test pricing', href: '/pricing/simulate', icon: PlayCircle, color: 'text-amber-400' },
        ].map(item => (
          <Link key={item.href} href={item.href} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex items-center gap-3 transition-colors group">
            <item.icon className={cn('w-5 h-5 shrink-0', item.color)} />
            <div>
              <div className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100">{item.label}</div>
              <div className="text-xs text-zinc-500">{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
