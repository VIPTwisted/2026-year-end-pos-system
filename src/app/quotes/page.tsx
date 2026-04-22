'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { Plus, FileText, Clock, CheckCircle2, XCircle, Send } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface SalesQuote {
  id: string
  quoteNumber: string
  status: string
  customerId: string | null
  storeId: string
  validUntil: string | null
  subtotal: number
  discountAmount: number
  taxAmount: number
  total: number
  notes: string | null
  convertedOrderId: string | null
  createdAt: string
  updatedAt: string
  customer: { id: string; firstName: string; lastName: string; email: string | null } | null
  store: { id: string; name: string } | null
  _count: { lines: number }
}

const STATUS_FILTER_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Expired', value: 'expired' },
  { label: 'Converted', value: 'converted' },
]

function statusBadge(status: string): string {
  const map: Record<string, string> = {
    draft: 'bg-zinc-700/60 text-zinc-400',
    sent: 'bg-blue-500/10 text-blue-400',
    accepted: 'bg-emerald-500/10 text-emerald-400',
    rejected: 'bg-red-500/10 text-red-400',
    expired: 'bg-amber-500/10 text-amber-400',
    converted: 'bg-violet-500/10 text-violet-400',
  }
  return map[status] ?? 'bg-zinc-700/60 text-zinc-400'
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${statusBadge(status)}`}>
      {status}
    </span>
  )
}

function isExpired(validUntil: string | null, status: string): boolean {
  if (!validUntil || status === 'converted' || status === 'accepted') return false
  return new Date(validUntil) < new Date()
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<SalesQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const params = statusFilter ? `?status=${statusFilter}` : ''
    fetch(`/api/quotes${params}`)
      .then(r => r.json())
      .then((d: SalesQuote[] | { error: string }) => {
        if (Array.isArray(d)) setQuotes(d)
        else { setError('Failed to load quotes'); setQuotes([]) }
      })
      .catch(() => setError('Failed to load quotes'))
      .finally(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  // ── Stats ──────────────────────────────────────────────────────────────────
  const allQuotes = quotes
  const stats = {
    total: allQuotes.length,
    draft: allQuotes.filter(q => q.status === 'draft').length,
    sent: allQuotes.filter(q => q.status === 'sent').length,
    accepted: allQuotes.filter(q => q.status === 'accepted').length,
    converted: allQuotes.filter(q => q.status === 'converted').length,
    totalValue: allQuotes.reduce((s, q) => s + Number(q.total), 0),
  }

  return (
    <>
      <TopBar
        title="Sales Quotes"
        actions={
          <Link
            href="/quotes/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Quote
          </Link>
        }
      />

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* Header */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Sales</p>
            <h2 className="text-xl font-bold text-zinc-100">Sales Quotes</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Create and manage customer price quotes</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: 'Total Quotes', value: stats.total, icon: FileText, color: 'text-zinc-300' },
              { label: 'Draft', value: stats.draft, icon: Clock, color: 'text-zinc-400' },
              { label: 'Sent', value: stats.sent, icon: Send, color: 'text-blue-400' },
              { label: 'Accepted', value: stats.accepted, icon: CheckCircle2, color: 'text-emerald-400' },
              { label: 'Converted', value: stats.converted, icon: XCircle, color: 'text-violet-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{label}</span>
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                </div>
                <div className={`text-2xl font-bold tabular-nums ${color}`}>{value}</div>
              </div>
            ))}
          </div>

          {/* Total value row */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-5 py-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Total Quote Value (all)</span>
            <span className="text-lg font-bold tabular-nums text-zinc-100">{formatCurrency(stats.totalValue)}</span>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`h-7 px-3 rounded text-[11px] font-medium capitalize transition-colors border ${
                  statusFilter === opt.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:bg-zinc-700/60'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Table */}
          {loading ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex items-center justify-center py-14">
              <div className="w-5 h-5 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex items-center justify-center py-14 text-red-400 text-sm">
              {error}
            </div>
          ) : quotes.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16 text-zinc-600">
              <FileText className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-[13px]">No quotes found.</p>
              <Link
                href="/quotes/new"
                className="mt-3 h-8 px-4 rounded text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Create First Quote
              </Link>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Quote #', 'Customer', 'Store', 'Lines', 'Total', 'Valid Until', 'Status', ''].map(h => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap ${
                            h === 'Total' || h === 'Lines' ? 'text-right' : h === 'Status' ? 'text-center' : h === '' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {quotes.map(q => {
                      const expired = isExpired(q.validUntil, q.status)
                      return (
                        <tr key={q.id} className="hover:bg-zinc-800/20 transition-colors">
                          <td className="px-4 py-3">
                            <Link
                              href={`/quotes/${q.id}`}
                              className="font-mono text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              {q.quoteNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            {q.customer ? (
                              <div>
                                <p className="text-sm text-zinc-100">{q.customer.firstName} {q.customer.lastName}</p>
                                {q.customer.email && <p className="text-[11px] text-zinc-500">{q.customer.email}</p>}
                              </div>
                            ) : (
                              <span className="text-zinc-600 text-sm">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-400">
                            {q.store?.name ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-sm tabular-nums text-zinc-400">
                            {q._count.lines}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-zinc-100">
                            {formatCurrency(Number(q.total))}
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            {q.validUntil ? (
                              <span className={expired ? 'text-red-400 font-semibold' : 'text-zinc-400'}>
                                {new Date(q.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                {expired && <span className="ml-1.5 text-[10px] bg-red-500/10 text-red-400 px-1 py-0.5 rounded">expired</span>}
                              </span>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <StatusBadge status={q.status} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/quotes/${q.id}`}
                              className="inline-flex items-center gap-1 h-7 px-2.5 rounded text-[11px] text-zinc-500 hover:text-zinc-300 border border-zinc-700/50 hover:bg-zinc-800/60 transition-colors"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
