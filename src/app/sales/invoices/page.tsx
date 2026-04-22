'use client'

import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Invoice = {
  id: string
  invoiceNumber: string
  accountName: string | null
  status: string
  totalAmount: number
  paidAmount: number
  dueDate: string | null
  createdAt: string
  order: { orderNumber: string } | null
}

const statusColor: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  sent: 'bg-blue-500/20 text-blue-400',
  paid: 'bg-emerald-500/20 text-emerald-400',
  overdue: 'bg-red-500/20 text-red-400',
}

const TABS = ['all', 'draft', 'sent', 'paid', 'overdue']

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [tab, setTab] = useState('all')
  const [loading, setLoading] = useState(true)

  async function load(status = 'all') {
    setLoading(true)
    const res = await fetch(`/api/sales/invoices?status=${status}`)
    setInvoices(await res.json())
    setLoading(false)
  }

  useEffect(() => { load(tab) }, [tab])

  async function markPaid(id: string) {
    await fetch(`/api/sales/invoices/${id}/mark-paid`, { method: 'POST' })
    load(tab)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Invoices</h1>
          <p className="text-sm text-zinc-400 mt-1">Sales invoices and receivables</p>
        </div>
        <Link
          href="/sales/invoices/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
        >
          + New Invoice
        </Link>
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-4 py-2 text-sm capitalize transition-colors', tab === t ? 'text-white border-b-2 border-blue-500' : 'text-zinc-500 hover:text-zinc-300')}>
            {t}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Invoice #</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Account</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Order #</th>
              <th className="text-right px-4 py-3 text-zinc-500 font-medium">Total</th>
              <th className="text-right px-4 py-3 text-zinc-500 font-medium">Paid</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Due Date</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">Loading...</td></tr>}
            {!loading && invoices.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">No invoices found</td></tr>}
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/sales/invoices/${inv.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs">{inv.invoiceNumber.slice(-10)}</Link>
                </td>
                <td className="px-4 py-3 text-zinc-300">{inv.accountName || '—'}</td>
                <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{inv.order ? inv.order.orderNumber.slice(-8) : '—'}</td>
                <td className="px-4 py-3 text-right text-emerald-400 font-mono">{fmt(inv.totalAmount)}</td>
                <td className="px-4 py-3 text-right text-zinc-400 font-mono">{fmt(inv.paidAmount)}</td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded text-xs capitalize', statusColor[inv.status] || 'bg-zinc-700 text-zinc-300')}>{inv.status}</span>
                </td>
                <td className="px-4 py-3">
                  {inv.status !== 'paid' && (
                    <button onClick={() => markPaid(inv.id)} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
