'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type OrderItem = {
  id: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  lineTotal: number
  taxAmount: number
  discount?: number
}

type Payment = {
  id: string
  method: string
  amount: number
}

type Customer = {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  loyaltyPoints?: number
} | null

type Store = {
  name: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  phone: string | null
} | null

type OrderData = {
  id: string
  orderNumber: string
  createdAt: string
  status: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  amountTendered: number | null
  changeDue: number | null
  paymentMethod: string | null
  notes: string | null
  items: OrderItem[]
  payments: Payment[]
  customer: Customer
  store: Store
}

const METHOD_LABELS: Record<string, string> = {
  visa: '💳 VISA',
  mastercard: '💳 MASTERCARD',
  amex: '💳 AMEX',
  debit: '💳 DEBIT',
  cash: '💵 CASH',
  'gift-card': '🎁 GIFT CARD',
  'store-credit': '🏪 STORE CREDIT',
  loyalty: '⭐ LOYALTY',
}

function fmt(n: number) {
  return `$${n.toFixed(2)}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function methodLabel(method: string) {
  const key = method.toLowerCase()
  return METHOD_LABELS[key] ?? `💳 ${method.toUpperCase()}`
}

export default function ReceiptPage() {
  const params = useParams()
  const orderId = params?.orderId as string

  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) return
    fetch(`/api/pos/receipt/${orderId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json()) as { error?: string }
          throw new Error(body.error ?? 'Not found')
        }
        return res.json() as Promise<OrderData>
      })
      .then((data) => {
        setOrder(data)
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load receipt')
        setLoading(false)
      })
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading receipt…</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-[100dvh] bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm mx-auto text-center">
          <p className="text-2xl mb-2">🧾</p>
          <p className="font-semibold text-gray-800 mb-1">Receipt not found</p>
          <p className="text-sm text-gray-500 mb-4">{error ?? 'Order does not exist.'}</p>
          <Link
            href="/pos"
            className="inline-block bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            ← Back to POS
          </Link>
        </div>
      </div>
    )
  }

  const { store, customer, items, payments } = order
  const loyaltyEarned = Math.floor(order.totalAmount)

  return (
    <div className="min-h-[100dvh] bg-gray-100 flex flex-col items-center justify-start pt-8 px-4 pb-12">
      {/* Action buttons — hidden on print */}
      <div className="print:hidden flex gap-3 mb-6 w-full max-w-sm">
        <button
          onClick={() => window.print()}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-md transition"
        >
          🖨️ Print Receipt
        </button>
        <Link
          href="/pos"
          className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-medium text-sm py-2.5 rounded-md transition"
        >
          + New Sale
        </Link>
      </div>

      {/* Receipt card */}
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full mx-auto p-6 font-mono text-sm print:shadow-none print:rounded-none">

        {/* Store header */}
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center text-gray-400 text-xs">
            LOGO
          </div>
          <p className="font-bold text-base text-gray-900">{store?.name ?? 'NovaPOS'}</p>
          {store?.address && (
            <p className="text-gray-500 text-xs">{store.address}</p>
          )}
          {(store?.city || store?.state || store?.zip) && (
            <p className="text-gray-500 text-xs">
              {[store.city, store.state, store.zip].filter(Boolean).join(', ')}
            </p>
          )}
          {store?.phone && (
            <p className="text-gray-500 text-xs">{store.phone}</p>
          )}
        </div>

        <div className="border-t border-dashed border-gray-300 my-3" />

        {/* Order meta */}
        <div className="mb-3">
          <p className="text-center font-bold text-gray-800 tracking-widest text-xs mb-2">RECEIPT</p>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Order:</span>
            <span className="font-semibold">#{order.orderNumber}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Date:</span>
            <span>{fmtDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Status:</span>
            <span className="capitalize">{order.status}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-300 my-3" />

        {/* Line items */}
        <div className="mb-3">
          <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
            <span className="flex-1">Item</span>
            <span className="w-8 text-center">Qty</span>
            <span className="w-16 text-right">Total</span>
          </div>
          <div className="border-t border-gray-200 mb-1" />
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-xs text-gray-700 py-0.5">
              <span className="flex-1 truncate pr-1">{item.productName}</span>
              <span className="w-8 text-center">{item.quantity}</span>
              <span className="w-16 text-right">{fmt(item.lineTotal)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-gray-300 my-3" />

        {/* Totals */}
        <div className="space-y-0.5 mb-3 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span>{fmt(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Discount:</span>
              <span>-{fmt(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Tax:</span>
            <span>{fmt(order.taxAmount)}</span>
          </div>
          <div className="border-t border-gray-200 my-1" />
          <div className="flex justify-between font-bold text-gray-900 text-sm">
            <span>TOTAL:</span>
            <span>{fmt(order.totalAmount)}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-300 my-3" />

        {/* Payments */}
        {payments.length > 0 ? (
          <div className="space-y-0.5 mb-3 text-xs">
            {payments.map((p) => (
              <div key={p.id} className="flex justify-between text-gray-700">
                <span>{methodLabel(p.method)}</span>
                <span>{fmt(p.amount)}</span>
              </div>
            ))}
            {order.amountTendered != null && order.amountTendered > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Cash Tendered:</span>
                <span>{fmt(order.amountTendered)}</span>
              </div>
            )}
            {order.changeDue != null && order.changeDue > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Change Due:</span>
                <span>{fmt(order.changeDue)}</span>
              </div>
            )}
          </div>
        ) : (
          order.paymentMethod && (
            <div className="mb-3 text-xs">
              <div className="flex justify-between text-gray-700">
                <span>{methodLabel(order.paymentMethod)}</span>
                <span>{fmt(order.totalAmount)}</span>
              </div>
              {order.amountTendered != null && order.amountTendered > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Cash Tendered:</span>
                  <span>{fmt(order.amountTendered)}</span>
                </div>
              )}
              {order.changeDue != null && order.changeDue > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Change Due:</span>
                  <span>{fmt(order.changeDue)}</span>
                </div>
              )}
            </div>
          )
        )}

        {/* Customer / Loyalty */}
        {customer && (
          <>
            <div className="border-t border-dashed border-gray-300 my-3" />
            <div className="text-xs space-y-0.5">
              <div className="flex justify-between text-amber-600 font-semibold">
                <span>⭐ Loyalty Points Earned:</span>
                <span>{loyaltyEarned}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Customer:</span>
                <span>{customer.firstName} {customer.lastName}</span>
              </div>
              {customer.loyaltyPoints != null && (
                <div className="flex justify-between text-gray-500">
                  <span>Total Points:</span>
                  <span>{(customer.loyaltyPoints + loyaltyEarned).toLocaleString()}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Notes */}
        {order.notes && (
          <>
            <div className="border-t border-dashed border-gray-300 my-3" />
            <p className="text-xs text-gray-500 italic">{order.notes}</p>
          </>
        )}

        <div className="border-t border-dashed border-gray-300 my-3" />

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 space-y-0.5">
          <p className="font-semibold text-gray-700">Thank you for shopping!</p>
          <p>Returns accepted within 30 days</p>
          <p>with receipt.</p>
          <p className="mt-2 text-gray-400">— NovaPOS —</p>
        </div>
      </div>
    </div>
  )
}
