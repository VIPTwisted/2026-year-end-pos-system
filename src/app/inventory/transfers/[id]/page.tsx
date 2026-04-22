'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, Package, Truck } from 'lucide-react'

interface StoreInfo {
  id: string
  name: string
  city: string | null
  state: string | null
}

interface ProductInfo {
  id: string
  name: string
  sku: string
  unit: string
}

interface TransferLine {
  id: string
  productId: string
  quantity: number
  quantityShipped: number
  quantityReceived: number
  unitOfMeasure: string
  product: ProductInfo
}

interface Transfer {
  id: string
  orderNumber: string
  fromStoreId: string
  toStoreId: string
  status: string
  notes: string | null
  createdAt: string
  updatedAt: string
  shipmentDate: string | null
  receiptDate: string | null
  fromStore: StoreInfo
  toStore: StoreInfo
  lines: TransferLine[]
}

interface Toast {
  msg: string
  type: 'ok' | 'err'
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    open: 'bg-blue-500/10 text-blue-400',
    released: 'bg-amber-500/10 text-amber-400',
    shipped: 'bg-purple-500/10 text-purple-400',
    received: 'bg-emerald-500/10 text-emerald-400',
    closed: 'bg-zinc-700 text-zinc-400',
  }
  return map[status] ?? 'bg-zinc-700 text-zinc-400'
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  released: 'Released',
  shipped: 'In Transit',
  received: 'Received',
  closed: 'Closed',
}

