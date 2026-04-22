'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, FileText, Printer, RefreshCw } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface StatementTransaction {
  date: string
  type: 'order' | 'invoice' | 'payment' | 'credit'
  reference: string
  description: string
  debit: number
  credit: number
  balance: number
}

interface StatementCustomer {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  address: string
}

interface StatementData {
  customer: StatementCustomer
  period: { from: string; to: string }
  openingBalance: number
  transactions: StatementTransaction[]
  closingBalance: number
  summary: {
    totalPurchases: number
    totalPayments: number
    outstandingBalance: number
    loyaltyPointsBalance: number
  }
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function firstOfMonth() {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), 1).toISOString().slice(0, 10)
}

function formatDateShort(iso: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(iso))
}

const TYPE_BADGE: Record<string, string> = {
  order: 'bg-blue-500/10 text-blue-400',
  invoice: 'bg-amber-500/10 text-amber-400',
  payment: 'bg-emerald-500/10 text-emerald-400',
  credit: 'bg-violet-500/10 text-violet-400',
}

export default function CustomerStatementPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [from, setFrom] = useState(firstOfMonth())
  const [to, setTo] = useState(today())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<StatementData | null>(null)

  const generate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/customers/${id}/statement?from=${from}&to=${to}`)
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string }
        setError(json.error ?? 'Failed to generate statement')
        return
      }
      const json = await res.json() as StatementData
      setData(json)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }, [id, from, to])

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      {/* Header — screen only */}
      <header className="h-14 border-b border-zinc-800 bg-[#0f0f1a] flex items-center px-6 gap-4 sticky top-0 z-10 print:hidden">
        <Link
          href={`/customers/${id}`}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Customer
        </Link>
        <span className="text-zinc-700">|</span>
        <h1 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          Customer Statement
        </h1>
        {data && (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Statement
            </button>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">

        {/* Controls card — screen only */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 print:hidden">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">
            Statement Period
          </div>
          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest">From</label>
              <input
                type="date"
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest">To</label>
              <input
                type="date"
                value={to}
                onChange={e => setTo(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={generate}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-sm font-medium text-white transition-colors"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              {loading ? 'Generating…' : 'Generate Statement'}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}
        </div>

        {/* Statement document */}
        {data && (
          <div className="bg-white text-zinc-900 rounded-lg shadow-xl print:shadow-none print:rounded-none print:fixed print:inset-0 print:overflow-auto">

            {/* Document header */}
            <div className="px-8 pt-8 pb-6 border-b border-zinc-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">NovaPOS</h2>
                  <p className="text-sm text-zinc-500 mt-0.5">Point of Sale &amp; ERP System</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold uppercase tracking-widest text-zinc-800">
                    Account Statement
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Generated {new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date())}
                  </p>
                </div>
              </div>

              {/* Customer + Period */}
              <div className="mt-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Bill To</p>
                  <p className="font-semibold text-zinc-900">
                    {data.customer.firstName} {data.customer.lastName}
                  </p>
                  {data.customer.address && (
                    <p className="text-sm text-zinc-600 mt-0.5">{data.customer.address}</p>
                  )}
                  {data.customer.email && (
                    <p className="text-sm text-zinc-500 mt-0.5">{data.customer.email}</p>
                  )}
                  {data.customer.phone && (
                    <p className="text-sm text-zinc-500 mt-0.5">{data.customer.phone}</p>
                  )}
                  <p className="text-xs text-zinc-400 mt-1 font-mono">
                    Acct# {data.customer.id.slice(0, 10).toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Period</p>
                  <p className="text-sm text-zinc-700">
                    {formatDateShort(data.period.from)} — {formatDateShort(data.period.to)}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary cards */}
            <div className="px-8 py-5 grid grid-cols-4 gap-4 border-b border-zinc-100">
              {[
                { label: 'Total Purchases', value: formatCurrency(data.summary.totalPurchases), color: 'text-red-600' },
                { label: 'Total Payments', value: formatCurrency(data.summary.totalPayments), color: 'text-emerald-600' },
                { label: 'Outstanding Balance', value: formatCurrency(data.summary.outstandingBalance), color: data.summary.outstandingBalance > 0 ? 'text-amber-600' : 'text-emerald-600' },
                { label: 'Loyalty Points', value: data.summary.loyaltyPointsBalance.toLocaleString() + ' pts', color: 'text-violet-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">{label}</p>
                  <p className={`text-lg font-bold tabular-nums ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Transaction table */}
            <div className="px-8 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                Transaction Detail
              </p>

              {data.transactions.length === 0 ? (
                <p className="text-sm text-zinc-400 py-8 text-center">
                  No transactions found for this period.
                </p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-zinc-200">
                      {['Date', 'Type', 'Reference', 'Description', 'Debit', 'Credit', 'Balance'].map((h, i) => (
                        <th
                          key={h}
                          className={`pb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 ${
                            i >= 4 ? 'text-right' : 'text-left'
                          } ${i === 3 ? 'min-w-[200px]' : ''}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((tx, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-zinc-100 hover:bg-zinc-50/50"
                      >
                        <td className="py-2 pr-3 text-zinc-600 whitespace-nowrap font-mono text-xs">
                          {formatDateShort(tx.date)}
                        </td>
                        <td className="py-2 pr-3">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${TYPE_BADGE[tx.type] ?? ''}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2 pr-3 font-mono text-xs text-zinc-500 whitespace-nowrap">
                          {tx.reference}
                        </td>
                        <td className="py-2 pr-3 text-zinc-700">{tx.description}</td>
                        <td className="py-2 pr-3 text-right tabular-nums font-semibold">
                          {tx.debit > 0 ? (
                            <span className="text-red-500">{formatCurrency(tx.debit)}</span>
                          ) : (
                            <span className="text-zinc-300">—</span>
                          )}
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums font-semibold">
                          {tx.credit > 0 ? (
                            <span className="text-emerald-600">{formatCurrency(tx.credit)}</span>
                          ) : (
                            <span className="text-zinc-300">—</span>
                          )}
                        </td>
                        <td className="py-2 text-right tabular-nums font-bold text-zinc-800">
                          {formatCurrency(tx.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-zinc-300 bg-zinc-50">
                      <td colSpan={4} className="py-2.5 pl-1 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                        Closing Balance
                      </td>
                      <td className="py-2.5 text-right tabular-nums font-bold text-red-600">
                        {formatCurrency(data.transactions.reduce((s, t) => s + t.debit, 0))}
                      </td>
                      <td className="py-2.5 text-right tabular-nums font-bold text-emerald-600">
                        {formatCurrency(data.transactions.reduce((s, t) => s + t.credit, 0))}
                      </td>
                      <td className={`py-2.5 text-right tabular-nums font-bold text-lg ${data.closingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {formatCurrency(data.closingBalance)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-zinc-100 text-center text-xs text-zinc-400">
              This statement was generated by NovaPOS. For questions contact your account manager.
            </div>
          </div>
        )}

        {/* Empty state before generation */}
        {!data && !loading && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-12 text-center print:hidden">
            <FileText className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">Select a date range and click Generate Statement</p>
          </div>
        )}
      </main>
    </div>
  )
}
