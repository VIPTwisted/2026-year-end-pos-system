'use client'
import { useState, useEffect } from 'react'
import { RefreshCw, Plus, X, Trash2, PlayCircle } from 'lucide-react'

type Rule = {
  id: string
  productName: string | null
  locationName: string | null
  minQty: number
  maxQty: number
  reorderPoint: number
  reorderQty: number
  sourceType: string
  isActive: boolean
  lastTriggered: string | null
}

type TriggeredRule = {
  rule: Rule
  currentQty: number
  suggestedQty: number
}

type RunResult = {
  triggered: TriggeredRule[]
  total: number
  triggeredCount: number
}

export default function ReplenishmentPage() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showRunModal, setShowRunModal] = useState(false)
  const [runResult, setRunResult] = useState<RunResult | null>(null)
  const [runLoading, setRunLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ productName: '', locationName: '', minQty: 5, maxQty: 50, reorderPoint: 10, reorderQty: 20, sourceType: 'warehouse' })

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/inventory/replenishment')
    const data = await res.json()
    setRules(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleActive = async (rule: Rule) => {
    await fetch(`/api/inventory/replenishment/${rule.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !rule.isActive }),
    })
    load()
  }

  const deleteRule = async (id: string) => {
    await fetch(`/api/inventory/replenishment/${id}`, { method: 'DELETE' })
    load()
  }

  const submit = async () => {
    setSubmitting(true)
    await fetch('/api/inventory/replenishment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setShowAddModal(false)
    setForm({ productName: '', locationName: '', minQty: 5, maxQty: 50, reorderPoint: 10, reorderQty: 20, sourceType: 'warehouse' })
    setSubmitting(false)
    load()
  }

  const runCheck = async () => {
    setRunLoading(true)
    const res = await fetch('/api/inventory/replenishment/run', { method: 'POST' })
    const data = await res.json()
    setRunResult(data)
    setRunLoading(false)
    setShowRunModal(true)
    load()
  }

  const activeCount = rules.filter(r => r.isActive).length
  const triggeredToday = rules.filter(r => r.lastTriggered && new Date(r.lastTriggered).toDateString() === new Date().toDateString()).length
  const avgReorder = rules.length > 0 ? Math.round(rules.reduce((s, r) => s + r.reorderQty, 0) / rules.length) : 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 text-orange-400" />
          <h1 className="text-2xl font-bold text-zinc-100">Replenishment Rules</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={runCheck} disabled={runLoading}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            <PlayCircle className="w-4 h-4" /> {runLoading ? 'Running...' : 'Run Replenishment Check'}
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Rule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Rules', value: activeCount, color: 'text-green-400' },
          { label: 'Triggered Today', value: triggeredToday, color: 'text-orange-400' },
          { label: 'Avg Reorder Qty', value: avgReorder, color: 'text-blue-400' },
        ].map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-sm text-zinc-400">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Product', 'Location', 'Min Qty', 'Reorder Point', 'Reorder Qty', 'Source', 'Last Triggered', 'Active', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-zinc-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-600">Loading...</td></tr>
            ) : rules.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-600">No rules configured</td></tr>
            ) : rules.map(rule => (
              <tr key={rule.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="px-4 py-3 text-zinc-200">{rule.productName || 'All Products'}</td>
                <td className="px-4 py-3 text-zinc-400">{rule.locationName || 'All Locations'}</td>
                <td className="px-4 py-3 text-zinc-400">{rule.minQty}</td>
                <td className="px-4 py-3 text-zinc-400">{rule.reorderPoint}</td>
                <td className="px-4 py-3 text-zinc-300 font-medium">{rule.reorderQty}</td>
                <td className="px-4 py-3 text-zinc-400 capitalize">{rule.sourceType}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">
                  {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(rule)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${rule.isActive ? 'bg-green-600' : 'bg-zinc-700'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${rule.isActive ? 'translate-x-5' : ''}`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteRule(rule.id)} className="text-red-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-100">Add Replenishment Rule</h2>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Product Name (optional)</label>
                  <input value={form.productName} onChange={e => setForm(p => ({ ...p, productName: e.target.value }))}
                    placeholder="Leave blank for all"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Location Name (optional)</label>
                  <input value={form.locationName} onChange={e => setForm(p => ({ ...p, locationName: e.target.value }))}
                    placeholder="Leave blank for all"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
                {[
                  { label: 'Min Qty', key: 'minQty' },
                  { label: 'Max Qty', key: 'maxQty' },
                  { label: 'Reorder Point', key: 'reorderPoint' },
                  { label: 'Reorder Qty', key: 'reorderQty' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-zinc-400 mb-1">{f.label}</label>
                    <input type="number" value={form[f.key as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Source Type</label>
                  <select value={form.sourceType} onChange={e => setForm(p => ({ ...p, sourceType: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                    <option value="warehouse">Warehouse</option>
                    <option value="supplier">Supplier</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">Cancel</button>
                <button onClick={submit} disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
                  {submitting ? 'Saving...' : 'Add Rule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRunModal && runResult && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-100">Replenishment Run Results</h2>
              <button onClick={() => setShowRunModal(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-800 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-zinc-100">{runResult.total}</div>
                  <div className="text-xs text-zinc-500">Rules Checked</div>
                </div>
                <div className="bg-zinc-800 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-orange-400">{runResult.triggeredCount}</div>
                  <div className="text-xs text-zinc-500">Triggered</div>
                </div>
                <div className="bg-zinc-800 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-green-400">{runResult.total - runResult.triggeredCount}</div>
                  <div className="text-xs text-zinc-500">OK</div>
                </div>
              </div>
              {runResult.triggered.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-2">Triggered Rules</h3>
                  <div className="space-y-2">
                    {runResult.triggered.map((item, i) => (
                      <div key={i} className="bg-zinc-800 border border-orange-500/30 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm text-zinc-200 font-medium">{item.rule.productName || 'All Products'}</div>
                          <div className="text-xs text-zinc-500">{item.rule.locationName || 'All Locations'} · Source: {item.rule.sourceType}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-red-400">Current: {item.currentQty}</div>
                          <div className="text-xs text-green-400">Suggest: +{item.suggestedQty}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {runResult.triggered.length === 0 && (
                <div className="text-center py-4 text-green-400 text-sm">All inventory levels are above reorder points.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
