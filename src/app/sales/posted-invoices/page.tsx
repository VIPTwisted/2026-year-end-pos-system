'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, Search, Filter, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type PostedInvoice = {
  id: string
  invoiceNumber: string
  sellToCustomerName: string | null
  accountName: string | null
  postingDate: string
  dueDate: string | null
  totalAmount: number
  remainingAmount: number
  paidAmount: number
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function fmtDate(s: string | null | undefined) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PostedSalesInvoicesPage() {
  const [invoices, setInvoices] = useState<PostedInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [customer, setCustomer] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ status: 'Posted' })
    if (customer) params.set('customer', customer)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    try {
      const res = await fetch(`/api/sales/invoices?${params}`)
      const data = await res.json()
      setInvoices(Array.isArray(data) ? data : [])
    } catch {
      setInvoices([])
    }
    setLoading(false)
  }, [customer, dateFrom, dateTo])

  useEffect(() => { load() }, [load])

  const filtered = invoices.filter(inv => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      inv.invoiceNumber.toLowerCase().includes(s) ||
      (inv.sellToCustomerName ?? inv.accountName ?? '').toLowerCase().includes(s)
    )
  })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      {/* TopBar */}
      <div className="border-b border-zinc-800 bg-[#0f0f1a] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Link href="/sales" className="hover:text-zinc-200">Sales</Link>
          <span>/</span>
          <span className="text-zinc-200">Posted Sales Invoices</span>
        </div>
        <span className="text-xs text-zinc-500">{filtered.length} records</span>
      </div>

      {/* Ribbon — read-only, no New/Edit */}
      <div className="border-b border-zinc-800 bg-[#16213e] px-6 py-3">
        <h1 className="text-base font-semibold text-zinc-100 mb-3">Posted Sales Invoices</h1>
        <div className="flex items-center gap-1 flex-wrap">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
            Print
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
            Send
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
            Navigate
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Filter Pane */}
        <div className={cn('border-r border-zinc-800 bg-[#16213e] transition-all duration-200', filterOpen ? 'w-56' : 'w-0 overflow-hidden')}>
          {filterOpen && (
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Customer</p>
                <input
                  value={customer}
                  onChange={e => setCustomer(e.target.value)}
                  placeholder="Filter by customer..."
                  className="w-full bg-[#0f0f1a] border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Posting Date</p>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="w-full bg-[#0f0f1a] border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="w-full bg-[#0f0f1a] border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <button onClick={load} className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium text-white transition-colors">
                Apply
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search posted invoices..."
                className="w-full bg-[#16213e] border border-zinc-700 rounded pl-9 pr-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setFilterOpen(p => !p)}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs transition-colors', filterOpen ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-zinc-700 text-zinc-400 hover:text-zinc-200')}
            >
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
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Due Date</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Amount</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Remaining</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {loading && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-600">Loading...</td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-600">No posted invoices found</td></tr>
                )}
                {filtered.map(inv => {
                  const remaining = inv.remainingAmount ?? (inv.totalAmount - inv.paidAmount)
                  const isPaid = remaining <= 0
                  return (
                    <tr key={inv.id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-4 py-3">
                        <span className="text-blue-400 font-mono text-xs font-medium">
                          {inv.invoiceNumber.length > 14 ? inv.invoiceNumber.slice(-14) : inv.invoiceNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-200">{inv.sellToCustomerName ?? inv.accountName ?? <span className="text-zinc-600">—</span>}</td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">{fmtDate(inv.postingDate)}</td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">{fmtDate(inv.dueDate)}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-zinc-200">{fmtCurrency(inv.totalAmount)}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm">
                        <span className={remaining > 0 ? 'text-amber-400' : 'text-zinc-500'}>{fmtCurrency(remaining)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isPaid
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                          : <span className="w-4 h-4 rounded-full border border-zinc-600 inline-block" />
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
