'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Moon, Plus, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DayEndProcedure {
  id: string; storeName?: string; businessDate: string; status: string; steps: string
  cashExpected: number; cashVariance: number; closedBy?: string; createdAt: string
}
const STATUS_BADGE: Record<string, string> = { open: 'bg-zinc-700 text-zinc-300', 'in-progress': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40', closing: 'bg-orange-500/20 text-orange-400 border border-orange-500/40', closed: 'bg-blue-500/20 text-blue-400 border border-blue-500/40', reconciled: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' }
function stepsCompleted(stepsJson: string) { try { return (JSON.parse(stepsJson) as Array<{ status: string }>).filter(s => s.status === 'completed').length } catch { return 0 } }

export default function DayEndPage() {
  const [procedures, setProcedures] = useState<DayEndProcedure[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ storeName: '', businessDate: new Date().toISOString().split('T')[0], cashExpected: '', cardTotal: '', totalSales: '' })

  async function load() {
    setLoading(true)
    const params = new URLSearchParams(); if (filterStatus) params.set('status', filterStatus)
    const data = await fetch(`/api/store-ops/day-end?${params}`).then(r => r.json())
    setProcedures(Array.isArray(data) ? data : []); setLoading(false)
  }
  useEffect(() => { load() }, [filterStatus])

  async function create(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true)
    await fetch('/api/store-ops/day-end', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, cashExpected: parseFloat(form.cashExpected) || 0, cardTotal: parseFloat(form.cardTotal) || 0, totalSales: parseFloat(form.totalSales) || 0 }) })
    setShowForm(false); setForm({ storeName: '', businessDate: new Date().toISOString().split('T')[0], cashExpected: '', cardTotal: '', totalSales: '' }); setSubmitting(false); load()
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2"><Moon className="w-6 h-6 text-blue-400" /> Day-End Procedures</h1><p className="text-zinc-500 text-sm mt-1">Close and reconcile daily store operations</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium"><Plus className="w-4 h-4" /> Start Day-End</button>
      </div>
      <div className="flex gap-3 mb-6">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500">
          <option value="">All Statuses</option>{['open', 'in-progress', 'closing', 'closed', 'reconciled'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {filterStatus && <button onClick={() => setFilterStatus('')} className="text-xs text-zinc-400 hover:text-zinc-100 border border-zinc-700 rounded-lg px-3 py-2">Clear</button>}
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-800">{['Store', 'Business Date', 'Status', 'Steps Complete', 'Cash Variance', 'Closed By', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-zinc-500 font-medium text-xs uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-zinc-800">
            {loading && <tr><td colSpan={7} className="text-center py-8 text-zinc-500">Loading…</td></tr>}
            {!loading && procedures.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-zinc-500">No day-end procedures</td></tr>}
            {procedures.map(p => {
              const done = stepsCompleted(p.steps)
              return (
                <tr key={p.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3 text-zinc-200">{p.storeName || '—'}</td>
                  <td className="px-4 py-3 text-zinc-400">{new Date(p.businessDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_BADGE[p.status] ?? 'bg-zinc-700 text-zinc-300')}>{p.status}</span></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-20 bg-zinc-800 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(done / 8) * 100}%` }} /></div><span className="text-zinc-400 text-xs">{done}/8</span></div></td>
                  <td className="px-4 py-3"><span className={cn('font-mono text-sm', p.cashVariance < -20 ? 'text-red-400' : p.cashVariance < 0 ? 'text-yellow-400' : p.cashVariance > 0 ? 'text-emerald-400' : 'text-zinc-400')}>{p.cashVariance >= 0 ? '+' : ''}{p.cashVariance.toFixed(2)}</span></td>
                  <td className="px-4 py-3 text-zinc-400">{p.closedBy || '—'}</td>
                  <td className="px-4 py-3"><Link href={`/store-ops/day-end/${p.id}`} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">{p.status === 'open' ? 'Open' : p.status === 'in-progress' || p.status === 'closing' ? 'Continue' : 'View'}<ChevronRight className="w-3 h-3" /></Link></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-zinc-100">Start Day-End Procedure</h2><button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button></div>
            <form onSubmit={create} className="space-y-4">
              <div><label className="text-xs text-zinc-400 block mb-1">Store Name</label><input required value={form.storeName} onChange={e => setForm(p => ({ ...p, storeName: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" /></div>
              <div><label className="text-xs text-zinc-400 block mb-1">Business Date</label><input required type="date" value={form.businessDate} onChange={e => setForm(p => ({ ...p, businessDate: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs text-zinc-400 block mb-1">Expected Cash</label><input type="number" step="0.01" value={form.cashExpected} onChange={e => setForm(p => ({ ...p, cashExpected: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="0.00" /></div>
                <div><label className="text-xs text-zinc-400 block mb-1">Card Total</label><input type="number" step="0.01" value={form.cardTotal} onChange={e => setForm(p => ({ ...p, cardTotal: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="0.00" /></div>
                <div><label className="text-xs text-zinc-400 block mb-1">Total Sales</label><input type="number" step="0.01" value={form.totalSales} onChange={e => setForm(p => ({ ...p, totalSales: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="0.00" /></div>
              </div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-zinc-700 rounded-lg py-2 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button><button type="submit" disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50">{submitting ? 'Starting…' : 'Start Procedure'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
