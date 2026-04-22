'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { Save, ChevronRight } from 'lucide-react'

interface ChargeType {
  id: string
  code: string
  name: string
  description: string | null
}

interface POOption {
  id: string
  poNumber: string
  totalAmount: number
  supplier: { name: string } | null
  items: {
    id: string
    productId: string
    productName: string
    sku: string
    orderedQty: number
    lineTotal: number
  }[]
}

interface AllocationPreview {
  productName: string
  sku: string
  qty: number
  lineTotal: number
  allocated: number
}

const ALLOC_OPTIONS = [
  { value: 'quantity', label: 'By Quantity' },
  { value: 'amount',   label: 'By Amount (line value)' },
  { value: 'weight',   label: 'Equal Distribution' },
]

function computeAllocations(
  items: POOption['items'],
  amount: number,
  allocationType: string
): AllocationPreview[] {
  if (!items.length || amount <= 0) return []

  let lines: AllocationPreview[] = []

  if (allocationType === 'quantity') {
    const totalQty = items.reduce((s, i) => s + i.orderedQty, 0)
    if (totalQty <= 0) return []
    lines = items.map(i => ({
      productName: i.productName,
      sku: i.sku,
      qty: i.orderedQty,
      lineTotal: i.lineTotal,
      allocated: parseFloat(((i.orderedQty / totalQty) * amount).toFixed(4)),
    }))
  } else if (allocationType === 'amount') {
    const totalLineVal = items.reduce((s, i) => s + i.lineTotal, 0)
    if (totalLineVal <= 0) return []
    lines = items.map(i => ({
      productName: i.productName,
      sku: i.sku,
      qty: i.orderedQty,
      lineTotal: i.lineTotal,
      allocated: parseFloat(((i.lineTotal / totalLineVal) * amount).toFixed(4)),
    }))
  } else {
    const share = parseFloat((amount / items.length).toFixed(4))
    lines = items.map(i => ({
      productName: i.productName,
      sku: i.sku,
      qty: i.orderedQty,
      lineTotal: i.lineTotal,
      allocated: share,
    }))
  }

  // Fix rounding
  if (lines.length > 0) {
    const allocated = lines.reduce((s, l) => s + l.allocated, 0)
    const diff = parseFloat((amount - allocated).toFixed(4))
    if (diff !== 0) lines[0].allocated = parseFloat((lines[0].allocated + diff).toFixed(4))
  }

  return lines
}

