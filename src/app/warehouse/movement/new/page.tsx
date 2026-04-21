'use client'

import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Location = {
  id: string
  locationCode: string
  name: string
}

type Bin = {
  id: string
  locationCode: string
  zoneCode: string
  rackCode: string | null
  binCode: string
  binType: string
  isBlocked: boolean
}

type Product = {
  id: string
  sku: string
  name: string
}

const ENTRY_TYPES = ['RECEIVE', 'PICK', 'PUTAWAY', 'TRANSFER', 'ADJUST', 'WRITE_OFF'] as const
type EntryType = typeof ENTRY_TYPES[number]

// Which entry types use fromBin / toBin
const NEEDS_FROM: Record<EntryType, boolean> = {
  RECEIVE:  false,
  PICK:     true,
  PUTAWAY:  false,
  TRANSFER: true,
  ADJUST:   true,
  WRITE_OFF: true,
}
const NEEDS_TO: Record<EntryType, boolean> = {
  RECEIVE:  true,
  PICK:     false,
  PUTAWAY:  true,
  TRANSFER: true,
  ADJUST:   false,
  WRITE_OFF: false,
}

export default function NewMovementPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [locations, setLocations] = useState<Location[]>([])
  const [bins, setBins] = useState<Bin[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [form, setForm] = useState({
    entryType: 'RECEIVE' as EntryType,
    locationId: '',
    fromBinCode: '',
    fromZoneCode: '',
    toBinCode: '',
    toZoneCode: '',
    productId: '',
    quantity: '',
    notes: '',
  })

  // Load locations + products on mount
  useEffect(() => {
    fetch('/api/warehouse/locations')
      .then(r => r.json())
      .then((data: Location[]) => setLocations(data))
      .catch(() => setLocations([]))
    fetch('/api/products')
      .then(r => r.json())
      .then((data: unknown) => setProducts(Array.isArray(data) ? (data as Product[]) : []))
      .catch(() => setProducts([]))
  }, [])

  // Load bins when location changes
  useEffect(() => {
    if (!form.locationId) { setBins([]); return }
    fetch(`/api/warehouse/bins?locationId=${form.locationId}`)
      .then(r => r.json())
      .then((data: Bin[]) => setBins(Array.isArray(data) ? data : []))
      .catch(() => setBins([]))
  }, [form.locationId])

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleBinSelect(
    field: 'from' | 'to',
    value: string
  ) {
    if (!value) {
      if (field === 'from') setForm(f => ({ ...f, fromBinCode: '', fromZoneCode: '' }))
      else setForm(f => ({ ...f, toBinCode: '', toZoneCode: '' }))
      return
    }
    // value is "zoneCode|binCode"
    const [zoneCode, binCode] = value.split('|')
    if (field === 'from') setForm(f => ({ ...f, fromBinCode: binCode, fromZoneCode: zoneCode }))
    else setForm(f => ({ ...f, toBinCode: binCode, toZoneCode: zoneCode }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const qty = parseFloat(form.quantity)
    if (!form.locationId) { setError('Location is required'); return }
    if (!form.productId) { setError('Product is required'); return }
    if (isNaN(qty) || qty === 0) { setError('Quantity must be a non-zero number'); return }
    if (form.entryType !== 'ADJUST' && qty < 0) { setError('Quantity must be positive for ' + form.entryType); return }

    const needsFrom = NEEDS_FROM[form.entryType]
    const needsTo = NEEDS_TO[form.entryType]
    if (needsFrom && !form.fromBinCode) { setError('From bin is required for ' + form.entryType); return }
    if (needsTo && !form.toBinCode) { setError('To bin is required for ' + form.entryType); return }

    setSaving(true)
    try {
      const res = await fetch('/api/warehouse/movement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryType: form.entryType,
          locationId: form.locationId,
          productId: form.productId,
          quantity: qty,
          fromBinCode: form.fromBinCode || undefined,
          fromZoneCode: form.fromZoneCode || undefined,
          toBinCode: form.toBinCode || undefined,
          toZoneCode: form.toZoneCode || undefined,
          notes: form.notes.trim() || undefined,
        }),
      })
      const data: { error?: string } = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to log movement'); return }
      router.push('/warehouse')
    } catch {
      setError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5'

  const needsFrom = NEEDS_FROM[form.entryType]
  const needsTo = NEEDS_TO[form.entryType]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <TopBar title="Log Warehouse Movement" />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">

          <Link href="/warehouse" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Warehouse
          </Link>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-zinc-100">Log Movement</h2>
            <p className="text-sm text-zinc-500 mt-1">Record a warehouse inventory entry</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Entry Type */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-5">Movement Type</h3>
              <div>
                <label className={labelCls}>Entry Type <span className="text-red-400">*</span></label>
                <select
                  className={inputCls}
                  value={form.entryType}
                  onChange={e => {
                    set('entryType', e.target.value)
                    // Reset bin selections when type changes
                    setForm(f => ({ ...f, entryType: e.target.value as EntryType, fromBinCode: '', fromZoneCode: '', toBinCode: '', toZoneCode: '' }))
                  }}
                  required
                >
                  {ENTRY_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <p className="text-xs text-zinc-500 mt-1.5">
                  {form.entryType === 'RECEIVE'   && 'Receives goods into a destination bin. Requires: To bin.'}
                  {form.entryType === 'PICK'       && 'Picks goods from a source bin. Requires: From bin.'}
                  {form.entryType === 'PUTAWAY'    && 'Puts goods away into a destination bin. Requires: To bin.'}
                  {form.entryType === 'TRANSFER'   && 'Moves goods between bins. Requires: From and To bins.'}
                  {form.entryType === 'ADJUST'     && 'Adjusts quantity in a bin (positive or negative). Requires: From bin.'}
                  {form.entryType === 'WRITE_OFF'  && 'Writes off inventory. Sets quantity to 0 and flags for adjustment. Requires: From bin.'}
                </p>
              </div>
            </div>

            {/* Location + Bins */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-5">Location & Bins</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Location <span className="text-red-400">*</span></label>
                  <select
                    className={inputCls}
                    value={form.locationId}
                    onChange={e => {
                      setForm(f => ({ ...f, locationId: e.target.value, fromBinCode: '', fromZoneCode: '', toBinCode: '', toZoneCode: '' }))
                    }}
                    required
                  >
                    <option value="">Select location…</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.locationCode} — {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* From Bin */}
                  <div className={needsFrom ? '' : 'opacity-40 pointer-events-none'}>
                    <label className={labelCls}>
                      From Bin {needsFrom && <span className="text-red-400">*</span>}
                    </label>
                    <select
                      className={inputCls}
                      value={form.fromZoneCode && form.fromBinCode ? `${form.fromZoneCode}|${form.fromBinCode}` : ''}
                      onChange={e => handleBinSelect('from', e.target.value)}
                      disabled={!form.locationId || !needsFrom}
                    >
                      <option value="">Select bin…</option>
                      {bins.map(b => (
                        <option key={`${b.zoneCode}|${b.binCode}`} value={`${b.zoneCode}|${b.binCode}`}>
                          {b.zoneCode} / {b.binCode}{b.isBlocked ? ' [BLOCKED]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* To Bin */}
                  <div className={needsTo ? '' : 'opacity-40 pointer-events-none'}>
                    <label className={labelCls}>
                      To Bin {needsTo && <span className="text-red-400">*</span>}
                    </label>
                    <select
                      className={inputCls}
                      value={form.toZoneCode && form.toBinCode ? `${form.toZoneCode}|${form.toBinCode}` : ''}
                      onChange={e => handleBinSelect('to', e.target.value)}
                      disabled={!form.locationId || !needsTo}
                    >
                      <option value="">Select bin…</option>
                      {bins.map(b => (
                        <option key={`${b.zoneCode}|${b.binCode}`} value={`${b.zoneCode}|${b.binCode}`}>
                          {b.zoneCode} / {b.binCode}{b.isBlocked ? ' [BLOCKED]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Product + Quantity */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-5">Product & Quantity</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Product <span className="text-red-400">*</span></label>
                  <select
                    className={inputCls}
                    value={form.productId}
                    onChange={e => set('productId', e.target.value)}
                    required
                  >
                    <option value="">Select product…</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.sku} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Quantity <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    min={form.entryType === 'ADJUST' ? undefined : '0.001'}
                    step="any"
                    className={inputCls}
                    value={form.quantity}
                    onChange={e => set('quantity', e.target.value)}
                    placeholder={form.entryType === 'ADJUST' ? 'e.g. 10 or -5' : 'e.g. 10'}
                    required
                  />
                  {form.entryType === 'ADJUST' && (
                    <p className="text-xs text-zinc-500 mt-1">Use a positive number to add stock or a negative number to reduce it (write-down). Use WRITE_OFF to zero out a bin entirely.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-5">Notes</h3>
              <textarea
                className={inputCls + ' resize-none'}
                rows={3}
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Optional reference, reason, or notes…"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pb-4">
              <Link href="/warehouse">
                <Button type="button" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 text-white gap-2"
              >
                {saving ? 'Saving…' : 'Log Movement'}
              </Button>
            </div>

          </form>
        </div>
      </main>
    </div>
  )
}
