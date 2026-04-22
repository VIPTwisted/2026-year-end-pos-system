'use client'

/**
 * Lot Detail — Traceability Tree + Movement Timeline
 * Route: /inventory/lot-tracking/[lotId]/
 *
 * Shows: lot metadata, movements timeline (received from PO → sold in orders),
 * block/unblock control, add movement form.
 *
 * Data: /api/inventory/lots/[id]  (existing working endpoint)
 */
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import {
  ChevronLeft, Loader2, Package, AlertTriangle, Ban, Clock, CheckCircle2,
  ArrowDownToLine, ArrowUpFromLine, RefreshCw, Sliders, CornerDownLeft,
} from 'lucide-react'

interface LotDetail {
  id: string; lotNo: string; productId: string; supplierId: string | null
  quantity: number; quantityOnHand: number
  manufacturedAt: string | null; expiresAt: string | null; receivedAt: string
  notes: string | null; isExpired: boolean; isBlocked: boolean; createdAt: string
  product: { id: string; name: string; sku: string }
  supplier: { id: string; name: string } | null
  movements: { id: string; lotId: string; type: string; quantity: number; reference: string | null; notes: string | null; createdAt: string }[]
}

const MOVEMENT_TYPES = ['receipt', 'sale', 'transfer', 'adjustment', 'return'] as const
type MovementType = typeof MOVEMENT_TYPES[number]

const MOVEMENT_ICONS: Record<MovementType, React.ReactNode> = {
  receipt:    <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" />,
  sale:       <ArrowUpFromLine className="w-3.5 h-3.5 text-blue-400" />,
  transfer:   <RefreshCw      className="w-3.5 h-3.5 text-amber-400" />,
  adjustment: <Sliders        className="w-3.5 h-3.5 text-zinc-400"  />,
  return:     <CornerDownLeft className="w-3.5 h-3.5 text-purple-400" />,
}

