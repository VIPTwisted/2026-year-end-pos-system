'use client'
import { useEffect, useState } from 'react'
import { Tag, Plus, Trash2, Check, X, Info } from 'lucide-react'

interface Override {
  id: string
  orgId: string | null
  productName: string | null
  sku: string | null
  priceType: string
  value: number
  minQty: number
  startDate: string | null
  endDate: string | null
  isActive: boolean
  createdAt: string
}

interface Org {
  id: string
  name: string
  accountNumber: string
}

const defaultForm = {
  orgId: '',
  productName: '',
  sku: '',
  priceType: 'fixed',
  value: '',
  minQty: '1',
  startDate: '',
  endDate: '',
}

const PRICE_TYPE_LABEL: Record<string, string> = {
  fixed: 'Fixed Price',
  'discount-pct': 'Discount %',
  'discount-amt': 'Discount $',
}

export default function PriceOverridesPage() {
  const [overrides, setOverrides] = useState<Override[]>([])
  const [orgs, setOrgs] = useState<Org[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const [ovRes, orgRes] = await Promise.all([
        fetch('/api/b2b/price-overrides'),
        fetch('/api/b2b/organizations'),
      ])
      setOverrides(await ovRes.json())
      setOrgs(await orgRes.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/b2b/price-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: form.orgId || null,
          productName: form.productName || null,
          sku: form.sku || null,
          priceType: form.priceType,
          value: parseFloat(form.value) || 0,
          minQty: parseInt(form.minQty) || 1,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Error'); return }
      setForm(defaultForm)
      setShowForm(false)
      load()
    } catch {
      setError('Failed to create')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(override: Override) {
    setTogglingId(override.id)
    try {
      await fetch(`/api/b2b/price-overrides/${override.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !override.isActive }),
      })
      load()
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this price override?')) return
    await fetch(`/api/b2b/price-overrides/${id}`, { method: 'DELETE' })
    load()
  }

  const getOrgName = (orgId: string | null) => {
    if (!orgId) return 'All Organizations'
    return orgs.find(o => o.id === orgId)?.name ?? orgId
  }

  const formatValue = (override: Override) => {
    if (override.priceType === 'fixed') return `$${override.value.toFixed(2)}`
    if (override.priceType === 'discount-pct') return `${override.value}% off`
    return `-$${override.value.toFixed(2)}`
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold text-zinc-100">B2B Price Overrides</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Override
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 bg-blue-900/20 border border-blue-800/50 rounded-xl p-4">
        <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-300">
          B2B price overrides take precedence over standard price groups for matched organizations and products. When an organization places an order, matching overrides are applied before any other pricing rules.
        </p>
      </div>

      {/* Add Override Form */}
      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-200">New Price Override</span>
            <button onClick={() => { setShowForm(false); setError('') }} className="text-zinc-500 hover:text-zinc-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Organization</label>
              <select
                value={form.orgId}
                onChange={e => setForm({ ...form, orgId: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none"
              >
                <option value="">All Organizations</option>
                {orgs.map(o => (
                  <option key={o.id} value={o.id}>{o.name} ({o.accountNumber})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Product Name</label>
              <input
                value={form.productName}
                onChange={e => setForm({ ...form, productName: e.target.value })}
                placeholder="Product name (optional)"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">SKU</label>
              <input
                value={form.sku}
                onChange={e => setForm({ ...form, sku: e.target.value })}
                placeholder="SKU (optional)"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Price Type</label>
              <select
                value={form.priceType}
                onChange={e => setForm({ ...form, priceType: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none"
              >
                <option value="fixed">Fixed Price</option>
                <option value="discount-pct">Discount %</option>
                <option value="discount-amt">Discount Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">
                Value {form.priceType === 'fixed' ? '($)' : form.priceType === 'discount-pct' ? '(%)' : '($)'}
              </label>
              <input
                type="number"
                step="0.01"
                value={form.value}
                onChange={e => setForm({ ...form, value: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Min Qty</label>
              <input
                type="number"
                min={1}
                value={form.minQty}
                onChange={e => setForm({ ...form, minQty: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {saving ? 'Creating...' : 'Create Override'}
            </button>
            <button onClick={() => { setShowForm(false); setError('') }} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Organization</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Product / SKU</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Value</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Min Qty</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Start Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">End Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Active</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
              ) : overrides.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-500">No price overrides configured</td></tr>
              ) : overrides.map(ov => (
                <tr key={ov.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-4 py-3 text-zinc-300 text-xs">{getOrgName(ov.orgId)}</td>
                  <td className="px-4 py-3">
                    <div className="text-zinc-300 text-xs">{ov.productName ?? <span className="text-zinc-600">Any product</span>}</div>
                    {ov.sku && <div className="text-zinc-500 font-mono text-xs">{ov.sku}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-zinc-700 text-zinc-300">
                      {PRICE_TYPE_LABEL[ov.priceType] ?? ov.priceType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-100 font-mono text-xs font-semibold">{formatValue(ov)}</td>
                  <td className="px-4 py-3 text-right text-zinc-400 text-xs">{ov.minQty}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{ov.startDate ? new Date(ov.startDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{ov.endDate ? new Date(ov.endDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(ov)}
                      disabled={togglingId === ov.id}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${ov.isActive ? 'bg-blue-600' : 'bg-zinc-700'} disabled:opacity-50`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${ov.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(ov.id)} className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
