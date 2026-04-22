'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Send, Plus, X } from 'lucide-react'

type Push = {
  id: string
  pushNumber: string
  name: string
  season: string | null
  totalUnits: number
  totalValue: number
  status: string
  lines: unknown[]
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  approved: 'bg-blue-500/20 text-blue-400',
  distributed: 'bg-green-500/20 text-green-400',
  complete: 'bg-emerald-500/20 text-emerald-400',
}

export default function BuyersPushPage() {
  const [pushes, setPushes] = useState<Push[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', season: '' })
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/inventory/buyers-push')
    const data = await res.json()
    setPushes(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const submit = async () => {
    setSubmitting(true)
    await fetch('/api/inventory/buyers-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setShowModal(false)
    setForm({ name: '', season: '' })
    setSubmitting(false)
    load()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Send className="w-6 h-6 text-green-400" />
          <h1 className="text-2xl font-bold text-zinc-100">Buyer&apos;s Push</h1>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Buyers Push
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Push #', 'Name', 'Season', 'Total Units', 'Total Value', 'Lines', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-zinc-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">Loading...</td></tr>
            ) : pushes.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">No push plans found</td></tr>
            ) : pushes.map(p => (
              <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="px-4 py-3 font-mono text-green-400">{p.pushNumber}</td>
                <td className="px-4 py-3 text-zinc-200 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-zinc-400">{p.season || '—'}</td>
                <td className="px-4 py-3 text-zinc-300">{p.totalUnits.toLocaleString()}</td>
                <td className="px-4 py-3 text-zinc-300">${p.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-zinc-400">{(p.lines as unknown[]).length}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[p.status] || 'bg-zinc-700 text-zinc-300'}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/inventory-ops/buyers-push/${p.id}`} className="text-blue-400 hover:text-blue-300 text-xs font-medium">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-100">New Buyer&apos;s Push</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Push Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Season</label>
                <input value={form.season} onChange={e => setForm(p => ({ ...p, season: e.target.value }))}
                  placeholder="e.g. Spring 2026"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">Cancel</button>
                <button onClick={submit} disabled={submitting || !form.name}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
                  {submitting ? 'Creating...' : 'Create Push'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
