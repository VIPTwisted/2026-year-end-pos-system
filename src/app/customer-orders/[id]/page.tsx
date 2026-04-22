'use client'
import { TopBar } from '@/components/layout/TopBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Package, Truck, Plus, Eye } from 'lucide-react'
import Link from 'next/link'

type OrderLine = {
  id: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  discount: number
  taxAmount: number
  lineTotal: number
  qtyFulfilled: number
  status: string
}

type Fulfillment = {
  id: string
  fulfillmentNo: string
  status: string
  trackingNo: string | null
  carrier: string | null
  createdAt: string
  shippedAt: string | null
  deliveredAt: string | null
}

type CustomerOrder = {
  id: string
  orderNumber: string
  customerId: string
  status: string
  orderType: string
  shippingAddress: string | null
  shippingCity: string | null
  shippingState: string | null
  shippingZip: string | null
  deliveryMode: string | null
  requestedDate: string | null
  subtotal: number
  taxAmount: number
  shippingCost: number
  totalAmount: number
  depositPaid: number
  balanceDue: number
  notes: string | null
  createdAt: string
  lines: OrderLine[]
  fulfillments: Fulfillment[]
}

const STATUS_BADGE: Record<string, 'secondary' | 'warning' | 'default' | 'success' | 'destructive' | 'outline'> = {
  created: 'secondary', confirmed: 'default', picking: 'warning', packed: 'warning',
  shipped: 'default', delivered: 'success', cancelled: 'destructive', return_in_progress: 'outline',
}

const FULFILLMENT_BADGE: Record<string, 'secondary' | 'warning' | 'default' | 'success' | 'destructive' | 'outline'> = {
  pending: 'secondary', picking: 'warning', packing: 'warning',
  packed: 'default', shipped: 'default', delivered: 'success',
}

const LINE_BADGE: Record<string, 'secondary' | 'warning' | 'default' | 'success' | 'destructive' | 'outline'> = {
  open: 'secondary', picking: 'warning', packed: 'default', fulfilled: 'success', cancelled: 'destructive',
}

