'use client'
import { useEffect, useState, useCallback } from 'react'
import { PiggyBank, Plus, Edit2, Check, X } from 'lucide-react'

const API = '/api/hr/workforce/leave-balances'

interface LeaveBalance {
  id: string; employeeName: string; year: number; vacationTotal: number; vacationUsed: number; sickTotal: number; sickUsed: number; personalTotal: number; personalUsed: number
}

function ProgressBar({ used, total, color }: { used: number; total: number; color: string }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-zinc-500 mb-0.5"><span>{used} used</span><span>{total} total</span></div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

export default function LeaveBalancesPage() {
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(2026)
  const [showNew, setShowNew] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [newForm, setNewForm] = useState({ employeeName: '', vacationTotal: '10', vacationUsed: '0', sickTotal: '5', sickUsed: '0', personalTotal: '3', personalUsed: '0' })
  const [editForm, setEditForm] = useState<Partial<LeaveBalance>>({})

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`${API}?year=${year}`)
    const data = await res.json()
    setBalances(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [year])

  useEffect(() => { load() }, [load])

  async function create(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newForm, year, vacationTotal: parseFloat(newForm.vacationTotal), vacationUsed: parseFloat(newForm.vacationUsed), sickTotal: parseFloat(newForm.sickTotal), sickUsed: parseFloat(newForm.sickUsed), personalTotal: parseFloat(newForm.personalTotal), personalUsed: parseFloat(newForm.personalUsed) }) })
    setSaving(false); setShowNew(false); setNewForm({ employeeName: '', vacationTotal: '10', vacationUsed: '0', sickTotal: '5', sickUsed: '0', personalTotal: '3', personalUsed: '0' }); load()
  }

  async function saveEdit(id: string) {
    setSaving(true)
    await fetch(`${API}/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) })
    setSaving(false); setEditId(null); setEditForm({}); load()
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2"><PiggyBank className="w-6 h-6 text-orange-400" />Leave Balances</h1>
          <p className="text-zinc-500 mt-1">Annual leave entitlement tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none" value={year} onChange={e => setYear(parseInt(e.target.value))}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Plus className="w-4 h-4" /> Add Employee</button>
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-zinc-100 mb-4">Add Leave Balance</h2>
            <form onSubmit={create} className="space-y-3">
              <div><label className="block text-xs text-zinc-500 mb-1">Employee Name</label><input required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="Jane Smith" value={newForm.employeeName} onChange={e => setNewForm(f => ({ ...f, employeeName: e.target.value }))} /></div>
              {[{ label: 'Vacation', tk: 'vacationTotal', uk: 'vacationUsed' }, { label: 'Sick', tk: 'sickTotal', uk: 'sickUsed' }, { label: 'Personal', tk: 'personalTotal', uk: 'personalUsed' }].map(({ label, tk, uk }) => (
                <div key={label} className="grid grid-cols-2 gap-2">
                  <div><label className="block text-xs text-zinc-500 mb-1">{label} Total</label><input type="number" min="0" step="0.5" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none" value={(newForm as Record<string, string>)[tk]} onChange={e => setNewForm(f => ({ ...f, [tk]: e.target.value }))} /></div>
                  <div><label className="block text-xs text-zinc-500 mb-1">{label} Used</label><input type="number" min="0" step="0.5" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none" value={(newForm as Record<string, string>)[uk]} onChange={e => setNewForm(f => ({ ...f, [uk]: e.target.value }))} /></div>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNew(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-2 text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="text-zinc-500 text-sm">Loading...</div> : balances.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center"><PiggyBank className="w-12 h-12 text-zinc-700 mx-auto mb-3" /><p className="text-zinc-500">No balances for {year}.</p></div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-zinc-800">{['Employee', 'Vacation', 'Sick', 'Personal', 'Actions'].map(h => <th key={h} className={`text-xs text-zinc-500 font-medium px-4 py-3 ${h === 'Actions' ? 'text-center' : 'text-left'} ${['Vacation','Sick','Personal'].includes(h) ? 'min-w-[160px]' : ''}`}>{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-zinc-800/50">
              {balances.map(b => {
                const isEdit = editId === b.id
                return (
                  <tr key={b.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-100">{b.employeeName}</td>
                    {[
                      { tk: 'vacationTotal' as const, uk: 'vacationUsed' as const, color: 'bg-blue-500' },
                      { tk: 'sickTotal' as const, uk: 'sickUsed' as const, color: 'bg-red-500' },
                      { tk: 'personalTotal' as const, uk: 'personalUsed' as const, color: 'bg-purple-500' },
                    ].map(({ tk, uk, color }) => (
                      <td key={tk} className="px-4 py-3">
                        {isEdit ? (
                          <div className="flex gap-1 items-center">
                            <input type="number" min="0" step="0.5" className="w-14 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200" value={editForm[uk] ?? b[uk]} onChange={e => setEditForm(f => ({ ...f, [uk]: parseFloat(e.target.value) }))} />
                            <span className="text-zinc-600">/</span>
                            <input type="number" min="0" step="0.5" className="w-14 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200" value={editForm[tk] ?? b[tk]} onChange={e => setEditForm(f => ({ ...f, [tk]: parseFloat(e.target.value) }))} />
                          </div>
                        ) : <ProgressBar used={b[uk]} total={b[tk]} color={color} />}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      {isEdit ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => saveEdit(b.id)} disabled={saving} className="flex items-center gap-1 text-xs bg-green-600/20 hover:bg-green-600/30 text-green-400 px-2 py-1 rounded transition-colors disabled:opacity-50"><Check className="w-3 h-3" /> Save</button>
                          <button onClick={() => { setEditId(null); setEditForm({}) }} className="flex items-center gap-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-2 py-1 rounded transition-colors"><X className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditId(b.id); setEditForm({ ...b }) }} className="flex items-center gap-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded transition-colors mx-auto"><Edit2 className="w-3 h-3" /> Edit</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
