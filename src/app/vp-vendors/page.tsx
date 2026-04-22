'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  Truck, Building2, Plus, Search, Star, Users,
  PauseCircle, XCircle, X,
} from 'lucide-react'

type Vendor = {
  id: string
  name: string
  vendorNumber: string
  category: string | null
  rating: number
  paymentTerms: string
  status: string
  email: string | null
  phone: string | null
  _count: { purchaseOrders: number; invoices: number }
}

const STATUS_TABS = ['all', 'active', 'on-hold', 'inactive', 'blocked']
const CATEGORIES  = ['', 'goods', 'services', 'logistics', 'raw-materials']

function StarRating({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= n ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
      ))}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'on-hold':'bg-amber-500/15 text-amber-400 border-amber-500/30',
    inactive: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30',
    blocked:  'bg-red-500/15 text-red-400 border-red-500/30',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium capitalize ${map[status] ?? 'text-zinc-400'}`}>
      {status}
    </span>
  )
}

export default function VpVendorsPage() {
  const [vendors, setVendors]     = useState<Vendor[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [statusTab, setStatusTab] = useState('all')
  const [category, setCategory]   = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [form, setForm] = useState({
    name: '', taxId: '', email: '', phone: '', website: '',
    address: '', city: '', state: '', zip: '',
    paymentTerms: 'NET30', currency: 'USD', category: '', rating: 3,
  })

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search)                 params.set('search', search)
    if (statusTab !== 'all')    params.set('status', statusTab)
    if (category)               params.set('category', category)
    const res = await fetch(`/api/vp-vendors?${params}`)
    setVendors(await res.json())
    setLoading(false)
  }, [search, statusTab, category])

  useEffect(() => { load() }, [load])

  const active  = vendors.filter(v => v.status === 'active').length
  const onHold  = vendors.filter(v => v.status === 'on-hold').length
  const avgRating = vendors.length
    ? (vendors.reduce((s, v) => s + v.rating, 0) / vendors.length).toFixed(1)
    : '—'

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/vp-vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ name: '', taxId: '', email: '', phone: '', website: '', address: '', city: '', state: '', zip: '', paymentTerms: 'NET30', currency: 'USD', category: '', rating: 3 })
    load()
  }

  return (
    <>
      <TopBar title="Vendor Directory" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 mb-2"><Truck className="w-4 h-4 text-blue-400" /><p className="text-xs text-zinc-500 uppercase tracking-wide">Total Vendors</p></div>
            <p className="text-2xl font-bold text-blue-400">{vendors.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-emerald-400" /><p className="text-xs text-zinc-500 uppercase tracking-wide">Active</p></div>
            <p className="text-2xl font-bold text-emerald-400">{active}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 mb-2"><PauseCircle className="w-4 h-4 text-amber-400" /><p className="text-xs text-zinc-500 uppercase tracking-wide">On Hold</p></div>
            <p className="text-2xl font-bold text-amber-400">{onHold}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 mb-2"><Star className="w-4 h-4 text-amber-400" /><p className="text-xs text-zinc-500 uppercase tracking-wide">Avg Rating</p></div>
            <p className="text-2xl font-bold text-amber-400">{avgRating}</p>
          </CardContent></Card>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500">
            <option value="">All Categories</option>
            {CATEGORIES.filter(Boolean).map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
          <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-1" />New Vendor</Button>
        </div>
        <div className="flex gap-1 border-b border-zinc-800">
          {STATUS_TABS.map(t => (
            <button key={t} onClick={() => setStatusTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${statusTab === t ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
              {t}
            </button>
          ))}
        </div>
        {loading ? <p className="text-zinc-500 text-sm">Loading...</p> : vendors.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center py-16 text-zinc-600"><Building2 className="w-12 h-12 mb-4 opacity-30" /><p className="text-sm">No vendors found.</p></CardContent></Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Vendor #</th><th className="text-left pb-3 font-medium">Name</th>
                  <th className="text-left pb-3 font-medium">Category</th><th className="text-left pb-3 font-medium">Rating</th>
                  <th className="text-left pb-3 font-medium">Terms</th><th className="text-center pb-3 font-medium">Status</th>
                  <th className="text-right pb-3 font-medium">Open POs</th><th className="text-right pb-3 font-medium">Invoices</th>
                  <th className="text-right pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {vendors.map(v => (
                  <tr key={v.id} className="hover:bg-zinc-900/40">
                    <td className="py-3 pr-4 font-mono text-xs text-zinc-500">{v.vendorNumber}</td>
                    <td className="py-3 pr-4"><span className="font-medium text-zinc-100">{v.name}</span>{v.email && <div className="text-xs text-zinc-500">{v.email}</div>}</td>
                    <td className="py-3 pr-4 text-zinc-400 capitalize">{v.category ?? '—'}</td>
                    <td className="py-3 pr-4"><StarRating n={v.rating} /></td>
                    <td className="py-3 pr-4 text-zinc-400">{v.paymentTerms}</td>
                    <td className="py-3 pr-4 text-center"><StatusBadge status={v.status} /></td>
                    <td className="py-3 pr-4 text-right text-zinc-300">{v._count.purchaseOrders}</td>
                    <td className="py-3 pr-4 text-right text-zinc-300">{v._count.invoices}</td>
                    <td className="py-3 text-right"><Link href={`/vp-vendors/${v.id}`}><Button size="sm" variant="outline">View</Button></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-100">New Vendor</h2>
                <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-zinc-500" /></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="block text-xs text-zinc-400 mb-1">Company Name *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" /></div>
                  <div><label className="block text-xs text-zinc-400 mb-1">Tax ID</label>
                    <input value={form.taxId} onChange={e => setForm(f => ({...f, taxId: e.target.value}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" /></div>
                  <div><label className="block text-xs text-zinc-400 mb-1">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                      <option value="">Select...</option><option value="goods">Goods</option><option value="services">Services</option>
                      <option value="logistics">Logistics</option><option value="raw-materials">Raw Materials</option>
                    </select></div>
                  <div><label className="block text-xs text-zinc-400 mb-1">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" /></div>
                  <div><label className="block text-xs text-zinc-400 mb-1">Phone</label>
                    <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" /></div>
                  <div className="col-span-2"><label className="block text-xs text-zinc-400 mb-1">Address</label>
                    <input value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" /></div>
                  <div><label className="block text-xs text-zinc-400 mb-1">City</label>
                    <input value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" /></div>
                  <div><label className="block text-xs text-zinc-400 mb-1">State</label>
                    <input value={form.state} onChange={e => setForm(f => ({...f, state: e.target.value}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" /></div>
                  <div><label className="block text-xs text-zinc-400 mb-1">ZIP</label>
                    <input value={form.zip} onChange={e => setForm(f => ({...f, zip: e.target.value}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" /></div>
                  <div><label className="block text-xs text-zinc-400 mb-1">Payment Terms</label>
                    <select value={form.paymentTerms} onChange={e => setForm(f => ({...f, paymentTerms: e.target.value}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                      <option>NET30</option><option>NET60</option><option>NET15</option><option>COD</option><option>Immediate</option>
                    </select></div>
                  <div><label className="block text-xs text-zinc-400 mb-1">Currency</label>
                    <select value={form.currency} onChange={e => setForm(f => ({...f, currency: e.target.value}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                      <option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option>
                    </select></div>
                  <div><label className="block text-xs text-zinc-400 mb-1">Rating (1-5)</label>
                    <input type="number" min={1} max={5} value={form.rating} onChange={e => setForm(f => ({...f, rating: parseInt(e.target.value)}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" /></div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Creating...' : 'Create Vendor'}</Button>
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