export default function NewItemChargePage() {
  const router = useRouter()

  const [chargeTypes, setChargeTypes] = useState<ChargeType[]>([])
  const [pos, setPOs] = useState<POOption[]>([])

  const [chargeTypeId, setChargeTypeId] = useState('')
  const [purchaseOrderId, setPurchaseOrderId] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('0.00')
  const [currency, setCurrency] = useState('USD')
  const [allocationType, setAllocationType] = useState('quantity')
  const [vendorId, setVendorId] = useState('')
  const [invoiceRef, setInvoiceRef] = useState('')
  const [chargeDate, setChargeDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  useEffect(() => {
    fetch('/api/purchasing/item-charges/charge-types')
      .then(r => r.json())
      .then((d: ChargeType[]) => setChargeTypes(Array.isArray(d) ? d : []))
      .catch(() => setChargeTypes([]))

    fetch('/api/purchasing?status=received')
      .then(r => r.json())
      .then((d: POOption[]) => setPOs(Array.isArray(d) ? d.slice(0, 50) : []))
      .catch(() => setPOs([]))
  }, [])

  const selectedPO = pos.find(p => p.id === purchaseOrderId)
  const amountNum = parseFloat(amount) || 0
  const preview: AllocationPreview[] = selectedPO
    ? computeAllocations(selectedPO.items, amountNum, allocationType)
    : []

  async function submit() {
    if (!chargeTypeId) { setError('Select a charge type.'); return }
    if (!description.trim()) { setError('Description is required.'); return }
    if (amountNum <= 0) { setError('Amount must be greater than 0.'); return }
    setError('')
    setSaving(true)

    try {
      const res = await fetch('/api/purchasing/item-charges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chargeTypeId,
          purchaseOrderId: purchaseOrderId || undefined,
          description: description.trim(),
          amount: amountNum,
          currency,
          allocationType,
          vendorId: vendorId.trim() || undefined,
          invoiceRef: invoiceRef.trim() || undefined,
          chargeDate,
          notes: notes.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Failed to create charge.')
        setSaving(false)
        return
      }

      notify('Charge created successfully')
      setTimeout(() => router.push('/purchasing/item-charges'), 800)
    } catch {
      setError('Network error. Please try again.')
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors'
  const labelClass =
    'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1'

  return (
    <>
      <TopBar
        title="Add Item Charge"
        showBack
        breadcrumb={[
          { label: 'Purchasing', href: '/purchasing' },
          { label: 'Item Charges', href: '/purchasing/item-charges' },
        ]}
      />

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

      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Page title row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-100">New Item Charge</h1>
              <p className="text-[13px] text-zinc-500 mt-0.5">
                Add freight, customs, insurance or other landed costs
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/purchasing/item-charges')}
                disabled={saving}
                className="h-8 px-3 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 text-[13px] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={saving}
                className="inline-flex items-center gap-1.5 h-8 px-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium rounded transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving…' : 'Save Charge'}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-800/60 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: main form */}
            <div className="lg:col-span-2 space-y-6">

              {/* Core fields */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">
                  Charge Details
                </p>
                <div className="grid grid-cols-2 gap-4">

                  <div className="col-span-2 md:col-span-1">
                    <label className={labelClass}>Charge Type *</label>
                    <select
                      value={chargeTypeId}
                      onChange={e => setChargeTypeId(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">— Select Type —</option>
                      {chargeTypes.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.code} — {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className={labelClass}>Purchase Order</label>
                    <select
                      value={purchaseOrderId}
                      onChange={e => setPurchaseOrderId(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">— None / Standalone —</option>
                      {pos.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.poNumber}{p.supplier ? ` · ${p.supplier.name}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className={labelClass}>Description *</label>
                    <input
                      type="text"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="e.g. Ocean freight — Shanghai to LA"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Amount *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        className={`${inputClass} pl-7`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Currency</label>
                    <select
                      value={currency}
                      onChange={e => setCurrency(e.target.value)}
                      className={inputClass}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="JPY">JPY</option>
                      <option value="CNY">CNY</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Allocation Method</label>
                    <select
                      value={allocationType}
                      onChange={e => setAllocationType(e.target.value)}
                      className={inputClass}
                    >
                      {ALLOC_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Charge Date</label>
                    <input
                      type="date"
                      value={chargeDate}
                      onChange={e => setChargeDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Vendor / Carrier</label>
                    <input
                      type="text"
                      value={vendorId}
                      onChange={e => setVendorId(e.target.value)}
                      placeholder="e.g. Maersk, UPS, USPS"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Invoice / Bill Ref</label>
                    <input
                      type="text"
                      value={invoiceRef}
                      onChange={e => setInvoiceRef(e.target.value)}
                      placeholder="INV-12345"
                      className={inputClass}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className={labelClass}>Notes</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={2}
                      placeholder="Optional notes…"
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: allocation preview */}
            <div className="space-y-4">
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">
                  Allocation Preview
                </p>

                {!selectedPO && (
                  <p className="text-[13px] text-zinc-500">
                    Select a purchase order to see how{' '}
                    {amountNum > 0 ? formatCurrency(amountNum) : 'the charge'} allocates across PO lines.
                  </p>
                )}

                {selectedPO && amountNum <= 0 && (
                  <p className="text-[13px] text-zinc-500">Enter an amount to see allocation.</p>
                )}

                {selectedPO && amountNum > 0 && preview.length === 0 && (
                  <p className="text-[13px] text-zinc-500">No PO lines to allocate to.</p>
                )}

                {preview.length > 0 && (
                  <>
                    <div className="text-[11px] text-zinc-500 mb-3">
                      {formatCurrency(amountNum)} split across {preview.length} line{preview.length !== 1 ? 's' : ''}
                    </div>
                    <div className="space-y-2">
                      {preview.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-2 py-2 border-b border-zinc-800/50 last:border-0"
                        >
                          <div className="min-w-0">
                            <p className="text-[12px] text-zinc-200 truncate">{p.productName}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">{p.sku} · qty {p.qty}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[13px] font-semibold text-emerald-400 tabular-nums">
                              {formatCurrency(p.allocated)}
                            </p>
                            {amountNum > 0 && (
                              <p className="text-[10px] text-zinc-600 tabular-nums">
                                {((p.allocated / amountNum) * 100).toFixed(1)}%
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-zinc-700 flex justify-between text-[12px]">
                      <span className="text-zinc-500">Total allocated</span>
                      <span className="font-semibold text-zinc-100 tabular-nums">
                        {formatCurrency(preview.reduce((s, p) => s + p.allocated, 0))}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {selectedPO && (
                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                    PO Summary
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[12px]">
                      <span className="text-zinc-500">PO Number</span>
                      <span className="font-mono text-zinc-300">{selectedPO.poNumber}</span>
                    </div>
                    {selectedPO.supplier && (
                      <div className="flex justify-between text-[12px]">
                        <span className="text-zinc-500">Supplier</span>
                        <span className="text-zinc-300">{selectedPO.supplier.name}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[12px]">
                      <span className="text-zinc-500">PO Value</span>
                      <span className="text-emerald-400 font-semibold tabular-nums">
                        {formatCurrency(selectedPO.totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-zinc-500">Line Items</span>
                      <span className="text-zinc-300">{selectedPO.items.length}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-zinc-800">
                    <a
                      href={`/purchasing/${selectedPO.id}`}
                      className="flex items-center gap-1 text-[12px] text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View PO <ChevronRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-3 pb-4">
            <button
              onClick={() => router.push('/purchasing/item-charges')}
              disabled={saving}
              className="h-8 px-3 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 text-[13px] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={saving}
              className="inline-flex items-center gap-1.5 h-8 px-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium rounded transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : 'Save Charge'}
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
