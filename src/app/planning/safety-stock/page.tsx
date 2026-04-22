'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, Shield, AlertTriangle, CheckCircle } from 'lucide-react'

interface SafetyStockRule {
  id: string; productName: string | null; locationName: string | null
  calculationMethod: string; fixedQty: number; daysOfSupply: number
  serviceLevel: number; currentStock: number; isActive: boolean
}

const INIT = { productName: '', locationName: '', calculationMethod: 'fixed', fixedQty: 0, daysOfSupply: 7, serviceLevel: 0.95, currentStock: 0, isActive: true }

function getStatus(rule: SafetyStockRule): { label: string; cls: string; icon: typeof Shield } {
  if (rule.currentStock < rule.fixedQty) return { label: 'CRITICAL', cls: 'text-red-400 bg-red-500/20', icon: AlertTriangle }
  if (rule.currentStock < rule.fixedQty * 1.5) return { label: 'LOW', cls: 'text-yellow-400 bg-yellow-500/20', icon: AlertTriangle }
  return { label: 'OK', cls: 'text-emerald-400 bg-emerald-500/20', icon: CheckCircle }
}

export default function SafetyStockPage() {
  const [rules, setRules] = useState<SafetyStockRule[]>([])
  const [form, setForm] = useState(INIT)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(INIT)

  useEffect(() => { fetchRules() }, [])

  async function fetchRules() {
    const data = await fetch('/api/planning/safety-stock').then(r => r.json())
    setRules(Array.isArray(data) ? data : [])
  }

  async function create() {
    await fetch('/api/planning/safety-stock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setForm(INIT); setShowForm(false); fetchRules()
  }

  async function update(id: string) {
    await fetch(`/api/planning/safety-stock/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) })
    setEditingId(null); fetchRules()
  }

  async function toggleActive(rule: SafetyStockRule) {
    await fetch(`/api/planning/safety-stock/${rule.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !rule.isActive }) })
    fetchRules()
  }

  async function remove(id: string) {
    if (!confirm('Delete this safety stock rule?')) return
    await fetch(`/api/planning/safety-stock/${id}`, { method: 'DELETE' })
    fetchRules()
  }

  function startEdit(r: SafetyStockRule) {
    setEditingId(r.id)
    setEditForm({ productName: r.productName ?? '', locationName: r.locationName ?? '', calculationMethod: r.calculationMethod, fixedQty: r.fixedQty, daysOfSupply: r.daysOfSupply, serviceLevel: r.serviceLevel, currentStock: r.currentStock, isActive: r.isActive })
  }

  const activeCount = rules.filter(r => r.isActive).length
  const criticalCount = rules.filter(r => getStatus(r).label === 'CRITICAL').length
  const avgDays = rules.length > 0 ? Math.round(rules.reduce((s, r) => s + r.daysOfSupply, 0) / rules.length) : 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Safety Stock Rules</h1>
          <p className="text-zinc-400 text-sm mt-1">Monitor and configure safety stock levels per product / location</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />Add Rule
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Rules Active', value: `${activeCount} / ${rules.length}`, icon: Shield, color: 'text-blue-400' },
          { label: 'Below Minimum', value: criticalCount, icon: AlertTriangle, color: 'text-red-400' },
          { label: 'Avg Days of Supply', value: `${avgDays}d`, icon: CheckCircle, color: 'text-emerald-400' },
        ].map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-xs text-zinc-500">{k.label}</span><k.icon className={`w-4 h-4 ${k.color}`} /></div>
            <div className="text-2xl font-bold text-zinc-100">{k.value}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-100">Add Safety Stock Rule</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Product Name', key: 'productName', placeholder: 'Widget Alpha' },
              { label: 'Location', key: 'locationName', placeholder: 'Warehouse A' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-zinc-400 mb-1">{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Method</label>
              <select value={form.calculationMethod} onChange={e => setForm({ ...form, calculationMethod: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                <option value="fixed">Fixed</option><option value="days-of-supply">Days of Supply</option><option value="service-level">Service Level</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Fixed Qty</label>
              <input type="number" value={form.fixedQty} onChange={e => setForm({ ...form, fixedQty: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Current Stock</label>
              <input type="number" value={form.currentStock} onChange={e => setForm({ ...form, currentStock: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={create} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Add Rule</button>
            <button onClick={() => { setShowForm(false); setForm(INIT) }} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-800">
            {['Product', 'Location', 'Method', 'Qty/Days', 'Svc Lvl', 'Current Stock', 'Status', 'Active', 'Actions'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {rules.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-zinc-600">No safety stock rules yet.</td></tr>}
            {rules.map(r => {
              const st = getStatus(r)
              return editingId === r.id ? (
                <tr key={r.id} className="border-b border-zinc-800 bg-zinc-800/40">
                  <td className="px-3 py-2"><input value={editForm.productName} onChange={e => setEditForm({ ...editForm, productName: e.target.value })}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none" /></td>
                  <td className="px-3 py-2"><input value={editForm.locationName} onChange={e => setEditForm({ ...editForm, locationName: e.target.value })}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none" /></td>
                  <td className="px-3 py-2 text-zinc-400 text-xs capitalize">{editForm.calculationMethod}</td>
                  <td className="px-3 py-2"><input type="number" value={editForm.fixedQty} onChange={e => setEditForm({ ...editForm, fixedQty: Number(e.target.value) })}
                    className="w-16 bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none" /></td>
                  <td className="px-3 py-2 text-zinc-400 text-xs">{(editForm.serviceLevel * 100).toFixed(0)}%</td>
                  <td className="px-3 py-2"><input type="number" value={editForm.currentStock} onChange={e => setEditForm({ ...editForm, currentStock: Number(e.target.value) })}
                    className="w-20 bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none" /></td>
                  <td colSpan={2} />
                  <td className="px-3 py-2"><div className="flex gap-2">
                    <button onClick={() => update(r.id)} className="text-emerald-400 hover:text-emerald-300"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingId(null)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              ) : (
                <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="px-4 py-3 text-zinc-100 font-medium">{r.productName ?? <span className="text-zinc-600">—</span>}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{r.locationName ?? <span className="text-zinc-600">All</span>}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs capitalize">{r.calculationMethod.replace('-', ' ')}</td>
                  <td className="px-4 py-3 text-zinc-300 text-xs">{r.fixedQty} / {r.daysOfSupply}d</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{(r.serviceLevel * 100).toFixed(0)}%</td>
                  <td className="px-4 py-3 text-zinc-300">{r.currentStock.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${st.cls}`}><st.icon className="w-3 h-3" />{st.label}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(r)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${r.isActive ? 'bg-blue-600' : 'bg-zinc-700'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${r.isActive ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3"><div className="flex gap-2">
                    <button onClick={() => startEdit(r)} className="text-zinc-400 hover:text-zinc-200 transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(r.id)} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
