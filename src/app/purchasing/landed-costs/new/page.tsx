'use client'

/**
 * New Landed Cost Entry
 * Route: /purchasing/landed-costs/new/
 *
 * Link to a PO, add charge lines (freight/duty/insurance/handling),
 * select allocation method (weight/value/quantity/manual),
 * preview how the charge allocates across PO line items.
 *
 * Submits to /api/purchasing/landed-costs  (delegates to item-charges model)
 * TODO: Migrate to dedicated LandedCost model once schema is expanded.
 */
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { Save, ChevronRight, Plus, Trash2 } from 'lucide-react'

interface ChargeType   { id: string; code: string; name: string; description: string | null }
interface POOption {
  id: string; poNumber: string; totalAmount: number
  supplier: { name: string } | null
  items: { id: string; productId: string; productName: string; sku: string; orderedQty: number; lineTotal: number }[]
}
interface ChargeLine   { chargeTypeId: string; description: string; amount: string; currency: string; allocationType: string; vendorId: string; invoiceRef: string }
interface AllocationPreview { productName: string; sku: string; qty: number; lineTotal: number; allocated: number }

const ALLOC_OPTIONS = [
  { value: 'quantity', label: 'By Quantity'               },
  { value: 'amount',   label: 'By Amount (line value)'    },
  { value: 'weight',   label: 'Equal Distribution'        },
  { value: 'manual',   label: 'Manual (custom split)'     },
]

function computeAllocations(items: POOption['items'], amount: number, allocType: string): AllocationPreview[] {
  if (!items.length || amount <= 0) return []
  let lines: AllocationPreview[]

  if (allocType === 'quantity') {
    const total = items.reduce((s, i) => s + i.orderedQty, 0)
    if (total <= 0) return []
    lines = items.map(i => ({ productName: i.productName, sku: i.sku, qty: i.orderedQty, lineTotal: i.lineTotal, allocated: parseFloat(((i.orderedQty / total) * amount).toFixed(4)) }))
  } else if (allocType === 'amount') {
    const total = items.reduce((s, i) => s + i.lineTotal, 0)
    if (total <= 0) return []
    lines = items.map(i => ({ productName: i.productName, sku: i.sku, qty: i.orderedQty, lineTotal: i.lineTotal, allocated: parseFloat(((i.lineTotal / total) * amount).toFixed(4)) }))
  } else {
    const share = parseFloat((amount / items.length).toFixed(4))
    lines = items.map(i => ({ productName: i.productName, sku: i.sku, qty: i.orderedQty, lineTotal: i.lineTotal, allocated: share }))
  }

  if (lines.length > 0) {
    const sum  = lines.reduce((s, l) => s + l.allocated, 0)
    const diff = parseFloat((amount - sum).toFixed(4))
    if (diff !== 0) lines[0].allocated = parseFloat((lines[0].allocated + diff).toFixed(4))
  }
  return lines
}

const EMPTY_CHARGE: ChargeLine = { chargeTypeId: '', description: '', amount: '0.00', currency: 'USD', allocationType: 'quantity', vendorId: '', invoiceRef: '' }

