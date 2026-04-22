'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, RotateCcw } from 'lucide-react'

type RMAItem = { productName: string; qty: number; unitPrice: number }
type RMA = { id: string; rmaNumber: string; orderId: string; reason: string; disposition: string; status: string; refundAmount: number; items: string; approvedBy: string | null; processedAt: string | null; notes: string | null; createdAt: string; order: { orderNumber: string } | null }
const STATUS_STEPS = ['pending', 'approved', 'received', 'processed']
const STATUS_BADGE: Record<string, string> = { pending: 'bg-yellow-500/20 text-yellow-400', approved: 'bg-blue-500/20 text-blue-400', received: 'bg-orange-500/20 text-orange-400', processed: 'bg-green-500/20 text-green-400' }

export default function RmaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [rma, setRma] = useState<RMA | null>(null)
  const [loading, setLoading] = useState(true)
  const [approvedBy, setApprovedBy] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => { const res = await fetch(`/api/call-center/rmas/${id}`); const data = await res.json(); setRma(data); setNotes(data.notes ?? ''); setLoading(false) }
  useEffect(() => { load() }, [id])

  async function transition(status: string) {
    setSubmitting(true)
    const body: Record<string, unknown> = { status, notes }
    if (status === 'approved') body.approvedBy = approvedBy
    await fetch(`/api/call-center/rmas/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    await load(); setSubmitting(false)
  }

  if (loading) return <div className="p-6 text-zinc-500">Loading...</div>
  if (!rma) return <div className="p-6 text-red-400">RMA not found.</div>

  const items: RMAItem[] = rma.items ? JSON.parse(rma.items) : []
  const currentStep = STATUS_STEPS.indexOf(rma.status)

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/call-center/rmas" className="text-zinc-500 hover:text-zinc-300"><ArrowLeft className="w-5 h-5" /></Link>
        <RotateCcw className="w-5 h-5 text-purple-400" />
        <div className="flex-1"><h1 className="text-xl font-bold text-zinc-100 font-mono">{rma.rmaNumber}</h1><p className="text-zinc-500 text-sm">Order: {rma.order?.orderNumber.slice(0,16) ?? '—'} · Created {new Date(rma.createdAt).toLocaleDateString()}</p></div>
        <span className={`px-3 py-1 rounded text-sm font-medium ${STATUS_BADGE[rma.status] ?? 'bg-zinc-700 text-zinc-300'}`}>{rma.status}</span>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center gap-2">
          {STATUS_STEPS.map((step, idx) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${idx <= currentStep ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-600'}`}>{idx + 1}</div>
              <span className={`text-xs capitalize flex-1 ${idx <= currentStep ? 'text-zinc-200' : 'text-zinc-600'}`}>{step}</span>
              {idx < STATUS_STEPS.length - 1 && <div className={`h-px flex-1 ${idx < currentStep ? 'bg-blue-600' : 'bg-zinc-800'}`} />}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 grid grid-cols-3 gap-4 text-sm">
            <div><div className="text-zinc-500 text-xs mb-0.5">Reason</div><div className="text-zinc-100 capitalize">{rma.reason}</div></div>
            <div><div className="text-zinc-500 text-xs mb-0.5">Disposition</div><div className="text-zinc-100 capitalize">{rma.disposition}</div></div>
            <div><div className="text-zinc-500 text-xs mb-0.5">Refund Amount</div><div className="text-zinc-100 font-bold text-lg">${rma.refundAmount.toFixed(2)}</div></div>
          </div>
          {items.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className="p-4 border-b border-zinc-800"><h2 className="font-semibold text-zinc-100">Return Items</h2></div>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-zinc-800">{['Product','Qty','Unit Price','Subtotal'].map((h)=>(<th key={h} className="text-left px-4 py-2 text-xs text-zinc-500">{h}</th>))}</tr></thead>
                <tbody>{items.map((item, idx) => (<tr key={idx} className="border-b border-zinc-800/50"><td className="px-4 py-2 text-zinc-200">{item.productName}</td><td className="px-4 py-2 text-zinc-300">{item.qty}</td><td className="px-4 py-2 text-zinc-300">${item.unitPrice.toFixed(2)}</td><td className="px-4 py-2 text-zinc-200 font-medium">${(item.qty * item.unitPrice).toFixed(2)}</td></tr>))}</tbody>
              </table>
            </div>
          )}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <label className="text-xs text-zinc-500 block mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none resize-none" />
          </div>
        </div>
        <div className="space-y-4">
          {rma.status === 'pending' && (<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"><h3 className="font-semibold text-zinc-100 text-sm mb-3">Approve RMA</h3><input value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} placeholder="Manager / approver name" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none mb-3" /><button onClick={() => transition('approved')} disabled={!approvedBy.trim() || submitting} className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Approve</button></div>)}
          {rma.status === 'approved' && (<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"><h3 className="font-semibold text-zinc-100 text-sm mb-3">Mark Received</h3><button onClick={() => transition('received')} disabled={submitting} className="w-full bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Mark as Received</button></div>)}
          {rma.status === 'received' && (<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"><h3 className="font-semibold text-zinc-100 text-sm mb-3">Process RMA</h3><button onClick={() => transition('processed')} disabled={submitting} className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Mark Processed</button></div>)}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"><h3 className="font-semibold text-zinc-100 text-sm mb-2">Linked Order</h3>{rma.order ? <Link href={`/call-center/orders/${rma.orderId}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs block">{rma.order.orderNumber.slice(0,20)}</Link> : <span className="text-zinc-600">—</span>}</div>
        </div>
      </div>
    </div>
  )
}
