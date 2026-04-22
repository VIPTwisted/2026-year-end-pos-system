'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

const STATUS_STYLE: Record<string, string> = {
  draft:      'bg-zinc-700/60 text-zinc-400 border border-zinc-600/40',
  approved:   'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  shipped:    'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  credited:   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  cancelled:  'bg-rose-500/15 text-rose-400 border border-rose-500/30',
}

const REASON_LABEL: Record<string, string> = {
  defective:   'Defective',
  overstock:   'Overstock',
  wrong_item:  'Wrong Item',
  damaged:     'Damaged',
}

type ReturnLine = {
  id: string
  productId: string
  quantity: number
  unitCost: string | number
  lineTotal: string | number
  notes: string | null
  product: { id: string; name: string; sku: string }
}

type VendorReturn = {
  id: string
  rtvNumber: string
  status: string
  reason: string
  notes: string | null
  totalAmount: string | number
  creditAmount: string | number
  shippedAt: string | null
  creditedAt: string | null
  createdAt: string
  supplier: { id: string; name: string; contactName: string | null; email: string | null; phone: string | null }
  lines: ReturnLine[]
}

function Toast({ msg, type }: { msg: string; type: 'ok' | 'err' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg text-[13px] font-medium shadow-xl border
      ${type === 'ok'
        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
      {msg}
    </div>
  )
}

function toNum(v: string | number | null | undefined): number {
  if (v == null) return 0
  return typeof v === 'number' ? v : parseFloat(v) || 0
}

export default function VendorReturnDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [rtn, setRtn]           = useState<VendorReturn | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [creditInput, setCreditInput] = useState('')
  const [toast, setToast]       = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  const loadReturn = useCallback(() => {
    setLoading(true)
    fetch(`/api/purchasing/vendor-returns/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then((data: VendorReturn) => {
        setRtn(data)
        setCreditInput(toNum(data.creditAmount) > 0 ? toNum(data.creditAmount).toFixed(2) : '')
      })
      .catch(() => notify('Failed to load return', 'err'))
      .finally(() => setLoading(false))
  }, [id, notify])

  useEffect(() => { loadReturn() }, [loadReturn])

  async function updateStatus(newStatus: string, extra?: Record<string, number>) {
    setSaving(true)
    try {
      const res = await fetch(`/api/purchasing/vendor-returns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...extra }),
      })
      if (!res.ok) {
        const err = await res.json() as { error?: string }
        throw new Error(err.error ?? 'Update failed')
      }
      const updated = await res.json() as VendorReturn
      setRtn(updated)
      notify(`Status updated to ${newStatus}`)
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Update failed', 'err')
    } finally {
      setSaving(false)
    }
  }

  async function recordCredit() {
    const amount = parseFloat(creditInput)
    if (isNaN(amount) || amount <= 0) {
      notify('Enter a valid credit amount', 'err')
      return
    }
    await updateStatus('credited', { creditAmount: amount })
  }

  if (loading) {
    return (
      <>
        <TopBar title="Vendor Return" />
        <main className="flex-1 p-6 bg-[#0f0f1a] min-h-[100dvh] flex items-center justify-center">
          <p className="text-zinc-500 text-[13px]">Loading…</p>
        </main>
      </>
    )
  }

  if (!rtn) {
    return (
      <>
        <TopBar title="Vendor Return" />
        <main className="flex-1 p-6 bg-[#0f0f1a] min-h-[100dvh] flex flex-col items-center justify-center gap-4">
          <p className="text-zinc-400 text-[14px]">Return not found.</p>
          <Link href="/purchasing/vendor-returns">
            <Button variant="outline" className="border-zinc-700 text-zinc-400 text-[13px] h-8 px-4 rounded bg-transparent">
              Back to Returns
            </Button>
          </Link>
        </main>
      </>
    )
  }

  const totalAmount  = toNum(rtn.totalAmount)
  const creditAmount = toNum(rtn.creditAmount)

  return (
    <>
      <TopBar title={`RTV ${rtn.rtvNumber}`} />
      <main className="flex-1 p-6 bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Link href="/purchasing/vendor-returns">
                <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-zinc-200 text-[13px] h-8 px-3 rounded bg-transparent">
                  ← Returns
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-zinc-100 font-mono">{rtn.rtvNumber}</h1>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${STATUS_STYLE[rtn.status] ?? 'bg-zinc-700/60 text-zinc-400'}`}>
                    {rtn.status}
                  </span>
                </div>
                <p className="text-[13px] text-zinc-500 mt-0.5">Created {formatDate(new Date(rtn.createdAt))}</p>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Supplier</p>
              <p className="text-[13px] font-medium text-zinc-100">{rtn.supplier.name}</p>
              {rtn.supplier.email && <p className="text-[11px] text-zinc-500 mt-0.5">{rtn.supplier.email}</p>}
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Reason</p>
              <p className="text-[13px] font-medium text-zinc-100">{REASON_LABEL[rtn.reason] ?? rtn.reason}</p>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Amount</p>
              <p className="text-[13px] font-semibold text-zinc-100 tabular-nums">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Credit Received</p>
              <p className={`text-[13px] font-semibold tabular-nums ${creditAmount > 0 ? 'text-emerald-400' : 'text-zinc-600'}`}>
                {creditAmount > 0 ? formatCurrency(creditAmount) : '—'}
              </p>
            </div>
          </div>

          {/* Notes */}
          {rtn.notes && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Notes</p>
              <p className="text-[13px] text-zinc-300">{rtn.notes}</p>
            </div>
          )}

          {/* Timeline */}
          {(rtn.shippedAt || rtn.creditedAt) && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 flex gap-8">
              {rtn.shippedAt && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Shipped</p>
                  <p className="text-[12px] text-zinc-300">{formatDate(new Date(rtn.shippedAt))}</p>
                </div>
              )}
              {rtn.creditedAt && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Credited</p>
                  <p className="text-[12px] text-zinc-300">{formatDate(new Date(rtn.creditedAt))}</p>
                </div>
              )}
            </div>
          )}

          {/* Lines table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800/60">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Return Lines</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-zinc-500 text-[11px] uppercase tracking-wide">
                    <th className="text-left px-4 py-2.5 font-medium">Product</th>
                    <th className="text-left py-2.5 font-medium">SKU</th>
                    <th className="text-center py-2.5 font-medium">Qty</th>
                    <th className="text-right py-2.5 font-medium">Unit Cost</th>
                    <th className="text-right px-4 py-2.5 font-medium">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rtn.lines.map((line, idx) => (
                    <tr
                      key={line.id}
                      className={`hover:bg-zinc-800/20 ${idx !== rtn.lines.length - 1 ? 'border-b border-zinc-800/50' : ''}`}
                    >
                      <td className="px-4 py-2.5 text-zinc-200">{line.product.name}</td>
                      <td className="py-2.5 pr-6 font-mono text-[11px] text-zinc-500">{line.product.sku}</td>
                      <td className="py-2.5 pr-6 text-center text-zinc-300 tabular-nums">{line.quantity}</td>
                      <td className="py-2.5 pr-6 text-right text-zinc-400 tabular-nums">{formatCurrency(toNum(line.unitCost))}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-zinc-100 tabular-nums">{formatCurrency(toNum(line.lineTotal))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-zinc-900/50 border-t border-zinc-800/60">
                    <td colSpan={4} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Total</td>
                    <td className="px-4 py-2.5 text-right font-bold text-zinc-100 tabular-nums">{formatCurrency(totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Status actions */}
          {rtn.status === 'draft' && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Actions</p>
              <div className="flex gap-3">
                <Button
                  onClick={() => updateStatus('approved')}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] h-9 px-5 rounded disabled:opacity-50"
                >
                  {saving ? 'Processing…' : 'Submit for Approval'}
                </Button>
                <Button
                  onClick={() => updateStatus('cancelled')}
                  disabled={saving}
                  variant="outline"
                  className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-[13px] h-9 px-5 rounded bg-transparent disabled:opacity-50"
                >
                  Cancel Return
                </Button>
              </div>
            </div>
          )}

          {rtn.status === 'approved' && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Actions</p>
              <Button
                onClick={() => updateStatus('shipped')}
                disabled={saving}
                className="bg-amber-600 hover:bg-amber-500 text-white text-[13px] h-9 px-5 rounded disabled:opacity-50"
              >
                {saving ? 'Processing…' : 'Mark as Shipped'}
              </Button>
            </div>
          )}

          {rtn.status === 'shipped' && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Record Credit</p>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[13px]">$</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={creditInput}
                    onChange={e => setCreditInput(e.target.value)}
                    placeholder="0.00"
                    className="pl-7 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:border-blue-500 focus:outline-none w-40 tabular-nums"
                  />
                </div>
                <Button
                  onClick={recordCredit}
                  disabled={saving || !creditInput}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] h-9 px-5 rounded disabled:opacity-50"
                >
                  {saving ? 'Processing…' : 'Record Credit'}
                </Button>
              </div>
              <p className="text-[11px] text-zinc-600 mt-2">Enter the credit amount received from the supplier and confirm.</p>
            </div>
          )}

          {(rtn.status === 'credited' || rtn.status === 'cancelled') && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <p className="text-[11px] text-zinc-600">
                {rtn.status === 'credited'
                  ? `This return has been fully processed. Credit of ${formatCurrency(creditAmount)} recorded.`
                  : 'This return has been cancelled.'}
              </p>
            </div>
          )}

        </div>
      </main>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  )
}
