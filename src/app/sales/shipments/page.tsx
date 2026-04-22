'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type SalesShipment = {
  id: string
  shipmentNo: string
  sellToCustomerName: string | null
  postingDate: string
  shipToName: string | null
  shippingAgentCode: string | null
  status: string
  orderId: string | null
}

const STATUS_COLORS: Record<string, string> = {
  Posted: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  Draft: 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/30',
}

function fmtDate(s: string | null | undefined) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SalesShipmentsPage() {
  const [shipments, setShipments] = useState<SalesShipment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sales/shipments')
      const data = await res.json()
      setShipments(Array.isArray(data) ? data : [])
    } catch {
      setShipments([])
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = shipments.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.shipmentNo.toLowerCase().includes(q) || (s.sellToCustomerName ?? '').toLowerCase().includes(q)
  })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      {/* TopBar */}
      <div className="border-b border-zinc-800 bg-[#0f0f1a] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Link href="/sales" className="hover:text-zinc-200">Sales</Link>
          <span>/</span>
          <span className="text-zinc-200">Posted Sales Shipments</span>
        </div>
        <span className="text-xs text-zinc-500">{filtered.length} records</span>
      </div>

      {/* Action Ribbon */}
      <div className="border-b border-zinc-800 bg-[#16213e] px-6 py-3">
        <h1 className="text-base font-semibold text-zinc-100 mb-3">Posted Sales Shipments</h1>
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
            Print
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
            Navigate
          </button>
        </div>
      </div>

      <div className="flex">
        <div className={cn('border-r border-zinc-800 bg-[#16213e] transition-all duration-200', filterOpen ? 'w-56' : 'w-0 overflow-hidden')}>
          {filterOpen && (
            <div className="p-4 space-y-4">
              <p className="text-xs text-zinc-500">No filters available</p>
            </div>
          )}
        </div>

        <div className="flex-1 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shipments..."
                className="w-full bg-[#16213e] border border-zinc-700 rounded pl-9 pr-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500" />
            </div>
            <button onClick={() => setFilterOpen(p => !p)}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs transition-colors', filterOpen ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-zinc-700 text-zinc-400 hover:text-zinc-200')}>
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
          </div>

          <div className="bg-[#16213e] border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#0f1829]">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    <span className="flex items-center gap-1 cursor-pointer hover:text-zinc-200">No. <ChevronDown className="w-3 h-3" /></span>
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Sell-to Customer</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Posting Date</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Ship-to Name</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Shipping Agent</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Source Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {loading && <tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-600">Loading...</td></tr>}
                {!loading && filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-600">No shipments found</td></tr>}
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-zinc-300 font-mono text-xs font-medium">
                        {s.shipmentNo.length > 12 ? s.shipmentNo.slice(-12) : s.shipmentNo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-200">{s.sellToCustomerName ?? <span className="text-zinc-600">—</span>}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{fmtDate(s.postingDate)}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{s.shipToName ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{s.shippingAgentCode ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-xs font-medium', STATUS_COLORS[s.status] ?? 'bg-zinc-700/50 text-zinc-400')}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.orderId ? (
                        <Link href={`/sales/orders/${s.orderId}`} className="text-xs text-blue-400 hover:text-blue-300 font-mono">
                          View Order
                        </Link>
                      ) : <span className="text-zinc-600 text-xs">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
