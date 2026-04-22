'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import {
  Plus, Play, Download, Copy, CheckCircle, XCircle,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────── */
type PriceListStatus = 'Active' | 'Inactive' | 'Scheduled'
type PriceListType = 'Base price' | 'Customer price' | 'Promotional' | 'Clearance'
type DiscountType = 'Line discount' | 'Multi-line' | 'Payment' | 'Cash discount'

interface PriceList {
  id: string
  name: string
  currency: string
  type: PriceListType
  startDate: string
  endDate: string
  status: PriceListStatus
  itemsCount: number
}

interface DiscountRule {
  id: string
  name: string
  type: DiscountType
  minQty: number
  discountPct: number
  start: string
  end: string
  priority: number
  appliesTo: string
}

interface SimItem { id: string; sku: string; name: string; basePrice: number }
interface SimCustomer { id: string; name: string; tier: string }

interface ApiData {
  priceLists: PriceList[]
  discountRules: DiscountRule[]
  simItems: SimItem[]
  simCustomers: SimCustomer[]
}

interface SimResult {
  item: { sku: string; name: string; basePrice: number }
  customer: { name: string; tier: string }
  qty: number
  finalPrice: number
  totalDiscount: number
  totalDiscountPct: number
  lineTotal: number
  waterfall: { rule: string; pct: number; saving: number }[]
}

