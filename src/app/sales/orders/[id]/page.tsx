'use client'

import { useState, useEffect, use } from 'react'
import { ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type OrderItem = { id: string; productName: string; quantity: number; pricePerUnit: number; lineTotal: number }
type Invoice = { id: string; invoiceNumber: string; status: string; totalAmount: number }
type Order = {
  id: string
  orderNumber: string
  accountName: string | null
  status: string
  totalAmount: number
  dueDate: string | null
  notes: string | null
  items: OrderItem[]
  invoices: Invoice[]
  quote: { quoteNumber: string } | null
}

const statusColor: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-amber-500/20 text-amber-400',
  fulfilled: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

function fmt(n: number) { return `$${n.toFixed(2)}` }

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [creating, setCreating] = useState(false)

  async function load() {
    const res = await fetch(`/api/sales/orders/${id}`)
    setOrder(await res.json())
  }

  useEffect(() => { load() }, [id])

  async function createInvoice() {
    setCreating(true)
    await fetch(`/api/sales/orders/${id}/create-invoice`, { method: 'POST' })
    await load()
    setCreating(false)
  }

  if (!order) return <div className="p-6 text-zinc-400">Loading...</div>

  const subtotal = order.items.reduce((s, i) => s + i.lineTotal, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/sales/orders" className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 font-mono">Order #{order.orderNumber.slice(-10)}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn('px-2 py-0.5 rounded text-xs capitalize', statusColor[order.status] || 'bg-zinc-700 text-zinc-300')}>{order.status}</span>
              {order.accountName && <span className="text-sm text-zinc-400">{order.accountName}</span>}
            </div>
          </div>
        </div>
        <button onClick={createInvoice} disabled={creating} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50">
          <FileText className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
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
                {order.items.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-600">No items</td></tr>}
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-800/50">
                    <td className="px-4 py-3 text-zinc-200">{item.productName}</td>
                    <td className="px-4 py-3 text-right text-zinc-400">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-zinc-400">{fmt(item.pricePerUnit)}</td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-mono">{fmt(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
              {order.items.length > 0 && (
                <tfoot>
                  <tr className="border-t border-zinc-700">
                    <td colSpan={3} className="px-4 py-3 text-right text-zinc-400 font-medium">Total</td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-mono font-semibold">{fmt(subtotal)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {order.invoices.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Linked Invoices</h3>
              <div className="space-y-2">
                {order.invoices.map((inv) => (
                  <Link key={inv.id} href={`/sales/invoices/${inv.id}`} className="flex items-center justify-between p-2 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors">
                    <span className="text-sm text-blue-400 font-mono">Invoice #{inv.invoiceNumber.slice(-8)}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-emerald-400 font-mono">{fmt(inv.totalAmount)}</span>
                      <span className="text-xs text-zinc-400 capitalize">{inv.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3 h-fit">
          <h3 className="text-sm font-medium text-zinc-400">Details</h3>
          <div>
            <label className="block text-xs text-zinc-500">Account</label>
            <p className="text-sm text-zinc-200">{order.accountName || '—'}</p>
          </div>
          {order.quote && (
            <div>
              <label className="block text-xs text-zinc-500">From Quote</label>
              <p className="text-sm text-zinc-200 font-mono">{order.quote.quoteNumber.slice(-8)}</p>
            </div>
          )}
          <div>
            <label className="block text-xs text-zinc-500">Due Date</label>
            <p className="text-sm text-zinc-200">{order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '—'}</p>
          </div>
          <div>
            <label className="block text-xs text-zinc-500">Total</label>
            <p className="text-lg font-semibold text-emerald-400 font-mono">{fmt(order.totalAmount)}</p>
          </div>
          {order.notes && (
            <div className="pt-2 border-t border-zinc-800">
              <label className="block text-xs text-zinc-500 mb-1">Notes</label>
              <p className="text-sm text-zinc-300">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
