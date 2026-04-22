'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import {
  Building2,
  ArrowLeft,
  Save,
  Plus,
  X,
  CreditCard,
  FileText,
  ShoppingCart,
  CheckCircle,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface B2BAccount {
  id: string
  accountCode: string
  companyName: string
  contactName: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string
  creditLimit: number
  creditUsed: number
  paymentTerms: string | null
  priceGroup: string | null
  isApproved: boolean
  isActive: boolean
  notes: string | null
  orders: B2BOrder[]
  portalQuotes: B2BPortalQuote[]
}

interface B2BOrder {
  id: string
  orderNumber: string
  status: string
  orderDate: string
  totalAmt: number
  _count: { lines: number }
}

interface B2BPortalQuote {
  id: string
  quoteNumber: string
  status: string
  validUntil: string | null
  totalAmt: number
  _count: { lines: number }
}

type TabKey = 'profile' | 'orders' | 'quotes'

const PAYMENT_TERMS = ['NET30', 'NET60', 'NET15', 'COD', 'PREPAID', 'EOM']
const PRICE_GROUPS = ['RETAIL', 'WHOLESALE', 'VIP', 'DISTRIBUTOR']

const ORDER_STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-900/40 text-amber-400 border-amber-800/40',
  approved: 'bg-emerald-900/40 text-emerald-400 border-emerald-800/40',
  processing: 'bg-blue-900/40 text-blue-400 border-blue-800/40',
  shipped: 'bg-purple-900/40 text-purple-400 border-purple-800/40',
  delivered: 'bg-emerald-900/60 text-emerald-300 border-emerald-800/60',
  cancelled: 'bg-zinc-800 text-zinc-500 border-zinc-700',
}

const QUOTE_STATUS_BADGE: Record<string, string> = {
  draft: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  sent: 'bg-blue-900/40 text-blue-400 border-blue-800/40',
  accepted: 'bg-emerald-900/40 text-emerald-400 border-emerald-800/40',
  rejected: 'bg-red-900/40 text-red-400 border-red-800/40',
  expired: 'bg-zinc-800 text-zinc-500 border-zinc-700',
}

interface OrderLine {
  productName: string
  sku: string
  qty: number
  unitPrice: number
  discountPct: number
}

interface QuoteLine {
  productName: string
  sku: string
  qty: number
  unitPrice: number
  discountPct: number
}

