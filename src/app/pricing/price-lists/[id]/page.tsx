'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import {
  Tag, Plus, Trash2, Users, User, CalendarRange,
  Search, X, CheckCircle2, AlertCircle, Pencil, Check
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductRow {
  id: string
  sku: string
  name: string
  salePrice: number
  imageUrl: string | null
}

interface PriceListLine {
  id: string
  priceListId: string
  productId: string
  minQty: number
  unitPrice: number
  discountPct: number
  product: ProductRow
}

interface CustomerGroup {
  id: string
  name: string
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

interface PriceListDetail {
  id: string
  name: string
  code: string
  currency: string
  customerGroupId: string | null
  customerId: string | null
  startDate: string | null
  endDate: string | null
  isActive: boolean
  notes: string | null
  createdAt: string
  customerGroup: CustomerGroup | null
  customer: Customer | null
  lines: PriceListLine[]
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, type, onClose }: { msg: string; type: 'ok' | 'err'; onClose: () => void }) {
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border text-sm font-medium transition-all ${
      type === 'ok'
        ? 'bg-emerald-950 border-emerald-700/60 text-emerald-300'
        : 'bg-red-950 border-red-700/60 text-red-300'
    }`}>
      {type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {msg}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────

function DeleteModal({ lineId, productName, onConfirm, onCancel }: {
  lineId: string
  productName: string
  onConfirm: (id: string) => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#16213e] border border-zinc-700 rounded-lg p-6 max-w-sm w-full space-y-4">
        <h3 className="text-sm font-semibold text-zinc-100">Remove Line</h3>
        <p className="text-sm text-zinc-400">
          Remove <span className="text-zinc-200 font-medium">{productName}</span> from this price list?
        </p>
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => onConfirm(lineId)}
            className="flex-1 bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            Remove
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-zinc-700 text-zinc-400 hover:text-zinc-200 text-sm px-4 py-2 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Assign Modal ─────────────────────────────────────────────────────────────

function AssignModal({ mode, onConfirm, onCancel }: {
  mode: 'group' | 'customer'
  onConfirm: (id: string) => void
  onCancel: () => void
}) {
  const [items, setItems] = useState<Array<{ id: string; label: string }>>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = mode === 'group' ? '/api/customers/groups' : '/api/customers?limit=200'
    fetch(url)
      .then(r => r.json())
      .then((d: unknown) => {
        if (mode === 'group') {
          const arr = Array.isArray(d) ? d as CustomerGroup[] : ((d as { groups?: CustomerGroup[] }).groups ?? [])
          setItems(arr.map(g => ({ id: g.id, label: g.name })))
        } else {
          const arr = Array.isArray(d)
            ? d as Customer[]
            : ((d as { customers?: Customer[]; items?: Customer[] }).customers ?? (d as { items?: Customer[] }).items ?? [])
          setItems(arr.map(c => ({ id: c.id, label: `${c.firstName} ${c.lastName}${c.email ? ` (${c.email})` : ''}` })))
        }
      })
      .finally(() => setLoading(false))
  }, [mode])

  const filtered = items.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#16213e] border border-zinc-700 rounded-lg p-6 max-w-md w-full space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-100">
            Assign to {mode === 'group' ? 'Customer Group' : 'Customer'}
          </h3>
          <button onClick={onCancel} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${mode === 'group' ? 'groups' : 'customers'}…`}
            className="w-full bg-zinc-900 border border-zinc-700 rounded pl-8 pr-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="max-h-60 overflow-y-auto space-y-1">
          {loading && <p className="text-xs text-zinc-500 text-center py-4">Loading…</p>}
          {!loading && filtered.length === 0 && (
            <p className="text-xs text-zinc-500 text-center py-4">No results</p>
          )}
          {filtered.map(item => (
            <button
              key={item.id}
              onClick={() => onConfirm(item.id)}
              className="w-full text-left px-3 py-2 rounded hover:bg-zinc-800/60 text-sm text-zinc-300 hover:text-zinc-100 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="w-full border border-zinc-700 text-zinc-400 hover:text-zinc-200 text-sm px-4 py-2 rounded transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PriceListDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()

  const [pl, setPl] = useState<PriceListDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  // Add line form state
  const [productSearch, setProductSearch] = useState('')
  const [productResults, setProductResults] = useState<ProductRow[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null)
  const [minQty, setMinQty] = useState('1')
  const [unitPrice, setUnitPrice] = useState('')
  const [discountPct, setDiscountPct] = useState('0')
  const [addingLine, setAddingLine] = useState(false)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  // Assign modal
  const [assignMode, setAssignMode] = useState<'group' | 'customer' | null>(null)

  // Inline edit (header fields)
  const [editingField, setEditingField] = useState<'name' | 'notes' | null>(null)
  const [editValue, setEditValue] = useState('')

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/pricing/price-lists/${id}`)
      if (!res.ok) { router.replace('/pricing/price-lists'); return }
      const data = await res.json() as PriceListDetail
      setPl(data)
    } catch {
      notify('Failed to load price list', 'err')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => { load() }, [load])

  // Product search debounce
  useEffect(() => {
    if (!productSearch.trim()) { setProductResults([]); return }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(productSearch)}&limit=20`)
        const data = await res.json() as { products?: ProductRow[]; items?: ProductRow[] } | ProductRow[]
        const arr = Array.isArray(data) ? data : (data.products ?? data.items ?? [])
        setProductResults(arr)
        setSearchOpen(true)
      } catch {
        // silent
      }
    }, 300)
    return () => clearTimeout(t)
  }, [productSearch])

  const selectProduct = (p: ProductRow) => {
    setSelectedProduct(p)
    setProductSearch(p.name)
    setUnitPrice(p.salePrice.toFixed(2))
    setSearchOpen(false)
  }

  const handleAddLine = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) { notify('Select a product first', 'err'); return }
    const up = parseFloat(unitPrice)
    if (isNaN(up) || up < 0) { notify('Enter a valid unit price', 'err'); return }

    setAddingLine(true)
    try {
      const res = await fetch(`/api/pricing/price-lists/${id}/lines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          minQty: parseInt(minQty, 10) || 1,
          unitPrice: up,
          discountPct: parseFloat(discountPct) || 0,
        }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to add line')
      notify('Line added')
      setSelectedProduct(null)
      setProductSearch('')
      setUnitPrice('')
      setDiscountPct('0')
      setMinQty('1')
      await load()
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to add line', 'err')
    } finally {
      setAddingLine(false)
    }
  }

  const handleDeleteLine = async (lineId: string) => {
    setDeleteTarget(null)
    try {
      const res = await fetch(`/api/pricing/price-lists/${id}/lines?lineId=${lineId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove line')
      notify('Line removed')
      await load()
    } catch {
      notify('Failed to remove line', 'err')
    }
  }

  const handleAssign = async (assignId: string) => {
    if (!assignMode) return
    setAssignMode(null)
    try {
      const body = assignMode === 'group'
        ? { customerGroupId: assignId, customerId: null }
        : { customerId: assignId, customerGroupId: null }
      const res = await fetch(`/api/pricing/price-lists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to assign')
      notify(`Assigned to ${assignMode === 'group' ? 'group' : 'customer'}`)
      await load()
    } catch {
      notify('Failed to assign', 'err')
    }
  }

  const handleToggleActive = async () => {
    if (!pl) return
    try {
      const res = await fetch(`/api/pricing/price-lists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !pl.isActive }),
      })
      if (!res.ok) throw new Error()
      notify(pl.isActive ? 'Deactivated' : 'Activated')
      await load()
    } catch {
      notify('Failed to update', 'err')
    }
  }

  const handleInlineEdit = async () => {
    if (!editingField) return
    try {
      const res = await fetch(`/api/pricing/price-lists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [editingField]: editValue }),
      })
      if (!res.ok) throw new Error()
      notify('Saved')
      setEditingField(null)
      await load()
    } catch {
      notify('Failed to save', 'err')
      setEditingField(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading…</div>
      </div>
    )
  }

  if (!pl) return null

  const now = new Date()
  const isExpired = pl.endDate ? new Date(pl.endDate) < now : false
  const effectiveStatus = pl.isActive && !isExpired

  const labelClass = 'text-[10px] font-semibold uppercase tracking-widest text-zinc-500'
  const inputClass = 'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500'

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title={pl.code}
        showBack
        breadcrumb={[
          { label: 'Pricing', href: '/pricing/price-lists' },
          { label: 'Price Lists', href: '/pricing/price-lists' },
        ]}
        actions={
          <button
            onClick={handleToggleActive}
            className={`text-xs font-medium px-3 py-1.5 rounded border transition-colors ${
              effectiveStatus
                ? 'border-emerald-700/50 text-emerald-400 hover:bg-emerald-500/10'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
            }`}
          >
            {effectiveStatus ? 'Active' : 'Inactive'}
          </button>
        }
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header card */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-3">
            <Tag className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="flex-1 min-w-0">
              {editingField === 'name' ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    className="bg-zinc-900 border border-blue-500 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none"
                    onKeyDown={e => { if (e.key === 'Enter') handleInlineEdit(); if (e.key === 'Escape') setEditingField(null) }}
                  />
                  <button onClick={handleInlineEdit} className="text-emerald-400 hover:text-emerald-300">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingField(null)} className="text-zinc-500 hover:text-zinc-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-zinc-100 truncate">{pl.name}</h2>
                  <button
                    onClick={() => { setEditingField('name'); setEditValue(pl.name) }}
                    className="text-zinc-600 hover:text-zinc-400"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
              effectiveStatus ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700/50 text-zinc-400'
            }`}>
              {effectiveStatus ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
            </span>
          </div>

          <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-5">
            <div>
              <p className={labelClass}>Code</p>
              <p className="text-sm font-mono text-zinc-200 mt-1">{pl.code}</p>
            </div>
            <div>
              <p className={labelClass}>Currency</p>
              <p className="text-sm text-zinc-200 mt-1">{pl.currency}</p>
            </div>
            <div>
              <p className={labelClass}>Date Range</p>
              <p className="text-sm text-zinc-300 mt-1 flex items-center gap-1">
                <CalendarRange className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                {pl.startDate || pl.endDate
                  ? `${pl.startDate ? new Date(pl.startDate).toLocaleDateString() : '—'} → ${pl.endDate ? new Date(pl.endDate).toLocaleDateString() : '∞'}`
                  : 'Always active'}
              </p>
            </div>
            <div>
              <p className={labelClass}>Assigned To</p>
              <div className="mt-1">
                {pl.customer ? (
                  <span className="inline-flex items-center gap-1.5 text-sm text-zinc-300">
                    <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    {pl.customer.firstName} {pl.customer.lastName}
                  </span>
                ) : pl.customerGroup ? (
                  <span className="inline-flex items-center gap-1.5 text-sm text-zinc-300">
                    <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    {pl.customerGroup.name}
                  </span>
                ) : (
                  <span className="text-sm text-zinc-600">No assignment</span>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="px-5 pb-4">
            <p className={labelClass}>Notes</p>
            {editingField === 'notes' ? (
              <div className="mt-1 space-y-2">
                <textarea
                  autoFocus
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-900 border border-blue-500 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={handleInlineEdit} className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1">
                    <Check className="w-3 h-3" /> Save
                  </button>
                  <button onClick={() => setEditingField(null)} className="text-zinc-500 hover:text-zinc-300 text-xs">Cancel</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setEditingField('notes'); setEditValue(pl.notes ?? '') }}
                className="mt-1 text-sm text-zinc-400 hover:text-zinc-200 text-left w-full group flex items-start gap-2"
              >
                <span>{pl.notes || <span className="text-zinc-600 italic">Add notes…</span>}</span>
                <Pencil className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>

          {/* Assign actions */}
          <div className="px-5 pb-4 flex gap-2 border-t border-zinc-800/50 pt-4">
            <button
              onClick={() => setAssignMode('group')}
              className="inline-flex items-center gap-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 px-3 py-1.5 rounded transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              Assign to Group
            </button>
            <button
              onClick={() => setAssignMode('customer')}
              className="inline-flex items-center gap-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 px-3 py-1.5 rounded transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              Assign to Customer
            </button>
          </div>
        </div>

        {/* Lines Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-800/50">
            <h3 className="text-sm font-semibold text-zinc-100">
              Price Lines
              <span className="ml-2 text-xs text-zinc-500 font-normal">({pl.lines.length} products)</span>
            </h3>
          </div>

          {pl.lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <p className="text-sm text-zinc-500">No price lines yet</p>
              <p className="text-xs text-zinc-600">Add products using the form below</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-5 py-3">Product</th>
                    <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-4 py-3">SKU</th>
                    <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-4 py-3">Min Qty</th>
                    <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-4 py-3">Unit Price</th>
                    <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-4 py-3">Discount %</th>
                    <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-4 py-3">Effective Price</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {pl.lines.map((line) => {
                    const effective = line.unitPrice * (1 - line.discountPct / 100)
                    const saving = line.product.salePrice - effective
                    return (
                      <tr key={line.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {line.product.imageUrl ? (
                              <img src={line.product.imageUrl} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded bg-zinc-800 shrink-0" />
                            )}
                            <span className="text-zinc-200">{line.product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs text-zinc-500">{line.product.sku}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-zinc-300">{line.minQty}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="tabular-nums font-semibold text-zinc-100">
                            {formatCurrency(line.unitPrice)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {line.discountPct > 0 ? (
                            <span className="text-amber-400">{line.discountPct.toFixed(1)}%</span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div>
                            <span className="tabular-nums font-semibold text-emerald-400">
                              {formatCurrency(effective)}
                            </span>
                            {saving > 0.01 && (
                              <p className="text-[11px] text-zinc-600">
                                saves {formatCurrency(saving)} vs base {formatCurrency(line.product.salePrice)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => setDeleteTarget({ id: line.id, name: line.product.name })}
                            className="text-zinc-600 hover:text-red-400 transition-colors"
                            title="Remove line"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Add line form */}
          <form onSubmit={handleAddLine} className="p-5 border-t border-zinc-800/50 space-y-4">
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Add Product</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Product search */}
              <div className="md:col-span-2 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    value={productSearch}
                    onChange={e => {
                      setProductSearch(e.target.value)
                      if (!e.target.value) setSelectedProduct(null)
                    }}
                    placeholder="Search products…"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded pl-9 pr-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                  {productSearch && (
                    <button
                      type="button"
                      onClick={() => { setProductSearch(''); setSelectedProduct(null); setSearchOpen(false) }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {searchOpen && productResults.length > 0 && (
                  <div className="absolute z-10 top-full mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {productResults.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectProduct(p)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 transition-colors text-left"
                      >
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                        ) : (
                          <div className="w-6 h-6 rounded bg-zinc-700 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-zinc-200 truncate">{p.name}</p>
                          <p className="text-[11px] text-zinc-500">{p.sku} · {formatCurrency(p.salePrice)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Min qty */}
              <input
                type="number"
                min="1"
                value={minQty}
                onChange={e => setMinQty(e.target.value)}
                placeholder="Min Qty"
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />

              {/* Unit price */}
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={e => setUnitPrice(e.target.value)}
                placeholder="Unit Price"
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-zinc-500">Discount %</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={discountPct}
                  onChange={e => setDiscountPct(e.target.value)}
                  className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              {selectedProduct && unitPrice && (
                <div className="text-xs text-zinc-500">
                  Effective:{' '}
                  <span className="text-emerald-400 font-semibold">
                    {formatCurrency(parseFloat(unitPrice) * (1 - (parseFloat(discountPct) || 0) / 100))}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={addingLine || !selectedProduct || !unitPrice}
                className="ml-auto inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-medium px-4 py-2 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {addingLine ? 'Adding…' : 'Add Line'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modals */}
      {deleteTarget && (
        <DeleteModal
          lineId={deleteTarget.id}
          productName={deleteTarget.name}
          onConfirm={handleDeleteLine}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {assignMode && (
        <AssignModal
          mode={assignMode}
          onConfirm={handleAssign}
          onCancel={() => setAssignMode(null)}
        />
      )}

      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
