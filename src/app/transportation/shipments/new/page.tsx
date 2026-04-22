'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'

type Carrier = { id: string; name: string; carrierCode: string; mode: string }

export default function NewShipmentPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [form, setForm] = useState({
    carrierId: '',
    shipmentType: 'outbound',
    mode: 'road',
    origin: '',
    originCity: '',
    originState: '',
    destination: '',
    destCity: '',
    destState: '',
    scheduledDate: '',
    serviceLevel: 'standard',
    freightTerms: 'prepaid',
    weight: '',
    pieces: '',
    freightCharge: '',
    fuelSurcharge: '',
    accessorials: '',
    trackingNumber: '',
    soNumber: '',
    poNumber: '',
    notes: '',
  })

  useEffect(() => {
    fetch('/api/transportation/carriers?active=true')
      .then(r => r.json())
      .then(d => Array.isArray(d) ? setCarriers(d) : setCarriers([]))
  }, [])

  const totalCharge = (
    (parseFloat(form.freightCharge) || 0) +
    (parseFloat(form.fuelSurcharge) || 0) +
    (parseFloat(form.accessorials) || 0)
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/transportation/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          carrierId: form.carrierId || null,
          weight: form.weight ? parseFloat(form.weight) : null,
          pieces: form.pieces ? parseInt(form.pieces) : null,
          freightCharge: form.freightCharge ? parseFloat(form.freightCharge) : null,
          fuelSurcharge: form.fuelSurcharge ? parseFloat(form.fuelSurcharge) : null,
          accessorials: form.accessorials ? parseFloat(form.accessorials) : null,
          totalCharge: totalCharge || null,
          scheduledDate: form.scheduledDate ? new Date(form.scheduledDate).toISOString() : null,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      router.push('/transportation/shipments')
    } catch {
      setSaving(false)
    }
  }

  const inputCls = 'w-full rounded-md bg-zinc-900 border border-zinc-700 text-zinc-100 text-[13px] px-3 py-2 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500'
  const labelCls = 'block text-[12px] text-zinc-400 mb-1'

  return (
    <>
      <TopBar title="New Shipment" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a]">
        <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[18px] font-semibold text-zinc-100">New Shipment</h1>
              <p className="text-[13px] text-zinc-500">Create a transportation shipment</p>
            </div>
            <Link href="/transportation/shipments" className="text-[12px] text-zinc-400 hover:text-zinc-200">Cancel</Link>
          </div>

          {/* Shipment basics */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-1 mb-3">Shipment Details</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Type</label>
                <select value={form.shipmentType} onChange={e => setForm(f => ({ ...f, shipmentType: e.target.value }))} className={inputCls}>
                  <option value="outbound">Outbound</option>
                  <option value="inbound">Inbound</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Mode</label>
                <select value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))} className={inputCls}>
                  {['road', 'air', 'rail', 'ocean', 'intermodal'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Carrier</label>
                <select value={form.carrierId} onChange={e => setForm(f => ({ ...f, carrierId: e.target.value }))} className={inputCls}>
                  <option value="">-- No carrier --</option>
                  {carriers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.carrierCode})</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Service Level</label>
                <select value={form.serviceLevel} onChange={e => setForm(f => ({ ...f, serviceLevel: e.target.value }))} className={inputCls}>
                  {['standard', 'expedited', 'overnight', 'economy', 'white_glove'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Freight Terms</label>
                <select value={form.freightTerms} onChange={e => setForm(f => ({ ...f, freightTerms: e.target.value }))} className={inputCls}>
                  <option value="prepaid">Prepaid</option>
                  <option value="collect">Collect</option>
                  <option value="third_party">Third Party</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Scheduled Date</label>
                <input type="date" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Origin / Destination */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-1 mb-3">Origin &amp; Destination</p>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-[12px] text-zinc-400 font-medium">Origin</p>
                <input value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))} placeholder="Address" className={inputCls} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>City *</label>
                    <input required value={form.originCity} onChange={e => setForm(f => ({ ...f, originCity: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>State *</label>
                    <input required value={form.originState} onChange={e => setForm(f => ({ ...f, originState: e.target.value }))} maxLength={2} placeholder="TX" className={inputCls} />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[12px] text-zinc-400 font-medium">Destination</p>
                <input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="Address" className={inputCls} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>City *</label>
                    <input required value={form.destCity} onChange={e => setForm(f => ({ ...f, destCity: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>State *</label>
                    <input required value={form.destState} onChange={e => setForm(f => ({ ...f, destState: e.target.value }))} maxLength={2} placeholder="CA" className={inputCls} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cargo & References */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-1 mb-3">Cargo &amp; References</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Weight (lbs)</label>
                <input type="number" step="0.1" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Pieces</label>
                <input type="number" value={form.pieces} onChange={e => setForm(f => ({ ...f, pieces: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Tracking Number</label>
                <input value={form.trackingNumber} onChange={e => setForm(f => ({ ...f, trackingNumber: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Sales Order #</label>
                <input value={form.soNumber} onChange={e => setForm(f => ({ ...f, soNumber: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Purchase Order #</label>
                <input value={form.poNumber} onChange={e => setForm(f => ({ ...f, poNumber: e.target.value }))} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Charges */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-1 mb-3">Freight Charges</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Freight Charge</label>
                <input type="number" step="0.01" value={form.freightCharge} onChange={e => setForm(f => ({ ...f, freightCharge: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Fuel Surcharge</label>
                <input type="number" step="0.01" value={form.fuelSurcharge} onChange={e => setForm(f => ({ ...f, fuelSurcharge: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Accessorials</label>
                <input type="number" step="0.01" value={form.accessorials} onChange={e => setForm(f => ({ ...f, accessorials: e.target.value }))} className={inputCls} />
              </div>
            </div>
            {totalCharge > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2 text-[13px] flex items-center gap-2">
                <span className="text-zinc-400">Total Charge:</span>
                <span className="text-blue-400 font-bold text-lg">${totalCharge.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div>
            <label className={labelCls}>Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className={inputCls + ' resize-none'} />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] font-medium transition-colors">
              {saving ? 'Creating...' : 'Create Shipment'}
            </button>
            <Link href="/transportation/shipments"
              className="px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-[13px] transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </>
  )
}
