'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowLeft, Building2, Star, Trash2, Plus, X,
  Save, Truck, FileText, Receipt, FolderOpen,
} from 'lucide-react'

type Contact = { id: string; firstName: string; lastName: string; email: string | null; phone: string | null; role: string }
type POLine  = { id: string; productName: string; sku: string | null; qty: number; unitCost: number; lineTotal: number; receivedQty: number; status: string }
type PO      = { id: string; poNumber: string; orderDate: string; expectedDate: string | null; totalAmount: number; status: string; ackBy: string | null; ackAt: string | null; lines: POLine[] }
type InvLine = { id: string; description: string; qty: number; unitPrice: number; lineTotal: number }
type Invoice = { id: string; invoiceNumber: string; invoiceDate: string; dueDate: string | null; total: number; paidAmount: number; status: string; po: { poNumber: string } | null }
type Perf    = { id: string; period: string; onTimeDeliveryPct: number; qualityScore: number; fillRate: number; avgLeadTimeDays: number; totalOrders: number; totalSpend: number; defectRate: number }
type Doc     = { id: string; name: string; docType: string; url: string | null; expiresAt: string | null; status: string }
type Vendor  = {
  id: string; name: string; vendorNumber: string; taxId: string | null; email: string | null
  phone: string | null; website: string | null; address: string | null; city: string | null
  state: string | null; zip: string | null; country: string; paymentTerms: string
  currency: string; status: string; category: string | null; rating: number
  contacts: Contact[]
}

const TABS = ['Profile', 'Purchase Orders', 'Invoices', 'Performance']

function StarRating({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-4 h-4 ${i <= n ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
      ))}
    </span>
  )
}

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    active:'text-emerald-400', 'on-hold':'text-amber-400', inactive:'text-zinc-400',
    blocked:'text-red-400', draft:'text-zinc-400', sent:'text-blue-400',
    acknowledged:'text-cyan-400', partial:'text-amber-400', received:'text-emerald-400',
    closed:'text-zinc-500', cancelled:'text-red-500', approved:'text-emerald-400',
    disputed:'text-red-400', paid:'text-emerald-400', 'partial-paid':'text-amber-400',
    'under-review':'text-blue-400',
  }
  return <span className={`text-xs font-medium capitalize ${map[s] ?? 'text-zinc-400'}`}>{s.replace(/-/g,' ')}</span>
}

