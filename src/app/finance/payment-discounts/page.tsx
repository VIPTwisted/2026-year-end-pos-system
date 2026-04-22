'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Percent } from 'lucide-react'

interface PaymentDiscount {
  id: string
  documentNo: string
  customerNo: string | null
  customerName: string | null
  postingDate: string
  documentDate: string | null
  originalAmount: number
  discountAmount: number
  discountPercent: number
  currency: string
  documentType: string
}

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const fmtDate = (d: string | null) => d ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(d)) : '—'

export default function PaymentDiscountsPage() {
  const [discounts, setDiscounts] = useState<PaymentDiscount[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/finance/payment-discounts')
      .then(r => r.json())
      .then(d => setDiscounts(d.discounts ?? []))
      .catch(() => setDiscounts([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = discounts.filter(d =>
    !filter ||
    d.documentNo.toLowerCase().includes(filter.toLowerCase()) ||
    (d.customerName?.toLowerCase().includes(filter.toLowerCase()))
  )

  const totalDiscounts = filtered.reduce((s, d) => s + d.discountAmount, 0)
  const avgDiscount = filtered.length > 0 ? filtered.reduce((s, d) => s + d.discountPercent, 0) / filtered.length : 0

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Posted Payment Discounts"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
      />

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#16213e] border border-zinc-800/50">
          <Percent className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs text-zinc-400">
            Posted payment discounts are early-payment discounts applied when customers paid within the discount period. These are read-only ledger entries — discounts are granted when posting payment journals.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Entries</div>
            <div className="text-2xl font-bold text-zinc-100 tabular-nums">{filtered.length}</div>
            <div className="text-xs text-zinc-500 mt-1">posted discount entries</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Discount Given</div>
            <div className="text-xl font-bold text-emerald-400 tabular-nums">{fmt(totalDiscounts)}</div>
            <div className="text-xs text-zinc-500 mt-1">sum of all discounts</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Avg Discount %</div>
            <div className="text-xl font-bold text-zinc-100 tabular-nums">{avgDiscount.toFixed(2)}%</div>
            <div className="text-xs text-zinc-500 mt-1">average rate applied</div>
          </div>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-zinc-100">Posted Payment Discounts</h2>
            <input
              type="text"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Filter by document or customer…"
              className="w-60 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
            />
            <span className="text-xs text-zinc-500 shrink-0">{filtered.length} records</span>
          </div>

          {loading ? (
            <div className="py-20 text-center"><p className="text-sm text-zinc-500">Loading…</p></div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-zinc-500">No posted payment discounts found.</p>
              <p className="text-xs text-zinc-600 mt-2">Discounts are created when posting payment journals with early-payment terms.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    {['Document No.', 'Doc Type', 'Customer No.', 'Customer Name', 'Posting Date', 'Document Date', 'Original Amount', 'Discount %', 'Discount Amount', 'Currency'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {filtered.map(d => (
                    <tr key={d.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-xs text-blue-400">{d.documentNo}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-400">{d.documentType}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{d.customerNo ?? '—'}</td>
                      <td className="px-4 py-2.5 text-sm text-zinc-300">{d.customerName ?? '—'}</td>
                      <td className="px-4 py-2.5 text-sm text-zinc-400">{fmtDate(d.postingDate)}</td>
                      <td className="px-4 py-2.5 text-sm text-zinc-500">{fmtDate(d.documentDate)}</td>
                      <td className="px-4 py-2.5 tabular-nums text-sm text-right text-zinc-300">{fmt(d.originalAmount)}</td>
                      <td className="px-4 py-2.5 tabular-nums text-sm text-right text-zinc-400">{d.discountPercent.toFixed(2)}%</td>
                      <td className="px-4 py-2.5 tabular-nums text-sm text-right font-bold text-emerald-400">{fmt(d.discountAmount)}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-500">{d.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
