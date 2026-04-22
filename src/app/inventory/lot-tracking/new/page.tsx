'use client'

/**
 * New Lot Entry
 * Route: /inventory/lot-tracking/new/
 *
 * Create a new lot/batch: select product, enter lot number (auto if blank),
 * supplier, quantity, manufacture/expiry dates.
 * Submits to /api/inventory/lot-tracking (POST)
 */
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { ChevronLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface ProductOption  { id: string; name: string; sku: string }
interface SupplierOption { id: string; name: string }

export default function NewLotTrackingPage() {
  const router = useRouter()

  const [products,  setProducts]  = useState<ProductOption[]>([])
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [toast,     setToast]     = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const [form, setForm] = useState({
    productId: '', productSearch: '', supplierId: '',
    lotNo: '', quantity: '', manufacturedAt: '', expiresAt: '', notes: '',
  })
  const [showDrop, setShowDrop] = useState(false)

  function notify(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/suppliers').then(r => r.json()),
    ])
      .then(([prods, supps]) => {
        setProducts(Array.isArray(prods) ? prods : (prods.products ?? []))
        setSuppliers(Array.isArray(supps) ? supps : (supps.suppliers ?? []))
      })
      .catch(() => notify('Failed to load form data', 'err'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = form.productSearch.trim()
    ? products.filter(p => p.name.toLowerCase().includes(form.productSearch.toLowerCase()) || p.sku.toLowerCase().includes(form.productSearch.toLowerCase()))
    : products.slice(0, 20)

  function selectProduct(p: ProductOption) {
    setForm(f => ({ ...f, productId: p.id, productSearch: `${p.name} (${p.sku})` }))
    setShowDrop(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.productId) { notify('Select a product', 'err'); return }
    const qty = parseInt(form.quantity, 10)
    if (isNaN(qty) || qty < 0) { notify('Enter a valid quantity', 'err'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/inventory/lot-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lotNo:          form.lotNo.trim()    || undefined,
          productId:      form.productId,
          supplierId:     form.supplierId      || undefined,
          quantity:       qty,
          manufacturedAt: form.manufacturedAt  || undefined,
          expiresAt:      form.expiresAt       || undefined,
          notes:          form.notes.trim()    || undefined,
        }),
      })

      if (!res.ok) {
        const d = await res.json() as { error?: string }
        notify(d.error ?? 'Failed to create lot', 'err')
        return
      }

      const created = await res.json() as { id: string }
      notify('Lot created')
      router.push(`/inventory/lot-tracking/${created.id}`)
    } catch {
      notify('Network error', 'err')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Lot" breadcrumb={[{ label: 'Inventory', href: '/inventory' }, { label: 'Lot Tracking', href: '/inventory/lot-tracking' }]} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-2xl mx-auto p-6 space-y-6">

          {toast && (
            <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-[13px] font-medium shadow-xl ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{toast.msg}</div>
          )}

          <Link href="/inventory/lot-tracking" className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />Back to Lot Tracking
          </Link>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
            <h2 className="text-[15px] font-semibold text-zinc-100 mb-6">Create Lot / Batch</h2>

            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 text-zinc-500 animate-spin" /></div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Product search */}
                <div className="relative">
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Product <span className="text-red-400">*</span></label>
                  <input
                    type="text" placeholder="Search by name or SKU…"
                    value={form.productSearch}
                    onChange={e => { setForm(f => ({ ...f, productSearch: e.target.value, productId: '' })); setShowDrop(true) }}
                    onFocus={() => setShowDrop(true)}
                    onBlur={() => setTimeout(() => setShowDrop(false), 150)}
                    className="w-full h-9 px-3 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                    required
                  />
                  {showDrop && filtered.length > 0 && (
                    <div className="absolute z-20 top-full mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden max-h-56 overflow-y-auto">
                      {filtered.map(p => (
                        <button key={p.id} type="button" onMouseDown={() => selectProduct(p)} className="w-full text-left px-3 py-2 hover:bg-zinc-800 text-[13px] text-zinc-200 flex items-center justify-between">
                          <span>{p.name}</span>
                          <span className="text-zinc-500 font-mono text-[11px]">{p.sku}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Lot Number <span className="text-zinc-600">(auto-generated if blank)</span></label>
                  <input type="text" placeholder="e.g. BATCH-2026-001" value={form.lotNo} onChange={e => setForm(f => ({ ...f, lotNo: e.target.value }))} className="w-full h-9 px-3 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 font-mono" />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Supplier</label>
                  <select value={form.supplierId} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))} className="w-full h-9 px-3 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500">
                    <option value="">— None —</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widests text-zinc-500 mb-1.5">Initial Quantity <span className="text-red-400">*</span></label>
                  <input type="number" min="0" step="1" placeholder="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="w-full h-9 px-3 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Manufactured Date</label>
                    <input type="date" value={form.manufacturedAt} onChange={e => setForm(f => ({ ...f, manufacturedAt: e.target.value }))} className="w-full h-9 px-3 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Expiry Date</label>
                    <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className="w-full h-9 px-3 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Notes</label>
                  <textarea rows={3} placeholder="Optional notes about this batch…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 resize-none" />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" disabled={saving || !form.productId} className="inline-flex items-center gap-2 h-9 px-5 rounded text-[13px] font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors">
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Create Lot
                  </button>
                  <Link href="/inventory/lot-tracking" className="h-9 px-4 rounded text-[13px] font-medium border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors inline-flex items-center">Cancel</Link>
                </div>

              </form>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