export default function VpVendorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab]         = useState(0)
  const [vendor, setVendor]   = useState<Vendor | null>(null)
  const [pos, setPos]         = useState<PO[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [perfs, setPerfs]     = useState<Perf[]>([])
  const [docs, setDocs]       = useState<Doc[]>([])
  const [editForm, setEditForm] = useState<Partial<Vendor>>({})
  const [saving, setSaving]   = useState(false)

  // Contact form
  const [showContact, setShowContact] = useState(false)
  const [contactForm, setContactForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'primary' })

  // PO form
  const [showPO, setShowPO]   = useState(false)
  const [poForm, setPoForm]   = useState({ expectedDate: '', notes: '', currency: 'USD', lines: [{ productName: '', sku: '', qty: 1, unitCost: 0 }] })

  // Perf form
  const [showPerf, setShowPerf] = useState(false)
  const [perfForm, setPerfForm] = useState({ period: '', onTimeDeliveryPct: 0, qualityScore: 0, fillRate: 0, avgLeadTimeDays: 0, totalOrders: 0, totalSpend: 0, defectRate: 0 })

  // Doc form
  const [showDoc, setShowDoc] = useState(false)
  const [docForm, setDocForm] = useState({ name: '', docType: 'contract', url: '', expiresAt: '' })

  const load = useCallback(async () => {
    const [vRes, posRes, invRes, perfRes, docRes] = await Promise.all([
      fetch(`/api/vp-vendors/${id}`),
      fetch(`/api/vp-vendors/${id}/pos`),
      fetch(`/api/vp-vendors/${id}/invoices`),
      fetch(`/api/vp-vendors/${id}/performance`),
      fetch(`/api/vp-vendors/${id}/documents`),
    ])
    const v = await vRes.json()
    setVendor(v)
    setEditForm(v)
    setPos(await posRes.json())
    setInvoices(await invRes.json())
    setPerfs(await perfRes.json())
    setDocs(await docRes.json())
  }, [id])

  useEffect(() => { load() }, [load])

  async function saveVendor() {
    setSaving(true)
    await fetch(`/api/vp-vendors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setSaving(false)
    load()
  }

  async function addContact(e: React.FormEvent) {
    e.preventDefault()
    await fetch(`/api/vp-vendors/${id}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactForm),
    })
    setShowContact(false)
    setContactForm({ firstName: '', lastName: '', email: '', phone: '', role: 'primary' })
    load()
  }

  async function deleteContact(cid: string) {
    if (!confirm('Delete contact?')) return
    await fetch(`/api/vp-vendors/${id}/contacts/${cid}`, { method: 'DELETE' })
    load()
  }

  async function createPO(e: React.FormEvent) {
    e.preventDefault()
    const lines = poForm.lines.filter(l => l.productName.trim())
    await fetch(`/api/vp-vendors/${id}/pos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...poForm, lines }),
    })
    setShowPO(false)
    setPoForm({ expectedDate: '', notes: '', currency: 'USD', lines: [{ productName: '', sku: '', qty: 1, unitCost: 0 }] })
    load()
  }

  async function sendPO(poId: string) {
    await fetch(`/api/vp-pos/${poId}/send`, { method: 'POST' })
    load()
  }

  async function ackPO(poId: string) {
    const ackBy = prompt('Acknowledged by:')
    await fetch(`/api/vp-pos/${poId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ackBy }),
    })
    load()
  }

  async function addPerf(e: React.FormEvent) {
    e.preventDefault()
    await fetch(`/api/vp-vendors/${id}/performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(perfForm),
    })
    setShowPerf(false)
    setPerfForm({ period: '', onTimeDeliveryPct: 0, qualityScore: 0, fillRate: 0, avgLeadTimeDays: 0, totalOrders: 0, totalSpend: 0, defectRate: 0 })
    load()
  }

  async function addDoc(e: React.FormEvent) {
    e.preventDefault()
    await fetch(`/api/vp-vendors/${id}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docForm),
    })
    setShowDoc(false)
    setDocForm({ name: '', docType: 'contract', url: '', expiresAt: '' })
    load()
  }

  async function deleteDoc(did: string) {
    if (!confirm('Delete document?')) return
    await fetch(`/api/vp-vendors/${id}/documents/${did}`, { method: 'DELETE' })
    load()
  }

  if (!vendor) return <div className="p-6 text-zinc-500 text-sm">Loading...</div>

  return (
    <>
      <TopBar title={vendor.name} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* Back */}
        <Link href="/vp-vendors" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300">
          <ArrowLeft className="w-3.5 h-3.5" />Back to Vendor Directory
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-zinc-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-zinc-500">{vendor.vendorNumber}</span>
                  <StatusBadge s={vendor.status} />
                  {vendor.category && <span className="text-xs text-zinc-500 capitalize">{vendor.category}</span>}
                </div>
                <h1 className="text-2xl font-bold text-zinc-100">{vendor.name}</h1>
                <StarRating n={vendor.rating} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-zinc-800">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === i ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {i === 0 && <Building2 className="w-3.5 h-3.5" />}
              {i === 1 && <Truck className="w-3.5 h-3.5" />}
              {i === 2 && <Receipt className="w-3.5 h-3.5" />}
              {i === 3 && <FileText className="w-3.5 h-3.5" />}
              {t}
            </button>
          ))}
        </div>

        {/* Tab 0: Profile */}
        {tab === 0 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 pb-6">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">Vendor Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {([
                    ['name','Company Name','text'],['taxId','Tax ID','text'],
                    ['email','Email','email'],['phone','Phone','text'],
                    ['website','Website','text'],['address','Address','text'],
                    ['city','City','text'],['state','State','text'],
                    ['zip','ZIP','text'],['country','Country','text'],
                  ] as [keyof Vendor, string, string][]).map(([field, label, type]) => (
                    <div key={field}>
                      <label className="block text-xs text-zinc-400 mb-1">{label}</label>
                      <input
                        type={type}
                        value={(editForm[field] as string) ?? ''}
                        onChange={e => setEditForm(f => ({...f, [field]: e.target.value}))}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Payment Terms</label>
                    <select value={editForm.paymentTerms ?? 'NET30'} onChange={e => setEditForm(f => ({...f, paymentTerms: e.target.value}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                      <option>NET30</option><option>NET60</option><option>NET15</option><option>COD</option><option>Immediate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Status</label>
                    <select value={editForm.status ?? 'active'} onChange={e => setEditForm(f => ({...f, status: e.target.value}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                      <option value="active">Active</option><option value="on-hold">On Hold</option>
                      <option value="inactive">Inactive</option><option value="blocked">Blocked</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Category</label>
                    <select value={editForm.category ?? ''} onChange={e => setEditForm(f => ({...f, category: e.target.value}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                      <option value="">—</option><option value="goods">Goods</option>
                      <option value="services">Services</option><option value="logistics">Logistics</option>
                      <option value="raw-materials">Raw Materials</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Rating (1-5)</label>
                    <input type="number" min={1} max={5} value={editForm.rating ?? 3}
                      onChange={e => setEditForm(f => ({...f, rating: parseInt(e.target.value)}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={saveVendor} disabled={saving}>
                    <Save className="w-4 h-4 mr-1" />{saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contacts */}
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Contacts</h3>
                  <Button size="sm" onClick={() => setShowContact(true)}>
                    <Plus className="w-4 h-4 mr-1" />Add Contact
                  </Button>
                </div>
                {vendor.contacts.length === 0 ? (
                  <p className="text-sm text-zinc-600">No contacts yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                        <th className="text-left pb-2 font-medium">Name</th>
                        <th className="text-left pb-2 font-medium">Role</th>
                        <th className="text-left pb-2 font-medium">Email</th>
                        <th className="text-left pb-2 font-medium">Phone</th>
                        <th className="pb-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {vendor.contacts.map(c => (
                        <tr key={c.id} className="hover:bg-zinc-900/30">
                          <td className="py-2 pr-4 text-zinc-100">{c.firstName} {c.lastName}</td>
                          <td className="py-2 pr-4 text-zinc-400 capitalize">{c.role}</td>
                          <td className="py-2 pr-4 text-zinc-400">{c.email ?? '—'}</td>
                          <td className="py-2 pr-4 text-zinc-400">{c.phone ?? '—'}</td>
                          <td className="py-2 text-right">
                            <button onClick={() => deleteContact(c.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />Documents
                  </h3>
                  <Button size="sm" onClick={() => setShowDoc(true)}>
                    <Plus className="w-4 h-4 mr-1" />Add Document
                  </Button>
                </div>
                {docs.length === 0 ? (
                  <p className="text-sm text-zinc-600">No documents uploaded.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                        <th className="text-left pb-2 font-medium">Name</th>
                        <th className="text-left pb-2 font-medium">Type</th>
                        <th className="text-left pb-2 font-medium">Expires</th>
                        <th className="text-left pb-2 font-medium">Status</th>
                        <th className="pb-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {docs.map(d => (
                        <tr key={d.id} className="hover:bg-zinc-900/30">
                          <td className="py-2 pr-4 text-zinc-100">
                            {d.url ? <a href={d.url} target="_blank" rel="noreferrer" className="hover:text-blue-400">{d.name}</a> : d.name}
                          </td>
                          <td className="py-2 pr-4 text-zinc-400 capitalize">{d.docType}</td>
                          <td className="py-2 pr-4 text-zinc-400">
                            {d.expiresAt ? new Date(d.expiresAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-2 pr-4"><StatusBadge s={d.status} /></td>
                          <td className="py-2 text-right">
                            <button onClick={() => deleteDoc(d.id)} className="text-zinc-600 hover:text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 1: Purchase Orders */}
        {tab === 1 && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowPO(true)}>
                <Plus className="w-4 h-4 mr-1" />New PO
              </Button>
            </div>
            {pos.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-zinc-600"><Truck className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No purchase orders.</p></CardContent></Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left pb-3 font-medium">PO #</th>
                      <th className="text-left pb-3 font-medium">Date</th>
                      <th className="text-left pb-3 font-medium">Expected</th>
                      <th className="text-right pb-3 font-medium">Total</th>
                      <th className="text-center pb-3 font-medium">Status</th>
                      <th className="text-center pb-3 font-medium">Lines</th>
                      <th className="text-right pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {pos.map(po => (
                      <tr key={po.id} className="hover:bg-zinc-900/30">
                        <td className="py-3 pr-4 font-mono text-xs text-zinc-300">
                          <Link href={`/vp-pos/${po.id}`} className="hover:text-blue-400">{po.poNumber}</Link>
                        </td>
                        <td className="py-3 pr-4 text-zinc-400 text-xs">{new Date(po.orderDate).toLocaleDateString()}</td>
                        <td className="py-3 pr-4 text-zinc-400 text-xs">{po.expectedDate ? new Date(po.expectedDate).toLocaleDateString() : '—'}</td>
                        <td className="py-3 pr-4 text-right font-semibold text-zinc-100">{formatCurrency(po.totalAmount)}</td>
                        <td className="py-3 pr-4 text-center"><StatusBadge s={po.status} /></td>
                        <td className="py-3 pr-4 text-center text-zinc-400">{po.lines.length}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {po.status === 'draft' && (
                              <button onClick={() => sendPO(po.id)} className="text-xs text-blue-400 hover:text-blue-300">Send</button>
                            )}
                            {po.status === 'sent' && (
                              <button onClick={() => ackPO(po.id)} className="text-xs text-cyan-400 hover:text-cyan-300">Acknowledge</button>
                            )}
                            {po.status === 'acknowledged' && (
                              <Link href={`/vp-pos/${po.id}`} className="text-xs text-amber-400 hover:text-amber-300">Receive</Link>
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
          </div>
        )}

        {/* Tab 2: Invoices */}
        {tab === 2 && (
          <div className="space-y-4">
            {invoices.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-zinc-600"><Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No invoices.</p></CardContent></Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left pb-3 font-medium">Invoice #</th>
                      <th className="text-left pb-3 font-medium">Date</th>
                      <th className="text-left pb-3 font-medium">Due</th>
                      <th className="text-left pb-3 font-medium">PO #</th>
                      <th className="text-right pb-3 font-medium">Total</th>
                      <th className="text-right pb-3 font-medium">Paid</th>
                      <th className="text-right pb-3 font-medium">Balance</th>
                      <th className="text-center pb-3 font-medium">Status</th>
                      <th className="text-right pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {invoices.map(inv => {
                      const balance = inv.total - inv.paidAmount
                      const due = inv.dueDate ? new Date(inv.dueDate) : null
                      const overdue = due && due < new Date() && !['paid'].includes(inv.status)
                      return (
                        <tr key={inv.id} className="hover:bg-zinc-900/30">
                          <td className="py-3 pr-4 font-mono text-xs text-zinc-300">
                            <Link href={`/vp-invoices/${inv.id}`} className="hover:text-blue-400">{inv.invoiceNumber}</Link>
                          </td>
                          <td className="py-3 pr-4 text-zinc-400 text-xs">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                          <td className={`py-3 pr-4 text-xs ${overdue ? 'text-red-400 font-medium' : 'text-zinc-400'}`}>
                            {due ? due.toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3 pr-4 text-zinc-500 text-xs">{inv.po?.poNumber ?? '—'}</td>
                          <td className="py-3 pr-4 text-right font-semibold text-zinc-100">{formatCurrency(inv.total)}</td>
                          <td className="py-3 pr-4 text-right text-emerald-400">{formatCurrency(inv.paidAmount)}</td>
                          <td className={`py-3 pr-4 text-right font-semibold ${balance > 0 ? (overdue ? 'text-red-400' : 'text-amber-400') : 'text-zinc-500'}`}>
                            {formatCurrency(balance)}
                          </td>
                          <td className="py-3 pr-4 text-center"><StatusBadge s={inv.status} /></td>
                          <td className="py-3 text-right">
                            <Link href={`/vp-invoices/${inv.id}`}>
                              <Button size="sm" variant="outline">View</Button>
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Performance */}
        {tab === 3 && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowPerf(true)}>
                <Plus className="w-4 h-4 mr-1" />Add Period
              </Button>
            </div>

            {/* SVG Line Chart — On-Time Delivery by Period */}
            {perfs.length > 1 && (
              <Card>
                <CardContent className="pt-6 pb-6">
                  <h3 className="text-sm font-semibold text-zinc-400 mb-4">On-Time Delivery % by Period</h3>
                  <svg viewBox="0 0 600 160" className="w-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    {[0,25,50,75,100].map(v => (
                      <g key={v}>
                        <line x1="40" y1={130 - v * 1.2} x2="580" y2={130 - v * 1.2} stroke="#27272a" strokeWidth="1" />
                        <text x="32" y={134 - v * 1.2} fill="#52525b" fontSize="10" textAnchor="end">{v}%</text>
                      </g>
                    ))}
                    {/* Area + Line */}
                    {(() => {
                      const sorted = [...perfs].sort((a,b) => a.period.localeCompare(b.period))
                      const n = sorted.length
                      const pts = sorted.map((p, i) => ({
                        x: 40 + (i / (n - 1)) * 540,
                        y: 130 - p.onTimeDeliveryPct * 1.2,
                      }))
                      const areaPath = `M${pts[0].x},130 ` + pts.map(p => `L${p.x},${p.y}`).join(' ') + ` L${pts[pts.length-1].x},130 Z`
                      const linePath = `M${pts[0].x},${pts[0].y} ` + pts.slice(1).map(p => `L${p.x},${p.y}`).join(' ')
                      return (
                        <>
                          <path d={areaPath} fill="url(#lineGrad)" />
                          <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2" />
                          {pts.map((p, i) => (
                            <g key={i}>
                              <circle cx={p.x} cy={p.y} r="4" fill="#3b82f6" />
                              <text x={p.x} y={150} fill="#71717a" fontSize="9" textAnchor="middle">{sorted[i].period}</text>
                            </g>
                          ))}
                        </>
                      )
                    })()}
                  </svg>
                </CardContent>
              </Card>
            )}

            {perfs.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-zinc-600"><p className="text-sm">No performance data.</p></CardContent></Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left pb-3 font-medium">Period</th>
                      <th className="text-right pb-3 font-medium">On-Time %</th>
                      <th className="text-right pb-3 font-medium">Quality</th>
                      <th className="text-right pb-3 font-medium">Fill Rate</th>
                      <th className="text-right pb-3 font-medium">Avg Lead</th>
                      <th className="text-right pb-3 font-medium">Orders</th>
                      <th className="text-right pb-3 font-medium">Spend</th>
                      <th className="text-right pb-3 font-medium">Defect %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {perfs.map(p => (
                      <tr key={p.id} className="hover:bg-zinc-900/30">
                        <td className="py-3 pr-4 font-mono text-xs text-zinc-300">{p.period}</td>
                        <td className="py-3 pr-4 text-right">
                          <span className={p.onTimeDeliveryPct >= 90 ? 'text-emerald-400' : p.onTimeDeliveryPct >= 70 ? 'text-amber-400' : 'text-red-400'}>
                            {p.onTimeDeliveryPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right text-zinc-300">{p.qualityScore.toFixed(1)}</td>
                        <td className="py-3 pr-4 text-right text-zinc-300">{p.fillRate.toFixed(1)}%</td>
                        <td className="py-3 pr-4 text-right text-zinc-300">{p.avgLeadTimeDays}d</td>
                        <td className="py-3 pr-4 text-right text-zinc-300">{p.totalOrders}</td>
                        <td className="py-3 pr-4 text-right text-zinc-300">{formatCurrency(p.totalSpend)}</td>
                        <td className="py-3 text-right">
                          <span className={p.defectRate < 2 ? 'text-emerald-400' : p.defectRate < 5 ? 'text-amber-400' : 'text-red-400'}>
                            {p.defectRate.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Add Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-base font-semibold text-zinc-100">Add Contact</h2>
              <button onClick={() => setShowContact(false)}><X className="w-5 h-5 text-zinc-500" /></button>
            </div>
            <form onSubmit={addContact} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">First Name *</label>
                  <input required value={contactForm.firstName} onChange={e => setContactForm(f => ({...f, firstName: e.target.value}))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Last Name *</label>
                  <input required value={contactForm.lastName} onChange={e => setContactForm(f => ({...f, lastName: e.target.value}))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Email</label>
                <input type="email" value={contactForm.email} onChange={e => setContactForm(f => ({...f, email: e.target.value}))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Phone</label>
                <input value={contactForm.phone} onChange={e => setContactForm(f => ({...f, phone: e.target.value}))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Role</label>
                <select value={contactForm.role} onChange={e => setContactForm(f => ({...f, role: e.target.value}))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  <option value="primary">Primary</option><option value="billing">Billing</option>
                  <option value="shipping">Shipping</option><option value="technical">Technical</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="submit" className="flex-1">Add Contact</Button>
                <Button type="button" variant="outline" onClick={() => setShowContact(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New PO Modal */}
      {showPO && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-base font-semibold text-zinc-100">New Purchase Order</h2>
              <button onClick={() => setShowPO(false)}><X className="w-5 h-5 text-zinc-500" /></button>
            </div>
            <form onSubmit={createPO} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Expected Date</label>
                  <input type="date" value={poForm.expectedDate} onChange={e => setPoForm(f => ({...f, expectedDate: e.target.value}))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Currency</label>
                  <select value={poForm.currency} onChange={e => setPoForm(f => ({...f, currency: e.target.value}))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                    <option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-zinc-400 mb-1">Notes</label>
                  <textarea value={poForm.notes} onChange={e => setPoForm(f => ({...f, notes: e.target.value}))} rows={2}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-zinc-400 uppercase tracking-wide">Line Items</label>
                  <button type="button" onClick={() => setPoForm(f => ({...f, lines: [...f.lines, { productName: '', sku: '', qty: 1, unitCost: 0 }]}))}
                    className="text-xs text-blue-400 hover:text-blue-300">+ Add Line</button>
                </div>
                {poForm.lines.map((line, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 mb-2">
                    <input placeholder="Product Name" value={line.productName}
                      onChange={e => setPoForm(f => { const ls = [...f.lines]; ls[i] = {...ls[i], productName: e.target.value}; return {...f, lines: ls} })}
                      className="col-span-5 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                    <input placeholder="SKU" value={line.sku}
                      onChange={e => setPoForm(f => { const ls = [...f.lines]; ls[i] = {...ls[i], sku: e.target.value}; return {...f, lines: ls} })}
                      className="col-span-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                    <input type="number" placeholder="Qty" value={line.qty}
                      onChange={e => setPoForm(f => { const ls = [...f.lines]; ls[i] = {...ls[i], qty: parseFloat(e.target.value)}; return {...f, lines: ls} })}
                      className="col-span-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                    <input type="number" placeholder="Unit Cost" value={line.unitCost}
                      onChange={e => setPoForm(f => { const ls = [...f.lines]; ls[i] = {...ls[i], unitCost: parseFloat(e.target.value)}; return {...f, lines: ls} })}
                      className="col-span-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                    <button type="button" onClick={() => setPoForm(f => ({...f, lines: f.lines.filter((_,j) => j !== i)}))}
                      className="col-span-1 text-zinc-600 hover:text-red-400 flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="text-right text-sm text-zinc-300 mt-2">
                  Total: <span className="font-bold text-zinc-100">{formatCurrency(poForm.lines.reduce((s,l) => s + l.qty * l.unitCost, 0))}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1">Create PO</Button>
                <Button type="button" variant="outline" onClick={() => setShowPO(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Performance Modal */}
      {showPerf && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-base font-semibold text-zinc-100">Add Performance Period</h2>
              <button onClick={() => setShowPerf(false)}><X className="w-5 h-5 text-zinc-500" /></button>
            </div>
            <form onSubmit={addPerf} className="p-5 space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Period * (e.g. 2026-Q1, 2026-04)</label>
                <input required value={perfForm.period} onChange={e => setPerfForm(f => ({...f, period: e.target.value}))}
                  placeholder="2026-Q1"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ['onTimeDeliveryPct','On-Time Delivery %'],['qualityScore','Quality Score (0-100)'],
                  ['fillRate','Fill Rate %'],['avgLeadTimeDays','Avg Lead Time (days)'],
                  ['totalOrders','Total Orders'],['totalSpend','Total Spend ($)'],
                  ['defectRate','Defect Rate %'],
                ] as [keyof typeof perfForm, string][]).map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-xs text-zinc-400 mb-1">{label}</label>
                    <input type="number" step="0.01" value={perfForm[field]}
                      onChange={e => setPerfForm(f => ({...f, [field]: parseFloat(e.target.value) || 0}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="submit" className="flex-1">Add Period</Button>
                <Button type="button" variant="outline" onClick={() => setShowPerf(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-base font-semibold text-zinc-100">Add Document</h2>
              <button onClick={() => setShowDoc(false)}><X className="w-5 h-5 text-zinc-500" /></button>
            </div>
            <form onSubmit={addDoc} className="p-5 space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Document Name *</label>
                <input required value={docForm.name} onChange={e => setDocForm(f => ({...f, name: e.target.value}))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Type</label>
                <select value={docForm.docType} onChange={e => setDocForm(f => ({...f, docType: e.target.value}))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  <option value="contract">Contract</option><option value="insurance">Insurance</option>
                  <option value="certification">Certification</option><option value="w9">W-9</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">URL</label>
                <input value={docForm.url} onChange={e => setDocForm(f => ({...f, url: e.target.value}))}
                  placeholder="https://..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Expires</label>
                <input type="date" value={docForm.expiresAt} onChange={e => setDocForm(f => ({...f, expiresAt: e.target.value}))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="submit" className="flex-1">Add Document</Button>
                <Button type="button" variant="outline" onClick={() => setShowDoc(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
