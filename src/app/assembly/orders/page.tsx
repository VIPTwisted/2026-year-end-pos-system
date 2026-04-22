'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import {
  Plus, RefreshCw, ChevronRight, Package, Filter,
  CheckCircle2, Clock, Play, FileCheck
} from 'lucide-react'

interface AssemblyOrder {
  id: string
  orderNo: string
  itemNo: string | null
  description: string | null
  qtyToAssemble: number
  qtyAssembled: number
  unitOfMeasure: string
  dueDate: string | null
  locationCode: string | null
  status: string
  isPosted: boolean
  createdAt: string
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Open: 'bg-zinc-700/40 text-zinc-300 border-zinc-600/30',
    Released: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'In Progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Finished: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30'}`}>
      {status}
    </span>
  )
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  Open: <Clock className="w-3.5 h-3.5" />,
  Released: <Play className="w-3.5 h-3.5" />,
  'In Progress': <RefreshCw className="w-3.5 h-3.5" />,
  Finished: <CheckCircle2 className="w-3.5 h-3.5" />,
}

export default function AssemblyOrdersPage() {
  const [orders, setOrders] = useState<AssemblyOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const p = new URLSearchParams()
    if (statusFilter) p.set('status', statusFilter)
    fetch(`/api/assembly/orders?${p}`)
      .then(r => r.json())
      .then((d: AssemblyOrder[]) => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  const filtered = search
    ? orders.filter(o =>
        o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
        (o.itemNo ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (o.description ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : orders

  const stats = {
    open: orders.filter(o => o.status === 'Open').length,
    released: orders.filter(o => o.status === 'Released').length,
    inProgress: orders.filter(o => o.status === 'In Progress').length,
    finished: orders.filter(o => o.status === 'Finished').length,
  }

  return (
    <>
      <TopBar title="Assembly Orders" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Assembly Management</p>
              <h2 className="text-xl font-bold text-zinc-100">Assembly Orders</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Assemble items from components on demand</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={load} className="h-8 w-8 flex items-center justify-center rounded border border-zinc-700/60 bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <Link href="/assembly/orders/new">
                <button className="h-8 px-4 rounded text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />New Order
                </button>
              </Link>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Open', value: stats.open, icon: Clock, color: 'text-zinc-300' },
              { label: 'Released', value: stats.released, icon: Play, color: 'text-blue-400' },
              { label: 'In Progress', value: stats.inProgress, icon: RefreshCw, color: 'text-amber-400' },
              { label: 'Finished', value: stats.finished, icon: FileCheck, color: 'text-emerald-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">{label}</div>
                <div className={`text-2xl font-bold tabular-nums ${color}`}>{value}</div>
                <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                  <Icon className={`w-3 h-3 ${color}`} />orders
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search order no., item…"
              className="h-8 px-3 rounded text-[12px] bg-zinc-800/60 border border-zinc-700/60 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 w-52"
            />
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              {['', 'Open', 'Released', 'In Progress', 'Finished'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`h-7 px-3 rounded text-[11px] font-medium transition-colors border ${
                    statusFilter === s
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:bg-zinc-700/60'
                  }`}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-14 text-zinc-600">
              <Package className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-[13px]">No assembly orders found.</p>
              <Link href="/assembly/orders/new">
                <button className="mt-3 h-8 px-4 rounded text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  Create First Order
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['No.', 'Item No.', 'Description', 'Qty to Assemble', 'Unit of Measure', 'Due Date', 'Status', ''].map(h => (
                        <th key={h} className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap ${h === '' ? 'w-10' : 'text-left'} ${h === 'Qty to Assemble' ? 'text-right' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {filtered.map(o => (
                      <tr key={o.id} className="hover:bg-zinc-800/20 transition-colors group">
                        <td className="px-4 py-3">
                          <Link href={`/assembly/orders/${o.id}`} className="font-mono text-[13px] font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                            {o.orderNo}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px] text-zinc-300">{o.itemNo ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-zinc-200 max-w-[200px] truncate">{o.description ?? '—'}</td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-zinc-200 tabular-nums">
                          <span>{o.qtyToAssemble}</span>
                          {o.qtyAssembled > 0 && (
                            <span className="text-zinc-600"> / {o.qtyAssembled}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-zinc-400">{o.unitOfMeasure}</td>
                        <td className="px-4 py-3 text-[12px] text-zinc-400">
                          {o.dueDate ? new Date(o.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={STATUS_ICON[o.status] ? 'text-zinc-500' : ''}>
                              {STATUS_ICON[o.status]}
                            </span>
                            <StatusBadge status={o.status} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/assembly/orders/${o.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-4 h-4 text-zinc-500" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2.5 border-t border-zinc-800/40 text-[11px] text-zinc-600">
                {filtered.length} order{filtered.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
