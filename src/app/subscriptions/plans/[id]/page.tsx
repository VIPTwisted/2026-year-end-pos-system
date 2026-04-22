'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Package, Plus, Trash2, Check, X, Users, Edit2, Save } from 'lucide-react'

interface Plan {
  id: string
  name: string
  description?: string
  planCode: string
  billingCycle: string
  price: number
  setupFee: number
  trialDays: number
  isActive: boolean
  features: string
  products: PlanProduct[]
  subscriptions: { status: string }[]
  _count?: { subscriptions: number }
}

interface PlanProduct {
  id: string
  productName: string
  sku?: string
  qty: number
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
  cancelled: 'bg-red-500/20 text-red-400',
  trial: 'bg-cyan-500/20 text-cyan-400',
}

export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '', price: '', setupFee: '', trialDays: '' })
  const [features, setFeatures] = useState<string[]>([])
  const [newFeature, setNewFeature] = useState('')
  const [newProduct, setNewProduct] = useState({ productName: '', sku: '', qty: '1' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    fetch(`/api/subscriptions/plans/${id}`)
      .then(r => r.json())
      .then(d => {
        setPlan(d)
        setEditForm({ name: d.name, description: d.description ?? '', price: d.price.toString(), setupFee: d.setupFee.toString(), trialDays: d.trialDays.toString() })
        try { setFeatures(JSON.parse(d.features)) } catch { setFeatures([]) }
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [id])

  const saveEdit = async () => {
    setSaving(true)
    await fetch(`/api/subscriptions/plans/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editForm, price: +editForm.price, setupFee: +editForm.setupFee, trialDays: +editForm.trialDays, features }),
    })
    setSaving(false)
    setEditing(false)
    load()
  }

  const addProduct = async () => {
    if (!newProduct.productName.trim()) return
    await fetch(`/api/subscriptions/plans/${id}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newProduct, qty: +newProduct.qty }),
    })
    setNewProduct({ productName: '', sku: '', qty: '1' })
    load()
  }

  const removeProduct = async (pid: string) => {
    await fetch(`/api/subscriptions/plans/${id}/products`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pid }),
    })
    load()
  }

  if (loading) return <div className="p-6 text-zinc-500">Loading…</div>
  if (!plan) return <div className="p-6 text-red-400">Plan not found</div>

  const statusBreakdown = ['active', 'paused', 'cancelled', 'trial'].map(s => ({
    status: s,
    count: plan.subscriptions.filter(sub => sub.status === s).length,
  })).filter(x => x.count > 0)

  const totalSubs = plan._count?.subscriptions ?? plan.subscriptions.length

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-400" />{plan.name}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-mono text-zinc-500">{plan.planCode}</span>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{plan.billingCycle}</span>
            <span className="text-xs text-zinc-400">${plan.price}/cycle</span>
          </div>
        </div>
        <button onClick={() => setEditing(!editing)} className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-lg text-sm transition-colors">
          <Edit2 className="w-3.5 h-3.5" />{editing ? 'Cancel Edit' : 'Edit Plan'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {editing ? (
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-300">Edit Plan</h2>
              <div className="grid grid-cols-2 gap-4">
                {[{ key: 'name', label: 'Name' }, { key: 'price', label: 'Price ($)' }, { key: 'setupFee', label: 'Setup Fee ($)' }, { key: 'trialDays', label: 'Trial Days' }].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-zinc-400 block mb-1">{f.label}</label>
                    <input value={(editForm as Record<string, string>)[f.key]} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-2">Features</label>
                <div className="flex gap-2 mb-2">
                  <input value={newFeature} onChange={e => setNewFeature(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newFeature.trim()) { setFeatures(p => [...p, newFeature.trim()]); setNewFeature('') } }} placeholder="Add feature" className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                  <button onClick={() => { if (newFeature.trim()) { setFeatures(p => [...p, newFeature.trim()]); setNewFeature('') } }} className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-3 py-2 rounded-lg text-sm">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {features.map((f, i) => (
                    <span key={i} className="flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-full">
                      <Check className="w-3 h-3 text-emerald-400" />{f}
                      <button onClick={() => setFeatures(p => p.filter((_, j) => j !== i))}><X className="w-3 h-3 text-zinc-500 hover:text-red-400" /></button>
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                <Save className="w-3.5 h-3.5" />{saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-zinc-300">Features Included</h2>
              {features.length === 0 ? <p className="text-xs text-zinc-600">No features listed</p> : (
                <ul className="space-y-1.5">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300">Included Products</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 text-xs text-zinc-500 font-medium">Product</th>
                  <th className="text-left py-2 text-xs text-zinc-500 font-medium">SKU</th>
                  <th className="text-left py-2 text-xs text-zinc-500 font-medium">Qty</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {plan.products.map(p => (
                  <tr key={p.id} className="border-b border-zinc-800/50">
                    <td className="py-2 text-zinc-200">{p.productName}</td>
                    <td className="py-2 text-zinc-500 font-mono text-xs">{p.sku ?? '—'}</td>
                    <td className="py-2 text-zinc-400">{p.qty}</td>
                    <td className="py-2">
                      <button onClick={() => removeProduct(p.id)} className="p-1 rounded hover:bg-red-500/20 text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-2 pt-1">
              <input value={newProduct.productName} onChange={e => setNewProduct(p => ({ ...p, productName: e.target.value }))} placeholder="Product name" className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              <input value={newProduct.sku} onChange={e => setNewProduct(p => ({ ...p, sku: e.target.value }))} placeholder="SKU" className="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              <input type="number" value={newProduct.qty} onChange={e => setNewProduct(p => ({ ...p, qty: e.target.value }))} placeholder="Qty" className="w-16 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              <button onClick={addProduct} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-3"><Users className="w-4 h-4" />Subscribers</h2>
            <div className="text-3xl font-bold text-zinc-100 mb-3">{totalSubs}</div>
            {statusBreakdown.length > 0 ? (
              <div className="space-y-2">
                {statusBreakdown.map(s => (
                  <div key={s.status} className="flex items-center gap-2">
                    <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${totalSubs > 0 ? (s.count / totalSubs) * 100 : 0}%` }} />
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${statusColors[s.status] ?? 'bg-zinc-700 text-zinc-400'}`}>{s.status}</span>
                    <span className="text-xs text-zinc-400 w-4 text-right">{s.count}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-zinc-600">No subscribers yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
