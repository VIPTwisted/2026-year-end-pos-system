'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import {
  ShoppingCart,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Building2,
  FileText,
  Package,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface B2BOrderLine {
  id: string
  productName: string | null
  sku: string | null
  qty: number
  unitPrice: number
  discountPct: number
  lineTotal: number
}

interface B2BOrderDetail {
  id: string
  orderNumber: string
  status: string
  orderDate: string
  requestedDate: string | null
  poReference: string | null
  subtotal: number
  discountAmt: number
  taxAmt: number
  totalAmt: number
  notes: string | null
  approvedBy: string | null
  approvedAt: string | null
  createdAt: string
  updatedAt: string
  lines: B2BOrderLine[]
  account: {
    id: string
    accountCode: string
    companyName: string
    contactName: string | null
    email: string | null
    paymentTerms: string | null
  }
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-900/40 text-amber-400 border-amber-800/40',
  approved: 'bg-emerald-900/40 text-emerald-400 border-emerald-800/40',
  processing: 'bg-blue-900/40 text-blue-400 border-blue-800/40',
  shipped: 'bg-purple-900/40 text-purple-400 border-purple-800/40',
  delivered: 'bg-emerald-900/60 text-emerald-300 border-emerald-800/60',
  cancelled: 'bg-zinc-800 text-zinc-500 border-zinc-700',
}

const TIMELINE_STEPS = ['pending', 'approved', 'processing', 'shipped', 'delivered']

export default function B2BOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<B2BOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/b2b/orders/${id}`)
      const data = await res.json()
      setOrder(data)
    } finally { setLoading(false) }
  }, [id])

  useEffect(() => { load() }, [load])

  async function approveOrder() {
    setActionLoading(true)
    try {
      await fetch(`/api/b2b/orders/${id}/approve`, { method: 'POST' })
      load()
    } finally { setActionLoading(false) }
  }

  async function cancelOrder() {
    setActionLoading(true)
    try {
      await fetch(`/api/b2b/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      load()
    } finally { setActionLoading(false) }
  }

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const fmtDatetime = (d: string) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-zinc-900 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 p-6 flex items-center justify-center">
        <p className="text-zinc-500">Order not found</p>
      </div>
    )
  }

  const currentStepIndex = TIMELINE_STEPS.indexOf(order.status)

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/b2b/orders" className="text-zinc-500 hover:text-zinc-200">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-400" />
              Order {order.orderNumber.slice(0, 16)}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">Created {fmtDatetime(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn('px-2 py-1 rounded text-xs border capitalize', STATUS_BADGE[order.status] || 'bg-zinc-800 text-zinc-400 border-zinc-700')}>{order.status}</span>
            {order.status === 'pending' && (
              <>
                <button onClick={approveOrder} disabled={actionLoading} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm rounded-lg font-medium">
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button onClick={cancelOrder} disabled={actionLoading} className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 text-sm rounded-lg font-medium">
                  <XCircle className="w-4 h-4" /> Cancel
                </button>
              </>
            )}
            {order.status === 'approved' && (
              <button onClick={cancelOrder} disabled={actionLoading} className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 text-sm rounded-lg font-medium">
                <XCircle className="w-4 h-4" /> Cancel
              </button>
            )}
          </div>
        </div>

        {/* Timeline */}
        {order.status !== 'cancelled' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              {TIMELINE_STEPS.map((step, i) => (
                <div key={step} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold',
                      i < currentStepIndex ? 'bg-emerald-500 border-emerald-500 text-white' :
                      i === currentStepIndex ? 'bg-blue-500 border-blue-500 text-white' :
                      'bg-zinc-800 border-zinc-700 text-zinc-600'
                    )}>{i + 1}</div>
                    <span className="text-xs text-zinc-500 mt-1 capitalize">{step}</span>
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className={cn('flex-1 h-0.5 mx-2', i < currentStepIndex ? 'bg-emerald-500' : 'bg-zinc-700')} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2-col metadata */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" /> Order Info
            </h2>
            {[
              { label: 'Order Number', value: order.orderNumber },
              { label: 'PO Reference', value: order.poReference || '—' },
              { label: 'Order Date', value: fmtDate(order.orderDate) },
              { label: 'Requested Date', value: order.requestedDate ? fmtDate(order.requestedDate) : '—' },
              { label: 'Approved At', value: order.approvedAt ? fmtDatetime(order.approvedAt) : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-1 border-b border-zinc-800/50 last:border-0">
                <span className="text-xs uppercase tracking-widest text-zinc-500">{label}</span>
                <span className="text-sm text-zinc-300">{value}</span>
              </div>
            ))}
            {order.notes && (
              <div className="pt-2">
                <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Notes</p>
                <p className="text-sm text-zinc-400">{order.notes}</p>
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Account
            </h2>
            <Link href={`/b2b/accounts/${order.account.id}`} className="text-blue-400 hover:text-blue-300 font-medium text-sm">
              {order.account.companyName}
            </Link>
            {[
              { label: 'Account Code', value: order.account.accountCode },
              { label: 'Contact', value: order.account.contactName || '—' },
              { label: 'Email', value: order.account.email || '—' },
              { label: 'Payment Terms', value: order.account.paymentTerms || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-1 border-b border-zinc-800/50 last:border-0">
                <span className="text-xs uppercase tracking-widest text-zinc-500">{label}</span>
                <span className="text-sm text-zinc-300">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lines Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-400" /> Line Items
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Product', 'SKU', 'Qty', 'Unit Price', 'Disc %', 'Line Total'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-widest text-zinc-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.lines.map((l) => (
                <tr key={l.id} className="border-b border-zinc-800/50">
                  <td className="px-4 py-3 text-zinc-100">{l.productName || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{l.sku || '—'}</td>
                  <td className="px-4 py-3 text-zinc-300">{l.qty}</td>
                  <td className="px-4 py-3 text-zinc-300">{fmt(l.unitPrice)}</td>
                  <td className="px-4 py-3 text-zinc-400">{l.discountPct > 0 ? `${l.discountPct}%` : '—'}</td>
                  <td className="px-4 py-3 text-zinc-100 font-medium">{fmt(l.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-6 py-4 border-t border-zinc-800 flex justify-end">
            <div className="space-y-1 w-64">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Subtotal</span>
                <span className="text-zinc-300">{fmt(order.subtotal)}</span>
              </div>
              {order.discountAmt > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Discount</span>
                  <span className="text-red-400">-{fmt(order.discountAmt)}</span>
                </div>
              )}
              {order.taxAmt > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Tax</span>
                  <span className="text-zinc-300">{fmt(order.taxAmt)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t border-zinc-700 pt-2 mt-2">
                <span className="text-zinc-100 flex items-center gap-1"><DollarSign className="w-4 h-4" />Total</span>
                <span className="text-zinc-100">{fmt(order.totalAmt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