export default function CustomerOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<CustomerOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatingFulfillment, setCreatingFulfillment] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetch(`/api/customer-orders/${id}`)
      .then((r) => r.json())
      .then((data) => { setOrder(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  async function createFulfillment() {
    if (!order) return
    setCreatingFulfillment(true)
    try {
      const lines = order.lines.filter((l) => l.status === 'open').map((l) => ({
        orderLineId: l.id, quantity: l.quantity - l.qtyFulfilled,
      }))
      const res = await fetch(`/api/customer-orders/${id}/fulfill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines }),
      })
      if (res.ok) {
        const fulfillment = await res.json()
        router.push(`/fulfillment/${fulfillment.id}`)
      }
    } finally {
      setCreatingFulfillment(false)
    }
  }

  async function updateStatus(status: string) {
    if (!order) return
    setUpdatingStatus(true)
    const res = await fetch(`/api/customer-orders/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) setOrder(await res.json())
    setUpdatingStatus(false)
  }

  if (loading) return (
    <><TopBar title="Order Detail" /><main className="flex-1 p-6 flex items-center justify-center"><div className="text-zinc-500 text-sm">Loading order...</div></main></>
  )
  if (!order) return (
    <><TopBar title="Order Detail" /><main className="flex-1 p-6 text-center py-16 text-zinc-500"><p>Order not found.</p><Link href="/customer-orders" className="text-blue-400 hover:underline text-sm">Back</Link></main></>
  )

  const canFulfill = ['created', 'confirmed', 'picking'].includes(order.status)
  const openLines = order.lines.filter((l) => l.status === 'open')

  return (
    <>
      <TopBar title={`Order ${order.orderNumber}`} />
      <main className="flex-1 p-6 overflow-auto max-w-5xl">
        <Link href="/customer-orders" className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 mb-4 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to Customer Orders
        </Link>

        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-xl font-bold text-zinc-100">{order.orderNumber}</h2>
                  <Badge variant={STATUS_BADGE[order.status] ?? 'secondary'}>{order.status.replace('_', ' ')}</Badge>
                  <span className="text-xs text-zinc-500 capitalize bg-zinc-800 px-2 py-0.5 rounded">{order.orderType === 'carry_out' ? 'Carry Out' : order.orderType}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-10 gap-y-1.5 text-xs text-zinc-400">
                  <div>Customer: <span className="text-zinc-300">{order.customerId}</span></div>
                  <div>Created: <span className="text-zinc-300">{formatDate(order.createdAt)}</span></div>
                  {order.deliveryMode && <div>Delivery: <span className="text-zinc-300">{order.deliveryMode}</span></div>}
                  {order.requestedDate && <div>Requested: <span className="text-amber-400">{formatDate(order.requestedDate)}</span></div>}
                  {order.orderType === 'ship' && order.shippingAddress && (
                    <div className="col-span-2">Ship to: <span className="text-zinc-300">{order.shippingAddress}, {order.shippingCity}, {order.shippingState} {order.shippingZip}</span></div>
                  )}
                  {order.notes && <div className="col-span-2">Notes: <span className="text-zinc-300">{order.notes}</span></div>}
                </div>
              </div>
              <div className="text-right space-y-1 text-sm shrink-0">
                <div className="flex justify-between gap-8 text-zinc-400"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                <div className="flex justify-between gap-8 text-zinc-400"><span>Tax</span><span>{formatCurrency(order.taxAmount)}</span></div>
                {order.shippingCost > 0 && <div className="flex justify-between gap-8 text-zinc-400"><span>Shipping</span><span>{formatCurrency(order.shippingCost)}</span></div>}
                <div className="flex justify-between gap-8 font-bold text-emerald-400 border-t border-zinc-800 pt-2"><span>Total</span><span>{formatCurrency(order.totalAmount)}</span></div>
                <div className="flex justify-between gap-8 text-blue-400"><span>Deposit</span><span>-{formatCurrency(order.depositPaid)}</span></div>
                <div className={`flex justify-between gap-8 font-bold ${order.balanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}><span>Balance Due</span><span>{formatCurrency(order.balanceDue)}</span></div>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-800">
              {order.status === 'created' && <Button variant="default" size="sm" onClick={() => updateStatus('confirmed')} disabled={updatingStatus}>Confirm Order</Button>}
              {canFulfill && openLines.length > 0 && <Button variant="secondary" size="sm" onClick={createFulfillment} disabled={creatingFulfillment}><Plus className="w-3.5 h-3.5" />{creatingFulfillment ? 'Creating...' : 'Create Fulfillment'}</Button>}
              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <Button variant="ghost" size="sm" onClick={() => updateStatus('cancelled')} disabled={updatingStatus} className="text-red-400 hover:text-red-300">Cancel Order</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <div className="px-5 pt-4 pb-3 border-b border-zinc-800"><h3 className="text-sm font-semibold text-zinc-100">Line Items</h3></div>
          <CardContent className="p-0">
            {order.lines.length === 0 ? <div className="p-6 text-center text-zinc-600 text-sm">No line items</div> : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase">
                    <th className="text-left px-5 py-2.5 font-medium">Product</th>
                    <th className="text-right px-4 py-2.5 font-medium">Qty</th>
                    <th className="text-right px-4 py-2.5 font-medium">Fulfilled</th>
                    <th className="text-right px-4 py-2.5 font-medium">Price</th>
                    <th className="text-right px-4 py-2.5 font-medium">Total</th>
                    <th className="text-center px-4 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {order.lines.map((l) => (
                    <tr key={l.id} className="hover:bg-zinc-800/30">
                      <td className="px-5 py-3"><div className="text-zinc-100 font-medium">{l.productName}</div><div className="text-xs text-zinc-500 font-mono">{l.sku}</div></td>
                      <td className="px-4 py-3 text-right text-zinc-300">{l.quantity}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={l.qtyFulfilled >= l.quantity ? 'text-emerald-400' : 'text-amber-400'}>{l.qtyFulfilled}</span>
                        <span className="text-zinc-600"> / {l.quantity}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-400">{formatCurrency(l.unitPrice)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-400">{formatCurrency(l.lineTotal)}</td>
                      <td className="px-4 py-3 text-center"><Badge variant={LINE_BADGE[l.status] ?? 'secondary'} className="text-[10px]">{l.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <div className="px-5 pt-4 pb-3 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2"><Truck className="w-4 h-4 text-purple-400" />Fulfillments ({order.fulfillments.length})</h3>
          </div>
          <CardContent className="p-0">
            {order.fulfillments.length === 0 ? <div className="p-6 text-center text-zinc-600 text-sm">No fulfillments yet</div> : (
              <div className="divide-y divide-zinc-800">
                {order.fulfillments.map((f) => (
                  <div key={f.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-zinc-300 font-semibold">{f.fulfillmentNo}</span>
                        <Badge variant={FULFILLMENT_BADGE[f.status] ?? 'secondary'} className="text-[10px]">{f.status}</Badge>
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        Created: {formatDate(f.createdAt)}
                        {f.carrier && f.trackingNo && <span> · {f.carrier}: <span className="font-mono">{f.trackingNo}</span></span>}
                        {f.shippedAt && <span> · Shipped: {formatDate(f.shippedAt)}</span>}
                      </div>
                    </div>
                    <Link href={`/fulfillment/${f.id}`}><Button variant="ghost" size="sm"><Eye className="w-3.5 h-3.5" />Process</Button></Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
