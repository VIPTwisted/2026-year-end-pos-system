'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, ClipboardList, ChevronRight, X } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

type TestGroup = { id: string; name: string }
type QualityOrder = {
  id: string
  orderNumber: string
  productName: string
  qty: number
  sampleQty: number
  referenceType: string
  locationName: string | null
  status: string
  inspectedBy: string | null
  createdAt: string
}

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  open: 'secondary',
  'in-progress': 'default',
  passed: 'success',
  failed: 'destructive',
  cancelled: 'outline',
}

const TABS = ['all', 'open', 'in-progress', 'passed', 'failed']

export default function QualityOrdersPage() {
  const [orders, setOrders] = useState<QualityOrder[]>([])
  const [testGroups, setTestGroups] = useState<TestGroup[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    productName: '', qty: '1', sampleQty: '1', referenceType: 'purchase',
    locationName: '', testGroupId: '', inspectedBy: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    const url = activeTab === 'all' ? '/api/quality/orders' : `/api/quality/orders?status=${activeTab}`
    const [ordersRes, groupsRes] = await Promise.all([
      fetch(url),
      fetch('/api/quality/test-groups'),
    ])
    setOrders(await ordersRes.json())
    setTestGroups(await groupsRes.json())
    setLoading(false)
  }, [activeTab])

  useEffect(() => { load() }, [load])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/quality/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        qty: parseFloat(form.qty) || 1,
        sampleQty: parseFloat(form.sampleQty) || 1,
        testGroupId: form.testGroupId || undefined,
        locationName: form.locationName || undefined,
        inspectedBy: form.inspectedBy || undefined,
      }),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ productName: '', qty: '1', sampleQty: '1', referenceType: 'purchase', locationName: '', testGroupId: '', inspectedBy: '' })
      load()
    }
    setSaving(false)
  }

  return (
    <>
      <TopBar title="Quality Orders" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center gap-1 mb-6 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-medium transition-colors capitalize',
                activeTab === tab ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              )}
            >
              {tab}
            </button>
          ))}
          <Button size="sm" className="ml-auto bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Quality Order
          </Button>
        </div>

        {showForm && (
          <Card className="bg-zinc-900 border-zinc-700 mb-6">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-100">New Quality Order</h3>
                <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleCreate} className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs text-zinc-500 block mb-1">Product Name *</label>
                  <Input value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} placeholder="Product name" required className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm h-8" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Qty</label>
                  <Input type="number" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm h-8" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Sample Qty</label>
                  <Input type="number" value={form.sampleQty} onChange={e => setForm(f => ({ ...f, sampleQty: e.target.value }))} className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm h-8" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Reference Type</label>
                  <select value={form.referenceType} onChange={e => setForm(f => ({ ...f, referenceType: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm h-8 rounded-md px-2">
                    <option value="purchase">Purchase</option>
                    <option value="production">Production</option>
                    <option value="inventory">Inventory</option>
                    <option value="sales">Sales</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Location</label>
                  <Input value={form.locationName} onChange={e => setForm(f => ({ ...f, locationName: e.target.value }))} placeholder="e.g. Warehouse A" className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm h-8" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Test Group</label>
                  <select value={form.testGroupId} onChange={e => setForm(f => ({ ...f, testGroupId: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm h-8 rounded-md px-2">
                    <option value="">— Auto / None —</option>
                    {testGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Inspector</label>
                  <Input value={form.inspectedBy} onChange={e => setForm(f => ({ ...f, inspectedBy: e.target.value }))} placeholder="Inspector name" className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm h-8" />
                </div>
                <div className="col-span-2 md:col-span-3 flex justify-end gap-2 mt-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)} className="text-zinc-400">Cancel</Button>
                  <Button type="submit" size="sm" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">{saving ? 'Creating...' : 'Create Order'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">QO#</th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Product</th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Qty</th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Sample</th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Reference</th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Location</th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Inspector</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-600 text-sm">Loading...</td></tr>}
                {!loading && orders.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-600 text-sm"><ClipboardList className="w-8 h-8 text-zinc-700 mx-auto mb-2" />No quality orders found</td></tr>
                )}
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3"><Link href={`/quality/orders/${o.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs">{o.orderNumber}</Link></td>
                    <td className="px-4 py-3 text-zinc-300 text-xs max-w-[160px] truncate">{o.productName}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{o.qty}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{o.sampleQty}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs capitalize">{o.referenceType}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{o.locationName ?? '—'}</td>
                    <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[o.status] ?? 'secondary'} className="text-xs capitalize">{o.status}</Badge></td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{o.inspectedBy ?? '—'}</td>
                    <td className="px-4 py-3"><Link href={`/quality/orders/${o.id}`}><ChevronRight className="w-4 h-4 text-zinc-600 hover:text-zinc-300" /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
