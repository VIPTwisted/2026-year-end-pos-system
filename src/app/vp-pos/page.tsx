'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Truck, Plus, X } from 'lucide-react'

type PO = {
  id: string; poNumber: string; status: string
  orderDate: string; expectedDate: string | null
  totalAmount: number; ackBy: string | null; ackAt: string | null
  vendor: { id: string; name: string; vendorNumber: string }
  _count: { lines: number }
}
type VendorOpt = { id: string; name: string; vendorNumber: string }

const TABS = ['all','draft','sent','acknowledged','partial','received','cancelled']

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    draft:'bg-zinc-700/40 text-zinc-400', sent:'bg-blue-500/15 text-blue-400',
    acknowledged:'bg-cyan-500/15 text-cyan-400', partial:'bg-amber-500/15 text-amber-400',
    received:'bg-emerald-500/15 text-emerald-400', closed:'bg-zinc-600/30 text-zinc-500',
    cancelled:'bg-red-500/15 text-red-400',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${map[s] ?? 'text-zinc-400'}`}>
      {s}
    </span>
  )
}

export default function VpPOsPage() {
  const [pos, setPos]       = useState<PO[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]       = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [vendors, setVendors] = useState<VendorOpt[]>([])
  const [form, setForm]     = useState({
    vendorId: '', expectedDate: '', notes: '', currency: 'USD',
    lines: [{ productName: '', sku: '', qty: 1, unitCost: 0 }],
  })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (tab !== 'all') params.set('status', tab)
    const res = await fetch(`/api/vp-pos?${params}`)
    setPos(await res.json())
    setLoading(false)
  }, [tab])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    fetch('/api/vp-vendors').then(r => r.json()).then(setVendors)
  }, [])

  async function createPO(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const lines = form.lines.filter(l => l.productName.trim())
    await fetch('/api/vp-pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, lines }),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ vendorId: '', expectedDate: '', notes: '', currency: 'USD', lines: [{ productName: '', sku: '', qty: 1, unitCost: 0 }] })
    load()
  }

  async function sendPO(poId: string) {
    await fetch(`/api/vp-pos/${poId}/send`, { method: 'POST' })
    load()
  }

  async function ackPO(poId: string) {
    const ackBy = prompt('Acknowledged by:')
    if (ackBy === null) return
    await fetch(`/api/vp-pos/${poId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ackBy }),
    })
    load()
  }

  return (
    <>
      <TopBar title="Purchase Orders" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Vendor Purchase Orders</h2>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" />New PO
          </Button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1 border-b border-zinc-800">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                tab === t ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >{t}</button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-zinc-500 text-sm">Loading...</p>
        ) : pos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16 text-zinc-600">
              <Truck className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No purchase orders found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">PO #</th>
                  <th className="text-left pb-3 font-medium">Vendor</th>
                  <th className="text-left pb-3 font-medium">Order Date</th>
                  <th className="text-left pb-3 font-medium">Expected</th>
                  <th className="text-right pb-3 font-medium">Lines</th>
                  <th className="text-right pb-3 font-medium">Total</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Ack&apos;d By</th>
                  <th className="text-right pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {pos.map(po => (
                  <tr key={po.id} className="hover:bg-zinc-900/30">
                    <td className="py-3 pr-4 font-mono text-xs text-zinc-300">
                      <Link href={`/vp-pos/${po.id}`} className="hover:text-blue-400">{po.poNumber}</Link>
                    </td>
                    <td className="py-3 pr-4">
                      <Link href={`/vp-vendors/${po.vendor.id}`} className="text-zinc-100 hover:text-blue-400">{po.vendor.name}</Link>
                      <div className="text-xs text-zinc-500">{po.vendor.vendorNumber}</div>
                    </td>
                    <td className="py-3 pr-4 text-zinc-400 text-xs">{new Date(po.orderDate).toLocaleDateString()}</td>
                    <td className="py-3 pr-4 text-zinc-400 text-xs">
                      {po.expectedDate ? new Date(po.expectedDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 pr-4 text-right text-zinc-300">{po._count.lines}</td>
                    <td className="py-3 pr-4 text-right font-semibold text-zinc-100">{formatCurrency(po.totalAmount)}</td>
                    <td className="py-3 pr-4 text-center"><StatusBadge s={po.status} /></td>
                    <td className="py-3 pr-4 text-xs text-zinc-500">
                      {po.ackBy ?? '—'}
                      {po.ackAt && <div className="text-zinc-600">{new Date(po.ackAt).toLocaleDateString()}</div>}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {po.status === 'draft' && (
                          <button onClick={() => sendPO(po.id)} className="text-xs text-blue-400 hover:text-blue-300">Send</button>
                        )}
                        {po.status === 'sent' && (
                          <button onClick={() => ackPO(po.id)} className="text-xs text-cyan-400 hover:text-cyan-300">Acknowledge</button>
                        )}
                        <Link href={`/vp-pos/${po.id}`}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* New PO Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                <h2 className="text-base font-semibold text-zinc-100">New Purchase Order</h2>
                <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-zinc-500" /></button>
              </div>
              <form onSubmit={createPO} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Vendor *</label>
                  <select required value={form.vendorId} onChange={e => setForm(f => ({...f, vendorId: e.target.value}))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                    <option value="">Select vendor...</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.vendorNumber})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Expected Date</label>
                    <input type="date" value={form.expectedDate} onChange={e => setForm(f => ({...f, expectedDate: e.target.value}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Currency</label>
                    <select value={form.currency} onChange={e => setForm(f => ({...f, currency: e.target.value}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                      <option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-zinc-400 mb-1">Notes</label>
                    <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-zinc-400 uppercase tracking-wide">Line Items</label>
                    <button type="button" onClick={() => setForm(f => ({...f, lines: [...f.lines, { productName: '', sku: '', qty: 1, unitCost: 0 }]}))}
                      className="text-xs text-blue-400 hover:text-blue-300">+ Add Line</button>
                  </div>
                  {form.lines.map((line, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 mb-2">
                      <input placeholder="Product Name" value={line.productName}
                        onChange={e => setForm(f => { const ls = [...f.lines]; ls[i] = {...ls[i], productName: e.target.value}; return {...f, lines: ls} })}
                        className="col-span-5 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                      <input placeholder="SKU" value={line.sku}
                        onChange={e => setForm(f => { const ls = [...f.lines]; ls[i] = {...ls[i], sku: e.target.value}; return {...f, lines: ls} })}
                        className="col-span-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                      <input type="number" placeholder="Qty" value={line.qty}
                        onChange={e => setForm(f => { const ls = [...f.lines]; ls[i] = {...ls[i], qty: parseFloat(e.target.value)}; return {...f, lines: ls} })}
                        className="col-span-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                      <input type="number" placeholder="Cost" value={line.unitCost}
                        onChange={e => setForm(f => { const ls = [...f.lines]; ls[i] = {...ls[i], unitCost: parseFloat(e.target.value)}; return {...f, lines: ls} })}
                        className="col-span-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                      <button type="button" onClick={() => setForm(f => ({...f, lines: f.lines.filter((_,j) => j !== i)}))}
                        className="col-span-1 text-zinc-600 hover:text-red-400 flex items-center justify-center">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="text-right text-sm mt-2">
                    Total: <span className="font-bold text-zinc-100">{formatCurrency(form.lines.reduce((s,l) => s + l.qty * l.unitCost, 0))}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Creating...' : 'Create PO'}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
