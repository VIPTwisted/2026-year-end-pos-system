'use client'

import { useState, useEffect, use } from 'react'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type InvoiceItem = { id: string; productName: string; quantity: number; pricePerUnit: number; lineTotal: number }
type Invoice = {
  id: string
  invoiceNumber: string
  accountName: string | null
  status: string
  totalAmount: number
  paidAmount: number
  dueDate: string | null
  notes: string | null
  items: InvoiceItem[]
  order: { orderNumber: string; id: string } | null
}

const statusColor: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  sent: 'bg-blue-500/20 text-blue-400',
  paid: 'bg-emerald-500/20 text-emerald-400',
  overdue: 'bg-red-500/20 text-red-400',
}

function fmt(n: number) { return `$${n.toFixed(2)}` }

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [marking, setMarking] = useState(false)

  async function load() {
    const res = await fetch(`/api/sales/invoices/${id}`)
    setInvoice(await res.json())
  }

  useEffect(() => { load() }, [id])

  async function markPaid() {
    setMarking(true)
    await fetch(`/api/sales/invoices/${id}/mark-paid`, { method: 'POST' })
    await load()
    setMarking(false)
  }

  if (!invoice) return <div className="p-6 text-zinc-400">Loading...</div>

  const subtotal = invoice.items.reduce((s, i) => s + i.lineTotal, 0)
  const balance = invoice.totalAmount - invoice.paidAmount

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/sales/invoices" className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 font-mono">Invoice #{invoice.invoiceNumber.slice(-10)}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn('px-2 py-0.5 rounded text-xs capitalize', statusColor[invoice.status] || 'bg-zinc-700 text-zinc-300')}>{invoice.status}</span>
              {invoice.accountName && <span className="text-sm text-zinc-400">{invoice.accountName}</span>}
            </div>
          </div>
        </div>
        {invoice.status !== 'paid' && (
          <button onClick={markPaid} disabled={marking} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50">
            <CheckCircle className="w-4 h-4" /> Mark Paid
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h2 className="text-sm font-medium text-zinc-300">Line Items</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium">Product</th>
                  <th className="text-right px-4 py-3 text-zinc-500 font-medium">Qty</th>
                  <th className="text-right px-4 py-3 text-zinc-500 font-medium">Unit Price</th>
                  <th className="text-right px-4 py-3 text-zinc-500 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-600">No items</td></tr>}
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-800/50">
                    <td className="px-4 py-3 text-zinc-200">{item.productName}</td>
                    <td className="px-4 py-3 text-right text-zinc-400">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-zinc-400">{fmt(item.pricePerUnit)}</td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-mono">{fmt(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
              {invoice.items.length > 0 && (
                <tfoot>
                  <tr className="border-t border-zinc-700">
                    <td colSpan={3} className="px-4 py-3 text-right text-zinc-400 font-medium">Subtotal</td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-mono">{fmt(subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right text-zinc-400 font-medium">Paid</td>
                    <td className="px-4 py-3 text-right text-zinc-400 font-mono">{fmt(invoice.paidAmount)}</td>
                  </tr>
                  <tr className="border-t border-zinc-600">
                    <td colSpan={3} className="px-4 py-3 text-right text-zinc-200 font-semibold">Balance Due</td>
                    <td className={cn('px-4 py-3 text-right font-mono font-semibold', balance <= 0 ? 'text-emerald-400' : 'text-red-400')}>{fmt(balance)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3 h-fit">
          <h3 className="text-sm font-medium text-zinc-400">Details</h3>
          <div>
            <label className="block text-xs text-zinc-500">Account</label>
            <p className="text-sm text-zinc-200">{invoice.accountName || '—'}</p>
          </div>
          {invoice.order && (
            <div>
              <label className="block text-xs text-zinc-500">From Order</label>
              <Link href={`/sales/orders/${invoice.order.id}`} className="text-sm text-blue-400 hover:text-blue-300 font-mono">{invoice.order.orderNumber.slice(-8)}</Link>
            </div>
          )}
          <div>
            <label className="block text-xs text-zinc-500">Due Date</label>
            <p className="text-sm text-zinc-200">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}</p>
          </div>
          <div>
            <label className="block text-xs text-zinc-500">Total</label>
            <p className="text-lg font-semibold text-emerald-400 font-mono">{fmt(invoice.totalAmount)}</p>
          </div>
          <div>
            <label className="block text-xs text-zinc-500">Paid</label>
            <p className="text-sm font-mono text-zinc-300">{fmt(invoice.paidAmount)}</p>
          </div>
          {invoice.notes && (
            <div className="pt-2 border-t border-zinc-800">
              <label className="block text-xs text-zinc-500 mb-1">Notes</label>
              <p className="text-sm text-zinc-300">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
