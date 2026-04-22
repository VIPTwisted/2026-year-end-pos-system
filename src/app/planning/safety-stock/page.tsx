'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Check, X, Shield, AlertTriangle, CheckCircle, Upload, FileText } from 'lucide-react'

interface SafetyStockRule {
  id: string
  productName: string | null
  sku: string | null
  storeName: string | null
  minQty: number
  maxQty: number
  reorderPoint: number
  reorderQty: number
  leadTimeDays: number
  isActive: boolean
}

type Method = 'fixed' | 'dynamic' | 'time-phased'

interface RuleWithMethod extends SafetyStockRule {
  method: Method
}

const INIT: Omit<RuleWithMethod, 'id'> = {
  productName: '', sku: '', storeName: '', minQty: 0, maxQty: 0,
  reorderPoint: 0, reorderQty: 0, leadTimeDays: 7, isActive: true, method: 'fixed',
}

const CSV_TEMPLATE = `productName,sku,storeName,minQty,maxQty,reorderPoint,reorderQty,leadTimeDays
Widget Alpha,SKU-1001,Warehouse A,50,500,100,200,7
Component Beta,SKU-1002,Warehouse B,25,250,75,100,14
Part Gamma,SKU-1003,,10,100,30,50,5`

function deriveMethod(rule: SafetyStockRule): Method {
  if (rule.leadTimeDays > 14) return 'time-phased'
  if (rule.minQty !== rule.reorderPoint) return 'dynamic'
  return 'fixed'
}

function getStatus(rule: SafetyStockRule): { label: string; cls: string } {
  if (rule.minQty > rule.reorderPoint) return { label: 'CRITICAL', cls: 'bg-red-500/20 text-red-400' }
  if (rule.reorderPoint <= rule.minQty * 1.2) return { label: 'LOW', cls: 'bg-yellow-500/20 text-yellow-400' }
  return { label: 'OK', cls: 'bg-emerald-500/20 text-emerald-400' }
}

const METHOD_BADGE: Record<Method, string> = {
  fixed:       'bg-zinc-700/60 text-zinc-400',
  dynamic:     'bg-blue-500/20 text-blue-400',
  'time-phased': 'bg-purple-500/20 text-purple-400',
}

