'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { X, Plus, Wrench, ChevronRight } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
}

interface Technician {
  id: string
  firstName: string
  lastName: string
  position: string
}

interface ProductRef {
  id: string
  name: string
  sku: string
}

interface Part {
  id: string
  partName: string
  partNo: string | null
  quantity: number
  unitCost: string
  totalCost: string
  product: ProductRef | null
}

interface ServiceOrder {
  id: string
  orderNo: string
  status: string
  priority: string
  deviceType: string | null
  deviceSerial: string | null
  issueReported: string
  diagnosis: string | null
  resolution: string | null
  laborCost: string
  partsCost: string
  totalCost: string
  depositPaid: string
  estimatedDays: number | null
  intakeAt: string
  completedAt: string | null
  notes: string | null
  customer: Customer | null
  technician: Technician | null
  parts: Part[]
}

interface ProductSearch {
  id: string
  name: string
  sku: string
  costPrice: number
}

interface Toast {
  msg: string
  type: 'ok' | 'err'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  intake:    'bg-zinc-700/60 text-zinc-300',
  diagnosed: 'bg-blue-500/15 text-blue-400',
  in_repair: 'bg-amber-500/15 text-amber-400',
  ready:     'bg-emerald-500/15 text-emerald-400',
  completed: 'bg-zinc-800/80 text-zinc-500',
  cancelled: 'bg-red-500/15 text-red-400',
}

const PRIORITY_BADGE: Record<string, string> = {
  low:    'bg-zinc-700/40 text-zinc-500',
  normal: 'bg-blue-500/10 text-blue-400',
  high:   'bg-amber-500/15 text-amber-400',
  urgent: 'bg-red-500/15 text-red-400',
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    intake: 'Intake', diagnosed: 'Diagnosed', in_repair: 'In Repair',
    ready: 'Ready', completed: 'Completed', cancelled: 'Cancelled',
  }
  return map[s] ?? s
}

