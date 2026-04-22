'use client'

import { useState, useEffect } from 'react'
import { Plus, Zap, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Quote = {
  id: string
  quoteNumber: string
  accountName: string | null
  status: string
  totalAmount: number
  expirationDate: string | null
  createdAt: string
  opportunity: { name: string } | null
}

const statusColor: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  active: 'bg-blue-500/20 text-blue-400',
  won: 'bg-emerald-500/20 text-emerald-400',
  closed: 'bg-red-500/20 text-red-400',
}

const TABS = ['all', 'draft', 'active', 'won']

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [tab, setTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ accountName: '', notes: '', expirationDate: '' })

  async function load(status = 'all') {
    setLoading(true)
    const res = await fetch(`/api/sales/quotes?status=${status}`)
    setQuotes(await res.json())
    setLoading(false)
  }

  useEffect(() => { load(tab) }, [tab])

  async function create() {
    await fetch('/api/sales/quotes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowModal(false)
    setForm({ accountName: '', notes: '', expirationDate: '' })
    load(tab)
  }

  async function activate(id: string) {
    await fetch(`/api/sales/quotes/${id}/activate`, { method: 'POST' })
    load(tab)
  }

  async function createOrder(id: string) {
    await fetch(`/api/sales/quotes/${id}/create-order`, { method: 'POST' })
    load(tab)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Quotes</h1>
          <p className="text-sm text-zinc-400 mt-1">Sales quotes and proposals</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-md transition-colors">
          <Plus className="w-4 h-4" /> New Quote
        </button>
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-4 py-2 text-sm capitalize transition-colors', tab === t ? 'text-white border-b-2 border-blue-500' : 'text-zinc-500 hover:text-zinc-300')}>
            {t}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Quote #</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Account</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Opportunity</th>
              <th className="text-right px-4 py-3 text-zinc-500 font-medium">Amount</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Expires</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-600">Loading...</td></tr>}
            {!loading && quotes.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-600">No quotes found</td></tr>}
            {quotes.map((q) => (
              <tr key={q.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/sales/quotes/${q.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs">{q.quoteNumber.slice(-10)}</Link>
                </td>
                <td className="px-4 py-3 text-zinc-300">{q.accountName || '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{q.opportunity?.name || '—'}</td>
                <td className="px-4 py-3 text-right text-emerald-400 font-mono">{fmt(q.totalAmount)}</td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{q.expirationDate ? new Date(q.expirationDate).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded text-xs capitalize', statusColor[q.status] || 'bg-zinc-700 text-zinc-300')}>{q.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {q.status === 'draft' && (
                      <button onClick={() => activate(q.id)} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        <Zap className="w-3.5 h-3.5" /> Activate
                      </button>
                    )}
                    {q.status === 'active' && (
                      <button onClick={() => createOrder(q.id)} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                        <ShoppingCart className="w-3.5 h-3.5" /> Create Order
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100">New Quote</h2>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Account Name</label>
              <input value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Expiration Date</label>
              <input type="date" value={form.expirationDate} onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 resize-none" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 px-3 py-2 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">Cancel</button>
              <button onClick={create} className="flex-1 px-3 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
