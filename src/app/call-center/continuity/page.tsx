'use client'
import { useEffect, useState } from 'react'
import { RefreshCw, Pause, X, Edit3 } from 'lucide-react'

type Continuity = {
  id: string
  orderId: string | null
  customerId: string | null
  programName: string
  productName: string
  frequency: string
  price: number
  nextShipDate: string | null
  status: string
  shipCount: number
  maxShips: number | null
  createdAt: string
  order: { orderNumber: string } | null
}

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
  cancelled: 'bg-zinc-600 text-zinc-400',
}

export default function ContinuityPage() {
  const [enrollments, setEnrollments] = useState<Continuity[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editDate, setEditDate] = useState('')

  const load = async () => {
    const res = await fetch('/api/call-center/continuity')
    const data = await res.json()
    setEnrollments(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/call-center/continuity/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setEnrollments((prev) => prev.map((e) => e.id === id ? { ...e, status } : e))
  }

  async function updateNextShipDate(id: string) {
    await fetch(`/api/call-center/continuity/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nextShipDate: editDate ? new Date(editDate).toISOString() : null }),
    })
    setEnrollments((prev) => prev.map((e) => e.id === id ? { ...e, nextShipDate: editDate } : e))
    setEditId(null)
  }

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const active = enrollments.filter((e) => e.status === 'active').length
  const paused = enrollments.filter((e) => e.status === 'paused').length
  const cancelledThisMonth = enrollments.filter(
    (e) => e.status === 'cancelled' && new Date(e.createdAt) >= monthStart
  ).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <RefreshCw className="w-6 h-6 text-green-400" />
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Continuity Programs</h1>
          <p className="text-zinc-500 text-sm">Manage recurring shipment enrollments</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active', value: active, color: 'text-green-400' },
          { label: 'Paused', value: paused, color: 'text-yellow-400' },
          { label: 'Cancelled This Month', value: cancelledThisMonth, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-2">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{loading ? '—' : value}</div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Program', 'Product', 'Customer', 'Frequency', 'Price', 'Next Ship', 'Ships', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-600">Loading...</td></tr>
            ) : enrollments.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-600">No enrollments.</td></tr>
            ) : (
              enrollments.map((e) => (
                <tr key={e.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 text-zinc-200 font-medium">{e.programName}</td>
                  <td className="px-4 py-3 text-zinc-300">{e.productName}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs font-mono">
                    {e.customerId ? e.customerId.slice(0, 8) + '…' : '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 capitalize">{e.frequency}</td>
                  <td className="px-4 py-3 text-zinc-200">${e.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {editId === e.id ? (
                      <div className="flex gap-1">
                        <input
                          type="date"
                          value={editDate}
                          onChange={(ev) => setEditDate(ev.target.value)}
                          className="bg-zinc-800 border border-zinc-600 rounded px-2 py-0.5 text-xs text-zinc-100 focus:outline-none"
                        />
                        <button onClick={() => updateNextShipDate(e.id)} className="text-xs text-green-400">Save</button>
                        <button onClick={() => setEditId(null)} className="text-xs text-zinc-500">Cancel</button>
                      </div>
                    ) : (
                      <span className="text-zinc-400 text-xs">
                        {e.nextShipDate ? new Date(e.nextShipDate).toLocaleDateString() : '—'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {e.shipCount}{e.maxShips ? ` / ${e.maxShips}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[e.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2 items-center">
                    <button
                      onClick={() => { setEditId(e.id); setEditDate(e.nextShipDate?.split('T')[0] ?? '') }}
                      className="text-zinc-500 hover:text-zinc-300"
                      title="Edit next ship date"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {e.status === 'active' && (
                      <button
                        onClick={() => updateStatus(e.id, 'paused')}
                        className="text-yellow-500 hover:text-yellow-400"
                        title="Pause"
                      >
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {e.status === 'paused' && (
                      <button
                        onClick={() => updateStatus(e.id, 'active')}
                        className="text-green-500 hover:text-green-400 text-xs"
                        title="Resume"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {e.status !== 'cancelled' && (
                      <button
                        onClick={() => { if (confirm('Cancel this continuity enrollment?')) updateStatus(e.id, 'cancelled') }}
                        className="text-red-500 hover:text-red-400"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