/* ─── Helpers ────────────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

const PL_STATUS_CFG: Record<PriceListStatus, string> = {
  Active:    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  Inactive:  'bg-zinc-700/40 text-zinc-400 border border-zinc-600',
  Scheduled: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
}

const PL_TYPE_CFG: Record<PriceListType, string> = {
  'Base price':     'text-zinc-300',
  'Customer price': 'text-blue-400',
  'Promotional':    'text-amber-400',
  'Clearance':      'text-red-400',
}

const DT_CFG: Record<DiscountType, string> = {
  'Line discount': 'bg-blue-500/10 text-blue-400',
  'Multi-line':    'bg-purple-500/10 text-purple-400',
  'Payment':       'bg-emerald-500/10 text-emerald-400',
  'Cash discount': 'bg-amber-500/10 text-amber-400',
}

/* ─── Component ──────────────────────────────────────── */
export default function PricingPage() {
  const [data, setData] = useState<ApiData | null>(null)
  const [simItem, setSimItem] = useState('')
  const [simCustomer, setSimCustomer] = useState('')
  const [simQty, setSimQty] = useState('1')
  const [simResult, setSimResult] = useState<SimResult | null>(null)
  const [simLoading, setSimLoading] = useState(false)

  useEffect(() => {
    fetch('/api/sales/pricing')
      .then((r) => r.json())
      .then((d: ApiData) => {
        setData(d)
        setSimItem(d.simItems[0]?.id ?? '')
        setSimCustomer(d.simCustomers[0]?.id ?? '')
      })
  }, [])

  const runSim = async () => {
    if (!simItem || !simCustomer) return
    setSimLoading(true)
    const res = await fetch('/api/sales/pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: simItem, customerId: simCustomer, qty: Number(simQty) }),
    })
    const result: SimResult = await res.json()
    setSimResult(result)
    setSimLoading(false)
  }

  if (!data) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a]">
        <TopBar title="Pricing & Discount Management" breadcrumb={[{ label: 'Sales', href: '/sales' }]} />
        <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">Loading…</div>
      </div>
    )
  }

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
      <TopBar title="Pricing & Discount Management" breadcrumb={[{ label: 'Sales', href: '/sales' }]} />

      <main className="p-6 space-y-6">

        {/* ── Action Ribbon ── */}
        <div className="flex flex-wrap gap-2">
          {ribbonBtn('+ New Price List', <Plus className="w-3.5 h-3.5" />, true)}
          {ribbonBtn('+ New Discount', <Plus className="w-3.5 h-3.5" />)}
          {ribbonBtn('Activate', <CheckCircle className="w-3.5 h-3.5" />)}
          {ribbonBtn('Deactivate', <XCircle className="w-3.5 h-3.5" />)}
          {ribbonBtn('Copy', <Copy className="w-3.5 h-3.5" />)}
          {ribbonBtn('Export', <Download className="w-3.5 h-3.5" />)}
          {ribbonBtn('Simulate', <Play className="w-3.5 h-3.5" />)}
        </div>

        {/* ── Price Lists ── */}
        <section>
          <h2 className="text-[13px] font-semibold text-zinc-300 uppercase tracking-wider mb-3">Price Lists</h2>
          <div className="bg-[#16213e] border border-zinc-700/60 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-zinc-700 bg-zinc-900/60">
                  {['List Name', 'Currency', 'Type', 'Start Date', 'End Date', 'Status', 'Items'].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.priceLists.map((pl) => (
                  <tr key={pl.id} className="border-b border-zinc-800 hover:bg-zinc-800/40 cursor-pointer transition-colors">
                    <td className="px-4 py-3 text-zinc-100 font-medium text-[13px]">{pl.name}</td>
                    <td className="px-4 py-3 text-zinc-400 font-mono text-[12px]">{pl.currency}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[12px] font-medium ${PL_TYPE_CFG[pl.type]}`}>{pl.type}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-[12px]">{pl.startDate}</td>
                    <td className="px-4 py-3 text-zinc-400 text-[12px]">{pl.endDate}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${PL_STATUS_CFG[pl.status]}`}>
                        {pl.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300 text-right pr-6">{pl.itemsCount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Discount Rules ── */}
        <section>
          <h2 className="text-[13px] font-semibold text-zinc-300 uppercase tracking-wider mb-3">Discount Rules</h2>
          <div className="bg-[#16213e] border border-zinc-700/60 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-zinc-700 bg-zinc-900/60">
                  {['Rule Name', 'Type', 'Min Qty', 'Discount %', 'Start', 'End', 'Priority', 'Applies To'].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.discountRules.map((dr) => (
                  <tr key={dr.id} className="border-b border-zinc-800 hover:bg-zinc-800/40 cursor-pointer transition-colors">
                    <td className="px-4 py-3 text-zinc-100 font-medium text-[13px]">{dr.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${DT_CFG[dr.type]}`}>
                        {dr.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300 text-right">{dr.minQty}</td>
                    <td className="px-4 py-3 text-emerald-400 font-medium text-right">{dr.discountPct}%</td>
                    <td className="px-4 py-3 text-zinc-400 text-[12px]">{dr.start}</td>
                    <td className="px-4 py-3 text-zinc-400 text-[12px]">{dr.end}</td>
                    <td className="px-4 py-3 text-zinc-400 text-center">{dr.priority}</td>
                    <td className="px-4 py-3 text-zinc-400 text-[12px]">{dr.appliesTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Price Simulation ── */}
        <section>
          <h2 className="text-[13px] font-semibold text-zinc-300 uppercase tracking-wider mb-3">Price Simulation</h2>
          <div className="bg-[#16213e] border border-zinc-700/60 rounded-xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-[11px] text-zinc-500 mb-1.5">Item</label>
                <select
                  value={simItem}
                  onChange={(e) => setSimItem(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-[12px] rounded px-2.5 py-2 focus:outline-none focus:border-blue-500"
                >
                  {data.simItems.map((i) => (
                    <option key={i.id} value={i.id}>{i.sku} — {i.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-zinc-500 mb-1.5">Customer</label>
                <select
                  value={simCustomer}
                  onChange={(e) => setSimCustomer(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-[12px] rounded px-2.5 py-2 focus:outline-none focus:border-blue-500"
                >
                  {data.simCustomers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-zinc-500 mb-1.5">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={simQty}
                  onChange={(e) => setSimQty(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-[12px] rounded px-2.5 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={runSim}
                  disabled={simLoading}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[12px] font-medium rounded transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  {simLoading ? 'Calculating…' : 'Simulate'}
                </button>
              </div>
            </div>

            {simResult && (
              <div className="border-t border-zinc-700 pt-4 space-y-4">
                {/* Summary row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Base Price',      value: fmt(simResult.item.basePrice),  color: 'text-zinc-300' },
                    { label: 'Final Price',      value: fmt(simResult.finalPrice),      color: 'text-emerald-400' },
                    { label: 'Total Discount',   value: `${simResult.totalDiscountPct}% (${fmt(simResult.totalDiscount)})`, color: 'text-amber-400' },
                    { label: 'Line Total',       value: fmt(simResult.lineTotal),       color: 'text-blue-400' },
                  ].map((s) => (
                    <div key={s.label} className="bg-zinc-800/60 rounded-lg p-3">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{s.label}</p>
                      <p className={`text-[15px] font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Discount waterfall */}
                {simResult.waterfall.length > 0 && (
                  <div>
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-2">Discount Waterfall</p>
                    <div className="space-y-1.5">
                      {simResult.waterfall.map((w, i) => (
                        <div key={i} className="flex items-center justify-between bg-zinc-800/40 rounded px-3 py-2">
                          <span className="text-[12px] text-zinc-200">{w.rule}</span>
                          <div className="flex gap-4 text-[12px]">
                            <span className="text-amber-400">{w.pct}% off</span>
                            <span className="text-red-400">-{fmt(w.saving)}</span>
                          </div>
                        </div>
                      ))}
                      {simResult.waterfall.length === 0 && (
                        <p className="text-[12px] text-zinc-600">No discounts applied.</p>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-zinc-600">
                  Customer: <span className="text-zinc-400">{simResult.customer.name}</span>
                  {' · '}Qty: <span className="text-zinc-400">{simResult.qty}</span>
                  {' · '}Item: <span className="text-zinc-400">{simResult.item.sku}</span>
                </p>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  )
}
