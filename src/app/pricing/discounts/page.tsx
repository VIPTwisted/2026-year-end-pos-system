'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tag, Plus, ChevronLeft, Filter } from 'lucide-react'

interface Discount {
  id: string
  name: string
  discountCode: string
  discountType: string
  discountMethod: string
  discountValue: number
  status: string
  startDate: string | null
  endDate: string | null
  usageCount: number
  maxUsageCount: number | null
  _count: { usages: number }
}

const TYPE_LABELS: Record<string, string> = {
  simple: 'Simple',
  quantity: 'Quantity',
  mix_match: 'Mix & Match',
  threshold: 'Threshold',
}

function statusVariant(status: string): 'success' | 'secondary' | 'destructive' {
  if (status === 'active') return 'success'
  if (status === 'expired') return 'destructive'
  return 'secondary'
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (typeFilter) params.set('type', typeFilter)
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/pricing/discounts?${params}`)
    const data = await res.json()
    setDiscounts(data)
    setLoading(false)
  }, [typeFilter, statusFilter])

  useEffect(() => { load() }, [load])

  return (
    <>
      <TopBar title="Discounts" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Discounts &amp; Promotions</h2>
              <p className="text-sm text-zinc-500">{discounts.length} discount{discounts.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Link href="/pricing/discounts/new">
            <Button><Plus className="w-4 h-4 mr-1" />New Discount</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select
            className="h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="simple">Simple</option>
            <option value="quantity">Quantity</option>
            <option value="mix_match">Mix &amp; Match</option>
            <option value="threshold">Threshold</option>
          </select>
          <select
            className="h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
          {(typeFilter || statusFilter) && (
            <Button variant="ghost" size="sm" onClick={() => { setTypeFilter(''); setStatusFilter('') }}>
              Clear
            </Button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-sm text-zinc-500">Loading...</p>
        ) : discounts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Tag className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm mb-4">No discounts found.</p>
              <Link href="/pricing/discounts/new">
                <Button size="sm"><Plus className="w-4 h-4 mr-1" />New Discount</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Code</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-right p-4 font-medium">Value</th>
                      <th className="text-center p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Start</th>
                      <th className="text-left p-4 font-medium">End</th>
                      <th className="text-right p-4 font-medium">Usage</th>
                      <th className="text-center p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {discounts.map(d => (
                      <tr key={d.id} className="hover:bg-zinc-900/50">
                        <td className="p-4 font-semibold text-zinc-100">
                          <Link href={`/pricing/discounts/${d.id}`} className="hover:text-blue-400 transition-colors">
                            {d.name}
                          </Link>
                        </td>
                        <td className="p-4 font-mono text-xs text-zinc-400">{d.discountCode}</td>
                        <td className="p-4 text-zinc-400">{TYPE_LABELS[d.discountType] ?? d.discountType}</td>
                        <td className="p-4 text-right font-mono text-zinc-200">
                          {d.discountMethod === 'percent' ? `${d.discountValue}%` : `$${d.discountValue.toFixed(2)}`}
                        </td>
                        <td className="p-4 text-center">
                          <Badge variant={statusVariant(d.status)}>{d.status}</Badge>
                        </td>
                        <td className="p-4 text-zinc-500 text-xs">{fmtDate(d.startDate)}</td>
                        <td className="p-4 text-zinc-500 text-xs">{fmtDate(d.endDate)}</td>
                        <td className="p-4 text-right text-zinc-400">
                          {d._count.usages}
                          {d.maxUsageCount !== null && (
                            <span className="text-zinc-600"> / {d.maxUsageCount}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <Link href={`/pricing/discounts/${d.id}`}>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </Link>
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
