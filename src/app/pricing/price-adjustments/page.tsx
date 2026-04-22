'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SlidersHorizontal, ChevronLeft, Plus, X, Check } from 'lucide-react'

interface PriceAdjustment {
  id: string
  name: string
  productId: string | null
  categoryId: string | null
  priceGroupId: string | null
  adjustType: string
  adjustValue: number
  startDate: string | null
  endDate: string | null
  isActive: boolean
  createdAt: string
}

interface Product { id: string; sku: string; name: string }
interface PriceGroup { id: string; code: string; name: string }

interface FormState {
  name: string
  productId: string
  categoryId: string
  priceGroupId: string
  adjustType: string
  adjustValue: string
  startDate: string
  endDate: string
  isActive: boolean
}

const EMPTY_FORM: FormState = {
  name: '',
  productId: '',
  categoryId: '',
  priceGroupId: '',
  adjustType: 'percent',
  adjustValue: '',
  startDate: '',
  endDate: '',
  isActive: true,
}

const ADJUST_TYPE_LABELS: Record<string, string> = {
  percent: '% Off',
  fixed: 'Fixed $',
  new_price: 'New Price',
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PriceAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<PriceAdjustment[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [priceGroups, setPriceGroups] = useState<PriceGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const [adjRes, prodRes, grpRes] = await Promise.all([
      fetch('/api/pricing/price-adjustments'),
      fetch('/api/products?active=true'),
      fetch('/api/pricing/price-groups'),
    ])
    setAdjustments(await adjRes.json())
    setProducts(await prodRes.json())
    setPriceGroups(await grpRes.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save() {
    if (!form.name.trim()) { setError('Name is required.'); return }
    if (!form.adjustValue || isNaN(parseFloat(form.adjustValue))) { setError('Adjust value is required.'); return }
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: form.name,
        productId: form.productId || null,
        categoryId: form.categoryId || null,
        priceGroupId: form.priceGroupId || null,
        adjustType: form.adjustType,
        adjustValue: parseFloat(form.adjustValue),
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        isActive: form.isActive,
      }
      await fetch('/api/pricing/price-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setShowForm(false)
      setForm(EMPTY_FORM)
      await load()
    } catch {
      setError('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="Price Adjustments" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Price Adjustments</h2>
              <p className="text-sm text-zinc-500">{adjustments.length} adjustment{adjustments.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button onClick={() => { setShowForm(true); setError(''); setForm(EMPTY_FORM) }}>
            <Plus className="w-4 h-4 mr-1" />New Price Adjustment
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="border-blue-700/50">
            <CardContent className="pt-5 space-y-4">
              <h3 className="font-semibold text-zinc-100">New Price Adjustment</h3>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Name *</label>
                  <Input placeholder="Holiday Price Override" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Product</label>
                  <select
                    className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.productId}
                    onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
                  >
                    <option value="">All / by Category</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Price Group</label>
                  <select
                    className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.priceGroupId}
                    onChange={e => setForm(f => ({ ...f, priceGroupId: e.target.value }))}
                  >
                    <option value="">All Customers</option>
                    {priceGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Adjust Type *</label>
                  <select
                    className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.adjustType}
                    onChange={e => setForm(f => ({ ...f, adjustType: e.target.value }))}
                  >
                    <option value="percent">Percent Off (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                    <option value="new_price">New Price ($)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">
                    Value * {form.adjustType === 'percent' ? '(%)' : '($)'}
                  </label>
                  <Input type="number" min="0" step="0.01" placeholder="0" value={form.adjustValue} onChange={e => setForm(f => ({ ...f, adjustValue: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Start Date</label>
                  <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">End Date</label>
                  <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="accent-blue-500" />
                    <span className="text-sm text-zinc-300">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={save} disabled={saving}>
                  <Check className="w-4 h-4 mr-1" />{saving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>
                  <X className="w-4 h-4 mr-1" />Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        {loading ? (
          <p className="text-sm text-zinc-500">Loading...</p>
        ) : adjustments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <SlidersHorizontal className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No price adjustments. Create one to override product pricing.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Scope</th>
                      <th className="text-left p-4 font-medium">Adjust Type</th>
                      <th className="text-right p-4 font-medium">Value</th>
                      <th className="text-left p-4 font-medium">Start</th>
                      <th className="text-left p-4 font-medium">End</th>
                      <th className="text-center p-4 font-medium">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {adjustments.map(a => (
                      <tr key={a.id} className="hover:bg-zinc-900/50">
                        <td className="p-4 font-semibold text-zinc-100">{a.name}</td>
                        <td className="p-4 text-zinc-400 text-xs">
                          {a.productId ? 'Product' : a.categoryId ? 'Category' : 'All'}
                        </td>
                        <td className="p-4 text-zinc-400">{ADJUST_TYPE_LABELS[a.adjustType] ?? a.adjustType}</td>
                        <td className="p-4 text-right font-mono text-zinc-200">
                          {a.adjustType === 'percent' ? `${a.adjustValue}%` : `$${a.adjustValue.toFixed(2)}`}
                        </td>
                        <td className="p-4 text-zinc-500 text-xs">{fmtDate(a.startDate)}</td>
                        <td className="p-4 text-zinc-500 text-xs">{fmtDate(a.endDate)}</td>
                        <td className="p-4 text-center">
                          <Badge variant={a.isActive ? 'success' : 'secondary'}>{a.isActive ? 'Active' : 'Inactive'}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
