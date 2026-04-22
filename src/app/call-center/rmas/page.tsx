'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { RotateCcw, CheckCircle, Clock } from 'lucide-react'

type RMA = { id: string; rmaNumber: string; orderId: string; reason: string; disposition: string; status: string; refundAmount: number; createdAt: string; order: { orderNumber: string } | null }

const DISPOSITION_BADGE: Record<string, string> = { refund: 'bg-blue-500/20 text-blue-400', exchange: 'bg-green-500/20 text-green-400', 'store-credit': 'bg-purple-500/20 text-purple-400' }
const STATUS_BADGE: Record<string, string> = { pending: 'bg-yellow-500/20 text-yellow-400', approved: 'bg-blue-500/20 text-blue-400', received: 'bg-orange-500/20 text-orange-400', processed: 'bg-green-500/20 text-green-400' }
const FILTERS = ['all', 'pending', 'approved', 'received', 'processed']

export default function RmaManagement() {
  const [rmas, setRmas] = useState<RMA[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const url = filter === 'all' ? '/api/call-center/rmas' : `/api/call-center/rmas?status=${filter}`
      const res = await fetch(url); const data = await res.json()
      setRmas(Array.isArray(data) ? data : []); setLoading(false)
    }
    load()
  }, [filter])

  const now = new Date(); const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const pending = rmas.filter((r) => r.status === 'pending').length
  const approved = rmas.filter((r) => r.status === 'approved').length
  const processedThisMonth = rmas.filter((r) => r.status === 'processed' && new Date(r.createdAt) >= monthStart).length

  async function quickApprove(id: string) { await fetch(`/api/call-center/rmas/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved' }) }); setRmas((prev) => prev.map((r) => r.id === id ? { ...r, status: 'approved' } : r)) }
  async function quickProcess(id: string) { await fetch(`/api/call-center/rmas/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'processed' }) }); setRmas((prev) => prev.map((r) => r.id === id ? { ...r, status: 'processed' } : r)) }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3"><RotateCcw className="w-6 h-6 text-purple-400" /><div><h1 className="text-2xl font-bold text-zinc-100">RMA Management</h1><p className="text-zinc-500 text-sm">Returns, Merchandise Authorizations</p></div></div>
      <div className="grid grid-cols-3 gap-4">
        {[{ label: 'Pending RMAs', value: pending, Icon: Clock, color: 'text-yellow-400' }, { label: 'Approved', value: approved, Icon: CheckCircle, color: 'text-blue-400' }, { label: 'Processed This Month', value: processedThisMonth, Icon: CheckCircle, color: 'text-green-400' }].map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-xs text-zinc-500">{label}</span><Icon className={`w-5 h-5 ${color}`} /></div>
            <div className="text-2xl font-bold text-zinc-100">{loading ? '—' : value}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">{FILTERS.map((f) => (<button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>{f}</button>))}</div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-800">{['RMA #','Order #','Reason','Disposition','Status','Refund Amount','Date','Actions'].map((h)=>(<th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>))}</tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">Loading...</td></tr>
            : rmas.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">No RMAs found.</td></tr>
            : rmas.map((rma) => (
              <tr key={rma.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-purple-400">{rma.rmaNumber}</td>
                <td className="px-4 py-3">{rma.order ? <Link href={`/call-center/orders/${rma.orderId}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs">{rma.order.orderNumber.slice(0,12)}</Link> : '—'}</td>
                <td className="px-4 py-3 text-zinc-300 capitalize">{rma.reason}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${DISPOSITION_BADGE[rma.disposition] ?? 'bg-zinc-700 text-zinc-300'}`}>{rma.disposition}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[rma.status] ?? 'bg-zinc-700 text-zinc-300'}`}>{rma.status}</span></td>
                <td className="px-4 py-3 text-zinc-200 font-medium">${rma.refundAmount.toFixed(2)}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(rma.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 flex gap-2">
                  <Link href={`/call-center/rmas/${rma.id}`} className="text-xs text-blue-400 hover:text-blue-300">View</Link>
                  {rma.status === 'pending' && <button onClick={() => quickApprove(rma.id)} className="text-xs text-green-400 hover:text-green-300">Approve</button>}
                  {(rma.status === 'approved' || rma.status === 'received') && <button onClick={() => quickProcess(rma.id)} className="text-xs text-purple-400 hover:text-purple-300">Process</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