const STATUS_TRANSITIONS: Record<string, { label: string; next: string }> = {
  intake:    { label: 'Start Diagnosis', next: 'diagnosed' },
  diagnosed: { label: 'Begin Repair',   next: 'in_repair' },
  in_repair: { label: 'Mark Ready',     next: 'ready' },
  ready:     { label: 'Complete Order', next: 'completed' },
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ServiceOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [order, setOrder] = useState<ServiceOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<Toast | null>(null)

  // Transition modal
  const [transModal, setTransModal] = useState<{ next: string; label: string } | null>(null)
  const [diagnosis, setDiagnosis] = useState('')
  const [resolution, setResolution] = useState('')
  const [laborCostInput, setLaborCostInput] = useState('')
  const [transacting, setTransacting] = useState(false)

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  // Add part form
  const [showAddPart, setShowAddPart] = useState(false)
  const [partProductQuery, setPartProductQuery] = useState('')
  const [partProductResults, setPartProductResults] = useState<ProductSearch[]>([])
  const [selectedProduct, setSelectedProduct] = useState<ProductSearch | null>(null)
  const [partName, setPartName] = useState('')
  const [partNo, setPartNo] = useState('')
  const [partQty, setPartQty] = useState('1')
  const [partCost, setPartCost] = useState('')
  const [addingPart, setAddingPart] = useState(false)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  async function loadOrder() {
    try {
      const res = await fetch(`/api/service-orders/${id}`)
      if (!res.ok) throw new Error('Not found')
      const data: ServiceOrder = await res.json()
      setOrder(data)
    } catch {
      notify('Failed to load service order', 'err')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrder() }, [id])

  // Product search for add part
  useEffect(() => {
    if (!partProductQuery.trim()) { setPartProductResults([]); return }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(partProductQuery)}&limit=6`)
        const d = await res.json()
        setPartProductResults(d.products ?? [])
      } catch { /* ignore */ }
    }, 250)
    return () => clearTimeout(t)
  }, [partProductQuery])

  // ─── Transition handler ───────────────────────────────────────────────────

  async function handleTransition() {
    if (!transModal || !order) return
    setTransacting(true)
    try {
      const payload: Record<string, unknown> = { status: transModal.next }
      if (diagnosis.trim()) payload.diagnosis = diagnosis.trim()
      if (resolution.trim()) payload.resolution = resolution.trim()
      if (laborCostInput) payload.laborCost = parseFloat(laborCostInput)

      const res = await fetch(`/api/service-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to update')
      const updated: ServiceOrder = await res.json()
      setOrder(updated)
      setTransModal(null)
      setDiagnosis('')
      setResolution('')
      setLaborCostInput('')
      notify(`Status → ${statusLabel(transModal.next)}`)
    } catch {
      notify('Failed to update status', 'err')
    } finally {
      setTransacting(false)
    }
  }

  async function handleCancel() {
    setCancelling(true)
    try {
      const res = await fetch(`/api/service-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      if (!res.ok) throw new Error('Failed')
      const updated: ServiceOrder = await res.json()
      setOrder(updated)
      setShowCancelModal(false)
      notify('Order cancelled')
    } catch {
      notify('Failed to cancel', 'err')
    } finally {
      setCancelling(false)
    }
  }

  async function handleAddPart(e: React.FormEvent) {
    e.preventDefault()
    if (!partName.trim()) { notify('Part name is required', 'err'); return }
    setAddingPart(true)
    try {
      const res = await fetch(`/api/service-orders/${id}/parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct?.id ?? null,
          partName: partName.trim(),
          partNo: partNo.trim() || null,
          quantity: parseInt(partQty) || 1,
          unitCost: parseFloat(partCost) || 0,
        }),
      })
      if (!res.ok) throw new Error('Failed to add part')
      await loadOrder()
      setShowAddPart(false)
      setPartName('')
      setPartNo('')
      setPartQty('1')
      setPartCost('')
      setSelectedProduct(null)
      setPartProductQuery('')
      notify('Part added')
    } catch {
      notify('Failed to add part', 'err')
    } finally {
      setAddingPart(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Service order not found.</div>
      </div>
    )
  }

  const transition = STATUS_TRANSITIONS[order.status]
  const canCancel = order.status !== 'completed' && order.status !== 'cancelled'

  const laborCost = parseFloat(order.laborCost)
  const partsCost = parseFloat(order.partsCost)
  const totalCost = parseFloat(order.totalCost)
  const depositPaid = parseFloat(order.depositPaid)
  const balanceDue = totalCost - depositPaid

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] flex flex-col">
      <TopBar
        title={order.orderNo}
        breadcrumb={[
          { label: 'Dashboard', href: '/' },
          { label: 'Service Orders', href: '/service-orders' },
        ]}
        showBack
      />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded text-sm font-medium shadow-lg ${
          toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        {/* Header Row */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xl font-bold text-zinc-100">{order.orderNo}</span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded text-[12px] font-semibold ${STATUS_BADGE[order.status]}`}>
            {statusLabel(order.status)}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded text-[12px] font-semibold ${PRIORITY_BADGE[order.priority]}`}>
            {order.priority}
          </span>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            {transition && (
              <button
                onClick={() => setTransModal({ next: transition.next, label: transition.label })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                {transition.label}
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-red-900/40 text-zinc-400 hover:text-red-400 text-[12px] font-medium rounded border border-zinc-700 hover:border-red-700/50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel Order
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info grid */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">Order Details</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Customer</p>
                  {order.customer ? (
                    <Link href={`/customers/${order.customer.id}`} className="text-sm text-blue-400 hover:text-blue-300">
                      {order.customer.firstName} {order.customer.lastName}
                    </Link>
                  ) : (
                    <p className="text-sm text-zinc-500">Walk-in</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Technician</p>
                  <p className="text-sm text-zinc-200">
                    {order.technician ? `${order.technician.firstName} ${order.technician.lastName}` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Device</p>
                  <p className="text-sm text-zinc-200">{order.deviceType || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Serial / IMEI</p>
                  <p className="text-sm font-mono text-zinc-300">{order.deviceSerial || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Intake Date</p>
                  <p className="text-sm text-zinc-200">{fmtDate(order.intakeAt)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Completed</p>
                  <p className="text-sm text-zinc-200">{fmtDate(order.completedAt)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Est. Days</p>
                  <p className="text-sm text-zinc-200">{order.estimatedDays ?? '—'}</p>
                </div>
              </div>
            </div>

            {/* Issue / Diagnosis / Resolution */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Issue Tracking</h2>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Issue Reported</p>
                <p className="text-sm text-zinc-200 leading-relaxed">{order.issueReported}</p>
              </div>
              {order.diagnosis && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Diagnosis</p>
                  <p className="text-sm text-zinc-200 leading-relaxed">{order.diagnosis}</p>
                </div>
              )}
              {order.resolution && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Resolution</p>
                  <p className="text-sm text-zinc-200 leading-relaxed">{order.resolution}</p>
                </div>
              )}
              {order.notes && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Notes</p>
                  <p className="text-sm text-zinc-400 leading-relaxed">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Parts table */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center justify-between">
                <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Parts Used</h2>
                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <button
                    onClick={() => setShowAddPart(v => !v)}
                    className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Part
                  </button>
                )}
              </div>

              {/* Add part form */}
              {showAddPart && (
                <form onSubmit={handleAddPart} className="px-5 py-4 border-b border-zinc-800/50 bg-zinc-900/30">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                        Product Search (optional)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search product catalog..."
                          value={partProductQuery}
                          onChange={e => setPartProductQuery(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 outline-none"
                        />
                        {partProductResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-0.5 bg-[#16213e] border border-zinc-700 rounded shadow-xl z-50">
                            {partProductResults.map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setSelectedProduct(p)
                                  setPartName(p.name)
                                  setPartCost(String(p.costPrice))
                                  setPartProductQuery(p.name)
                                  setPartProductResults([])
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-zinc-800/60 text-sm text-zinc-200 border-b border-zinc-800/40 last:border-0"
                              >
                                <span>{p.name}</span>
                                <span className="ml-2 text-zinc-500 font-mono text-xs">{p.sku}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                        Part Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Screen Assembly"
                        value={partName}
                        onChange={e => setPartName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                        Part No.
                      </label>
                      <input
                        type="text"
                        placeholder="Optional"
                        value={partNo}
                        onChange={e => setPartNo(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={partQty}
                        onChange={e => setPartQty(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Unit Cost ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={partCost}
                        onChange={e => setPartCost(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={addingPart}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded transition-colors"
                    >
                      {addingPart ? 'Adding...' : 'Add Part'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddPart(false)}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Part</th>
                    <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Part No.</th>
                    <th className="px-5 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Qty</th>
                    <th className="px-5 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Unit</th>
                    <th className="px-5 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.parts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-6 text-center text-sm text-zinc-600">No parts added yet</td>
                    </tr>
                  )}
                  {order.parts.map(p => (
                    <tr key={p.id} className="border-b border-zinc-800/40">
                      <td className="px-5 py-2.5 text-sm text-zinc-200">{p.partName}</td>
                      <td className="px-5 py-2.5 text-sm font-mono text-zinc-500">{p.partNo || '—'}</td>
                      <td className="px-5 py-2.5 text-right text-sm text-zinc-300">{p.quantity}</td>
                      <td className="px-5 py-2.5 text-right text-sm tabular-nums text-zinc-300">
                        {formatCurrency(parseFloat(p.unitCost))}
                      </td>
                      <td className="px-5 py-2.5 text-right text-sm font-semibold tabular-nums text-zinc-100">
                        {formatCurrency(parseFloat(p.totalCost))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column — cost summary */}
          <div className="space-y-4">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">Cost Summary</h2>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                    <Wrench className="w-3.5 h-3.5" /> Labor
                  </div>
                  <span className="font-mono font-semibold text-sm text-zinc-100 tabular-nums">{formatCurrency(laborCost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Parts</span>
                  <span className="font-mono font-semibold text-sm text-zinc-100 tabular-nums">{formatCurrency(partsCost)}</span>
                </div>
                <div className="border-t border-zinc-800 pt-2.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-200">Total</span>
                  <span className="font-mono font-bold text-base text-zinc-100 tabular-nums">{formatCurrency(totalCost)}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-sm">Deposit Paid</span>
                  <span className="font-mono text-sm tabular-nums text-emerald-400">-{formatCurrency(depositPaid)}</span>
                </div>
                <div className="border-t border-zinc-800 pt-2.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-200">Balance Due</span>
                  <span className={`font-mono font-bold text-base tabular-nums ${balanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {formatCurrency(Math.max(0, balanceDue))}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer contact quick info */}
            {order.customer && (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Customer</h2>
                <p className="text-sm font-medium text-zinc-100 mb-1">
                  {order.customer.firstName} {order.customer.lastName}
                </p>
                {order.customer.phone && (
                  <p className="text-xs text-zinc-400">{order.customer.phone}</p>
                )}
                {order.customer.email && (
                  <p className="text-xs text-zinc-400">{order.customer.email}</p>
                )}
                <Link
                  href={`/customers/${order.customer.id}`}
                  className="mt-2 inline-block text-xs text-blue-400 hover:text-blue-300"
                >
                  View profile →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Transition Modal ───────────────────────────────────────────────── */}
      {transModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#16213e] border border-zinc-700 rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-zinc-100">{transModal.label}</h3>
              <button onClick={() => setTransModal(null)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            {transModal.next === 'diagnosed' && (
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Diagnosis</label>
                <textarea
                  rows={3}
                  placeholder="Describe the diagnosis..."
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 outline-none resize-none"
                />
              </div>
            )}

            {transModal.next === 'completed' && (
              <>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Resolution</label>
                  <textarea
                    rows={3}
                    placeholder="Describe what was done..."
                    value={resolution}
                    onChange={e => setResolution(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Final Labor Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={String(parseFloat(order.laborCost))}
                    value={laborCostInput}
                    onChange={e => setLaborCostInput(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 outline-none"
                  />
                </div>
              </>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setTransModal(null)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTransition}
                disabled={transacting}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors"
              >
                {transacting ? 'Saving...' : `Confirm — ${transModal.label}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Cancel Modal ──────────────────────────────────────────────────── */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#16213e] border border-zinc-700 rounded-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-base font-semibold text-zinc-100">Cancel Service Order?</h3>
            <p className="text-sm text-zinc-400">
              This will mark <span className="font-semibold text-zinc-200">{order.orderNo}</span> as cancelled.
              This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
