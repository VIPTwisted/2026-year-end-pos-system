'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PackageCheck, Plus, X, Trash2 } from 'lucide-react'

type ShipmentLine = { productName: string; expectedQty: number; unitCost: number }
type Shipment = {
  id: string
  shipmentNumber: string
  vendorName: string | null
  poNumber: string | null
  expectedDate: string | null
  locationName: string | null
  status: string
  lines: unknown[]
  crossDockLines: unknown[]
}

const STATUS_COLORS: Record<string, string> = {
  expected: 'bg-blue-500/20 text-blue-400',
  arrived: 'bg-yellow-500/20 text-yellow-400',
  receiving: 'bg-purple-500/20 text-purple-400',
  received: 'bg-green-500/20 text-green-400',
  discrepancy: 'bg-red-500/20 text-red-400',
}

const TABS = ['all', 'expected', 'receiving', 'discrepancy']

export default function InboundPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ vendorName: '', poNumber: '', expectedDate: '', locationName: '' })
  const [lines, setLines] = useState<ShipmentLine[]>([{ productName: '', expectedQty: 1, unitCost: 0 }])
  const [submitting, setSubmitting] = useState(false)

  const load = async (status?: string) => {
    setLoading(true)
    const url = status && status !== 'all' ? `/api/inventory/inbound?status=${status}` : '/api/inventory/inbound'
    const res = await fetch(url)
    const data = await res.json()
    setShipments(data)
    setLoading(false)
  }

  useEffect(() => { load(activeTab) }, [activeTab])

  const addLine = () => setLines(l => [...l, { productName: '', expectedQty: 1, unitCost: 0 }])
  const removeLine = (i: number) => setLines(l => l.filter((_, idx) => idx !== i))
  const updateLine = (i: number, field: keyof ShipmentLine, val: string | number) =>
    setLines(l => l.map((line, idx) => idx === i ? { ...line, [field]: val } : line))

  const submit = async () => {
    setSubmitting(true)
    await fetch('/api/inventory/inbound', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, lines }),
    })
    setShowModal(false)
    setForm({ vendorName: '', poNumber: '', expectedDate: '', locationName: '' })
    setLines([{ productName: '', expectedQty: 1, unitCost: 0 }])
    setSubmitting(false)
    load(activeTab)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PackageCheck className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-zinc-100">Inbound Shipments</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Shipment
        </button>
      </div>

      <div className="flex gap-2">
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === t ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Shipment #', 'Vendor', 'PO #', 'Expected Date', 'Location', 'Lines', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-zinc-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">Loading...</td></tr>
            ) : shipments.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">No shipments found</td></tr>
            ) : shipments.map(s => (
              <tr key={s.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="px-4 py-3 font-mono text-blue-400">{s.shipmentNumber}</td>
                <td className="px-4 py-3 text-zinc-300">{s.vendorName || '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{s.poNumber || '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{s.expectedDate ? new Date(s.expectedDate).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{s.locationName || '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{(s.lines as unknown[]).length}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[s.status] || 'bg-zinc-700 text-zinc-300'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/inventory-ops/inbound/${s.id}`} className="text-blue-400 hover:text-blue-300 text-xs font-medium">
                    View / Receive
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-100">New Inbound Shipment</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Vendor Name', key: 'vendorName', type: 'text' },
                  { label: 'PO Number', key: 'poNumber', type: 'text' },
                  { label: 'Expected Date', key: 'expectedDate', type: 'date' },
                  { label: 'Location', key: 'locationName', type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-zinc-400 mb-1">{f.label}</label>
                    <input type={f.type} value={form[f.key as keyof typeof form]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-zinc-400 font-medium">Line Items</label>
                  <button onClick={addLine} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Line</button>
                </div>
                <div className="space-y-2">
                  {lines.map((line, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input placeholder="Product name" value={line.productName}
                        onChange={e => updateLine(i, 'productName', e.target.value)}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                      <input type="number" placeholder="Qty" value={line.expectedQty}
                        onChange={e => updateLine(i, 'expectedQty', parseInt(e.target.value) || 0)}
                        className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                      <input type="number" placeholder="Cost" value={line.unitCost}
                        onChange={e => updateLine(i, 'unitCost', parseFloat(e.target.value) || 0)}
                        className="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                      <button onClick={() => removeLine(i)} className="text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">Cancel</button>
                <button onClick={submit} disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
                  {submitting ? 'Creating...' : 'Create Shipment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
