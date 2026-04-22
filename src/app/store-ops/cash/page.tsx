'use client'
import { useEffect, useState } from 'react'
import { Banknote, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CashDeclaration {
  id: string; storeName?: string; registerId?: string; type: string; declaredBy?: string
  totalDeclared: number; expectedTotal: number; variance: number; createdAt: string
}

const DENOMINATIONS = [
  { key: 'pennies', label: 'Pennies', value: 0.01 }, { key: 'nickels', label: 'Nickels', value: 0.05 },
  { key: 'dimes', label: 'Dimes', value: 0.10 }, { key: 'quarters', label: 'Quarters', value: 0.25 },
  { key: 'halfDollars', label: 'Half Dollars', value: 0.50 }, { key: 'ones', label: '$1 Bills', value: 1 },
  { key: 'fives', label: '$5 Bills', value: 5 }, { key: 'tens', label: '$10 Bills', value: 10 },
  { key: 'twenties', label: '$20 Bills', value: 20 }, { key: 'fifties', label: '$50 Bills', value: 50 },
  { key: 'hundreds', label: '$100 Bills', value: 100 },
]
const TYPE_BADGE: Record<string, string> = { open: 'bg-emerald-500/20 text-emerald-400', close: 'bg-blue-500/20 text-blue-400', 'float-adjustment': 'bg-yellow-500/20 text-yellow-400', blind: 'bg-purple-500/20 text-purple-400' }

type DenomKey = 'pennies' | 'nickels' | 'dimes' | 'quarters' | 'halfDollars' | 'ones' | 'fives' | 'tens' | 'twenties' | 'fifties' | 'hundreds'
type FormState = Record<DenomKey, string> & { storeName: string; registerId: string; declaredBy: string; type: string; expectedTotal: string; notes: string }
function emptyForm(): FormState { return { storeName: '', registerId: '', declaredBy: '', type: 'open', expectedTotal: '', notes: '', pennies: '', nickels: '', dimes: '', quarters: '', halfDollars: '', ones: '', fives: '', tens: '', twenties: '', fifties: '', hundreds: '' } }
function computeTotal(form: FormState) { return DENOMINATIONS.reduce((sum, d) => sum + (parseInt(form[d.key as DenomKey] || '0') || 0) * d.value, 0) }

export default function CashManagementPage() {
  const [declarations, setDeclarations] = useState<CashDeclaration[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const liveTotal = computeTotal(form)

  async function load() { setLoading(true); const data = await fetch('/api/store-ops/cash-declarations').then(r => r.json()); setDeclarations(Array.isArray(data) ? data : []); setLoading(false) }
  useEffect(() => { load() }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true)
    const body: Record<string, unknown> = { ...form, expectedTotal: parseFloat(form.expectedTotal) || 0 }
    DENOMINATIONS.forEach(d => { body[d.key] = parseInt(form[d.key as DenomKey] || '0') || 0 })
    await fetch('/api/store-ops/cash-declarations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setShowForm(false); setForm(emptyForm()); setSubmitting(false); load()
  }

  const cashIn = declarations.filter(d => d.type === 'open').reduce((s, d) => s + d.totalDeclared, 0)
  const cashOut = declarations.filter(d => d.type === 'close').reduce((s, d) => s + d.totalDeclared, 0)
  const netCash = cashIn - cashOut
  function varianceColor(v: number) { const abs = Math.abs(v); return abs <= 5 ? 'text-emerald-400' : abs <= 20 ? 'text-yellow-400' : 'text-red-400' }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2"><Banknote className="w-6 h-6 text-emerald-400" /> Cash Management</h1><p className="text-zinc-500 text-sm mt-1">Count drawers, declare float, track cash positions</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium"><Plus className="w-4 h-4" /> New Declaration</button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[{ label: 'Cash In (Opens)', value: cashIn, color: 'text-emerald-400' }, { label: 'Cash Out (Closes)', value: cashOut, color: 'text-red-400' }, { label: 'Net Cash Position', value: netCash, color: netCash >= 0 ? 'text-blue-400' : 'text-red-400' }].map(({ label, value, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"><div className="text-zinc-500 text-sm mb-2">{label}</div><div className={cn('text-3xl font-bold font-mono', color)}>${value.toFixed(2)}</div></div>
        ))}
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-800">{['Date', 'Store', 'Register', 'Type', 'Declared Total', 'Expected', 'Variance', 'By'].map(h => <th key={h} className="text-left px-4 py-3 text-zinc-500 font-medium text-xs uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-zinc-800">
            {loading && <tr><td colSpan={8} className="text-center py-8 text-zinc-500">Loading…</td></tr>}
            {!loading && declarations.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-zinc-500">No declarations</td></tr>}
            {declarations.map(d => (
              <tr key={d.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-4 py-3 text-zinc-400 text-xs">{new Date(d.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-zinc-200">{d.storeName || '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{d.registerId || '—'}</td>
                <td className="px-4 py-3"><span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', TYPE_BADGE[d.type] ?? 'bg-zinc-700 text-zinc-400')}>{d.type}</span></td>
                <td className="px-4 py-3 font-mono text-zinc-200">${d.totalDeclared.toFixed(2)}</td>
                <td className="px-4 py-3 font-mono text-zinc-400">${d.expectedTotal.toFixed(2)}</td>
                <td className="px-4 py-3"><span className={cn('font-mono font-semibold', varianceColor(d.variance))}>{d.variance >= 0 ? '+' : ''}{d.variance.toFixed(2)}</span></td>
                <td className="px-4 py-3 text-zinc-400">{d.declaredBy || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div><h2 className="text-lg font-semibold text-zinc-100">New Cash Declaration</h2><p className="text-xs text-zinc-500 mt-0.5">Live total: <span className="text-emerald-400 font-mono font-bold">${liveTotal.toFixed(2)}</span></p></div>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={create} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-zinc-400 block mb-1">Store</label><input value={form.storeName} onChange={e => setForm(p => ({ ...p, storeName: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="Store name" /></div>
                <div><label className="text-xs text-zinc-400 block mb-1">Register</label><input value={form.registerId} onChange={e => setForm(p => ({ ...p, registerId: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="REG-01" /></div>
                <div><label className="text-xs text-zinc-400 block mb-1">Declared By</label><input value={form.declaredBy} onChange={e => setForm(p => ({ ...p, declaredBy: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="Staff name" /></div>
                <div><label className="text-xs text-zinc-400 block mb-1">Type</label><select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500"><option value="open">Open</option><option value="close">Close</option><option value="float-adjustment">Float Adjustment</option><option value="blind">Blind</option></select></div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-2">Denomination Count</label>
                <div className="grid grid-cols-2 gap-2">
                  {DENOMINATIONS.map(d => (
                    <div key={d.key} className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">
                      <span className="text-xs text-zinc-400 w-24 shrink-0">{d.label}</span>
                      <input type="number" min="0" value={form[d.key as DenomKey]} onChange={e => setForm(p => ({ ...p, [d.key]: e.target.value }))} className="flex-1 bg-transparent text-sm text-zinc-200 focus:outline-none text-right w-16" placeholder="0" />
                      <span className="text-xs text-zinc-600 w-16 text-right font-mono">${((parseInt(form[d.key as DenomKey] || '0') || 0) * d.value).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div><label className="text-xs text-zinc-400 block mb-1">Expected Total ($)</label><input type="number" step="0.01" value={form.expectedTotal} onChange={e => setForm(p => ({ ...p, expectedTotal: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="0.00" /></div>
              <div><label className="text-xs text-zinc-400 block mb-1">Notes</label><textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 resize-none" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-zinc-700 rounded-lg py-2 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50">{submitting ? 'Saving…' : `Submit Declaration ($${liveTotal.toFixed(2)})`}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
