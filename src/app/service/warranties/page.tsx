'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, AlertTriangle, Search } from 'lucide-react'

type WarrantyItem = {
  id: string
  description: string
  serialNumber: string | null
  warrantyStart: string | null
  warrantyEnd: string | null
  status: string
  customer: { id: string; firstName: string; lastName: string } | null
  product: { id: string; name: string } | null
  contract: { id: string; contractNumber: string } | null
}

type KPIs = { active: number; expiringIn30: number; expired: number; claimsThisMonth: number }

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function warrantyBadge(warrantyEnd: string | null) {
  if (!warrantyEnd) return { label: 'No Warranty', variant: 'secondary' as const }
  const now = new Date()
  const end = new Date(warrantyEnd)
  if (end < now) return { label: 'Expired', variant: 'destructive' as const }
  const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 30) return { label: `${days}d left`, variant: 'warning' as const }
  return { label: 'Active', variant: 'success' as const }
}

export default function WarrantiesPage() {
  const [items, setItems] = useState<WarrantyItem[]>([])
  const [kpis, setKpis] = useState<KPIs>({ active: 0, expiringIn30: 0, expired: 0, claimsThisMonth: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [lookupSerial, setLookupSerial] = useState('')
  const [lookupResult, setLookupResult] = useState<WarrantyItem[] | null>(null)
  const [looking, setLooking] = useState(false)

  useEffect(() => {
    fetch('/api/service/warranties')
      .then(r => r.json())
      .then(d => { setItems(d.items); setKpis(d.kpis) })
      .finally(() => setLoading(false))
  }, [])

  async function lookup() {
    if (!lookupSerial.trim()) return
    setLooking(true)
    const res = await fetch(`/api/service/warranties?serialNumber=${encodeURIComponent(lookupSerial)}`)
    const d = await res.json()
    setLookupResult(d.items)
    setLooking(false)
  }

  const filtered = items.filter(i => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      i.description.toLowerCase().includes(q) ||
      (i.serialNumber ?? '').toLowerCase().includes(q) ||
      (i.customer ? `${i.customer.firstName} ${i.customer.lastName}`.toLowerCase().includes(q) : false)
    )
  })

  return (
    <>
      <TopBar title="Warranties" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="pt-5 pb-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Active Warranties</p>
            <p className="text-2xl font-bold text-emerald-400">{kpis.active}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 pb-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Expiring ≤30d</p>
            <p className={`text-2xl font-bold ${kpis.expiringIn30 > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>{kpis.expiringIn30}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 pb-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Expired</p>
            <p className={`text-2xl font-bold ${kpis.expired > 0 ? 'text-red-400' : 'text-zinc-400'}`}>{kpis.expired}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 pb-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Claims This Month</p>
            <p className="text-2xl font-bold text-zinc-100">{kpis.claimsThisMonth}</p>
          </CardContent></Card>
        </div>

        {/* Warranty lookup */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-sm font-medium text-zinc-300 mb-3">Warranty Lookup by Serial Number</p>
            <div className="flex gap-2 max-w-md">
              <Input
                value={lookupSerial}
                onChange={e => setLookupSerial(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && lookup()}
                placeholder="Enter serial number…"
                className="font-mono"
              />
              <Button onClick={lookup} disabled={looking || !lookupSerial}>
                <Search className="w-4 h-4 mr-1" />
                {looking ? 'Looking…' : 'Lookup'}
              </Button>
            </div>
            {lookupResult !== null && (
              <div className="mt-4">
                {lookupResult.length === 0 ? (
                  <p className="text-sm text-zinc-500">No warranty found for that serial number.</p>
                ) : (
                  <div className="space-y-2">
                    {lookupResult.map(item => {
                      const wb = warrantyBadge(item.warrantyEnd)
                      return (
                        <div key={item.id} className="flex items-center gap-4 rounded-lg border border-zinc-800 p-3 bg-zinc-900/60">
                          <Shield className="w-5 h-5 text-zinc-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-100">{item.description}</p>
                            <p className="text-xs text-zinc-500 font-mono">SN: {item.serialNumber}</p>
                            {item.customer && <p className="text-xs text-zinc-400">{item.customer.firstName} {item.customer.lastName}</p>}
                          </div>
                          <div className="text-right shrink-0">
                            <Badge variant={wb.variant} className="text-xs mb-1">{wb.label}</Badge>
                            <p className="text-xs text-zinc-500">Expires: {formatDate(item.warrantyEnd)}</p>
                          </div>
                          <Button asChild size="sm" variant="ghost">
                            <Link href={`/service/items/${item.id}`}>View</Link>
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Warranty list */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-zinc-100">All Warranty Registrations</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search items…"
                  className="pl-8 pr-3 h-8 rounded-md border border-zinc-700 bg-zinc-900 text-sm text-zinc-100 w-48"
                />
              </div>
              <Button asChild size="sm">
                <Link href="/service/items/new">Register Item</Link>
              </Button>
            </div>
          </div>

          {loading ? (
            <p className="text-zinc-500 text-sm">Loading…</p>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <Shield className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No warranty registrations found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Product / Item</th>
                    <th className="text-left pb-3 font-medium">Serial #</th>
                    <th className="text-left pb-3 font-medium">Customer</th>
                    <th className="text-left pb-3 font-medium">Purchase Date</th>
                    <th className="text-center pb-3 font-medium">Warranty</th>
                    <th className="text-left pb-3 font-medium">Expires</th>
                    <th className="text-right pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filtered.map(item => {
                    const wb = warrantyBadge(item.warrantyEnd)
                    return (
                      <tr key={item.id} className="hover:bg-zinc-900/50">
                        <td className="py-3 pr-4 text-zinc-300">
                          <div className="flex items-center gap-1.5">
                            {wb.variant === 'warning' && <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />}
                            {wb.variant === 'destructive' && <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />}
                            <Link href={`/service/items/${item.id}`} className="hover:text-blue-400 truncate max-w-[160px]">
                              {item.description}
                            </Link>
                          </div>
                          {item.product && <p className="text-xs text-zinc-600 mt-0.5">{item.product.name}</p>}
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs text-zinc-500">{item.serialNumber ?? '—'}</td>
                        <td className="py-3 pr-4 text-zinc-400 text-xs">
                          {item.customer ? `${item.customer.firstName} ${item.customer.lastName}` : '—'}
                        </td>
                        <td className="py-3 pr-4 text-zinc-500 text-xs">{formatDate(item.warrantyStart)}</td>
                        <td className="py-3 pr-4 text-center">
                          <Badge variant={wb.variant} className="text-xs">{wb.label}</Badge>
                        </td>
                        <td className="py-3 pr-4 text-zinc-400 text-xs">{formatDate(item.warrantyEnd)}</td>
                        <td className="py-3 text-right">
                          <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                            <Link href={`/service/items/${item.id}`}>View</Link>
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