export default function TransferDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [transfer, setTransfer] = useState<Transfer | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  // Ship quantities: map of line id → qty
  const [shipQtys, setShipQtys] = useState<Record<string, number>>({})

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/inventory/transfers/${id}`)
      if (!res.ok) { notify('Transfer not found', 'err'); return }
      const data = await res.json() as Transfer
      setTransfer(data)
      // Init ship quantities to requested qty
      const init: Record<string, number> = {}
      for (const l of data.lines) {
        init[l.id] = l.quantityShipped > 0 ? l.quantityShipped : l.quantity
      }
      setShipQtys(init)
    } catch {
      notify('Failed to load transfer', 'err')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const patch = async (body: Record<string, unknown>) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/inventory/transfers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        notify(data.error ?? 'Action failed', 'err')
        return
      }
      const updated = await res.json() as Transfer
      setTransfer(updated)
      notify('Transfer updated')
    } catch {
      notify('Network error — please retry', 'err')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRelease = () => patch({ status: 'released' })

  const handleShip = async () => {
    if (!transfer) return
    const lines = transfer.lines.map(l => ({
      id: l.id,
      quantityShipped: shipQtys[l.id] ?? l.quantity,
    }))
    await patch({ status: 'shipped', lines })
    notify('Transfer shipped — now in transit')
  }

  const handleReceive = async () => {
    await patch({ status: 'received' })
    notify('Transfer received — inventory adjusted')
    router.refresh()
  }

  const handleClose = () => patch({ status: 'closed' })

  if (loading) {
    return (
      <>
        <TopBar title="Transfer Detail" />
        <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </main>
      </>
    )
  }

  if (!transfer) {
    return (
      <>
        <TopBar title="Transfer Detail" />
        <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh] flex flex-col items-center justify-center gap-3">
          <p className="text-zinc-400 text-[14px]">Transfer not found</p>
          <Link href="/inventory/transfers" className="text-blue-400 text-[13px] hover:underline">
            Back to transfers
          </Link>
        </main>
      </>
    )
  }

  const isReadOnly = transfer.status === 'received' || transfer.status === 'closed'

  return (
    <>
      <TopBar title={`Transfer ${transfer.orderNumber}`} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-[13px] font-medium shadow-lg transition-all ${
              toast.type === 'ok'
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/20 border border-red-500/30 text-red-300'
            }`}
          >
            {toast.msg}
          </div>
        )}

        <div className="max-w-4xl mx-auto p-6 space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/inventory/transfers"
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-[15px] font-semibold text-zinc-100 font-mono">
                    {transfer.orderNumber}
                  </h1>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${statusBadge(transfer.status)}`}
                  >
                    {STATUS_LABELS[transfer.status] ?? transfer.status}
                  </span>
                </div>
                <p className="text-[12px] text-zinc-500 mt-0.5">
                  Created{' '}
                  {new Date(transfer.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Actions */}
            {!isReadOnly && (
              <div className="flex items-center gap-2">
                {transfer.status === 'open' && (
                  <button
                    onClick={handleRelease}
                    disabled={actionLoading}
                    className="h-8 px-3 rounded bg-amber-600/20 border border-amber-600/40 hover:bg-amber-600/30 text-amber-300 text-[13px] font-medium transition-colors disabled:opacity-50"
                  >
                    Release
                  </button>
                )}
                {transfer.status === 'released' && (
                  <button
                    onClick={handleShip}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded bg-purple-600/20 border border-purple-600/40 hover:bg-purple-600/30 text-purple-300 text-[13px] font-medium transition-colors disabled:opacity-50"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Ship Transfer
                  </button>
                )}
                {transfer.status === 'shipped' && (
                  <button
                    onClick={handleReceive}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded bg-emerald-600/20 border border-emerald-600/40 hover:bg-emerald-600/30 text-emerald-300 text-[13px] font-medium transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirm Receipt
                  </button>
                )}
                {transfer.status === 'received' && (
                  <button
                    onClick={handleClose}
                    disabled={actionLoading}
                    className="h-8 px-3 rounded bg-zinc-700/60 border border-zinc-600/40 hover:bg-zinc-700 text-zinc-300 text-[13px] font-medium transition-colors disabled:opacity-50"
                  >
                    Close
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Transfer Info */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">
              Transfer Route
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">From</div>
                <div className="text-[14px] font-semibold text-zinc-100">{transfer.fromStore.name}</div>
                {transfer.fromStore.city && (
                  <div className="text-[12px] text-zinc-500 mt-0.5">
                    {transfer.fromStore.city}, {transfer.fromStore.state}
                  </div>
                )}
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-600 shrink-0" />
              <div className="flex-1">
                <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">To</div>
                <div className="text-[14px] font-semibold text-zinc-100">{transfer.toStore.name}</div>
                {transfer.toStore.city && (
                  <div className="text-[12px] text-zinc-500 mt-0.5">
                    {transfer.toStore.city}, {transfer.toStore.state}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Lines</div>
                <div className="text-[14px] font-semibold text-zinc-100">{transfer.lines.length}</div>
                <div className="text-[12px] text-zinc-500 mt-0.5">product{transfer.lines.length !== 1 ? 's' : ''}</div>
              </div>
            </div>
            {transfer.notes && (
              <div className="mt-4 pt-4 border-t border-zinc-800/40">
                <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Notes</div>
                <p className="text-[13px] text-zinc-300">{transfer.notes}</p>
              </div>
            )}
          </div>

          {/* Lines Table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/40">
              <Package className="w-4 h-4 text-zinc-500" />
              <span className="text-[13px] font-medium text-zinc-300">Transfer Lines</span>
              <span className="text-[12px] text-zinc-600 ml-1">({transfer.lines.length})</span>
            </div>

            {transfer.lines.length === 0 ? (
              <div className="py-12 text-center text-[13px] text-zinc-500">No lines on this transfer</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/40">
                      <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">
                        Product
                      </th>
                      <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">
                        SKU
                      </th>
                      <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">
                        Requested
                      </th>
                      <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">
                        {transfer.status === 'released' ? 'Ship Qty' : 'Shipped'}
                      </th>
                      <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">
                        Received
                      </th>
                      <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">
                        UOM
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfer.lines.map(line => (
                      <tr
                        key={line.id}
                        className="border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/20 transition-colors"
                      >
                        <td className="py-3 px-4 text-[13px] font-medium text-zinc-100">
                          {line.product.name}
                        </td>
                        <td className="py-3 px-4 text-[12px] font-mono text-zinc-500">
                          {line.product.sku}
                        </td>
                        <td className="py-3 px-4 text-[13px] text-right tabular-nums text-zinc-300">
                          {line.quantity}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {transfer.status === 'released' ? (
                            <input
                              type="number"
                              min={0}
                              max={line.quantity}
                              value={shipQtys[line.id] ?? line.quantity}
                              onChange={e =>
                                setShipQtys(prev => ({
                                  ...prev,
                                  [line.id]: parseInt(e.target.value) || 0,
                                }))
                              }
                              className="w-20 h-7 px-2 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-100 text-right focus:border-blue-500 focus:outline-none tabular-nums"
                            />
                          ) : (
                            <span className="text-[13px] tabular-nums text-zinc-300">
                              {line.quantityShipped}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[13px] text-right tabular-nums">
                          <span
                            className={
                              line.quantityReceived > 0 ? 'text-emerald-400' : 'text-zinc-600'
                            }
                          >
                            {line.quantityReceived}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[12px] text-zinc-500 uppercase">
                          {line.unitOfMeasure}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Status timeline */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">
              Status Progress
            </div>
            <div className="flex items-center gap-0">
              {(['open', 'released', 'shipped', 'received', 'closed'] as const).map(
                (s, idx, arr) => {
                  const statuses = ['open', 'released', 'shipped', 'received', 'closed']
                  const currentIdx = statuses.indexOf(transfer.status)
                  const stepIdx = statuses.indexOf(s)
                  const isDone = stepIdx <= currentIdx
                  const isCurrent = s === transfer.status
                  return (
                    <div key={s} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all ${
                            isCurrent
                              ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                              : isDone
                              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                              : 'border-zinc-700 bg-zinc-800/50 text-zinc-600'
                          }`}
                        >
                          {isDone && !isCurrent ? '✓' : idx + 1}
                        </div>
                        <span
                          className={`mt-1.5 text-[10px] font-medium capitalize whitespace-nowrap ${
                            isCurrent ? 'text-blue-400' : isDone ? 'text-emerald-400' : 'text-zinc-600'
                          }`}
                        >
                          {STATUS_LABELS[s] ?? s}
                        </span>
                      </div>
                      {idx < arr.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-1 transition-all ${
                            stepIdx < currentIdx ? 'bg-emerald-500/40' : 'bg-zinc-800'
                          }`}
                        />
                      )}
                    </div>
                  )
                },
              )}
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
