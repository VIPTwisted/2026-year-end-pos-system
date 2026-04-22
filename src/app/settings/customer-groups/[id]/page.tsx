'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, Plus, UserMinus, Save, Search } from 'lucide-react'

interface CustomerGroup {
  id: string
  name: string
  description: string | null
  discountPct: number
  isActive: boolean
  customers: CustomerRef[]
  pricingRules: PricingRule[]
}

interface CustomerRef {
  id: string
  firstName: string
  lastName: string
  email: string | null
  isActive: boolean
}

interface PricingRule {
  id: string
  productId: string | null
  categoryId: string | null
  priceOverride: number | null
  discountPct: number | null
  createdAt: string
  product: { id: string; name: string; sku: string } | null
}

interface ProductSearchResult {
  id: string
  name: string
  sku: string
  salePrice: number
}

interface CustomerSearchResult {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

function Toast({ msg, type }: { msg: string; type: 'ok' | 'err' }) {
  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium transition-all ${
        type === 'ok'
          ? 'bg-emerald-600 text-white'
          : 'bg-red-600 text-white'
      }`}
    >
      {msg}
    </div>
  )
}

export default function CustomerGroupDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()

  const [group, setGroup] = useState<CustomerGroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  // Edit group state
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editDiscount, setEditDiscount] = useState('0')
  const [editActive, setEditActive] = useState(true)
  const [saving, setSaving] = useState(false)

  // Add rule state
  const [ruleProductQuery, setRuleProductQuery] = useState('')
  const [ruleProducts, setRuleProducts] = useState<ProductSearchResult[]>([])
  const [ruleSelectedProduct, setRuleSelectedProduct] = useState<ProductSearchResult | null>(null)
  const [rulePriceOverride, setRulePriceOverride] = useState('')
  const [ruleDiscountPct, setRuleDiscountPct] = useState('')
  const [addingRule, setAddingRule] = useState(false)

  // Add customer state
  const [customerQuery, setCustomerQuery] = useState('')
  const [customerResults, setCustomerResults] = useState<CustomerSearchResult[]>([])
  const [addingCustomer, setAddingCustomer] = useState(false)

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState(false)

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  const loadGroup = useCallback(async () => {
    try {
      const res = await fetch(`/api/customers/groups/${id}`)
      if (!res.ok) throw new Error()
      const data = await res.json() as CustomerGroup
      setGroup(data)
      setEditName(data.name)
      setEditDesc(data.description ?? '')
      setEditDiscount(String(data.discountPct))
      setEditActive(data.isActive)
    } catch {
      notify('Failed to load group', 'err')
    } finally {
      setLoading(false)
    }
  }, [id, notify])

  useEffect(() => { void loadGroup() }, [loadGroup])

  // Product search for rules
  useEffect(() => {
    if (ruleProductQuery.length < 2) { setRuleProducts([]); return }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/products?search=${encodeURIComponent(ruleProductQuery)}&limit=8`)
      if (res.ok) {
        const data = await res.json() as ProductSearchResult[] | { items?: ProductSearchResult[] }
        setRuleProducts(Array.isArray(data) ? data : (data.items ?? []))
      }
    }, 300)
    return () => clearTimeout(t)
  }, [ruleProductQuery])

  // Customer search
  useEffect(() => {
    if (customerQuery.length < 2) { setCustomerResults([]); return }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(customerQuery)}&limit=8`)
      if (res.ok) {
        const d = await res.json() as { customers?: CustomerSearchResult[] } | CustomerSearchResult[]
        setCustomerResults(Array.isArray(d) ? d : (d.customers ?? []))
      }
    }, 300)
    return () => clearTimeout(t)
  }, [customerQuery])

  async function handleSaveGroup(e: React.FormEvent) {
    e.preventDefault()
    const pct = parseFloat(editDiscount)
    if (isNaN(pct) || pct < 0 || pct > 100) {
      notify('Discount must be 0–100', 'err')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/customers/groups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDesc.trim() || null,
          discountPct: pct,
          isActive: editActive,
        }),
      })
      if (!res.ok) throw new Error()
      await loadGroup()
      notify('Group saved')
    } catch {
      notify('Save failed', 'err')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteGroup() {
    try {
      const res = await fetch(`/api/customers/groups/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      router.push('/settings/customer-groups')
    } catch {
      notify('Delete failed', 'err')
    }
  }

  async function handleAddRule(e: React.FormEvent) {
    e.preventDefault()
    if (!rulePriceOverride && !ruleDiscountPct) {
      notify('Provide price override or discount %', 'err')
      return
    }
    setAddingRule(true)
    try {
      const body: Record<string, string | number | undefined> = {}
      if (ruleSelectedProduct) body.productId = ruleSelectedProduct.id
      if (rulePriceOverride) body.priceOverride = parseFloat(rulePriceOverride)
      if (ruleDiscountPct) body.discountPct = parseFloat(ruleDiscountPct)

      const res = await fetch(`/api/customers/groups/${id}/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      setRuleProductQuery('')
      setRuleSelectedProduct(null)
      setRulePriceOverride('')
      setRuleDiscountPct('')
      await loadGroup()
      notify('Rule added')
    } catch {
      notify('Failed to add rule', 'err')
    } finally {
      setAddingRule(false)
    }
  }

  async function handleDeleteRule(ruleId: string) {
    try {
      const res = await fetch(`/api/customers/groups/${id}/rules?ruleId=${ruleId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error()
      await loadGroup()
      notify('Rule removed')
    } catch {
      notify('Failed to remove rule', 'err')
    }
  }

  async function handleAddCustomer(customer: CustomerSearchResult) {
    setAddingCustomer(true)
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerGroupId: id }),
      })
      if (!res.ok) throw new Error()
      setCustomerQuery('')
      setCustomerResults([])
      await loadGroup()
      notify(`${customer.firstName} ${customer.lastName} added`)
    } catch {
      notify('Failed to add customer', 'err')
    } finally {
      setAddingCustomer(false)
    }
  }

  async function handleRemoveCustomer(customerId: string) {
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerGroupId: null }),
      })
      if (!res.ok) throw new Error()
      await loadGroup()
      notify('Customer removed from group')
    } catch {
      notify('Failed to remove customer', 'err')
    }
  }

  if (loading) {
    return (
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh] flex items-center justify-center">
        <span className="text-zinc-500 text-sm">Loading...</span>
      </main>
    )
  }

  if (!group) {
    return (
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh] flex items-center justify-center">
        <span className="text-zinc-500 text-sm">Group not found.</span>
      </main>
    )
  }

  // Filter out already-assigned customers from search results
  const existingIds = new Set(group.customers.map((c) => c.id))
  const filteredCustomerResults = customerResults.filter((c) => !existingIds.has(c.id))

  return (
    <>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="px-6 py-4 space-y-6 max-w-4xl">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/settings/customer-groups"
                className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Customer Groups
              </Link>
              <span className="text-zinc-700">/</span>
              <h2 className="text-base font-semibold text-zinc-100">{group.name}</h2>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                  group.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'
                }`}
              >
                {group.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400">Delete this group?</span>
                <button
                  onClick={handleDeleteGroup}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-red-600/20 border border-zinc-700 hover:border-red-500/50 text-zinc-400 hover:text-red-400 text-xs font-medium rounded transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Group
              </button>
            )}
          </div>

          {/* ── Group Settings Card ─────────────────────────────────────── */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800/40">
              <span className="text-[12px] font-semibold text-zinc-300">Group Settings</span>
            </div>
            <form onSubmit={handleSaveGroup} className="px-4 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    Flat Discount %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Description
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <span className="text-sm text-zinc-300">Active</span>
                </label>
                <button
                  type="submit"
                  disabled={saving}
                  className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* ── Pricing Rules Card ──────────────────────────────────────── */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800/40 flex items-center justify-between">
              <span className="text-[12px] font-semibold text-zinc-300">
                Pricing Rules ({group.pricingRules.length})
              </span>
            </div>

            {/* Existing rules */}
            {group.pricingRules.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                      {['Product', 'Price Override', 'Discount %', ''].map((h) => (
                        <th
                          key={h}
                          className={`px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide ${
                            h === '' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.pricingRules.map((rule) => (
                      <tr key={rule.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20">
                        <td className="px-4 py-2 text-sm text-zinc-300">
                          {rule.product ? (
                            <span>
                              {rule.product.name}
                              <span className="ml-1.5 text-[11px] text-zinc-500 font-mono">
                                {rule.product.sku}
                              </span>
                            </span>
                          ) : rule.categoryId ? (
                            <span className="text-zinc-500 italic">Category: {rule.categoryId}</span>
                          ) : (
                            <span className="text-zinc-500 italic">All products</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm tabular-nums">
                          {rule.priceOverride !== null && rule.priceOverride !== undefined ? (
                            <span className="text-emerald-400 font-semibold">
                              ${Number(rule.priceOverride).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm tabular-nums">
                          {rule.discountPct !== null && rule.discountPct !== undefined ? (
                            <span className="text-amber-400 font-semibold">
                              {Number(rule.discountPct).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-4 py-4 text-sm text-zinc-600">
                No specific rules. The flat group discount applies.
              </p>
            )}

            {/* Add rule form */}
            <div className="px-4 py-3 border-t border-zinc-800/40 bg-zinc-900/20">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                <Plus className="w-3 h-3 inline mr-1" />
                Add Rule
              </p>
              <form onSubmit={handleAddRule} className="space-y-3">
                {/* Product search */}
                <div className="relative">
                  <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded">
                    <Search className="w-3.5 h-3.5 text-zinc-500 ml-3 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search product (optional — leave blank for all)..."
                      value={ruleSelectedProduct ? `${ruleSelectedProduct.name} (${ruleSelectedProduct.sku})` : ruleProductQuery}
                      onChange={(e) => {
                        setRuleSelectedProduct(null)
                        setRuleProductQuery(e.target.value)
                      }}
                      className="flex-1 bg-transparent px-2 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
                    />
                    {ruleSelectedProduct && (
                      <button
                        type="button"
                        onClick={() => { setRuleSelectedProduct(null); setRuleProductQuery('') }}
                        className="mr-2 text-zinc-500 hover:text-zinc-300"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {ruleProducts.length > 0 && !ruleSelectedProduct && (
                    <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-zinc-900 border border-zinc-700 rounded shadow-xl max-h-48 overflow-y-auto">
                      {ruleProducts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { setRuleSelectedProduct(p); setRuleProducts([]) }}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-800 text-left"
                        >
                          <span className="text-sm text-zinc-200">{p.name}</span>
                          <span className="text-xs text-zinc-500 font-mono">{p.sku}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500">
                      Price Override ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={rulePriceOverride}
                      onChange={(e) => setRulePriceOverride(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500">
                      OR Discount %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0.00"
                      value={ruleDiscountPct}
                      onChange={(e) => setRuleDiscountPct(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addingRule}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-zinc-200 text-sm font-medium rounded transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {addingRule ? 'Adding...' : 'Add Rule'}
                </button>
              </form>
            </div>
          </div>

          {/* ── Members Card ────────────────────────────────────────────── */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800/40">
              <span className="text-[12px] font-semibold text-zinc-300">
                Members ({group.customers.length})
              </span>
            </div>

            {/* Member list */}
            {group.customers.length > 0 ? (
              <div className="divide-y divide-zinc-800/30">
                {group.customers.map((c) => (
                  <div key={c.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-zinc-800/20">
                    <div>
                      <span className="text-sm text-zinc-200 font-medium">
                        {c.firstName} {c.lastName}
                      </span>
                      {c.email && (
                        <span className="ml-2 text-xs text-zinc-500">{c.email}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveCustomer(c.id)}
                      className="inline-flex items-center gap-1 text-zinc-600 hover:text-red-400 text-xs transition-colors"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 py-4 text-sm text-zinc-600">No customers in this group yet.</p>
            )}

            {/* Add customer search */}
            <div className="px-4 py-3 border-t border-zinc-800/40 bg-zinc-900/20">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                <Plus className="w-3 h-3 inline mr-1" />
                Add Customer
              </p>
              <div className="relative">
                <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded">
                  <Search className="w-3.5 h-3.5 text-zinc-500 ml-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search customer by name or email..."
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    className="flex-1 bg-transparent px-2 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
                  />
                </div>
                {filteredCustomerResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-zinc-900 border border-zinc-700 rounded shadow-xl max-h-48 overflow-y-auto">
                    {filteredCustomerResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        disabled={addingCustomer}
                        onClick={() => handleAddCustomer(c)}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-800 text-left disabled:opacity-50"
                      >
                        <span className="text-sm text-zinc-200">
                          {c.firstName} {c.lastName}
                        </span>
                        {c.email && (
                          <span className="text-xs text-zinc-500">{c.email}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {customerQuery.length >= 2 && filteredCustomerResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-zinc-900 border border-zinc-700 rounded shadow-xl px-3 py-2">
                    <span className="text-xs text-zinc-500">No customers found</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
