'use client'

import { useState, useEffect, use } from 'react'
import { ArrowLeft, Trophy, XCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Product = { id: string; productName: string; quantity: number; pricePerUnit: number; discount: number; lineTotal: number }
type Quote = { id: string; quoteNumber: string; accountName: string | null; status: string; totalAmount: number; expirationDate: string | null }
type Opp = {
  id: string
  name: string
  accountName: string | null
  contactName: string | null
  amount: number
  probability: number
  salesStage: string
  estimatedCloseDate: string | null
  ownerName: string | null
  description: string | null
  isWon: boolean
  isLost: boolean
  forecastCategory: string
  products: Product[]
  quotes: Quote[]
}

const STAGES = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won']
const stageLabel: Record<string, string> = {
  prospecting: 'Prospecting', qualification: 'Qualification', proposal: 'Proposal',
  negotiation: 'Negotiation', closed_won: 'Closed Won',
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

const TABS = ['Summary', 'Products', 'Quotes', 'Competitors']

export default function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [opp, setOpp] = useState<Opp | null>(null)
  const [tab, setTab] = useState('Summary')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Opp>>({})
  const [showProductModal, setShowProductModal] = useState(false)
  const [productForm, setProductForm] = useState({ productName: '', quantity: '1', pricePerUnit: '', discount: '0' })
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quoteForm, setQuoteForm] = useState({ accountName: '', notes: '' })
  const [competitors, setCompetitors] = useState<{ id: string; name: string }[]>([])

  async function load() {
    const res = await fetch(`/api/sales/opportunities/${id}`)
    const data = await res.json()
    setOpp(data)
    setForm(data)
  }

  async function loadCompetitors() {
    const res = await fetch('/api/sales/competitors')
    setCompetitors(await res.json())
  }

  useEffect(() => { load(); loadCompetitors() }, [id])

  async function closeWon() {
    await fetch(`/api/sales/opportunities/${id}/close-won`, { method: 'POST' })
    load()
  }

  async function closeLost() {
    await fetch(`/api/sales/opportunities/${id}/close-lost`, { method: 'POST' })
    load()
  }

  async function save() {
    await fetch(`/api/sales/opportunities/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setEditing(false)
    load()
  }

  async function addProduct() {
    await fetch(`/api/sales/opportunities/${id}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...productForm, quantity: parseFloat(productForm.quantity), pricePerUnit: parseFloat(productForm.pricePerUnit), discount: parseFloat(productForm.discount) }),
    })
    setShowProductModal(false)
    setProductForm({ productName: '', quantity: '1', pricePerUnit: '', discount: '0' })
    load()
  }

  async function createQuote() {
    await fetch('/api/sales/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...quoteForm, opportunityId: id, totalAmount: opp?.amount || 0 }),
    })
    setShowQuoteModal(false)
    load()
  }

  if (!opp) return <div className="p-6 text-zinc-400">Loading...</div>

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/sales/opportunities" className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">{opp.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-300">{stageLabel[opp.salesStage] || opp.salesStage}</span>
              {opp.isWon && <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400">Won</span>}
              {opp.isLost && <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">Lost</span>}
              <span className="text-lg font-semibold text-emerald-400 font-mono">{fmt(opp.amount)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!opp.isWon && !opp.isLost && (
            <>
              <button onClick={closeWon} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
                <Trophy className="w-4 h-4" /> Close Won
              </button>
              <button onClick={closeLost} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors">
                <XCircle className="w-4 h-4" /> Close Lost
              </button>
            </>
          )}
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm rounded-md bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">Cancel</button>
              <button onClick={save} className="px-3 py-1.5 text-sm rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors">Save</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="px-3 py-1.5 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">Edit</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-4 py-2 text-sm transition-colors', tab === t ? 'text-white border-b-2 border-blue-500' : 'text-zinc-500 hover:text-zinc-300')}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'Summary' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Account', field: 'accountName' },
              { label: 'Contact', field: 'contactName' },
              { label: 'Owner', field: 'ownerName' },
              { label: 'Forecast Category', field: 'forecastCategory' },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="block text-xs text-zinc-500 mb-1">{label}</label>
                {editing ? (
                  <input value={(form as Record<string, string | null>)[field] || ''} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
                ) : (
                  <p className="text-sm text-zinc-200">{(opp as Record<string, unknown>)[field] as string || '—'}</p>
                )}
              </div>
            ))}
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Amount</label>
              {editing ? (
                <input type="number" value={form.amount || 0} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
              ) : (
                <p className="text-sm text-emerald-400 font-mono">{fmt(opp.amount)}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Probability %</label>
              {editing ? (
                <input type="number" value={form.probability || 0} onChange={(e) => setForm({ ...form, probability: parseInt(e.target.value) })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
              ) : (
                <p className="text-sm text-zinc-200">{opp.probability}%</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Close Date</label>
              {editing ? (
                <input type="date" value={(form.estimatedCloseDate || '').split('T')[0]} onChange={(e) => setForm({ ...form, estimatedCloseDate: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
              ) : (
                <p className="text-sm text-zinc-200">{opp.estimatedCloseDate ? new Date(opp.estimatedCloseDate).toLocaleDateString() : '—'}</p>
              )}
            </div>
            {editing && (
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Stage</label>
                <select value={form.salesStage || 'prospecting'} onChange={(e) => setForm({ ...form, salesStage: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500">
                  {STAGES.map((s) => <option key={s} value={s}>{stageLabel[s]}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="mt-4">
            <label className="block text-xs text-zinc-500 mb-1">Description</label>
            {editing ? (
              <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 resize-none" />
            ) : (
              <p className="text-sm text-zinc-200">{opp.description || '—'}</p>
            )}
          </div>
        </div>
      )}

      {tab === 'Products' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setShowProductModal(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Product</th>
                <th className="text-right px-4 py-3 text-zinc-500 font-medium">Qty</th>
                <th className="text-right px-4 py-3 text-zinc-500 font-medium">Unit Price</th>
                <th className="text-right px-4 py-3 text-zinc-500 font-medium">Discount</th>
                <th className="text-right px-4 py-3 text-zinc-500 font-medium">Total</th>
              </tr></thead>
              <tbody>
                {opp.products.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-600">No products added</td></tr>}
                {opp.products.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-800/50">
                    <td className="px-4 py-3 text-zinc-200">{p.productName}</td>
                    <td className="px-4 py-3 text-right text-zinc-400">{p.quantity}</td>
                    <td className="px-4 py-3 text-right text-zinc-400">${p.pricePerUnit.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-zinc-400">{p.discount}%</td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-mono">${p.lineTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Quotes' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setShowQuoteModal(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors">
              <Plus className="w-4 h-4" /> New Quote
            </button>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Quote #</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Account</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Status</th>
                <th className="text-right px-4 py-3 text-zinc-500 font-medium">Amount</th>
              </tr></thead>
              <tbody>
                {opp.quotes.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-600">No quotes yet</td></tr>}
                {opp.quotes.map((q) => (
                  <tr key={q.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="px-4 py-3"><Link href={`/sales/quotes/${q.id}`} className="text-blue-400 hover:text-blue-300">{q.quoteNumber.slice(-8)}</Link></td>
                    <td className="px-4 py-3 text-zinc-400">{q.accountName || '—'}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-300 capitalize">{q.status}</span></td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-mono">{fmt(q.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Competitors' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Competitor Tracking</h3>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Assigned Competitor</label>
            {editing ? (
              <select value={form.competitorId || ''} onChange={(e) => setForm({ ...form, competitorId: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500">
                <option value="">None</option>
                {competitors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            ) : (
              <p className="text-sm text-zinc-200">{competitors.find((c) => c.id === opp.competitorId)?.name || '—'}</p>
            )}
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="mt-3 px-3 py-1.5 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">Edit</button>
          )}
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100">Add Product</h2>
            {[{ k: 'productName', label: 'Product Name' }, { k: 'quantity', label: 'Quantity', type: 'number' }, { k: 'pricePerUnit', label: 'Price Per Unit', type: 'number' }, { k: 'discount', label: 'Discount %', type: 'number' }].map(({ k, label, type }) => (
              <div key={k}>
                <label className="block text-xs text-zinc-400 mb-1">{label}</label>
                <input type={type || 'text'} value={(productForm as Record<string, string>)[k]} onChange={(e) => setProductForm({ ...productForm, [k]: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowProductModal(false)} className="flex-1 px-3 py-2 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">Cancel</button>
              <button onClick={addProduct} className="flex-1 px-3 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100">New Quote</h2>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Account Name</label>
              <input value={quoteForm.accountName} onChange={(e) => setQuoteForm({ ...quoteForm, accountName: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Notes</label>
              <textarea value={quoteForm.notes} onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 resize-none" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowQuoteModal(false)} className="flex-1 px-3 py-2 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">Cancel</button>
              <button onClick={createQuote} className="flex-1 px-3 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors">Create Quote</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
