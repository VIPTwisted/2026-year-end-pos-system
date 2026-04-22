'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Plus, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoreJournal {
  id: string
  storeName?: string
  date: string
  status: string
  entries: { id: string }[]
  submittedBy?: string
  approvedBy?: string
  notes?: string
  createdAt: string
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  submitted: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
  approved: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
  rejected: 'bg-red-500/20 text-red-400 border border-red-500/40',
}

export default function JournalPage() {
  const [journals, setJournals] = useState<StoreJournal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [form, setForm] = useState({ storeName: '', date: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterStatus) params.set('status', filterStatus)
    if (filterDate) params.set('date', filterDate)
    const data = await fetch(`/api/store-ops/journals?${params}`).then(r => r.json())
    setJournals(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filterStatus, filterDate])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    await fetch('/api/store-ops/journals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowForm(false); setForm({ storeName: '', date: '', notes: '' }); setSubmitting(false); load()
  }

  async function submitJournal(id: string) {
    const name = prompt('Your name (submitted by):'); if (!name) return
    await fetch(`/api/store-ops/journals/${id}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ submittedBy: name }) })
    load()
  }

  async function approveJournal(id: string) {
    const name = prompt('Manager name (approved by):'); if (!name) return
    await fetch(`/api/store-ops/journals/${id}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approvedBy: name }) })
    load()
  }

  const pendingApproval = journals.filter(j => j.status === 'submitted').length

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Store Journal</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Price overrides, voids, discounts, and adjustment records
            {pendingApproval > 0 && <span className="ml-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-xs px-2 py-0.5 rounded-full">{pendingApproval} pending approval</span>}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Journal
        </button>
      </div>
      <div className="flex gap-3 mb-6">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500">
          <option value="">All Statuses</option>
          {['draft', 'submitted', 'approved', 'rejected'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" />
        {(filterStatus || filterDate) && <button onClick={() => { setFilterStatus(''); setFilterDate('') }} className="text-xs text-zinc-400 hover:text-zinc-100 border border-zinc-700 rounded-lg px-3 py-2">Clear</button>}
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-800">{['Journal #', 'Store', 'Date', 'Entries', 'Status', 'Submitted By', 'Approved By', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-zinc-500 font-medium text-xs uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-zinc-800">
            {loading && <tr><td colSpan={8} className="text-center py-8 text-zinc-500">Loading…</td></tr>}
            {!loading && journals.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-zinc-500">No journals found</td></tr>}
            {journals.map(j => (
              <tr key={j.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-zinc-400">{j.id.slice(-8).toUpperCase()}</td>
                <td className="px-4 py-3 text-zinc-200">{j.storeName || '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{new Date(j.date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-zinc-300">{j.entries?.length ?? 0}</td>
                <td className="px-4 py-3"><span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_BADGE[j.status] ?? 'bg-zinc-700 text-zinc-300')}>{j.status}</span></td>
                <td className="px-4 py-3 text-zinc-400">{j.submittedBy || '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{j.approvedBy || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {j.status === 'draft' && <button onClick={() => submitJournal(j.id)} className="text-xs text-yellow-400 hover:text-yellow-300 border border-yellow-800 rounded px-2 py-1">Submit</button>}
                    {j.status === 'submitted' && <button onClick={() => approveJournal(j.id)} className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-800 rounded px-2 py-1">Approve</button>}
                    <Link href={`/store-ops/journal/${j.id}`} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">View <ChevronRight className="w-3 h-3" /></Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-100">New Store Journal</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={create} className="space-y-4">
              <div><label className="text-xs text-zinc-400 block mb-1">Store Name</label><input value={form.storeName} onChange={e => setForm(p => ({ ...p, storeName: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="Main Street Store" /></div>
              <div><label className="text-xs text-zinc-400 block mb-1">Date</label><input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" /></div>
              <div><label className="text-xs text-zinc-400 block mb-1">Notes</label><textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 resize-none" placeholder="Optional notes…" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-zinc-700 rounded-lg py-2 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50">{submitting ? 'Creating…' : 'Create Journal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
