'use client'

import { useState, useEffect, use } from 'react'
import { ArrowLeft, Zap, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type QuoteItem = { id: string; productName: string; quantity: number; pricePerUnit: number; discount: number; lineTotal: number }
type Quote = {
  id: string
  quoteNumber: string
  accountName: string | null
  status: string
  totalAmount: number
  expirationDate: string | null
  notes: string | null
  items: QuoteItem[]
  orders: { id: string; orderNumber: string; status: string }[]
}

const statusColor: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  active: 'bg-blue-500/20 text-blue-400',
  won: 'bg-emerald-500/20 text-emerald-400',
  closed: 'bg-red-500/20 text-red-400',
}

function fmt(n: number) { return `$${n.toFixed(2)}` }

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(false)

  async function load() {
    const res = await fetch(`/api/sales/quotes/${id}`)
    setQuote(await res.json())
  }

  useEffect(() => { load() }, [id])

  async function activate() {
    setLoading(true)
    await fetch(`/api/sales/quotes/${id}/activate`, { method: 'POST' })
    await load()
    setLoading(false)
  }

  async function createOrder() {
    setLoading(true)
    await fetch(`/api/sales/quotes/${id}/create-order`, { method: 'POST' })
    await load()
    setLoading(false)
  }

  if (!quote) return <div className="p-6 text-zinc-400">Loading...</div>

  const subtotal = quote.items.reduce((s, i) => s + i.lineTotal, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/sales/quotes" className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 font-mono">Quote #{quote.quoteNumber.slice(-10)}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn('px-2 py-0.5 rounded text-xs capitalize', statusColor[quote.status] || 'bg-zinc-700 text-zinc-300')}>{quote.status}</span>
              {quote.accountName && <span className="text-sm text-zinc-400">{quote.accountName}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {quote.status === 'draft' && (
            <button onClick={activate} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50">
              <Zap className="w-4 h-4" /> Activate
            </button>
          )}
          {quote.status === 'active' && (
            <button onClick={createOrder} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50">
              <ShoppingCart className="w-4 h-4" /> Create Order
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Line Items */}
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
                  <th className="text-right px-4 py-3 text-zinc-500 font-medium">Disc%</th>
                  <th className="text-right px-4 py-3 text-zinc-500 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-600">No items</td></tr>}
                {quote.items.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-800/50">
                    <td className="px-4 py-3 text-zinc-200">{item.productName}</td>
                    <td className="px-4 py-3 text-right text-zinc-400">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-zinc-400">{fmt(item.pricePerUnit)}</td>
                    <td className="px-4 py-3 text-right text-zinc-400">{item.discount}%</td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-mono">{fmt(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
              {quote.items.length > 0 && (
                <tfoot>
                  <tr className="border-t border-zinc-700">
                    <td colSpan={4} className="px-4 py-3 text-right text-zinc-400 font-medium">Total</td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-mono font-semibold">{fmt(subtotal)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {quote.orders.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Linked Orders</h3>
              <div className="space-y-2">
                {quote.orders.map((o) => (
                  <Link key={o.id} href={`/sales/orders/${o.id}`} className="flex items-center justify-between p-2 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors">
                    <span className="text-sm text-blue-400 font-mono">Order #{o.orderNumber.slice(-8)}</span>
                    <span className="text-xs text-zinc-400 capitalize">{o.status}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-medium text-zinc-400">Details</h3>
            <div>
              <label className="block text-xs text-zinc-500">Account</label>
              <p className="text-sm text-zinc-200">{quote.accountName || '—'}</p>
            </div>
            <div>
              <label className="block text-xs text-zinc-500">Expires</label>
              <p className="text-sm text-zinc-200">{quote.expirationDate ? new Date(quote.expirationDate).toLocaleDateString() : '—'}</p>
            </div>
            <div>
              <label className="block text-xs text-zinc-500">Total Amount</label>
              <p className="text-lg font-semibold text-emerald-400 font-mono">{fmt(quote.totalAmount)}</p>
            </div>
          </div>

          {quote.notes && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Notes</h3>
              <p className="text-sm text-zinc-300">{quote.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
