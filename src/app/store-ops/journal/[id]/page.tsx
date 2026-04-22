'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X, CheckCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoreJournalEntry {
  id: string; entryType: string; amount: number; qty: number; description: string
  authorName?: string; referenceId?: string; requiresApproval: boolean; approved: boolean; approvedBy?: string; createdAt: string
}
interface StoreJournal {
  id: string; storeName?: string; date: string; status: string; notes?: string; submittedBy?: string; approvedBy?: string; entries: StoreJournalEntry[]
}
const STATUS_BADGE: Record<string, string> = { draft: 'bg-zinc-700 text-zinc-300', submitted: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40', approved: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40', rejected: 'bg-red-500/20 text-red-400 border border-red-500/40' }
const ENTRY_TYPE_BADGE: Record<string, string> = { 'price-override': 'bg-yellow-500/20 text-yellow-400', void: 'bg-red-500/20 text-red-400', discount: 'bg-orange-500/20 text-orange-400', refund: 'bg-blue-500/20 text-blue-400', 'cash-adjustment': 'bg-purple-500/20 text-purple-400', 'inventory-adjustment': 'bg-emerald-500/20 text-emerald-400', 'tax-override': 'bg-cyan-500/20 text-cyan-400', 'manager-override': 'bg-pink-500/20 text-pink-400' }
const ENTRY_TYPES = ['price-override', 'refund', 'void', 'discount', 'cash-adjustment', 'inventory-adjustment', 'tax-override', 'manager-override']

export default function JournalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [journal, setJournal] = useState<StoreJournal | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ entryType: 'price-override', description: '', amount: '', qty: '1', authorName: '', referenceId: '', requiresApproval: false })

  async function load() { const data = await fetch(`/api/store-ops/journals/${id}`).then(r => r.json()); setJournal(data); setLoading(false) }
  useEffect(() => { load() }, [id])

  async function addEntry(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true)
    await fetch(`/api/store-ops/journals/${id}/entries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, amount: parseFloat(form.amount) || 0, qty: parseInt(form.qty) || 1 }) })
    setShowAddEntry(false); setForm({ entryType: 'price-override', description: '', amount: '', qty: '1', authorName: '', referenceId: '', requiresApproval: false }); setSubmitting(false); load()
  }

  async function submitJournal() { const name = prompt('Your name:'); if (!name) return; await fetch(`/api/store-ops/journals/${id}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ submittedBy: name }) }); load() }
  async function approveJournal() { const name = prompt('Manager name:'); if (!name) return; await fetch(`/api/store-ops/journals/${id}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approvedBy: name }) }); load() }

  if (loading) return <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center text-zinc-500">Loading…</div>
  if (!journal) return <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center text-zinc-500">Not found</div>

  const pendingEntries = journal.entries.filter(e => e.requiresApproval && !e.approved)

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-zinc-500 hover:text-zinc-300"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-zinc-100">Journal #{journal.id.slice(-8).toUpperCase()}</h1>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_BADGE[journal.status])}>{journal.status}</span>
            </div>
            <p className="text-zinc-500 text-sm mt-0.5">{journal.storeName} · {new Date(journal.date).toLocaleDateString()}{journal.submittedBy && ` · Submitted by ${journal.submittedBy}`}{journal.approvedBy && ` · Approved by ${journal.approvedBy}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {journal.status === 'draft' && <button onClick={() => setShowAddEntry(true)} className="flex items-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 px-3 py-2 rounded-lg text-sm"><Plus className="w-4 h-4" /> Add Entry</button>}
          {journal.status === 'draft' && <button onClick={submitJournal} className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Submit for Approval</button>}
          {journal.status === 'submitted' && <button onClick={approveJournal} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Approve Journal</button>}
        </div>
      </div>
      {pendingEntries.length > 0 && <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" /><span className="text-yellow-400 text-sm">{pendingEntries.length} entr{pendingEntries.length === 1 ? 'y requires' : 'ies require'} approval</span></div>}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800"><h2 className="font-semibold text-zinc-200">Journal Entries ({journal.entries.length})</h2></div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-800">{['Type', 'Description', 'Qty', 'Amount', 'Author', 'Reference', 'Approval', ''].map(h => <th key={h} className="text-left px-4 py-3 text-zinc-500 font-medium text-xs uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-zinc-800">
            {journal.entries.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-zinc-500">No entries yet</td></tr>}
            {journal.entries.map(entry => (
              <tr key={entry.id} className={cn('hover:bg-zinc-800/40 transition-colors', entry.requiresApproval && !entry.approved ? 'border-l-2 border-yellow-500' : '')}>
                <td className="px-4 py-3"><span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', ENTRY_TYPE_BADGE[entry.entryType] ?? 'bg-zinc-700 text-zinc-400')}>{entry.entryType}</span></td>
                <td className="px-4 py-3 text-zinc-200 max-w-xs truncate">{entry.description}</td>
                <td className="px-4 py-3 text-zinc-400">{entry.qty}</td>
                <td className="px-4 py-3 text-zinc-200 font-mono">{entry.amount < 0 ? '-' : ''}${Math.abs(entry.amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-zinc-400">{entry.authorName || '—'}</td>
                <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{entry.referenceId || '—'}</td>
                <td className="px-4 py-3">{entry.requiresApproval ? entry.approved ? <div className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle className="w-3 h-3" />{entry.approvedBy}</div> : <span className="text-yellow-400 text-xs">Pending</span> : <span className="text-zinc-600 text-xs">—</span>}</td>
                <td className="px-4 py-3 text-xs text-zinc-600">{new Date(entry.createdAt).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAddEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-zinc-100">Add Journal Entry</h2><button onClick={() => setShowAddEntry(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button></div>
            <form onSubmit={addEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-zinc-400 block mb-1">Entry Type</label><select value={form.entryType} onChange={e => setForm(p => ({ ...p, entryType: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500">{ENTRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className="text-xs text-zinc-400 block mb-1">Author Name</label><input value={form.authorName} onChange={e => setForm(p => ({ ...p, authorName: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="Staff name" /></div>
              </div>
              <div><label className="text-xs text-zinc-400 block mb-1">Description *</label><input required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="Describe the entry…" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-xs text-zinc-400 block mb-1">Amount ($)</label><input type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="0.00" /></div>
                <div><label className="text-xs text-zinc-400 block mb-1">Qty</label><input type="number" min="1" value={form.qty} onChange={e => setForm(p => ({ ...p, qty: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" /></div>
                <div><label className="text-xs text-zinc-400 block mb-1">Reference ID</label><input value={form.referenceId} onChange={e => setForm(p => ({ ...p, referenceId: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="TXN-001" /></div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.requiresApproval} onChange={e => setForm(p => ({ ...p, requiresApproval: e.target.checked }))} className="w-4 h-4 accent-yellow-500" /><span className="text-sm text-zinc-300">Requires manager approval</span></label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddEntry(false)} className="flex-1 border border-zinc-700 rounded-lg py-2 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50">{submitting ? 'Adding…' : 'Add Entry'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