export default function LotTrackingDetailPage() {
  const { lotId } = useParams<{ lotId: string }>()

  const [lot,     setLot]     = useState<LotDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast,   setToast]   = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [saving,  setSaving]  = useState(false)
  const [blocking, setBlocking] = useState(false)
  const [movForm, setMovForm] = useState({ type: 'receipt' as MovementType, quantity: '', reference: '', notes: '' })

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  const loadLot = useCallback(() => {
    setLoading(true)
    fetch(`/api/inventory/lots/${lotId}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<LotDetail> })
      .then(setLot)
      .catch(() => notify('Failed to load lot', 'err'))
      .finally(() => setLoading(false))
  }, [lotId, notify])

  useEffect(() => { loadLot() }, [loadLot])

  async function handleAddMovement(e: React.FormEvent) {
    e.preventDefault()
    const qty = parseInt(movForm.quantity, 10)
    if (isNaN(qty) || qty === 0) { notify('Enter a valid non-zero quantity', 'err'); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/inventory/lots/${lotId}/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: movForm.type, quantity: qty, reference: movForm.reference.trim() || undefined, notes: movForm.notes.trim() || undefined }),
      })
      if (!res.ok) { const d = await res.json() as { error?: string }; notify(d.error ?? 'Failed', 'err'); return }
      notify('Movement recorded')
      setMovForm({ type: 'receipt', quantity: '', reference: '', notes: '' })
      loadLot()
    } catch { notify('Network error', 'err') }
    finally { setSaving(false) }
  }

  async function toggleBlock() {
    if (!lot) return
    setBlocking(true)
    try {
      const res = await fetch(`/api/inventory/lots/${lotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !lot.isBlocked }),
      })
      if (!res.ok) throw new Error()
      notify(lot.isBlocked ? 'Lot unblocked' : 'Lot blocked')
      loadLot()
    } catch { notify('Failed to update lot', 'err') }
    finally { setBlocking(false) }
  }

  function getStatus(): 'expired' | 'blocked' | 'expiring' | 'active' {
    if (!lot) return 'active'
    if (lot.isExpired) return 'expired'
    if (lot.isBlocked) return 'blocked'
    if (lot.expiresAt) {
      const exp = new Date(lot.expiresAt); const now = new Date()
      const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      if (exp >= now && exp <= thirtyDays) return 'expiring'
    }
    return 'active'
  }

  const status = getStatus()

  if (loading) return (
    <>
      <TopBar title="Lot Detail" breadcrumb={[{ label: 'Inventory', href: '/inventory' }, { label: 'Lot Tracking', href: '/inventory/lot-tracking' }]} />
      <main className="flex-1 flex items-center justify-center bg-[#0f0f1a] min-h-[100dvh]"><Loader2 className="w-6 h-6 text-zinc-600 animate-spin" /></main>
    </>
  )

  if (!lot) return (
    <>
      <TopBar title="Lot Not Found" breadcrumb={[{ label: 'Lot Tracking', href: '/inventory/lot-tracking' }]} />
      <main className="flex-1 flex items-center justify-center bg-[#0f0f1a] min-h-[100dvh]">
        <div className="text-center"><p className="text-zinc-400 mb-3">Lot not found</p><Link href="/inventory/lot-tracking" className="text-blue-400 hover:text-blue-300 text-[13px]">Back to Lots</Link></div>
      </main>
    </>
  )

  return (
    <>
      <TopBar title={lot.lotNo} breadcrumb={[{ label: 'Inventory', href: '/inventory' }, { label: 'Lot Tracking', href: '/inventory/lot-tracking' }]} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-4xl mx-auto p-6 space-y-6">

          {toast && (
            <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-[13px] font-medium shadow-xl ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{toast.msg}</div>
          )}

          <Link href="/inventory/lot-tracking" className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />Back to Lot Tracking
          </Link>

          {/* Header */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-zinc-500 shrink-0" />
                <div>
                  <div className="font-mono text-[18px] font-bold text-zinc-100">{lot.lotNo}</div>
                  <div className="text-[12px] text-zinc-500 mt-0.5">
                    <Link href={`/products/${lot.product.id}`} className="text-blue-400 hover:text-blue-300">{lot.product.name}</Link>
                    <span className="mx-1.5 text-zinc-600">·</span>
                    <span className="font-mono">{lot.product.sku}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={status} />
                <button onClick={toggleBlock} disabled={blocking || lot.isExpired} className="inline-flex items-center gap-1.5 h-7 px-3 rounded text-[12px] font-medium border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  {blocking && <Loader2 className="w-3 h-3 animate-spin" />}
                  {lot.isBlocked ? 'Unblock' : 'Block'}
                </button>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Supplier',      value: lot.supplier?.name ?? '—' },
              { label: 'Qty Received',  value: lot.quantity.toLocaleString() },
              { label: 'Qty On Hand',   value: lot.quantityOnHand.toLocaleString(), highlight: lot.quantityOnHand === 0 ? 'dim' : 'normal' },
              { label: 'Qty Consumed',  value: (lot.quantity - lot.quantityOnHand).toLocaleString() },
              { label: 'Manufactured', value: lot.manufacturedAt ? new Date(lot.manufacturedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
              { label: 'Expires',       value: lot.expiresAt ? new Date(lot.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—', highlight: status === 'expired' ? 'danger' : status === 'expiring' ? 'warning' : 'normal' },
              { label: 'Received',      value: new Date(lot.receivedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
              { label: 'Created',       value: new Date(lot.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
            ].map(card => {
              const vc = card.highlight === 'danger' ? 'text-red-400' : card.highlight === 'warning' ? 'text-amber-400' : card.highlight === 'dim' ? 'text-zinc-600' : 'text-zinc-100'
              return (
                <div key={card.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">{card.label}</div>
                  <div className={`text-[15px] font-semibold ${vc}`}>{card.value}</div>
                </div>
              )
            })}
          </div>

          {lot.notes && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Notes</div>
              <p className="text-[13px] text-zinc-300">{lot.notes}</p>
            </div>
          )}

          {/* Traceability / Movement Timeline */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-800/40">
              <RefreshCw className="w-4 h-4 text-zinc-500" />
              <span className="text-[13px] font-medium text-zinc-300">Traceability — Movement Timeline</span>
              <span className="ml-auto text-[12px] text-zinc-600">{lot.movements.length} records</span>
            </div>
            {lot.movements.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-[13px] text-zinc-600">No movements recorded yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/40">
                      {['Type', 'Quantity', 'Reference', 'Notes', 'Date'].map((h, i) => (
                        <th key={h} className={`text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4 ${i === 1 ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lot.movements.map(m => (
                      <tr key={m.id} className="border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/20 transition-colors">
                        <td className="py-2.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-[13px] text-zinc-300 capitalize">
                            {MOVEMENT_ICONS[m.type as MovementType] ?? null}
                            {m.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className={`font-semibold tabular-nums text-[13px] ${m.type === 'sale' || m.type === 'transfer' ? 'text-red-400' : 'text-emerald-400'}`}>
                            {m.type === 'sale' || m.type === 'transfer' ? '-' : '+'}{Math.abs(m.quantity)}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-[13px] font-mono text-zinc-500">{m.reference ?? <span className="text-zinc-700">—</span>}</td>
                        <td className="py-2.5 px-4 text-[13px] text-zinc-400">{m.notes ?? <span className="text-zinc-700">—</span>}</td>
                        <td className="py-2.5 px-4 text-[13px] text-zinc-400">
                          {new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          <span className="text-zinc-600 ml-1.5 text-[11px]">{new Date(m.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add Movement */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <h3 className="text-[13px] font-semibold text-zinc-200 mb-4">Add Movement</h3>
            <form onSubmit={handleAddMovement} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Type *</label>
                  <select value={movForm.type} onChange={e => setMovForm(f => ({ ...f, type: e.target.value as MovementType }))} className="w-full h-9 px-3 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500">
                    {MOVEMENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Quantity *</label>
                  <input type="number" step="1" placeholder="0" value={movForm.quantity} onChange={e => setMovForm(f => ({ ...f, quantity: e.target.value }))} className="w-full h-9 px-3 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Reference</label>
                  <input type="text" placeholder="Order #, PO #…" value={movForm.reference} onChange={e => setMovForm(f => ({ ...f, reference: e.target.value }))} className="w-full h-9 px-3 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Notes</label>
                  <input type="text" placeholder="Optional notes…" value={movForm.notes} onChange={e => setMovForm(f => ({ ...f, notes: e.target.value }))} className="w-full h-9 px-3 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <button type="submit" disabled={saving || !movForm.quantity} className="inline-flex items-center gap-2 h-9 px-5 rounded text-[13px] font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Record Movement
              </button>
            </form>
          </div>

        </div>
      </main>
    </>
  )
}

function StatusBadge({ status }: { status: 'expired' | 'blocked' | 'expiring' | 'active' }) {
  if (status === 'expired')  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400"><AlertTriangle className="w-3 h-3" />Expired</span>
  if (status === 'blocked')  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-700/60 text-zinc-400"><Ban className="w-3 h-3" />Blocked</span>
  if (status === 'expiring') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400"><Clock className="w-3 h-3" />Expiring Soon</span>
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400"><CheckCircle2 className="w-3 h-3" />Active</span>
}