function NewOrderModal({ accountId, onClose, onCreated }: { accountId: string; onClose: () => void; onCreated: () => void }) {
  const [lines, setLines] = useState<OrderLine[]>([{ productName: '', sku: '', qty: 1, unitPrice: 0, discountPct: 0 }])
  const [notes, setNotes] = useState('')
  const [requestedDate, setRequestedDate] = useState('')
  const [poReference, setPoReference] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const addLine = () => setLines((l) => [...l, { productName: '', sku: '', qty: 1, unitPrice: 0, discountPct: 0 }])
  const removeLine = (i: number) => setLines((l) => l.filter((_, idx) => idx !== i))

  const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice * (1 - l.discountPct / 100), 0)
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/b2b/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, lines, notes, requestedDate: requestedDate || null, poReference: poReference || null }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      onCreated(); onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create order')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-100">New Order</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">PO Reference</label>
              <input value={poReference} onChange={(e) => setPoReference(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">Requested Date</label>
              <input type="date" value={requestedDate} onChange={(e) => setRequestedDate(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs uppercase tracking-widest text-zinc-500">Line Items</label>
              <button type="button" onClick={addLine} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus className="w-3 h-3" />Add Line</button>
            </div>
            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input value={l.productName} onChange={(e) => setLines((ls) => ls.map((x, idx) => idx === i ? { ...x, productName: e.target.value } : x))} placeholder="Product" className="col-span-4 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
                  <input value={l.sku} onChange={(e) => setLines((ls) => ls.map((x, idx) => idx === i ? { ...x, sku: e.target.value } : x))} placeholder="SKU" className="col-span-2 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
                  <input type="number" min={1} value={l.qty} onChange={(e) => setLines((ls) => ls.map((x, idx) => idx === i ? { ...x, qty: parseInt(e.target.value) || 1 } : x))} placeholder="Qty" className="col-span-2 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
                  <input type="number" min={0} step={0.01} value={l.unitPrice} onChange={(e) => setLines((ls) => ls.map((x, idx) => idx === i ? { ...x, unitPrice: parseFloat(e.target.value) || 0 } : x))} placeholder="Price" className="col-span-2 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
                  <input type="number" min={0} max={100} value={l.discountPct} onChange={(e) => setLines((ls) => ls.map((x, idx) => idx === i ? { ...x, discountPct: parseFloat(e.target.value) || 0 } : x))} placeholder="Disc%" className="col-span-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
                  <button type="button" onClick={() => removeLine(i)} disabled={lines.length === 1} className="col-span-1 text-zinc-600 hover:text-red-400 disabled:opacity-30 flex justify-center"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Subtotal: <span className="text-zinc-100 font-semibold">{fmt(subtotal)}</span></span>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg font-medium">{saving ? 'Creating...' : 'Create Order'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function NewQuoteModal({ accountId, onClose, onCreated }: { accountId: string; onClose: () => void; onCreated: () => void }) {
  const [lines, setLines] = useState<QuoteLine[]>([{ productName: '', sku: '', qty: 1, unitPrice: 0, discountPct: 0 }])
  const [notes, setNotes] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const addLine = () => setLines((l) => [...l, { productName: '', sku: '', qty: 1, unitPrice: 0, discountPct: 0 }])
  const removeLine = (i: number) => setLines((l) => l.filter((_, idx) => idx !== i))

  const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0)
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/b2b/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, lines, notes, validUntil: validUntil || null }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      onCreated(); onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create quote')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-100">New Quote</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">{error}</p>}
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">Valid Until</label>
            <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs uppercase tracking-widest text-zinc-500">Line Items</label>
              <button type="button" onClick={addLine} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus className="w-3 h-3" />Add Line</button>
            </div>
            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input value={l.productName} onChange={(e) => setLines((ls) => ls.map((x, idx) => idx === i ? { ...x, productName: e.target.value } : x))} placeholder="Product" className="col-span-4 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
                  <input value={l.sku} onChange={(e) => setLines((ls) => ls.map((x, idx) => idx === i ? { ...x, sku: e.target.value } : x))} placeholder="SKU" className="col-span-2 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
                  <input type="number" min={1} value={l.qty} onChange={(e) => setLines((ls) => ls.map((x, idx) => idx === i ? { ...x, qty: parseInt(e.target.value) || 1 } : x))} placeholder="Qty" className="col-span-2 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
                  <input type="number" min={0} step={0.01} value={l.unitPrice} onChange={(e) => setLines((ls) => ls.map((x, idx) => idx === i ? { ...x, unitPrice: parseFloat(e.target.value) || 0 } : x))} placeholder="Price" className="col-span-2 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
                  <input type="number" min={0} max={100} value={l.discountPct} onChange={(e) => setLines((ls) => ls.map((x, idx) => idx === i ? { ...x, discountPct: parseFloat(e.target.value) || 0 } : x))} placeholder="Disc%" className="col-span-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
                  <button type="button" onClick={() => removeLine(i)} disabled={lines.length === 1} className="col-span-1 text-zinc-600 hover:text-red-400 disabled:opacity-30 flex justify-center"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Subtotal: <span className="text-zinc-100 font-semibold">{fmt(subtotal)}</span></span>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg font-medium">{saving ? 'Creating...' : 'Create Quote'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function B2BAccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [account, setAccount] = useState<B2BAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('profile')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showQuoteModal, setShowQuoteModal] = useState(false)

  const [form, setForm] = useState({
    companyName: '', contactName: '', email: '', phone: '',
    address: '', city: '', state: '', country: 'US',
    creditLimit: '', paymentTerms: '', priceGroup: '', notes: '', isActive: true,
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/b2b/accounts/${id}`)
      const data = await res.json()
      setAccount(data)
      setForm({
        companyName: data.companyName || '',
        contactName: data.contactName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || 'US',
        creditLimit: String(data.creditLimit || ''),
        paymentTerms: data.paymentTerms || '',
        priceGroup: data.priceGroup || '',
        notes: data.notes || '',
        isActive: data.isActive,
      })
    } finally { setLoading(false) }
  }, [id])

  useEffect(() => { load() }, [load])

  async function saveProfile() {
    setSaving(true)
    setSaveMsg('')
    try {
      await fetch(`/api/b2b/accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, creditLimit: parseFloat(form.creditLimit) || 0 }),
      })
      setSaveMsg('Saved')
      load()
    } finally { setSaving(false); setTimeout(() => setSaveMsg(''), 3000) }
  }

  async function approveAccount() {
    await fetch(`/api/b2b/accounts/${id}/approve`, { method: 'POST' })
    load()
  }

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-zinc-900 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 p-6 flex items-center justify-center">
        <p className="text-zinc-500">Account not found</p>
      </div>
    )
  }

  const creditPct = account.creditLimit ? Math.min((account.creditUsed / account.creditLimit) * 100, 100) : 0
  const creditColor = creditPct >= 80 ? 'bg-red-500' : creditPct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/b2b/accounts" className="text-zinc-500 hover:text-zinc-200">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              {account.companyName}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">{account.accountCode}</p>
          </div>
          <div className="flex items-center gap-3">
            {!account.isApproved && account.isActive && (
              <button onClick={approveAccount} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm rounded-lg font-medium">
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
            )}
            {account.isApproved ? (
              <span className="px-2 py-1 rounded text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-800/40">Approved</span>
            ) : (
              <span className="px-2 py-1 rounded text-xs bg-amber-900/40 text-amber-400 border border-amber-800/40">Pending Approval</span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
          {(['profile', 'orders', 'quotes'] as TabKey[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn('px-4 py-1.5 text-sm rounded-md capitalize transition-colors', tab === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300')}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Account Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Company Name', 'companyName'],
                  ['Contact Name', 'contactName'],
                  ['Email', 'email'],
                  ['Phone', 'phone'],
                  ['Address', 'address'],
                  ['City', 'city'],
                  ['State', 'state'],
                  ['Country', 'country'],
                ].map(([label, key]) => (
                  <div key={key}>
                    <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">{label}</label>
                    <input
                      value={form[key as keyof typeof form] as string}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">Payment Terms</label>
                  <select value={form.paymentTerms} onChange={(e) => setForm((f) => ({ ...f, paymentTerms: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500">
                    <option value="">Select...</option>
                    {PAYMENT_TERMS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">Price Group</label>
                  <select value={form.priceGroup} onChange={(e) => setForm((f) => ({ ...f, priceGroup: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500">
                    <option value="">Select...</option>
                    {PRICE_GROUPS.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 resize-none" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={saveProfile} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg font-medium">
                  <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Changes'}
                </button>
                {saveMsg && <span className="text-sm text-emerald-400">{saveMsg}</span>}
              </div>
            </div>

            {/* Credit Panel */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Credit Panel
              </h2>
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">Credit Limit</label>
                <input type="number" value={form.creditLimit} onChange={(e) => setForm((f) => ({ ...f, creditLimit: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Used</span>
                  <span className="text-zinc-100">{fmt(account.creditUsed)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Available</span>
                  <span className="text-emerald-400">{fmt(Math.max(0, account.creditLimit - account.creditUsed))}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', creditColor)} style={{ width: `${creditPct}%` }} />
                </div>
                <p className="text-xs text-zinc-500 text-right">{creditPct.toFixed(1)}% utilized</p>
              </div>
              <div className="pt-2 border-t border-zinc-800 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Total Orders</span>
                  <span className="text-zinc-100">{account.orders.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Active Quotes</span>
                  <span className="text-zinc-100">{account.portalQuotes.filter((q) => q.status === 'draft' || q.status === 'sent').length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-blue-400" />Orders</h2>
              <button onClick={() => setShowOrderModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg font-medium"><Plus className="w-3.5 h-3.5" />New Order</button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Order #', 'Date', 'Lines', 'Total', 'Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-widest text-zinc-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {account.orders.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-zinc-500">No orders yet</td></tr>
                ) : (
                  account.orders.map((o) => (
                    <tr key={o.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-zinc-300">{o.orderNumber.slice(0, 12)}</td>
                      <td className="px-4 py-3 text-zinc-400">{fmtDate(o.orderDate)}</td>
                      <td className="px-4 py-3 text-zinc-400">{o._count.lines}</td>
                      <td className="px-4 py-3 text-zinc-100 font-medium">{fmt(o.totalAmt)}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-0.5 rounded text-xs border capitalize', ORDER_STATUS_BADGE[o.status] || 'bg-zinc-800 text-zinc-400 border-zinc-700')}>{o.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Quotes Tab */}
        {tab === 'quotes' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2"><FileText className="w-4 h-4 text-purple-400" />Quotes</h2>
              <button onClick={() => setShowQuoteModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg font-medium"><Plus className="w-3.5 h-3.5" />New Quote</button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Quote #', 'Valid Until', 'Lines', 'Total', 'Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-widest text-zinc-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {account.portalQuotes.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-zinc-500">No quotes yet</td></tr>
                ) : (
                  account.portalQuotes.map((q) => (
                    <tr key={q.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-zinc-300">{q.quoteNumber.slice(0, 12)}</td>
                      <td className="px-4 py-3 text-zinc-400">{q.validUntil ? fmtDate(q.validUntil) : '—'}</td>
                      <td className="px-4 py-3 text-zinc-400">{q._count.lines}</td>
                      <td className="px-4 py-3 text-zinc-100 font-medium">{fmt(q.totalAmt)}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-0.5 rounded text-xs border capitalize', QUOTE_STATUS_BADGE[q.status] || 'bg-zinc-800 text-zinc-400 border-zinc-700')}>{q.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showOrderModal && <NewOrderModal accountId={id} onClose={() => setShowOrderModal(false)} onCreated={load} />}
      {showQuoteModal && <NewQuoteModal accountId={id} onClose={() => setShowQuoteModal(false)} onCreated={load} />}
    </div>
  )
}