export default function NewLandedCostPage() {
  const router = useRouter()

  const [chargeTypes,     setChargeTypes]     = useState<ChargeType[]>([])
  const [pos,             setPOs]             = useState<POOption[]>([])
  const [purchaseOrderId, setPurchaseOrderId] = useState('')
  const [charges,         setCharges]         = useState<ChargeLine[]>([{ ...EMPTY_CHARGE }])
  const [chargeDate,      setChargeDate]      = useState(new Date().toISOString().slice(0, 10))
  const [notes,           setNotes]           = useState('')
  const [saving,          setSaving]          = useState(false)
  const [error,           setError]           = useState('')
  const [toast,           setToast]           = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  useEffect(() => {
    fetch('/api/purchasing/item-charges/charge-types')
      .then(r => r.json())
      .then((d: ChargeType[]) => setChargeTypes(Array.isArray(d) ? d : []))
      .catch(() => {})

    fetch('/api/purchasing?status=received')
      .then(r => r.json())
      .then((d: POOption[]) => setPOs(Array.isArray(d) ? d.slice(0, 50) : []))
      .catch(() => {})
  }, [])

  const selectedPO = pos.find(p => p.id === purchaseOrderId)

  const addChargeLine  = () => setCharges(prev => [...prev, { ...EMPTY_CHARGE }])
  const removeCharge   = (i: number) => setCharges(prev => prev.filter((_, idx) => idx !== i))
  const updateCharge   = <K extends keyof ChargeLine>(i: number, key: K, value: ChargeLine[K]) =>
    setCharges(prev => prev.map((c, idx) => idx === i ? { ...c, [key]: value } : c))

  const totalChargeAmount = charges.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0)
  const preview: AllocationPreview[] = selectedPO && totalChargeAmount > 0
    ? computeAllocations(selectedPO.items, totalChargeAmount, charges[0]?.allocationType ?? 'quantity')
    : []

  async function submit() {
    const validCharges = charges.filter(c => c.chargeTypeId && parseFloat(c.amount) > 0 && c.description.trim())
    if (!validCharges.length) { setError('Add at least one valid charge line (type, description, and amount > 0).'); return }
    setError('')
    setSaving(true)

    try {
      // Submit each charge line individually via the item-charges endpoint
      const results = await Promise.all(validCharges.map(c =>
        fetch('/api/purchasing/item-charges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chargeTypeId:    c.chargeTypeId,
            purchaseOrderId: purchaseOrderId || undefined,
            description:     c.description.trim(),
            amount:          parseFloat(c.amount),
            currency:        c.currency,
            allocationType:  c.allocationType,
            vendorId:        c.vendorId.trim() || undefined,
            invoiceRef:      c.invoiceRef.trim() || undefined,
            chargeDate,
            notes:           notes.trim() || undefined,
          }),
        }).then(r => r.json())
      ))

      const hasError = results.some((r: { error?: string }) => r.error)
      if (hasError) { setError('One or more charges failed to save.'); setSaving(false); return }

      notify('Landed costs saved')
      setTimeout(() => router.push('/purchasing/landed-costs'), 800)
    } catch {
      setError('Network error. Please try again.')
      setSaving(false)
    }
  }

  const inputClass = 'w-full rounded bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors'
  const labelClass = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1'

  return (
    <>
      <TopBar title="New Landed Cost" showBack breadcrumb={[{ label: 'Purchasing', href: '/purchasing' }, { label: 'Landed Costs', href: '/purchasing/landed-costs' }]} />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-[13px] font-medium shadow-lg ${
          toast.type === 'ok' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'
        }`}>{toast.msg}</div>
      )}

      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto space-y-6">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-100">New Landed Cost Entry</h1>
              <p className="text-[13px] text-zinc-500 mt-0.5">Add freight, duty, insurance or handling charges to a purchase order</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => router.push('/purchasing/landed-costs')} disabled={saving} className="h-8 px-3 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 text-[13px] transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={submit} disabled={saving} className="inline-flex items-center gap-1.5 h-8 px-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium rounded transition-colors disabled:opacity-50">
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving…' : 'Save Landed Costs'}
              </button>
            </div>
          </div>

          {error && <div className="rounded-lg border border-red-800/60 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">

              {/* PO Link */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">Purchase Order</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelClass}>Link to PO (optional)</label>
                    <select value={purchaseOrderId} onChange={e => setPurchaseOrderId(e.target.value)} className={inputClass}>
                      <option value="">— Standalone (no PO) —</option>
                      {pos.map(p => (
                        <option key={p.id} value={p.id}>{p.poNumber}{p.supplier ? ` · ${p.supplier.name}` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Charge Date</label>
                    <input type="date" value={chargeDate} onChange={e => setChargeDate(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Notes</label>
                    <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes…" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Charge Lines */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/40">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Charge Lines</p>
                  <button onClick={addChargeLine} type="button" className="inline-flex items-center gap-1 h-7 px-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium transition-colors">
                    <Plus className="w-3 h-3" />Add Charge
                  </button>
                </div>

                <div className="divide-y divide-zinc-800/40">
                  {charges.map((charge, i) => (
                    <div key={i} className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Charge Type *</label>
                          <select value={charge.chargeTypeId} onChange={e => updateCharge(i, 'chargeTypeId', e.target.value)} className={inputClass}>
                            <option value="">— Select —</option>
                            {chargeTypes.map(t => <option key={t.id} value={t.id}>{t.code} — {t.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Allocation Method *</label>
                          <select value={charge.allocationType} onChange={e => updateCharge(i, 'allocationType', e.target.value)} className={inputClass}>
                            {ALLOC_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className={labelClass}>Description *</label>
                          <input type="text" value={charge.description} onChange={e => updateCharge(i, 'description', e.target.value)} placeholder="e.g. Ocean freight — Shanghai to LA" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Amount *</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                            <input type="number" min="0" step="0.01" value={charge.amount} onChange={e => updateCharge(i, 'amount', e.target.value)} className={`${inputClass} pl-7`} />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Currency</label>
                          <select value={charge.currency} onChange={e => updateCharge(i, 'currency', e.target.value)} className={inputClass}>
                            {['USD', 'EUR', 'GBP', 'CAD', 'JPY', 'CNY'].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Vendor / Carrier</label>
                          <input type="text" value={charge.vendorId} onChange={e => updateCharge(i, 'vendorId', e.target.value)} placeholder="Maersk, UPS…" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Invoice / Bill Ref</label>
                          <input type="text" value={charge.invoiceRef} onChange={e => updateCharge(i, 'invoiceRef', e.target.value)} placeholder="INV-12345" className={inputClass} />
                        </div>
                      </div>
                      {charges.length > 1 && (
                        <button onClick={() => removeCharge(i)} type="button" className="inline-flex items-center gap-1 text-[12px] text-red-400 hover:text-red-300 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />Remove line
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {charges.length > 1 && (
                  <div className="px-5 py-3 border-t border-zinc-800/40 flex items-center justify-between">
                    <span className="text-[12px] text-zinc-500">Total charges</span>
                    <span className="text-[14px] font-semibold text-emerald-400 tabular-nums">{formatCurrency(totalChargeAmount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Allocation preview */}
            <div className="space-y-4">
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">Allocation Preview</p>

                {!selectedPO && <p className="text-[13px] text-zinc-500">Select a purchase order to preview allocation.</p>}
                {selectedPO && totalChargeAmount <= 0 && <p className="text-[13px] text-zinc-500">Enter a charge amount to see allocation.</p>}
                {selectedPO && totalChargeAmount > 0 && preview.length === 0 && <p className="text-[13px] text-zinc-500">No PO lines to allocate to.</p>}

                {preview.length > 0 && (
                  <>
                    <div className="text-[11px] text-zinc-500 mb-3">
                      {formatCurrency(totalChargeAmount)} split across {preview.length} line{preview.length !== 1 ? 's' : ''}
                    </div>
                    <div className="space-y-2">
                      {preview.map((p, i) => (
                        <div key={i} className="flex items-center justify-between gap-2 py-2 border-b border-zinc-800/50 last:border-0">
                          <div className="min-w-0">
                            <p className="text-[12px] text-zinc-200 truncate">{p.productName}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">{p.sku} · qty {p.qty}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[13px] font-semibold text-emerald-400 tabular-nums">{formatCurrency(p.allocated)}</p>
                            <p className="text-[10px] text-zinc-600 tabular-nums">{((p.allocated / totalChargeAmount) * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-zinc-700 flex justify-between text-[12px]">
                      <span className="text-zinc-500">Total allocated</span>
                      <span className="font-semibold text-zinc-100 tabular-nums">{formatCurrency(preview.reduce((s, p) => s + p.allocated, 0))}</span>
                    </div>
                  </>
                )}
              </div>

              {selectedPO && (
                <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">PO Summary</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[12px]"><span className="text-zinc-500">PO Number</span><span className="font-mono text-zinc-300">{selectedPO.poNumber}</span></div>
                    {selectedPO.supplier && <div className="flex justify-between text-[12px]"><span className="text-zinc-500">Supplier</span><span className="text-zinc-300">{selectedPO.supplier.name}</span></div>}
                    <div className="flex justify-between text-[12px]"><span className="text-zinc-500">PO Value</span><span className="text-emerald-400 font-semibold tabular-nums">{formatCurrency(selectedPO.totalAmount)}</span></div>
                    <div className="flex justify-between text-[12px]"><span className="text-zinc-500">Line Items</span><span className="text-zinc-300">{selectedPO.items.length}</span></div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-zinc-800">
                    <a href={`/purchasing/${selectedPO.id}`} className="flex items-center gap-1 text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
                      View PO <ChevronRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pb-4">
            <button onClick={() => router.push('/purchasing/landed-costs')} disabled={saving} className="h-8 px-3 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 text-[13px] transition-colors disabled:opacity-50">Cancel</button>
            <button onClick={submit} disabled={saving} className="inline-flex items-center gap-1.5 h-8 px-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium rounded transition-colors disabled:opacity-50">
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : 'Save Landed Costs'}
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
