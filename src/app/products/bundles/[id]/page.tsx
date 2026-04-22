'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Trash2, Pencil, Check, X, Layers } from 'lucide-react'
import { use } from 'react'

interface Product {
  id: string
  name: string
  sku: string
  salePrice: number
}

interface BundleComponent {
  id: string
  productId: string
  quantity: number
  isOptional: boolean
  product: Product
}

interface Bundle {
  id: string
  productId: string
  bundleType: string
  isActive: boolean
  product: Product & { isActive: boolean }
  components: BundleComponent[]
}

const inputCls =
  'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors'
const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'

interface Toast { msg: string; type: 'ok' | 'err' }

export default function BundleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)

  const [addProductId, setAddProductId] = useState('')
  const [addQty, setAddQty] = useState('1')
  const [addOptional, setAddOptional] = useState(false)
  const [addLoading, setAddLoading] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQty, setEditQty] = useState('1')

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const load = useCallback(async () => {
    try {
      const [bundleRes, productsRes] = await Promise.all([
        fetch(`/api/products/bundles/${id}`),
        fetch('/api/products'),
      ])
      if (!bundleRes.ok) throw new Error('Bundle not found')
      const b = await bundleRes.json() as Bundle
      const pd = await productsRes.json()
      setBundle(b)
      setProducts(Array.isArray(pd) ? pd : (pd.products ?? []))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const patch = async (body: Record<string, unknown>) => {
    const res = await fetch(`/api/products/bundles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json() as Bundle | { error: string }
    if (!res.ok) throw new Error('error' in data ? data.error : 'Update failed')
    setBundle(data as Bundle)
  }

  const handleAddComponent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addProductId) return
    setAddLoading(true)
    try {
      await patch({
        addComponents: [
          {
            productId: addProductId,
            quantity: parseInt(addQty, 10) || 1,
            isOptional: addOptional,
          },
        ],
      })
      setAddProductId('')
      setAddQty('1')
      setAddOptional(false)
      notify('Component added')
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed', 'err')
    } finally {
      setAddLoading(false)
    }
  }

  const handleRemoveComponent = async (componentId: string) => {
    try {
      await patch({ removeComponentIds: [componentId] })
      notify('Component removed')
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed', 'err')
    }
  }

  const handleSaveQty = async (componentId: string) => {
    try {
      await patch({
        updateComponents: [{ id: componentId, quantity: parseInt(editQty, 10) || 1 }],
      })
      setEditingId(null)
      notify('Quantity updated')
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed', 'err')
    }
  }

  const handleToggleActive = async () => {
    if (!bundle) return
    try {
      await patch({ isActive: !bundle.isActive })
      notify(bundle.isActive ? 'Bundle deactivated' : 'Bundle activated')
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed', 'err')
    }
  }

  const handleDeleteBundle = async () => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/products/bundles/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      router.push('/products/bundles')
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Delete failed', 'err')
      setDeleteLoading(false)
      setConfirmDelete(false)
    }
  }

  if (loading) {
    return (
      <>
        <TopBar title="Bundle" />
        <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh] flex items-center justify-center">
          <div className="text-zinc-500 text-sm">Loading…</div>
        </main>
      </>
    )
  }

  if (error || !bundle) {
    return (
      <>
        <TopBar title="Bundle" />
        <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh] flex items-center justify-center">
          <div className="text-red-400 text-sm">{error ?? 'Bundle not found'}</div>
        </main>
      </>
    )
  }

  const usedProductIds = new Set([
    bundle.productId,
    ...bundle.components.map(c => c.productId),
  ])

  const componentTotal = bundle.components.reduce(
    (s, c) => s + c.product.salePrice * c.quantity,
    0,
  )
  const bundlePrice = bundle.product.salePrice
  const savings = componentTotal - bundlePrice
  const discountPct = componentTotal > 0 ? ((savings / componentTotal) * 100).toFixed(1) : '0'

  return (
    <>
      <TopBar title={`Bundle — ${bundle.product.name}`} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-4xl mx-auto p-6 space-y-6">

          {/* Toast */}
          {toast && (
            <div
              className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg border
                ${toast.type === 'ok'
                  ? 'bg-emerald-900/80 border-emerald-700 text-emerald-300'
                  : 'bg-red-900/80 border-red-700 text-red-300'
                }`}
            >
              {toast.msg}
            </div>
          )}

          <Link
            href="/products/bundles"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Bundles
          </Link>

          {/* Bundle Header */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg font-bold text-zinc-100">{bundle.product.name}</h1>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize
                        ${bundle.bundleType === 'kit'
                          ? 'bg-blue-500/10 text-blue-400'
                          : bundle.bundleType === 'bundle'
                            ? 'bg-purple-500/10 text-purple-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                    >
                      {bundle.bundleType}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium
                        ${bundle.isActive
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-zinc-700 text-zinc-400'
                        }`}
                    >
                      {bundle.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500">
                    <span className="font-mono">{bundle.product.sku}</span>
                    <span>
                      Price:{' '}
                      <span className="text-emerald-400 font-semibold tabular-nums">
                        ${bundlePrice.toFixed(2)}
                      </span>
                    </span>
                    <Link
                      href={`/products/${bundle.productId}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View product →
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleActive}
                  className="text-xs h-7"
                >
                  {bundle.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                {!confirmDelete ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmDelete(true)}
                    className="text-xs h-7 border-red-900/50 text-red-400 hover:bg-red-950/30"
                  >
                    Delete Bundle
                  </Button>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-red-400">Confirm?</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteBundle}
                      disabled={deleteLoading}
                      className="text-xs h-7 bg-red-900/20 border-red-700 text-red-400"
                    >
                      {deleteLoading ? '…' : 'Yes, delete'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs h-7"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Components Table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="border-b border-zinc-800/50 px-5 py-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Components ({bundle.components.length})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                    {['Product', 'SKU', 'Unit Price', 'Qty', 'Line Total', 'Optional', ''].map(h => (
                      <th
                        key={h}
                        className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500
                          ${h === 'Unit Price' || h === 'Qty' || h === 'Line Total' ? 'text-right' : h === '' ? 'text-right' : 'text-left'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bundle.components.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-zinc-600 text-sm">
                        No components — add one below
                      </td>
                    </tr>
                  )}
                  {bundle.components.map(comp => (
                    <tr
                      key={comp.id}
                      className="border-b border-zinc-800/30 hover:bg-zinc-800/15 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-zinc-200">{comp.product.name}</td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-500">{comp.product.sku}</td>
                      <td className="px-4 py-3 text-right text-sm tabular-nums text-zinc-400">
                        ${comp.product.salePrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editingId === comp.id ? (
                          <div className="flex items-center gap-1 justify-end">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={editQty}
                              onChange={e => setEditQty(e.target.value)}
                              className="w-16 bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-sm text-zinc-100 text-right focus:outline-none focus:border-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveQty(comp.id)}
                              className="text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingId(comp.id); setEditQty(String(comp.quantity)) }}
                            className="group flex items-center gap-1 justify-end text-sm text-zinc-200 hover:text-zinc-100 transition-colors"
                          >
                            {comp.quantity}
                            <Pencil className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm tabular-nums font-semibold text-zinc-100">
                        ${(comp.product.salePrice * comp.quantity).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        {comp.isOptional && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400">
                            Optional
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRemoveComponent(comp.id)}
                          className="text-zinc-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Component Form */}
            <form onSubmit={handleAddComponent} className="border-t border-zinc-800/50 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                Add Component
              </div>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className={labelCls}>Product</label>
                  <select
                    value={addProductId}
                    onChange={e => setAddProductId(e.target.value)}
                    className={inputCls}
                    required
                  >
                    <option value="">Select product…</option>
                    {products
                      .filter(p => !usedProductIds.has(p.id))
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className={labelCls}>Qty</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={addQty}
                    onChange={e => setAddQty(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="flex items-center gap-2 mb-[9px]">
                  <input
                    type="checkbox"
                    id="add-optional"
                    checked={addOptional}
                    onChange={e => setAddOptional(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 accent-blue-500"
                  />
                  <label htmlFor="add-optional" className="text-xs text-zinc-500 select-none whitespace-nowrap">
                    Optional
                  </label>
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={addLoading || !addProductId}
                  className="bg-blue-600 hover:bg-blue-700 gap-1.5 mb-[1px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {addLoading ? 'Adding…' : 'Add'}
                </Button>
              </div>
            </form>
          </div>

          {/* Price Analysis */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">
              Price Analysis
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">
                  Total Component Cost
                </div>
                <div className="text-xl font-bold text-zinc-100 tabular-nums">
                  ${componentTotal.toFixed(2)}
                </div>
                <div className="text-xs text-zinc-600 mt-0.5">sum of all components × qty</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">
                  Bundle Price
                </div>
                <div className="text-xl font-bold text-emerald-400 tabular-nums">
                  ${bundlePrice.toFixed(2)}
                </div>
                <div className="text-xs text-zinc-600 mt-0.5">what customer pays</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">
                  {savings >= 0 ? 'Effective Discount' : 'Bundle Premium'}
                </div>
                <div
                  className={`text-xl font-bold tabular-nums ${savings >= 0 ? 'text-blue-400' : 'text-red-400'}`}
                >
                  {savings >= 0 ? '' : '+'}{Math.abs(savings).toFixed(2) === savings.toFixed(2) && savings < 0 ? '' : ''}
                  ${Math.abs(savings).toFixed(2)}{' '}
                  <span className="text-sm font-normal">({discountPct}%)</span>
                </div>
                <div className="text-xs text-zinc-600 mt-0.5">vs buying separately</div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