export default function SafetyStockPage() {
  const [rules, setRules] = useState<RuleWithMethod[]>([])
  const [form, setForm] = useState({ ...INIT })
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Omit<RuleWithMethod, 'id'>>({ ...INIT })
  const [showCsvModal, setShowCsvModal] = useState(false)
  const [csvText, setCsvText] = useState(CSV_TEMPLATE)
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState('')

  useEffect(() => { fetchRules() }, [])

  async function fetchRules() {
    const data = await fetch('/api/planning/safety-stock').then(r => r.json()).catch(() => [])
    const arr: SafetyStockRule[] = Array.isArray(data) ? data : []
    setRules(arr.map(r => ({ ...r, method: deriveMethod(r) })))
  }

  async function create() {
    await fetch('/api/planning/safety-stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ ...INIT })
    setShowForm(false)
    fetchRules()
  }

  async function update(id: string) {
    await fetch(`/api/planning/safety-stock/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setEditingId(null)
    fetchRules()
  }

  async function remove(id: string) {
    if (!confirm('Delete this safety stock rule?')) return
    await fetch(`/api/planning/safety-stock/${id}`, { method: 'DELETE' })
    fetchRules()
  }

  async function toggleActive(rule: RuleWithMethod) {
    await fetch(`/api/planning/safety-stock/${rule.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !rule.isActive }),
    })
    fetchRules()
  }

  async function importCsv() {
    setImporting(true)
    setImportMsg('')
    try {
      const lines = csvText.trim().split('\n').slice(1) // skip header
      const rows = lines.map(l => {
        const [productName, sku, storeName, minQty, maxQty, reorderPoint, reorderQty, leadTimeDays] = l.split(',').map(s => s.trim())
        return { productName, sku, storeName, minQty: Number(minQty), maxQty: Number(maxQty), reorderPoint: Number(reorderPoint), reorderQty: Number(reorderQty), leadTimeDays: Number(leadTimeDays) }
      }).filter(r => r.productName)
      const res = await fetch('/api/planning/safety-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows),
      })
      const data = await res.json()
      setImportMsg(`Imported ${data.count ?? rows.length} rules successfully.`)
      fetchRules()
    } catch (e) {
      setImportMsg(`Import failed: ${String(e)}`)
    }
    setImporting(false)
  }

  function startEdit(r: RuleWithMethod) {
    setEditingId(r.id)
    setEditForm({ ...r })
  }

  const activeCount   = rules.filter(r => r.isActive).length
  const criticalCount = rules.filter(r => getStatus(r).label === 'CRITICAL').length
  const timePhasedCount = rules.filter(r => r.method === 'time-phased').length

  const InlineInput = ({ field, type = 'text' }: { field: keyof Omit<RuleWithMethod, 'id'>; type?: string }) => (
    <input
      type={type}
      value={typeof editForm[field] === 'boolean' ? String(editForm[field]) : (editForm[field] ?? '') as string | number}
      onChange={e => setEditForm(prev => ({ ...prev, [field]: type === 'number' ? Number(e.target.value) : e.target.value }))}
      className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
    />
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Safety Stock Rules</h1>
          <p className="text-zinc-400 text-sm mt-1">Fixed, dynamic, and time-phased replenishment thresholds per item</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowCsvModal(true)}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Upload className="w-4 h-4" />Bulk Import
          </button>
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />Add Rule
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Rules Active',     value: `${activeCount} / ${rules.length}`, icon: Shield,        color: 'text-blue-400' },
          { label: 'Below Minimum',    value: criticalCount,                       icon: AlertTriangle, color: 'text-red-400' },
          { label: 'Time-Phased Rules', value: timePhasedCount,                   icon: CheckCircle,   color: 'text-purple-400' },
        ].map(k => (
          <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">{k.label}</span>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <div className="text-2xl font-bold text-zinc-100">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-100">New Safety Stock Rule</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {([
              { label: 'Product Name',   field: 'productName',  type: 'text',   placeholder: 'Widget Alpha' },
              { label: 'SKU',            field: 'sku',           type: 'text',   placeholder: 'SKU-1001' },
              { label: 'Store / Site',   field: 'storeName',    type: 'text',   placeholder: 'Warehouse A' },
              { label: 'Min Qty',        field: 'minQty',       type: 'number', placeholder: '50' },
              { label: 'Max Qty',        field: 'maxQty',       type: 'number', placeholder: '500' },
              { label: 'Reorder Point',  field: 'reorderPoint', type: 'number', placeholder: '100' },
              { label: 'Reorder Qty',    field: 'reorderQty',   type: 'number', placeholder: '200' },
              { label: 'Lead Time (d)',  field: 'leadTimeDays', type: 'number', placeholder: '7' },
            ] as { label: string; field: keyof typeof form; type: string; placeholder: string }[]).map(f => (
              <div key={f.field}>
                <label className="block text-xs text-zinc-400 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.field] as string | number}
                  onChange={e => setForm(prev => ({ ...prev, [f.field]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Method</label>
              <select value={form.method} onChange={e => setForm(prev => ({ ...prev, method: e.target.value as Method }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                <option value="fixed">Fixed</option>
                <option value="dynamic">Dynamic</option>
                <option value="time-phased">Time-Phased</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={create} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Add Rule</button>
            <button onClick={() => { setShowForm(false); setForm({ ...INIT }) }} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Product', 'SKU', 'Store', 'Method', 'Min', 'Max', 'Reorder Pt.', 'Reorder Qty', 'Lead', 'Status', 'Active', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rules.length === 0 && (
                <tr><td colSpan={12} className="px-4 py-10 text-center text-zinc-600 text-sm">No safety stock rules yet.</td></tr>
              )}
              {rules.map(r => {
                const st = getStatus(r)
                const isEditing = editingId === r.id
                return isEditing ? (
                  <tr key={r.id} className="border-b border-zinc-800 bg-zinc-800/40">
                    <td className="px-3 py-2"><InlineInput field="productName" /></td>
                    <td className="px-3 py-2"><InlineInput field="sku" /></td>
                    <td className="px-3 py-2"><InlineInput field="storeName" /></td>
                    <td className="px-3 py-2">
                      <select value={editForm.method} onChange={e => setEditForm(prev => ({ ...prev, method: e.target.value as Method }))}
                        className="bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none">
                        <option value="fixed">Fixed</option>
                        <option value="dynamic">Dynamic</option>
                        <option value="time-phased">Time-Phased</option>
                      </select>
                    </td>
                    <td className="px-3 py-2"><InlineInput field="minQty" type="number" /></td>
                    <td className="px-3 py-2"><InlineInput field="maxQty" type="number" /></td>
                    <td className="px-3 py-2"><InlineInput field="reorderPoint" type="number" /></td>
                    <td className="px-3 py-2"><InlineInput field="reorderQty" type="number" /></td>
                    <td className="px-3 py-2"><InlineInput field="leadTimeDays" type="number" /></td>
                    <td colSpan={2} />
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button onClick={() => update(r.id)} className="text-emerald-400 hover:text-emerald-300"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingId(null)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 cursor-pointer" onClick={() => startEdit(r)}>
                    <td className="px-4 py-3 text-zinc-100 font-medium">{r.productName ?? <span className="text-zinc-600">—</span>}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs font-mono">{r.sku ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{r.storeName ?? <span className="text-zinc-600">All</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${METHOD_BADGE[r.method]}`}>{r.method}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300 font-mono">{r.minQty.toLocaleString()}</td>
                    <td className="px-4 py-3 text-zinc-300 font-mono">{r.maxQty.toLocaleString()}</td>
                    <td className="px-4 py-3 text-yellow-400 font-mono font-medium">{r.reorderPoint.toLocaleString()}</td>
                    <td className="px-4 py-3 text-zinc-300 font-mono">{r.reorderQty.toLocaleString()}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{r.leadTimeDays}d</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium w-fit ${st.cls}`}>
                        {st.label === 'OK' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleActive(r)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${r.isActive ? 'bg-blue-600' : 'bg-zinc-700'}`}>
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${r.isActive ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <button onClick={() => remove(r.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk CSV modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#16213e] border border-zinc-700 rounded-2xl p-6 w-full max-w-2xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold text-zinc-100">Bulk Import Safety Stock Rules</h2>
              </div>
              <button onClick={() => { setShowCsvModal(false); setImportMsg('') }} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-zinc-500 space-y-1">
              <p>Paste CSV data below. First row must be the header:</p>
              <p className="font-mono text-zinc-400 bg-zinc-800/60 px-3 py-2 rounded-lg">
                productName, sku, storeName, minQty, maxQty, reorderPoint, reorderQty, leadTimeDays
              </p>
            </div>

            <textarea
              rows={10}
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-blue-500 resize-none"
              spellCheck={false}
            />

            {importMsg && (
              <div className={`text-sm px-3 py-2 rounded-lg ${importMsg.startsWith('Import failed') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {importMsg}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={importCsv} disabled={importing}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Upload className="w-4 h-4" />{importing ? 'Importing…' : 'Import'}
              </button>
              <button onClick={() => { setShowCsvModal(false); setImportMsg('') }} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
