'use client'
import { TopBar } from '@/components/layout/TopBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  CheckSquare, Square, Package, Truck, CheckCircle2, ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

type FulfillmentLine = {
  id: string
  orderLineId: string
  quantity: number
}

type OrderLine = {
  id: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  lineTotal: number
  qtyFulfilled: number
  status: string
}

type Fulfillment = {
  id: string
  fulfillmentNo: string
  status: string
  orderId: string
  assignedTo: string | null
  trackingNo: string | null
  carrier: string | null
  packedAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  notes: string | null
  createdAt: string
  lines: FulfillmentLine[]
  order: {
    id: string
    orderNumber: string
    orderType: string
    customerId: string
    totalAmount: number
    requestedDate: string | null
    lines: OrderLine[]
  }
}

const BADGE_MAP: Record<string, 'secondary' | 'warning' | 'default' | 'success' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  picking: 'warning',
  packing: 'warning',
  packed: 'default',
  shipped: 'default',
  delivered: 'success',
}

const CARRIERS = ['UPS', 'FedEx', 'USPS', 'DHL', 'Amazon', 'OnTrac', 'Other']

export default function FulfillmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [fulfillment, setFulfillment] = useState<Fulfillment | null>(null)
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [trackingNo, setTrackingNo] = useState('')
  const [carrier, setCarrier] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchFulfillment()
  }, [id])

  async function fetchFulfillment() {
    setLoading(true)
    try {
      const res = await fetch(`/api/fulfillment-detail/${id}`)
      if (res.ok) {
        const data = await res.json()
        setFulfillment(data)
        setTrackingNo(data.trackingNo ?? '')
        setCarrier(data.carrier ?? '')
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(status: string) {
    if (!fulfillment) return
    setSaving(true)
    try {
      const res = await fetch(
        `/api/customer-orders/${fulfillment.orderId}/fulfillments/${fulfillment.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status,
            trackingNo: trackingNo || null,
            carrier: carrier || null,
          }),
        }
      )
      if (res.ok) {
        const updated = await res.json()
        setFulfillment((prev) => prev ? { ...prev, ...updated } : prev)
      }
    } finally {
      setSaving(false)
    }
  }

  const toggleCheck = (lineId: string) =>
    setChecked((prev) => ({ ...prev, [lineId]: !prev[lineId] }))

  const allChecked =
    fulfillment?.order.lines.length
      ? fulfillment.order.lines.every((l) => checked[l.id])
      : false

  if (loading) {
    return (
      <>
        <TopBar title="Fulfillment Detail" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="text-zinc-500 text-sm">Loading fulfillment...</div>
        </main>
      </>
    )
  }

  if (!fulfillment) {
    return (
      <>
        <TopBar title="Fulfillment Detail" />
        <main className="flex-1 p-6 text-center py-16 text-zinc-500">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm">Fulfillment not found.</p>
          <Link href="/fulfillment" className="mt-3 text-xs text-blue-400 hover:underline block">
            Back to Fulfillment Hub
          </Link>
        </main>
      </>
    )
  }

  const order = fulfillment.order
  const isShip = order.orderType === 'ship'

  return (
    <>
      <TopBar title={`Fulfillment ${fulfillment.fulfillmentNo}`} />
      <main className="flex-1 p-6 overflow-auto max-w-4xl">
        <Link
          href="/fulfillment"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Fulfillment Hub
        </Link>

        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-zinc-100">{fulfillment.fulfillmentNo}</span>
                  <Badge variant={BADGE_MAP[fulfillment.status] ?? 'secondary'}>
                    {fulfillment.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-zinc-400">
                  <div>Order: <span className="text-zinc-300 font-mono">{order.orderNumber}</span></div>
                  <div>Customer: <span className="text-zinc-300">{order.customerId}</span></div>
                  <div>Type: <span className="text-zinc-300 capitalize">{order.orderType}</span></div>
                  <div>Total: <span className="text-emerald-400 font-semibold">{formatCurrency(order.totalAmount)}</span></div>
                  {order.requestedDate && (
                    <div>Requested: <span className="text-amber-400">{formatDate(order.requestedDate)}</span></div>
                  )}
                  <div>Created: <span className="text-zinc-300">{formatDate(fulfillment.createdAt)}</span></div>
                </div>
              </div>
              <div className="text-right">
                {fulfillment.packedAt && (
                  <div className="text-xs text-zinc-500">Packed: {formatDate(fulfillment.packedAt)}</div>
                )}
                {fulfillment.shippedAt && (
                  <div className="text-xs text-zinc-500">Shipped: {formatDate(fulfillment.shippedAt)}</div>
                )}
                {fulfillment.deliveredAt && (
                  <div className="text-xs text-zinc-500">Delivered: {formatDate(fulfillment.deliveredAt)}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <div className="px-5 pt-4 pb-3 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-400" />
              Picking Checklist
            </h3>
            <span className="text-xs text-zinc-500">
              {Object.values(checked).filter(Boolean).length} / {order.lines.length} picked
            </span>
          </div>
          <CardContent className="p-0">
            {order.lines.map((line) => (
              <div
                key={line.id}
                className={`flex items-center gap-3 px-5 py-3 border-b border-zinc-800 last:border-0 cursor-pointer hover:bg-zinc-800/50 transition-colors ${
                  checked[line.id] ? 'opacity-60' : ''
                }`}
                onClick={() => toggleCheck(line.id)}
              >
                {checked[line.id] ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-zinc-600 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-zinc-100 font-medium">{line.productName}</div>
                  <div className="text-xs text-zinc-500 font-mono">{line.sku}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-zinc-100">×{line.quantity}</div>
                  <div className="text-xs text-zinc-500">{formatCurrency(line.unitPrice)} ea</div>
                </div>
              </div>
            ))}
            {order.lines.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-zinc-600">No line items</div>
            )}
          </CardContent>
        </Card>

        {isShip && (
          <Card className="bg-zinc-900 border-zinc-800 mb-6">
            <div className="px-5 pt-4 pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-400" />
                Shipping Info
              </h3>
            </div>
            <CardContent className="p-5 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Carrier</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full h-9 bg-zinc-800 border border-zinc-700 rounded-md px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select carrier...</option>
                  {CARRIERS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Tracking Number</label>
                <Input
                  value={trackingNo}
                  onChange={(e) => setTrackingNo(e.target.value)}
                  placeholder="1Z999AA10123456784"
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 flex-wrap">
          {fulfillment.status === 'pending' && (
            <Button variant="secondary" onClick={() => updateStatus('picking')} disabled={saving}>
              Start Picking
            </Button>
          )}
          {(fulfillment.status === 'picking' || fulfillment.status === 'packing') && (
            <Button
              variant="default"
              onClick={() => updateStatus('packed')}
              disabled={saving || !allChecked}
            >
              <Package className="w-4 h-4" />
              Mark as Packed
              {!allChecked && <span className="ml-1 text-xs opacity-70">(check all items)</span>}
            </Button>
          )}
          {fulfillment.status === 'packed' && isShip && (
            <Button
              variant="default"
              onClick={() => updateStatus('shipped')}
              disabled={saving || !trackingNo || !carrier}
            >
              <Truck className="w-4 h-4" />
              Mark as Shipped
            </Button>
          )}
          {(fulfillment.status === 'packed' && !isShip) || fulfillment.status === 'shipped' ? (
            <Button variant="success" onClick={() => updateStatus('delivered')} disabled={saving}>
              <CheckCircle2 className="w-4 h-4" />
              Mark as Delivered
            </Button>
          ) : null}
          <Link href={`/customer-orders/${order.id}`}>
            <Button variant="outline">View Order</Button>
          </Link>
        </div>
      </main>
    </>
  )
}
