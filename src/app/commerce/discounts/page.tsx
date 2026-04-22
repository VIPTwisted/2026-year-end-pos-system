'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Percent, Plus, RefreshCw, ChevronRight, Filter } from 'lucide-react'

interface Discount {
  id: string
  discountCode: string
  name: string
  discountType: string
  discountMethod: string
  discountValue: number
  status: string
  startDate: string | null
  endDate: string | null
  priceGroup: { code: string; name: string } | null
  _count: { lines: number; usages: number }
}

const TYPE_STYLES: Record<string, string> = {
  simple: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  quantity: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  mix_match: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  threshold: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

const TYPE_LABELS: Record<string, string> = {
  simple: 'Simple',
  quantity: 'Quantity',
  mix_match: 'Mix & Match',
  threshold: 'Threshold',
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  inactive: 'bg-zinc-700/30 text-zinc-500 border-zinc-700/40',
  expired: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

function formatDate(dt: string | null) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter) params.set('type', typeFilter)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/commerce/discounts?${params}`)
      const data = await res.json()
      setDiscounts(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [typeFilter, statusFilter])

  return (
    <>
      <TopBar title="Discounts" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Discounts</h1>
            <p className="text-sm text-zinc-500">{discounts.length} discount(s)</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link href="/commerce/discounts/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> New Discount
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-zinc-500" />
          <div className="flex gap-2 flex-wrap">
            {['', 'simple', 'quantity', 'mix_match', 'threshold'].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  typeFilter === t ? 'bg-indigo-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                }`}>
                {t === '' ? 'All Types' : TYPE_LABELS[t]}
              </button>
            ))}
            <span className="w-px h-5 bg-zinc-700 self-center mx-1" />
            {['', 'active', 'inactive', 'expired'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                }`}>
                {s === '' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <Card><CardContent className="flex items-center justify-center py-16 text-zinc-600">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading…
          </CardContent></Card>
        ) : discounts.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <Percent className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm">No discounts found.</p>
            <Link href="/commerce/discounts/new" className="text-xs text-indigo-400 hover:text-indigo-300 mt-2">
              Create your first discount
            </Link>
          </CardContent></Card>
        ) : (
          <Card>
            <CardContent className="px-0 py-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-6 py-3">Discount ID</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Name</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Type</th>
                      <th className="text-right text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Discount</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Start</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">End</th>
                      <th className="text-center text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Status</th>
                      <th className="text-right px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map(d => (
                      <tr key={d.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-3">
                          <span className="font-mono text-xs bg-zinc-800 text-indigo-300 px-2 py-0.5 rounded">{d.discountCode}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-zinc-200">{d.name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded border ${TYPE_STYLES[d.discountType] ?? TYPE_STYLES.simple}`}>
                            {TYPE_LABELS[d.discountType] ?? d.discountType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-zinc-300">
                          {d.discountMethod === 'percent' ? `${d.discountValue}%` : `$${d.discountValue.toFixed(2)}`}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{formatDate(d.startDate)}</td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{formatDate(d.endDate)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_STYLES[d.status] ?? STATUS_STYLES.inactive}`}>
                            {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ChevronRight className="w-4 h-4 text-zinc-600 ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
