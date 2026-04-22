'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, Clock, RotateCcw } from 'lucide-react'

type OrderLine = { id: string; productName: string; sku: string | null; qty: number; unitPrice: number; discount: number; lineTotal: number; overrideBy: string | null; overrideReason: string | null }
type Hold = { id: string; holdType: string; reason: string; placedBy: string | null; releasedBy: string | null; releasedAt: string | null; status: string; notes: string | null; createdAt: string }
type RMA = { id: string; rmaNumber: string; reason: string; disposition: string; status: string; refundAmount: number; createdAt: string }
type Continuity = { id: string; programName: string; productName: string; frequency: string; price: number; status: string; shipCount: number }
type Order = { id: string; orderNumber: string; status: string; channel: string; agentName: string | null; customerId: string | null; subtotal: number; tax: number; shipping: number; total: number; paymentMethod: string | null; paymentRef: string | null; notes: string | null; fraudScore: number; fraudFlags: string | null; createdAt: string; lines: OrderLine[]; holds: Hold[]; rmas: RMA[]; continuityEnrollments: Continuity[] }

const STATUS_BADGE: Record<string, string> = { draft: 'bg-zinc-700 text-zinc-300', submitted: 'bg-blue-500/20 text-blue-400', 'on-hold': 'bg-orange-500/20 text-orange-400', 'fraud-hold': 'bg-red-500/20 text-red-400', cancelled: 'bg-zinc-600 text-zinc-400', fulfilled: 'bg-green-500/20 text-green-400' }

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [showHoldModal, setShowHoldModal] = useState(false)
  const [showRmaModal, setShowRmaModal] = useState(false)
  const [showReleaseModal, setShowReleaseModal] = useState(false)
  const [holdType, setHoldType] = useState('manager')
  const [holdReason, setHoldReason] = useState('')
  const [releasedBy, setReleasedBy] = useState('')
  const [rmaReason, setRmaReason] = useState('damaged')
  const [rmaDisposition, setRmaDisposition] = useState('refund')
  const [rmaAmount, setRmaAmount] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => { const res = await fetch(`/api/call-center/orders/${id}`); setOrder(await res.json()); setLoading(false) }
  useEffect(() => { load() }, [id])

  async function submitOrder() { setSubmitting(true); await fetch(`/api/call-center/orders/${id}/submit`, { method: 'POST' }); await load(); setSubmitting(false) }
  async function cancelOrder() { if (!confirm('Cancel this order?')) return; await fetch(`/api/call-center/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'cancelled' }) }); await load() }
  async function addHold() { setSubmitting(true); await fetch(`/api/call-center/orders/${id}/hold`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ holdType, reason: holdReason, placedBy: order?.agentName }) }); await load(); setShowHoldModal(false); setHoldReason(''); setSubmitting(false) }
  async function releaseHold() { setSubmitting(true); await fetch(`/api/call-center/orders/${id}/release`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ releasedBy }) }); await load(); setShowReleaseModal(false); setReleasedBy(''); setSubmitting(false) }
  async function createRma() {
    setSubmitting(true)
    const res = await fetch(`/api/call-center/orders/${id}/rma`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: rmaReason, disposition: rmaDisposition, refundAmount: rmaAmount }) })
    const rma = await res.json(); await load(); setShowRmaModal(false); setSubmitting(false); router.push(`/call-center/rmas/${rma.id}`)
  }

  if (loading) return <div className="p-6 text-zinc-500">Loading...</div>
  if (!order) return <div className="p-6 text-red-400">Order not found.</div>

  const parsedFlags: string[] = order.fraudFlags ? JSON.parse(order.fraudFlags) : []
  const fraudBar = Math.min(order.fraudScore, 100)
  const fraudColor = order.fraudScore >= 50 ? 'bg-red-500' : order.fraudScore >= 25 ? 'bg-yellow-500' : 'bg-green-500'
  const activeHolds = order.holds.filter((h) => h.status === 'active')

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/call-center" className="text-zinc-500 hover:text-zinc-300"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-zinc-100 font-mono">{order.orderNumber.slice(0, 20)}</h1>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[order.status] ?? 'bg-zinc-700 text-zinc-300'}`}>{order.status}</span>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{order.channel}</span>
          </div>
          <div className="text-sm text-zinc-500 mt-0.5">Agent: {order.agentName ?? '—'} · {new Date(order.createdAt).toLocaleString()}</div>
        </div>
        <div className="flex gap-2">
          {activeHolds.length > 0 && <button onClick={() => setShowReleaseModal(true)} className="bg-green-600/80 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm">Release Hold</button>}
          <button onClick={() => setShowHoldModal(true)} className="bg-orange-600/80 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm">Add Hold</button>
          <button onClick={() => setShowRmaModal(true)} className="bg-purple-600/80 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm">Create RMA</button>
          {order.status === 'draft' && <button onClick={submitOrder} disabled={submitting} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50">Submit</button>}
          <button onClick={cancelOrder} className="bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-3 py-1.5 rounded-lg text-sm">Cancel</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="p-4 border-b border-zinc-800"><h2 className="font-semibold text-zinc-100">Order Lines</h2></div>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-zinc-800">{['Product','SKU','Qty','Unit Price','Discount','Line Total'].map((h)=>(<th key={h} className="text-left px-4 py-2 text-xs text-zinc-500">{h}</th>))}</tr></thead>
              <tbody>
                {order.lines.map((line) => (
                  <tr key={line.id} className={`border-b border-zinc-800/50 ${line.overrideBy ? 'bg-red-950/20' : ''}`}>
                    <td className="px-4 py-2 text-zinc-200">{line.overrideBy && <span className="text-red-400 mr-1">*</span>}{line.productName}</td>
                    <td className="px-4 py-2 text-zinc-500 font-mono text-xs">{line.sku ?? '—'}</td>
                    <td className="px-4 py-2 text-zinc-300">{line.qty}</td>
                    <td className="px-4 py-2 text-zinc-300">${line.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-2 text-zinc-300">{line.discount}%</td>
                    <td className="px-4 py-2 text-zinc-200 font-medium">${line.lineTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 border-t border-zinc-800 flex justify-end gap-8 text-sm">
              <div className="text-zinc-500">Subtotal <span className="text-zinc-200 ml-2">${order.subtotal.toFixed(2)}</span></div>
              <div className="text-zinc-500">Tax <span className="text-zinc-200 ml-2">${order.tax.toFixed(2)}</span></div>
              <div className="text-zinc-500">Shipping <span className="text-zinc-200 ml-2">${order.shipping.toFixed(2)}</span></div>
              <div className="text-zinc-100 font-bold">TOTAL <span className="ml-2">${order.total.toFixed(2)}</span></div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="p-4 border-b border-zinc-800"><h2 className="font-semibold text-zinc-100">Hold History</h2></div>
            {order.holds.length === 0 ? <p className="p-4 text-sm text-zinc-600">No holds.</p> : (
              <div className="p-4 space-y-3">
                {order.holds.map((hold) => (
                  <div key={hold.id} className={`border rounded-lg p-3 ${hold.status === 'active' ? 'border-orange-500/40 bg-orange-950/10' : 'border-zinc-800 bg-zinc-800/20'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {hold.status === 'active' ? <AlertTriangle className="w-4 h-4 text-orange-400" /> : <CheckCircle className="w-4 h-4 text-green-400" />}
                      <span className="font-medium text-zinc-200 text-sm">{hold.holdType} hold</span>
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded ${hold.status === 'active' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>{hold.status}</span>
                    </div>
                    <p className="text-xs text-zinc-400">{hold.reason}</p>
                    <div className="mt-1 text-xs text-zinc-600 flex gap-4">
                      <span><Clock className="w-3 h-3 inline mr-1" />{new Date(hold.createdAt).toLocaleString()}</span>
                      <span>By: {hold.placedBy ?? '—'}</span>
                      {hold.releasedBy && <span>Released by: {hold.releasedBy}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className={`w-4 h-4 ${order.fraudScore >= 50 ? 'text-red-400' : 'text-green-400'}`} />
              <h2 className="font-semibold text-zinc-100 text-sm">Fraud Analysis</h2>
              <span className={`ml-auto font-bold ${order.fraudScore >= 50 ? 'text-red-400' : order.fraudScore >= 25 ? 'text-yellow-400' : 'text-green-400'}`}>{order.fraudScore}</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 mb-3"><div className={`h-2 rounded-full ${fraudColor}`} style={{ width: `${fraudBar}%` }} /></div>
            {parsedFlags.map((flag) => (<span key={flag} className="text-xs text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {flag}</span>))}
            {parsedFlags.length === 0 && <p className="text-xs text-zinc-600">No flags.</p>}
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h2 className="font-semibold text-zinc-100 text-sm mb-3">Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-zinc-500">Method</span><span className="text-zinc-300">{order.paymentMethod ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Reference</span><span className="text-zinc-300 font-mono text-xs">{order.paymentRef ?? '—'}</span></div>
            </div>
          </div>
          {order.rmas.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h2 className="font-semibold text-zinc-100 text-sm mb-3">RMAs</h2>
              <div className="space-y-2">
                {order.rmas.map((rma) => (
                  <Link key={rma.id} href={`/call-center/rmas/${rma.id}`} className="block bg-zinc-800 rounded-lg p-2 hover:bg-zinc-700 transition-colors">
                    <div className="font-mono text-xs text-blue-400">{rma.rmaNumber}</div>
                    <div className="text-xs text-zinc-400">{rma.reason} · ${rma.refundAmount.toFixed(2)}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {showHoldModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-zinc-100 mb-4">Add Hold</h3>
            <select value={holdType} onChange={(e) => setHoldType(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none mb-3">
              {['fraud','payment','inventory','manager','credit'].map((t)=><option key={t} value={t}>{t}</option>)}
            </select>
            <textarea value={holdReason} onChange={(e) => setHoldReason(e.target.value)} rows={3} placeholder="Reason..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowHoldModal(false)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-4 py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={addHold} disabled={!holdReason.trim() || submitting} className="flex-1 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Place Hold</button>
            </div>
          </div>
        </div>
      )}
      {showReleaseModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-zinc-100 mb-4">Release Hold</h3>
            <input value={releasedBy} onChange={(e) => setReleasedBy(e.target.value)} placeholder="Your name / manager ID" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowReleaseModal(false)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-4 py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={releaseHold} disabled={!releasedBy.trim() || submitting} className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Release</button>
            </div>
          </div>
        </div>
      )}
      {showRmaModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-zinc-100 mb-4 flex items-center gap-2"><RotateCcw className="w-4 h-4 text-purple-400" /> Create RMA</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="text-xs text-zinc-500 block mb-1">Reason</label><select value={rmaReason} onChange={(e) => setRmaReason(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none">{['damaged','wrong-item','changed-mind','defective'].map((r)=><option key={r} value={r}>{r}</option>)}</select></div>
              <div><label className="text-xs text-zinc-500 block mb-1">Disposition</label><select value={rmaDisposition} onChange={(e) => setRmaDisposition(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none">{['refund','exchange','store-credit'].map((d)=><option key={d} value={d}>{d}</option>)}</select></div>
            </div>
            <div className="mb-4"><label className="text-xs text-zinc-500 block mb-1">Refund Amount</label><input type="number" min={0} step={0.01} value={rmaAmount} onChange={(e) => setRmaAmount(parseFloat(e.target.value))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none" /></div>
            <div className="flex gap-3">
              <button onClick={() => setShowRmaModal(false)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-4 py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={createRma} disabled={submitting} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Create RMA</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
